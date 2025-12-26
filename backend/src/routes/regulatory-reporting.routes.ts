import { Router } from 'express';
import * as regulatoryReportingController from '../controllers/regulatory-reporting.controller';

const router = Router();

// Generate reports (admin only - middleware in controller)
router.post('/capital-markets', ...regulatoryReportingController.generateCapitalMarketsReport as any);
router.post('/sacco', ...regulatoryReportingController.generateSACCOReport as any);
router.post('/tax', ...regulatoryReportingController.generateTaxReport as any);
router.post('/aml', ...regulatoryReportingController.generateAMLReport as any);

// Get reports (authenticated users - middleware in controller)
router.get('/', ...regulatoryReportingController.getRegulatoryReports as any);
router.get('/:id', ...regulatoryReportingController.getRegulatoryReport as any);

// Submit report (admin only - middleware in controller)
router.post('/:id/submit', ...regulatoryReportingController.submitReport as any);

export default router;

