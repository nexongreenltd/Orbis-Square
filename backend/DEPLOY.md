# Deploying the backend

The storefront runs on Vercel. This covers the backend, Postgres, Redis and file
storage, which all run on a single small VPS — with a documented path to more
capacity that does not require rebuilding anything.

Everything below was verified by running the full stack under Docker before it
was written; the notes marked **why** are things that actually bit during that
run.

## What this costs

| Piece | Choice | Monthly |
| --- | --- | --- |
| Compute | Hetzner CX22 — 2 vCPU, 4GB RAM, 40GB NVMe | ~€4–6 |
| Postgres | Container on the same host | — |
| Redis | Container on the same host | — |
| File storage | Cloudflare R2, 10GB free tier | — |
| TLS | Caddy + Let's Encrypt | — |

Roughly **$5/month all in**. Confirm current prices before buying; Hetzner
charges a location surcharge outside the EU.

### Why these choices

**4GB, not 2GB.** `medusa build` peaks near 2GB compiling the admin dashboard.
With 4GB you build on the server and deploying is `git pull` plus one command.
On 2GB you would need CI and a container registry to build elsewhere.

**R2 for uploads.** Medusa writes uploads to local disk unless an S3 provider is
configured. R2 keeps images off the 40GB disk, survives rebuilds, and charges
nothing for egress. It is S3-compatible, so it is configuration, not code.

**Singapore.** The hot path is Vercel SSR calling Medusa, several round trips per
render, so colocating those two matters more than distance from Dhaka. Pin your
Vercel functions to `sin1` to match.

**Fallback.** If Hetzner's signup rejects your card, Vultr or DigitalOcean
Singapore at 2GB (~$10–12) takes these same files — add 2GB of swap so the build
is not OOM-killed.

The real tradeoff: one host is one failure domain. That is what the nightly
offsite backup is for. Do not skip it.

---

## Scaling: what to do, in order

Start at stage 1. Each stage is a config change against the same compose file —
no re-architecture, no downtime beyond a restart.

### Stage 1 — one container, `shared` mode (the default)

HTTP and background jobs share a process. Comfortable for a few hundred orders a
day on a CX22. This is what you get with no extra flags.

```bash
docker compose up -d
```

**Move on when:** checkout latency climbs while a bulk import, inventory sync or
scheduled job is running. That is background work stealing time from requests.

### Stage 2 — split background jobs onto their own container

Same box, no extra cost. Frees HTTP from long-running jobs.

```bash
# in .env
MEDUSA_WORKER_MODE=server

docker compose --profile scaled up -d
```

**Both halves are required.** In `server` mode the app registers API routes but
runs no scheduled jobs or workflow steps; the `worker` container is what picks
those up. Setting `server` without `--profile scaled` means nothing processes
your queue — orders will sit there.

Verified behaviour: in `server` mode `/store/regions` returns 400 and
`/admin/users` 401 (routes present, auth missing). In `worker` mode both return
404 — the worker keeps only a health listener, no API surface. Budget ~2.5GB for
the box at this stage.

**Move on when:** the backend container is CPU-saturated during normal traffic,
not just during jobs.

### Stage 3 — more HTTP capacity

Move to a CX32 (4 vCPU / 8GB, ~€10) and run several server replicas.

```bash
docker compose --profile scaled up -d --scale backend=3
```

Caddy picks the replicas up automatically. **Why it works:** Docker's DNS returns
one A record per replica, and the Caddyfile uses a `dynamic a` upstream that
re-resolves every 10s, then balances with `least_conn`. A plain
`reverse_proxy backend:9000` would resolve once at startup and pin one replica
forever, leaving the others idle — that is the whole reason for the dynamic
block. Confirmed with 3 replicas: DNS returned all three IPs, all three healthy.

Migrations are safe here because they do not run per container — the `migrate`
service runs once to completion and everything else waits on it.

**Move on when:** Postgres is the bottleneck — slow queries under load, or
connection counts near `max_connections`.

### Stage 4 — give the database its own box

