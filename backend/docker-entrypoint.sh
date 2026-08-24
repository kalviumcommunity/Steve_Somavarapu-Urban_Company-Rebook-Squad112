#!/bin/sh
set -e

echo "🚀 [Docker Entrypoint] Checking database connectivity and applying schema..."

# Automatically apply prisma schema if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "📦 Syncing Prisma database schema..."
  npx prisma db push --skip-generate || echo "⚠️ Warning: Prisma db push failed or timed out. Proceeding..."
fi

echo "🟢 Starting backend server..."
exec "$@"
