# Database Setup Guide

## Quick Setup

### Option 1: Using PostgreSQL (Recommended)

#### Step 1: Install PostgreSQL (if not installed)

Download and install from: https://www.postgresql.org/download/windows/

Or use Chocolatey:
```powershell
choco install postgresql
```

#### Step 2: Start PostgreSQL Service

```powershell
# Check if PostgreSQL service exists
Get-Service -Name postgresql*

# Start PostgreSQL service (as Administrator)
Start-Service postgresql-x64-14
# Or try: postgresql-x64-15, postgresql-x64-16, etc.
```

#### Step 3: Create Database

```powershell
# Connect to PostgreSQL
psql -U postgres

# In psql, run:
CREATE DATABASE digital_trust_marketplace;

# Exit psql
\q
```

#### Step 4: Update .env File

Edit `backend/.env` and update the DATABASE_URL:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/digital_trust_marketplace?schema=public"
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

#### Step 5: Run Migrations

```bash
cd backend
npm run db:migrate
npm run db:seed
```

### Option 2: Using SQLite (Quick Demo - No Installation Required)

If you don't have PostgreSQL, you can use SQLite for quick testing:

#### Step 1: Update Prisma Schema

Edit `backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

#### Step 2: Update .env

Edit `backend/.env`:
```env
DATABASE_URL="file:./dev.db"
```

#### Step 3: Run Migrations

```bash
cd backend
npm run db:migrate
npm run db:seed
```

**Note**: SQLite has limitations. For production, use PostgreSQL.

### Option 3: Using Docker (If Docker is Installed)

```bash
# Start PostgreSQL in Docker
docker run --name postgres-mvp -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=digital_trust_marketplace -p 5432:5432 -d postgres:15

# Then run migrations
cd backend
npm run db:migrate
npm run db:seed
```

## Troubleshooting

### PostgreSQL Service Not Found

If you can't find the PostgreSQL service:

1. **Check if PostgreSQL is installed:**
   ```powershell
   Get-Command psql
   ```

2. **Find PostgreSQL installation:**
   ```powershell
   Get-ChildItem "C:\Program Files\PostgreSQL" -ErrorAction SilentlyContinue
   ```

3. **Manual start:**
   ```powershell
   # Find the postgres.exe path and run:
   & "C:\Program Files\PostgreSQL\15\bin\pg_ctl.exe" start -D "C:\Program Files\PostgreSQL\15\data"
   ```

### Connection Refused

If you get "Can't reach database server":

1. **Check if PostgreSQL is running:**
   ```powershell
   Get-Process -Name postgres -ErrorAction SilentlyContinue
   ```

2. **Check port 5432:**
   ```powershell
   netstat -ano | findstr :5432
   ```

3. **Verify connection:**
   ```powershell
   psql -U postgres -h localhost -p 5432
   ```

### Wrong Password

If authentication fails:

1. **Reset PostgreSQL password:**
   - Edit `pg_hba.conf` (usually in `C:\Program Files\PostgreSQL\15\data\`)
   - Change `md5` to `trust` for local connections
   - Restart PostgreSQL service
   - Connect and set password: `ALTER USER postgres PASSWORD 'newpassword';`
   - Change `pg_hba.conf` back to `md5`
   - Restart service again

### Database Already Exists

If database already exists:

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Drop and recreate (WARNING: Deletes all data)
DROP DATABASE IF EXISTS digital_trust_marketplace;
CREATE DATABASE digital_trust_marketplace;
```

## Quick Test

After setup, test the connection:

```bash
cd backend
npm run db:studio
```

This opens Prisma Studio at http://localhost:5555 where you can view and edit data.

## Default Credentials

The `.env` file has been created with default values:
- Username: `postgres`
- Password: `postgres` (change this!)
- Database: `digital_trust_marketplace`
- Port: `5432`

**IMPORTANT**: Update the password in `.env` to match your PostgreSQL installation!


