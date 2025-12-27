/**
 * KYC Routes
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as kycController from '../controllers/kyc.controller';

const router = Router();

/**
 * POST /api/kyc/submit
 * Submit KYC documents (authenticated)
 */
router.post('/submit', authenticate, kycController.submitKYC);

/**
 * GET /api/kyc/status
 * Get KYC status (authenticated)
 */
router.get('/status', authenticate, kycController.getKYCStatus);

/**
 * POST /api/kyc/verify
 * Verify KYC (admin only)
 */
router.post('/verify', authenticate, kycController.verifyKYC);

/**
 * GET /api/kyc/:id
 * Get KYC record by ID (authenticated)
 */
router.get('/:id', authenticate, kycController.getKYCRecord);

export default router;


