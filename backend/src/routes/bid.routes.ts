/**
 * Bid Routes
 * Separate routes for bid operations
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import * as auctionController from '../controllers/auction.controller';

const router = Router();

// Get user's bids - requires authentication
router.get('/', authenticate, requirePermission('auctions.bid'), auctionController.getUserBids);

// Get bid by ID - requires authentication
router.get('/:id', authenticate, requirePermission('auctions.bid'), auctionController.getBidById);

// Update bid - requires ownership
router.put('/:id', authenticate, requirePermission('auctions.bid'), auctionController.updateBid);

export default router;

