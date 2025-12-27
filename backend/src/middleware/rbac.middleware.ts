import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { createError } from './errorHandler';
import { hasPermission, PermissionContext } from '../services/rbac.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Log permission check for audit trail
 */
async function logPermissionCheck(
  userId: string,
  permission: string,
  result: 'ALLOWED' | 'DENIED',
  reason: string,
  context?: PermissionContext,
  requestId?: string,
  ip?: string,
  userAgent?: string
) {
  try {
    // Log to console for now (can be extended to database)
    console.log(`[RBAC] User ${userId} - Permission: ${permission} - ${result} - Reason: ${reason}`, {
      context,
      requestId,
      ip,
      userAgent,
    });
  } catch (error) {
    // Don't fail the request if logging fails
    console.error('Failed to log permission check:', error);
  }
}

/**
 * Extract context from request
 */
function extractContext(req: AuthRequest): PermissionContext | undefined {
  // Extract context from route params or body
  if (req.params?.projectId) {
    return { type: 'PROJECT', id: req.params.projectId };
  }
  if (req.params?.id && req.path.includes('/projects/')) {
    return { type: 'PROJECT', id: req.params.id };
  }
  if (req.params?.id && req.path.includes('/investments/')) {
    return { type: 'INVESTMENT', id: req.params.id };
  }
  if (req.params?.id && req.path.includes('/guarantees/')) {
    return { type: 'GUARANTEE', id: req.params.id };
  }
  if (req.params?.id && req.path.includes('/auctions/')) {
    return { type: 'AUCTION', id: req.params.id };
  }
  return undefined;
}

/**
 * Require permission middleware
 * Checks if the authenticated user has the required permission
 */
export const requirePermission = (
  permission: string,
  context?: PermissionContext,
  options?: { logOnAllow?: boolean; logOnDeny?: boolean }
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        await logPermissionCheck(
          'anonymous',
          permission,
          'DENIED',
          'Not authenticated',
          context,
          undefined,
          req.ip,
          req.headers['user-agent'] as string
        );
        return next(createError('Authentication required', 401));
      }

      // Admin bypass: If user has 'ADMIN' role, grant all permissions
      if (req.user.role === 'ADMIN') {
        if (options?.logOnAllow) {
          await logPermissionCheck(
            req.user.id,
            permission,
            'ALLOWED',
            'Admin override',
            undefined,
            undefined,
            req.ip,
            req.headers['user-agent'] as string
          );
        }
        return next();
      }

      const requestContext = context || extractContext(req);
      const allowed = await hasPermission(req.user.id, permission, requestContext);

      if (allowed) {
        if (options?.logOnAllow) {
          await logPermissionCheck(
            req.user.id,
            permission,
            'ALLOWED',
            'Permission granted',
            requestContext,
            undefined,
            req.ip,
            req.headers['user-agent'] as string
          );
        }
        return next();
      }

      if (options?.logOnDeny) {
        await logPermissionCheck(
          req.user.id,
          permission,
          'DENIED',
          'Permission denied',
          requestContext,
          undefined,
          req.ip,
          req.headers['user-agent'] as string
        );
      }

      return next(createError('Insufficient permissions', 403));
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Get project owner ID
 */
export async function getProjectOwner(projectId: string): Promise<string | null> {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { fundraiserId: true },
    });
    return project?.fundraiserId || null;
  } catch (error) {
    console.error('Error getting project owner:', error);
    return null;
  }
}

/**
 * Get investment owner ID
 */
export async function getInvestmentOwner(investmentId: string): Promise<string | null> {
  try {
    const investment = await prisma.investment.findUnique({
      where: { id: investmentId },
      select: { investorId: true },
    });
    return investment?.investorId || null;
  } catch (error) {
    console.error('Error getting investment owner:', error);
    return null;
  }
}

/**
 * Get auction owner ID (via project)
 */
export async function getAuctionOwner(auctionId: string): Promise<string | null> {
  try {
    const auction = await (prisma as any).auction.findUnique({
      where: { id: auctionId },
      select: { projectId: true },
    });
    if (!auction?.projectId) return null;
    return getProjectOwner(auction.projectId);
  } catch (error) {
    console.error('Error getting auction owner:', error);
    return null;
  }
}

/**
 * Require ownership middleware
 * Checks if the authenticated user owns the resource or has the required permission
 */
export const requireOwnership = (
  resourceType: string,
  getId: (req: AuthRequest) => string,
  getOwner: (id: string) => Promise<string | null>
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(createError('Authentication required', 401));
      }

      // Admin bypass
      if (req.user.role === 'ADMIN') {
        return next();
      }

      const resourceId = getId(req);
      if (!resourceId) {
        return next(createError('Resource ID not found', 400));
      }

      const ownerId = await getOwner(resourceId);
      if (!ownerId) {
        return next(createError('Resource not found', 404));
      }

      // Check if user owns the resource
      if (ownerId === req.user.id) {
        return next();
      }

      // Check if user has update/delete permission for this resource type
      const permission = `${resourceType}.update`; // Try update first
      const hasUpdatePermission = await hasPermission(req.user.id, permission);
      
      if (hasUpdatePermission) {
        return next();
      }

      // Try delete permission
      const deletePermission = `${resourceType}.delete`;
      const hasDeletePermission = await hasPermission(req.user.id, deletePermission);
      
      if (hasDeletePermission) {
        return next();
      }

      return next(createError('Insufficient permissions', 403));
    } catch (error) {
      next(error);
    }
  };
};
