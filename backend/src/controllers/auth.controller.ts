import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as authService from '../services/auth.service';
import { createError } from '../middleware/errorHandler';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const connectWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { walletAddress, signature, message } = req.body;
    const result = await authService.connectWallet(walletAddress, signature, message);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const verifyWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { walletAddress, signature } = req.body;
    const result = await authService.verifyWallet(walletAddress, signature);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // In a real implementation, you might want to blacklist the token
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getUserById(req.user!.id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};


