# PowerShell script to start development mode with hot reload
# Usage: .\start-dev.ps1

Write-Host "🚀 Starting development mode with hot reload..." -ForegroundColor Green
Write-Host ""

# Stop any running containers
Write-Host "Stopping existing containers..." -ForegroundColor Yellow
docker-compose down

# Start with development configuration
Write-Host "Starting development services..." -ForegroundColor Yellow
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

Write-Host ""
Write-Host "✅ Development mode started!" -ForegroundColor Green
Write-Host "📝 Changes will reflect immediately (hot reload enabled)" -ForegroundColor Cyan
Write-Host "🛑 Press Ctrl+C to stop" -ForegroundColor Yellow


