#!/bin/sh
# Run pending migrations before the server accepts traffic. Safe to repeat:
# db:migrate is a no-op once the schema is current, so every container restart
# converges rather than requiring a manual step after a deploy.
set -e

echo "==> Running database migrations"
npx medusa db:migrate

echo "==> Starting Medusa"
exec "$@"
