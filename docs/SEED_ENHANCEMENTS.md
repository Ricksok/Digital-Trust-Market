# Seed Data Enhancements - Comprehensive Testing Coverage

## Overview

The seed file has been significantly enhanced to provide comprehensive test coverage for all system features, use cases, and scenarios.

## Changes Made

### 1. Fixed Route Issues ✅
- **Fixed duplicate route registrations** in `backend/src/index.ts`
- **Improved route structure** for regulatory-reporting and investor-reporting routes
- **Verified all routes** are properly registered and accessible

### 2. Enhanced Seed Data Coverage

#### Additional Auctions
- Added **SUPPLY_CONTRACT** and **TRADE_SERVICE** auction types
- Created auctions with **CLOSED** status (with cleared prices)
- Added **WINNING** and **OUTBID** bid statuses
- Demonstrates auction clearing and winner determination

#### Diverse Investment Scenarios
- Added investments with **RELEASED** status (with escrow contracts)
- Added investments with **REFUNDED** status
- Added investments with **CANCELLED** status
- Created corresponding payments with appropriate statuses
- Demonstrates full investment lifecycle

#### Guarantee Allocations
- Created **ACTIVE** guarantee allocations
- Created **CLAIMED** guarantee allocations (default scenarios)
- Created **EXPIRED** guarantee allocations
- Demonstrates guarantee lifecycle and risk scenarios

#### Token Transactions
- Added **TRANSFER** transactions between users
- Added **MINT** transactions (token creation)
- Added **BURN** transactions (token destruction)
- Demonstrates complete token economy

#### Entity Roles
- Created contextual roles for different contexts:
  - TRANSACTION, INVESTMENT, PROJECT, GUARANTEE, AUCTION
- Different role types:
  - SUPPLIER, CONSUMER, AGGREGATOR, CAPITAL_ISSUER, INVESTOR, GUARANTEE_PROVIDER, SERVICE_PROVIDER
- Demonstrates entity role system

#### Additional Projects
- Created projects with **FUNDED** status
- Created projects with **COMPLETED** status
- Created projects with **CANCELLED** status
- Demonstrates all project lifecycle states

#### Enhanced Governance
- Added more votes across different proposals
- Demonstrates voting patterns (YES, NO, ABSTAIN)
- Shows trust-weighted voting

#### Additional Staking
- Created more staking positions across different pools
- Demonstrates various staking scenarios
- Shows locked and unlocked stakes

#### Analytics Snapshots
- Created time-series analytics snapshots
- Platform-wide metrics over 7 days
- Demonstrates analytics data collection

## Seed Data Summary

### Users (69 total)
- 1 Admin
- 14 Investors (5 Individual, 5 Institutional, 4 Impact Fund)
- 14 Fundraisers (5 SME/Startup, 5 Social Enterprise, 4 Real Estate)
- 40 End Users
  - 10 C2B (5 Individual, 5 Corporate)
  - 10 B2B (5 Traders, 5 Corporates)
  - 20 Trade Exchange (10 Buyers, 10 Sellers)

### Projects
- **9 total projects** (6 initial + 3 additional)
- Statuses: DRAFT, PENDING_APPROVAL, APPROVED, ACTIVE, FUNDED, COMPLETED, CANCELLED
- Various categories: Renewable Energy, Real Estate, Technology, Social Enterprise, Education

### Investments
- **15+ total investments** (varies based on projects)
- Statuses: PENDING, APPROVED, ESCROWED, RELEASED, REFUNDED, CANCELLED
- Various amounts and scenarios

### Auctions
- **7+ total auctions** (5 initial + 2 additional)
- Types: CAPITAL, GUARANTEE, SUPPLY_CONTRACT, TRADE_SERVICE
- Statuses: PENDING, ACTIVE, CLOSED
- Multiple bids with different statuses

### Guarantees
- **5 guarantee requests**
- **3 guarantee allocations**
- Statuses: PENDING, AUCTION_ACTIVE, ALLOCATED, ACTIVE, CLAIMED, EXPIRED

### Tokens
- **4 token types**: BTA-GOV, BTA-REWARD, BTA-UTIL, BTA-GUAR
- **Token balances** for multiple users
- **15+ token transactions** (TRANSFER, MINT, BURN)

### Governance
- **4 governance proposals**
- **15+ governance votes**
- Statuses: PENDING, ACTIVE, PASSED, REJECTED

### Staking
- **3 staking pools** with different APY and lock periods
- **9+ staking positions**
- Various statuses: ACTIVE, UNSTAKED

### Rewards
- **10 reward distributions**
- Types: STAKING, GOVERNANCE, TRANSACTION, REFERRAL
- Statuses: DISTRIBUTED, PENDING, CLAIMED

### Entity Roles
- **20 entity roles** across different contexts
- Demonstrates contextual role assignment

### Analytics
- **7 analytics snapshots** (daily for 7 days)
- Platform-wide metrics

### Trust & Behavior
- **69 trust scores** (all users)
- **69 behavior metrics** (all users)
- **17 readiness metrics** (fundraisers + some investors)

## Testing Scenarios Covered

### ✅ Investment Flow
- Create investment → Payment → Escrow → Release
- Create investment → Payment → Refund
- Create investment → Cancel

### ✅ Auction Flow
- Create auction → Place bids → Close → Determine winners
- Different auction types (CAPITAL, GUARANTEE, SUPPLY_CONTRACT, TRADE_SERVICE)
- Trust-weighted bidding
- Bid withdrawal

### ✅ Guarantee Flow
- Request guarantee → Auction → Allocation → Active
- Guarantee claims (default scenarios)
- Guarantee expiration

### ✅ Token Economy
- Token transfers
- Token minting
- Token burning
- Token balances and locking

### ✅ Governance
- Create proposal → Vote → Execute
- Different proposal types
- Trust-weighted voting

### ✅ Staking
- Create pool → Stake → Earn rewards → Unstake
- Different lock periods
- Reward calculation

### ✅ Project Lifecycle
- Draft → Pending Approval → Approved → Active → Funded → Completed
- Project cancellation

### ✅ Trust Engine
- Trust score calculation
- Behavior metrics tracking
- Readiness metrics
- Trust events

## Usage

To reset and reseed the database:

```bash
cd backend
npm run db:seed
```

Or with Docker:

```bash
docker-compose exec backend npm run db:seed
```

## Demo Credentials

All credentials remain the same as documented in `docs/LOGIN_CREDENTIALS.md`:

- **Admin**: `admin@marketplace.com` / `admin123`
- **Investor**: `investor1@example.com` / `investor123`
- **Fundraiser**: `fundraiser1@example.com` / `fundraiser123`
- **C2B Consumer**: `alice.njoroge@example.com` / `consumer123`
- **B2B Trader**: `kevin.maina@trading.com` / `trader123`
- **Trade Buyer**: `victor.onyango@trade.com` / `buyer123`
- **Trade Seller**: `faith.maina@trade.com` / `seller123`

## Next Steps

The enhanced seed data now provides comprehensive coverage for:
- ✅ All user types and roles
- ✅ All project statuses
- ✅ All investment statuses
- ✅ All auction types and statuses
- ✅ Guarantee lifecycle
- ✅ Token economy
- ✅ Governance system
- ✅ Staking system
- ✅ Entity roles
- ✅ Analytics data

You can now test all features and scenarios with realistic, diverse data!

