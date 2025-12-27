# RBAC System - Quick Start Guide

## Overview

The enterprise RBAC system provides fine-grained permission-based access control while maintaining backward compatibility with the existing role-based system.

## Architecture

### Core Components

1. **Permission** - Defines what can be done (e.g., `projects.create`)
2. **Role** - Defines who can do it (e.g., `ADMIN`, `INVESTOR`)
3. **RolePermission** - Maps roles to permissions
4. **UserRole** - Assigns roles to users (supports contextual roles)
5. **PermissionAudit** - Tracks all permission checks

## Setup Steps

### Step 1: Add RBAC Models to Schema

The RBAC models are defined in `backend/prisma/schema-rbac.prisma`. Add them to your main `schema.prisma`:

```bash
# Append the RBAC models to schema.prisma
cat backend/prisma/schema-rbac.prisma >> backend/prisma/schema.prisma
```

Or manually copy the models from `schema-rbac.prisma` to the end of `schema.prisma`.

### Step 2: Update User Model

Add the `userRoles` relation to the User model:

```prisma
model User {
  // ... existing fields ...
  userRoles UserRole[] // RBAC role assignments
}
```

### Step 3: Create Migration

```bash
cd backend
npx prisma migrate dev --name add_rbac_system
npx prisma generate
```

### Step 4: Seed Default Data

```bash
cd backend
npx tsx src/scripts/seed-rbac.ts
```

This will:
- Create all default permissions
- Create all default roles
- Map permissions to roles
- Assign roles to existing users based on their current role

## Usage Examples

### Route Protection

#### Old Way (Still Works)
```typescript
import { authenticate, authorize } from '../middleware/auth.middleware';

router.post('/projects', authenticate, authorize('ADMIN', 'FUNDRAISER'), controller.create);
```

#### New Way (Permission-Based)
```typescript
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';

router.post('/projects', authenticate, requirePermission('projects.create'), controller.create);
```

#### Multiple Permissions (OR)
```typescript
import { requireAnyPermission } from '../middleware/rbac.middleware';

router.get('/reports', authenticate, requireAnyPermission('reports.view', 'reports.admin'), controller.list);
```

#### Multiple Permissions (AND)
```typescript
import { requireAllPermissions } from '../middleware/rbac.middleware';

router.post('/investments/approve', 
  authenticate, 
  requireAllPermissions('investments.approve', 'investments.manage'), 
  controller.approve
);
```

#### Resource Ownership
```typescript
import { requireOwnership } from '../middleware/rbac.middleware';

const getProjectOwner = async (projectId: string) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  return project?.fundraiserId || null;
};

router.put('/projects/:id', 
  authenticate, 
  requireOwnership('projects', (req) => req.params.id, getProjectOwner), 
  controller.update
);
```

### Service Layer

```typescript
import { hasPermission, hasAnyPermission } from '../services/rbac.service';

// Check single permission
const canCreate = await hasPermission(userId, 'projects.create');
if (!canCreate) {
  throw createError('Insufficient permissions', 403);
}

// Check multiple permissions (OR)
const canView = await hasAnyPermission(userId, ['reports.view', 'reports.admin']);

// Check multiple permissions (AND)
const canApprove = await hasAllPermissions(userId, ['investments.approve', 'investments.manage']);
```

## Default Permissions

### Projects
- `projects.create` - Create projects
- `projects.view` - View all projects
- `projects.view.own` - View own projects
- `projects.update` - Update any project
- `projects.update.own` - Update own projects
- `projects.delete` - Delete projects
- `projects.approve` - Approve projects (admin)
- `projects.reject` - Reject projects (admin)

### Investments
- `investments.create` - Create investments
- `investments.view` - View all investments
- `investments.view.own` - View own investments
- `investments.cancel` - Cancel investments
- `investments.approve` - Approve investments
- `investments.bulk` - Bulk operations

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
- `*.*` - All permissions (Super Admin)

## Default Roles

### ADMIN (Super User)
- All permissions (`*.*`)

### INDIVIDUAL_INVESTOR
- `investments.*` (create, view, view.own, cancel)
- `projects.view`
- `auctions.view`, `auctions.bid`
- `reports.investor.*`

### INSTITUTIONAL_INVESTOR
- All INDIVIDUAL_INVESTOR permissions
- `investments.bulk`
- `reports.institutional.*`

### IMPACT_FUND
- All INSTITUTIONAL_INVESTOR permissions
- `projects.impact.view`

### SME_STARTUP / SOCIAL_ENTERPRISE / REAL_ESTATE_PROJECT
- `projects.create`, `projects.view.own`, `projects.update.own`
- `auctions.create`
- `guarantees.request`, `guarantees.view`

## Migration Strategy

### Phase 1: Dual Mode (Current)
- Both role-based and permission-based checks work
- Existing code continues to function
- New code uses permissions

### Phase 2: Gradual Migration
- Update routes one by one to use permissions
- Keep role checks as fallback

### Phase 3: Full Migration
- All routes use permission-based checks
- Role checks deprecated (but still work)

## Contextual Roles

Support for context-specific roles:

```typescript
// Assign role for specific project
await assignRole(userId, roleId, assignedBy, {
  type: 'PROJECT',
  id: projectId,
});

// Check permission in context
const canEdit = await hasPermission(userId, 'projects.update', {
  type: 'PROJECT',
  id: projectId,
});
```

## Audit Trail

All permission checks are automatically logged:

```typescript
// Automatically logged by middleware
// Can query audit logs:
const audits = await prisma.permissionAudit.findMany({
  where: {
    userId: 'user-id',
    action: 'DENIED',
    createdAt: { gte: new Date('2024-01-01') },
  },
});
```

## Performance

- **Caching**: Consider caching user permissions in Redis for production
- **Indexing**: Database indexes are in place for fast lookups
- **Batch Checks**: Use `hasAnyPermission` or `hasAllPermissions` for multiple checks

## Next Steps

1. ✅ Review the design document (`docs/RBAC_DESIGN.md`)
2. ✅ Review implementation plan (`docs/RBAC_IMPLEMENTATION_PLAN.md`)
3. ⏳ Add RBAC models to schema
4. ⏳ Run migration
5. ⏳ Seed default data
6. ⏳ Start using in routes

---

**Files Created:**
- `backend/prisma/schema-rbac.prisma` - RBAC models
- `backend/src/services/rbac.service.ts` - Core RBAC logic
- `backend/src/middleware/rbac.middleware.ts` - Permission middleware
- `backend/src/scripts/seed-rbac.ts` - Seed script
- `docs/RBAC_DESIGN.md` - Design document
- `docs/RBAC_IMPLEMENTATION_PLAN.md` - Implementation plan

