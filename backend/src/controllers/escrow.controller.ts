import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as escrowService from '../services/escrow.service';

export const createEscrow = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const escrow = await escrowService.createEscrow(req.user!.id, req.body);
    res.status(201).json({ success: true, data: escrow });
  } catch (error) {
    next(error);
  }
};

export const getEscrow = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const escrow = await escrowService.getEscrowById(req.params.id, req.user!.id);
    res.json({ success: true, data: escrow });
  } catch (error) {
    next(error);
  }
};

export const releaseEscrow = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const escrow = await escrowService.releaseEscrow(req.params.id, req.user!.id);
    res.json({ success: true, data: escrow });
  } catch (error) {
    next(error);
  }
};

export const refundEscrow = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const escrow = await escrowService.refundEscrow(req.params.id, req.user!.id);
    res.json({ success: true, data: escrow });
  } catch (error) {
    next(error);
  }
};

export const createDispute = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const escrow = await escrowService.createDispute(req.params.id, req.user!.id, req.body);
    res.json({ success: true, data: escrow });
  } catch (error) {
    next(error);
  }
};

export const getEscrowByInvestment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const escrow = await escrowService.getEscrowByInvestment(req.params.investmentId, req.user!.id);
    res.json({ success: true, data: escrow });
  } catch (error) {
    next(error);
  }
};


