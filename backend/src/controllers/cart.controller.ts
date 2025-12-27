import { Request, Response } from 'express';
import * as cartService from '../services/cart.service';
import { AddToCartInput, UpdateCartItemInput } from '../types/cart.types';

/**
 * Get user's cart
 */
export async function getCart(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: { message: 'Unauthorized' } });
    }

    const cart = await cartService.getCart(userId);
    res.json({ data: cart });
  } catch (error: any) {
    console.error('Error in getCart controller:', error);
    res.status(error.statusCode || 500).json({
      error: {
        message: error.message || 'Failed to get cart',
      },
    });
  }
}

/**
 * Add item to cart
 */
export async function addToCart(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: { message: 'Unauthorized' } });
    }

    const input: AddToCartInput = req.body;
    const cartItem = await cartService.addToCart(userId, input);
    res.json({ data: cartItem });
  } catch (error: any) {
    console.error('Error in addToCart controller:', error);
    res.status(error.statusCode || 500).json({
      error: {
        message: error.message || 'Failed to add item to cart',
      },
    });
  }
}

/**
 * Update cart item
 */
export async function updateCartItem(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: { message: 'Unauthorized' } });
    }

    const { id } = req.params;
    const input: UpdateCartItemInput = req.body;
    const cartItem = await cartService.updateCartItem(userId, id, input);
    res.json({ data: cartItem });
  } catch (error: any) {
    console.error('Error in updateCartItem controller:', error);
    res.status(error.statusCode || 500).json({
      error: {
        message: error.message || 'Failed to update cart item',
      },
    });
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: { message: 'Unauthorized' } });
    }

    const { id } = req.params;
    await cartService.removeFromCart(userId, id);
    res.json({ data: { success: true } });
  } catch (error: any) {
    console.error('Error in removeFromCart controller:', error);
    res.status(error.statusCode || 500).json({
      error: {
        message: error.message || 'Failed to remove item from cart',
      },
    });
  }
}

/**
 * Clear cart
 */
export async function clearCart(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: { message: 'Unauthorized' } });
    }

    await cartService.clearCart(userId);
    res.json({ data: { success: true } });
  } catch (error: any) {
    console.error('Error in clearCart controller:', error);
    res.status(error.statusCode || 500).json({
      error: {
        message: error.message || 'Failed to clear cart',
      },
    });
  }
}

