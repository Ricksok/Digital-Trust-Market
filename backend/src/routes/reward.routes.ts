import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as rewardController from '../controllers/reward.controller';

const router = express.Router();

// Reward routes
router.get('/rewards/:recipientId?', authenticate, rewardController.getUserRewards);
router.get('/rewards/:recipientId/totals', authenticate, rewardController.getTotalRewards);
router.post('/rewards/:rewardId/claim', authenticate, rewardController.claimReward);

export default router;


