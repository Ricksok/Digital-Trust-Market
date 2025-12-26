# PostgreSQL Migration Guide

## ⚠️ Critical: Migration Status

**Current Situation:**
- ✅ Prisma schema updated to PostgreSQL
- ✅ `migration_lock.toml` updated to PostgreSQL
- ⚠️ **Existing migrations are SQLite-specific** - they need to be regenerated

## 🔄 Migration Strategy

Since we're switching from SQLite to PostgreSQL, we have two options:

### Option 1: Fresh Start (Recommended for Development)

This creates a clean PostgreSQL database with fresh migrations:

1. **Remove old SQLite migrations** (they won't work with PostgreSQL):
   ```bash
   cd backend/prisma/migrations
   # Backup if needed, then remove old migrations
   # Keep only migration_lock.toml (already updated)
   ```

2. **Create fresh PostgreSQL migration**:
   ```bash
   cd backend
   npx prisma migrate dev --name init_postgresql
   ```

3. **This will:**
   - Create a new migration based on current schema
   - Generate PostgreSQL-compatible SQL
   - Update the database

### Option 2: Keep History (If you have important migration history)

If you need to preserve migration history:

1. **Create a baseline migration**:
   ```bash
   cd backend
   npx prisma migrate dev --create-only --name baseline_postgresql
   ```

2. **Manually edit the migration SQL** to match PostgreSQL syntax

3. **Apply the migration**:
   ```bash
   npx prisma migrate deploy
   ```

## 🐳 Docker Setup

### First Time Setup with Docker

1. **Create `.env` file** (if not exists):
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with strong passwords**:
   ```env
   POSTGRES_PASSWORD=your-strong-password-here
   JWT_SECRET=your-32-char-minimum-secret-key
   ```

3. **Start PostgreSQL only** (to create migrations):
   ```bash
   docker-compose up -d postgres
   ```

4. **Wait for PostgreSQL to be ready**:
   ```bash
   docker-compose exec postgres pg_isready -U postgres
   ```

5. **Create fresh migrations** (from your host machine):
   ```bash
   cd backend
   # Set DATABASE_URL for local connection
   $env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/digital_trust_marketplace?schema=public"
   npx prisma migrate dev --name init_postgresql
   ```

6. **Or use Docker to create migrations**:
   ```bash
   # Start backend container temporarily
   docker-compose run --rm backend sh
   # Inside container:
   npx prisma migrate dev --name init_postgresql
   exit
   ```

7. **Now start all services**:
   ```bash
   docker-compose up -d
   ```

### Automated Approach (Recommended)

The docker-compose.yml is configured to:
1. Wait for PostgreSQL to be ready
2. Run `prisma migrate deploy` (applies existing migrations)
3. Generate Prisma Client
4. Start the application

**However**, if migrations don't exist yet, you need to create them first (see Option 1 above).

## 📋 Step-by-Step: First Docker Run

### Step 1: Prepare Environment
```bash
# From project root (MVP directory)
cp .env.example .env
# Edit .env and set POSTGRES_PASSWORD and JWT_SECRET
```

### Step 2: Create Fresh Migrations (One-time)

**Option A: Using Docker (Recommended)**
```bash
# Start only PostgreSQL
docker-compose up -d postgres

# Wait for it to be ready (about 10 seconds)
Start-Sleep -Seconds 10

# Create migration using Docker
docker-compose run --rm backend sh -c "
  npx prisma migrate dev --name init_postgresql
"
```

**Option B: Using Local Prisma (if installed)**
```bash
cd backend
# Set DATABASE_URL
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/digital_trust_marketplace?schema=public"
npx prisma migrate dev --name init_postgresql
```

### Step 3: Start All Services
```bash
# From project root
docker-compose up -d
```

### Step 4: Seed Database
```bash
docker-compose exec backend npm run db:seed
```

### Step 5: Verify
- Frontend: http://localhost:3000
- Backend: http://localhost:3001/health
- Database: `docker-compose exec postgres psql -U postgres -d digital_trust_marketplace`

## 🔍 Verification

### Check Migration Status
```bash
docker-compose exec backend npx prisma migrate status
```

### Check Database Connection
```bash
docker-compose exec backend npx prisma db pull
```

### View Database Schema
```bash
docker-compose exec backend npx prisma studio
# Opens at http://localhost:5555
```

## 🚨 Troubleshooting

### "Migration not found" Error
If you get migration errors:
```bash
# Reset migrations (WARNING: Deletes data!)
docker-compose down -v  # Removes volumes
docker-compose up -d postgres
# Then create fresh migration (Step 2 above)
```

### "Provider mismatch" Error
Ensure `migration_lock.toml` says `provider = "postgresql"` (already fixed)

### "Database does not exist" Error
PostgreSQL container creates the database automatically, but if it doesn't:
```bash
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE digital_trust_marketplace;"
```

## 📁 Project Structure

```
MVP/                          ← Run docker-compose from here
├── docker-compose.yml        ← Main compose file
├── .env                      ← Environment variables
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     ← PostgreSQL schema ✅
│   │   ├── migrations/       ← PostgreSQL migrations (to be created)
│   │   └── seed.ts           ← Seed script
│   └── Dockerfile
└── frontend/
    └── Dockerfile
```

## ✅ Checklist Before Running

- [ ] `.env` file created with strong passwords
- [ ] `migration_lock.toml` says `provider = "postgresql"` ✅
- [ ] `schema.prisma` uses `provider = "postgresql"` ✅
- [ ] Fresh migrations created for PostgreSQL
- [ ] Docker Desktop is running
- [ ] Ports 3000, 3001, 5432 are available

## 🎯 Quick Start Command

After migrations are created:

```bash
# From MVP/ directory
docker-compose up -d
docker-compose exec backend npm run db:seed
```

That's it! 🚀


