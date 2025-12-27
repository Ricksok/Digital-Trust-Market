/**
 * Vendor Central Routes
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All vendor central routes require authentication
router.use(authenticate);

// Placeholder routes - to be implemented
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Vendor dashboard - to be implemented' });
});

router.get('/products', (req, res) => {
  res.json({ message: 'Get vendor products - to be implemented' });
});

router.post('/products', (req, res) => {
  res.json({ message: 'Create product - to be implemented' });
});

export default router;
