import { Request, Response } from 'express';
import * as checkoutService from '../services/checkout.service';
import { CheckoutInput } from '../types/cart.types';

/**
 * Create order from cart
 */
export async function checkout(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: { message: 'Unauthorized' } });
    }

    const input: CheckoutInput = req.body;
    const order = await checkoutService.createOrder(userId, input);
    res.json({ data: order });
  } catch (error: any) {
    console.error('Error in checkout controller:', error);
    res.status(error.statusCode || 500).json({
      error: {
        message: error.message || 'Failed to create order',
      },
    });
  }
}

/**
 * Get user's orders
 */
export async function getOrders(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: { message: 'Unauthorized' } });
    }

    const orders = await checkoutService.getUserOrders(userId);
    res.json({ data: orders });
  } catch (error: any) {
    console.error('Error in getOrders controller:', error);
    res.status(error.statusCode || 500).json({
      error: {
        message: error.message || 'Failed to get orders',
      },
    });
  }
}

/**
 * Get order by ID
 */
export async function getOrder(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: { message: 'Unauthorized' } });
    }

    const { id } = req.params;
    const order = await checkoutService.getOrderById(id, userId);
    res.json({ data: order });
  } catch (error: any) {
    console.error('Error in getOrder controller:', error);
    res.status(error.statusCode || 500).json({
      error: {
        message: error.message || 'Failed to get order',
      },
    });
  }
}

