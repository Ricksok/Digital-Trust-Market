import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as demoController from '../controllers/demo.controller';

const router = express.Router();

// Demo data generation endpoints (only in development)
if (process.env.NODE_ENV === 'development') {
  router.post('/generate-projects', authenticate, authorize('ADMIN'), demoController.generateProjects);
  router.post('/generate-investments', authenticate, authorize('ADMIN'), demoController.generateInvestments);
  router.post('/generate-auctions', authenticate, authorize('ADMIN'), demoController.generateAuctions);
  router.post('/generate-guarantees', authenticate, authorize('ADMIN'), demoController.generateGuaranteeRequests);
  router.post('/reset-data', authenticate, authorize('ADMIN'), demoController.resetDemoData);
}

export default router;


