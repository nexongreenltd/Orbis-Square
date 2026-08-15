# Deploying the backend

The storefront runs on Vercel. This document covers the backend, Postgres,
Redis and file storage, which all run on a single small VPS.

## What this costs

| Piece | Choice | Monthly |
| --- | --- | --- |
| Compute | Hetzner CX22 — 2 vCPU, 4GB RAM, 40GB NVMe | ~€4–6 |
| Postgres | Container on the same host | — |
| Redis | Container on the same host | — |
| File storage | Cloudflare R2, 10GB free tier | — |
| TLS | Caddy + Let's Encrypt | — |

Roughly **$5/month all in**. Verify current prices before you buy; Hetzner
charges a location surcharge outside the EU.

### Why these choices

**4GB, not 2GB.** `medusa build` peaks near 2GB compiling the admin dashboard.
With 4GB you build on the server and deploying is `git pull` plus one compose
command. On 2GB you would need CI plus a container registry to build elsewhere
— the €2 saved costs you a pipeline.

**R2 for uploads.** Medusa writes uploads to local disk unless an S3 provider is
configured. R2 keeps product images off the 40GB disk, survives rebuilds, and
charges nothing for egress, so storefront image traffic is free. It is
S3-compatible, so this is configuration rather than code.

**Singapore.** The hot path is Vercel SSR calling Medusa, several round trips
per render, so colocating the two matters more than the distance from Dhaka.
Pin your Vercel functions to `sin1` to match.

**Fallback.** If Hetzner's signup rejects your card, Vultr or DigitalOcean
Singapore at 2GB (~$10–12) takes these same files — add 2GB of swap so the
build does not get OOM-killed.

The real tradeoff: one host is one failure domain. That is what the nightly
offsite backup is for. Do not skip it.

## First-time setup

### 1. Cloudflare R2

Create two buckets — `orbissquare-media` and `orbissquare-backups` — then an R2
API token with **Object Read & Write** scoped to both. Give the media bucket a
public domain (a custom subdomain such as `media.orbissquare.com` is preferable
to an `r2.dev` URL, because the value is baked into stored image URLs and
changing it later means rewriting them).

### 2. DNS

Point both records at the server's IP before starting the stack — Caddy cannot
issue a certificate until `api.orbissquare.com` resolves.

```
A   api.orbissquare.com   -> <server-ip>
```

### 3. Server

```bash
ssh root@<server-ip>

# Docker
curl -fsSL https://get.docker.com | sh

# Firewall: only HTTP/HTTPS and SSH. Postgres and Redis stay on the internal
# compose network and are never published.
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable

git clone https://github.com/nexongreenltd/Orbis-Square.git /opt/orbissquare
cd /opt/orbissquare/backend

cp .env.production.template .env
openssl rand -base64 32   # once per secret: POSTGRES_PASSWORD, JWT_SECRET, COOKIE_SECRET
nano .env
```

### 4. Launch

```bash
docker compose up -d --build       # first build takes a few minutes
docker compose logs -f backend     # watch migrations run, then startup
```

Migrations run automatically on every container start via the entrypoint, so a
deploy never needs a manual migration step.

### 5. Create the admin user

```bash
docker compose exec backend npx medusa user -e you@orbissquare.com -p '<password>'
```

The admin dashboard is served by the backend at `https://api.orbissquare.com/app`.

### 6. Point the storefront at it

In Vercel's project settings:

```
MEDUSA_BACKEND_URL=https://api.orbissquare.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<from Settings → Publishable API Keys>
```

Set the function region to `sin1` under Settings → Functions so the storefront
sits next to the backend.

### 7. Backups

```bash
apt install -y awscli
aws configure   # use the R2 token; region "auto"

crontab -e
```

```cron
0 3 * * * /opt/orbissquare/backend/scripts/backup-db.sh >> /var/log/medusa-backup.log 2>&1
```

Then actually restore one into a scratch database. An untested backup is not a
backup.

## Deploying a change

```bash
cd /opt/orbissquare && git pull
docker compose -f backend/docker-compose.yml up -d --build
```

## Operations

```bash
docker compose ps                       # health of each service
docker compose logs -f backend          # application logs
docker compose restart backend          # restart just the app
docker stats --no-stream                # memory headroom

# Restore a dump
gunzip -c medusa-<stamp>.sql.gz | docker compose exec -T postgres psql -U medusa medusa
```

### If the build gets OOM-killed

Only a concern on a 2GB host. Add swap:

```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### Uploads failing

Check that `S3_BUCKET` is set — `medusa-config.ts` falls back to local disk
storage when it is empty, which works silently until a rebuild discards the
files. `docker compose exec backend env | grep S3_` to confirm what the
container actually sees.
