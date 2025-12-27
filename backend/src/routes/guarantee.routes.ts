import { Router } from 'express';
import * as guaranteeController from '../controllers/guarantee.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Guarantee requests
router.post('/requests', requirePermission('guarantees.request'), guaranteeController.createGuaranteeRequest);
router.get('/requests', requirePermission('guarantees.view'), guaranteeController.getGuaranteeRequests);
router.get('/requests/:id', requirePermission('guarantees.view'), guaranteeController.getGuaranteeRequestById);

// Guarantee auctions
router.post('/requests/:id/auction', requirePermission('guarantees.allocate'), guaranteeController.createGuaranteeAuction);
router.post('/requests/:id/bids', requirePermission('guarantees.bid'), guaranteeController.placeGuaranteeBid);
router.post('/requests/:id/allocate', requirePermission('guarantees.allocate'), guaranteeController.allocateGuarantees);

export default router;

