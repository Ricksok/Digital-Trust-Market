/**
 * Onboarding Routes
 * Feature 0.1: Onboarding & Identity System
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as onboardingController from '../controllers/onboarding.controller';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

/**
 * POST /api/onboarding/register
 * Register new user (public endpoint)
 */
router.post(
  '/register',
  validateRequest({
    body: {
      email: { type: 'string', required: true, email: true },
      password: { type: 'string', required: true, minLength: 8 },
      firstName: { type: 'string', required: false },
      lastName: { type: 'string', required: false },
      phone: { type: 'string', required: false },
      role: {
        type: 'string',
        required: true,
        enum: ['RETAIL_TRADER', 'SUPPLIER', 'BUYER'],
      },
      entityType: {
        type: 'string',
        required: false,
        enum: ['INDIVIDUAL', 'COMPANY', 'SACCO', 'FUND', 'INSTITUTIONAL_BUYER'],
      },
      walletAddress: { type: 'string', required: false },
    },
  }),
  onboardingController.register
);

/**
 * POST /api/onboarding/business/verify
 * Submit business verification (authenticated)
 */
router.post(
  '/business/verify',
  authenticate,
  validateRequest({
    body: {
      registrationNumber: { type: 'string', required: true },
      companyName: { type: 'string', required: true },
      legalStructure: { type: 'string', required: true },
      registrationDate: { type: 'date', required: false },
      expiryDate: { type: 'date', required: false },
      documentUrl: { type: 'string', required: false },
    },
  }),
  onboardingController.submitBusinessVerification
);

/**
 * POST /api/onboarding/membership/link
 * Link co-op or SACCO membership (authenticated)
 */
router.post(
  '/membership/link',
  authenticate,
  validateRequest({
    body: {
      organizationType: {
        type: 'string',
        required: true,
        enum: ['COOP', 'SACCO'],
      },
      organizationId: { type: 'string', required: true },
      membershipNumber: { type: 'string', required: true },
    },
  }),
  onboardingController.linkMembership
);

/**
 * GET /api/onboarding/status
 * Get onboarding status (authenticated)
 */
router.get('/status', authenticate, onboardingController.getOnboardingStatus);

/**
 * GET /api/onboarding/profile
 * Get user profile with permissions (authenticated)
 */
router.get('/profile', authenticate, onboardingController.getUserProfile);

/**
 * POST /api/onboarding/complete
 * Mark onboarding as complete (authenticated)
 */
router.post('/complete', authenticate, onboardingController.completeOnboarding);

export default router;

