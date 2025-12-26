# Database Migration Instructions

## Current Status
The database migration for the new models (EntityRole, Auction, Bid, GuaranteeRequest, GuaranteeBid, GuaranteeAllocation, TimeSeriesEvent, AnalyticsSnapshot) has been created but not yet applied due to database lock.

## Migration Name
`add_entity_auction_guarantee_analytics_models`

## Steps to Apply Migration

### Option 1: Stop Dev Server and Run Migration
1. Stop the backend dev server (if running)
2. Run the migration:
   ```bash
   cd backend
   npm run db:migrate
   ```
3. Restart the dev server

### Option 2: Apply Migration Manually
If the migration file was created, you can apply it manually:

```bash
cd backend
npx prisma migrate deploy
```

### Option 3: Reset Database (Development Only)
⚠️ **Warning: This will delete all data!**

```bash
cd backend
npx prisma migrate reset
npm run db:seed
```

## What the Migration Adds

### New Models:
1. **EntityRole** - Contextual roles for entities
2. **Auction** - Reverse auction engine
3. **Bid** - Auction bids
4. **GuaranteeRequest** - Guarantee requests
5. **GuaranteeBid** - Guarantee bids
6. **GuaranteeAllocation** - Allocated guarantees
7. **TimeSeriesEvent** - Time-series analytics events
8. **AnalyticsSnapshot** - Analytics snapshots

### Modified Models:
- **User** - Added entity fields and new relations
- **Project** - Added auction and guarantee request relations

## Verification

After migration, verify the schema:

```bash
cd backend
npx prisma studio
```

Or check the migration status:

```bash
npx prisma migrate status
```

## Troubleshooting

### Database Locked Error
If you get "database is locked":
1. Stop all processes using the database (dev server, Prisma Studio, etc.)
2. Wait a few seconds
3. Try the migration again

### Migration Already Exists
If the migration file exists but wasn't applied:
```bash
npx prisma migrate deploy
```

### Need to Create Migration Again
If you need to recreate the migration:
```bash
npx prisma migrate dev --name add_entity_auction_guarantee_analytics_models
```


