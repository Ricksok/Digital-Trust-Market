import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as paymentService from '../services/payment.service';

export const initiatePayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const payment = await paymentService.initiatePayment(req.user!.id, req.body);
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await paymentService.handleWebhook(req.body, req.headers);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const getPaymentStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id, req.user!.id);
    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

export const getPayments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const payments = await paymentService.getPayments(req.user!.id, req.query);
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

export const refundPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const refund = await paymentService.refundPayment(req.params.id, req.user!.id, req.body);
    res.json({ success: true, data: refund });
  } catch (error) {
    next(error);
  }
};


