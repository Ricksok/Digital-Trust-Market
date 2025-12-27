# Staking, Bids, and Auctions - Workflow Analysis & CRUD Completeness

## Executive Summary

**Overall Status**: ⚠️ **Partially Complete** (~75%)

- **Auctions**: ✅ Core operations complete, missing some CRUD operations
- **Bids**: ✅ Core operations complete, missing update operation
- **Staking**: ✅ Core operations complete, missing pool management CRUD

---

## 1. AUCTIONS - Analysis

### 1.1 Workflow Requirements (from USER_WORKFLOWS.md)

**Buyer Workflow (RAE: Procure Goods/Services)**
1. ✅ Buyer publishes demand notice (specs, budget, milestones)
2. ✅ Platform enforces structured templates
3. ✅ Bids arrive and are scored (price, trust, credentials, guarantee)
4. ⚠️ Buyer awards contract (maker-checker if institutional) - **Partially implemented**
5. ⚠️ Escrow schedule activates - **Not in auction service**
6. ⚠️ Delivery verified; payments released - **Not in auction service**

**Supplier Workflow (RAE: Bid and Execute Contract)**
1. ✅ Supplier views open RAE demand notices
2. ✅ Check eligibility requirements (credentials, trust band, guarantee band)
3. ✅ Submit bid (price + delivery plan + guarantee option)
4. ⚠️ Buyer awards contract - **Partially implemented (closeAuction does this)**
5. ⚠️ GE locks guarantee commitment + escrow schedule - **Not in auction service**
6. ⚠️ Supplier delivers milestones - **Not in auction service**
7. ⚠️ CDSE triggers settlement releases - **Not in auction service**

### 1.2 Current CRUD Operations

#### ✅ CREATE Operations
- `POST /api/auctions` - Create auction ✅
  - **Service**: `createAuction()`
  - **Controller**: `createAuction`
  - **Status**: ✅ Complete
  - **Features**: 
    - Validates timing
    - Supports multiple auction types (CAPITAL, GUARANTEE, SUPPLY_CONTRACT, TRADE_SERVICE)
    - Trust score requirements
    - Metadata support

#### ✅ READ Operations
- `GET /api/auctions` - List auctions ✅
  - **Service**: `getAuctions()`
  - **Controller**: `getAuctions`
  - **Status**: ✅ Complete
  - **Features**:
    - Pagination
    - Filtering (auctionType, status, projectId, date range)
    - Includes project and recent bids

- `GET /api/auctions/:id` - Get auction by ID ✅
  - **Service**: `getAuctionById()`
  - **Controller**: `getAuctionById`
  - **Status**: ✅ Complete
  - **Features**:
    - Includes all bids with bidder info
    - Includes project details

#### ⚠️ UPDATE Operations
- `POST /api/auctions/:id/start` - Start auction ✅
  - **Service**: `startAuction()`
  - **Controller**: `startAuction`
  - **Status**: ✅ Complete
  - **Note**: Changes status from PENDING to ACTIVE

- `POST /api/auctions/:id/close` - Close auction ✅
  - **Service**: `closeAuction()`
  - **Controller**: `closeAuction`
  - **Status**: ✅ Complete
  - **Features**:
    - Determines winners based on clearing method
    - Updates bid statuses (ACCEPTED/REJECTED)
    - Calculates clearing price

- ❌ **MISSING**: `PUT /api/auctions/:id` - Update auction details
  - **Required for**: Editing auction title, description, dates, reserve price
  - **Use Case**: Buyer needs to modify auction before it starts
  - **Priority**: Medium

- ❌ **MISSING**: `POST /api/auctions/:id/extend` - Extend auction end time
  - **Required for**: Extending auction when needed
  - **Use Case**: More time needed for bids
  - **Priority**: Medium

- ❌ **MISSING**: `POST /api/auctions/:id/cancel` - Cancel auction
  - **Required for**: Canceling auctions before they start or during
  - **Use Case**: Buyer cancels procurement
  - **Priority**: High

#### ❌ DELETE Operations
- ❌ **MISSING**: `DELETE /api/auctions/:id` - Delete auction
  - **Required for**: Removing draft auctions
  - **Use Case**: Cleanup of unused auctions
  - **Priority**: Low (soft delete via cancel is better)

