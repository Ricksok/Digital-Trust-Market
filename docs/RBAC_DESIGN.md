# Enterprise Role-Based Access Control (RBAC) Design

## Current State Analysis

### Existing System
- ✅ Basic authentication with JWT
- ✅ Simple role-based authorization (`authorize()` middleware)
- ✅ Roles stored as strings in User model
- ✅ EntityRole model for contextual roles
- ❌ No permission system
- ❌ No role hierarchy
- ❌ No fine-grained access control
- ❌ Manual permission checks scattered in controllers

### Current Roles
- `ADMIN` - System administrator
- `INDIVIDUAL_INVESTOR` - Individual investors
- `INSTITUTIONAL_INVESTOR` - Institutional investors
- `IMPACT_FUND` - Impact funds
- `SME_STARTUP` - Small businesses/startups
- `SOCIAL_ENTERPRISE` - Social enterprises
- `REAL_ESTATE_PROJECT` - Real estate projects

## Proposed Enterprise RBAC Architecture

### Core Principles
1. **Separation of Concerns**: Roles define "who", Permissions define "what"
2. **Flexibility**: Multiple roles per user, hierarchical permissions
3. **Context-Aware**: Support for contextual permissions (project-specific, etc.)
4. **Auditability**: Track all permission changes and access attempts
5. **Performance**: Cache permissions for fast lookups

### Database Schema Design

#### 1. Permission Model
```prisma
model Permission {
  id          String   @id @default(uuid())
  name        String   @unique // e.g., "projects.create", "investments.view"
  resource    String   // e.g., "projects", "investments", "reports"
  action      String   // e.g., "create", "view", "update", "delete", "approve"
  description String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  rolePermissions RolePermission[]
  
  @@index([resource])
  @@index([action])
  @@index([resource, action])
}
```

#### 2. Role Model (Enhanced)
```prisma
model Role {
  id          String   @id @default(uuid())
  name        String   @unique // e.g., "ADMIN", "INVESTOR", "FUNDRAISER"
  displayName String   // e.g., "Administrator", "Investor", "Fundraiser"
  description String?
  isSystem    Boolean  @default(false) // System roles cannot be deleted
  isActive    Boolean  @default(true)
  
  // Hierarchy (optional - for role inheritance)
  parentRoleId String?
  parentRole   Role?   @relation("RoleHierarchy", fields: [parentRoleId], references: [id])
  childRoles   Role[]  @relation("RoleHierarchy")
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  rolePermissions RolePermission[]
  userRoles      UserRole[]
  
  @@index([name])
  @@index([isActive])
}
```

#### 3. Role-Permission Mapping
```prisma
model RolePermission {
  id           String   @id @default(uuid())
  roleId       String
  permissionId String
  
  // Conditions (optional - for dynamic permissions)
  conditions   String?  // JSON: {"entityType": "SME_STARTUP", "minTrustScore": 50}
  
  createdAt DateTime @default(now())
  
  // Relations
  role       Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  
  @@unique([roleId, permissionId])
  @@index([roleId])
  @@index([permissionId])
}
```

#### 4. User-Role Assignment
```prisma
model UserRole {
  id        String   @id @default(uuid())
  userId    String
  roleId    String
  
  // Context (optional - for contextual roles)
  contextType String? // e.g., "PROJECT", "INVESTMENT", "GLOBAL"
  contextId   String? // ID of the context (project ID, etc.)
  
  // Assignment metadata
  assignedBy String?  // User ID who assigned this role
  assignedAt DateTime @default(now())
  expiresAt  DateTime? // Optional expiration
  isActive   Boolean  @default(true)
  
  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  role Role @relation(fields: [roleId], references: [id], onDelete: Cascade)
  
  @@unique([userId, roleId, contextType, contextId])
  @@index([userId])
  @@index([roleId])
  @@index([contextType, contextId])
}
```

#### 5. Permission Audit Log
```prisma
model PermissionAudit {
  id            String   @id @default(uuid())
  userId        String
  permission    String   // Permission name
  resource      String?  // Resource accessed
  resourceId    String?  // Specific resource ID
  action        String   // ALLOWED, DENIED
  reason        String?  // Why denied/allowed
  ipAddress     String?
  userAgent     String?
  
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([permission])
  @@index([createdAt])
}
```

### Permission Naming Convention

**Format**: `{resource}.{action}`

**Examples**:
- `projects.create`
- `projects.view`
- `projects.update`
- `projects.delete`
- `projects.approve`
- `investments.create`
- `investments.view`
- `investments.cancel`
- `reports.regulatory.generate`
- `reports.regulatory.submit`
- `users.manage`
- `roles.manage`
- `permissions.manage`

### Default Roles & Permissions

