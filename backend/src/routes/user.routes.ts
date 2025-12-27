/**
 * User Routes
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import * as userController from '../controllers/user.controller';

const router = Router();

/**
 * GET /api/users/profile
 * Get current user profile (authenticated)
 */
router.get('/profile', authenticate, userController.getProfile);

/**
 * PUT /api/users/profile
 * Update current user profile (authenticated)
 */
router.put('/profile', authenticate, userController.updateProfile);

/**
 * GET /api/users
 * Get all users - requires users.manage permission (admin)
 */
router.get('/', authenticate, requirePermission('users.manage'), userController.getAllUsers);

/**
 * GET /api/users/:id
 * Get user by ID (authenticated)
 */
router.get('/:id', authenticate, userController.getUserById);

export default router;


