import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as complianceController from '../controllers/compliance.controller';

const router = express.Router();

router.post('/submit', authenticate, complianceController.submitCompliance);
router.get('/status', authenticate, complianceController.getComplianceStatus);
router.post('/cma/register', authenticate, authorize('ADMIN'), complianceController.registerWithCMA);
router.get('/audits', authenticate, authorize('ADMIN'), complianceController.getAuditLogs);
router.post('/verify', authenticate, authorize('ADMIN'), complianceController.verifyCompliance);

export default router;


