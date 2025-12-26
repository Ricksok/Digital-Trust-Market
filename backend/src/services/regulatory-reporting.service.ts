import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// Report Types
const REPORT_TYPES = {
  CAPITAL_MARKETS: 'CAPITAL_MARKETS',
  SACCO: 'SACCO',
  TAX: 'TAX',
  AML_CFT: 'AML_CFT',
};

// Regulator Types
const REGULATOR_TYPES = {
  CMA: 'CMA', // Capital Markets Authority
  SASRA: 'SASRA', // SACCO Societies Regulatory Authority
  KRA: 'KRA', // Kenya Revenue Authority
  FRC: 'FRC', // Financial Reporting Centre (AML/CFT)
};

// Report Status
const REPORT_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
};

/**
 * Generate Capital Markets Report
 * Aggregates private placement activity, secondary trading, market surveillance, issuer governance
 */
export const generateCapitalMarketsReport = async (period: string, createdBy?: string) => {
  // Parse period (YYYY-MM or YYYY-Q1, etc.)
  const [year, periodPart] = period.split('-');
  const isQuarterly = periodPart?.startsWith('Q');
  const quarter = isQuarterly ? parseInt(periodPart.substring(1)) : null;
  
  const startDate = isQuarterly
    ? new Date(parseInt(year), (quarter! - 1) * 3, 1)
    : new Date(parseInt(year), parseInt(periodPart || '1') - 1, 1);
  const endDate = isQuarterly
    ? new Date(parseInt(year), quarter! * 3, 0, 23, 59, 59)
    : new Date(parseInt(year), parseInt(periodPart || '12'), 31, 23, 59, 59);

  // Aggregate private placement activity (investments)
  const investments = await prisma.investment.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      status: { in: ['APPROVED', 'ESCROWED', 'RELEASED'] },
    },
    include: {
      project: {
        include: {
          fundraiser: true,
        },
      },
      investor: true,
    },
  });

  // Aggregate secondary trading (if implemented)
  // TODO: Add secondary trading data when SEE is extended

  // Aggregate auction activity
  const auctions = await prisma.auction.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      auctionType: 'CAPITAL',
    },
    include: {
      bids: {
        include: {
          bidder: true,
        },
      },
      project: true,
    },
  });

  // Calculate metrics
  const totalPlacements = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalAuctions = auctions.length;
  const totalBids = auctions.reduce((sum, auc) => sum + auc.bids.length, 0);
  const uniqueIssuers = new Set(investments.map(inv => inv.project.fundraiserId)).size;
  const uniqueInvestors = new Set(investments.map(inv => inv.investorId)).size;

  // Market surveillance alerts (anomalies)
  const alerts = [];
  const avgInvestment = totalPlacements / investments.length || 0;
  const largeInvestments = investments.filter(inv => inv.amount > avgInvestment * 3);
  if (largeInvestments.length > 0) {
    alerts.push({
      type: 'LARGE_TRANSACTION',
      count: largeInvestments.length,
      description: 'Unusually large investment transactions detected',
    });
  }

  // Issuer governance compliance
  const projects = await prisma.project.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    include: {
      fundraiser: {
        include: {
          trustScore: true,
          kycRecord: true,
        },
      },
    },
  });

  const complianceIssues = projects.filter(
    p => !p.fundraiser.kycRecord || p.fundraiser.kycRecord.status !== 'APPROVED'
  );

  const reportData = {
    period,
    summary: {
      totalPlacements,
      totalAuctions,
      totalBids,
      uniqueIssuers,
      uniqueInvestors,
      averageInvestment: avgInvestment,
    },
    placements: investments.map(inv => ({
      id: inv.id,
      amount: inv.amount,
      projectId: inv.projectId,
      issuerId: inv.project.fundraiserId,
      issuerName: inv.project.fundraiser.companyName || `${inv.project.fundraiser.firstName} ${inv.project.fundraiser.lastName}`,
      investorId: inv.investorId,
      investorName: inv.investor.companyName || `${inv.investor.firstName} ${inv.investor.lastName}`,
      timestamp: inv.createdAt,
    })),
    auctions: auctions.map(auc => ({
      id: auc.id,
      title: auc.title,
      totalBids: auc.bids.length,
      clearedPrice: auc.clearedPrice,
      status: auc.status,
    })),
    alerts,
    compliance: {
      totalIssuers: projects.length,
      compliantIssuers: projects.length - complianceIssues.length,
      nonCompliantIssuers: complianceIssues.length,
      issues: complianceIssues.map(p => ({
        projectId: p.id,
        issuerId: p.fundraiserId,
        issue: !p.fundraiser.kycRecord ? 'No KYC' : 'KYC not approved',
      })),
    },
  };

  // Create report
  const report = await prisma.regulatoryReport.create({
    data: {
      reportType: REPORT_TYPES.CAPITAL_MARKETS,
      regulatorType: REGULATOR_TYPES.CMA,
      period,
      status: REPORT_STATUS.DRAFT,
      reportData: JSON.stringify(reportData),
      createdBy,
    },
  });

  // Create report transactions
  const reportTransactions = investments.map(inv => ({
    reportId: report.id,
    transactionId: inv.id,
    transactionType: 'INVESTMENT',
    amount: inv.amount,
    currency: 'KES',
    timestamp: inv.createdAt,
    parties: JSON.stringify([inv.investorId, inv.project.fundraiserId]),
  }));

  await prisma.regulatoryReportTransaction.createMany({
    data: reportTransactions,
  });

  return {
    ...report,
    reportData: JSON.parse(report.reportData),
  };
};

