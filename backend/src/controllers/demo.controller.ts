import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as demoService from '../services/demo.service';

export const generateProjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const count = parseInt(req.body.count || '5');
    const projects = await demoService.generateProjects(count);
    res.json({ success: true, data: projects, message: `Generated ${projects.length} projects` });
  } catch (error) {
    next(error);
  }
};

export const generateInvestments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const count = parseInt(req.body.count || '10');
    const investments = await demoService.generateInvestments(count);
    res.json({ success: true, data: investments, message: `Generated ${investments.length} investments` });
  } catch (error) {
    next(error);
  }
};

export const resetDemoData = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await demoService.resetDemoData();
    res.json({ success: true, message: 'Demo data reset successfully' });
  } catch (error) {
    next(error);
  }
};

export const generateAuctions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const count = parseInt(req.body.count || '5');
    const auctions = await demoService.generateAuctions(count);
    res.json({ success: true, data: auctions, message: `Generated ${auctions.length} auctions` });
  } catch (error) {
    next(error);
  }
};

export const generateGuaranteeRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const count = parseInt(req.body.count || '5');
    const requests = await demoService.generateGuaranteeRequests(count);
    res.json({ success: true, data: requests, message: `Generated ${requests.length} guarantee requests` });
  } catch (error) {
    next(error);
  }
};

