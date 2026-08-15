# Medusa v2 production image.
#
# Two stages: the builder needs devDependencies (vite, typescript, @swc) to run
# `medusa build`, the runner does not. `medusa build` emits a self-contained
# server under .medusa/server with its own package.json, so the runner installs
# production deps from *that* manifest rather than the source one.
#
# NODE_ENV is deliberately left unset in the builder. Setting it to production
# makes npm skip devDependencies and the build dies on a missing vite.

FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY . .
RUN npm run build


FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production

WORKDIR /app

# `medusa build` copies package-lock.json into the generated server alongside a
# manifest with the same dependency set, so the lockfile is in sync and `npm ci`
# is safe — and pins exact versions the way `npm install` would not.
COPY --from=builder /app/.medusa/server ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh && chown -R node:node /app

USER node

EXPOSE 9000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
