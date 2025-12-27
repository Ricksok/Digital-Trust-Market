# PowerShell script to run RBAC migration when database is available
# Usage: .\scripts\run-rbac-migration.ps1

Write-Host "🔐 Running RBAC System Migration..." -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found" -ForegroundColor Red
    Write-Host "Please ensure DATABASE_URL is set in .env file" -ForegroundColor Yellow
    exit 1
}

# Step 1: Create migration
Write-Host "📦 Step 1: Creating database migration..." -ForegroundColor Yellow
npx prisma migrate dev --name add_rbac_system
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  1. Database is running" -ForegroundColor White
    Write-Host "  2. DATABASE_URL is correct in .env" -ForegroundColor White
    Write-Host "  3. Database user has CREATE TABLE permissions" -ForegroundColor White
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
    Write-Host "Migration was successful, but seeding failed." -ForegroundColor Yellow
    Write-Host "You can run the seed script manually: npx tsx src/scripts/seed-rbac.ts" -ForegroundColor White
    exit 1
}
Write-Host "✅ RBAC data seeded successfully" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 RBAC system migration completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Database tables created" -ForegroundColor White
Write-Host "  ✅ Prisma client updated" -ForegroundColor White
Write-Host "  ✅ Default permissions created" -ForegroundColor White
Write-Host "  ✅ Default roles created" -ForegroundColor White
Write-Host "  ✅ Roles assigned to existing users" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Verify roles in database: npx prisma studio" -ForegroundColor White
Write-Host "  2. Test permission checks with different user types" -ForegroundColor White
Write-Host "  3. Check audit logs: PermissionAudit table" -ForegroundColor White
Write-Host "  4. Review migrated routes in docs/RBAC_ROUTE_MIGRATION.md" -ForegroundColor White

