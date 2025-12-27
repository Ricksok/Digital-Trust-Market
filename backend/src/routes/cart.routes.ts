/**
 * Cart Routes
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as cartController from '../controllers/cart.controller';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

// Cart routes
router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/:id', cartController.updateCartItem);
router.delete('/:id', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

export default router;
