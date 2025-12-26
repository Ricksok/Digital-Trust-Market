# Quick Database Setup

## Current Status

✅ `.env` file created in `backend/` directory
⚠️  PostgreSQL server needs to be running

## Quick Setup Steps

### Step 1: Start PostgreSQL

**Option A: If PostgreSQL is installed as a service:**
```powershell
# Run as Administrator
Start-Service postgresql-x64-14
# Or try: postgresql-x64-15, postgresql-x64-16
```

**Option B: If you have PostgreSQL installed but service not running:**
```powershell
# Find PostgreSQL installation
Get-ChildItem "C:\Program Files\PostgreSQL" -ErrorAction SilentlyContinue

# Start manually (replace 15 with your version)
& "C:\Program Files\PostgreSQL\15\bin\pg_ctl.exe" start -D "C:\Program Files\PostgreSQL\15\data"
```

**Option C: Install PostgreSQL:**
- Download: https://www.postgresql.org/download/windows/
- Install with default settings
- Remember the password you set for the `postgres` user

### Step 2: Create Database

```powershell
# Connect to PostgreSQL (use your password when prompted)
psql -U postgres

# In psql prompt, run:
CREATE DATABASE digital_trust_marketplace;

# Exit
\q
```

### Step 3: Update .env File

Edit `backend/.env` and update the password:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/digital_trust_marketplace?schema=public"
```

Replace `YOUR_PASSWORD` with the password you set during PostgreSQL installation.

### Step 4: Run Migrations and Seed

```powershell
cd backend
npm run db:migrate
npm run db:seed
```

## Alternative: Use SQLite (No Installation Required)

If you don't want to install PostgreSQL right now, you can use SQLite:

### Step 1: Update Prisma Schema

Edit `backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### Step 2: Update .env

Edit `backend/.env`:
```env
DATABASE_URL="file:./dev.db"
```

### Step 3: Run Setup

```powershell
cd backend
npm run db:generate
npm run db:migrate
npm run db:seed
```

**Note**: SQLite is fine for development/testing but PostgreSQL is recommended for production.

## Verify Setup

After setup, verify everything works:

```powershell
cd backend
npm run db:studio
```

This opens Prisma Studio at http://localhost:5555 where you can browse your data.

## Current .env Configuration

Your `.env` file has been created with:
- Default username: `postgres`
- Default password: `postgres` (⚠️ CHANGE THIS!)
- Database: `digital_trust_marketplace`
- Port: `5432`

**Update the password in `.env` to match your PostgreSQL installation!**