### 1.3 Missing Workflow Integrations

1. ❌ **Contract Awarding** - After auction closes, need to:
   - Create contract/order from accepted bid
   - Link to escrow system
   - Trigger guarantee allocation

2. ❌ **Escrow Integration** - Missing:
   - Escrow schedule creation
   - Milestone-based escrow releases

3. ❌ **Maker-Checker** - For institutional buyers:
   - Approval workflow for contract awards
   - Multi-level authorization

4. ❌ **Bid Comparison View** - For buyers:
   - Side-by-side bid comparison
   - Trust band, credential, guarantee scoring display

---

## 2. BIDS - Analysis

### 2.1 Workflow Requirements

**Supplier Workflow**
1. ✅ Submit bid (price + delivery plan + guarantee option)
2. ✅ Check eligibility (trust, credentials)
3. ⚠️ View bid status - **Partially (included in auction)**
4. ✅ Withdraw bid (before auction closes)

### 2.2 Current CRUD Operations

#### ✅ CREATE Operations
- `POST /api/auctions/:id/bids` - Place bid ✅
  - **Service**: `placeBid()`
  - **Controller**: `placeBid`
  - **Status**: ✅ Complete
  - **Features**:
    - Trust score validation
    - Effective bid calculation (price × trustWeight × trustScore)
    - Proxy bidding support
    - Reserve price validation
    - Activity tracking

#### ✅ READ Operations
- ✅ Bids included in `GET /api/auctions/:id`
  - **Status**: ✅ Complete
  - **Features**: All bids with bidder info

- ❌ **MISSING**: `GET /api/bids` - List all user's bids
  - **Required for**: Supplier viewing all their bids across auctions
  - **Use Case**: "My Bids" dashboard
  - **Priority**: High

- ❌ **MISSING**: `GET /api/bids/:id` - Get bid by ID
  - **Required for**: Detailed bid view
  - **Use Case**: View bid details, status, notes
  - **Priority**: Medium

#### ⚠️ UPDATE Operations
- ❌ **MISSING**: `PUT /api/bids/:id` - Update bid
  - **Required for**: Modifying bid before auction closes
  - **Use Case**: Supplier wants to change price or notes
  - **Priority**: Medium
  - **Constraints**: Only if auction is ACTIVE and bid is PENDING

#### ✅ DELETE Operations
- `POST /api/auctions/bids/:bidId/withdraw` - Withdraw bid ✅
  - **Service**: `withdrawBid()`
  - **Controller**: `withdrawBid`
  - **Status**: ✅ Complete
  - **Features**:
    - Ownership validation
    - Status validation (only PENDING bids)
    - Auction status validation

### 2.3 Missing Features

1. ❌ **Bid History** - Track bid modifications
2. ❌ **Bid Notifications** - Notify when bid is accepted/rejected
3. ❌ **Bid Analytics** - Success rate, average bid price, etc.

---

## 3. STAKING - Analysis

### 3.1 Workflow Requirements

**Staking Workflow** (from STATE_ANALYSIS_E2E.md)
```
STAKE_PENDING
    ↓
STAKE_ACTIVE
    ↓
    ├─→ STAKE_LOCKED (in lock period)
    └─→ STAKE_UNLOCKED (lock period ended)
STAKE_UNSTAKING
    ↓
STAKE_UNSTAKED
```

### 3.2 Current CRUD Operations

#### ✅ CREATE Operations
- `POST /api/staking/pools` - Create staking pool ✅
  - **Service**: `createStakingPool()`
  - **Controller**: `createStakingPool`
  - **Status**: ✅ Complete
  - **Features**:
    - APY configuration
    - Min/max stake amounts
    - Lock period
    - Trust score requirements
    - Admin only

- `POST /api/staking/stake` - Stake tokens ✅
  - **Service**: `stake()`
  - **Controller**: `stake`
  - **Status**: ✅ Complete
  - **Features**:
    - Balance validation
    - Trust score validation
    - Token locking
    - Transaction recording
    - Pool total update

