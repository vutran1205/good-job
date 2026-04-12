FROM node:20-alpine
WORKDIR /app/apps/api

# Install system ffmpeg (avoids cross-platform binary issue with ffmpeg-static)
RUN apk add --no-cache ffmpeg openssl

# Copy package manifests for layer caching
COPY package*.json ./

# Install deps
RUN npm ci

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

CMD ["sh", "-c", "npx prisma db push && npx tsx watch src/server.ts"]
