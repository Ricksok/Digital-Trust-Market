# Tokenomics Seed Data

## Overview
Added comprehensive seed data for the Tokenomics & DeFi ecosystem, including tokens, governance proposals, staking pools, and reward distributions.

## Data Created

### 1. Tokens (4 tokens)
- **BTA-GOV** (OptiChain Governance Token)
  - Initial Supply: 10,000,000
  - Circulating: 7,000,000 (70%)
  - Type: Governance

- **BTA-REWARD** (OptiChain Reward Token)
  - Initial Supply: 5,000,000
  - Circulating: 3,500,000 (70%)
  - Type: Reward

- **BTA-UTIL** (OptiChain Utility Token)
  - Initial Supply: 20,000,000
  - Circulating: 14,000,000 (70%)
  - Type: Utility

- **BTA-GUAR** (OptiChain Guarantee Token)
  - Initial Supply: 3,000,000
  - Circulating: 2,100,000 (70%)
  - Type: Guarantee

**Token Balances:**
- Distributed to first 5 users
- Decreasing balances (10% to 2.5% of initial supply)
- 80% available, 20% locked

### 2. Governance Proposals (4 proposals)
1. **Increase Minimum Trust Score for New Projects**
   - Type: POLICY_CHANGE
   - Status: ACTIVE
   - Votes: 900 YES, 400 NO, 200 ABSTAIN

2. **Update Platform Fee Structure**
   - Type: PARAMETER_UPDATE
   - Status: PASSED
   - Votes: 1600 YES, 500 NO, 400 ABSTAIN
   - Executed

3. **Allocate Funds for Marketing Campaign**
   - Type: FUND_ALLOCATION
   - Status: REJECTED
   - Votes: 600 YES, 1000 NO, 200 ABSTAIN

4. **Adjust Token Inflation Rate**
   - Type: TOKENOMICS_CHANGE
   - Status: PENDING
   - No votes yet

**Votes:**
- 5 votes per active/passed proposal
- Mix of YES, NO, and ABSTAIN
- Voting power based on token holdings
- Trust-weighted voting

### 3. Staking Pools (3 pools)
1. **Governance Token Staking**
   - APY: 12%
   - Min Stake: 1,000 BTA-GOV
   - Lock Period: 30 days

2. **High Yield Staking Pool**
   - APY: 18%
   - Min Stake: 5,000 BTA-GOV
   - Lock Period: 90 days

3. **Flexible Staking Pool**
   - APY: 8%
   - Min Stake: 500 BTA-GOV
   - Lock Period: None (flexible)

**Stakes:**
- 3 stakes per pool
- Staggered staking dates
- Active and unlocked stakes
- Rewards calculated based on APY

### 4. Reward Distributions (10 rewards)
- **Types:** STAKING, GOVERNANCE, TRANSACTION, REFERRAL
- **Statuses:**
  - 3 DISTRIBUTED (available to claim)
  - 3 PENDING
  - 4 CLAIMED
- **Amounts:** 100-600 tokens
- **Recipients:** 10 different users
- **Trust Scores:** 60-105

## Frontend Updates

### Rewards Page
- Updated status from "AVAILABLE" to "DISTRIBUTED"
- Fixed date fields (removed `claimableAt`, use `distributedAt`)
- Updated filter buttons
- Added null checks for totals

### Staking Page
- Updated status colors (removed "UNLOCKED", use "UNSTAKING")
- Fixed date field (use `lockedUntil` instead of `unlockAt`)
- Updated rewards field (use `totalRewardsEarned` instead of `rewardsEarned`)

### API Interfaces
- Updated `RewardDistribution` interface
- Updated `Stake` interface
- Aligned with actual schema fields

## Running the Seed

```bash
cd backend
npm run db:seed
```

## Summary

After seeding:
- ✅ 4 tokens with balances
- ✅ 4 governance proposals with votes
- ✅ 3 staking pools with stakes
- ✅ 10 reward distributions

All pages should now display data correctly!




