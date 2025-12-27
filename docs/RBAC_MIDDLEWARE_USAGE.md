# RBAC Middleware Usage Examples

## Import Middleware

```typescript
import { authenticate } from '../middleware/auth.middleware';
import {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireOwnership,
  authorize,
  getProjectOwner,
  getInvestmentOwner,
  getAuctionOwner,
} from '../middleware/rbac.middleware';
```

## Basic Permission Checks

### Single Permission

```typescript
// Require specific permission
router.post('/projects', 
  authenticate, 
  requirePermission('projects.create'), 
  projectController.create
);

// With context
router.put('/projects/:id', 
  authenticate, 
  requirePermission('projects.update', { type: 'PROJECT', id: req.params.id }), 
  projectController.update
);
```

### Multiple Permissions (OR)

```typescript
// User needs ANY of these permissions
router.get('/reports', 
  authenticate, 
  requireAnyPermission('reports.view', 'reports.admin', 'reports.regulatory.view'), 
  reportController.list
);
```

### Multiple Permissions (AND)

```typescript
// User needs ALL of these permissions
router.post('/investments/:id/approve', 
  authenticate, 
  requireAllPermissions('investments.approve', 'investments.manage'), 
  investmentController.approve
);
```

## Resource Ownership

### Project Ownership

```typescript
router.put('/projects/:id', 
  authenticate, 
  requireOwnership('projects', (req) => req.params.id, getProjectOwner), 
  projectController.update
);

router.delete('/projects/:id', 
  authenticate, 
  requireOwnership('projects', (req) => req.params.id, getProjectOwner), 
  projectController.delete
);
```

### Investment Ownership

```typescript
router.get('/investments/:id', 
  authenticate, 
  requireOwnership('investments', (req) => req.params.id, getInvestmentOwner), 
  investmentController.getOne
);

router.post('/investments/:id/cancel', 
  authenticate, 
  requireOwnership('investments', (req) => req.params.id, getInvestmentOwner), 
  investmentController.cancel
);
```

### Custom Ownership Check

```typescript
// Custom owner function
const getGuaranteeOwner = async (guaranteeId: string): Promise<string | null> => {
  const guarantee = await prisma.guaranteeRequest.findUnique({
    where: { id: guaranteeId },
    select: { requesterId: true },
  });
  return guarantee?.requesterId || null;
};

router.put('/guarantees/:id', 
  authenticate, 
  requireOwnership('guarantees', (req) => req.params.id, getGuaranteeOwner), 
  guaranteeController.update
);
```

## Backward Compatible Role Checks

### Using authorize() (Legacy Support)

```typescript
// Still works - checks RBAC first, then falls back to User.role
router.post('/projects', 
  authenticate, 
  authorize('ADMIN', 'SME_STARTUP', 'SOCIAL_ENTERPRISE'), 
  projectController.create
);

router.get('/admin/reports', 
  authenticate, 
  authorize('ADMIN'), 
  adminController.getReports
);
```

## Context-Aware Permissions

### Project-Specific Permissions

```typescript
// Check permission in project context
router.post('/projects/:projectId/investments', 
  authenticate, 
  requirePermission('investments.create', { type: 'PROJECT', id: req.params.projectId }), 
  investmentController.create
);
```

### Context from Request Body

```typescript
// Context extracted from request body
router.post('/transactions', 
  authenticate, 
  requirePermission('transactions.create'), // Context extracted from req.body
  transactionController.create
);
```

## Combined Middleware

### Multiple Checks

```typescript
// Permission + Ownership
router.put('/projects/:id', 
  authenticate, 
  requirePermission('projects.update'), 
  requireOwnership('projects', (req) => req.params.id, getProjectOwner), 
  projectController.update
);
```

### Permission with Custom Logic

```typescript
router.post('/investments/:id/approve', 
  authenticate, 
  requireAllPermissions('investments.approve', 'investments.manage'),
  async (req, res, next) => {
    // Additional custom checks can go here
    const investment = await prisma.investment.findUnique({
      where: { id: req.params.id },
    });
    
    if (investment?.status !== 'PENDING') {
      return res.status(400).json({ message: 'Investment is not pending' });
    }
    
    next();
  },
  investmentController.approve
);
```

