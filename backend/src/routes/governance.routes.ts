import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as governanceController from '../controllers/governance.controller';

const router = express.Router();

// Proposal routes
router.post('/proposals', authenticate, governanceController.createProposal);
router.get('/proposals', authenticate, governanceController.listProposals);
router.get('/proposals/:proposalId', authenticate, governanceController.getProposal);
router.post('/proposals/:proposalId/execute', authenticate, authorize('ADMIN'), governanceController.executeProposal);

// Voting routes
router.post('/proposals/:proposalId/vote', authenticate, governanceController.castVote);

export default router;




