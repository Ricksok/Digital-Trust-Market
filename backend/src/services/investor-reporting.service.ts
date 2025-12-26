import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// Report Types
const REPORT_TYPES = {
  PORTFOLIO: 'PORTFOLIO',
  IMPACT: 'IMPACT',
  FINANCIAL: 'FINANCIAL',
  QUARTERLY: 'QUARTERLY',
  ANNUAL: 'ANNUAL',
};

// Report Status
const REPORT_STATUS = {
  DRAFT: 'DRAFT',
  GENERATED: 'GENERATED',
  PUBLISHED: 'PUBLISHED',
};

// Impact Dimensions
const IMPACT_DIMENSIONS = {
  ECONOMIC_INCLUSION: 'ECONOMIC_INCLUSION',
  TRADE_ENABLEMENT: 'TRADE_ENABLEMENT',
  EMPLOYMENT: 'EMPLOYMENT',
  GOVERNANCE: 'GOVERNANCE',
  ENVIRONMENTAL: 'ENVIRONMENTAL',
  FISCAL: 'FISCAL',
};

/**
 * Generate Portfolio Report
 * Financial performance, NAV, cashflow, yield, repayment status
 */
export const generatePortfolioReport = async (investorId: string, period: string) => {
  const [year, periodPart] = period.split('-');
  const isQuarterly = periodPart?.startsWith('Q');
  const quarter = isQuarterly ? parseInt(periodPart.substring(1)) : null;
  
  const startDate = isQuarterly
    ? new Date(parseInt(year), (quarter! - 1) * 3, 1)
    : new Date(parseInt(year), parseInt(periodPart || '1') - 1, 1);
  const endDate = isQuarterly
    ? new Date(parseInt(year), quarter! * 3, 0, 23, 59, 59)
    : new Date(parseInt(year), parseInt(periodPart || '12'), 31, 23, 59, 59);

  // Get investor investments
  const investments = await prisma.investment.findMany({
    where: {
      investorId,
      createdAt: { lte: endDate },
    },
    include: {
      project: {
        include: {
          fundraiser: {
            include: {
              trustScore: true,
            },
          },
        },
      },
      payments: {
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      },
    },
  });

  // Calculate financial metrics
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  // Returns are calculated from project performance, not stored on investment
  const totalReturns = 0; // TODO: Calculate from project performance metrics
  const activeInvestments = investments.filter(inv => inv.status === 'ESCROWED' || inv.status === 'RELEASED');
  const completedInvestments = investments.filter(inv => inv.status === 'RELEASED' && inv.project.status === 'COMPLETED');
  const defaultedInvestments = investments.filter(inv => inv.project.status === 'CANCELLED');
  
  // Calculate NAV (Net Asset Value)
  const currentValue = investments.reduce((sum, inv) => {
    if (inv.status === 'RELEASED' && inv.project.status === 'ACTIVE') {
      // Active investment: current value = invested amount (returns calculated separately)
      return sum + inv.amount;
    } else if (inv.status === 'ESCROWED') {
      // Escrowed: current value = invested amount
      return sum + inv.amount;
    }
    return sum;
  }, 0);

  const nav = currentValue;
  const yieldPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

  // Cashflow tracking
  const cashflow = investments.flatMap(inv => 
    inv.payments.map(payment => ({
      date: payment.createdAt,
      type: payment.investmentId ? 'INVESTMENT' : 'OTHER',
      amount: payment.amount,
      direction: payment.investmentId ? 'OUT' : 'IN',
    }))
  ).sort((a, b) => a.date.getTime() - b.date.getTime());

  const totalCashOut = cashflow.filter(cf => cf.direction === 'OUT').reduce((sum, cf) => sum + cf.amount, 0);
  const totalCashIn = cashflow.filter(cf => cf.direction === 'IN').reduce((sum, cf) => sum + cf.amount, 0);

  const reportData = {
    period,
    investorId,
    financial: {
      totalInvested,
      totalReturns,
      nav,
      yield: yieldPercentage,
      totalCashOut,
      totalCashIn,
      netCashflow: totalCashIn - totalCashOut,
    },
    portfolio: {
      totalInvestments: investments.length,
      activeInvestments: activeInvestments.length,
      completedInvestments: completedInvestments.length,
      defaultedInvestments: defaultedInvestments.length,
      defaultRate: investments.length > 0 ? (defaultedInvestments.length / investments.length) * 100 : 0,
    },
    cashflow,
  };

  // Create report
  const report = await prisma.investorReport.create({
    data: {
      investorId,
      reportType: REPORT_TYPES.PORTFOLIO,
      period,
      status: REPORT_STATUS.GENERATED,
      portfolioValue: nav,
      totalInvested,
      totalReturns,
      yield: yieldPercentage,
      reportData: JSON.stringify(reportData),
    },
  });

  // Create report investments
  const reportInvestments = investments.map(inv => ({
    reportId: report.id,
    investmentId: inv.id,
    projectId: inv.projectId,
    amount: inv.amount,
    currentValue: inv.amount, // Returns calculated separately
    returns: 0, // TODO: Calculate from project performance
    status: inv.status,
    performance: JSON.stringify({
      projectStatus: inv.project.status,
      projectTitle: inv.project.title,
      fundraiserTrustScore: inv.project.fundraiser.trustScore?.trustScore || 0,
    }),
  }));

  await prisma.investorReportInvestment.createMany({
    data: reportInvestments,
  });

  return {
    ...report,
    reportData: JSON.parse(report.reportData),
  };
};

