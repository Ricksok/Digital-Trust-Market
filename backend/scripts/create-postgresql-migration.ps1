# PowerShell script to create fresh PostgreSQL migration
# Run this from the backend directory after updating schema to PostgreSQL

Write-Host "🔄 Creating PostgreSQL Migration" -ForegroundColor Cyan
Write-Host ""

# Check if DATABASE_URL is set
if (-not $env:DATABASE_URL) {
    Write-Host "⚠️  DATABASE_URL not set. Using default..." -ForegroundColor Yellow
    $env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/digital_trust_marketplace?schema=public"
    Write-Host "   DATABASE_URL=$env:DATABASE_URL" -ForegroundColor Gray
}

Write-Host "📦 Creating migration..." -ForegroundColor Yellow
npx prisma migrate dev --name init_postgresql

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Migration created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Review the migration SQL in prisma/migrations/"
    Write-Host "2. Run: docker-compose up -d"
    Write-Host "3. Run: docker-compose exec backend npm run db:seed"
} else {
    Write-Host ""
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    Write-Host "Make sure PostgreSQL is running and accessible." -ForegroundColor Yellow
}


