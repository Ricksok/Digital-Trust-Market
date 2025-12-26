# Quick Start Guide

## Step 1: Install Dependencies

```bash
npm run install:all
```

This will install dependencies for:
- Root project
- Backend
- Frontend
- Smart Contracts

## Step 2: Set Up Database

1. Create a PostgreSQL database:
```sql
CREATE DATABASE digital_trust_marketplace;
```

2. Configure backend environment:
```bash
cd backend
# Copy .env.example to .env and configure DATABASE_URL
```

3. Generate Prisma client and run migrations:
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Step 3: Configure Environment Variables

### Backend
Create `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/digital_trust_marketplace"
JWT_SECRET="your-secret-key-here"
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Frontend
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Contracts (Optional for now)
Create `contracts/.env`:
```env
PRIVATE_KEY=your-private-key
```

## Step 4: Start Development Servers

```bash
# From root directory
npm run dev
```

Or start individually:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Step 5: Verify Installation

1. Backend should be running at: http://localhost:3001
   - Health check: http://localhost:3001/health

2. Frontend should be running at: http://localhost:3000

## Troubleshooting

### Prisma Client Not Generated
```bash
cd backend
npm run db:generate
```

### Port Already in Use
Change the PORT in `backend/.env` or kill the process using the port.

### Module Not Found Errors
```bash
# Reinstall dependencies
npm run install:all
```

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

## Next Steps

1. Deploy smart contracts (see `contracts/README.md`)
2. Configure external services (KYC, payment gateway)
3. Start building features!


