FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=development
ENV APP_PORT=3000

COPY package.json package-lock.json ./
RUN npm ci

COPY apps/web ./apps/web

EXPOSE 3000

CMD ["node", "--experimental-strip-types", "apps/web/src/server.ts"]
