import { Response } from 'express';
import * as guaranteeService from '../services/guarantee.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const createGuaranteeRequest = async (req: AuthRequest, res: Response) => {
  try {
    const request = await guaranteeService.createGuaranteeRequest({
      ...req.body,
      issuerId: req.user!.id,
    });
    res.status(201).json(request);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const getGuaranteeRequests = async (req: AuthRequest, res: Response) => {
  try {
    const result = await guaranteeService.getGuaranteeRequests(req.query);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const getGuaranteeRequestById = async (req: AuthRequest, res: Response) => {
  try {
    const request = await guaranteeService.getGuaranteeRequestById(req.params.id);
    res.json(request);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const createGuaranteeAuction = async (req: AuthRequest, res: Response) => {
  try {
    const auction = await guaranteeService.createGuaranteeAuction(req.params.id);
    res.json(auction);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const placeGuaranteeBid = async (req: AuthRequest, res: Response) => {
  try {
    const bid = await guaranteeService.placeGuaranteeBid(
      req.params.id,
      req.user!.id,
      req.body
    );
    res.status(201).json(bid);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const allocateGuarantees = async (req: AuthRequest, res: Response) => {
  try {
    const result = await guaranteeService.allocateGuarantees(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message });
  }
};


