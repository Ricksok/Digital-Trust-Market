import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import * as analyticsController from '../controllers/analytics.controller';

const router = express.Router();

router.get('/dashboard', authenticate, analyticsController.getDashboard);
router.get('/projects/stats', authenticate, analyticsController.getProjectStats);
router.get('/investments/stats', authenticate, analyticsController.getInvestmentStats);
router.get('/revenue', authenticate, requirePermission('analytics.view'), analyticsController.getRevenueStats);
router.get('/users/stats', authenticate, requirePermission('analytics.view'), analyticsController.getUserStats);

export default router;