## Logging Configuration

### Disable Logging on Allow

```typescript
// Only log denials, not allows
router.post('/projects', 
  authenticate, 
  requirePermission('projects.create', undefined, { logOnAllow: false }), 
  projectController.create
);
```

### Disable Logging on Deny

```typescript
// Only log allows, not denials
router.get('/projects', 
  authenticate, 
  requirePermission('projects.view', undefined, { logOnDeny: false }), 
  projectController.list
);
```

## Real-World Examples

### Project Routes

```typescript
// Create project (fundraisers only)
router.post('/projects', 
  authenticate, 
  requirePermission('projects.create'), 
  projectController.create
);

// View all projects (anyone with view permission)
router.get('/projects', 
  authenticate, 
  requirePermission('projects.view'), 
  projectController.list
);

// Update own project (owner or admin)
router.put('/projects/:id', 
  authenticate, 
  requireOwnership('projects', (req) => req.params.id, getProjectOwner), 
  projectController.update
);

// Approve project (admin only)
router.post('/projects/:id/approve', 
  authenticate, 
  requirePermission('projects.approve'), 
  projectController.approve
);
```

### Investment Routes

```typescript
// Create investment (investors)
router.post('/investments', 
  authenticate, 
  requirePermission('investments.create'), 
  investmentController.create
);

// View own investments
router.get('/investments', 
  authenticate, 
  requirePermission('investments.view.own'), 
  investmentController.list
);

// Cancel own investment
router.post('/investments/:id/cancel', 
  authenticate, 
  requireOwnership('investments', (req) => req.params.id, getInvestmentOwner), 
  investmentController.cancel
);

// Approve investment (admin with multiple permissions)
router.post('/investments/:id/approve', 
  authenticate, 
  requireAllPermissions('investments.approve', 'investments.manage'), 
  investmentController.approve
);
```

### Auction Routes

```typescript
// Create auction (fundraisers)
router.post('/auctions', 
  authenticate, 
  requirePermission('auctions.create'), 
  auctionController.create
);

// Place bid (investors or anyone with bid permission)
router.post('/auctions/:id/bid', 
  authenticate, 
  requirePermission('auctions.bid'), 
  auctionController.placeBid
);

// Start auction (admin only)
router.post('/auctions/:id/start', 
  authenticate, 
  requirePermission('auctions.start'), 
  auctionController.start
);

// Close auction (admin only)
router.post('/auctions/:id/close', 
  authenticate, 
  requirePermission('auctions.close'), 
  auctionController.close
);
```

### Report Routes

```typescript
// Generate regulatory report (admin)
router.post('/reports/regulatory', 
  authenticate, 
  requirePermission('reports.regulatory.generate'), 
  reportController.generateRegulatory
);

// View investor reports (investors)
router.get('/reports/investor', 
  authenticate, 
  requireAnyPermission('reports.investor.view', 'reports.investor.generate'), 
  reportController.listInvestor
);
```

## Error Responses

All middleware returns consistent JSON error responses:

```json
// 401 Unauthorized
{
  "message": "Authentication required"
}

// 403 Forbidden
{
  "message": "Insufficient permissions"
}

// 400 Bad Request (ownership check)
{
  "message": "Resource ID required"
}

// 404 Not Found (ownership check)
{
  "message": "Resource not found"
}

// 403 Forbidden (ownership check)
{
  "message": "Access denied: Not resource owner"
}
```

## Audit Logging

All permission checks are automatically logged to `PermissionAudit` table with:
- User ID
- Permission checked
- Action (ALLOWED/DENIED)
- Reason (if denied)
- Resource and Resource ID
- IP Address
- User Agent
- Timestamp

Query audit logs:
```typescript
const audits = await prisma.permissionAudit.findMany({
  where: {
    userId: 'user-id',
    action: 'DENIED',
    createdAt: { gte: new Date('2024-01-01') },
  },
  orderBy: { createdAt: 'desc' },
});
```

---

**Note**: The `authorize()` middleware is backward compatible and will work with both RBAC and legacy role systems during migration.


