# Clean Build Script for Frontend
# Removes stale build artifacts that can cause ChunkLoadError

Write-Host "🧹 Cleaning Next.js build artifacts..." -ForegroundColor Yellow

# Remove .next directory
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "✅ Removed .next directory" -ForegroundColor Green
} else {
    Write-Host "ℹ️  .next directory does not exist" -ForegroundColor Gray
}

# Remove node_modules cache
if (Test-Path node_modules\.cache) {
    Remove-Item -Recurse -Force node_modules\.cache
    Write-Host "✅ Removed node_modules cache" -ForegroundColor Green
} else {
    Write-Host "ℹ️  node_modules cache does not exist" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✨ Cleanup complete! You can now run: npm run dev" -ForegroundColor Cyan


