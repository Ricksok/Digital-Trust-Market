import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as investmentController from '../controllers/investment.controller';

const router = express.Router();

// Allow any authenticated user to create investments (authorization check happens in service)
router.post('/', authenticate, investmentController.createInvestment);
router.get('/', authenticate, investmentController.getInvestments);
router.get('/:id', authenticate, investmentController.getInvestmentById);
router.post('/:id/cancel', authenticate, investmentController.cancelInvestment);
router.get('/project/:projectId', authenticate, investmentController.getProjectInvestments);

export default router;


