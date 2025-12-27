# Quick .env Setup Guide

## ✅ Prisma Status
- ✅ **Already updated to PostgreSQL!** (`provider = "postgresql"`)
- ✅ Migration lock updated to PostgreSQL
- ⚠️ Need fresh migrations (existing ones are SQLite-specific)

## 📍 .env File Locations

### 1. Root .env (MVP/.env)
**Purpose:** Docker Compose configuration
**Required for:** Docker setup

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
POSTGRES_DB=digital_trust_marketplace
POSTGRES_PORT=5432
JWT_SECRET=your-32-char-minimum-secret-key
# ... other Docker variables
```

### 2. Backend .env (MVP/backend/.env)
**Purpose:** Backend application configuration
**Location:** `backend/.env` (same directory as package.json)

**For Docker:**
```env
# DATABASE_URL is automatically set by docker-compose.yml
# Don't set it here for Docker!

NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

**For Local Development (without Docker):**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/digital_trust_marketplace?schema=public
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

## 🔧 How DATABASE_URL Works in Docker

In `docker-compose.yml`, the DATABASE_URL is automatically constructed:

```yaml
backend:
  environment:
    DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public
```

**Key Points:**
- Uses service name `postgres` as hostname (Docker networking)
- Reads from root `.env` file variables
- **No need to set DATABASE_URL in backend/.env for Docker**

## 📝 Your Current Backend .env

If you have a `backend/.env` with 8 lines, it should look like:

```env
DATABASE_URL=...          # For Docker: Not needed (auto-set)
NODE_ENV=...             # ✅ Keep this
PORT=...                 # ✅ Keep this
JWT_SECRET=...           # ✅ Keep this
JWT_EXPIRES_IN=...       # ✅ Keep this
FRONTEND_URL=...         # ✅ Keep this
# ... other variables
```

**For Docker:** You can remove or comment out `DATABASE_URL` since it's auto-set.

## 🚀 Next Steps

1. **Ensure root `.env` exists** with PostgreSQL credentials
2. **Update backend `.env`** (remove DATABASE_URL if using Docker)
3. **Start PostgreSQL**: `docker-compose up -d postgres`
4. **Create migrations**: `docker-compose run --rm backend sh -c "npx prisma migrate dev --name init_postgresql"`
5. **Start all services**: `docker-compose up -d`

## ✅ Verification

Check Prisma is using PostgreSQL:
```bash
# View schema
cat backend/prisma/schema.prisma | grep provider
# Should show: provider = "postgresql"

# Check migration lock
cat backend/prisma/migrations/migration_lock.toml
# Should show: provider = "postgresql"
```

Both are already set! ✅




