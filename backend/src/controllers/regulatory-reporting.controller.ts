import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as regulatoryReportingService from '../services/regulatory-reporting.service';
import { authenticate, authorize } from '../middleware/auth.middleware';

/**
 * Generate Capital Markets Report
 * POST /api/regulatory-reporting/capital-markets
 */
export const generateCapitalMarketsReport = [
  authenticate,
  authorize('ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { period } = req.body;
      const userId = req.user?.id;

      if (!period) {
        return res.status(400).json({
          success: false,
          error: { message: 'Period is required (format: YYYY-MM or YYYY-Q1)' },
        });
      }

      const report = await regulatoryReportingService.generateCapitalMarketsReport(period, userId);

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: { message: error.message || 'Failed to generate capital markets report' },
      });
    }
  },
];

/**
 * Generate SACCO Report
 * POST /api/regulatory-reporting/sacco
 */
export const generateSACCOReport = [
  authenticate,
  authorize('ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { period } = req.body;
      const userId = req.user?.id;

      if (!period) {
        return res.status(400).json({
          success: false,
          error: { message: 'Period is required (format: YYYY-MM or YYYY-Q1)' },
        });
      }

      const report = await regulatoryReportingService.generateSACCOReport(period, userId);

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: { message: error.message || 'Failed to generate SACCO report' },
      });
    }
  },
];

/**
 * Generate Tax Report
 * POST /api/regulatory-reporting/tax
 */
export const generateTaxReport = [
  authenticate,
  authorize('ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { period } = req.body;
      const userId = req.user?.id;

      if (!period) {
        return res.status(400).json({
          success: false,
          error: { message: 'Period is required (format: YYYY-MM or YYYY-Q1)' },
        });
      }

      const report = await regulatoryReportingService.generateTaxReport(period, userId);

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: { message: error.message || 'Failed to generate tax report' },
      });
    }
  },
];

/**
 * Generate AML/CFT Report
 * POST /api/regulatory-reporting/aml
 */
export const generateAMLReport = [
  authenticate,
  authorize('ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { period } = req.body;
      const userId = req.user?.id;

      if (!period) {
        return res.status(400).json({
          success: false,
          error: { message: 'Period is required (format: YYYY-MM or YYYY-Q1)' },
        });
      }

      const report = await regulatoryReportingService.generateAMLReport(period, userId);

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: { message: error.message || 'Failed to generate AML report' },
      });
    }
  },
];

/**
 * Get all regulatory reports
 * GET /api/regulatory-reporting
 */
export const getRegulatoryReports = [
  authenticate,
  authorize('ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const query = req.query as { reportType?: string; regulatorType?: string; period?: string; status?: string };
      const { reportType, regulatorType, period, status } = query;

      const reports = await regulatoryReportingService.getRegulatoryReports({
        reportType: reportType as string,
        regulatorType: regulatorType as string,
        period: period as string,
        status: status as string,
      });

      res.json({
        success: true,
        data: reports,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: { message: error.message || 'Failed to get regulatory reports' },
      });
    }
  },
];

/**
 * Get single regulatory report
 * GET /api/regulatory-reporting/:id
 */
export const getRegulatoryReport = [
  authenticate,
  authorize('ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const params = req.params as { id: string };
      const { id } = params;

      const report = await regulatoryReportingService.getRegulatoryReport(id);

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: { message: error.message || 'Failed to get regulatory report' },
      });
    }
  },
];

/**
 * Submit report to regulator
 * POST /api/regulatory-reporting/:id/submit
 */
export const submitReport = [
  authenticate,
  authorize('ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const params = req.params as { id: string };
      const { id } = params;

      const report = await regulatoryReportingService.submitReport(id);

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: { message: error.message || 'Failed to submit report' },
      });
    }
  },
];

