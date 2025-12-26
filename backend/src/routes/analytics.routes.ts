import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as analyticsController from '../controllers/analytics.controller';

const router = express.Router();

router.get('/dashboard', authenticate, analyticsController.getDashboard);
router.get('/projects/stats', authenticate, analyticsController.getProjectStats);
router.get('/investments/stats', authenticate, analyticsController.getInvestmentStats);
router.get('/revenue', authenticate, authorize('ADMIN'), analyticsController.getRevenueStats);
router.get('/users/stats', authenticate, authorize('ADMIN'), analyticsController.getUserStats);

export default router;