#### Super Admin (ADMIN)
- All permissions (`*.*`)
- Can manage roles and permissions
- Can manage all users
- Can access all reports

#### Investor Roles
- `INDIVIDUAL_INVESTOR`: `investments.*`, `projects.view`, `reports.investor.*`
- `INSTITUTIONAL_INVESTOR`: Same as individual + `investments.bulk`, `reports.institutional.*`
- `IMPACT_FUND`: Same as institutional + `projects.impact.view`

#### Fundraiser Roles
- `SME_STARTUP`: `projects.create`, `projects.update`, `projects.view.own`, `auctions.create`
- `SOCIAL_ENTERPRISE`: Same as SME + `projects.impact.*`
- `REAL_ESTATE_PROJECT`: `projects.create`, `projects.update`, `projects.view.own`

### Implementation Plan

#### Phase 1: Database Schema
1. Add Permission, Role, RolePermission, UserRole models
2. Create migration
3. Seed default permissions and roles

#### Phase 2: Core Services
1. Permission service (check, cache)
2. Role service (CRUD operations)
3. User role assignment service

#### Phase 3: Middleware & Utilities
1. Enhanced `authorize()` middleware with permissions
2. `requirePermission()` middleware
3. Permission checking utilities

#### Phase 4: Migration
1. Migrate existing role checks to permissions
2. Update all routes
3. Update controllers

#### Phase 5: Admin Interface
1. Role management UI
2. Permission management UI
3. User role assignment UI

## Implementation Details

### Permission Checking Strategy

#### Option 1: Database Lookup (Current)
- Query UserRole → Role → RolePermission → Permission
- Slower but always accurate
- Good for development

#### Option 2: Cached Lookups (Recommended)
- Cache user permissions in Redis/Memory
- Invalidate on role/permission changes
- Fast lookups
- Good for production

#### Option 3: JWT Claims (Hybrid)
- Include permissions in JWT token
- Refresh token when permissions change
- Fastest but requires token refresh

### Middleware Design

```typescript
// Permission-based authorization
requirePermission('projects.create')

// Multiple permissions (OR)
requireAnyPermission('projects.create', 'projects.approve')

// Multiple permissions (AND)
requireAllPermissions('investments.view', 'investments.create')

// Role-based (backward compatible)
authorize('ADMIN', 'FUNDRAISER')

// Resource ownership check
requireOwnership('projects', projectId)
```

### Context-Aware Permissions

Support for contextual permissions:
- Project-specific roles (e.g., "Project Manager" for specific project)
- Investment-specific permissions
- Time-bound permissions

## Migration Strategy

### Step 1: Add New Models (Non-Breaking)
- Add Permission, Role, RolePermission, UserRole models
- Keep existing User.role field
- Run migration

### Step 2: Seed Default Data
- Create default permissions
- Create default roles
- Map permissions to roles
- Assign roles to existing users

### Step 3: Dual Mode Operation
- Support both old (role-based) and new (permission-based) checks
- Gradually migrate routes

### Step 4: Full Migration
- Remove old role checks
- Use only permission-based checks
- Optionally remove User.role field

## Security Considerations

1. **Principle of Least Privilege**: Users get minimum required permissions
2. **Separation of Duties**: Critical operations require multiple approvals
3. **Audit Trail**: All permission checks logged
4. **Time-Bound Access**: Permissions can expire
5. **Context Isolation**: Users can't access resources outside their context

## Performance Optimization

1. **Permission Caching**: Cache user permissions in memory/Redis
2. **Batch Checks**: Check multiple permissions in one query
3. **Indexing**: Proper database indexes on permission lookups
4. **Lazy Loading**: Load permissions only when needed

## API Design

### Role Management
```
GET    /api/roles              - List all roles
POST   /api/roles              - Create role (admin only)
GET    /api/roles/:id          - Get role details
PUT    /api/roles/:id          - Update role (admin only)
DELETE /api/roles/:id          - Delete role (admin only)
GET    /api/roles/:id/permissions - Get role permissions
POST   /api/roles/:id/permissions - Assign permissions to role
```

### Permission Management
```
GET    /api/permissions        - List all permissions
GET    /api/permissions/:id    - Get permission details
```

### User Role Assignment
```
GET    /api/users/:id/roles    - Get user roles
POST   /api/users/:id/roles    - Assign role to user
DELETE /api/users/:id/roles/:roleId - Remove role from user
GET    /api/users/:id/permissions - Get user permissions (effective)
```

## Testing Strategy

1. **Unit Tests**: Permission checking logic
2. **Integration Tests**: Role assignment and permission inheritance
3. **E2E Tests**: Full access control flows
4. **Security Tests**: Permission bypass attempts

---

**Next Steps**: Implement Phase 1 (Database Schema) and Phase 2 (Core Services)


