/**
 * Onboarding Controller
 * Feature 0.1: Onboarding & Identity System
 */

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as onboardingService from '../services/onboarding.service';
import { createError } from '../middleware/errorHandler';
import jwt, { SignOptions } from 'jsonwebtoken';

/**
 * Generate JWT token for user
 */
const generateToken = (user: any) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw createError('JWT secret not configured', 500);
  }
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as SignOptions
  );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (user: any) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw createError('JWT secret not configured', 500);
  }
  return jwt.sign({ id: user.id }, secret, { expiresIn: '30d' });
};

/**
 * Register new user with onboarding workflow
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await onboardingService.registerUser(req.body);
    
    // Generate tokens
    const token = generateToken({ id: profile.id, email: profile.email, role: profile.roles[0] || 'RETAIL_TRADER' });
    const refreshToken = generateRefreshToken({ id: profile.id });
    
    res.status(201).json({
      success: true,
      data: {
        ...profile,
        token,
        refreshToken,
      },
      message: 'User registered successfully. Please complete onboarding.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit business verification
 */
export const submitBusinessVerification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw createError('Unauthorized', 401);
    }

    await onboardingService.submitBusinessVerification(req.user.id, req.body);
    res.json({
      success: true,
      message: 'Business verification submitted. Awaiting admin approval.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Link co-op or SACCO membership
 */
export const linkMembership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw createError('Unauthorized', 401);
    }

    await onboardingService.linkMembership(req.user.id, req.body);
    res.json({
      success: true,
      message: 'Membership linkage submitted. Awaiting verification.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get onboarding status
 */
export const getOnboardingStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw createError('Unauthorized', 401);
    }

    const status = await onboardingService.getOnboardingStatus(req.user.id);
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user profile with permissions
 */
export const getUserProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw createError('Unauthorized', 401);
    }

    const profile = await onboardingService.getUserProfile(req.user.id);
    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete onboarding
 */
export const completeOnboarding = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      throw createError('Unauthorized', 401);
    }

    await onboardingService.completeOnboarding(req.user.id);
    res.json({
      success: true,
      message: 'Onboarding completed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

