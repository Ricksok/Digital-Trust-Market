import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as complianceService from '../services/compliance.service';

export const submitCompliance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const record = await complianceService.submitCompliance(req.user!.id, req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

export const getComplianceStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const status = await complianceService.getComplianceStatus(req.user!.id, req.query);
    res.json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
};

export const registerWithCMA = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await complianceService.registerWithCMA(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const logs = await complianceService.getAuditLogs(req.query);
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

export const verifyCompliance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await complianceService.verifyCompliance(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};


