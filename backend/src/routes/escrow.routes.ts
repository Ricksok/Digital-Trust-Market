import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as escrowController from '../controllers/escrow.controller';

const router = express.Router();

router.post('/create', authenticate, escrowController.createEscrow);
router.get('/:id', authenticate, escrowController.getEscrow);
router.post('/:id/release', authenticate, escrowController.releaseEscrow);
router.post('/:id/refund', authenticate, escrowController.refundEscrow);
router.post('/:id/dispute', authenticate, escrowController.createDispute);
router.get('/investment/:investmentId', authenticate, escrowController.getEscrowByInvestment);

export default router;


