# RBAC Route Migration Guide

## Routes Updated to Use Permission-Based Authorization

The following routes have been migrated from role-based (`authorize()`) to permission-based (`requirePermission()`) authorization:

### ✅ Migrated Routes

#### Projects (`backend/src/routes/project.routes.ts`)
- ✅ `POST /projects` - `requirePermission('projects.create')`
- ✅ `PUT /projects/:id` - `requireOwnership('projects', ...)`
- ✅ `DELETE /projects/:id` - `requireOwnership('projects', ...)`
- ✅ `POST /projects/:id/submit` - `requireOwnership('projects', ...)`
- ✅ `POST /projects/:id/approve` - `requirePermission('projects.approve')`

#### Investments (`backend/src/routes/investment.routes.ts`)
- ✅ `POST /investments` - `requirePermission('investments.create')`
- ✅ `GET /investments` - `requirePermission('investments.view')`
- ✅ `GET /investments/:id` - `requirePermission('investments.view')`
- ✅ `POST /investments/:id/cancel` - `requireOwnership('investments', ...)`
- ✅ `GET /investments/project/:projectId` - `requirePermission('investments.view')`

#### Auctions (`backend/src/routes/auction.routes.ts`)
- ✅ `POST /auctions` - `requirePermission('auctions.create')`
- ✅ `POST /auctions/:id/start` - `requirePermission('auctions.start')`
- ✅ `POST /auctions/:id/bids` - `requirePermission('auctions.bid')`
- ✅ `POST /auctions/:id/close` - `requirePermission('auctions.close')`

#### Staking (`backend/src/routes/staking.routes.ts`)
- ✅ `POST /staking/pools` - `requirePermission('system.configure')`

#### Tokens (`backend/src/routes/token.routes.ts`)
- ✅ `POST /tokens/initialize` - `requirePermission('system.configure')`

#### Governance (`backend/src/routes/governance.routes.ts`)
- ✅ `POST /governance/proposals/:proposalId/execute` - `requirePermission('system.configure')`

#### Demo (`backend/src/routes/demo.routes.ts`)
- ✅ All demo routes - `requirePermission('system.configure')`

#### Users (`backend/src/routes/user.routes.ts`)
- ✅ `GET /users` - `requirePermission('users.manage')`

### ⏳ Routes Still Using Legacy authorize()

These routes still use `authorize()` which is backward compatible and will work with both RBAC and legacy roles:

- `backend/src/routes/regulatory-reporting.routes.ts` - Uses middleware in controller
- `backend/src/routes/investor-reporting.routes.ts` - Uses middleware in controller
- `backend/src/routes/guarantee.routes.ts` - Some routes use authorize in controller

## Migration Pattern

### Before (Role-Based)
```typescript
router.post('/projects', authenticate, authorize('ADMIN', 'FUNDRAISER'), controller.create);
```

### After (Permission-Based)
```typescript
router.post('/projects', authenticate, requirePermission('projects.create'), controller.create);
```

### Ownership Check
```typescript
// Before: Manual check in controller
router.put('/projects/:id', authenticate, controller.update);

// After: Ownership middleware
router.put('/projects/:id', 
  authenticate, 
  requireOwnership('projects', (req) => req.params.id, getProjectOwner), 
  controller.update
);
```

## Permission Mapping

### Role → Permission Mapping

| Old Role Check | New Permission |
|---------------|----------------|
| `authorize('ADMIN')` | `requirePermission('*.*')` or specific permission |
| `authorize('SME_STARTUP', 'SOCIAL_ENTERPRISE')` | `requirePermission('projects.create')` |
| `authorize('ADMIN', 'FUNDRAISER')` | `requirePermission('auctions.create')` |

### Common Permission Patterns

- **Create operations**: `{resource}.create`
- **View operations**: `{resource}.view` or `{resource}.view.own`
- **Update operations**: `{resource}.update` or ownership check
- **Delete operations**: `{resource}.delete` or ownership check
- **Admin operations**: `{resource}.approve`, `system.configure`, `*.*`

## Next Steps

1. ✅ Routes updated to use permission-based middleware
2. ⏳ Run migration when database is available
3. ⏳ Seed RBAC data
4. ⏳ Test permission checks
5. ⏳ Migrate remaining routes (regulatory-reporting, investor-reporting, guarantee)

## Testing

After migration and seeding:

1. Test with admin user (should have all permissions)
2. Test with investor user (should have investment permissions)
3. Test with fundraiser user (should have project creation permissions)
4. Test ownership checks (users can only modify their own resources)
5. Test permission denials (should return 403 with proper message)

## Rollback Plan

If needed, you can temporarily revert to role-based checks:

```typescript
// Temporary fallback
import { authorize } from '../middleware/auth.middleware';
router.post('/projects', authenticate, authorize('ADMIN', 'FUNDRAISER'), controller.create);
```

The `authorize()` middleware is backward compatible and will work with both systems.

---

**Status**: Key routes migrated. Ready for database migration and testing.

