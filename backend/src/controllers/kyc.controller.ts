import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as kycService from '../services/kyc.service';

export const submitKYC = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const kycRecord = await kycService.submitKYC(req.user!.id, req.body);
    res.status(201).json({ success: true, data: kycRecord });
  } catch (error) {
    next(error);
  }
};

export const getKYCStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const status = await kycService.getKYCStatus(req.user!.id);
    res.json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
};

export const getKYCRecord = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const record = await kycService.getKYCRecord(req.params.id);
    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

export const verifyKYC = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await kycService.verifyKYC(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};