/**
 * Generate Impact Report
 * Impact matrices linking economic activity to measurable outcomes
 */
export const generateImpactReport = async (investorId: string, period: string) => {
  const [year, periodPart] = period.split('-');
  const isQuarterly = periodPart?.startsWith('Q');
  const quarter = isQuarterly ? parseInt(periodPart.substring(1)) : null;
  
  const startDate = isQuarterly
    ? new Date(parseInt(year), (quarter! - 1) * 3, 1)
    : new Date(parseInt(year), parseInt(periodPart || '1') - 1, 1);
  const endDate = isQuarterly
    ? new Date(parseInt(year), quarter! * 3, 0, 23, 59, 59)
    : new Date(parseInt(year), parseInt(periodPart || '12'), 31, 23, 59, 59);

  // Get investor investments with projects
  const investments = await prisma.investment.findMany({
    where: {
      investorId,
      createdAt: { lte: endDate },
    },
    include: {
      project: {
        include: {
          fundraiser: {
            include: {
              trustScore: true,
            },
          },
        },
      },
    },
  });

  // Calculate impact metrics by dimension
  const impactData = [];

  // Economic Inclusion
  const msmeProjects = investments.filter(inv => 
    inv.project.fundraiser.userType === 'FUNDRAISER' &&
    ['SME_STARTUP', 'SOCIAL_ENTERPRISE'].includes(inv.project.fundraiser.role)
  );
  impactData.push({
    dimension: IMPACT_DIMENSIONS.ECONOMIC_INCLUSION,
    metric: 'MSMEs Supported',
    value: msmeProjects.length,
    unit: 'count',
    dataSource: 'DTE',
  });

  // Trade Enablement
  const tradeVolume = investments.reduce((sum, inv) => {
    // Estimate trade volume from project metadata
    const metadata = inv.project.metadata ? JSON.parse(inv.project.metadata) : {};
    return sum + (metadata.tradeVolume || 0);
  }, 0);
  impactData.push({
    dimension: IMPACT_DIMENSIONS.TRADE_ENABLEMENT,
    metric: 'Trade Volume Enabled',
    value: tradeVolume,
    unit: 'KES',
    dataSource: 'TEE',
  });

  // Employment
  const totalJobs = investments.reduce((sum, inv) => {
    const metadata = inv.project.metadata ? JSON.parse(inv.project.metadata) : {};
    return sum + (metadata.jobsCreated || 0);
  }, 0);
  impactData.push({
    dimension: IMPACT_DIMENSIONS.EMPLOYMENT,
    metric: 'Jobs Created',
    value: totalJobs,
    unit: 'count',
    dataSource: 'DTE',
  });

  // Governance
  const avgTrustScore = investments.reduce((sum, inv) => 
    sum + (inv.project.fundraiser.trustScore?.trustScore || 0), 0
  ) / investments.length || 0;
  impactData.push({
    dimension: IMPACT_DIMENSIONS.GOVERNANCE,
    metric: 'Average Trust Score',
    value: avgTrustScore,
    unit: 'score',
    dataSource: 'DTE',
  });

  // Environmental (if applicable)
  const environmentalProjects = investments.filter(inv => 
    inv.project.category === 'Renewable Energy' || 
    inv.project.category === 'Environmental'
  );
  impactData.push({
    dimension: IMPACT_DIMENSIONS.ENVIRONMENTAL,
    metric: 'Environmental Projects',
    value: environmentalProjects.length,
    unit: 'count',
    dataSource: 'TEE',
  });

  // Fiscal Contribution
  const totalTaxContribution = investments.reduce((sum, inv) => {
    // Estimate tax from investment amount (16% VAT + 5% WHT)
    return sum + (inv.amount * 0.21);
  }, 0);
  impactData.push({
    dimension: IMPACT_DIMENSIONS.FISCAL,
    metric: 'Tax Contribution',
    value: totalTaxContribution,
    unit: 'KES',
    dataSource: 'TAE',
  });

  const reportData = {
    period,
    investorId,
    summary: {
      totalProjects: investments.length,
      totalInvestment: investments.reduce((sum, inv) => sum + inv.amount, 0),
      impactDimensions: impactData.length,
    },
    impactMetrics: impactData,
    projects: investments.map(inv => ({
      projectId: inv.projectId,
      projectTitle: inv.project.title,
      category: inv.project.category,
      amount: inv.amount,
      impact: {
        jobsCreated: JSON.parse(inv.project.metadata || '{}').jobsCreated || 0,
        beneficiaries: JSON.parse(inv.project.metadata || '{}').beneficiaries || 0,
      },
    })),
  };

  // Create report
  const report = await prisma.investorReport.create({
    data: {
      investorId,
      reportType: REPORT_TYPES.IMPACT,
      period,
      status: REPORT_STATUS.GENERATED,
      impactMetrics: JSON.stringify(impactData),
      reportData: JSON.stringify(reportData),
    },
  });

  // Create impact data records
  const impactRecords = impactData.map(impact => ({
    reportId: report.id,
    dimension: impact.dimension,
    metric: impact.metric,
    value: impact.value,
    unit: impact.unit,
    dataSource: impact.dataSource,
  }));

  await prisma.investorReportImpact.createMany({
    data: impactRecords,
  });

  return {
    ...report,
    reportData: JSON.parse(report.reportData),
  };
};

