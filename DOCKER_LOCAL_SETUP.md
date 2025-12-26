# Docker Local Setup - Complete Guide

## 🎯 Goal

Run the entire system locally in Docker:
- ✅ PostgreSQL Database
- ✅ Backend API Service
- ✅ Frontend Application

All services containerized and ready for future Terraform/IaC deployment.

## ✅ Pre-requisites

- Docker Desktop installed and running
- Docker Compose v2.0+
- Ports 3000, 3001, 5432 available

## 📋 Step-by-Step Setup

### Step 1: Create Environment File

```bash
# From MVP/ directory
# Create .env file (if not exists)
cp .env.example .env  # Or create manually
```

**Edit `.env` and set:**
```env
POSTGRES_PASSWORD=your-strong-password-here
JWT_SECRET=your-32-char-minimum-secret-key-here
```

### Step 2: Verify Project Structure

Ensure you have:
```
MVP/
├── docker-compose.yml
├── .env
├── backend/
│   ├── Dockerfile
│   ├── prisma/
│   └── src/
└── frontend/
    ├── Dockerfile
    └── app/
```

### Step 3: Start PostgreSQL

```bash
docker-compose up -d postgres
```

Wait ~10 seconds for PostgreSQL to initialize.

### Step 4: Create Database Migrations

**Option A: Using Docker (Recommended)**
```bash
# Create fresh PostgreSQL migrations
docker-compose run --rm backend sh -c "npx prisma migrate dev --name init_postgresql"
```

**Option B: Using Prisma DB Push (Development)**
```bash
# Push schema directly (for development)
docker-compose run --rm backend sh -c "npx prisma db push"
```

### Step 5: Start All Services

```bash
docker-compose up -d
```

This will:
1. Build backend and frontend images
2. Start PostgreSQL (if not running)
3. Start Backend (waits for PostgreSQL, runs migrations)
4. Start Frontend (waits for backend)

### Step 6: Seed Database

```bash
docker-compose exec backend npm run db:seed
```

### Step 7: Verify Services

```bash
# Check all services are running
docker-compose ps

# Check backend health
curl http://localhost:3001/health

# Or visit in browser:
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001/health
```

## 🔧 Troubleshooting

### Backend Won't Start

**Check logs:**
```bash
docker-compose logs backend
```

**Common issues:**
- TypeScript errors: Should be fixed now ✅
- Database connection: Check PostgreSQL is running
- Migrations: May need to create manually

### Frontend Won't Build

**Check logs:**
```bash
docker-compose logs frontend
```

**Common issues:**
- SWC binary: Fixed with libc6-compat ✅
- Build errors: Check Next.js configuration

### Database Connection Issues

**Test connection:**
```bash
docker-compose exec postgres psql -U postgres -d digital_trust_marketplace -c "SELECT 1;"
```

**Check environment:**
```bash
docker-compose exec backend env | grep DATABASE_URL
```

### Migration Issues

**If migrations fail:**
```bash
# Use db push for development
docker-compose exec backend npx prisma db push

# Or create migration manually
docker-compose exec backend npx prisma migrate dev --name init_postgresql
```

## 📊 Service Status

### Check Service Health

```bash
# All services
docker-compose ps

# Specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Service URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Backend Health**: http://localhost:3001/health
- **PostgreSQL**: localhost:5432

## 🛠️ Development Workflow

### Start Development Mode

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

This enables:
- Hot reload for backend
- Hot reload for frontend
- Faster iteration

### Rebuild Services

```bash
# Rebuild all
docker-compose build

# Rebuild specific service
docker-compose build backend
docker-compose build frontend
```

### Access Services

```bash
# Backend shell
docker-compose exec backend sh

# Database shell
docker-compose exec postgres psql -U postgres -d digital_trust_marketplace

# Frontend shell
docker-compose exec frontend sh
```

## 🔄 Common Operations

### Restart Services
```bash
docker-compose restart
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Volumes (⚠️ Deletes Data)
```bash
docker-compose down -v
```

### View Logs
```bash
docker-compose logs -f
```

### Run Database Migrations
```bash
docker-compose exec backend npx prisma migrate deploy
```

### Seed Database
```bash
docker-compose exec backend npm run db:seed
```

## 📁 Project Structure for IaC

The project is structured for future Terraform deployment:

```
MVP/
├── backend/              # Backend service
├── frontend/             # Frontend service
├── infrastructure/       # Future: Terraform configs
│   └── terraform/
├── docker-compose.yml    # Local orchestration
└── .env                  # Environment variables
```

## ✅ Verification Checklist

Before considering setup complete:

- [ ] All services running (`docker-compose ps`)
- [ ] Backend health check passes (`curl http://localhost:3001/health`)
- [ ] Frontend accessible (http://localhost:3000)
- [ ] Database migrations applied
- [ ] Database seeded with initial data
- [ ] No errors in logs

## 🚀 Next Steps

1. **Verify everything works**: Test all endpoints
2. **Review logs**: Ensure no errors
3. **Test functionality**: Login, create projects, etc.
4. **Prepare for Terraform**: Structure is ready for IaC

## 📚 Related Documentation

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Complete project structure
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Detailed Docker documentation
- [BACKEND_ENV_SETUP.md](./BACKEND_ENV_SETUP.md) - Backend environment setup



