# RBAC-Workflow Alignment Summary

This document summarizes the alignment between the user workflows defined in `USER_WORKFLOWS.md` and the RBAC implementation.

## ✅ Alignment Status

All 10 workflow roles and their required permissions have been implemented in the RBAC seed script (`backend/src/scripts/seed-rbac.ts`).

## Workflow Role → RBAC Role Mapping

| Workflow Role | RBAC Role Name | Status | Permissions Count |
|--------------|----------------|--------|-------------------|
| Shared (Onboarding) | All roles | ✅ | 3 (auth, profile, permissions) |
| Retail Trader | `RETAIL_TRADER` | ✅ | 7 total (3 shared + 4 TEE) |
| Supplier | `SUPPLIER` | ✅ | 7 total (3 shared + 4 RAE) |
| Buyer | `BUYER` | ✅ | 7 total (3 shared + 4 RAE) |
| Co-op Admin | `COOP_ADMIN` | ✅ | 7 total (3 shared + 4 Co-op) |
| SACCO Admin | `SACCO_ADMIN` | ✅ | 9 total (3 shared + 6 SACCO) |
| Issuer | `ISSUER` | ✅ | 6 total (3 shared + 3 SEE) |
| Investor | `INVESTOR` | ✅ | 7 total (3 shared + 4 SEE) |
| Fund Manager | `FUND_MANAGER` | ✅ | 10 total (3 shared + 7 API/IRE/SEE) |
| Custodian | `CUSTODIAN` | ✅ | 5 total (3 shared + 2 CDSE) |
| Regulator | `REGULATOR` | ✅ | 5 total (3 shared + 2 RRE) |

## Permission Coverage by Engine

### ✅ Trade Execution Engine (TEE)
- `tee.listings.view` → RETAIL_TRADER
- `tee.trade.create` → RETAIL_TRADER
- `tee.trade.view.own` → RETAIL_TRADER
- `tee.contract.view.own` → SUPPLIER
- `tee.aggregate.create` → COOP_ADMIN

### ✅ Reverse Auction Engine (RAE)
- `rae.notice.view` → SUPPLIER, BUYER
- `rae.notice.create` → BUYER
- `rae.bid.create` → SUPPLIER
- `rae.bid.view.own` → SUPPLIER
- `rae.bid.review` → BUYER
- `rae.award.execute` → BUYER

### ✅ Guarantee Engine (GE)
- `ge.escrow.view.own` → RETAIL_TRADER
- `ge.escrow.manage` → BUYER (institution-only)
- `ge.sponsor.create` → COOP_ADMIN

### ✅ Securities Exchange Engine (SEE)
- `see.issuance.create` → ISSUER
- `see.issuance.publish` → ISSUER
- `see.issuance.view.own` → ISSUER
- `see.offerings.view` → INVESTOR, FUND_MANAGER
- `see.invest.subscribe` → INVESTOR, FUND_MANAGER
- `see.portfolio.view.own` → INVESTOR, FUND_MANAGER
- `see.secondary.trade.continuous.sacco` → SACCO_ADMIN
- `see.market.halt` → SACCO_ADMIN
- `see.surveillance.view` → SACCO_ADMIN

### ✅ Centralized Digital Settlement Engine (CDSE)
- `cdse.settlement.queue.view` → CUSTODIAN
- `cdse.settlement.confirm` → CUSTODIAN

### ✅ Regulatory Reporting Engine (RRE)
- `rre.dashboard.view` → REGULATOR
- `rre.reports.download` → REGULATOR

### ✅ Impact Reporting Engine (IRE)
- `ire.portfolio.read` → FUND_MANAGER
- `ire.impact.read` → FUND_MANAGER

### ✅ API Access
- `api.order.submit` → FUND_MANAGER
- `api.positions.read` → FUND_MANAGER

### ✅ Co-operative & SACCO
- `coop.members.manage` → COOP_ADMIN
- `sacco.members.manage` → SACCO_ADMIN
- `sacco.suitability.approve` → SACCO_ADMIN
- `settlement.instructions.view` → SACCO_ADMIN

### ✅ Reports
- `reports.coop.view` → COOP_ADMIN
- `reports.investor.view` → INVESTOR

## Permission Summary

**Total Permissions**: 50+ workflow-specific permissions

**By Category**:
- Auth/Profile: 5 permissions
- TEE: 5 permissions
- RAE: 6 permissions
- GE: 3 permissions
- SEE: 9 permissions
- CDSE: 2 permissions
- RRE: 2 permissions
- IRE: 2 permissions
- API: 2 permissions
- Co-op/SACCO: 4 permissions
- Settlement: 1 permission
- Legacy (Projects/Investments/Auctions/Guarantees): ~20 permissions

## Implementation Files Updated

1. ✅ `backend/src/scripts/seed-rbac.ts` - Updated with all workflow permissions and roles
2. ✅ `docs/RBAC_INTEGRATION_GUIDE.md` - Updated with workflow-aligned mappings
3. ✅ `docs/USER_WORKFLOWS.md` - Complete workflow definitions

## Next Steps

1. **Run Migration** (if schema changes needed):
   ```bash
   cd backend
   npx prisma migrate dev --name add_workflow_permissions
   npx prisma generate
   ```

2. **Seed RBAC Data**:
   ```bash
   cd backend
   npx tsx src/scripts/seed-rbac.ts
   ```

3. **Update Routes**: Gradually migrate routes to use workflow permissions:
   ```typescript
   // Example: TEE routes
   router.get('/tee/listings', authenticate, requirePermission('tee.listings.view'), controller.list);
   router.post('/tee/trades', authenticate, requirePermission('tee.trade.create'), controller.create);
   
   // Example: RAE routes
   router.get('/rae/notices', authenticate, requirePermission('rae.notice.view'), controller.list);
   router.post('/rae/bids', authenticate, requirePermission('rae.bid.create'), controller.create);
   ```

4. **Test Workflows**: Verify each workflow role can perform required actions

## Backward Compatibility

Legacy roles (`INDIVIDUAL_INVESTOR`, `INSTITUTIONAL_INVESTOR`, `IMPACT_FUND`, `SME_STARTUP`, `SOCIAL_ENTERPRISE`, `REAL_ESTATE_PROJECT`) are maintained with:
- All original permissions preserved
- New workflow permissions added where applicable
- Automatic role assignment for existing users

## Notes

- All roles include shared permissions (auth, profile, permissions.view.own)
- Some permissions are institution-only (e.g., `ge.escrow.manage`)
- SACCO Admin has additional permissions for continuous trading
- Fund Manager has API access for institutional execution
- Regulator has read-only access to RRE dashboard

---

**Last Updated**: Alignment complete with USER_WORKFLOWS.md
**Status**: ✅ Ready for implementation


