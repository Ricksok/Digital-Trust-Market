import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserRoles,
  logPermissionCheck,
  PermissionContext,
} from '../services/rbac.service';
import { createError } from './errorHandler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Extract context from request
 */
function extractContext(req: AuthRequest): PermissionContext | undefined {
  const contextType = req.body?.contextType || req.query?.contextType;
  const contextId = req.body?.contextId || req.query?.contextId || req.params?.id;

  if (contextType && contextId) {
    return {
      type: contextType as PermissionContext['type'],
      id: contextId,
    };
  }

  return undefined;
}

/**
 * Require a specific permission
 * Usage: requirePermission('projects.create')
 */
export const requirePermission = (
  permission: string,
  context?: PermissionContext,
  options?: { logOnAllow?: boolean; logOnDeny?: boolean }
) => {
  const logOnAllow = options?.logOnAllow ?? true;
  const logOnDeny = options?.logOnDeny ?? true;

  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        if (logOnDeny) {
          await logPermissionCheck(
            '',
            permission,
            'DENIED',
            'Not authenticated',
            undefined,
            undefined,
            req.ip,
            req.headers['user-agent'] as string
          );
        }
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Use provided context or extract from request
      const requestContext = context || extractContext(req);

      // Check if user is admin (legacy role check as fallback)
      const isAdmin = req.user.role === 'ADMIN';
      
      // Check permission (admin with *.* should always pass)
      const allowed = isAdmin || await hasPermission(req.user.id, permission, requestContext);

      // Log permission check
      if ((allowed && logOnAllow) || (!allowed && logOnDeny)) {
        await logPermissionCheck(
          req.user.id,
          permission,
          allowed ? 'ALLOWED' : 'DENIED',
          allowed ? undefined : 'Insufficient permissions',
          undefined,
          requestContext?.id,
          req.ip,
          req.headers['user-agent'] as string
        );
      }

      if (!allowed) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Require any of the specified permissions (OR logic)
 * Usage: requireAnyPermission('projects.create', 'projects.approve')
 */
export const requireAnyPermission = (
  ...permissions: string[]
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        await logPermissionCheck(
          '',
          permissions.join(' OR '),
          'DENIED',
          'Not authenticated',
          undefined,
          undefined,
          req.ip,
          req.headers['user-agent'] as string
        );
        return res.status(401).json({ message: 'Authentication required' });
      }

      const requestContext = extractContext(req);
      const allowed = await hasAnyPermission(req.user.id, permissions, requestContext);

      // Log permission check
      await logPermissionCheck(
        req.user.id,
        permissions.join(' OR '),
        allowed ? 'ALLOWED' : 'DENIED',
        allowed ? undefined : 'Insufficient permissions',
        undefined,
        requestContext?.id,
        req.ip,
        req.headers['user-agent'] as string
      );

      if (!allowed) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Require all of the specified permissions (AND logic)
 * Usage: requireAllPermissions('investments.approve', 'investments.manage')
 */
export const requireAllPermissions = (
  ...permissions: string[]
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        await logPermissionCheck(
          '',
          permissions.join(' AND '),
          'DENIED',
          'Not authenticated',
          undefined,
          undefined,
          req.ip,
          req.headers['user-agent'] as string
        );
        return res.status(401).json({ message: 'Authentication required' });
      }

      const requestContext = extractContext(req);
      const allowed = await hasAllPermissions(req.user.id, permissions, requestContext);

      // Log permission check
      await logPermissionCheck(
        req.user.id,
        permissions.join(' AND '),
        allowed ? 'ALLOWED' : 'DENIED',
        allowed ? undefined : 'Insufficient permissions',
        undefined,
        requestContext?.id,
        req.ip,
        req.headers['user-agent'] as string
      );

      if (!allowed) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check resource ownership
 * Usage: requireOwnership('projects', (req) => req.params.id, getProjectOwner)
 * 
 * @param resourceName - Name of the resource (e.g., 'projects', 'investments')
 * @param getResourceId - Function to extract resource ID from request
 * @param getOwnerId - Async function to get owner ID of the resource
 */
export const requireOwnership = (
  resourceName: string,
  getResourceId: (req: AuthRequest) => string | undefined,
  getOwnerId: (resourceId: string) => Promise<string | null>
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        await logPermissionCheck(
          '',
          `${resourceName}.own`,
          'DENIED',
          'Not authenticated',
          resourceName,
          undefined,
          req.ip,
          req.headers['user-agent'] as string
        );
        return res.status(401).json({ message: 'Authentication required' });
      }

      const resourceId = getResourceId(req);
      if (!resourceId) {
        return res.status(400).json({ message: 'Resource ID required' });
      }

      const ownerId = await getOwnerId(resourceId);
      if (!ownerId) {
        await logPermissionCheck(
          req.user.id,
          `${resourceName}.own`,
          'DENIED',
          'Resource not found',
          resourceName,
          resourceId,
          req.ip,
          req.headers['user-agent'] as string
        );
        return res.status(404).json({ message: 'Resource not found' });
      }

      // Check if user is owner or has admin permission
      const isOwner = ownerId === req.user.id;
      const isAdmin = await hasPermission(req.user.id, '*.*');

      if (!isOwner && !isAdmin) {
        await logPermissionCheck(
          req.user.id,
          `${resourceName}.own`,
          'DENIED',
          'Not resource owner',
          resourceName,
          resourceId,
          req.ip,
          req.headers['user-agent'] as string
        );
        return res.status(403).json({ message: 'Access denied: Not resource owner' });
      }

      await logPermissionCheck(
        req.user.id,
        `${resourceName}.own`,
        'ALLOWED',
        isAdmin ? 'Admin override' : 'Resource owner',
        resourceName,
        resourceId,
        req.ip,
        req.headers['user-agent'] as string
      );

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Backward compatible role-based authorization
 * 
 * Checks RBAC UserRole first, then falls back to User.role string
 * 
 * Usage: authorize('ADMIN', 'FUNDRAISER')
 */
export const authorize = (...roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        await logPermissionCheck(
          '',
          `role:${roles.join(' OR ')}`,
          'DENIED',
          'Not authenticated',
          undefined,
          undefined,
          req.ip,
          req.headers['user-agent'] as string
        );
        return res.status(401).json({ message: 'Authentication required' });
      }

      let hasRole = false;
      let checkMethod = '';

      // First, try RBAC system (UserRole table)
      try {
        const userRoles = await getUserRoles(req.user.id);
        hasRole = roles.some((role) => userRoles.includes(role));
        checkMethod = hasRole ? 'RBAC' : '';
      } catch (error) {
        // If RBAC fails (e.g., tables don't exist yet), fall through to legacy check
        console.warn('RBAC check failed, falling back to legacy role check:', error);
      }

      // Fallback to legacy User.role string if RBAC didn't find a match
      if (!hasRole && req.user.role) {
        hasRole = roles.includes(req.user.role);
        checkMethod = hasRole ? 'LEGACY' : '';
      }

      // Log permission check
      await logPermissionCheck(
        req.user.id,
        `role:${roles.join(' OR ')}`,
        hasRole ? 'ALLOWED' : 'DENIED',
        hasRole ? undefined : `Role not found. Checked via: ${checkMethod || 'RBAC+LEGACY'}`,
        undefined,
        undefined,
        req.ip,
        req.headers['user-agent'] as string
      );

      if (!hasRole) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Helper function to get project owner ID
 * Can be used with requireOwnership
 */
export const getProjectOwner = async (projectId: string): Promise<string | null> => {
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
};

/**
 * Helper function to get investment owner ID
 * Can be used with requireOwnership
 */
export const getInvestmentOwner = async (investmentId: string): Promise<string | null> => {
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
};

/**
 * Helper function to get auction owner ID
 * Can be used with requireOwnership
 * Gets owner through project relationship
 */
export const getAuctionOwner = async (auctionId: string): Promise<string | null> => {
  try {
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      select: { 
        projectId: true,
        project: {
          select: {
            fundraiserId: true,
          },
        },
      },
    });
    return auction?.project?.fundraiserId || null;
  } catch (error) {
    console.error('Error getting auction owner:', error);
    return null;
  }
};
