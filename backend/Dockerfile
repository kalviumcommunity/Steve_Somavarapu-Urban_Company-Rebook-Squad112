# Backend Dockerfile for Urban Company Rebook API
FROM node:20-alpine AS base

# Install openssl for Prisma engine support on Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code and files
COPY . .
RUN chmod +x ./docker-entrypoint.sh 2>/dev/null || true

# Set default environment variables
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]