Only now is it worth paying for. Point `DATABASE_URL` at a second Hetzner box or
a managed Postgres (Neon, or DigitalOcean Managed) and drop the `postgres`
service from the stack.

**Watch the SSL flag when you do.** The internal `DATABASE_URL` ends in
`?sslmode=disable`. Medusa decides TLS by pattern-matching that string: anything
that is not localhost and does not say `sslmode=disable` gets SSL turned on.
Removing the flag is exactly what you want when moving to a managed database —
and leaving it on would send credentials over the network in the clear.

---

## First-time setup

### 1. Cloudflare R2

Create `orbissquare-media` and `orbissquare-backups`, then an R2 API token with
**Object Read & Write** on both. Give the media bucket a public domain — a custom
subdomain such as `media.orbissquare.com` is much better than an `r2.dev` URL,
because the value is baked into stored image URLs and changing it later means
rewriting them.

### 2. DNS

Point this record at the server before starting the stack — Caddy cannot issue a
certificate until it resolves.

```
A   api.orbissquare.com   -> <server-ip>
```

### 3. Server

```bash
ssh root@<server-ip>

curl -fsSL https://get.docker.com | sh

# Only HTTP/HTTPS and SSH. Postgres and Redis stay on the internal compose
# network and are never published.
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable

git clone https://github.com/nexongreenltd/Orbis-Square.git /opt/orbissquare
cd /opt/orbissquare/backend

cp .env.production.template .env
openssl rand -base64 32   # once per secret: POSTGRES_PASSWORD, JWT_SECRET, COOKIE_SECRET
nano .env
```

### 4. Launch

```bash
docker compose up -d --build     # first build takes a few minutes
docker compose logs -f backend
```

The `migrate` service runs first and must exit 0 before the app starts; a deploy
never needs a manual migration step.

### 5. Create the admin user

```bash
docker compose exec backend npx medusa user -e you@orbissquare.com -p '<password>'
```

Admin dashboard: `https://api.orbissquare.com/app`.

### 6. Point the storefront at it

In Vercel:

```
MEDUSA_BACKEND_URL=https://api.orbissquare.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<Settings → Publishable API Keys>
```

Set the function region to `sin1` under Settings → Functions.

### 7. Backups

```bash
apt install -y awscli
aws configure     # R2 token; region "auto"
crontab -e
```

```cron
0 3 * * * /opt/orbissquare/backend/scripts/backup-db.sh >> /var/log/medusa-backup.log 2>&1
```

Then restore one into a scratch database. An untested backup is not a backup.

---

## Deploying a change

```bash
cd /opt/orbissquare && git pull
docker compose -f backend/docker-compose.yml up -d --build
```

## Operations

```bash
docker compose ps                       # health of each service
docker compose logs -f backend
docker compose logs migrate             # why a deploy is stuck, if it is
docker stats --no-stream                # memory headroom

# Restore a dump
gunzip -c medusa-<stamp>.sql.gz | docker compose exec -T postgres psql -U medusa medusa
```

### Redis eviction policy

Redis runs `--maxmemory-policy noeviction` deliberately. Medusa's job queue
(BullMQ) lives here; under an LRU policy Redis silently discards queued jobs to
reclaim memory and orders quietly stop being processed. With `noeviction` a full
Redis rejects writes loudly instead. Medusa prints a startup warning if this is
ever set wrong — treat it as an error, not noise.

### Build gets OOM-killed

Only on a 2GB host. Add swap:

```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### Uploads failing

Check `S3_BUCKET` is set — `medusa-config.ts` falls back to local disk when it is
empty, which works silently until a rebuild discards the files.

```bash
docker compose exec backend env | grep S3_
```

### Migration fails with a connection timeout

If `migrate` exits 1 with "connection timed out after 10 seconds", the
`?sslmode=disable` suffix is missing from `DATABASE_URL`. Medusa turns SSL on for
any non-localhost URL without it, and the containerised Postgres speaks no TLS,
so the handshake hangs.