/**
 * Generate SACCO Report
 * Member participation, liquidity circulation, guarantee exposure, governance compliance
 */
export const generateSACCOReport = async (period: string, createdBy?: string) => {
  const [year, periodPart] = period.split('-');
  const isQuarterly = periodPart?.startsWith('Q');
  const quarter = isQuarterly ? parseInt(periodPart.substring(1)) : null;
  
  const startDate = isQuarterly
    ? new Date(parseInt(year), (quarter! - 1) * 3, 1)
    : new Date(parseInt(year), parseInt(periodPart || '1') - 1, 1);
  const endDate = isQuarterly
    ? new Date(parseInt(year), quarter! * 3, 0, 23, 59, 59)
    : new Date(parseInt(year), parseInt(periodPart || '12'), 31, 23, 59, 59);

  // Get SACCO members (users with entityType SACCO or role related to SACCO)
  const saccoMembers = await prisma.user.findMany({
    where: {
      entityType: 'SACCO',
      createdAt: { lte: endDate },
    },
    include: {
      investments: {
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      },
      projects: {
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      },
      guaranteeAllocations: {
        where: {
          allocatedAt: { gte: startDate, lte: endDate },
        },
      },
      trustScore: true,
    },
  });

  // Calculate metrics
  const totalMembers = saccoMembers.length;
  const activeMembers = saccoMembers.filter(m => m.isActive).length;
  const totalInvestments = saccoMembers.reduce((sum, m) => sum + m.investments.reduce((s, inv) => s + inv.amount, 0), 0);
  const totalFundraising = saccoMembers.reduce((sum, m) => sum + m.projects.reduce((s, p) => s + p.currentAmount, 0), 0);
  const totalGuaranteeExposure = saccoMembers.reduce((sum, m) => sum + m.guaranteeAllocations.reduce((s, g) => s + (g.amount || 0), 0), 0);

  // Governance credential compliance
  const compliantMembers = saccoMembers.filter(m => m.trustScore && m.trustScore.trustScore >= 70);

  const reportData = {
    period,
    summary: {
      totalMembers,
      activeMembers,
      participationRate: (activeMembers / totalMembers) * 100,
      totalInvestments,
      totalFundraising,
      totalGuaranteeExposure,
      averageTrustScore: saccoMembers.reduce((sum, m) => sum + (m.trustScore?.trustScore || 0), 0) / totalMembers || 0,
    },
    members: saccoMembers.map(m => ({
      id: m.id,
      name: m.companyName || `${m.firstName} ${m.lastName}`,
      isActive: m.isActive,
      trustScore: m.trustScore?.trustScore || 0,
      investments: m.investments.length,
      projects: m.projects.length,
      guaranteeExposure: m.guaranteeAllocations.reduce((sum, g) => sum + (g.amount || 0), 0),
    })),
    compliance: {
      totalMembers,
      compliantMembers: compliantMembers.length,
      complianceRate: (compliantMembers.length / totalMembers) * 100,
    },
  };

  const report = await prisma.regulatoryReport.create({
    data: {
      reportType: REPORT_TYPES.SACCO,
      regulatorType: REGULATOR_TYPES.SASRA,
      period,
      status: REPORT_STATUS.DRAFT,
      reportData: JSON.stringify(reportData),
      createdBy,
    },
  });

  return {
    ...report,
    reportData: JSON.parse(report.reportData),
  };
};

