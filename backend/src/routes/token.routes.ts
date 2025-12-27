import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import * as tokenController from '../controllers/token.controller';

const router = express.Router();

// Token management routes
router.get('/tokens/:identifier', authenticate, tokenController.getToken);
// Initialize tokens - requires system.configure permission (admin)
router.post('/tokens/initialize', authenticate, requirePermission('system.configure'), tokenController.initializeTokens);

// Balance routes
router.get('/balances/:entityId?', authenticate, tokenController.getAllBalances);
router.get('/balances/:entityId/:tokenId', authenticate, tokenController.getBalance);

// Transaction routes
router.post('/transfer', authenticate, tokenController.transfer);
router.get('/transactions/:entityId?', authenticate, tokenController.getTransactionHistory);

export default router;




