import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Cache entry interface
 */
interface CacheEntry {
  permissions: Set<string>;
  roles: string[];
  timestamp: number;
}

/**
 * In-memory cache for user permissions
 * TTL: 60 seconds
 */
const permissionCache = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 1000; // 60 seconds

/**
 * Context for permission checks
 */
export interface PermissionContext {
  type?: 'PROJECT' | 'TRANSACTION' | 'OFFERING' | 'INVESTMENT' | 'GUARANTEE' | 'AUCTION' | 'GLOBAL';
  id?: string;
}

/**
 * Wildcard matching helper
 * Supports: 'projects.*', 'reports.investor.*', '*.*', etc.
 */
function wildcardMatch(pattern: string, target: string): boolean {
  // Exact match
  if (pattern === target) {
    return true;
  }

  // Full wildcard
  if (pattern === '*.*') {
    return true;
  }

  const patternParts = pattern.split('.');
  const targetParts = target.split('.');

  // Must have same number of parts (or pattern can have wildcard at end)
  if (patternParts.length > targetParts.length) {
    return false;
  }

  // Check each part
  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const targetPart = targetParts[i];

    // Wildcard matches anything
    if (patternPart === '*') {
      // If it's the last part, match everything after
      if (i === patternParts.length - 1) {
        return true;
      }
      // Otherwise continue checking
      continue;
    }

    // Exact match required
    if (patternPart !== targetPart) {
      return false;
    }
  }

  // If pattern is shorter, it's a prefix match (e.g., 'projects.*' matches 'projects.create')
  return patternParts.length <= targetParts.length;
}

/**
 * Check if a permission matches any pattern in a set
 */
function matchesAnyPattern(permission: string, patterns: Set<string>): boolean {
  for (const pattern of patterns) {
    if (wildcardMatch(pattern, permission)) {
      return true;
    }
  }
  return false;
}

/**
 * Get user permissions from database (with context support)
 * Optimized to use 1-2 queries
 */
