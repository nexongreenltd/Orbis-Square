#!/bin/sh
# Migrations deliberately do NOT run here. They run once in the dedicated
# `migrate` service, which every app container waits on. Running them per
# container is fine at one replica but becomes a race the moment there are two,
# and a half-applied schema is the worst possible thing to discover under load.
set -e

echo "==> Starting Medusa (worker mode: ${MEDUSA_WORKER_MODE:-shared})"
exec "$@"
