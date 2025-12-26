import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as paymentController from '../controllers/payment.controller';

const router = express.Router();

router.post('/initiate', authenticate, paymentController.initiatePayment);
router.post('/webhook', paymentController.handleWebhook);
router.get('/:id', authenticate, paymentController.getPaymentStatus);
router.get('/', authenticate, paymentController.getPayments);
router.post('/:id/refund', authenticate, paymentController.refundPayment);

export default router;


