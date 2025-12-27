# RBAC Integration Guide

## Current System Analysis

### What You Have Now

1. **Basic Authentication**
   - JWT-based authentication
   - `authenticate` middleware
   - Token refresh mechanism

2. **Simple Role-Based Authorization**
   - `authorize()` middleware
   - Role stored as string in User model
   - Manual role checks in controllers

3. **EntityRole Model**
   - Contextual roles for transactions
   - Already supports context-based access

### What's Missing

1. ❌ Permission system
2. ❌ Fine-grained access control
3. ❌ Role-permission mapping
4. ❌ Permission audit trail
5. ❌ Dynamic permission assignment

## Proposed RBAC Architecture

### Design Principles

1. **Separation of Concerns**
   - Roles = "Who" (ADMIN, INVESTOR, FUNDRAISER)
   - Permissions = "What" (projects.create, investments.view)

2. **Backward Compatibility**
   - Existing `authorize()` middleware still works
   - Gradual migration path

3. **Flexibility**
   - Multiple roles per user
   - Contextual permissions
   - Time-bound access

4. **Auditability**
   - All permission checks logged
   - Track who accessed what

## Implementation Files Created

### 1. Database Schema
**File**: `backend/prisma/schema-rbac.prisma`

**Models**:
- `Permission` - What can be done
- `Role` - Who can do it
- `RolePermission` - Maps roles to permissions
- `UserRole` - Assigns roles to users
- `PermissionAudit` - Audit trail

**To Add**: Copy models from `schema-rbac.prisma` to end of `schema.prisma`

### 2. Core Service
**File**: `backend/src/services/rbac.service.ts`

**Functions**:
- `hasPermission()` - Check single permission
- `hasAnyPermission()` - Check multiple (OR)
- `hasAllPermissions()` - Check multiple (AND)
- `getUserPermissions()` - Get all user permissions
- `getUserRoles()` - Get all user roles
- `assignRole()` - Assign role to user
- `removeRole()` - Remove role from user
- `logPermissionCheck()` - Audit logging

### 3. Middleware
**File**: `backend/src/middleware/rbac.middleware.ts`

**Middleware**:
- `requirePermission()` - Require specific permission
- `requireAnyPermission()` - Require any of multiple
- `requireAllPermissions()` - Require all of multiple
- `requireOwnership()` - Check resource ownership
- `authorize()` - Backward compatible role check

### 4. Seed Script
**File**: `backend/src/scripts/seed-rbac.ts`

**What it does**:
- Creates default permissions
- Creates default roles
- Maps permissions to roles
- Assigns roles to existing users

## Integration Steps

### Step 1: Add Models to Schema

```bash
# Option 1: Manual copy
# Copy models from backend/prisma/schema-rbac.prisma to end of backend/prisma/schema.prisma

# Option 2: Append (Windows PowerShell)
Get-Content backend\prisma\schema-rbac.prisma | Add-Content backend\prisma\schema.prisma
```

**Also update User model**:
```prisma
model User {
  // ... existing fields ...
  userRoles UserRole[] // Add this line
}
```

### Step 2: Create Migration

```bash
cd backend
npx prisma migrate dev --name add_rbac_system
npx prisma generate
```

### Step 3: Seed Default Data

```bash
cd backend
npx tsx src/scripts/seed-rbac.ts
```

### Step 4: Update Routes (Gradual)

**Before**:
```typescript
router.post('/projects', authenticate, authorize('ADMIN', 'FUNDRAISER'), controller.create);
```

**After**:
```typescript
import { requirePermission } from '../middleware/rbac.middleware';

router.post('/projects', authenticate, requirePermission('projects.create'), controller.create);
```

## Permission Naming Convention

**Format**: `{resource}.{action}` or `{engine}.{resource}.{action}`

**Examples**:
- `projects.create` - Legacy format
- `tee.trade.create` - Trade Execution Engine
- `rae.notice.view` - Reverse Auction Engine
- `ge.escrow.view.own` - Guarantee Engine
- `see.issuance.publish` - Securities Exchange Engine
- `cdse.settlement.confirm` - Centralized Digital Settlement Engine
- `rre.dashboard.view` - Regulatory Reporting Engine
- `ire.impact.read` - Impact Reporting Engine

