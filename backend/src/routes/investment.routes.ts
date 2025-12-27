/**
 * Investment Routes
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  requirePermission,
  requireOwnership,
  getInvestmentOwner,
} from '../middleware/rbac.middleware';
import * as investmentController from '../controllers/investment.controller';

const router = Router();

/**
 * POST /api/investments
 * Create investment - requires investments.create permission
 */
router.post('/', authenticate, requirePermission('investments.create'), investmentController.createInvestment);

/**
 * GET /api/investments
 * Get investments - requires investments.view permission
 */
router.get('/', authenticate, requirePermission('investments.view'), investmentController.getInvestments);

/**
 * GET /api/investments/project/:projectId
 * Get project investments - requires investments.view permission
 */
router.get(
  '/project/:projectId',
  authenticate,
  requirePermission('investments.view'),
  investmentController.getProjectInvestments
);

/**
 * GET /api/investments/:id
 * Get single investment - requires investments.view permission
 */
router.get('/:id', authenticate, requirePermission('investments.view'), investmentController.getInvestmentById);

/**
 * POST /api/investments/:id/cancel
 * Cancel investment - requires ownership or investments.cancel permission
 */
router.post(
  '/:id/cancel',
  authenticate,
  requireOwnership('investments', (req) => req.params.id, getInvestmentOwner),
  investmentController.cancelInvestment
);

export default router;


