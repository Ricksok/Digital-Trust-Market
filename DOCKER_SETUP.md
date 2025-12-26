# Docker Setup Guide - Enterprise Grade Architecture

This guide explains how to run the Digital Trust Marketplace using Docker with PostgreSQL.

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine + Docker Compose (Linux)
- Docker version 20.10 or higher
- Docker Compose version 2.0 or higher

## Quick Start

### 1. Clone and Navigate

```bash
cd MVP
```

### 2. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and update the following critical values:
- `POSTGRES_PASSWORD`: Change from default `postgres` to a strong password
- `JWT_SECRET`: Generate a strong secret (minimum 32 characters)

### 3. Start Services

**Production Mode:**
```bash
docker-compose up -d
```

**Development Mode (with hot reload):**
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### 4. Initialize Database

The backend will automatically run migrations on startup. To manually seed the database:

```bash
# Enter the backend container
docker-compose exec backend sh

# Run seed script
npm run db:seed
```

Or from your host machine:
```bash
docker-compose exec backend npm run db:seed
```

### 5. Access Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **PostgreSQL**: localhost:5432
- **Health Check**: http://localhost:3001/health

## Architecture Overview

### Services

1. **PostgreSQL** (`postgres`)
   - Database: `digital_trust_marketplace`
   - Port: 5432
   - Data persisted in Docker volume: `postgres_data`

2. **Backend** (`backend`)
   - Node.js/Express API
   - Port: 3001
   - Auto-runs migrations on startup
   - Health check endpoint: `/health`

3. **Frontend** (`frontend`)
   - Next.js application
   - Port: 3000
   - Connects to backend API

### Network

All services communicate through the `mvp-network` bridge network.

## Environment Variables

### Root `.env` File

Key variables for Docker Compose:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres  # CHANGE THIS!
POSTGRES_DB=digital_trust_marketplace
POSTGRES_PORT=5432
BACKEND_PORT=3001
FRONTEND_PORT=3000
JWT_SECRET=your-secret-here  # CHANGE THIS!
```

### Backend Environment

The backend service uses these environment variables (set in `docker-compose.yml`):

- `DATABASE_URL`: Auto-constructed from PostgreSQL service
- `NODE_ENV`: Set to `production` by default
- `PORT`: Backend port (default: 3001)
- `JWT_SECRET`: JWT signing secret
- `FRONTEND_URL`: Frontend URL for CORS

### Frontend Environment

The frontend service uses:

- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_WEB3_RPC_URL`: Web3 RPC endpoint (optional)

## Common Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Restart a Service
```bash
docker-compose restart backend
```

### Execute Commands in Container
```bash
# Backend shell
docker-compose exec backend sh

# Run Prisma Studio
docker-compose exec backend npm run db:studio

# Run migrations
docker-compose exec backend npm run db:migrate

# Run seed
docker-compose exec backend npm run db:seed
```

### Database Access
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d digital_trust_marketplace
```

### Rebuild Services
```bash
# Rebuild all
docker-compose build

# Rebuild specific service
docker-compose build backend
```

### Clean Up
```bash
# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: Deletes database data!)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

## Development Workflow

### Using Development Override

For development with hot reload:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

This will:
- Mount source code as volumes
- Enable hot reload
- Use development Dockerfiles

### Running Migrations

Migrations run automatically on backend startup. To run manually:

```bash
docker-compose exec backend npm run db:migrate
```

### Seeding Database

```bash
docker-compose exec backend npm run db:seed
```

### Prisma Studio

Access Prisma Studio to view/edit database:

```bash
docker-compose exec backend npm run db:studio
```

Then access at: http://localhost:5555 (if port is exposed)

## Production Deployment

### Security Checklist

1. ✅ Change `POSTGRES_PASSWORD` to a strong password
2. ✅ Change `JWT_SECRET` to a strong, random secret (min 32 chars)
3. ✅ Set `NODE_ENV=production`
4. ✅ Update `FRONTEND_URL` to production domain
5. ✅ Use environment-specific `.env` files
6. ✅ Enable SSL/TLS for database connections
7. ✅ Configure proper CORS origins
8. ✅ Set up proper logging and monitoring
9. ✅ Configure backup strategy for PostgreSQL

### Production Optimizations

1. **Use specific image tags** instead of `latest`
2. **Set resource limits** in docker-compose.yml:
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 1G
   ```
3. **Enable health checks** (already configured)
4. **Set up log rotation**
5. **Configure reverse proxy** (nginx/traefik)
6. **Use secrets management** (Docker secrets, Vault, etc.)

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is healthy
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Test connection from backend
docker-compose exec backend sh
# Then: npx prisma db pull
```

### Backend Won't Start

```bash
# Check logs
docker-compose logs backend

# Check if database is ready
docker-compose exec postgres pg_isready -U postgres

# Manually run migrations
docker-compose exec backend npx prisma migrate deploy
```

### Frontend Build Issues

```bash
# Rebuild frontend
docker-compose build --no-cache frontend

# Check Next.js build logs
docker-compose logs frontend
```

### Port Conflicts

If ports are already in use:

1. Change ports in `.env` file
2. Update `docker-compose.yml` port mappings
3. Restart services

### Volume Issues

```bash
# Check volumes
docker volume ls

# Inspect volume
docker volume inspect mvp_postgres_data

# Remove and recreate (WARNING: Data loss!)
docker-compose down -v
docker-compose up -d
```

## Database Migrations

### Creating a New Migration

```bash
# From host machine
docker-compose exec backend npx prisma migrate dev --name migration_name

# Or enter container
docker-compose exec backend sh
npx prisma migrate dev --name migration_name
```

### Applying Migrations in Production

Migrations are automatically applied on backend startup using `prisma migrate deploy`.

To manually apply:
```bash
docker-compose exec backend npx prisma migrate deploy
```

## Backup and Restore

### Backup Database

```bash
docker-compose exec postgres pg_dump -U postgres digital_trust_marketplace > backup.sql
```

### Restore Database

```bash
docker-compose exec -T postgres psql -U postgres digital_trust_marketplace < backup.sql
```

## Monitoring

### Health Checks

All services have health checks configured:
- PostgreSQL: `pg_isready`
- Backend: HTTP GET `/health`
- Frontend: HTTP GET `/`

### View Service Status

```bash
docker-compose ps
```

## Next Steps

1. Review and update environment variables
2. Run initial database seed
3. Test API endpoints
4. Configure production environment
5. Set up CI/CD pipeline
6. Configure monitoring and alerting

## Support

For issues or questions:
1. Check service logs: `docker-compose logs`
2. Verify environment variables
3. Check Docker and Docker Compose versions
4. Review this guide's troubleshooting section




