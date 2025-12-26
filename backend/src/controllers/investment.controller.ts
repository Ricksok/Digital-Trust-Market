import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as investmentService from '../services/investment.service';

export const createInvestment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const investment = await investmentService.createInvestment(req.user!.id, req.body);
    res.status(201).json({ success: true, data: investment });
  } catch (error) {
    next(error);
  }
};

export const getInvestments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const investments = await investmentService.getInvestments(req.user!.id, req.query);
    res.json({ success: true, data: investments });
  } catch (error) {
    next(error);
  }
};

export const getInvestmentById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const investment = await investmentService.getInvestmentById(req.params.id, req.user!.id);
    res.json({ success: true, data: investment });
  } catch (error) {
    next(error);
  }
};

export const cancelInvestment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const investment = await investmentService.cancelInvestment(req.params.id, req.user!.id);
    res.json({ success: true, data: investment });
  } catch (error) {
    next(error);
  }
};

export const getProjectInvestments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const investments = await investmentService.getProjectInvestments(req.params.projectId, req.user!.id);
    res.json({ success: true, data: investments });
  } catch (error) {
    next(error);
  }
};