**Resource Categories**:
- **Auth**: `auth.login`, `auth.refresh`
- **Profile**: `profile.view.own`, `profile.update.own`
- **TEE** (Trade Execution Engine): `tee.listings.view`, `tee.trade.*`, `tee.contract.*`, `tee.aggregate.*`
- **RAE** (Reverse Auction Engine): `rae.notice.*`, `rae.bid.*`, `rae.award.*`
- **GE** (Guarantee Engine): `ge.escrow.*`, `ge.sponsor.*`
- **SEE** (Securities Exchange Engine): `see.issuance.*`, `see.offerings.*`, `see.portfolio.*`, `see.secondary.*`, `see.market.*`, `see.surveillance.*`
- **CDSE** (Centralized Digital Settlement Engine): `cdse.settlement.*`
- **RRE** (Regulatory Reporting Engine): `rre.dashboard.*`, `rre.reports.*`
- **IRE** (Impact Reporting Engine): `ire.portfolio.*`, `ire.impact.*`
- **API**: `api.order.*`, `api.positions.*`
- **Co-op**: `coop.members.*`
- **SACCO**: `sacco.members.*`, `sacco.suitability.*`
- **Settlement**: `settlement.instructions.*`

**Wildcards**:
- `projects.*` - All project permissions
- `reports.institutional.*` - All institutional report permissions
- `*.*` - All permissions (Super Admin)

**See `USER_WORKFLOWS.md` for complete workflow-based permission mappings.**

## Default Role-Permission Mapping

### ADMIN (Super User)
- `*.*` - All permissions

### Workflow-Based Roles (BarterTrade Africa)

#### Shared Permissions (All Roles)
- `auth.login`, `auth.refresh`
- `profile.view.own`, `profile.update.own`
- `permissions.view.own`

#### RETAIL_TRADER (TEE: Buy/Sell Goods)
- Shared permissions
- `tee.listings.view` - Browse marketplace
- `tee.trade.create` - Place orders
- `tee.trade.view.own` - View own trades
- `ge.escrow.view.own` - View escrow status

#### SUPPLIER (RAE: Bid and Execute Contract)
- Shared permissions
- `rae.notice.view` - View demand notices
- `rae.bid.create` - Submit bids
- `rae.bid.view.own` - View own bids
- `tee.contract.view.own` - View contracts

#### BUYER (RAE: Procure Goods/Services)
- Shared permissions
- `rae.notice.create` - Publish demand notices
- `rae.bid.review` - Review bids
- `rae.award.execute` - Award contracts
- `rae.notice.view` - View notices
- `ge.escrow.manage` - Manage escrow (institution-only)

#### COOP_ADMIN (Aggregation + Sponsorship)
- Shared permissions
- `coop.members.manage` - Manage co-op members
- `tee.aggregate.create` - Create aggregated lots
- `ge.sponsor.create` - Sponsor member guarantees
- `reports.coop.view` - View co-op reports

#### SACCO_ADMIN (Settlement + Continuous Secondary Trading)
- Shared permissions
- `sacco.members.manage` - Manage SACCO members
- `sacco.suitability.approve` - Approve member eligibility
- `settlement.instructions.view` - View settlement instructions
- `see.secondary.trade.continuous.sacco` - Continuous trading
- `see.market.halt` - Halt market (SACCO + Platform Risk)
- `see.surveillance.view` - View surveillance (compliance)

#### ISSUER (Private Placement in SEE)
- Shared permissions
- `see.issuance.create` - Create private placements
- `see.issuance.publish` - Publish offerings
- `see.issuance.view.own` - View own issuances

#### INVESTOR (Subscribe + Trade + Impact Reporting)
- Shared permissions
- `see.offerings.view` - Browse offerings
- `see.invest.subscribe` - Subscribe to placements
- `see.portfolio.view.own` - View portfolio
- `reports.investor.view` - View investor reports

#### FUND_MANAGER (API Trading + Reporting)
- Shared permissions
- `api.order.submit` - Submit orders via API
- `api.positions.read` - Read positions via API
- `ire.portfolio.read` - Read portfolio data
- `ire.impact.read` - Read impact reports
- `see.offerings.view`, `see.invest.subscribe`, `see.portfolio.view.own`

#### CUSTODIAN (Settlement Only)
- Shared permissions
- `cdse.settlement.queue.view` - View settlement queue
- `cdse.settlement.confirm` - Confirm settlement

#### REGULATOR (RRE Read-only)
- Shared permissions
- `rre.dashboard.view` - View regulator dashboard
- `rre.reports.download` - Download regulatory reports

### Legacy Roles (Maintained for Backward Compatibility)