/**
 * Generate Tax Report
 * Transaction-level tax registers, eTIMS/iTax exports, reconciliation
 */
export const generateTaxReport = async (period: string, createdBy?: string) => {
  const [year, periodPart] = period.split('-');
  const isQuarterly = periodPart?.startsWith('Q');
  const quarter = isQuarterly ? parseInt(periodPart.substring(1)) : null;
  
  const startDate = isQuarterly
    ? new Date(parseInt(year), (quarter! - 1) * 3, 1)
    : new Date(parseInt(year), parseInt(periodPart || '1') - 1, 1);
  const endDate = isQuarterly
    ? new Date(parseInt(year), quarter! * 3, 0, 23, 59, 59)
    : new Date(parseInt(year), parseInt(periodPart || '12'), 31, 23, 59, 59);

  // Get all transactions (payments, investments, etc.)
  const payments = await prisma.payment.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      status: 'COMPLETED',
    },
    include: {
      investment: {
        include: {
          project: true,
        },
      },
    },
  });

  // Calculate tax implications
  const transactions = payments.map(payment => {
    const amount = payment.amount;
    // VAT calculation (16% in Kenya, but may vary)
    const vatRate = 0.16;
    const vatAmount = amount * vatRate;
    const amountExcludingVAT = amount - vatAmount;
    
    // WHT (Withholding Tax) - typically 5% for services
    const whtRate = 0.05;
    const whtAmount = amountExcludingVAT * whtRate;
    
    // CGT (Capital Gains Tax) - may apply to investment returns
    const cgtRate = 0.05; // 5% for capital gains
    const cgtAmount = 0; // TODO: Calculate from investment performance

    return {
      transactionId: payment.id,
      transactionType: 'PAYMENT',
      amount,
      amountExcludingVAT,
      vatAmount,
      whtAmount,
      cgtAmount,
      timestamp: payment.createdAt,
      parties: JSON.stringify([payment.investment?.investorId, payment.investment?.project?.fundraiserId].filter(Boolean)),
      taxImplications: JSON.stringify({
        vat: { rate: vatRate, amount: vatAmount },
        wht: { rate: whtRate, amount: whtAmount },
        cgt: { rate: cgtRate, amount: cgtAmount },
      }),
    };
  });

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalVAT = transactions.reduce((sum, t) => sum + t.vatAmount, 0);
  const totalWHT = transactions.reduce((sum, t) => sum + t.whtAmount, 0);
  const totalCGT = transactions.reduce((sum, t) => sum + t.cgtAmount, 0);

  const reportData = {
    period,
    summary: {
      totalTransactions: transactions.length,
      totalAmount,
      totalVAT,
      totalWHT,
      totalCGT,
      totalTaxLiability: totalVAT + totalWHT + totalCGT,
    },
    transactions,
    taxBreakdown: {
      vat: { total: totalVAT, count: transactions.filter(t => t.vatAmount > 0).length },
      wht: { total: totalWHT, count: transactions.filter(t => t.whtAmount > 0).length },
      cgt: { total: totalCGT, count: transactions.filter(t => t.cgtAmount > 0).length },
    },
  };

  const report = await prisma.regulatoryReport.create({
    data: {
      reportType: REPORT_TYPES.TAX,
      regulatorType: REGULATOR_TYPES.KRA,
      period,
      status: REPORT_STATUS.DRAFT,
      reportData: JSON.stringify(reportData),
      createdBy,
    },
  });

  // Create report transactions
  const reportTransactions = transactions.map(t => ({
    reportId: report.id,
    transactionId: t.transactionId,
    transactionType: t.transactionType,
    amount: t.amount,
    currency: 'KES',
    timestamp: t.timestamp,
    parties: t.parties,
    taxImplications: t.taxImplications,
  }));

  await prisma.regulatoryReportTransaction.createMany({
    data: reportTransactions,
  });

  return {
    ...report,
    reportData: JSON.parse(report.reportData),
  };
};

