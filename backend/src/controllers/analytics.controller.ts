import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as analyticsService from '../services/analytics.service';

export const getDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const dashboard = await analyticsService.getDashboard(req.user!.id, req.user!.role);
    res.json({ success: true, data: dashboard });
  } catch (error) {
    next(error);
  }
};

export const getProjectStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await analyticsService.getProjectStats(req.query);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getInvestmentStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await analyticsService.getInvestmentStats(req.user!.id, req.query);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getRevenueStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await analyticsService.getRevenueStats(req.query);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getUserStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await analyticsService.getUserStats(req.query);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};