#### INDIVIDUAL_INVESTOR
- Shared permissions
- `investments.create`, `investments.view`, `investments.view.own`, `investments.cancel`
- `projects.view`
- `auctions.view`, `auctions.bid`
- `reports.investor.generate`, `reports.investor.view`
- `see.offerings.view`, `see.invest.subscribe`, `see.portfolio.view.own` (new)

#### INSTITUTIONAL_INVESTOR
- All INDIVIDUAL_INVESTOR permissions
- `investments.bulk`
- `reports.institutional.*`
- `api.order.submit`, `api.positions.read` (new)

#### IMPACT_FUND
- All INSTITUTIONAL_INVESTOR permissions
- `projects.impact.view`
- `ire.portfolio.read`, `ire.impact.read` (new)

#### FUNDRAISER Roles (SME_STARTUP, SOCIAL_ENTERPRISE, REAL_ESTATE_PROJECT)
- Shared permissions
- `projects.create`, `projects.view.own`, `projects.update.own`
- `auctions.create`
- `guarantees.request`, `guarantees.view`

## Usage Examples

### Route Protection

```typescript
// Single permission
router.post('/projects', authenticate, requirePermission('projects.create'), controller.create);

// Multiple permissions (OR)
router.get('/reports', authenticate, requireAnyPermission('reports.view', 'reports.admin'), controller.list);

// Multiple permissions (AND)
router.post('/investments/approve', 
  authenticate, 
  requireAllPermissions('investments.approve', 'investments.manage'), 
  controller.approve
);

// Resource ownership
router.put('/projects/:id', 
  authenticate, 
  requireOwnership('projects', (req) => req.params.id, getProjectOwner), 
  controller.update
);
```

### Service Layer

```typescript
import { hasPermission } from '../services/rbac.service';

// Check permission
const canCreate = await hasPermission(userId, 'projects.create');
if (!canCreate) {
  throw createError('Insufficient permissions', 403);
}
```

### Contextual Permissions

```typescript
// Check permission in specific context
const canEdit = await hasPermission(userId, 'projects.update', {
  type: 'PROJECT',
  id: projectId,
});
```

## Migration Strategy

### Phase 1: Setup (Non-Breaking)
1. Add RBAC models to schema
2. Run migration
3. Seed default data
4. Existing code continues to work

### Phase 2: Gradual Migration
1. Update new routes to use permissions
2. Keep existing routes with role checks
3. Test thoroughly

### Phase 3: Full Migration
1. Update all routes to use permissions
2. Remove role-only checks
3. Optionally deprecate User.role field

## Benefits

1. **Fine-Grained Control**: Permissions instead of just roles
2. **Flexibility**: Multiple roles, contextual permissions
3. **Auditability**: All access attempts logged
4. **Scalability**: Easy to add new permissions
5. **Security**: Principle of least privilege

## Next Steps

1. Review design documents
2. Add models to schema
3. Run migration
4. Seed data
5. Start using in new routes
6. Gradually migrate existing routes

---

## Workflow Integration

The RBAC system is now aligned with the user workflows defined in `USER_WORKFLOWS.md`. Each workflow role has been mapped to specific permissions that enable the required functionality:

1. **Onboarding & Identity** (Shared): All roles get basic auth, profile, and permission viewing
2. **Retail Trader** (TEE): Marketplace trading with escrow
3. **Supplier** (RAE): Reverse auction bidding
4. **Buyer** (RAE): Procurement and contract awarding
5. **Co-op Admin**: Member management and guarantee sponsorship
6. **SACCO Admin**: Member management and continuous trading
7. **Issuer** (SEE): Private placement creation
8. **Investor** (SEE): Subscription and portfolio management
9. **Fund Manager**: API access and institutional reporting
10. **Custodian** (CDSE): Settlement execution
11. **Regulator** (RRE): Read-only supervisory access

### Permission Categories by Engine

- **TEE** (Trade Execution Engine): 5 permissions
- **RAE** (Reverse Auction Engine): 6 permissions
- **GE** (Guarantee Engine): 3 permissions
- **SEE** (Securities Exchange Engine): 9 permissions
- **CDSE** (Centralized Digital Settlement Engine): 2 permissions
- **RRE** (Regulatory Reporting Engine): 2 permissions
- **IRE** (Impact Reporting Engine): 2 permissions
- **API**: 2 permissions
- **Co-op/SACCO**: 4 permissions
- **Settlement**: 1 permission
- **Auth/Profile**: 5 permissions

**Total**: 50+ workflow-specific permissions + legacy permissions

---

**Status**: ✅ Aligned with USER_WORKFLOWS.md. All workflow roles and permissions implemented in seed script.

