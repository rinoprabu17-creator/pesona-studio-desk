FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=development

COPY package.json ./
COPY workers/video ./workers/video

CMD ["node", "--experimental-strip-types", "workers/video/src/index.ts"]
