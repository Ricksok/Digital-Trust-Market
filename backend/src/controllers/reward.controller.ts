import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as rewardService from '../services/reward.service';

export const getUserRewards = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const recipientId = req.params.recipientId || req.user!.id;
    const rewardType = req.query.rewardType as string | undefined;
    const status = req.query.status as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;

    const rewards = await rewardService.getUserRewards(recipientId, {
      rewardType,
      status,
      limit,
    });
    res.json({ success: true, data: rewards });
  } catch (error) {
    next(error);
  }
};

export const getTotalRewards = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const recipientId = req.params.recipientId || req.user!.id;
    const totals = await rewardService.getTotalRewards(recipientId);
    res.json({ success: true, data: totals });
  } catch (error) {
    next(error);
  }
};

export const claimReward = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const rewardId = req.params.rewardId;
    const { transactionHash } = req.body;

    const reward = await rewardService.claimReward(rewardId, transactionHash);
    res.json({ success: true, data: reward, message: 'Reward claimed successfully' });
  } catch (error) {
    next(error);
  }
};




