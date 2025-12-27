/**
 * Escrow Routes
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as escrowController from '../controllers/escrow.controller';

const router = Router();

/**
 * POST /api/escrow/create
 * Create escrow contract (authenticated)
 */
router.post('/create', authenticate, escrowController.createEscrow);

/**
 * GET /api/escrow/investment/:investmentId
 * Get escrow by investment ID (authenticated)
 */
router.get('/investment/:investmentId', authenticate, escrowController.getEscrowByInvestment);

/**
 * GET /api/escrow/:id
 * Get escrow by ID (authenticated)
 */
router.get('/:id', authenticate, escrowController.getEscrow);

/**
 * POST /api/escrow/:id/release
 * Release escrow funds (authenticated)
 */
router.post('/:id/release', authenticate, escrowController.releaseEscrow);

/**
 * POST /api/escrow/:id/refund
 * Refund escrow funds (authenticated)
 */
router.post('/:id/refund', authenticate, escrowController.refundEscrow);

/**
 * POST /api/escrow/:id/dispute
 * Create escrow dispute (authenticated)
 */
router.post('/:id/dispute', authenticate, escrowController.createDispute);

export default router;


