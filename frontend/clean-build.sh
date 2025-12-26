#!/bin/bash
# Clean Build Script for Frontend
# Removes stale build artifacts that can cause ChunkLoadError

echo "🧹 Cleaning Next.js build artifacts..."

# Remove .next directory
if [ -d ".next" ]; then
    rm -rf .next
    echo "✅ Removed .next directory"
else
    echo "ℹ️  .next directory does not exist"
fi

# Remove node_modules cache
if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    echo "✅ Removed node_modules cache"
else
    echo "ℹ️  node_modules cache does not exist"
fi

echo ""
echo "✨ Cleanup complete! You can now run: npm run dev"


