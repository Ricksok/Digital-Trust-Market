import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import * as governanceController from '../controllers/governance.controller';

const router = express.Router();

// Proposal routes
router.post('/proposals', authenticate, governanceController.createProposal);
router.get('/proposals', authenticate, governanceController.listProposals);
router.get('/proposals/:proposalId', authenticate, governanceController.getProposal);
// Execute proposal - requires system.configure permission (admin)
router.post('/proposals/:proposalId/execute', authenticate, requirePermission('system.configure'), governanceController.executeProposal);

// Voting routes
router.post('/proposals/:proposalId/vote', authenticate, governanceController.castVote);

export default router;