#### ✅ READ Operations
- `GET /api/staking/pools` - List staking pools ✅
  - **Service**: `getStakingPools()`
  - **Controller**: `getStakingPools`
  - **Status**: ✅ Complete
  - **Features**:
    - Filter by active status
    - Includes token info
    - Includes stake count
    - Sorted by APY

- `GET /api/staking/stakes/:stakerId?` - Get user stakes ✅
  - **Service**: `getUserStakes()`
  - **Controller**: `getUserStakes`
  - **Status**: ✅ Complete
  - **Features**:
    - Includes pool and token info
    - Calculates pending rewards
    - Sorted by staked date

- ❌ **MISSING**: `GET /api/staking/pools/:id` - Get pool by ID
  - **Required for**: Pool details view
  - **Use Case**: View pool stats, all stakes, APY history
  - **Priority**: Medium

- ❌ **MISSING**: `GET /api/staking/stakes/:stakeId` - Get stake by ID
  - **Required for**: Individual stake details
  - **Use Case**: View stake history, rewards breakdown
  - **Priority**: Low

#### ⚠️ UPDATE Operations
- `POST /api/staking/unstake/:stakeId` - Unstake tokens ✅
  - **Service**: `unstake()`
  - **Controller**: `unstake`
  - **Status**: ✅ Complete
  - **Features**:
    - Lock period validation
    - Reward calculation
    - Token unlocking
    - Reward distribution
    - Pool total update

- ❌ **MISSING**: `PUT /api/staking/pools/:id` - Update staking pool
  - **Required for**: Modifying pool settings (APY, limits)
  - **Use Case**: Admin adjusts pool parameters
  - **Priority**: Medium
  - **Note**: Should not affect existing stakes

- ❌ **MISSING**: `PUT /api/staking/stakes/:stakeId` - Update stake
  - **Required for**: Modifying stake (rare use case)
  - **Use Case**: Admin corrections
  - **Priority**: Low

#### ❌ DELETE Operations
- ❌ **MISSING**: `DELETE /api/staking/pools/:id` - Delete/Deactivate pool
  - **Required for**: Removing inactive pools
  - **Use Case**: Pool cleanup, deactivation
  - **Priority**: Medium
  - **Note**: Should prevent new stakes but allow unstaking

- ❌ **MISSING**: Soft delete for stakes
  - **Required for**: Historical record keeping
  - **Use Case**: Audit trail
  - **Priority**: Low (already tracked via status)

### 3.3 Missing Features

1. ❌ **Reward Claiming** - Separate endpoint to claim rewards without unstaking
2. ❌ **Stake History** - Track all stake/unstake operations
3. ❌ **Pool Analytics** - Total staked, active stakers, reward distribution
4. ❌ **Auto-compound** - Option to automatically reinvest rewards

---

## 4. CRUD Completeness Matrix

| Domain | CREATE | READ | UPDATE | DELETE | Completion |
|--------|--------|------|--------|--------|------------|
| **Auctions** | ✅ | ✅ | ⚠️ Partial | ❌ | 70% |
| **Bids** | ✅ | ⚠️ Partial | ❌ | ✅ | 60% |
| **Staking Pools** | ✅ | ⚠️ Partial | ❌ | ❌ | 50% |
| **Stakes** | ✅ | ✅ | ✅ | N/A* | 90% |

*Stakes use status-based lifecycle (ACTIVE → UNSTAKED) rather than deletion

---

## 5. Missing CRUD Operations Summary

### High Priority (Required for Core Workflows)

1. **Auctions**
   - ❌ `POST /api/auctions/:id/cancel` - Cancel auction
   - ❌ `GET /api/bids` - List user's bids (separate from auction view)

2. **Bids**
   - ❌ `GET /api/bids` - List all user's bids
   - ❌ `GET /api/bids/:id` - Get bid details

3. **Staking**
   - ❌ `GET /api/staking/pools/:id` - Get pool details

### Medium Priority (Important for Admin/Management)

1. **Auctions**
   - ❌ `PUT /api/auctions/:id` - Update auction details
   - ❌ `POST /api/auctions/:id/extend` - Extend auction

2. **Bids**
   - ❌ `PUT /api/bids/:id` - Update bid

3. **Staking**
   - ❌ `PUT /api/staking/pools/:id` - Update pool
   - ❌ `DELETE /api/staking/pools/:id` - Deactivate pool

