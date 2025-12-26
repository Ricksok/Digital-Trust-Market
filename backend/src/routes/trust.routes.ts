import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as trustController from '../controllers/trust.controller';

const router = express.Router();

// All trust routes require authentication
router.get('/:entityId', authenticate, trustController.getTrustScore);
router.get('/:entityId/history', authenticate, trustController.getTrustScoreHistory);
router.get('/:entityId/explain', authenticate, trustController.explainTrustScore);
router.post('/:entityId/recalculate', authenticate, trustController.recalculateTrustScore);
router.post('/:entityId/adjust', authenticate, trustController.adjustTrustScore);

// Get own trust score (shorthand)
router.get('/', authenticate, trustController.getTrustScore);

export default router;

