# Docker Seed Guide - Running Database Seed in Docker Environment

## 🐳 Docker Environment Overview

Your system runs in Docker with three main services:

### Services Architecture

```
┌─────────────────────────────────────────────────┐
│  Docker Network: mvp-network                    │
│                                                 │
│  ┌──────────────┐    ┌──────────────┐          │
│  │  PostgreSQL  │◄───│   Backend    │          │
│  │  Port: 5432  │    │  Port: 3001  │          │
│  └──────────────┘    └──────┬───────┘          │
│                              │                  │
│                              ▼                  │
│                       ┌──────────────┐          │
│                       │   Frontend   │          │
│                       │  Port: 3000  │          │
│                       └──────────────┘          │
└─────────────────────────────────────────────────┘
```

### Service Details

1. **PostgreSQL** (`mvp-postgres`)
   - Database: `digital_trust_marketplace`
   - User: `postgres` (configurable)
   - Port: `5432` (mapped to host)
   - Data: Persisted in Docker volume `postgres_data`

2. **Backend** (`mvp-backend`)
   - Node.js/Express API
   - Port: `3001` (mapped to host)
   - Auto-runs migrations on startup
   - Contains seed script: `prisma/seed.ts`

3. **Frontend** (`mvp-frontend`)
   - Next.js application
   - Port: `3000` (mapped to host)
   - Connects to backend API

## 🌱 Running the Seed Script

### Method 1: Manual Seed (Recommended for First Time)

This is the most common method - run seed manually after containers are up.

#### Step 1: Start All Services

```bash
# From project root (MVP/)
docker-compose up -d
```

Wait for all services to be healthy (about 30-60 seconds).

#### Step 2: Verify Services Are Running

```bash
# Check container status
docker-compose ps

# You should see:
# - mvp-postgres: Up (healthy)
# - mvp-backend: Up (healthy)
# - mvp-frontend: Up
```

#### Step 3: Run Seed Script

```bash
# Run seed from host machine (recommended)
docker-compose exec backend npm run db:seed
```

**What this does:**
- Executes `npm run db:seed` inside the backend container
- Runs `tsx prisma/seed.ts`
- Seeds database with all test data

#### Step 4: Verify Seed Success

```bash
# Check backend logs
docker-compose logs backend | tail -50

# You should see:
# ✅ Created 69 users
# ✅ Created 9 projects
# ✅ Created 15+ investments
# ... etc
```

### Method 2: Auto-Seed on Startup

If you want the database to automatically seed when the backend container starts:

#### Step 1: Update docker-compose.yml

Add `SEED_DB=true` to backend environment:

```yaml
backend:
  environment:
    # ... existing vars ...
    SEED_DB: "true"  # Add this line
```

#### Step 2: Restart Backend

```bash
docker-compose restart backend
```

**Note:** The `docker-entrypoint.sh` script checks for `SEED_DB=true` and runs seed automatically.

### Method 3: Interactive Container Shell

For debugging or running multiple commands:

```bash
# Enter backend container
docker-compose exec backend sh

# Inside container, you can run:
npm run db:seed
npm run db:reset      # Reset and reseed
npx prisma studio     # Open Prisma Studio
npx prisma migrate dev # Create new migration

# Exit container
exit
```

## 🔄 Resetting and Reseeding

To completely reset the database and reseed:

### Option 1: Reset via Script (if available)

```bash
docker-compose exec backend npm run db:reset
```

### Option 2: Manual Reset

```bash
# Stop all services
docker-compose down

# Remove database volume (⚠️ WARNING: Deletes all data!)
docker volume rm mvp_postgres_data

# Start services (will create fresh database)
docker-compose up -d

# Run migrations (auto-runs on startup, but you can verify)
docker-compose exec backend npx prisma migrate deploy

# Seed database
docker-compose exec backend npm run db:seed
```

## 📋 Complete First-Time Setup Flow

Here's the complete flow for setting up everything from scratch:

```bash
# 1. From MVP/ directory, create .env file
cp .env.example .env
# Edit .env and set POSTGRES_PASSWORD and JWT_SECRET

# 2. Start only PostgreSQL first
docker-compose up -d postgres

# 3. Wait for PostgreSQL (10-15 seconds)
# Check it's ready:
docker-compose exec postgres pg_isready -U postgres

# 4. Create database migrations (one-time, if not exists)
docker-compose run --rm backend sh -c "npx prisma migrate dev --name init_postgresql"
# OR if migrations already exist:
docker-compose run --rm backend sh -c "npx prisma migrate deploy"

# 5. Start all services
docker-compose up -d

# 6. Wait for services to be healthy (30-60 seconds)
docker-compose ps

# 7. Seed the database
docker-compose exec backend npm run db:seed

# 8. Verify everything works
curl http://localhost:3001/health
# Visit http://localhost:3000 in browser
```

