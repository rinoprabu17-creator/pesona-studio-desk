FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=development
ENV APP_PORT=3000

RUN apk add --no-cache ffmpeg

COPY package.json package-lock.json ./
RUN npm ci

COPY configs ./configs
COPY packages/campaign-planner ./packages/campaign-planner
COPY packages/content-engine ./packages/content-engine
COPY apps/web ./apps/web

EXPOSE 3000

CMD ["node", "--experimental-strip-types", "apps/web/src/server.ts"]
