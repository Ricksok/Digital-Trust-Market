#!/bin/sh
set -e

echo "🚀 Starting Digital Trust Marketplace Backend..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-digital_trust_marketplace}; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Run migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Seed database if needed (only if SEED_DB is set)
if [ "$SEED_DB" = "true" ]; then
  echo "🌱 Seeding database..."
  npm run db:seed
fi

echo "✅ Database setup complete!"

# Start the application
echo "🚀 Starting application..."
exec "$@"




