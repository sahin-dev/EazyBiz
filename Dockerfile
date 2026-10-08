FROM node:20-bookworm-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/domain/package.json packages/domain/package.json
RUN pnpm install --frozen-lockfile
COPY apps ./apps
COPY packages ./packages
RUN pnpm --filter @businessos/api prisma:generate && pnpm build

FROM node:20-bookworm-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder --chown=node:node /app /app
USER node
ENV NODE_ENV=production

FROM runtime AS api
EXPOSE 4000
CMD ["sh", "-c", "cd apps/api && ./node_modules/.bin/prisma migrate deploy && node dist/main.js"]

FROM runtime AS web
WORKDIR /app/apps/web
EXPOSE 3100
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3100", "-H", "0.0.0.0"]
