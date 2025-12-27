/**
 * Vendor Central Routes
 * Feature: Vendor Central Dashboard
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as vendorCentralController from '../controllers/vendor-central.controller';

const router = Router();

/**
 * GET /api/vendor-central/dashboard
 * Get vendor dashboard data
 */
router.get('/dashboard', authenticate, vendorCentralController.getDashboard);

export default router;

