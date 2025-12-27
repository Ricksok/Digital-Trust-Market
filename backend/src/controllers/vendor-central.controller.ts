/**
 * Vendor Central Controller
 * Feature: Vendor Central Dashboard
 */

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as vendorCentralService from '../services/vendor-central.service';
import { createError } from '../middleware/errorHandler';

/**
 * Get vendor dashboard
 */
export const getDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw createError('Unauthorized', 401);
    }

    const dashboard = await vendorCentralService.getVendorDashboard(req.user.id);
    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

