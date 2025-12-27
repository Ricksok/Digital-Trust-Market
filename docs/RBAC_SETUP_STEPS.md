# RBAC System - Setup Steps

## ✅ Completed Steps

1. ✅ **Schema Models Added**
   - Permission, Role, RolePermission, UserRole, PermissionAudit models added to `schema.prisma`
   - User model updated with `userRoles` relation
   - Schema formatted and validated

2. ✅ **Core Services Created**
   - `backend/src/services/rbac.service.ts` - Permission checking logic
   - `backend/src/middleware/rbac.middleware.ts` - Permission middleware

3. ✅ **Seed Script Created**
   - `backend/src/scripts/seed-rbac.ts` - Seeds default permissions and roles

## ⏳ Next Steps (Run when database is available)

### Step 1: Create Migration

```bash
cd backend
npx prisma migrate dev --name add_rbac_system
```

This will:
- Create the migration file
- Apply it to your database
- Generate the Prisma client with new models

### Step 2: Generate Prisma Client

```bash
cd backend
npx prisma generate
```

### Step 3: Seed RBAC Data

```bash
cd backend
npx tsx src/scripts/seed-rbac.ts
```

This will:
- Create all default permissions (projects.*, investments.*, etc.)
- Create all default roles (ADMIN, INDIVIDUAL_INVESTOR, etc.)
- Map permissions to roles
- Assign roles to existing users based on their current role

### Step 4: Verify Setup

Check that roles were assigned:

```bash
# In your database or via Prisma Studio
npx prisma studio
```

Navigate to:
- `UserRole` table - Should have entries for all users
- `Role` table - Should have 7 roles (ADMIN, INDIVIDUAL_INVESTOR, etc.)
- `Permission` table - Should have ~30+ permissions
- `RolePermission` table - Should have role-permission mappings

## Testing the RBAC System

### Test Permission Check

```typescript
import { hasPermission } from './services/rbac.service';

// Check if user can create projects
const canCreate = await hasPermission(userId, 'projects.create');
console.log('Can create projects:', canCreate);
```

### Test Middleware

```typescript
import { requirePermission } from './middleware/rbac.middleware';

// Protect a route
router.post('/projects', 
  authenticate, 
  requirePermission('projects.create'), 
  controller.create
);
```

## What Gets Created

### Permissions (30+)
- `projects.*` (create, view, update, delete, approve, reject)
- `investments.*` (create, view, update, cancel, approve, bulk)
- `auctions.*` (create, view, bid, start, close)
- `guarantees.*` (request, view, bid, allocate)
- `reports.*` (regulatory, investor, institutional)
- `users.manage`, `roles.manage`, `permissions.manage`
- `*.*` (Super Admin - all permissions)

### Roles (7)
1. **ADMIN** - Super User with all permissions
2. **INDIVIDUAL_INVESTOR** - Basic investor permissions
3. **INSTITUTIONAL_INVESTOR** - Enhanced investor permissions
4. **IMPACT_FUND** - Impact fund permissions
5. **SME_STARTUP** - Small business fundraiser
6. **SOCIAL_ENTERPRISE** - Social enterprise fundraiser
7. **REAL_ESTATE_PROJECT** - Real estate fundraiser

### User Role Assignments
- All existing users will get roles assigned based on their current `role` field
- Admin users → ADMIN role
- Investors → Appropriate investor role
- Fundraisers → Appropriate fundraiser role

## Migration Notes

- **Non-Breaking**: Existing code continues to work
- **Backward Compatible**: `authorize()` middleware still functions
- **Gradual Migration**: You can migrate routes one by one

## Troubleshooting

### Migration Fails
- Check DATABASE_URL is set in `.env`
- Ensure database is running
- Check database connection

### Seed Script Fails
- Ensure migration ran successfully
- Check Prisma client is generated
- Verify database connection

### Permission Checks Not Working
- Verify user has roles assigned (check UserRole table)
- Check roles have permissions (check RolePermission table)
- Verify Prisma client is up to date

## Next: Start Using RBAC

Once setup is complete, you can start using permission-based authorization:

```typescript
// Old way (still works)
router.post('/projects', authenticate, authorize('ADMIN', 'FUNDRAISER'), controller.create);

// New way (recommended)
router.post('/projects', authenticate, requirePermission('projects.create'), controller.create);
```

---

**Status**: Schema ready, waiting for database connection to run migration and seed.


