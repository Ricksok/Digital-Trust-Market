import { Router } from 'express';
import * as investorReportingController from '../controllers/investor-reporting.controller';

const router = Router();

// Generate reports (authenticated users - middleware in controller)
router.post('/portfolio', ...investorReportingController.generatePortfolioReport as any);
router.post('/impact', ...investorReportingController.generateImpactReport as any);
router.post('/financial', ...investorReportingController.generateFinancialReport as any);

// Get reports (authenticated users - middleware in controller)
router.get('/', ...investorReportingController.getInvestorReports as any);
router.get('/:id', ...investorReportingController.getInvestorReport as any);

// Publish report (authenticated users - middleware in controller)
router.post('/:id/publish', ...investorReportingController.publishReport as any);

export default router;

