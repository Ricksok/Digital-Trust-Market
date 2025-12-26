# Manual Migration Script
# Use this if automatic migration fails due to database lock

Write-Host "⚠️  Manual Migration Script" -ForegroundColor Yellow
Write-Host "This will apply the migration SQL directly to the database" -ForegroundColor Yellow
Write-Host ""

$migrationFile = "prisma\migrations\20251224203514_add_entity_auction_guarantee_analytics_models\migration.sql"
$dbFile = "prisma\dev.db"

if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Migration file not found: $migrationFile" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $dbFile)) {
    Write-Host "❌ Database file not found: $dbFile" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Migration file found" -ForegroundColor Green
Write-Host "📊 Database file found" -ForegroundColor Green
Write-Host ""
Write-Host "To apply manually, you can:" -ForegroundColor Cyan
Write-Host "1. Install sqlite3: choco install sqlite" -ForegroundColor White
Write-Host "2. Or use an SQLite browser tool" -ForegroundColor White
Write-Host "3. Or try closing ALL applications and retry: npm run db:apply-migration" -ForegroundColor White
Write-Host ""
Write-Host "The migration SQL is in: $migrationFile" -ForegroundColor Cyan


