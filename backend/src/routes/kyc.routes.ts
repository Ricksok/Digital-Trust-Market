import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as kycController from '../controllers/kyc.controller';

const router = express.Router();

router.post('/submit', authenticate, kycController.submitKYC);
router.get('/status', authenticate, kycController.getKYCStatus);
router.get('/:id', authenticate, kycController.getKYCRecord);
router.post('/verify', authenticate, kycController.verifyKYC);

export default router;


