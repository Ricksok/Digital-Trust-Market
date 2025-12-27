# Quick Data Generation Guide

## Generate Auctions and Guarantees

To populate the auctions and guarantees pages with dummy data:

### Step 1: Ensure Prisma Client is Generated
```bash
cd backend
npx prisma generate
```

### Step 2: Generate Dummy Data
```bash
cd backend
npm run db:generate-auctions
```

This will create:
- ✅ 5 auctions (2 active, 3 pending)
- ✅ Bids for active auctions
- ✅ 5 guarantee requests (2 with active auctions)
- ✅ Guarantee bids for active auctions

### Step 3: View the Data

**Auctions:**
- Navigate to `/auctions` to see the list
- Click on any auction to see details and place bids

**Guarantees:**
- Navigate to `/guarantees` to see the list
- Click on any guarantee to see details and place bids

**Trust Score:**
- Navigate to `/trust` to see your trust score
- Switch between tabs: Score, History, Explanation

## Alternative: Use API Endpoints

If you're logged in as admin, you can also use:

```bash
# Generate auctions
POST http://localhost:3001/api/demo/generate-auctions
Headers: Authorization: Bearer <token>
Body: { "count": 5 }

# Generate guarantees
POST http://localhost:3001/api/demo/generate-guarantees
Headers: Authorization: Bearer <token>
Body: { "count": 5 }
```

## What Gets Created

### Auctions:
- **Type:** Capital, Guarantee, Supply Contract
- **Status:** ACTIVE (2), PENDING (3)
- **Bids:** 3 bids per active auction
- **Trust Weighting:** Varies by auction

### Guarantees:
- **Type:** Credit Risk, Performance Risk, Contract Assurance
- **Status:** AUCTION_ACTIVE (2), PENDING (3)
- **Bids:** 3 guarantee bids per active auction
- **Layers:** First Loss, Mezzanine, Senior

## Requirements

- ✅ Database migration applied
- ✅ Prisma client generated
- ✅ At least 5 active projects (from seed)
- ✅ At least 5 verified users (from seed)

If you get errors, make sure you've run:
```bash
cd backend
npm run db:seed
```





