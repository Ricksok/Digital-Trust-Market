import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import * as stakingController from '../controllers/staking.controller';

const router = express.Router();

// Staking pool routes
// Create staking pool - requires system.configure permission (admin)
router.post('/pools', authenticate, requirePermission('system.configure'), stakingController.createStakingPool);
router.get('/pools', authenticate, stakingController.getStakingPools);
router.get('/pools/:id', authenticate, stakingController.getStakingPoolById);
router.put('/pools/:id', authenticate, requirePermission('system.configure'), stakingController.updateStakingPool);
router.delete('/pools/:id', authenticate, requirePermission('system.configure'), stakingController.deactivateStakingPool);

// Staking routes
router.post('/stake', authenticate, stakingController.stake);
router.post('/unstake/:stakeId', authenticate, stakingController.unstake);
router.get('/stakes/:stakerId?', authenticate, stakingController.getUserStakes);

export default router;




