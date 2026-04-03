FROM node:22-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

COPY src ./src

RUN npm run generate

ENV NODE_ENV=production
ENV PORT=7007

EXPOSE 7007

CMD ["sh", "-c", "npm run prisma:migrate:deploy && npm run start"]
