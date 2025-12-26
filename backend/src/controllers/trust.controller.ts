import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as trustService from '../services/trust.service';

export const getTrustScore = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const entityId = req.params.entityId || req.user!.id;
    const trustScore = await trustService.getTrustScore(entityId);
    res.json({ success: true, data: trustScore });
  } catch (error) {
    next(error);
  }
};

export const getTrustScoreHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const entityId = req.params.entityId || req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const history = await trustService.getTrustScoreHistory(entityId, limit);
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

export const explainTrustScore = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const entityId = req.params.entityId || req.user!.id;
    const explanation = await trustService.explainTrustScore(entityId);
    res.json({ success: true, data: explanation });
  } catch (error) {
    next(error);
  }
};

export const recalculateTrustScore = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const entityId = req.params.entityId || req.user!.id;
    const triggerType = req.body.triggerType || 'MANUAL';
    const triggerEntityId = req.body.triggerEntityId;
    const triggerEntityType = req.body.triggerEntityType;
    
    const trustScore = await trustService.recalculateTrustScores(
      entityId,
      triggerType,
      triggerEntityId,
      triggerEntityType
    );
    res.json({ success: true, data: trustScore });
  } catch (error) {
    next(error);
  }
};

export const adjustTrustScore = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Only admins can manually adjust trust scores
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: { message: 'Insufficient permissions' } });
    }

    const entityId = req.params.entityId;
    const adjustment = parseFloat(req.body.adjustment);
    const reason = req.body.reason || 'Manual adjustment';

    if (isNaN(adjustment)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid adjustment value' } });
    }

    const trustScore = await trustService.adjustTrustScore(
      entityId,
      adjustment,
      reason,
      req.user!.id
    );
    res.json({ success: true, data: trustScore });
  } catch (error) {
    next(error);
  }
};

