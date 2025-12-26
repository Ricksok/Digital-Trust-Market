# PowerShell script to apply database migration and regenerate Prisma client
# Run this after stopping the dev server

Write-Host "🔄 Applying database migration..." -ForegroundColor Cyan
npx prisma migrate deploy

Write-Host "🔧 Regenerating Prisma client..." -ForegroundColor Cyan
npx prisma generate

Write-Host "✅ Migration complete! You can now restart the dev server." -ForegroundColor Green


