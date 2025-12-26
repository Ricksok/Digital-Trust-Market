# Database Setup Script
Write-Host "🔧 Database Setup Script" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is available
$postgresInstalled = Get-Command psql -ErrorAction SilentlyContinue
$postgresService = Get-Service -Name postgresql* -ErrorAction SilentlyContinue

if ($postgresInstalled -or $postgresService) {
    Write-Host "✅ PostgreSQL detected" -ForegroundColor Green
    
    # Try to start PostgreSQL service
    if ($postgresService) {
        Write-Host "Attempting to start PostgreSQL service..." -ForegroundColor Yellow
        try {
            Start-Service $postgresService[0].Name -ErrorAction Stop
            Write-Host "✅ PostgreSQL service started" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Could not start service. You may need to run as Administrator." -ForegroundColor Yellow
            Write-Host "   Service name: $($postgresService[0].Name)" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Ensure PostgreSQL is running"
    Write-Host "2. Create database: CREATE DATABASE digital_trust_marketplace;"
    Write-Host "3. Update backend/.env with your PostgreSQL credentials"
    Write-Host "4. Run: npm run db:migrate"
    Write-Host "5. Run: npm run db:seed"
    
} else {
    Write-Host "⚠️  PostgreSQL not found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "1. Install PostgreSQL: https://www.postgresql.org/download/windows/"
    Write-Host "2. Use SQLite for quick testing (see DATABASE_SETUP.md)"
    Write-Host "3. Use Docker: docker run --name postgres-mvp -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=digital_trust_marketplace -p 5432:5432 -d postgres:15"
}

Write-Host ""
Write-Host "For detailed instructions, see: DATABASE_SETUP.md" -ForegroundColor Gray