## 🐛 Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Verify DATABASE_URL in backend container
docker-compose exec backend printenv DATABASE_URL
```

### Issue: "Prisma Client not generated"

**Solution:**
```bash
# Generate Prisma Client
docker-compose exec backend npx prisma generate
```

### Issue: "Seed script fails with module not found"

**Solution:**
```bash
# Rebuild backend container
docker-compose build backend

# Restart backend
docker-compose restart backend

# Try seed again
docker-compose exec backend npm run db:seed
```

### Issue: "Trust service not available" warning

**Solution:**
This is normal on first seed. The trust service needs the compiled code:
```bash
# Rebuild backend to ensure dist/ folder exists
docker-compose build backend

# Restart backend
docker-compose restart backend

# Run seed again
docker-compose exec backend npm run db:seed
```

### Issue: "Port already in use"

**Solution:**
```bash
# Check what's using the port
# Windows PowerShell:
netstat -ano | findstr :3001
netstat -ano | findstr :5432

# Stop conflicting services or change ports in .env
```

## 🔍 Verifying Seed Data

### Check via Backend API

```bash
# Get all users (requires auth token)
curl http://localhost:3001/api/users

# Get all projects
curl http://localhost:3001/api/projects

# Health check
curl http://localhost:3001/health
```

### Check via Prisma Studio

```bash
# Open Prisma Studio in browser
docker-compose exec backend npx prisma studio

# Then visit: http://localhost:5555
```

### Check via PostgreSQL Directly

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d digital_trust_marketplace

# Inside psql:
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "Project";
SELECT COUNT(*) FROM "Investment";
\q
```

## 📊 Expected Seed Results

After successful seeding, you should have:

- ✅ **69 Users** (1 admin, 14 investors, 14 fundraisers, 40 end users)
- ✅ **9 Projects** (various statuses)
- ✅ **15+ Investments** (various statuses)
- ✅ **7+ Auctions** (various types and statuses)
- ✅ **5 Guarantee Requests** (with allocations)
- ✅ **4 Tokens** (BTA-GOV, BTA-REWARD, BTA-UTIL, BTA-GUAR)
- ✅ **15+ Token Transactions**
- ✅ **4 Governance Proposals** (with votes)
- ✅ **3 Staking Pools** (with positions)
- ✅ **10 Reward Distributions**
- ✅ **20+ Entity Roles**
- ✅ **7 Analytics Snapshots**
- ✅ **69 Trust Scores**
- ✅ **69 Behavior Metrics**

## 🚀 Quick Reference Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend

# Run seed
docker-compose exec backend npm run db:seed

# Rebuild and restart
docker-compose build backend && docker-compose restart backend

# Check service status
docker-compose ps

# Access backend container shell
docker-compose exec backend sh

# Access PostgreSQL shell
docker-compose exec postgres psql -U postgres -d digital_trust_marketplace
```

## 📝 Environment Variables

Key environment variables for Docker:

```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-strong-password
POSTGRES_DB=digital_trust_marketplace
POSTGRES_PORT=5432

# Backend
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:password@postgres:5432/digital_trust_marketplace?schema=public
JWT_SECRET=your-32-char-minimum-secret
SEED_DB=false  # Set to "true" for auto-seed

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## ✅ Success Checklist

After running seed, verify:

- [ ] All containers are running (`docker-compose ps`)
- [ ] Backend health check passes (`curl http://localhost:3001/health`)
- [ ] Seed script completed without errors
- [ ] Can login with demo credentials (see `docs/LOGIN_CREDENTIALS.md`)
- [ ] Projects visible in frontend
- [ ] Database has expected record counts

## 🎯 Next Steps

After successful seeding:

1. **Test Login**: Use credentials from `docs/LOGIN_CREDENTIALS.md`
2. **Explore Features**: Test all features with the seeded data
3. **Development**: Make changes and test
4. **Reseed**: Run `docker-compose exec backend npm run db:seed` anytime to reset data

---

**Need Help?** Check the logs:
```bash
docker-compose logs backend | tail -100
```

