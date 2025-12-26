#!/bin/bash
# Script to apply database migration and regenerate Prisma client
# Run this after stopping the dev server

echo "🔄 Applying database migration..."
npx prisma migrate deploy

echo "🔧 Regenerating Prisma client..."
npx prisma generate

echo "✅ Migration complete! You can now restart the dev server."


