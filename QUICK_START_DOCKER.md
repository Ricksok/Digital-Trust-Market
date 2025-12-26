# Quick Start: Docker Setup

## 🚀 TL;DR - First Time

```bash
# 1. From MVP/ directory
cp .env.example .env
# Edit .env: Set POSTGRES_PASSWORD and JWT_SECRET

# 2. Start PostgreSQL
docker-compose up -d postgres

# 3. Create migrations (one-time)
docker-compose run --rm backend sh -c "npx prisma migrate dev --name init_postgresql"

# 4. Start everything
docker-compose up -d

# 5. Seed database
docker-compose exec backend npm run db:seed
```

## 🚀 TL;DR - After First Time

```bash
# From MVP/ directory
docker-compose up -d
```

That's it! Migrations run automatically.

## 📍 Where to Run Commands

**All docker-compose commands from:** `MVP/` (project root)

**Project structure:**
```
MVP/                    ← Run docker-compose here ✅
├── docker-compose.yml
├── backend/
└── frontend/
```

## ✅ What's Already Done

- ✅ Prisma schema: PostgreSQL
- ✅ Migration lock: PostgreSQL
- ✅ Docker Compose: Configured
- ✅ Dockerfiles: Created
- ⚠️ **Need:** Fresh PostgreSQL migrations (one-time)

## 🔍 Verify It Works

```bash
# Check services
docker-compose ps

# Test backend
curl http://localhost:3001/health

# Visit frontend
# http://localhost:3000
```

## 📚 Full Guide

See [DOCKER_FIRST_RUN.md](./DOCKER_FIRST_RUN.md) for detailed instructions.


