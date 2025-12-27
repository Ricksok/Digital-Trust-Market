import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import * as demoController from '../controllers/demo.controller';

const router = express.Router();

// Demo data generation endpoints (only in development)
// All require system.configure permission (admin)
if (process.env.NODE_ENV === 'development') {
  router.post('/generate-projects', authenticate, requirePermission('system.configure'), demoController.generateProjects);
  router.post('/generate-investments', authenticate, requirePermission('system.configure'), demoController.generateInvestments);
  router.post('/generate-auctions', authenticate, requirePermission('system.configure'), demoController.generateAuctions);
  router.post('/generate-guarantees', authenticate, requirePermission('system.configure'), demoController.generateGuaranteeRequests);
  router.post('/reset-data', authenticate, requirePermission('system.configure'), demoController.resetDemoData);
}

export default router;


