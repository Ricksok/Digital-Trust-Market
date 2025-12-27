# Enterprise RBAC Implementation Plan

## Overview

This document outlines the step-by-step implementation of an enterprise-grade Role-Based Access Control (RBAC) system with permissions for the Digital Trust Marketplace.

## Current State

### Existing Authorization
- ✅ Basic JWT authentication
- ✅ Simple role-based `authorize()` middleware
- ✅ Roles stored as strings in User model
- ✅ EntityRole model for contextual roles
- ❌ No permission system
- ❌ No fine-grained access control

### Current Roles
- `ADMIN` - System administrator
- `INDIVIDUAL_INVESTOR`, `INSTITUTIONAL_INVESTOR`, `IMPACT_FUND` - Investor types
- `SME_STARTUP`, `SOCIAL_ENTERPRISE`, `REAL_ESTATE_PROJECT` - Fundraiser types

## Implementation Phases

### Phase 1: Database Schema ✅ (Ready to implement)

**Files Created:**
- `backend/prisma/schema-rbac.prisma` - New RBAC models

**Steps:**
1. Add RBAC models to main `schema.prisma`
2. Add `userRoles` relation to User model
3. Create migration: `npx prisma migrate dev --name add_rbac_system`
4. Generate Prisma client: `npx prisma generate`

**Models to Add:**
- `Permission` - Defines what can be done
- `Role` - Defines who can do it
- `RolePermission` - Maps roles to permissions
- `UserRole` - Assigns roles to users
- `PermissionAudit` - Audit trail

### Phase 2: Core Services ✅ (Ready to implement)

**Files Created:**
- `backend/src/services/rbac.service.ts` - RBAC core logic

**Functions:**
- `hasPermission()` - Check single permission
- `hasAnyPermission()` - Check multiple (OR)
- `hasAllPermissions()` - Check multiple (AND)
- `getUserPermissions()` - Get all user permissions
- `getUserRoles()` - Get all user roles
- `assignRole()` - Assign role to user
- `removeRole()` - Remove role from user
- `logPermissionCheck()` - Audit logging

### Phase 3: Middleware ✅ (Ready to implement)

**Files Created:**
- `backend/src/middleware/rbac.middleware.ts` - Permission middleware

**Middleware:**
- `requirePermission()` - Require specific permission
- `requireAnyPermission()` - Require any of multiple
- `requireAllPermissions()` - Require all of multiple
- `requireOwnership()` - Check resource ownership
- `authorize()` - Backward compatible role check

### Phase 4: Seed Default Data

**Create seed script:**
- Default permissions (projects.*, investments.*, etc.)
- Default roles (ADMIN, INVESTOR, FUNDRAISER)
- Map permissions to roles
- Assign roles to existing users

### Phase 5: Migration Strategy

**Gradual Migration:**
1. Keep existing `authorize()` middleware working
2. Add permission checks alongside role checks
3. Gradually replace role checks with permission checks
4. Eventually deprecate role-only checks

### Phase 6: Admin API

**Routes to Create:**
- `/api/rbac/roles` - Role management
- `/api/rbac/permissions` - Permission management
- `/api/rbac/users/:id/roles` - User role assignment
- `/api/rbac/users/:id/permissions` - Get user permissions

### Phase 7: Frontend Integration

**Components to Create:**
- Role management UI
- Permission management UI
- User role assignment UI
- Permission audit log viewer

## Default Permissions

### Projects
- `projects.create` - Create new projects
- `projects.view` - View projects
- `projects.view.own` - View own projects only
- `projects.update` - Update projects
- `projects.update.own` - Update own projects only
- `projects.delete` - Delete projects
- `projects.approve` - Approve projects (admin)
- `projects.reject` - Reject projects (admin)

### Investments
- `investments.create` - Create investments
- `investments.view` - View investments
- `investments.view.own` - View own investments
- `investments.cancel` - Cancel investments
- `investments.approve` - Approve investments (admin)

### Auctions
- `auctions.create` - Create auctions
- `auctions.view` - View auctions
- `auctions.bid` - Place bids
- `auctions.start` - Start auctions (admin)
- `auctions.close` - Close auctions (admin)

### Reports
- `reports.regulatory.generate` - Generate regulatory reports
- `reports.regulatory.submit` - Submit regulatory reports
- `reports.investor.generate` - Generate investor reports
- `reports.investor.view` - View investor reports

### Administration
- `users.manage` - Manage users
- `roles.manage` - Manage roles
- `permissions.manage` - Manage permissions
- `system.configure` - System configuration

### Wildcard Permissions
- `*.*` - All permissions (Super Admin)
- `projects.*` - All project permissions
- `investments.*` - All investment permissions

## Default Role-Permission Mapping

### ADMIN (Super User)
- `*.*` - All permissions

### INDIVIDUAL_INVESTOR
- `investments.create`
- `investments.view`
- `investments.view.own`
- `investments.cancel`
- `projects.view`
- `auctions.view`
- `auctions.bid`
- `reports.investor.generate`
- `reports.investor.view`

### INSTITUTIONAL_INVESTOR
- All INDIVIDUAL_INVESTOR permissions
- `investments.bulk`
- `reports.institutional.*`

### IMPACT_FUND
- All INSTITUTIONAL_INVESTOR permissions
- `projects.impact.view`

### SME_STARTUP / SOCIAL_ENTERPRISE / REAL_ESTATE_PROJECT
- `projects.create`
- `projects.view.own`
- `projects.update.own`
- `auctions.create`
- `guarantees.request`

## Usage Examples

### Route Protection

```typescript
// Old way (still works)
router.post('/projects', authenticate, authorize('ADMIN', 'FUNDRAISER'), controller.create);

// New way (permission-based)
router.post('/projects', authenticate, requirePermission('projects.create'), controller.create);

// Multiple permissions (OR)
router.get('/reports', authenticate, requireAnyPermission('reports.view', 'reports.admin'), controller.list);

// Multiple permissions (AND)
router.post('/investments/approve', authenticate, requireAllPermissions('investments.approve', 'investments.manage'), controller.approve);

// Resource ownership
router.put('/projects/:id', authenticate, requireOwnership('projects', (req) => req.params.id, getProjectOwner), controller.update);
```

### Service Layer

```typescript
// Check permission in service
const canCreate = await hasPermission(userId, 'projects.create');
if (!canCreate) {
  throw createError('Insufficient permissions', 403);
}

// Check multiple permissions
const canManage = await hasAnyPermission(userId, ['projects.manage', 'projects.admin']);
```

## Migration Checklist

- [ ] Phase 1: Add database models
- [ ] Phase 2: Implement core services
- [ ] Phase 3: Create middleware
- [ ] Phase 4: Seed default data
- [ ] Phase 5: Update existing routes (gradual)
- [ ] Phase 6: Create admin API
- [ ] Phase 7: Build frontend UI
- [ ] Phase 8: Testing & documentation

## Testing Strategy

1. **Unit Tests**: Permission checking logic
2. **Integration Tests**: Role assignment flows
3. **E2E Tests**: Full access control scenarios
4. **Security Tests**: Permission bypass attempts

## Performance Considerations

1. **Caching**: Cache user permissions in Redis
2. **Indexing**: Proper database indexes
3. **Batch Operations**: Check multiple permissions efficiently
4. **Lazy Loading**: Load permissions only when needed

---

**Status**: Design complete, ready for Phase 1 implementation


