import { Router } from 'express';
import * as auctionController from '../controllers/auction.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', auctionController.getAuctions);

// Protected routes
router.post('/', authenticate, authorize('ADMIN', 'FUNDRAISER'), auctionController.createAuction);

// Public routes (must come after POST routes to avoid conflicts)
router.get('/:id', auctionController.getAuctionById);
router.post('/:id/start', authenticate, authorize('ADMIN'), auctionController.startAuction);
router.post('/:id/bids', authenticate, auctionController.placeBid);
router.post('/:id/close', authenticate, authorize('ADMIN'), auctionController.closeAuction);
router.post('/bids/:bidId/withdraw', authenticate, auctionController.withdrawBid);

export default router;

