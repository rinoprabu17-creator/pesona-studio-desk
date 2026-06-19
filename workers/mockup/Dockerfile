FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=development

COPY package.json ./
COPY workers/mockup ./workers/mockup

CMD ["node", "--experimental-strip-types", "workers/mockup/src/index.ts"]
