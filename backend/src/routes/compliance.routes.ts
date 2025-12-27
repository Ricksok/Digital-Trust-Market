import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import * as complianceController from '../controllers/compliance.controller';

const router = express.Router();

router.post('/submit', authenticate, complianceController.submitCompliance);
router.get('/status', authenticate, complianceController.getComplianceStatus);
router.post('/cma/register', authenticate, requirePermission('compliance.manage'), complianceController.registerWithCMA);
router.get('/audits', authenticate, requirePermission('compliance.view'), complianceController.getAuditLogs);
router.post('/verify', authenticate, requirePermission('compliance.manage'), complianceController.verifyCompliance);

export default router;


