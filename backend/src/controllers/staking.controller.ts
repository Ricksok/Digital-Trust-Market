import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as stakingService from '../services/staking.service';

export const createStakingPool = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Only admins can create staking pools
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions' },
      });
    }

    const pool = await stakingService.createStakingPool(req.body);
    res.json({ success: true, data: pool, message: 'Staking pool created successfully' });
  } catch (error) {
    next(error);
  }
};

export const stake = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stakerId = req.user!.id;
    const { poolId, amount } = req.body;

    if (!poolId || !amount) {
      return res.status(400).json({
        success: false,
        error: { message: 'Missing required fields: poolId, amount' },
      });
    }

    const stake = await stakingService.stake(stakerId, poolId, amount);
    res.json({ success: true, data: stake, message: 'Tokens staked successfully' });
  } catch (error) {
    next(error);
  }
};

export const unstake = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stakeId = req.params.stakeId;
    const stake = await stakingService.unstake(stakeId);
    res.json({ success: true, data: stake, message: 'Tokens unstaked successfully' });
  } catch (error) {
    next(error);
  }
};

export const getStakingPools = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const pools = await stakingService.getStakingPools({ isActive });
    res.json({ success: true, data: pools });
  } catch (error) {
    next(error);
  }
};

export const getUserStakes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stakerId = req.params.stakerId || req.user!.id;
    const stakes = await stakingService.getUserStakes(stakerId);
    res.json({ success: true, data: stakes });
  } catch (error) {
    next(error);
  }
};

export const getStakingPoolById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const pool = await stakingService.getStakingPoolById(req.params.id);
    res.json({ success: true, data: pool });
  } catch (error) {
    next(error);
  }
};

export const updateStakingPool = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Only admins can update staking pools
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions' },
      });
    }

    const pool = await stakingService.updateStakingPool(req.params.id, req.body);
    res.json({ success: true, data: pool, message: 'Staking pool updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deactivateStakingPool = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Only admins can deactivate staking pools
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions' },
      });
    }

    const pool = await stakingService.deactivateStakingPool(req.params.id);
    res.json({ success: true, data: pool, message: 'Staking pool deactivated successfully' });
  } catch (error) {
    next(error);
  }
};





