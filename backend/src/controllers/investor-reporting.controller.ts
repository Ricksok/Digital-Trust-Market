import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as investorReportingService from '../services/investor-reporting.service';
import { authenticate } from '../middleware/auth.middleware';

/**
 * Generate Portfolio Report
 * POST /api/investor-reporting/portfolio
 */
export const generatePortfolioReport = [
  authenticate,
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

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
        });
      }
      const report = await investorReportingService.generatePortfolioReport(userId, period);

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: { message: error.message || 'Failed to generate portfolio report' },
      });
    }
  },
];

/**
 * Generate Impact Report
 * POST /api/investor-reporting/impact
 */
export const generateImpactReport = [
  authenticate,
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

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
        });
      }
      const report = await investorReportingService.generateImpactReport(userId, period);

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: { message: error.message || 'Failed to generate impact report' },
      });
    }
  },
];

/**
 * Generate Financial Report
 * POST /api/investor-reporting/financial
 */
export const generateFinancialReport = [
  authenticate,
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

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
        });
      }
      const report = await investorReportingService.generateFinancialReport(userId, period);

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: { message: error.message || 'Failed to generate financial report' },
      });
    }
  },
];

/**
 * Get investor reports
 * GET /api/investor-reporting
 */
export const getInvestorReports = [
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { reportType, period, status } = req.query as { reportType?: string; period?: string; status?: string };

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
        });
      }
      const reports = await investorReportingService.getInvestorReports(userId, {
        reportType: reportType as string,
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
        error: { message: error.message || 'Failed to get investor reports' },
      });
    }
  },
];

/**
 * Get single investor report
 * GET /api/investor-reporting/:id
 */
export const getInvestorReport = [
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params as { id: string };
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
        });
      }
      const report = await investorReportingService.getInvestorReport(id, userId);

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: { message: error.message || 'Failed to get investor report' },
      });
    }
  },
];

/**
 * Publish report
 * POST /api/investor-reporting/:id/publish
 */
export const publishReport = [
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params as { id: string };
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
        });
      }
      const report = await investorReportingService.publishReport(id, userId);

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: { message: error.message || 'Failed to publish report' },
      });
    }
  },
];

