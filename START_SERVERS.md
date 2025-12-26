# Starting the Application

## Prerequisites

Before starting, ensure you have:

1. **PostgreSQL Database Running**
   - Install PostgreSQL if not already installed
   - Start the PostgreSQL service
   - Create a database: `digital_trust_marketplace`

2. **Environment Variables Configured**
   - `backend/.env` - Database connection and API keys
   - `frontend/.env.local` - API URL

## Quick Start

### Option 1: Start Everything (Recommended)

```bash
# From project root
npm run dev
```

This starts both backend and frontend concurrently.

### Option 2: Start Individually

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on: http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on: http://localhost:3000

## Database Setup

### 1. Create Database

```sql
CREATE DATABASE digital_trust_marketplace;
```

### 2. Configure Connection

Edit `backend/.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/digital_trust_marketplace?schema=public"
```

### 3. Run Migrations

```bash
cd backend
npm run db:migrate
```

### 4. Seed Dummy Data

```bash
cd backend
npm run db:seed
```

## Verify Everything is Running

1. **Backend Health Check:**
   - Open: http://localhost:3001/health
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Frontend:**
   - Open: http://localhost:3000
   - Should show the homepage

3. **API Test:**
   - Open: http://localhost:3001/api/projects
   - Should return list of projects (after seeding)

## Troubleshooting

### Database Connection Error

If you see: `Can't reach database server at localhost:5432`

**Solution:**
1. Check if PostgreSQL is running:
   ```bash
   # Windows
   Get-Service -Name postgresql*
   
   # Or check Task Manager for postgres processes
   ```

2. Start PostgreSQL service:
   ```bash
   # Windows (as Administrator)
   Start-Service postgresql-x64-14
   ```

3. Verify connection:
   ```bash
   psql -U postgres -h localhost -p 5432
   ```

### Port Already in Use

If port 3000 or 3001 is already in use:

**Solution:**
1. Find the process:
   ```bash
   # Windows
   netstat -ano | findstr :3001
   ```

2. Kill the process:
   ```bash
   taskkill /PID <PID> /F
   ```

3. Or change the port in `.env` files

### Prisma Client Not Generated

If you see Prisma errors:

**Solution:**
```bash
cd backend
npm run db:generate
```

## Demo Credentials

After seeding, you can login with:

- **Admin**: admin@marketplace.com / admin123
- **Investor**: investor1@example.com / investor123
- **Fundraiser**: fundraiser1@example.com / fundraiser123

## Next Steps

1. Start PostgreSQL database
2. Run migrations: `cd backend && npm run db:migrate`
3. Seed data: `cd backend && npm run db:seed`
4. Start servers: `npm run dev` (from root)
5. Open http://localhost:3000 in your browser