/**
 * Generate Financial Report
 * Comprehensive financial performance reporting
 */
export const generateFinancialReport = async (investorId: string, period: string) => {
  // Combine portfolio and impact data
  const portfolioReport = await generatePortfolioReport(investorId, period);
  const impactReport = await generateImpactReport(investorId, period);

  const reportData = {
    period,
    investorId,
    financial: portfolioReport.reportData.financial,
    portfolio: portfolioReport.reportData.portfolio,
    impact: impactReport.reportData.impactMetrics,
    cashflow: portfolioReport.reportData.cashflow,
  };

  const report = await prisma.investorReport.create({
    data: {
      investorId,
      reportType: REPORT_TYPES.FINANCIAL,
      period,
      status: REPORT_STATUS.GENERATED,
      portfolioValue: portfolioReport.portfolioValue,
      totalInvested: portfolioReport.totalInvested,
      totalReturns: portfolioReport.totalReturns,
      yield: portfolioReport.yield,
      impactMetrics: impactReport.impactMetrics,
      reportData: JSON.stringify(reportData),
    },
  });

  return {
    ...report,
    reportData: JSON.parse(report.reportData),
  };
};

/**
 * Get investor reports
 */
export const getInvestorReports = async (investorId: string, filters?: {
  reportType?: string;
  period?: string;
  status?: string;
}) => {
  const reports = await prisma.investorReport.findMany({
    where: {
      investorId,
      ...(filters?.reportType && { reportType: filters.reportType }),
      ...(filters?.period && { period: filters.period }),
      ...(filters?.status && { status: filters.status }),
    },
    include: {
      investments: {
        take: 10,
      },
      impactData: true,
    },
    orderBy: {
      generatedAt: 'desc',
    },
  });

  return reports.map(report => ({
    ...report,
    reportData: JSON.parse(report.reportData),
    impactMetrics: report.impactMetrics ? JSON.parse(report.impactMetrics) : null,
  }));
};

/**
 * Get single investor report
 */
export const getInvestorReport = async (reportId: string, investorId: string) => {
  const report = await prisma.investorReport.findFirst({
    where: {
      id: reportId,
      investorId,
    },
    include: {
      investments: true,
      impactData: {
        orderBy: {
          dimension: 'asc',
        },
      },
    },
  });

  if (!report) {
    throw createError('Report not found', 404);
  }

  return {
    ...report,
    reportData: JSON.parse(report.reportData),
    impactMetrics: report.impactMetrics ? JSON.parse(report.impactMetrics) : null,
  };
};

/**
 * Publish report
 */
export const publishReport = async (reportId: string, investorId: string) => {
  const report = await prisma.investorReport.findFirst({
    where: {
      id: reportId,
      investorId,
    },
  });

  if (!report) {
    throw createError('Report not found', 404);
  }

  const updated = await prisma.investorReport.update({
    where: { id: reportId },
    data: {
      status: REPORT_STATUS.PUBLISHED,
      publishedAt: new Date(),
    },
  });

  return {
    ...updated,
    reportData: JSON.parse(updated.reportData),
    impactMetrics: updated.impactMetrics ? JSON.parse(updated.impactMetrics) : null,
  };
};