/**
 * Generate AML/CFT Report
 * Suspicious transaction monitoring, large transaction summaries, compliance flags
 */
export const generateAMLReport = async (period: string, createdBy?: string) => {
  const [year, periodPart] = period.split('-');
  const isQuarterly = periodPart?.startsWith('Q');
  const quarter = isQuarterly ? parseInt(periodPart.substring(1)) : null;
  
  const startDate = isQuarterly
    ? new Date(parseInt(year), (quarter! - 1) * 3, 1)
    : new Date(parseInt(year), parseInt(periodPart || '1') - 1, 1);
  const endDate = isQuarterly
    ? new Date(parseInt(year), quarter! * 3, 0, 23, 59, 59)
    : new Date(parseInt(year), parseInt(periodPart || '12'), 31, 23, 59, 59);

  // Get all large transactions (threshold: 1,000,000 KES)
  const largeTransactionThreshold = 1000000;
  
  const payments = await prisma.payment.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      status: 'COMPLETED',
      amount: { gte: largeTransactionThreshold },
    },
    include: {
      investment: {
        include: {
          investor: {
            include: {
              kycRecord: true,
              trustScore: true,
            },
          },
          project: {
            include: {
              fundraiser: {
                include: {
                  kycRecord: true,
                  trustScore: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Identify suspicious patterns
  const suspiciousTransactions: Array<{
    transactionId: string;
    amount: number;
    timestamp: Date;
    investorId?: string;
    investorName: string;
    flags: string[];
  }> = [];
  
  for (const payment of payments) {
    const flags = [];
    
    // Flag 1: Large transaction without KYC
    if (!payment.investment?.investor?.kycRecord || payment.investment.investor.kycRecord.status !== 'APPROVED') {
      flags.push('NO_KYC_APPROVAL');
    }
    
    // Flag 2: Low trust score
    if (payment.investment?.investor?.trustScore && payment.investment.investor.trustScore.trustScore < 50) {
      flags.push('LOW_TRUST_SCORE');
    }
    
    // Flag 3: Multiple large transactions in short period
    const recentTransactions = payments.filter(
      p => p.investment?.investorId === payment.investment?.investorId &&
      Math.abs(p.createdAt.getTime() - payment.createdAt.getTime()) < 7 * 24 * 60 * 60 * 1000 // Within 7 days
    );
    if (recentTransactions.length > 3) {
      flags.push('MULTIPLE_LARGE_TRANSACTIONS');
    }
    
    if (flags.length > 0) {
      suspiciousTransactions.push({
        transactionId: payment.id,
        amount: payment.amount,
        timestamp: payment.createdAt,
        investorId: payment.investment?.investorId,
        investorName: payment.investment?.investor?.companyName || `${payment.investment?.investor?.firstName} ${payment.investment?.investor?.lastName}`,
        flags,
      });
    }
  }

  const reportData = {
    period,
    summary: {
      totalLargeTransactions: payments.length,
      suspiciousTransactions: suspiciousTransactions.length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      averageTransaction: payments.length > 0 ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length : 0,
    },
    largeTransactions: payments.map(p => ({
      id: p.id,
      amount: p.amount,
      timestamp: p.createdAt,
      investorId: p.investment?.investorId,
      investorName: p.investment?.investor?.companyName || `${p.investment?.investor?.firstName} ${p.investment?.investor?.lastName}`,
      fundraiserId: p.investment?.project?.fundraiserId,
      fundraiserName: p.investment?.project?.fundraiser?.companyName || `${p.investment?.project?.fundraiser?.firstName} ${p.investment?.project?.fundraiser?.lastName}`,
    })),
    suspiciousTransactions,
  };

  const report = await prisma.regulatoryReport.create({
    data: {
      reportType: REPORT_TYPES.AML_CFT,
      regulatorType: REGULATOR_TYPES.FRC,
      period,
      status: REPORT_STATUS.DRAFT,
      reportData: JSON.stringify(reportData),
      createdBy,
    },
  });

  // Create report transactions
  const reportTransactions = payments.map(p => ({
    reportId: report.id,
    transactionId: p.id,
    transactionType: 'PAYMENT',
    amount: p.amount,
    currency: 'KES',
    timestamp: p.createdAt,
    parties: JSON.stringify([p.investment?.investorId, p.investment?.project?.fundraiserId].filter(Boolean)),
    complianceFlags: JSON.stringify(
      suspiciousTransactions.find(st => st.transactionId === p.id)?.flags || []
    ),
  }));

  await prisma.regulatoryReportTransaction.createMany({
    data: reportTransactions,
  });

  return {
    ...report,
    reportData: JSON.parse(report.reportData),
  };
};

/**
 * Get all regulatory reports
 */
export const getRegulatoryReports = async (filters?: {
  reportType?: string;
  regulatorType?: string;
  period?: string;
  status?: string;
}) => {
  const reports = await prisma.regulatoryReport.findMany({
    where: {
      ...(filters?.reportType && { reportType: filters.reportType }),
      ...(filters?.regulatorType && { regulatorType: filters.regulatorType }),
      ...(filters?.period && { period: filters.period }),
      ...(filters?.status && { status: filters.status }),
    },
    include: {
      creator: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      transactions: {
        take: 10, // Limit for list view
      },
    },
    orderBy: {
      generatedAt: 'desc',
    },
  });

  return reports.map(report => ({
    ...report,
    reportData: JSON.parse(report.reportData),
  }));
};

/**
 * Get single regulatory report
 */
export const getRegulatoryReport = async (reportId: string) => {
  const report = await prisma.regulatoryReport.findUnique({
    where: { id: reportId },
    include: {
      creator: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      transactions: {
        orderBy: {
          timestamp: 'desc',
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
  };
};

/**
 * Submit report to regulator
 */
export const submitReport = async (reportId: string) => {
  const report = await prisma.regulatoryReport.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    throw createError('Report not found', 404);
  }

  if (report.status !== REPORT_STATUS.DRAFT) {
    throw createError('Report can only be submitted from DRAFT status', 400);
  }

  // TODO: Integrate with external regulator API
  // For now, just update status
  const updated = await prisma.regulatoryReport.update({
    where: { id: reportId },
    data: {
      status: REPORT_STATUS.SUBMITTED,
      submittedAt: new Date(),
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      action: 'REPORT_SUBMITTED',
      entityType: 'REGULATORY_REPORT',
      entityId: reportId,
      changes: JSON.stringify({ status: REPORT_STATUS.SUBMITTED }),
    },
  });

  return {
    ...updated,
    reportData: JSON.parse(updated.reportData),
  };
};

