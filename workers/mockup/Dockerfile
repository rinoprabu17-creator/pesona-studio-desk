FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=development

RUN apk add --no-cache ffmpeg

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY configs ./configs
COPY packages/campaign-planner ./packages/campaign-planner
COPY packages/content-engine ./packages/content-engine
COPY apps/web ./apps/web
COPY workers/mockup ./workers/mockup

CMD ["node", "--experimental-strip-types", "workers/mockup/src/index.ts"]
