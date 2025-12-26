# Migration Troubleshooting Guide

## Current Status

✅ **PostgreSQL is running** in Docker
✅ **Database connection works** (verified)
✅ **Prisma schema** is configured for PostgreSQL
⚠️ **Migration creation** has issues with Prisma engine in Docker

## Issues Encountered

1. **TypeScript compilation errors** in backend (blocks production build)
2. **Prisma engine error** in Docker Alpine environment
3. **Authentication issues** when running from host machine

## Solutions

### Option 1: Fix TypeScript Errors First (Recommended)

The backend has TypeScript errors that need to be fixed before building:

**Errors found:**
- `auth.service.ts(183,5)`: Type mismatch
- `governance.service.ts`: Multiple type errors
- `reward.service.ts`: Missing function references
- `staking.service.ts`: Variable redeclaration errors

**Fix these first**, then migrations will work.

### Option 2: Use Prisma Migrate Deploy (Production Mode)

Instead of `migrate dev`, use `migrate deploy` which doesn't require TypeScript compilation:

```bash
# From MVP/ directory
docker-compose run --rm backend sh -c "npx prisma migrate deploy"
```

But this requires existing migrations. We need to create them first.

### Option 3: Manual Migration Creation

1. **Backup old migrations** (they're SQLite-specific):
   ```bash
   cd backend/prisma/migrations
   mkdir backup_sqlite_migrations
   move 2025* backup_sqlite_migrations/
   ```

2. **Create fresh migration** using Prisma Studio or manual SQL

3. **Or use Prisma's introspection**:
   ```bash
   cd backend
   $env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/digital_trust_marketplace?schema=public"
   npx prisma db pull
   npx prisma migrate dev --name init_postgresql
   ```

### Option 4: Use Prisma DB Push (Development)

For development, you can push schema directly without migrations:

```bash
# From backend/ directory
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/digital_trust_marketplace?schema=public"
npx prisma db push
```

Then create a baseline migration:
```bash
npx prisma migrate dev --create-only --name baseline
```

## Quick Fix: Check Backend .env

The backend `.env` file might have an incorrect DATABASE_URL. Check:

```bash
# View backend/.env
cat backend/.env | Select-String "DATABASE_URL"
```

**For Docker**: Remove or comment out DATABASE_URL in `backend/.env` since it's auto-set by docker-compose.yml.

## Recommended Next Steps

1. **Fix TypeScript errors** in backend services
2. **Verify backend/.env** doesn't override DATABASE_URL
3. **Try migration again** using one of the options above

## Alternative: Start Services Without Migrations

You can start services and handle migrations manually:

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Connect and create tables manually, or
# Fix TypeScript errors first, then retry migrations
```



