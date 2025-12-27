/**
 * Onboarding Routes
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Placeholder routes - to be implemented
router.post('/register', (req, res) => {
  res.json({ message: 'Register user - to be implemented' });
});

router.get('/status', authenticate, (req, res) => {
  res.json({ message: 'Get onboarding status - to be implemented' });
});

router.post('/business-verification', authenticate, (req, res) => {
  res.json({ message: 'Business verification - to be implemented' });
});

router.post('/membership-linkage', authenticate, (req, res) => {
  res.json({ message: 'Membership linkage - to be implemented' });
});

export default router;
