/**
 * Authentication Routes
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as authController from '../controllers/auth.controller';

const router = Router();

/**
 * POST /api/auth/register
 * Register new user (public)
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Login user (public)
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/web3/connect
 * Connect Web3 wallet (public)
 */
router.post('/web3/connect', authController.connectWallet);

/**
 * POST /api/auth/web3/verify
 * Verify Web3 wallet signature (public)
 */
router.post('/web3/verify', authController.verifyWallet);

/**
 * POST /api/auth/refresh
 * Refresh access token (public)
 */
router.post('/refresh', authController.refreshToken);

/**
 * POST /api/auth/logout
 * Logout user (authenticated)
 */
router.post('/logout', authenticate, authController.logout);

/**
 * GET /api/auth/me
 * Get current user (authenticated)
 */
router.get('/me', authenticate, authController.getCurrentUser);

export default router;


