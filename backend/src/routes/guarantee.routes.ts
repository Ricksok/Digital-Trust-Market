import { Router } from 'express';
import * as guaranteeController from '../controllers/guarantee.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Guarantee requests
router.post('/requests', guaranteeController.createGuaranteeRequest);
router.get('/requests', guaranteeController.getGuaranteeRequests);
router.get('/requests/:id', guaranteeController.getGuaranteeRequestById);

// Guarantee auctions
router.post('/requests/:id/auction', authorize('ADMIN'), guaranteeController.createGuaranteeAuction);
router.post('/requests/:id/bids', guaranteeController.placeGuaranteeBid);
router.post('/requests/:id/allocate', authorize('ADMIN'), guaranteeController.allocateGuarantees);

export default router;

