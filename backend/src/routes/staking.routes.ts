import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as stakingController from '../controllers/staking.controller';

const router = express.Router();

// Staking pool routes
router.post('/pools', authenticate, authorize('ADMIN'), stakingController.createStakingPool);
router.get('/pools', authenticate, stakingController.getStakingPools);

// Staking routes
router.post('/stake', authenticate, stakingController.stake);
router.post('/unstake/:stakeId', authenticate, stakingController.unstake);
router.get('/stakes/:stakerId?', authenticate, stakingController.getUserStakes);

export default router;


