# Docker Seed Script for Windows PowerShell
# Usage: .\docker-seed.ps1

Write-Host "🌱 Docker Database Seed Script" -ForegroundColor Green
Write-Host ""

# Check if Docker is running
Write-Host "📋 Checking Docker status..." -ForegroundColor Yellow
$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker is running" -ForegroundColor Green
Write-Host ""

# Check if containers are running
Write-Host "📋 Checking container status..." -ForegroundColor Yellow
$containers = docker-compose ps --services --filter "status=running"
if (-not $containers) {
    Write-Host "⚠️  No containers are running. Starting services..." -ForegroundColor Yellow
    docker-compose up -d
    Write-Host "⏳ Waiting for services to be healthy (30 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
} else {
    Write-Host "✅ Containers are running" -ForegroundColor Green
}
Write-Host ""

# Check if backend container exists
Write-Host "📋 Checking backend container..." -ForegroundColor Yellow
$backendExists = docker-compose ps backend 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend container not found. Please run: docker-compose up -d" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend container found" -ForegroundColor Green
Write-Host ""

# Check if PostgreSQL is ready
Write-Host "📋 Checking PostgreSQL connection..." -ForegroundColor Yellow
$pgReady = docker-compose exec -T postgres pg_isready -U postgres 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ PostgreSQL is not ready. Please wait and try again." -ForegroundColor Red
    exit 1
}
Write-Host "✅ PostgreSQL is ready" -ForegroundColor Green
Write-Host ""

# Run seed script
Write-Host "🌱 Running database seed script..." -ForegroundColor Yellow
Write-Host ""
docker-compose exec backend npm run db:seed

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Seed completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Summary:" -ForegroundColor Cyan
    Write-Host "   - 69 Users (1 admin, 14 investors, 14 fundraisers, 40 end users)" -ForegroundColor White
    Write-Host "   - 9 Projects" -ForegroundColor White
    Write-Host "   - 15+ Investments" -ForegroundColor White
    Write-Host "   - 7+ Auctions" -ForegroundColor White
    Write-Host "   - 5 Guarantee Requests" -ForegroundColor White
    Write-Host "   - 4 Tokens with transactions" -ForegroundColor White
    Write-Host "   - 4 Governance Proposals" -ForegroundColor White
    Write-Host "   - 3 Staking Pools" -ForegroundColor White
    Write-Host ""
    Write-Host "🔑 Demo Credentials:" -ForegroundColor Cyan
    Write-Host "   Admin: admin@marketplace.com / admin123" -ForegroundColor White
    Write-Host "   Investor: investor1@example.com / investor123" -ForegroundColor White
    Write-Host "   Fundraiser: fundraiser1@example.com / fundraiser123" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Access:" -ForegroundColor Cyan
    Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "   Backend: http://localhost:3001" -ForegroundColor White
    Write-Host "   Health: http://localhost:3001/health" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Seed failed. Check the logs:" -ForegroundColor Red
    Write-Host "   docker-compose logs backend" -ForegroundColor Yellow
    exit 1
}

