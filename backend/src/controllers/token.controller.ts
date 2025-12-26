import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as tokenService from '../services/token.service';

export const initializeTokens = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tokens = await tokenService.initializeTokens();
    res.json({ success: true, data: tokens, message: 'Tokens initialized successfully' });
  } catch (error) {
    next(error);
  }
};

export const getToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const identifier = req.params.identifier;
    const token = await tokenService.getToken(identifier);
    res.json({ success: true, data: token });
  } catch (error) {
    next(error);
  }
};

export const getBalance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const entityId = req.params.entityId || req.user!.id;
    const tokenId = req.params.tokenId;
    const balance = await tokenService.getBalance(entityId, tokenId);
    res.json({ success: true, data: balance });
  } catch (error) {
    next(error);
  }
};

export const getAllBalances = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const entityId = req.params.entityId || req.user!.id;
    const balances = await tokenService.getAllBalances(entityId);
    res.json({ success: true, data: balances });
  } catch (error) {
    next(error);
  }
};

export const transfer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const fromEntityId = req.user!.id;
    const { toEntityId, tokenId, amount, contextType, contextId } = req.body;

    if (!toEntityId || !tokenId || !amount) {
      return res.status(400).json({
        success: false,
        error: { message: 'Missing required fields: toEntityId, tokenId, amount' },
      });
    }

    const transaction = await tokenService.transfer(
      fromEntityId,
      toEntityId,
      tokenId,
      amount,
      contextType,
      contextId
    );
    res.json({ success: true, data: transaction, message: 'Transfer successful' });
  } catch (error) {
    next(error);
  }
};

export const getTransactionHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const entityId = req.params.entityId || req.user!.id;
    const tokenId = req.query.tokenId as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;

    const transactions = await tokenService.getTransactionHistory(entityId, tokenId, limit);
    res.json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};




