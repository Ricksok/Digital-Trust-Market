# Tokenomics & DeFi Ecosystem Implementation

## Overview

This document describes the implementation of the Tokenomics & DeFi Ecosystem based on the updated architecture diagram. The system includes four token types, governance mechanisms, staking pools, and reward distribution.

## Token Types

### 1. BTA-GOV (Governance Token)
- **Purpose:** Governance voting and DAO participation
- **Initial Supply:** 1 billion tokens
- **Max Supply:** 1 billion (fixed)
- **Use Cases:**
  - Creating governance proposals
  - Voting on proposals
  - Weighted voting based on holdings and trust score

### 2. BTA-REWARD (Rewards Token)
- **Purpose:** Incentivizing platform participation
- **Initial Supply:** 0 (minted as needed)
- **Max Supply:** Unlimited
- **Inflation Rate:** 5% annual
- **Use Cases:**
  - Transaction rewards
  - Learning/course completion rewards
  - Governance participation rewards
  - Referral rewards

### 3. BTA-UTIL (Utility & Staking Token)
- **Purpose:** Platform access and staking
- **Initial Supply:** 500 million tokens
- **Max Supply:** 2 billion (max)
- **Use Cases:**
  - Staking in pools
  - Platform access fees
  - Utility functions

### 4. BTA-GUAR (Guarantee Token)
- **Purpose:** Guarantee marketplace collateral
- **Initial Supply:** 0 (minted per guarantee)
- **Max Supply:** Unlimited
- **Use Cases:**
  - Collateralized guarantees
  - Guarantee allocation tokens
  - Risk coverage tokens

## Database Models

### Core Models
1. **Token** - Token definitions and supply tracking
2. **TokenBalance** - Entity token balances (available, locked)
3. **TokenTransaction** - All token transfers, mints, burns
4. **GovernanceProposal** - DAO proposals
5. **GovernanceVote** - Votes on proposals (trust-weighted)
6. **StakingPool** - Staking pool configurations
7. **Stake** - Individual staking positions
8. **RewardDistribution** - Reward records
9. **GuaranteeTokenAllocation** - Guarantee token allocations

## Services

### Token Service (`token.service.ts`)
- `initializeTokens()` - Initialize all token types
- `getToken()` - Get token by symbol or type
- `getBalance()` - Get entity balance for a token
- `getAllBalances()` - Get all balances for an entity
- `transfer()` - Transfer tokens between entities
- `mint()` - Mint new tokens
- `burn()` - Burn tokens
- `lock()` - Lock tokens (for staking/escrow)
- `unlock()` - Unlock tokens
- `getTransactionHistory()` - Get transaction history

### Governance Service (`governance.service.ts`)
- `createProposal()` - Create a governance proposal
- `castVote()` - Cast a vote (trust-weighted)
- `getProposal()` - Get proposal details
- `listProposals()` - List proposals with filters
- `updateProposalVotes()` - Update vote counts and status
- `executeProposal()` - Execute a passed proposal (admin)

### Staking Service (`staking.service.ts`)
- `createStakingPool()` - Create a new staking pool (admin)
- `stake()` - Stake tokens in a pool
- `unstake()` - Unstake tokens
- `calculateStakingRewards()` - Calculate pending rewards
- `distributeStakingRewards()` - Distribute rewards
- `getStakingPools()` - List available pools
- `getUserStakes()` - Get user's staking positions

### Reward Service (`reward.service.ts`)
- `distributeReward()` - Distribute reward tokens
- `claimReward()` - Mark reward as claimed
- `getUserRewards()` - Get user's reward history
- `getTotalRewards()` - Get total rewards by token
- `rewardTransaction()` - Reward for transaction completion
- `rewardLearning()` - Reward for course completion
- `rewardGovernance()` - Reward for governance participation

## API Endpoints

### Token Endpoints (`/api/tokens`)
- `GET /tokens/:identifier` - Get token info
- `POST /tokens/initialize` - Initialize tokens (admin)
- `GET /balances/:entityId?` - Get all balances
- `GET /balances/:entityId/:tokenId` - Get specific balance
- `POST /transfer` - Transfer tokens
- `GET /transactions/:entityId?` - Get transaction history

### Governance Endpoints (`/api/governance`)
- `POST /proposals` - Create proposal
- `GET /proposals` - List proposals
- `GET /proposals/:proposalId` - Get proposal details
- `POST /proposals/:proposalId/vote` - Cast vote
- `POST /proposals/:proposalId/execute` - Execute proposal (admin)

### Staking Endpoints (`/api/staking`)
- `POST /pools` - Create staking pool (admin)
- `GET /pools` - List staking pools
- `POST /stake` - Stake tokens
- `POST /unstake/:stakeId` - Unstake tokens
- `GET /stakes/:stakerId?` - Get user stakes

### Reward Endpoints (`/api/rewards`)
- `GET /rewards/:recipientId?` - Get user rewards
- `GET /rewards/:recipientId/totals` - Get total rewards
- `POST /rewards/:rewardId/claim` - Claim reward

## Trust Integration

All tokenomics features integrate with the Trust Engine:

1. **Governance Voting:** Votes are weighted by trust score
   - `weight = votingPower * (trustScore / 100)`

2. **Staking:** Trust score requirements for pools
   - Pools can set `minTrustScore` requirement
   - Trust score recorded at stake time

3. **Rewards:** Trust score affects reward eligibility
   - Higher trust = potentially higher rewards
   - Trust score recorded at reward distribution

## Integration Points

### With Guarantee Marketplace
- BTA-GUAR tokens minted per guarantee allocation
- Tokens locked as collateral
- Tokens burned on guarantee release

### With Reverse Auctions
- BTA-UTIL tokens for auction participation
- Trust-weighted bidding affects token requirements

### With Smart Contracts
- Token transfers recorded on blockchain
- Transaction hashes stored for auditability

### With Analytics Engine
- Token transactions recorded in time-series store
- Token metrics in analytics snapshots

## Setup Instructions

### 1. Initialize Tokens
```bash
# As admin, initialize all token types
POST /api/tokens/initialize
```

### 2. Create Staking Pools
```bash
# As admin, create staking pools
POST /api/staking/pools
Body: {
  "tokenId": "...",
  "name": "BTA-UTIL Staking Pool",
  "apy": 12.5,
  "minStakeAmount": 1000,
  "lockPeriod": 30
}
```

### 3. Distribute Initial Tokens
Tokens can be distributed via:
- Direct minting to users
- Reward distribution
- Airdrops (future feature)

## Next Steps

1. **Frontend Pages:**
   - Token wallet/balances page
   - Governance proposals page
   - Staking pools page
   - Rewards dashboard

2. **Smart Contract Integration:**
   - Deploy token contracts
   - Bridge on-chain/off-chain balances
   - Record transactions on blockchain

3. **Advanced Features:**
   - Token swaps
   - Liquidity pools
   - Yield farming
   - NFT rewards

## Migration Required

After adding these models, run:
```bash
cd backend
npx prisma migrate dev --name add_tokenomics
npx prisma generate
```

Then initialize tokens:
```bash
# Use API endpoint or create a script
POST /api/tokens/initialize
```


