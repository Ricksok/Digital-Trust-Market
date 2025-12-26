.PHONY: help build up down restart logs shell backend-shell frontend-shell db-shell migrate seed clean test

# Default target
help:
	@echo "Digital Trust Marketplace - Docker Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  build          Build all Docker images"
	@echo "  up             Start all services (detached)"
	@echo "  up-dev         Start all services in development mode"
	@echo "  down           Stop all services"
	@echo "  restart        Restart all services"
	@echo "  logs           View logs from all services"
	@echo "  logs-backend   View backend logs"
	@echo "  logs-frontend  View frontend logs"
	@echo "  logs-db        View database logs"
	@echo "  shell          Open shell in backend container"
	@echo "  backend-shell  Alias for shell"
	@echo "  frontend-shell Open shell in frontend container"
	@echo "  db-shell       Open PostgreSQL shell"
	@echo "  migrate        Run database migrations"
	@echo "  seed           Seed the database"
	@echo "  studio         Open Prisma Studio"
	@echo "  clean           Stop and remove containers, networks"
	@echo "  clean-all      Stop and remove containers, networks, and volumes"
	@echo "  test           Run tests"
	@echo "  health         Check health of all services"

# Build images
build:
	docker-compose build

# Start services
up:
	docker-compose up -d

# Start services in development mode
up-dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Stop services
down:
	docker-compose down

# Restart services
restart:
	docker-compose restart

# View logs
logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f postgres

# Shell access
shell:
	docker-compose exec backend sh

backend-shell: shell

frontend-shell:
	docker-compose exec frontend sh

db-shell:
	docker-compose exec postgres psql -U postgres -d digital_trust_marketplace

# Database operations
migrate:
	docker-compose exec backend npm run db:migrate

seed:
	docker-compose exec backend npm run db:seed

studio:
	docker-compose exec backend npm run db:studio

# Cleanup
clean:
	docker-compose down

clean-all:
	docker-compose down -v

# Testing
test:
	docker-compose exec backend npm test

# Health check
health:
	@echo "Checking service health..."
	@docker-compose ps
	@echo ""
	@echo "Backend health:"
	@curl -s http://localhost:3001/health || echo "Backend not responding"
	@echo ""
	@echo "Frontend health:"
	@curl -s http://localhost:3000 > /dev/null && echo "Frontend is up" || echo "Frontend not responding"




