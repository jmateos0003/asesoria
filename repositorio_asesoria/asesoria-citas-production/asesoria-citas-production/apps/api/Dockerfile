FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma@5.22.0 generate --schema=apps/api/prisma/schema.prisma
RUN npm run build

EXPOSE 4000

CMD ["sh", "-c", "npx prisma@5.22.0 db push --schema=apps/api/prisma/schema.prisma && npx tsx apps/api/prisma/seed.ts && npm run start"]