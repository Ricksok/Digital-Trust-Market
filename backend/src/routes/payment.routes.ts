/**
 * Payment Routes
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as paymentController from '../controllers/payment.controller';

const router = Router();

/**
 * POST /api/payments/initiate
 * Initiate a payment (authenticated)
 */
router.post('/initiate', authenticate, paymentController.initiatePayment);

/**
 * POST /api/payments/webhook
 * Handle payment webhook (public - webhook signature verified in controller)
 */
router.post('/webhook', paymentController.handleWebhook);

/**
 * GET /api/payments
 * Get user's payments (authenticated)
 */
router.get('/', authenticate, paymentController.getPayments);

/**
 * GET /api/payments/:id
 * Get payment status by ID (authenticated)
 */
router.get('/:id', authenticate, paymentController.getPaymentStatus);

/**
 * POST /api/payments/:id/refund
 * Refund a payment (authenticated)
 */
router.post('/:id/refund', authenticate, paymentController.refundPayment);

export default router;


