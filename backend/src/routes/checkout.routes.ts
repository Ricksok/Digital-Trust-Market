import { Router } from 'express';
import * as checkoutController from '../controllers/checkout.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All checkout routes require authentication
router.use(authenticate);

router.post('/checkout', checkoutController.checkout);
router.get('/orders', checkoutController.getOrders);
router.get('/orders/:id', checkoutController.getOrder);

export default router;

