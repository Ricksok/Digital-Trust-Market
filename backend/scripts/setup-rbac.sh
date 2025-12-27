#!/bin/bash
# Bash script to set up RBAC system
# Usage: ./scripts/setup-rbac.sh

echo "🔐 Setting up Enterprise RBAC System..."
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    echo "Please create .env file with DATABASE_URL"
    exit 1
fi

# Step 1: Create migration
echo "📦 Step 1: Creating database migration..."
npx prisma migrate dev --name add_rbac_system
if [ $? -ne 0 ]; then
    echo "❌ Migration failed!"
    exit 1
fi
echo "✅ Migration created successfully"
echo ""

# Step 2: Generate Prisma client
echo "🔧 Step 2: Generating Prisma client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Prisma client generation failed!"
    exit 1
fi
echo "✅ Prisma client generated successfully"
echo ""

# Step 3: Seed RBAC data
echo "🌱 Step 3: Seeding RBAC data..."
npx tsx src/scripts/seed-rbac.ts
if [ $? -ne 0 ]; then
    echo "❌ RBAC seeding failed!"
    exit 1
fi
echo "✅ RBAC data seeded successfully"
echo ""

echo "🎉 RBAC system setup completed!"
echo ""
echo "Next steps:"
echo "  1. Verify roles and permissions in database"
echo "  2. Start using requirePermission() in routes"
echo "  3. Check docs/RBAC_QUICK_START.md for usage examples"

