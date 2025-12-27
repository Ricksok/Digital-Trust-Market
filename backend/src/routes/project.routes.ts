/**
 * Project Routes
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  requirePermission,
  requireOwnership,
  getProjectOwner,
} from '../middleware/rbac.middleware';
import * as projectController from '../controllers/project.controller';

const router = Router();

/**
 * GET /api/projects
 * View all projects (public)
 */
router.get('/', projectController.getAllProjects);

/**
 * POST /api/projects
 * Create project - requires projects.create permission
 */
router.post('/', authenticate, requirePermission('projects.create'), projectController.createProject);

/**
 * GET /api/projects/:id
 * View single project (public - no authentication required)
 * All users including admins can view projects
 */
router.get('/:id', projectController.getProjectById);

/**
 * PUT /api/projects/:id
 * Update project - requires ownership or projects.update permission
 */
router.put(
  '/:id',
  authenticate,
  requireOwnership('projects', (req) => req.params.id, getProjectOwner),
  projectController.updateProject
);

/**
 * DELETE /api/projects/:id
 * Delete project - requires ownership or projects.delete permission
 */
router.delete(
  '/:id',
  authenticate,
  requireOwnership('projects', (req) => req.params.id, getProjectOwner),
  projectController.deleteProject
);

/**
 * POST /api/projects/:id/submit
 * Submit for approval - requires ownership
 */
router.post(
  '/:id/submit',
  authenticate,
  requireOwnership('projects', (req) => req.params.id, getProjectOwner),
  projectController.submitForApproval
);

/**
 * POST /api/projects/:id/approve
 * Approve project - requires projects.approve permission (admin)
 */
router.post('/:id/approve', authenticate, requirePermission('projects.approve'), projectController.approveProject);

export default router;


