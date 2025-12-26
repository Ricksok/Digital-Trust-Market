# Docker First Run Guide

## 🎯 Quick Answer

**Yes, you can run `docker-compose up -d` from the project root (`MVP/` directory), BUT you need to create PostgreSQL migrations first.**

## 📍 Project Structure

```
MVP/                          ← Run docker-compose from HERE ✅
├── docker-compose.yml        ← Main compose file
├── .env                      ← Environment variables (create this)
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     ← ✅ Updated to PostgreSQL
│   │   ├── migrations/       ← ⚠️ Need fresh PostgreSQL migrations
│   │   └── seed.ts
│   └── Dockerfile
└── frontend/
    └── Dockerfile
```

## ⚠️ Critical: Migration Status

**Current State:**
- ✅ Prisma schema: PostgreSQL
- ✅ Migration lock: PostgreSQL  
- ❌ **Existing migrations are SQLite-specific** - Need fresh ones!

## 🚀 Complete First-Time Setup

### Step 1: Create Environment File

```bash
# From MVP/ directory
cp .env.example .env
```

**Edit `.env` and change:**
```env
POSTGRES_PASSWORD=your-strong-password-here
JWT_SECRET=your-32-char-minimum-secret-key-here
```

### Step 2: Start PostgreSQL Only

```bash
# From MVP/ directory
docker-compose up -d postgres
```

Wait ~10 seconds for PostgreSQL to initialize.

### Step 3: Create Fresh PostgreSQL Migrations

**Option A: Using Docker (Recommended)**
```bash
# From MVP/ directory
docker-compose run --rm backend sh -c "
  npx prisma migrate dev --name init_postgresql
"
```

**Option B: Using Local Prisma**
```bash
cd backend
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/digital_trust_marketplace?schema=public"
npx prisma migrate dev --name init_postgresql
```

**Option C: Using Helper Script**
```bash
cd backend
.\scripts\create-postgresql-migration.ps1
```

### Step 4: Start All Services

```bash
# From MVP/ directory
docker-compose up -d
```

This will:
1. ✅ Start PostgreSQL (already running)
2. ✅ Start Backend (waits for PostgreSQL, runs migrations, starts app)
3. ✅ Start Frontend

### Step 5: Seed Database

```bash
docker-compose exec backend npm run db:seed
```

### Step 6: Verify Everything Works

```bash
# Check services
docker-compose ps

# Check backend health
curl http://localhost:3001/health

# Or visit in browser:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001/health
```

## 🔄 Subsequent Runs

After the first run, you can simply:

```bash
# From MVP/ directory
docker-compose up -d
```

Migrations will be applied automatically on backend startup.

## 📋 What Happens on `docker-compose up -d`

### PostgreSQL Service
- Starts PostgreSQL 15 container
- Creates database `digital_trust_marketplace`
- Exposes port 5432
- Data persisted in Docker volume

### Backend Service
1. Waits for PostgreSQL to be healthy
2. Runs `prisma migrate deploy` (applies migrations)
3. Runs `prisma generate` (generates Prisma Client)
4. Starts Express server on port 3001

### Frontend Service
1. Waits for backend
2. Builds Next.js app (if needed)
3. Starts on port 3000

## 🐛 Troubleshooting

### "No migrations found" Error

**Solution:** You need to create migrations first (Step 3 above)

### "Provider mismatch" Error

**Solution:** Already fixed - `migration_lock.toml` is set to PostgreSQL

### "Database connection failed"

**Solution:** 
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### "Port already in use"

**Solution:** Change ports in `.env` or stop conflicting services

## ✅ Verification Checklist

Before running `docker-compose up -d`:

- [ ] `.env` file exists with strong passwords
- [ ] Docker Desktop is running
- [ ] Ports 3000, 3001, 5432 are available
- [ ] PostgreSQL migrations created (Step 3)
- [ ] `migration_lock.toml` says `provider = "postgresql"` ✅
- [ ] `schema.prisma` says `provider = "postgresql"` ✅

## 🎯 One-Liner Setup (After First Run)

Once migrations exist, future runs are simple:

```bash
docker-compose up -d && docker-compose exec backend npm run db:seed
```

## 📚 Related Documentation

- [POSTGRESQL_MIGRATION_GUIDE.md](./POSTGRESQL_MIGRATION_GUIDE.md) - Detailed migration guide
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Complete Docker documentation
- [QUICK_DOCKER_START.md](./QUICK_DOCKER_START.md) - Quick reference


