# Script to regenerate Prisma client
# Run this when the dev server is stopped

Write-Host "Regenerating Prisma client..." -ForegroundColor Cyan

# Kill any Prisma processes
Write-Host "Checking for Prisma processes..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -like "*schema-engine*" -or $_.ProcessName -like "*query-engine*" } | ForEach-Object {
    Write-Host "Killing process: $($_.ProcessName)" -ForegroundColor Yellow
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

# Wait a moment
Start-Sleep -Seconds 2

# Regenerate Prisma client
Write-Host "Running prisma generate..." -ForegroundColor Cyan
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "Prisma client regenerated successfully!" -ForegroundColor Green
} else {
    Write-Host "Prisma generate failed. Make sure:" -ForegroundColor Red
    Write-Host "1. Dev server is stopped" -ForegroundColor Red
    Write-Host "2. Prisma Studio is closed" -ForegroundColor Red
    Write-Host "3. No other processes are using Prisma files" -ForegroundColor Red
    Write-Host "" -ForegroundColor Red
    Write-Host "Try closing your IDE and running this script again." -ForegroundColor Yellow
}





