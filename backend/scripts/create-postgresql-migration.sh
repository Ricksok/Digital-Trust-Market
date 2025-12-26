#!/bin/bash
# Script to create fresh PostgreSQL migration
# Run this from the backend directory after updating schema to PostgreSQL

echo "🔄 Creating PostgreSQL Migration"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set. Using default..."
    export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/digital_trust_marketplace?schema=public"
    echo "   DATABASE_URL=$DATABASE_URL"
fi

echo "📦 Creating migration..."
npx prisma migrate dev --name init_postgresql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration created successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Review the migration SQL in prisma/migrations/"
    echo "2. Run: docker-compose up -d"
    echo "3. Run: docker-compose exec backend npm run db:seed"
else
    echo ""
    echo "❌ Migration failed!"
    echo "Make sure PostgreSQL is running and accessible."
fi




