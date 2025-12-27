import { Router } from 'express';
import * as auctionController from '../controllers/auction.controller';
import { authenticate } from '../middleware/auth.middleware';
import {
  requirePermission,
  requireOwnership,
  getAuctionOwner,
} from '../middleware/rbac.middleware';
import { learningGate } from '../middleware/learning-gate.middleware';

const router = Router();

// Public routes
router.get('/', auctionController.getAuctions);
router.get('/:id', auctionController.getAuctionById);

// Create auction - requires auctions.create permission
router.post('/', authenticate, requirePermission('auctions.create'), auctionController.createAuction);

// Start auction - requires auctions.start permission (admin)
router.post('/:id/start', authenticate, requirePermission('auctions.start'), auctionController.startAuction);

// Place bid - requires auctions.bid permission + learning gate for reverse auction bidding
// Feature: 'auction.bid.create' or 'rae.bid.create' (reverse auction)
router.post(
  '/:id/bids',
  authenticate,
  requirePermission('auctions.bid'),
  learningGate('auction.bid.create'), // Learning gate for auction bidding
  auctionController.placeBid
);

// Close auction - requires auctions.close permission (admin)
router.post('/:id/close', authenticate, requirePermission('auctions.close'), auctionController.closeAuction);

// Withdraw bid - requires ownership of bid
router.post('/bids/:bidId/withdraw', authenticate, requirePermission('auctions.bid'), auctionController.withdrawBid);

export default router;

