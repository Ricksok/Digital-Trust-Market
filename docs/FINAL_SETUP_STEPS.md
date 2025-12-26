# Final Setup Steps

## Current Status
✅ All code changes completed
✅ Migration file created
⏳ Database migration pending (database locked)
⏳ Prisma client regeneration pending

## Steps to Complete Setup

### Step 1: Stop the Dev Server
The database is currently locked because the dev server is running. You need to stop it first.

**Option A: Stop in Terminal**
- Press `Ctrl+C` in the terminal where the dev server is running

**Option B: Stop All Node Processes (if needed)**
```powershell
# Find and stop Node processes
Get-Process node | Stop-Process -Force
```

### Step 2: Apply Migration and Regenerate Prisma Client

**Using npm script (Recommended):**
```bash
cd backend
npm run db:apply-migration
```

**Or manually:**
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

**Or using PowerShell script:**
```powershell
cd backend
.\scripts\apply-migration.ps1
```

### Step 3: Verify TypeScript Compilation

```bash
cd backend
npx tsc --noEmit
```

This should show no errors (or only warnings).

### Step 4: Restart Dev Server

```bash
# From project root
npm run dev

# Or from backend directory
cd backend
npm run dev
```

## What Gets Applied

The migration will add the following models to your database:

1. **EntityRole** - Contextual roles for entities
2. **Auction** - Reverse auction engine
3. **Bid** - Auction bids
4. **GuaranteeRequest** - Guarantee requests
5. **GuaranteeBid** - Guarantee bids
6. **GuaranteeAllocation** - Allocated guarantees
7. **TimeSeriesEvent** - Time-series analytics events
8. **AnalyticsSnapshot** - Analytics snapshots

And extend:
- **User** model with entity fields
- **Project** model with auction and guarantee relations

## Troubleshooting

### Database Still Locked
If you get "database is locked" error:
1. Make sure all Node processes are stopped
2. Wait 2-3 seconds and try again
3. Check if Prisma Studio or other tools are open
4. Close any database viewers/editors

### Migration Already Applied
If migration was already applied:
```bash
npx prisma generate
```

### Need to Reset Database (Development Only)
⚠️ **Warning: This deletes all data!**
```bash
cd backend
npx prisma migrate reset
npm run db:seed
```

## Verification Checklist

After completing the steps:

- [ ] Migration applied successfully
- [ ] Prisma client regenerated
- [ ] TypeScript compilation passes
- [ ] Dev server starts without errors
- [ ] API endpoints respond correctly
- [ ] No TypeScript errors in IDE

## Next Steps After Setup

1. **Test New Endpoints:**
   - `GET /api/auctions` - List auctions
   - `POST /api/auctions` - Create auction
   - `GET /api/guarantees/requests` - List guarantee requests

2. **Test Trust Engine:**
   - `GET /api/trust/:userId` - Get trust scores
   - `GET /api/trust/:userId/explain` - Explain trust score

3. **Build Frontend Components:**
   - Auction listing page
   - Guarantee marketplace page
   - Trust score display components

## Summary

All code is ready! You just need to:
1. Stop the dev server
2. Run `npm run db:apply-migration` in the backend directory
3. Restart the dev server

That's it! 🎉


