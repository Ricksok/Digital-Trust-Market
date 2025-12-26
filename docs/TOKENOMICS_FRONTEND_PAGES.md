# Tokenomics Frontend Pages

## Overview
Created frontend pages for Governance, Staking, and Rewards features of the Tokenomics & DeFi ecosystem.

## Pages Created

### 1. Governance Page (`/governance`)
**Location:** `frontend/app/governance/page.tsx`

**Features:**
- List all governance proposals
- Filter by status (All, Active, Passed, Rejected)
- View proposal details (title, description, votes)
- Vote on active proposals
- Create new proposals (for admins and investors)
- Display voting statistics (Yes/No/Abstain percentages)

**API Client:** `frontend/lib/api/governance.ts`

**Endpoints Used:**
- `GET /api/governance/proposals` - List proposals
- `GET /api/governance/proposals/:id` - Get proposal details
- `POST /api/governance/proposals` - Create proposal
- `POST /api/governance/proposals/:id/vote` - Cast vote

### 2. Staking Page (`/staking`)
**Location:** `frontend/app/staking/page.tsx`

**Features:**
- View active staking pools
- Display pool details (APY, token, min stake, lock period)
- View user's stakes
- Stake tokens in pools
- Unstake unlocked tokens
- Display staking statistics

**Tabs:**
- **Staking Pools:** Browse available pools
- **My Stakes:** View user's active stakes

**API Client:** `frontend/lib/api/staking.ts`

**Endpoints Used:**
- `GET /api/staking/pools` - List staking pools
- `GET /api/staking/stakes` - Get user stakes
- `POST /api/staking/stake` - Stake tokens
- `POST /api/staking/unstake/:id` - Unstake tokens

### 3. Rewards Page (`/rewards`)
**Location:** `frontend/app/rewards/page.tsx`

**Features:**
- View reward distributions
- Display total rewards (claimed, pending, available)
- Filter by status (All, Available, Pending, Claimed)
- Claim available rewards
- View reward history

**API Client:** `frontend/lib/api/rewards.ts`

**Endpoints Used:**
- `GET /api/rewards/rewards` - Get user rewards
- `GET /api/rewards/rewards/:id/totals` - Get total rewards
- `POST /api/rewards/rewards/:id/claim` - Claim reward

## API Clients Created

### 1. Governance API (`frontend/lib/api/governance.ts`)
- `createProposal()` - Create new proposal
- `getProposals()` - List proposals with filters
- `getProposal()` - Get proposal details
- `castVote()` - Vote on proposal
- `executeProposal()` - Execute proposal (admin only)

### 2. Staking API (`frontend/lib/api/staking.ts`)
- `getPools()` - List staking pools
- `createPool()` - Create staking pool (admin only)
- `stake()` - Stake tokens
- `unstake()` - Unstake tokens
- `getUserStakes()` - Get user's stakes

### 3. Rewards API (`frontend/lib/api/rewards.ts`)
- `getUserRewards()` - Get user rewards with filters
- `getTotalRewards()` - Get total reward statistics
- `claimReward()` - Claim a reward

## Navigation

Added links to all three pages in the main navigation:
- Governance
- Staking
- Rewards

**Location:** `frontend/components/Layout.tsx`

## UI Features

All pages include:
- Responsive design
- Loading states
- Error handling
- Authentication checks
- Status badges with color coding
- Date formatting
- Currency formatting
- Filtering and sorting

## Next Steps

To complete the implementation, consider adding:
1. Detail pages for individual proposals, pools, and rewards
2. Create forms for creating proposals and staking
3. Voting interface for proposals
4. Transaction history
5. Charts and analytics for staking/rewards