async function fetchUserPermissionsFromDB(
  userId: string,
  context?: PermissionContext
): Promise<{ permissions: Set<string>; roles: string[] }> {
  // Build context filter
  const contextFilter = context?.type && context?.id
    ? {
        OR: [
          { contextType: context.type, contextId: context.id },
          { contextType: 'GLOBAL', contextId: null },
        ],
      }
    : { contextType: 'GLOBAL', contextId: null };

  // Single query to get all user roles with their permissions
  const userRoles = await prisma.userRole.findMany({
    where: {
      userId,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
      ...contextFilter,
    },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  const permissions = new Set<string>();
  const roles: string[] = [];

  for (const userRole of userRoles) {
    roles.push(userRole.role.name);

    // Add all permissions from this role
    for (const rolePermission of userRole.role.rolePermissions) {
      permissions.add(rolePermission.permission.name);
    }
  }

  return { permissions, roles };
}

/**
 * Get cached permissions or fetch from DB
 */
async function getCachedUserPermissions(
  userId: string,
  context?: PermissionContext
): Promise<{ permissions: Set<string>; roles: string[] }> {
  // Create cache key with context
  const cacheKey = context?.type && context?.id
    ? `${userId}:${context.type}:${context.id}`
    : `${userId}:GLOBAL`;

  const cached = permissionCache.get(cacheKey);
  const now = Date.now();

  // Check if cache is valid
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return {
      permissions: new Set(cached.permissions),
      roles: [...cached.roles],
    };
  }

  // Fetch from database
  const { permissions, roles } = await fetchUserPermissionsFromDB(userId, context);

  // Update cache
  permissionCache.set(cacheKey, {
    permissions: new Set(permissions),
    roles: [...roles],
    timestamp: now,
  });

  return { permissions, roles };
}

/**
 * Invalidate cache for a user (all contexts)
 */
function invalidateUserCache(userId: string) {
  const keysToDelete: string[] = [];
  for (const key of permissionCache.keys()) {
    if (key.startsWith(`${userId}:`)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach((key) => permissionCache.delete(key));
}

/**
 * Check if user has a specific permission
 * Supports wildcard permissions (e.g., "projects.*", "*.*")
 */
export async function hasPermission(
  userId: string,
  permission: string,
  context?: PermissionContext
): Promise<boolean> {
  try {
    const { permissions, roles } = await getCachedUserPermissions(userId, context);

    // Check if user is admin (via RBAC role or legacy role)
    if (roles.includes('ADMIN')) {
      return true; // Admins have all permissions
    }

    // Also check legacy role as fallback
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (user?.role === 'ADMIN') {
        return true; // Admins have all permissions
      }
    } catch {
      // Ignore errors in legacy check
    }

    // Check if user has wildcard permission (*.*)
    if (permissions.has('*.*')) {
      return true;
    }

    // Check exact match
    if (permissions.has(permission)) {
      return true;
    }

    // Check wildcard matches
    // Check if any permission in the set matches the requested permission pattern
    for (const perm of permissions) {
      if (wildcardMatch(perm, permission)) {
        return true;
      }
    }

    // Also check if requested permission matches any wildcard pattern in the set
    // e.g., if user has "projects.*" and requests "projects.create"
    if (matchesAnyPattern(permission, permissions)) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Check if user has any of the specified permissions (OR logic)
 */
export async function hasAnyPermission(
  userId: string,
  permissions: string[],
  context?: PermissionContext
): Promise<boolean> {
  for (const permission of permissions) {
    if (await hasPermission(userId, permission, context)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if user has all of the specified permissions (AND logic)
 */
export async function hasAllPermissions(
  userId: string,
  permissions: string[],
  context?: PermissionContext
): Promise<boolean> {
  for (const permission of permissions) {
    if (!(await hasPermission(userId, permission, context))) {
      return false;
    }
  }
  return true;
}

/**
 * Get all roles for a user
 */
export async function getUserRoles(userId: string): Promise<string[]> {
  const { roles } = await getCachedUserPermissions(userId);
  return roles;
}

/**
 * Get all permissions for a user (effective permissions)
 */
export async function getUserPermissions(
  userId: string,
  context?: PermissionContext
): Promise<string[]> {
  const { permissions } = await getCachedUserPermissions(userId, context);
  return Array.from(permissions);
}

/**
 * Assign role to user
 * Supports context-specific role assignment
 */
export async function assignRole(
  userId: string,
  roleName: string,
  assignedBy?: string,
  context?: PermissionContext,
  expiresAt?: Date
): Promise<void> {
  // Find role by name
  const role = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    throw new Error(`Role '${roleName}' not found`);
  }

  if (!role.isActive) {
    throw new Error(`Role '${roleName}' is not active`);
  }

  // Check if user already has this role in this context
  const existing = await prisma.userRole.findFirst({
    where: {
      userId,
      roleId: role.id,
      contextType: context?.type || 'GLOBAL',
      contextId: context?.id || null,
    },
  });

  if (existing) {
    // Reactivate if inactive
    if (!existing.isActive) {
      await prisma.userRole.update({
        where: { id: existing.id },
        data: {
          isActive: true,
          assignedBy,
          expiresAt,
        },
      });
    }
  } else {
    // Create new assignment
    await prisma.userRole.create({
      data: {
        userId,
        roleId: role.id,
        assignedBy,
        contextType: context?.type || 'GLOBAL',
        contextId: context?.id || null,
        expiresAt,
      },
    });
  }

  // Invalidate cache
  invalidateUserCache(userId);
}

/**
 * Remove role from user
 */
export async function removeRole(
  userId: string,
  roleName: string,
  context?: PermissionContext
): Promise<void> {
  // Find role by name
  const role = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    throw new Error(`Role '${roleName}' not found`);
  }

  // Find user role assignment
  const userRole = await prisma.userRole.findFirst({
    where: {
      userId,
      roleId: role.id,
      contextType: context?.type || 'GLOBAL',
      contextId: context?.id || null,
    },
  });

  if (userRole) {
    // Soft delete (set isActive to false)
    await prisma.userRole.update({
      where: { id: userRole.id },
      data: { isActive: false },
    });

    // Invalidate cache
    invalidateUserCache(userId);
  }
}

/**
 * Log permission check for audit trail
 */
export async function logPermissionCheck(
  userId: string,
  permission: string,
  action: 'ALLOWED' | 'DENIED',
  reason?: string,
  resource?: string,
  resourceId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await prisma.permissionAudit.create({
      data: {
        userId,
        permission,
        resource,
        resourceId,
        action,
        reason,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Don't fail request if audit logging fails
    console.error('Failed to log permission check:', error);
  }
}

/**
 * Clear cache for a specific user (useful for testing or manual cache invalidation)
 */
export function clearUserCache(userId: string): void {
  invalidateUserCache(userId);
}

/**
 * Clear all permission cache (useful for testing)
 */
export function clearAllCache(): void {
  permissionCache.clear();
}

/**
 * Get cache statistics (useful for monitoring)
 */
export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: permissionCache.size,
    entries: Array.from(permissionCache.keys()),
  };
}
