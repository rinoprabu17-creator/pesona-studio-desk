FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=development
ENV APP_PORT=3000

RUN apk add --no-cache ffmpeg postgresql16-client

COPY package.json package-lock.json ./
RUN npm ci

COPY configs ./configs
COPY migrations ./migrations
COPY scripts/env.mjs ./scripts/env.mjs
COPY scripts/migrate.mjs ./scripts/migrate.mjs
COPY scripts/db-backup-helpers.mjs ./scripts/db-backup-helpers.mjs
COPY scripts/db-backup.mjs ./scripts/db-backup.mjs
COPY scripts/db-restore-test.mjs ./scripts/db-restore-test.mjs
COPY packages/campaign-planner ./packages/campaign-planner
COPY packages/content-engine ./packages/content-engine
COPY apps/web ./apps/web

EXPOSE 3000

CMD ["node", "--experimental-strip-types", "apps/web/src/server.ts"]
