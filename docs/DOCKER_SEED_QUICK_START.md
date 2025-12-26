# Quick Start: Running Seed in Docker

## 🚀 TL;DR

```bash
# From MVP/ directory
docker-compose up -d
docker-compose exec backend npm run db:seed
```

That's it! 🎉

## 📋 Step-by-Step

### 1. Ensure Docker is Running

```bash
# Check Docker is running
docker info
```

### 2. Start All Services

```bash
# From MVP/ directory
docker-compose up -d
```

Wait 30-60 seconds for services to be healthy.

### 3. Run Seed Script

**Windows (PowerShell):**
```powershell
docker-compose exec backend npm run db:seed
```

**Or use the helper script:**
```powershell
.\docker-seed.ps1
```

**Linux/Mac:**
```bash
docker-compose exec backend npm run db:seed
```

**Or use the helper script:**
```bash
./docker-seed.sh
```

### 4. Verify Success

```bash
# Check logs
docker-compose logs backend | tail -50

# Test API
curl http://localhost:3001/health
```

## 🎯 What Gets Seeded

- ✅ 69 Users (admin, investors, fundraisers, end users)
- ✅ 9 Projects (various statuses)
- ✅ 15+ Investments
- ✅ 7+ Auctions
- ✅ 5 Guarantee Requests
- ✅ 4 Tokens with transactions
- ✅ 4 Governance Proposals
- ✅ 3 Staking Pools
- ✅ And much more!

## 🔑 Quick Login

- **Admin**: `admin@marketplace.com` / `admin123`
- **Investor**: `investor1@example.com` / `investor123`
- **Fundraiser**: `fundraiser1@example.com` / `fundraiser123`

## 📚 Full Documentation

See [DOCKER_SEED_GUIDE.md](./DOCKER_SEED_GUIDE.md) for detailed instructions and troubleshooting.

