import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any; // Temporary workaround until Prisma client is regenerated

// String constants for SQLite (no enums)
const ProjectStatus = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  FUNDED: 'FUNDED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

const InvestmentStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  ESCROWED: 'ESCROWED',
  RELEASED: 'RELEASED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED',
};

const PaymentStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
};

const EscrowStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  RELEASED: 'RELEASED',
  REFUNDED: 'REFUNDED',
  DISPUTED: 'DISPUTED',
};
import { createError } from '../middleware/errorHandler';

// prisma is already defined at the top of the file

const projectTemplates = [
  {
    title: 'Solar Power Plant',
    description: 'Development of a renewable energy solar power plant',
    category: 'Renewable Energy',
    targetAmount: 50000000,
    minInvestment: 50000,
    maxInvestment: 5000000,
  },
  {
    title: 'Affordable Housing Complex',
    description: 'Construction of affordable housing units',
    category: 'Real Estate',
    targetAmount: 80000000,
    minInvestment: 100000,
    maxInvestment: 10000000,
  },
  {
    title: 'AgriTech Mobile Platform',
    description: 'Mobile platform for agricultural services',
    category: 'Technology',
    targetAmount: 15000000,
    minInvestment: 25000,
    maxInvestment: 2000000,
  },
  {
    title: 'Clean Water Initiative',
    description: 'Water purification and borehole installation project',
    category: 'Social Enterprise',
    targetAmount: 25000000,
    minInvestment: 50000,
    maxInvestment: 3000000,
  },
  {
    title: 'E-Learning Platform',
    description: 'Educational platform for rural schools',
    category: 'Education',
    targetAmount: 12000000,
    minInvestment: 20000,
    maxInvestment: 1500000,
  },
];

