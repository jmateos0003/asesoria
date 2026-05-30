FROM node:20-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json apps/api/
RUN npm install

COPY apps/api apps/api
WORKDIR /app/apps/api

RUN npm run prisma:generate
RUN npm run build

EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/server.js"]
