FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=development

COPY package.json package-lock.json ./
RUN npm ci

COPY packages/campaign-planner ./packages/campaign-planner
COPY workers/campaign-planner ./workers/campaign-planner

CMD ["node", "--experimental-strip-types", "workers/campaign-planner/src/index.ts"]