### Low Priority (Nice to Have)

1. **Auctions**
   - ❌ `DELETE /api/auctions/:id` - Hard delete (use cancel instead)

2. **Bids**
   - ❌ Bid history tracking
   - ❌ Bid analytics

3. **Staking**
   - ❌ `GET /api/staking/stakes/:stakeId` - Get stake details
   - ❌ Reward claiming endpoint
   - ❌ Auto-compound feature

---

## 6. Workflow Integration Gaps

### 6.1 Auction Workflow Gaps

1. ❌ **Contract Creation** - After auction closes:
   ```typescript
   // Missing: Create contract from accepted bid
   POST /api/contracts
   {
     auctionId: string,
     bidId: string,
     milestones: Milestone[]
   }
   ```

2. ❌ **Escrow Integration** - Missing escrow schedule:
   ```typescript
   // Missing: Create escrow from contract
   POST /api/escrow/from-contract
   {
     contractId: string,
     schedule: EscrowSchedule[]
   }
   ```

3. ❌ **Maker-Checker** - For institutional buyers:
   ```typescript
   // Missing: Approval workflow
   POST /api/auctions/:id/award
   {
     bidId: string,
     requiresApproval: boolean
   }
   ```

4. ❌ **Bid Comparison** - For buyers:
   ```typescript
   // Missing: Bid comparison endpoint
   GET /api/auctions/:id/bids/compare
   // Returns: Side-by-side comparison with scoring
   ```

### 6.2 Bid Workflow Gaps

1. ❌ **Bid Notifications** - Missing:
   - Email/notification when bid is accepted
   - Email/notification when bid is rejected
   - Email/notification when auction closes

2. ❌ **Bid Analytics** - Missing:
   - Success rate (accepted/rejected ratio)
   - Average bid price
   - Win rate per auction type

### 6.3 Staking Workflow Gaps

1. ❌ **Reward Claiming** - Missing separate claim endpoint:
   ```typescript
   // Missing: Claim rewards without unstaking
   POST /api/staking/stakes/:stakeId/claim-rewards
   ```

2. ❌ **Stake History** - Missing audit trail:
   ```typescript
   // Missing: Stake operation history
   GET /api/staking/stakes/:stakeId/history
   ```

---

## 7. Implementation Recommendations

### Phase 1: Critical Missing Operations (High Priority)

1. **Auction Cancellation**
   ```typescript
   POST /api/auctions/:id/cancel
   // - Set status to CANCELLED
   // - Reject all pending bids
   // - Notify all bidders
   ```

2. **User Bids Listing**
   ```typescript
   GET /api/bids?userId=xxx&status=xxx
   // - List all bids for a user
   // - Filter by status, auction type
   // - Include auction details
   ```

3. **Pool Details**
   ```typescript
   GET /api/staking/pools/:id
   // - Pool details with stats
   // - List of all stakes
   // - Reward distribution history
   ```

### Phase 2: Workflow Integration (Medium Priority)

1. **Contract Creation from Auction**
   - Create contract service method
   - Link to escrow system
   - Trigger guarantee allocation

2. **Bid Update**
   - Allow bid modification before auction closes
   - Track bid history

3. **Auction Update**
   - Allow editing auction details before it starts
   - Extend auction end time

### Phase 3: Enhancements (Low Priority)

1. **Analytics & Reporting**
   - Bid success rates
   - Staking pool performance
   - Auction completion rates

2. **Advanced Features**
   - Auto-compound for staking
   - Bid notifications
   - Maker-checker workflows

---

## 8. Conclusion

### Current State
- **Core Operations**: ✅ Mostly complete
- **CRUD Completeness**: ⚠️ ~75% complete
- **Workflow Integration**: ⚠️ ~60% complete

### Critical Gaps
1. Missing bid listing endpoint (high priority)
2. Missing auction cancellation (high priority)
3. Missing contract creation workflow (high priority)
4. Missing escrow integration (high priority)

### Next Steps
1. Implement high-priority missing CRUD operations
2. Add workflow integration endpoints
3. Implement notification system
4. Add analytics and reporting

---

**Last Updated**: Current
**Status**: Analysis Complete - Ready for Implementation

