# Seed Data: Auctions and Guarantees

## ✅ Added to Seed File

The seed file (`backend/prisma/seed.ts`) now includes dummy data for:

### 1. Auctions (5 auctions)
- **Types:** CAPITAL, GUARANTEE, SUPPLY_CONTRACT (rotating)
- **Status:** 2 ACTIVE, 3 PENDING
- **Features:**
  - Linked to projects
  - Varying trust score requirements (50-70)
  - Varying trust weights (1.0-1.4)
  - Staggered start/end times
  - Active auctions have 3 bids each

### 2. Bids (6 bids total)
- **For Active Auctions:** 3 bids per active auction
- **Features:**
  - Decreasing bid prices (90%, 85%, 80% of base)
  - Trust-weighted effective bids
  - Staggered submission times
  - Linked to verified investors

### 3. Guarantee Requests (5 requests)
- **Types:** CREDIT_RISK, PERFORMANCE_RISK, CONTRACT_ASSURANCE (rotating)
- **Status:** 2 AUCTION_ACTIVE, 3 PENDING
- **Features:**
  - Coverage: 50%, 60%, 70%, 80%, 90%
  - Linked to projects and fundraisers
  - 30-day expiry dates
  - Active requests have guarantee auctions

### 4. Guarantee Auctions (2 auctions)
- **For Active Guarantee Requests**
- **Features:**
  - 7-day duration
  - Trust score requirement: 60
  - Trust weight: 1.2

### 5. Guarantee Bids (6 bids total)
- **For Active Guarantee Auctions:** 3 bids per auction
- **Features:**
  - Multi-layer: FIRST_LOSS, MEZZANINE, SENIOR
  - Decreasing coverage (80%, 70%, 60% of requested)
  - Increasing fees (2.0%, 2.5%, 3.0%)
  - Trust-weighted effective bids
  - Linked to verified investors as guarantors

## Data Relationships

```
Projects (5)
  ├── Auctions (5)
  │     └── Bids (6) [for 2 active auctions]
  └── Guarantee Requests (5)
        ├── Guarantee Auctions (2) [for 2 active requests]
        └── Guarantee Bids (6) [for 2 active auctions]
```

## Running the Seed

```bash
cd backend
npm run db:seed
```

This will:
1. Clear all existing data
2. Create users, projects, investments, etc.
3. Create auctions with bids
4. Create guarantee requests with bids
5. Calculate trust scores for all users

## What You'll See

After seeding, you'll have:
- **5 Auctions:**
  - 2 ACTIVE (with 3 bids each)
  - 3 PENDING (no bids yet)

- **5 Guarantee Requests:**
  - 2 AUCTION_ACTIVE (with guarantee auctions and 3 bids each)
  - 3 PENDING (no auctions yet)

- **Total Bids:**
  - 6 regular auction bids
  - 6 guarantee bids

## Viewing the Data

### Via API:
```bash
# List auctions
GET /api/auctions

# Get auction details
GET /api/auctions/:id

# List guarantee requests
GET /api/guarantees

# Get guarantee request details
GET /api/guarantees/:id
```

### Via Frontend:
- Navigate to `/auctions` to see all auctions
- Navigate to `/guarantees` to see all guarantee requests
- Click on any item to see details and bids

## Notes

- All auctions and guarantees are linked to existing projects
- Bids are created by verified investors
- Trust scores are calculated and used in bid weighting
- Active auctions/guarantees have realistic bid data
- Pending auctions/guarantees are ready for future activation

## Next Steps

After seeding:
1. View auctions at `/auctions`
2. View guarantees at `/guarantees`
3. Place new bids (as an investor)
4. Create new guarantee requests (as a fundraiser)





