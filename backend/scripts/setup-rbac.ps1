# PowerShell script to set up RBAC system
# Usage: .\scripts\setup-rbac.ps1

Write-Host "🔐 Setting up Enterprise RBAC System..." -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found" -ForegroundColor Red
    Write-Host "Please create .env file with DATABASE_URL" -ForegroundColor Yellow
    exit 1
}

# Step 1: Create migration
Write-Host "📦 Step 1: Creating database migration..." -ForegroundColor Yellow
npx prisma migrate dev --name add_rbac_system
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Migration created successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Generate Prisma client
Write-Host "🔧 Step 2: Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prisma client generation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma client generated successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Seed RBAC data
Write-Host "🌱 Step 3: Seeding RBAC data..." -ForegroundColor Yellow
npx tsx src/scripts/seed-rbac.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ RBAC seeding failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ RBAC data seeded successfully" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 RBAC system setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Verify roles and permissions in database" -ForegroundColor White
Write-Host "  2. Start using requirePermission() in routes" -ForegroundColor White
Write-Host "  3. Check docs/RBAC_QUICK_START.md for usage examples" -ForegroundColor White

