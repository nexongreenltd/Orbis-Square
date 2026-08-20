#!/usr/bin/env bash
# Nightly Postgres dump to Cloudflare R2.
#
# One server means one failure domain: a lost disk is a lost store. This pushes
# a compressed dump offsite every night and prunes anything older than
# RETENTION_DAYS. Wire it up with cron on the host:
#
#   0 3 * * * /opt/orbissquare/backend/scripts/backup-db.sh >> /var/log/medusa-backup.log 2>&1
#
# Requires the AWS CLI configured against R2, or AWS_* vars in the environment.

set -euo pipefail

STACK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"

# shellcheck disable=SC1091
set -a; source "${STACK_DIR}/.env"; set +a

: "${BACKUP_BUCKET:?BACKUP_BUCKET is required}"
: "${S3_ENDPOINT:?S3_ENDPOINT is required}"

# Reuse the R2 credentials the app already has rather than depending on a
# separate `aws configure` having been run as the right user. Cron runs with a
# bare environment, and a backup that fails only under cron is the kind you
# discover when you need the restore.
export AWS_ACCESS_KEY_ID="${S3_ACCESS_KEY_ID:?S3_ACCESS_KEY_ID is required}"
export AWS_SECRET_ACCESS_KEY="${S3_SECRET_ACCESS_KEY:?S3_SECRET_ACCESS_KEY is required}"
export AWS_DEFAULT_REGION=auto

ARCHIVE="/tmp/medusa-${STAMP}.sql.gz"

echo "==> Dumping database"
docker compose -f "${STACK_DIR}/docker-compose.yml" exec -T postgres \
	pg_dump -U "${POSTGRES_USER:-medusa}" "${POSTGRES_DB:-medusa}" \
	| gzip -9 >"${ARCHIVE}"

# A dump that silently produced nothing is worse than no backup, because it
# overwrites the assumption that backups work.
SIZE="$(wc -c <"${ARCHIVE}")"
if [ "${SIZE}" -lt 1024 ]; then
	echo "!! Dump is only ${SIZE} bytes — aborting without uploading" >&2
	rm -f "${ARCHIVE}"
	exit 1
fi

echo "==> Uploading to R2 (${SIZE} bytes)"
aws s3 cp "${ARCHIVE}" "s3://${BACKUP_BUCKET}/postgres/" --endpoint-url "${S3_ENDPOINT}"
rm -f "${ARCHIVE}"

echo "==> Pruning backups older than ${RETENTION_DAYS} days"
CUTOFF="$(date -u -d "${RETENTION_DAYS} days ago" +%Y-%m-%d 2>/dev/null \
	|| date -u -v-"${RETENTION_DAYS}"d +%Y-%m-%d)"

aws s3 ls "s3://${BACKUP_BUCKET}/postgres/" --endpoint-url "${S3_ENDPOINT}" \
	| while read -r day _ _ name; do
		if [[ "${day}" < "${CUTOFF}" && -n "${name}" ]]; then
			echo "    removing ${name}"
			aws s3 rm "s3://${BACKUP_BUCKET}/postgres/${name}" --endpoint-url "${S3_ENDPOINT}"
		fi
	done

echo "==> Backup complete"