export const generateProjects = async (count: number = 5) => {
  const fundraisers = await prisma.user.findMany({
    where: { userType: 'FUNDRAISER' },
    take: count,
  });

  if (fundraisers.length === 0) {
    throw createError('No fundraisers found. Please seed the database first.', 404);
  }

  const projects = [];
  const statuses = [ProjectStatus.DRAFT, ProjectStatus.PENDING_APPROVAL, ProjectStatus.APPROVED, ProjectStatus.ACTIVE];

  for (let i = 0; i < count; i++) {
    const template = projectTemplates[i % projectTemplates.length];
    const fundraiser = fundraisers[i % fundraisers.length];
    const status = statuses[i % statuses.length];

    const project = await prisma.project.create({
      data: {
        title: `${template.title} ${i + 1}`,
        description: template.description,
        category: template.category,
        fundraiserId: fundraiser.id,
        targetAmount: template.targetAmount,
        currentAmount: 0,
        minInvestment: template.minInvestment,
        maxInvestment: template.maxInvestment,
        status: status,
        images: JSON.stringify([`https://example.com/images/project${i + 1}.jpg`]),
        documents: JSON.stringify([`https://example.com/documents/project${i + 1}.pdf`]),
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });

    projects.push(project);
  }

  return projects;
};

export const generateInvestments = async (count: number = 10) => {
  const investors = await prisma.user.findMany({
    where: { userType: 'INVESTOR' },
    take: count,
  });

  const projects = await prisma.project.findMany({
    where: {
      status: {
        in: [ProjectStatus.APPROVED, ProjectStatus.ACTIVE],
      },
    },
    take: count,
  });

  if (investors.length === 0 || projects.length === 0) {
    throw createError('No investors or active projects found. Please seed the database first.', 404);
  }

  const investments = [];
  const statuses = [InvestmentStatus.PENDING, InvestmentStatus.APPROVED, InvestmentStatus.ESCROWED];
  const amounts = [50000, 100000, 250000, 500000, 1000000, 2000000, 5000000];

  for (let i = 0; i < count; i++) {
    const investor = investors[i % investors.length];
    const project = projects[i % projects.length];
    const amount = amounts[i % amounts.length];
    const status = statuses[i % statuses.length];

    // Ensure amount is within project limits
    const finalAmount = Math.max(
      Number(project.minInvestment),
      Math.min(amount, Number(project.maxInvestment || amount))
    );

    const investment = await prisma.investment.create({
      data: {
        investorId: investor.id,
        projectId: project.id,
        amount: finalAmount,
        status: status,
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        notes: `Demo investment in ${project.title}`,
      },
    });

    investments.push(investment);

    // Update project current amount
    await prisma.project.update({
      where: { id: project.id },
      data: {
        currentAmount: {
          increment: finalAmount,
        },
      },
    });

    // Create payment for approved/escrowed investments
    if (status === InvestmentStatus.APPROVED || status === InvestmentStatus.ESCROWED) {
      await prisma.payment.create({
        data: {
          userId: investor.id,
          investmentId: investment.id,
          amount: finalAmount,
          currency: 'KES',
          status: PaymentStatus.COMPLETED,
          paymentMethod: 'BANK_TRANSFER',
          transactionId: `TXN${Date.now()}${i}`,
        },
      });

      // Create escrow for escrowed investments
      if (status === InvestmentStatus.ESCROWED) {
        await prisma.escrowContract.create({
          data: {
            investmentId: investment.id,
            projectId: project.id,
            contractAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
            amount: finalAmount,
            status: EscrowStatus.ACTIVE,
            releaseConditions: JSON.stringify({
              milestone: 'Project milestone completion',
            }),
          },
        });
      }
    }
  }

  return investments;
};

export const resetDemoData = async () => {
  // Delete demo data (keep admin and seed data)
  await prisma.auditLog.deleteMany();
  await prisma.complianceRecord.deleteMany();
  await prisma.dueDiligence.deleteMany();
  await prisma.escrowContract.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.investment.deleteMany();
  await prisma.project.deleteMany();

  // Reset project amounts
  await prisma.project.updateMany({
    data: { currentAmount: 0 },
  });
};

/**
 * Generate dummy auctions
 */
export const generateAuctions = async (count: number = 5) => {
  const projects = await prisma.project.findMany({
    where: {
      status: { in: [ProjectStatus.APPROVED, ProjectStatus.ACTIVE] },
    },
    take: count,
  });

  if (projects.length === 0) {
    throw createError('No active projects found. Create projects first.', 400);
  }

  const auctions = [];
  const auctionTypes = ['CAPITAL', 'GUARANTEE', 'SUPPLY_CONTRACT'];
  const now = new Date();

  for (let i = 0; i < Math.min(count, projects.length); i++) {
    const project = projects[i];
    const auctionType = auctionTypes[i % auctionTypes.length];
    const startTime = new Date(now.getTime() + (i * 24 * 60 * 60 * 1000)); // Stagger start times
    const endTime = new Date(startTime.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days duration

    const auction = await prisma.auction.create({
      data: {
        auctionType,
        projectId: project.id,
        title: `${auctionType} Auction: ${project.title}`,
        description: `Reverse auction for ${project.title}`,
        targetAmount: project.targetAmount * 0.8, // 80% of project target
        reservePrice: project.targetAmount * 0.05, // 5% reserve
        currency: 'KES',
        startTime,
        endTime,
        status: i < 2 ? 'ACTIVE' : 'PENDING', // First 2 are active
        minTrustScore: 50 + (i * 5), // Varying trust requirements
        trustWeight: 1.0 + (i * 0.1), // Varying trust weights
        metadata: JSON.stringify({ generated: true, projectTitle: project.title }),
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    auctions.push(auction);

    // Create some dummy bids for active auctions
    if (auction.status === 'ACTIVE') {
      const investors = await prisma.user.findMany({
        where: {
          userType: 'INVESTOR',
          isVerified: true,
        },
        take: 3,
      });

      for (let j = 0; j < Math.min(3, investors.length); j++) {
        const investor = investors[j];
        const trustScore = await prisma.trustScore.findUnique({
          where: { entityId: investor.id },
        });

        const basePrice = auction.reservePrice || auction.targetAmount || 100000;
        const bidPrice = basePrice * (0.9 - j * 0.05); // Decreasing prices
        const effectiveBid = bidPrice * auction.trustWeight * ((trustScore?.trustScore || 50) / 100);

        await prisma.bid.create({
          data: {
            auctionId: auction.id,
            bidderId: investor.id,
            price: bidPrice,
            amount: auction.targetAmount ? auction.targetAmount * 0.2 : undefined,
            status: 'PENDING',
            bidderTrustScore: trustScore?.trustScore || 50,
            effectiveBid,
            submittedAt: new Date(startTime.getTime() + (j * 60 * 60 * 1000)), // Stagger bid times
          },
        });
      }
    }
  }

  return auctions;
};

/**
 * Generate dummy guarantee requests
 */
export const generateGuaranteeRequests = async (count: number = 5) => {
  const projects = await prisma.project.findMany({
    where: {
      status: { in: [ProjectStatus.APPROVED, ProjectStatus.ACTIVE] },
    },
    take: count,
  });

  if (projects.length === 0) {
    throw createError('No active projects found. Create projects first.', 400);
  }

  const fundraisers = await prisma.user.findMany({
    where: {
      userType: 'FUNDRAISER',
    },
    take: count,
  });

  const requests = [];
  const guaranteeTypes = ['CREDIT_RISK', 'PERFORMANCE_RISK', 'CONTRACT_ASSURANCE'];
  const now = new Date();

  for (let i = 0; i < Math.min(count, projects.length, fundraisers.length); i++) {
    const project = projects[i];
    const fundraiser = fundraisers[i];
    const guaranteeType = guaranteeTypes[i % guaranteeTypes.length];
    const requestedCoverage = 50 + (i * 10); // 50%, 60%, 70%, etc.

    const request = await prisma.guaranteeRequest.create({
      data: {
        issuerId: fundraiser.id,
        projectId: project.id,
        guaranteeType,
        requestedCoverage,
        amount: project.targetAmount * (requestedCoverage / 100),
        currency: 'KES',
        status: i < 2 ? 'AUCTION_ACTIVE' : 'PENDING', // First 2 have active auctions
        requestedAt: new Date(now.getTime() - (i * 2 * 24 * 60 * 60 * 1000)), // Stagger request times
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
        metadata: JSON.stringify({ generated: true, projectTitle: project.title }),
      },
      include: {
        issuer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            companyName: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    requests.push(request);

    // Create auction for active requests
    if (request.status === 'AUCTION_ACTIVE') {
      const auction = await prisma.auction.create({
        data: {
          auctionType: 'GUARANTEE',
          guaranteeRequestId: request.id,
          title: `Guarantee Auction: ${guaranteeType}`,
          description: `Reverse auction for guarantee allocation. Coverage: ${requestedCoverage}%`,
          currency: 'KES',
          startTime: new Date(),
          endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
          status: 'ACTIVE',
          minTrustScore: 60,
          trustWeight: 1.2,
        },
      });

      await prisma.guaranteeRequest.update({
        where: { id: request.id },
        data: { auctionId: auction.id },
      });

      // Create some dummy guarantee bids
      const guarantors = await prisma.user.findMany({
        where: {
          userType: { in: ['INVESTOR', 'FUNDRAISER'] },
          isVerified: true,
        },
        take: 3,
      });

      for (let j = 0; j < Math.min(3, guarantors.length); j++) {
        const guarantor = guarantors[j];
        const guarantorScore = await prisma.guarantorScore.findUnique({
          where: { entityId: guarantor.id },
        });

        const coveragePercent = requestedCoverage * (0.8 - j * 0.1); // Decreasing coverage
        const feePercent = 2.0 + (j * 0.5); // Increasing fees
        const layer = j === 0 ? 'FIRST_LOSS' : j === 1 ? 'MEZZANINE' : 'SENIOR';
        const effectiveBid = feePercent * 1.2 * ((guarantorScore?.guaranteeTrustScore || 50) / 100);

        await prisma.guaranteeBid.create({
          data: {
            guaranteeRequestId: request.id,
            guarantorId: guarantor.id,
            coveragePercent,
            feePercent,
            layer,
            status: 'PENDING',
            guarantorTrustScore: guarantorScore?.guaranteeTrustScore || 50,
            effectiveBid,
            submittedAt: new Date(now.getTime() - (j * 2 * 60 * 60 * 1000)), // Stagger bid times
          },
        });
      }
    }
  }

  return requests;
};


