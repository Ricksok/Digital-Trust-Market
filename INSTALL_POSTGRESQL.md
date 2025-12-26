# Install PostgreSQL - Quick Guide

## Option 1: Download and Install (Recommended)

1. **Download PostgreSQL:**
   - Visit: https://www.postgresql.org/download/windows/
   - Download the installer (latest version, e.g., 15 or 16)

2. **Run the Installer:**
   - Run the downloaded `.exe` file
   - Follow the installation wizard
   - **Important**: Remember the password you set for the `postgres` user
   - Default port: `5432` (keep this)
   - Default locale: `[Default locale]`

3. **After Installation:**
   - PostgreSQL service should start automatically
   - If not, start it from Services (services.msc) or run:
     ```powershell
     Start-Service postgresql-x64-15
     ```

## Option 2: Using Chocolatey (If Installed)

```powershell
# Run as Administrator
choco install postgresql15
```

## Option 3: Using Docker (If Docker is Installed)

```powershell
docker run --name postgres-mvp `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=digital_trust_marketplace `
  -p 5432:5432 `
  -d postgres:15
```

## After Installation

### Step 1: Verify PostgreSQL is Running

```powershell
Get-Service -Name postgresql*
```

### Step 2: Create Database

```powershell
# Connect to PostgreSQL (use the password you set during installation)
psql -U postgres

# In psql, create the database:
CREATE DATABASE digital_trust_marketplace;

# Exit
\q
```

### Step 3: Update .env File

Edit `backend/.env` and update the password:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/digital_trust_marketplace?schema=public"
```

Replace `YOUR_PASSWORD` with the password you set during installation.

### Step 4: Run Setup

```powershell
cd backend
npm run db:migrate
npm run db:seed
```

## Quick Test

After setup, test the connection:
```powershell
cd backend
npm run db:studio
```

This opens Prisma Studio where you can view your data.

## Troubleshooting

### Can't Connect After Installation

1. **Check if service is running:**
   ```powershell
   Get-Service postgresql*
   ```

2. **Start the service:**
   ```powershell
   Start-Service postgresql-x64-15
   ```

3. **Check if port 5432 is in use:**
   ```powershell
   netstat -ano | findstr :5432
   ```

### Forgot Password

1. Edit `pg_hba.conf` (usually in `C:\Program Files\PostgreSQL\15\data\`)
2. Change authentication method from `md5` to `trust` for local connections
3. Restart PostgreSQL service
4. Connect without password: `psql -U postgres`
5. Set new password: `ALTER USER postgres PASSWORD 'newpassword';`
6. Change `pg_hba.conf` back to `md5`
7. Restart service

## Current Configuration

Your `.env` file is set to:
- Username: `postgres`
- Password: `postgres` (⚠️ Update this after installation!)
- Database: `digital_trust_marketplace`
- Port: `5432`


