/**
 * Trust Routes
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as trustController from '../controllers/trust.controller';

const router = Router();

/**
 * GET /api/trust
 * Get own trust score (authenticated)
 */
router.get('/', authenticate, trustController.getTrustScore);

/**
 * POST /api/trust/activity
 * Track user activity (authenticated)
 */
router.post('/activity', authenticate, trustController.trackActivity);

/**
 * POST /api/trust/admin/process-decay
 * Batch process trust decay (admin only)
 */
router.post('/admin/process-decay', authenticate, trustController.processDecayBatch);

/**
 * GET /api/trust/:entityId
 * Get trust score for entity (authenticated)
 */
router.get('/:entityId', authenticate, trustController.getTrustScore);

/**
 * GET /api/trust/:entityId/history
 * Get trust score history (authenticated)
 */
router.get('/:entityId/history', authenticate, trustController.getTrustScoreHistory);

/**
 * GET /api/trust/:entityId/explain
 * Explain trust score breakdown (authenticated)
 */
router.get('/:entityId/explain', authenticate, trustController.explainTrustScore);

/**
 * GET /api/trust/:entityId/decay-recovery
 * Get decay/recovery history (authenticated)
 */
router.get('/:entityId/decay-recovery', authenticate, trustController.getDecayRecoveryHistory);

/**
 * POST /api/trust/:entityId/recalculate
 * Recalculate trust score (authenticated)
 */
router.post('/:entityId/recalculate', authenticate, trustController.recalculateTrustScore);

/**
 * POST /api/trust/:entityId/adjust
 * Manually adjust trust score (admin only)
 */
router.post('/:entityId/adjust', authenticate, trustController.adjustTrustScore);

export default router;

