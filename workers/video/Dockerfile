FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=development

RUN apk add --no-cache ffmpeg font-dejavu \
  && test -f /usr/share/fonts/dejavu/DejaVuSans-Bold.ttf \
  && mkdir -p /usr/share/fonts/truetype/dejavu \
  && ln -sf /usr/share/fonts/dejavu/DejaVuSans-Bold.ttf /usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY configs ./configs
COPY packages/campaign-planner ./packages/campaign-planner
COPY packages/content-engine ./packages/content-engine
COPY scripts/real-footage-mvp-render.mjs ./scripts/real-footage-mvp-render.mjs
COPY workers/video ./workers/video

CMD ["node", "--experimental-strip-types", "workers/video/src/index.ts"]
