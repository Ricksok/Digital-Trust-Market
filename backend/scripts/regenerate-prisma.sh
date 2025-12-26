#!/bin/bash
# Script to regenerate Prisma client
# Run this when the dev server is stopped

echo "Regenerating Prisma client..."

# Kill any Prisma processes (if on Linux/Mac)
pkill -f schema-engine || true
pkill -f query-engine || true

# Wait a moment
sleep 2

# Regenerate Prisma client
npx prisma generate

if [ $? -eq 0 ]; then
    echo "Prisma client regenerated successfully!"
else
    echo "Prisma generate failed. Make sure:"
    echo "1. Dev server is stopped"
    echo "2. Prisma Studio is closed"
    echo "3. No other processes are using Prisma files"
    echo ""
    echo "Try closing your IDE and running this script again."
fi




