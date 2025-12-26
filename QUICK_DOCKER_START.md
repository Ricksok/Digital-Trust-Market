# Quick Docker Start Guide

## 🚀 3-Step Setup

### Step 1: Configure Environment
```bash
cp .env.example .env
```

**Edit `.env` and change:**
- `POSTGRES_PASSWORD=your-strong-password`
- `JWT_SECRET=your-32-char-minimum-secret-key`

### Step 2: Start Services
```bash
docker-compose up -d
```

### Step 3: Seed Database
```bash
docker-compose exec backend npm run db:seed
```

## ✅ Done!

Access your services:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 📋 Quick Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Backend shell
docker-compose exec backend sh

# Database shell
docker-compose exec postgres psql -U postgres -d digital_trust_marketplace
```

## 🆘 Need Help?

- Full guide: [DOCKER_SETUP.md](./DOCKER_SETUP.md)
- Migration details: [MIGRATION_TO_DOCKER.md](./MIGRATION_TO_DOCKER.md)




