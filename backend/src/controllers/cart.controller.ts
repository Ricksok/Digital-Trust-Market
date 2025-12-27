import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as cartService from '../services/cart.service';

export const getCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cart = await cartService.getCart(req.user!.id);
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cart = await cartService.addToCart(req.user!.id, req.body);
    res.status(201).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cart = await cartService.updateCartItem(req.user!.id, req.params.id, req.body);
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cart = await cartService.removeFromCart(req.user!.id, req.params.id);
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cart = await cartService.clearCart(req.user!.id);
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

