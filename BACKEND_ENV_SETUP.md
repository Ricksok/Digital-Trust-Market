# Backend .env File Setup Guide

## 📍 Where to Place .env File

### For Docker (Recommended)
**Location:** `backend/.env` (in the backend directory, not inside the container)

**Important:** 
- The `backend/.env` file is **mounted as a volume** in Docker
- However, `DATABASE_URL` is **automatically set** by `docker-compose.yml` from the root `.env` file
- You can still use `backend/.env` for other backend-specific variables

### For Local Development (Without Docker)
**Location:** `backend/.env` (same location)

## 🔧 How It Works in Docker

### Environment Variable Flow:

```
Root .env
  ↓
docker-compose.yml (reads POSTGRES_USER, POSTGRES_PASSWORD, etc.)
  ↓
Backend Container (DATABASE_URL is constructed automatically)
```

### In docker-compose.yml:
```yaml
backend:
  environment:
    DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-digital_trust_marketplace}?schema=public
```

This means:
- ✅ `DATABASE_URL` is **automatically set** from root `.env` variables
- ✅ No need to manually set `DATABASE_URL` in `backend/.env` for Docker
- ✅ The backend container uses the PostgreSQL service name `postgres` as hostname

## 📝 Backend .env File Structure

### For Docker Usage:
```env
# DATABASE_URL is set automatically by docker-compose.yml
# Don't set it here for Docker!

# Server Configuration
NODE_ENV=production
PORT=3001

# JWT Configuration (can override root .env)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Other backend-specific configs...
```

### For Local Development (Without Docker):
```env
# Database Configuration (for local PostgreSQL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/digital_trust_marketplace?schema=public

# Server Configuration
NODE_ENV=development
PORT=3001

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## ✅ Prisma Configuration

### Current Status:
- ✅ **Schema**: Already updated to PostgreSQL (`provider = "postgresql"`)
- ✅ **Migration Lock**: Updated to PostgreSQL
- ⚠️ **Migrations**: Need to create fresh PostgreSQL migrations

### Prisma Schema (backend/prisma/schema.prisma):
```prisma
datasource db {
  provider = "postgresql"  // ✅ Already set!
  url      = env("DATABASE_URL")
}
```

## 🚀 Setup Steps

### Step 1: Create Root .env (if not exists)
```bash
# From MVP/ directory
cp .env.example .env
# Edit .env and set:
# - POSTGRES_PASSWORD
# - JWT_SECRET
```

### Step 2: Create Backend .env (Optional for Docker)
```bash
# From MVP/backend/ directory
cp .env.example .env
# For Docker: DATABASE_URL is auto-set, just configure other vars
# For Local: Set DATABASE_URL to local PostgreSQL
```

### Step 3: Start Docker Services
```bash
# From MVP/ directory
docker-compose up -d postgres
# Wait for PostgreSQL to be ready
docker-compose up -d
```

## 🔍 Verification

### Check if .env is being read:
```bash
# Inside backend container
docker-compose exec backend env | grep DATABASE_URL
```

### Check Prisma connection:
```bash
# Inside backend container
docker-compose exec backend npx prisma db pull
```

## 📋 Summary

1. **Root `.env`**: Contains Docker Compose variables (POSTGRES_USER, POSTGRES_PASSWORD, etc.)
2. **Backend `.env`**: Contains backend-specific configs (JWT_SECRET, etc.)
3. **DATABASE_URL in Docker**: Automatically constructed from root `.env` variables
4. **Prisma**: Already configured for PostgreSQL ✅
5. **Next Step**: Create fresh PostgreSQL migrations

## 🎯 Quick Answer

**Where to place backend .env?**
- **Location**: `backend/.env` (in the backend directory)
- **For Docker**: DATABASE_URL is auto-set, just configure other variables
- **For Local Dev**: Set DATABASE_URL to your local PostgreSQL connection string

**Prisma Update?**
- ✅ Already updated to PostgreSQL!
- ⚠️ Just need to create fresh migrations (existing ones are SQLite-specific)




