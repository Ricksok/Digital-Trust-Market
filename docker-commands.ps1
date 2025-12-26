# PowerShell helper script for Docker operations
# Usage: .\docker-commands.ps1 [command]

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host "Digital Trust Marketplace - Docker Commands" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\docker-commands.ps1 [command]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  build          Build all Docker images"
    Write-Host "  up             Start all services (detached)"
    Write-Host "  up-dev         Start all services in development mode"
    Write-Host "  down           Stop all services"
    Write-Host "  restart        Restart all services"
    Write-Host "  logs           View logs from all services"
    Write-Host "  logs-backend   View backend logs"
    Write-Host "  logs-frontend  View frontend logs"
    Write-Host "  logs-db        View database logs"
    Write-Host "  shell          Open shell in backend container"
    Write-Host "  db-shell       Open PostgreSQL shell"
    Write-Host "  migrate        Run database migrations"
    Write-Host "  seed           Seed the database"
    Write-Host "  studio         Open Prisma Studio"
    Write-Host "  clean          Stop and remove containers, networks"
    Write-Host "  clean-all      Stop and remove containers, networks, and volumes"
    Write-Host "  health         Check health of all services"
    Write-Host "  help           Show this help message"
}

function Invoke-DockerCompose {
    param([string[]]$Args)
    docker-compose @Args
}

switch ($Command.ToLower()) {
    "build" {
        Write-Host "Building Docker images..." -ForegroundColor Yellow
        Invoke-DockerCompose -Args @("build")
    }
    "up" {
        Write-Host "Starting all services..." -ForegroundColor Yellow
        Invoke-DockerCompose -Args @("up", "-d")
    }
    "up-dev" {
        Write-Host "Starting all services in development mode..." -ForegroundColor Yellow
        Invoke-DockerCompose -Args @("-f", "docker-compose.yml", "-f", "docker-compose.dev.yml", "up")
    }
    "down" {
        Write-Host "Stopping all services..." -ForegroundColor Yellow
        Invoke-DockerCompose -Args @("down")
    }
    "restart" {
        Write-Host "Restarting all services..." -ForegroundColor Yellow
        Invoke-DockerCompose -Args @("restart")
    }
    "logs" {
        Invoke-DockerCompose -Args @("logs", "-f")
    }
    "logs-backend" {
        Invoke-DockerCompose -Args @("logs", "-f", "backend")
    }
    "logs-frontend" {
        Invoke-DockerCompose -Args @("logs", "-f", "frontend")
    }
    "logs-db" {
        Invoke-DockerCompose -Args @("logs", "-f", "postgres")
    }
    "shell" {
        Write-Host "Opening backend shell..." -ForegroundColor Yellow
        Invoke-DockerCompose -Args @("exec", "backend", "sh")
    }
    "db-shell" {
        Write-Host "Opening PostgreSQL shell..." -ForegroundColor Yellow
        Invoke-DockerCompose -Args @("exec", "postgres", "psql", "-U", "postgres", "-d", "digital_trust_marketplace")
    }
    "migrate" {
        Write-Host "Running database migrations..." -ForegroundColor Yellow
        Invoke-DockerCompose -Args @("exec", "backend", "npm", "run", "db:migrate")
    }
    "seed" {
        Write-Host "Seeding database..." -ForegroundColor Yellow
        Invoke-DockerCompose -Args @("exec", "backend", "npm", "run", "db:seed")
    }
    "studio" {
        Write-Host "Opening Prisma Studio..." -ForegroundColor Yellow
        Write-Host "Note: Prisma Studio will be available at http://localhost:5555" -ForegroundColor Cyan
        Invoke-DockerCompose -Args @("exec", "backend", "npm", "run", "db:studio")
    }
    "clean" {
        Write-Host "Cleaning up containers and networks..." -ForegroundColor Yellow
        Invoke-DockerCompose -Args @("down")
    }
    "clean-all" {
        Write-Host "Cleaning up containers, networks, and volumes..." -ForegroundColor Yellow
        Write-Host "WARNING: This will delete all database data!" -ForegroundColor Red
        $confirm = Read-Host "Are you sure? (yes/no)"
        if ($confirm -eq "yes") {
            Invoke-DockerCompose -Args @("down", "-v")
        } else {
            Write-Host "Cancelled." -ForegroundColor Yellow
        }
    }
    "health" {
        Write-Host "Checking service health..." -ForegroundColor Yellow
        Invoke-DockerCompose -Args @("ps")
        Write-Host ""
        Write-Host "Backend health:" -ForegroundColor Cyan
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Backend is healthy" -ForegroundColor Green
            }
        } catch {
            Write-Host "❌ Backend is not responding" -ForegroundColor Red
        }
        Write-Host ""
        Write-Host "Frontend health:" -ForegroundColor Cyan
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Frontend is healthy" -ForegroundColor Green
            }
        } catch {
            Write-Host "❌ Frontend is not responding" -ForegroundColor Red
        }
    }
    default {
        Show-Help
    }
}




