/// <reference types="node" />
import { PrismaClient, User, Project, Investment } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Import trustService from dist (production build only)
// Using dynamic require to avoid tsx compile-time resolution issues
const getTrustService = () => {
  try {
    return require('../dist/services/trust.service');
  } catch {
    return null;
  }
};
const trustService = getTrustService();

const prisma = new PrismaClient() as any; // Temporary workaround until Prisma client is regenerated

// String constants for SQLite (no enums)
const UserRole = {
  INDIVIDUAL_INVESTOR: 'INDIVIDUAL_INVESTOR',
  INSTITUTIONAL_INVESTOR: 'INSTITUTIONAL_INVESTOR',
  IMPACT_FUND: 'IMPACT_FUND',
  SME_STARTUP: 'SME_STARTUP',
  SOCIAL_ENTERPRISE: 'SOCIAL_ENTERPRISE',
  REAL_ESTATE_PROJECT: 'REAL_ESTATE_PROJECT',
  ADMIN: 'ADMIN',
};

const UserType = {
  INVESTOR: 'INVESTOR',
  FUNDRAISER: 'FUNDRAISER',
  END_USER: 'END_USER', // For C2B and B2B end users
};

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

const KYCStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
};

async function main() {
  console.log('🌱 Seeding database with dummy data...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('Clearing existing data...');
  
  // Helper function to safely delete (handles missing tables)
  const safeDelete = async (model: string, deleteFn: () => Promise<any>) => {
    try {
      await deleteFn();
    } catch (error: any) {
      if (error.code === 'P2021') {
        // Table doesn't exist yet - that's okay
        console.log(`   ⚠️  Table ${model} doesn't exist yet, skipping...`);
      } else {
        throw error;
      }
    }
  };

  // Delete in reverse dependency order
  await safeDelete('GuaranteeTokenAllocation', () => prisma.guaranteeTokenAllocation.deleteMany());
  await safeDelete('RewardDistribution', () => prisma.rewardDistribution.deleteMany());
  await safeDelete('Stake', () => prisma.stake.deleteMany());
  await safeDelete('StakingPool', () => prisma.stakingPool.deleteMany());
  await safeDelete('GovernanceVote', () => prisma.governanceVote.deleteMany());
  await safeDelete('GovernanceProposal', () => prisma.governanceProposal.deleteMany());
  await safeDelete('TokenTransaction', () => prisma.tokenTransaction.deleteMany());
  await safeDelete('TokenBalance', () => prisma.tokenBalance.deleteMany());
  await safeDelete('Token', () => prisma.token.deleteMany());
  await safeDelete('GuaranteeAllocation', () => prisma.guaranteeAllocation.deleteMany());
  await safeDelete('GuaranteeBid', () => prisma.guaranteeBid.deleteMany());
  await safeDelete('GuaranteeRequest', () => prisma.guaranteeRequest.deleteMany());
  await safeDelete('Bid', () => prisma.bid.deleteMany());
  await safeDelete('Auction', () => prisma.auction.deleteMany());
  await safeDelete('AnalyticsSnapshot', () => prisma.analyticsSnapshot.deleteMany());
  await safeDelete('TimeSeriesEvent', () => prisma.timeSeriesEvent.deleteMany());
  await safeDelete('EntityRole', () => prisma.entityRole.deleteMany());
  await safeDelete('TrustEvent', () => prisma.trustEvent.deleteMany());
  await safeDelete('GuarantorScore', () => prisma.guarantorScore.deleteMany());
  await safeDelete('ReadinessMetrics', () => prisma.readinessMetrics.deleteMany());
  await safeDelete('BehaviorMetrics', () => prisma.behaviorMetrics.deleteMany());
  await safeDelete('TrustScore', () => prisma.trustScore.deleteMany());
  await safeDelete('AuditLog', () => prisma.auditLog.deleteMany());
  await safeDelete('ComplianceRecord', () => prisma.complianceRecord.deleteMany());
  await safeDelete('DueDiligence', () => prisma.dueDiligence.deleteMany());
  await safeDelete('EscrowContract', () => prisma.escrowContract.deleteMany());
  await safeDelete('Payment', () => prisma.payment.deleteMany());
  await safeDelete('Investment', () => prisma.investment.deleteMany());
  await safeDelete('Project', () => prisma.project.deleteMany());
  await safeDelete('KYCRecord', () => prisma.kYCRecord.deleteMany());
  await safeDelete('User', () => prisma.user.deleteMany());

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@marketplace.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+254700000000',
      role: UserRole.ADMIN,
      userType: UserType.INVESTOR,
      isVerified: true,
      isActive: true,
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create multiple investors
  const investors: User[] = [];
  const investorRoles = [
    UserRole.INDIVIDUAL_INVESTOR,
    UserRole.INSTITUTIONAL_INVESTOR,
    UserRole.IMPACT_FUND,
  ];
  const investorNames = [
    { first: 'John', last: 'Doe' },
    { first: 'Sarah', last: 'Smith' },
    { first: 'Michael', last: 'Johnson' },
    { first: 'Emily', last: 'Williams' },
    { first: 'David', last: 'Brown' },
  ];

  for (let i = 0; i < 5; i++) {
    const password = await bcrypt.hash('investor123', 10);
    const investor = await prisma.user.create({
      data: {
        email: `investor${i + 1}@example.com`,
        passwordHash: password,
        firstName: investorNames[i].first,
        lastName: investorNames[i].last,
        phone: `+25470000000${i + 1}`,
        role: investorRoles[i % investorRoles.length],
        userType: UserType.INVESTOR,
        walletAddress: `0x${'1'.repeat(40 - i.toString().length)}${i}`,
        isVerified: i < 3, // First 3 are verified
        isActive: true,
      },
    });
    investors.push(investor);

    // Create KYC records for verified investors
    if (i < 3) {
      await prisma.kYCRecord.create({
        data: {
          userId: investor.id,
          status: KYCStatus.APPROVED,
          documentType: 'PASSPORT',
          documentNumber: `PASS${1000 + i}`,
          documentUrl: `https://example.com/documents/${investor.id}.pdf`,
          verifiedAt: new Date(),
        },
      });
    }
  }
  console.log(`✅ Created ${investors.length} investors`);

  // Create multiple fundraisers
  const fundraisers: User[] = [];
  const fundraiserRoles = [
    UserRole.SME_STARTUP,
    UserRole.SOCIAL_ENTERPRISE,
    UserRole.REAL_ESTATE_PROJECT,
  ];
  const fundraiserNames = [
    { first: 'Jane', last: 'Fundraiser', company: 'TechStart Kenya' },
    { first: 'Robert', last: 'Mwangi', company: 'Green Energy Solutions' },
    { first: 'Grace', last: 'Ochieng', company: 'Affordable Housing Ltd' },
    { first: 'Peter', last: 'Kamau', company: 'AgriTech Innovations' },
    { first: 'Mary', last: 'Wanjiku', company: 'Social Impact Ventures' },
  ];

  for (let i = 0; i < 5; i++) {
    const password = await bcrypt.hash('fundraiser123', 10);
    const fundraiser = await prisma.user.create({
      data: {
        email: `fundraiser${i + 1}@example.com`,
        passwordHash: password,
        firstName: fundraiserNames[i].first,
        lastName: fundraiserNames[i].last,
        phone: `+25471100000${i + 1}`,
        role: fundraiserRoles[i % fundraiserRoles.length],
        userType: UserType.FUNDRAISER,
        walletAddress: `0x${'9'.repeat(40 - i.toString().length)}${i}`,
        isVerified: i < 3,
        isActive: true,
      },
    });
    fundraisers.push(fundraiser);

    // Create KYC records for verified fundraisers
    if (i < 3) {
      await prisma.kYCRecord.create({
        data: {
          userId: fundraiser.id,
          status: KYCStatus.APPROVED,
          documentType: 'BUSINESS_REGISTRATION',
          documentNumber: `BR${2000 + i}`,
          documentUrl: `https://example.com/documents/${fundraiser.id}.pdf`,
          verifiedAt: new Date(),
        },
      });
    }
  }
  console.log(`✅ Created ${fundraisers.length} fundraisers`);

  // Create additional investors for better test coverage
  const additionalInvestors: User[] = [];
  const additionalInvestorData = [
    // More Individual Investors
    { first: 'James', last: 'Wilson', role: UserRole.INDIVIDUAL_INVESTOR, email: 'james.wilson@example.com', verified: true },
    { first: 'Lisa', last: 'Anderson', role: UserRole.INDIVIDUAL_INVESTOR, email: 'lisa.anderson@example.com', verified: false },
    { first: 'Thomas', last: 'Martinez', role: UserRole.INDIVIDUAL_INVESTOR, email: 'thomas.martinez@example.com', verified: true },
    
    // More Institutional Investors
    { first: 'Patricia', last: 'Taylor', role: UserRole.INSTITUTIONAL_INVESTOR, email: 'patricia.taylor@example.com', verified: true },
    { first: 'Christopher', last: 'Moore', role: UserRole.INSTITUTIONAL_INVESTOR, email: 'christopher.moore@example.com', verified: false },
    { first: 'Jennifer', last: 'Jackson', role: UserRole.INSTITUTIONAL_INVESTOR, email: 'jennifer.jackson@example.com', verified: true },
    
    // More Impact Funds
    { first: 'Daniel', last: 'White', role: UserRole.IMPACT_FUND, email: 'daniel.white@example.com', verified: true },
    { first: 'Linda', last: 'Harris', role: UserRole.IMPACT_FUND, email: 'linda.harris@example.com', verified: false },
    { first: 'Mark', last: 'Clark', role: UserRole.IMPACT_FUND, email: 'mark.clark@example.com', verified: true },
  ];

  for (let i = 0; i < additionalInvestorData.length; i++) {
    const data = additionalInvestorData[i];
    const password = await bcrypt.hash('investor123', 10);
    const investor = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: password,
        firstName: data.first,
        lastName: data.last,
        phone: `+2547000000${10 + i}`,
        role: data.role,
        userType: UserType.INVESTOR,
        walletAddress: `0x${'2'.repeat(40 - (i + 10).toString().length)}${i + 10}`,
        isVerified: data.verified,
        isActive: true,
      },
    });
    additionalInvestors.push(investor);

    // Create KYC records for verified investors
    if (data.verified) {
      await prisma.kYCRecord.create({
        data: {
          userId: investor.id,
          status: KYCStatus.APPROVED,
          documentType: 'PASSPORT',
          documentNumber: `PASS${2000 + i}`,
          documentUrl: `https://example.com/documents/${investor.id}.pdf`,
          verifiedAt: new Date(),
        },
      });
    }
  }
  console.log(`✅ Created ${additionalInvestors.length} additional investors`);

  // Create additional fundraisers for better test coverage
  const additionalFundraisers: User[] = [];
  const additionalFundraiserData = [
    // More SME Startups
    { first: 'Kevin', last: 'Lewis', company: 'FinTech Solutions', role: UserRole.SME_STARTUP, email: 'kevin.lewis@example.com', verified: true },
    { first: 'Nancy', last: 'Walker', company: 'EdTech Innovations', role: UserRole.SME_STARTUP, email: 'nancy.walker@example.com', verified: false },
    { first: 'Steven', last: 'Hall', company: 'HealthTech Kenya', role: UserRole.SME_STARTUP, email: 'steven.hall@example.com', verified: true },
    
    // More Social Enterprises
    { first: 'Betty', last: 'Allen', company: 'Community Development Initiative', role: UserRole.SOCIAL_ENTERPRISE, email: 'betty.allen@example.com', verified: true },
    { first: 'Edward', last: 'Young', company: 'Sustainable Agriculture Co-op', role: UserRole.SOCIAL_ENTERPRISE, email: 'edward.young@example.com', verified: false },
    { first: 'Karen', last: 'King', company: 'Women Empowerment Network', role: UserRole.SOCIAL_ENTERPRISE, email: 'karen.king@example.com', verified: true },
    
    // More Real Estate Projects
    { first: 'Joshua', last: 'Wright', company: 'Urban Development Group', role: UserRole.REAL_ESTATE_PROJECT, email: 'joshua.wright@example.com', verified: true },
    { first: 'Michelle', last: 'Lopez', company: 'Affordable Housing Initiative', role: UserRole.REAL_ESTATE_PROJECT, email: 'michelle.lopez@example.com', verified: false },
    { first: 'Andrew', last: 'Hill', company: 'Commercial Real Estate Ltd', role: UserRole.REAL_ESTATE_PROJECT, email: 'andrew.hill@example.com', verified: true },
  ];

  for (let i = 0; i < additionalFundraiserData.length; i++) {
    const data = additionalFundraiserData[i];
    const password = await bcrypt.hash('fundraiser123', 10);
    const fundraiser = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: password,
        firstName: data.first,
        lastName: data.last,
        phone: `+2547110000${10 + i}`,
        role: data.role,
        userType: UserType.FUNDRAISER,
        companyName: data.company,
        walletAddress: `0x${'8'.repeat(40 - (i + 10).toString().length)}${i + 10}`,
        isVerified: data.verified,
        isActive: true,
      },
    });
    additionalFundraisers.push(fundraiser);

    // Create KYC records for verified fundraisers
    if (data.verified) {
      await prisma.kYCRecord.create({
        data: {
          userId: fundraiser.id,
          status: KYCStatus.APPROVED,
          documentType: 'BUSINESS_REGISTRATION',
          documentNumber: `BR${3000 + i}`,
          documentUrl: `https://example.com/documents/${fundraiser.id}.pdf`,
          verifiedAt: new Date(),
        },
      });
    }
  }
  console.log(`✅ Created ${additionalFundraisers.length} additional fundraisers`);

  // Create C2B (Consumer-to-Business) end users - Individual Consumers
  const c2bConsumers: User[] = [];
  const c2bConsumerData = [
    { first: 'Alice', last: 'Njoroge', email: 'alice.njoroge@example.com', verified: true },
    { first: 'Brian', last: 'Omondi', email: 'brian.omondi@example.com', verified: true },
    { first: 'Catherine', last: 'Wanjala', email: 'catherine.wanjala@example.com', verified: false },
    { first: 'Daniel', last: 'Kipchoge', email: 'daniel.kipchoge@example.com', verified: true },
    { first: 'Esther', last: 'Mwangi', email: 'esther.mwangi@example.com', verified: false },
  ];

  for (let i = 0; i < c2bConsumerData.length; i++) {
    const data = c2bConsumerData[i];
    const password = await bcrypt.hash('consumer123', 10);
    const consumer = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: password,
        firstName: data.first,
        lastName: data.last,
        phone: `+2547220000${i + 1}`,
        role: 'C2B_CONSUMER',
        userType: UserType.END_USER,
        entityType: 'INDIVIDUAL',
        walletAddress: `0x${'3'.repeat(40 - (i + 1).toString().length)}${i + 1}`,
        isVerified: data.verified,
        isActive: true,
      },
    });
    c2bConsumers.push(consumer);

    if (data.verified) {
      await prisma.kYCRecord.create({
        data: {
          userId: consumer.id,
          status: KYCStatus.APPROVED,
          documentType: 'NATIONAL_ID',
          documentNumber: `ID${4000 + i}`,
          documentUrl: `https://example.com/documents/${consumer.id}.pdf`,
          verifiedAt: new Date(),
        },
      });
    }
  }
  console.log(`✅ Created ${c2bConsumers.length} C2B individual consumers`);

  // Create C2B (Consumer-to-Business) end users - Corporate Consumers
  const c2bCorporates: User[] = [];
  const c2bCorporateData = [
    { first: 'Frank', last: 'Kimani', company: 'Retail Chain Ltd', email: 'frank.kimani@retailchain.com', verified: true },
    { first: 'Grace', last: 'Onyango', company: 'Supermarket Group', email: 'grace.onyango@supermarket.com', verified: true },
    { first: 'Henry', last: 'Mutua', company: 'Distribution Co', email: 'henry.mutua@distribution.com', verified: false },
    { first: 'Irene', last: 'Chebet', company: 'Wholesale Traders', email: 'irene.chebet@wholesale.com', verified: true },
    { first: 'Joseph', last: 'Ochieng', company: 'Procurement Services', email: 'joseph.ochieng@procurement.com', verified: false },
  ];

  for (let i = 0; i < c2bCorporateData.length; i++) {
    const data = c2bCorporateData[i];
    const password = await bcrypt.hash('corporate123', 10);
    const corporate = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: password,
        firstName: data.first,
        lastName: data.last,
        phone: `+2547330000${i + 1}`,
        role: 'C2B_CORPORATE',
        userType: UserType.END_USER,
        entityType: 'COMPANY',
        companyName: data.company,
        registrationNumber: `C2B${5000 + i}`,
        legalStructure: 'LLC',
        walletAddress: `0x${'4'.repeat(40 - (i + 1).toString().length)}${i + 1}`,
        isVerified: data.verified,
        isActive: true,
      },
    });
    c2bCorporates.push(corporate);

    if (data.verified) {
      await prisma.kYCRecord.create({
        data: {
          userId: corporate.id,
          status: KYCStatus.APPROVED,
          documentType: 'BUSINESS_REGISTRATION',
          documentNumber: `BR${5000 + i}`,
          documentUrl: `https://example.com/documents/${corporate.id}.pdf`,
          verifiedAt: new Date(),
        },
      });
    }
  }
  console.log(`✅ Created ${c2bCorporates.length} C2B corporate consumers`);

  // Create B2B (Business-to-Business) end users - Individual Traders
  const b2bTraders: User[] = [];
  const b2bTraderData = [
    { first: 'Kevin', last: 'Maina', company: 'Maina Trading', email: 'kevin.maina@trading.com', verified: true },
    { first: 'Lucy', last: 'Waweru', company: 'Waweru Enterprises', email: 'lucy.waweru@enterprises.com', verified: true },
    { first: 'Martin', last: 'Kariuki', company: 'Kariuki Supplies', email: 'martin.kariuki@supplies.com', verified: false },
    { first: 'Nancy', last: 'Gitau', company: 'Gitau Merchants', email: 'nancy.gitau@merchants.com', verified: true },
    { first: 'Oscar', last: 'Muthoni', company: 'Muthoni Trading Co', email: 'oscar.muthoni@trading.com', verified: false },
  ];

  for (let i = 0; i < b2bTraderData.length; i++) {
    const data = b2bTraderData[i];
    const password = await bcrypt.hash('trader123', 10);
    const trader = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: password,
        firstName: data.first,
        lastName: data.last,
        phone: `+2547440000${i + 1}`,
        role: 'B2B_TRADER',
        userType: UserType.END_USER,
        entityType: 'INDIVIDUAL',
        companyName: data.company,
        registrationNumber: `TR${6000 + i}`,
        legalStructure: 'SOLE_PROPRIETORSHIP',
        walletAddress: `0x${'5'.repeat(40 - (i + 1).toString().length)}${i + 1}`,
        isVerified: data.verified,
        isActive: true,
      },
    });
    b2bTraders.push(trader);

    if (data.verified) {
      await prisma.kYCRecord.create({
        data: {
          userId: trader.id,
          status: KYCStatus.APPROVED,
          documentType: 'BUSINESS_REGISTRATION',
          documentNumber: `BR${6000 + i}`,
          documentUrl: `https://example.com/documents/${trader.id}.pdf`,
          verifiedAt: new Date(),
        },
      });
    }
  }
  console.log(`✅ Created ${b2bTraders.length} B2B individual traders`);

  // Create B2B (Business-to-Business) end users - Corporate Businesses
  const b2bCorporates: User[] = [];
  const b2bCorporateData = [
    { first: 'Paul', last: 'Mwangi', company: 'Manufacturing Corp', email: 'paul.mwangi@manufacturing.com', verified: true },
    { first: 'Queen', last: 'Otieno', company: 'Export Import Ltd', email: 'queen.otieno@exportimport.com', verified: true },
    { first: 'Robert', last: 'Kiprotich', company: 'Industrial Supplies Inc', email: 'robert.kiprotich@industrial.com', verified: false },
    { first: 'Susan', last: 'Wanjiru', company: 'Logistics Solutions', email: 'susan.wanjiru@logistics.com', verified: true },
    { first: 'Timothy', last: 'Kibet', company: 'Technology Services Group', email: 'timothy.kibet@techservices.com', verified: false },
  ];

  for (let i = 0; i < b2bCorporateData.length; i++) {
    const data = b2bCorporateData[i];
    const password = await bcrypt.hash('business123', 10);
    const corporate = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: password,
        firstName: data.first,
        lastName: data.last,
        phone: `+2547550000${i + 1}`,
        role: 'B2B_CORPORATE',
        userType: UserType.END_USER,
        entityType: 'COMPANY',
        companyName: data.company,
        registrationNumber: `B2B${7000 + i}`,
        legalStructure: 'CORPORATION',
        walletAddress: `0x${'6'.repeat(40 - (i + 1).toString().length)}${i + 1}`,
        isVerified: data.verified,
        isActive: true,
      },
    });
    b2bCorporates.push(corporate);

    if (data.verified) {
      await prisma.kYCRecord.create({
        data: {
          userId: corporate.id,
          status: KYCStatus.APPROVED,
          documentType: 'BUSINESS_REGISTRATION',
          documentNumber: `BR${7000 + i}`,
          documentUrl: `https://example.com/documents/${corporate.id}.pdf`,
          verifiedAt: new Date(),
        },
      });
    }
  }
  console.log(`✅ Created ${b2bCorporates.length} B2B corporate businesses`);

  // Create Trade Exchange Engine (TEE) - Individual Buyers
  const tradeBuyers: User[] = [];
  const tradeBuyerData = [
    { first: 'Victor', last: 'Onyango', email: 'victor.onyango@trade.com', verified: true },
    { first: 'Winnie', last: 'Kipchumba', email: 'winnie.kipchumba@trade.com', verified: true },
    { first: 'Xavier', last: 'Mwangi', email: 'xavier.mwangi@trade.com', verified: false },
    { first: 'Yvonne', last: 'Chebet', email: 'yvonne.chebet@trade.com', verified: true },
    { first: 'Zachary', last: 'Ochieng', email: 'zachary.ochieng@trade.com', verified: false },
  ];

  for (let i = 0; i < tradeBuyerData.length; i++) {
    const data = tradeBuyerData[i];
    const password = await bcrypt.hash('buyer123', 10);
    const buyer = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: password,
        firstName: data.first,
        lastName: data.last,
        phone: `+2547660000${i + 1}`,
        role: 'TRADE_BUYER',
        userType: UserType.END_USER,
        entityType: 'INDIVIDUAL',
        walletAddress: `0x${'B'.repeat(38)}${String(i + 1).padStart(2, '0')}`,
        isVerified: data.verified,
        isActive: true,
      },
    });
    tradeBuyers.push(buyer);

    if (data.verified) {
      await prisma.kYCRecord.create({
        data: {
          userId: buyer.id,
          status: KYCStatus.APPROVED,
          documentType: 'NATIONAL_ID',
          documentNumber: `ID${8000 + i}`,
          documentUrl: `https://example.com/documents/${buyer.id}.pdf`,
          verifiedAt: new Date(),
        },
      });
    }
  }
  console.log(`✅ Created ${tradeBuyers.length} Trade Exchange individual buyers`);

  // Create Trade Exchange Engine (TEE) - Corporate Buyers
  const tradeBuyerCorporates: User[] = [];
  const tradeBuyerCorporateData = [
    { first: 'Amos', last: 'Kamau', company: 'Import Trading Co', email: 'amos.kamau@importtrade.com', verified: true },
    { first: 'Beatrice', last: 'Wanjiru', company: 'Wholesale Buyers Ltd', email: 'beatrice.wanjiru@wholesale.com', verified: true },
    { first: 'Caleb', last: 'Mutua', company: 'Procurement Solutions', email: 'caleb.mutua@procurement.com', verified: false },
    { first: 'Diana', last: 'Njoroge', company: 'Retail Procurement Group', email: 'diana.njoroge@retailproc.com', verified: true },
    { first: 'Ezekiel', last: 'Kiprotich', company: 'Bulk Purchase Corp', email: 'ezekiel.kiprotich@bulkpurchase.com', verified: false },
  ];

  for (let i = 0; i < tradeBuyerCorporateData.length; i++) {
    const data = tradeBuyerCorporateData[i];
    const password = await bcrypt.hash('buyercorp123', 10);
    const buyer = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: password,
        firstName: data.first,
        lastName: data.last,
        phone: `+2547770000${i + 1}`,
        role: 'TRADE_BUYER',
        userType: UserType.END_USER,
        entityType: 'COMPANY',
        companyName: data.company,
        registrationNumber: `BUYER${8000 + i}`,
        legalStructure: 'LLC',
        walletAddress: `0x${'C'.repeat(38)}${String(i + 1).padStart(2, '0')}`,
        isVerified: data.verified,
        isActive: true,
      },
    });
    tradeBuyerCorporates.push(buyer);

    if (data.verified) {
      await prisma.kYCRecord.create({
        data: {
          userId: buyer.id,
          status: KYCStatus.APPROVED,
          documentType: 'BUSINESS_REGISTRATION',
          documentNumber: `BR${8000 + i}`,
          documentUrl: `https://example.com/documents/${buyer.id}.pdf`,
          verifiedAt: new Date(),
        },
      });
    }
  }
  console.log(`✅ Created ${tradeBuyerCorporates.length} Trade Exchange corporate buyers`);

  // Create Trade Exchange Engine (TEE) - Individual Sellers
  const tradeSellers: User[] = [];
  const tradeSellerData = [
    { first: 'Faith', last: 'Maina', email: 'faith.maina@trade.com', verified: true },
    { first: 'Gabriel', last: 'Waweru', email: 'gabriel.waweru@trade.com', verified: true },
    { first: 'Hannah', last: 'Kariuki', email: 'hannah.kariuki@trade.com', verified: false },
    { first: 'Isaac', last: 'Gitau', email: 'isaac.gitau@trade.com', verified: true },
    { first: 'Joy', last: 'Muthoni', email: 'joy.muthoni@trade.com', verified: false },
  ];

  for (let i = 0; i < tradeSellerData.length; i++) {
    const data = tradeSellerData[i];
    const password = await bcrypt.hash('seller123', 10);
    const seller = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: password,
        firstName: data.first,
        lastName: data.last,
        phone: `+2547880000${i + 1}`,
        role: 'TRADE_SELLER',
        userType: UserType.END_USER,
        entityType: 'INDIVIDUAL',
        walletAddress: `0x${'D'.repeat(38)}${String(i + 1).padStart(2, '0')}`,
        isVerified: data.verified,
        isActive: true,
      },
    });
    tradeSellers.push(seller);

    if (data.verified) {
      await prisma.kYCRecord.create({
        data: {
          userId: seller.id,
          status: KYCStatus.APPROVED,
          documentType: 'NATIONAL_ID',
          documentNumber: `ID${9000 + i}`,
          documentUrl: `https://example.com/documents/${seller.id}.pdf`,
          verifiedAt: new Date(),
        },
      });
    }
  }
  console.log(`✅ Created ${tradeSellers.length} Trade Exchange individual sellers`);

  // Create Trade Exchange Engine (TEE) - Corporate Sellers
  const tradeSellerCorporates: User[] = [];
  const tradeSellerCorporateData = [
    { first: 'Kenneth', last: 'Onyango', company: 'Export Trading Ltd', email: 'kenneth.onyango@exporttrade.com', verified: true },
    { first: 'Lydia', last: 'Kipchumba', company: 'Manufacturing Export Co', email: 'lydia.kipchumba@manuexport.com', verified: true },
    { first: 'Moses', last: 'Mwangi', company: 'Agricultural Products Inc', email: 'moses.mwangi@agriproducts.com', verified: false },
    { first: 'Naomi', last: 'Chebet', company: 'Commodity Trading Group', email: 'naomi.chebet@commodity.com', verified: true },
    { first: 'Obed', last: 'Ochieng', company: 'Supply Chain Solutions', email: 'obed.ochieng@supplychain.com', verified: false },
  ];

  for (let i = 0; i < tradeSellerCorporateData.length; i++) {
    const data = tradeSellerCorporateData[i];
    const password = await bcrypt.hash('sellercorp123', 10);
    const seller = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: password,
        firstName: data.first,
        lastName: data.last,
        phone: `+2547990000${i + 1}`,
        role: 'TRADE_SELLER',
        userType: UserType.END_USER,
        entityType: 'COMPANY',
        companyName: data.company,
        registrationNumber: `SELLER${9000 + i}`,
        legalStructure: 'CORPORATION',
        walletAddress: `0x${'E'.repeat(38)}${String(i + 1).padStart(2, '0')}`,
        isVerified: data.verified,
        isActive: true,
      },
    });
    tradeSellerCorporates.push(seller);

    if (data.verified) {
      await prisma.kYCRecord.create({
        data: {
          userId: seller.id,
          status: KYCStatus.APPROVED,
          documentType: 'BUSINESS_REGISTRATION',
          documentNumber: `BR${9000 + i}`,
          documentUrl: `https://example.com/documents/${seller.id}.pdf`,
          verifiedAt: new Date(),
        },
      });
    }
  }
  console.log(`✅ Created ${tradeSellerCorporates.length} Trade Exchange corporate sellers`);

  // Combine all users for later use (trust scores, behavior metrics, etc.)
  // Note: allUsers will be redefined later to include admin
  const allUsersForMetrics = [
    ...investors,
    ...fundraisers,
    ...additionalInvestors,
    ...additionalFundraisers,
    ...c2bConsumers,
    ...c2bCorporates,
    ...b2bTraders,
    ...b2bCorporates,
    ...tradeBuyers,
    ...tradeBuyerCorporates,
    ...tradeSellers,
    ...tradeSellerCorporates,
  ];

  // Create dummy projects
  const projects: Project[] = [];
  const projectData = [
    {
      title: 'Solar Power Plant - Nakuru',
      description: 'Development of a 10MW solar power plant in Nakuru County to provide clean energy to 5,000 households. This project aims to reduce carbon emissions and provide affordable electricity.',
      category: 'Renewable Energy',
      targetAmount: 50000000,
      minInvestment: 50000,
      maxInvestment: 5000000,
      status: ProjectStatus.ACTIVE,
      dueDiligenceScore: 85.5,
      images: ['https://example.com/images/solar1.jpg', 'https://example.com/images/solar2.jpg'],
      documents: ['https://example.com/documents/business-plan.pdf'],
      metadata: { location: 'Nakuru', capacity: '10MW', households: 5000 },
    },
    {
      title: 'Affordable Housing Complex - Nairobi',
      description: 'Construction of 200 affordable housing units in Nairobi Westlands. Each unit will be priced at KES 2.5M with flexible payment plans.',
      category: 'Real Estate',
      targetAmount: 80000000,
      minInvestment: 100000,
      maxInvestment: 10000000,
      status: ProjectStatus.ACTIVE,
      dueDiligenceScore: 92.0,
      images: ['https://example.com/images/housing1.jpg'],
      documents: ['https://example.com/documents/housing-plan.pdf'],
      metadata: { location: 'Nairobi Westlands', units: 200, pricePerUnit: 2500000 },
    },
    {
      title: 'AgriTech Mobile Platform',
      description: 'Development of a mobile platform connecting smallholder farmers with buyers, providing market prices, weather forecasts, and access to financing.',
      category: 'Technology',
      targetAmount: 15000000,
      minInvestment: 25000,
      maxInvestment: 2000000,
      status: ProjectStatus.APPROVED,
      dueDiligenceScore: 78.5,
      images: ['https://example.com/images/agritech1.jpg'],
      documents: ['https://example.com/documents/agritech-proposal.pdf'],
      metadata: { targetUsers: 10000, farmers: 5000 },
    },
    {
      title: 'Clean Water Initiative - Kajiado',
      description: 'Installation of water purification systems and boreholes in Kajiado County to provide clean drinking water to 3,000 residents.',
      category: 'Social Enterprise',
      targetAmount: 25000000,
      minInvestment: 50000,
      maxInvestment: 3000000,
      status: ProjectStatus.ACTIVE,
      dueDiligenceScore: 88.0,
      images: ['https://example.com/images/water1.jpg'],
      documents: ['https://example.com/documents/water-project.pdf'],
      metadata: { location: 'Kajiado', beneficiaries: 3000 },
    },
    {
      title: 'E-Learning Platform for Rural Schools',
      description: 'Development of an e-learning platform with offline capabilities to serve 50 rural schools, providing access to quality educational content.',
      category: 'Education',
      targetAmount: 12000000,
      minInvestment: 20000,
      maxInvestment: 1500000,
      status: ProjectStatus.PENDING_APPROVAL,
      dueDiligenceScore: null,
      images: ['https://example.com/images/education1.jpg'],
      documents: ['https://example.com/documents/education-proposal.pdf'],
      metadata: { schools: 50, students: 10000 },
    },
    {
      title: 'Waste-to-Energy Facility - Mombasa',
      description: 'Construction of a waste-to-energy facility in Mombasa to process 200 tons of waste daily and generate 5MW of electricity.',
      category: 'Renewable Energy',
      targetAmount: 60000000,
      minInvestment: 75000,
      maxInvestment: 6000000,
      status: ProjectStatus.ACTIVE,
      dueDiligenceScore: 90.5,
      images: ['https://example.com/images/waste1.jpg'],
      documents: ['https://example.com/documents/waste-energy.pdf'],
      metadata: { location: 'Mombasa', capacity: '5MW', wastePerDay: 200 },
    },
  ];

  for (let i = 0; i < projectData.length; i++) {
    const data = projectData[i];
    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        fundraiserId: fundraisers[i % fundraisers.length].id,
        targetAmount: data.targetAmount,
        currentAmount: 0,
        minInvestment: data.minInvestment,
        maxInvestment: data.maxInvestment,
        status: data.status,
        dueDiligenceScore: data.dueDiligenceScore,
        complianceStatus: null,
        images: JSON.stringify(data.images),
        documents: JSON.stringify(data.documents),
        metadata: JSON.stringify(data.metadata),
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      },
    });
    projects.push(project);

    // Create due diligence records for approved/active projects
    if (project.status === ProjectStatus.ACTIVE || project.status === ProjectStatus.APPROVED) {
      await prisma.dueDiligence.create({
        data: {
          projectId: project.id,
          score: project.dueDiligenceScore || 75,
          riskLevel: project.dueDiligenceScore && Number(project.dueDiligenceScore) > 80 ? 'LOW' : 'MEDIUM',
          checks: JSON.stringify({
            financial: { status: 'PASSED', score: 85 },
            legal: { status: 'PASSED', score: 90 },
            background: { status: 'PASSED', score: 80 },
            technical: { status: 'PASSED', score: 88 },
          }),
          reviewedBy: admin.id,
          reviewedAt: new Date(),
        },
      });
    }
  }
  console.log(`✅ Created ${projects.length} projects`);

  // Create dummy investments
  const investments: Investment[] = [];
  const investmentAmounts = [
    [500000, 1000000, 250000], // Project 1 investments
    [2000000, 5000000, 1500000], // Project 2 investments
    [500000, 750000, 300000], // Project 3 investments
    [1000000, 2000000, 500000], // Project 4 investments
    [500000, 1000000], // Project 5 investments
    [3000000, 5000000, 2000000], // Project 6 investments
  ];

  const investmentStatuses = [
    InvestmentStatus.APPROVED,
    InvestmentStatus.ESCROWED,
    InvestmentStatus.RELEASED,
    InvestmentStatus.PENDING,
  ];

  for (let projectIndex = 0; projectIndex < projects.length; projectIndex++) {
    const project = projects[projectIndex];
    if (project.status === ProjectStatus.DRAFT || project.status === ProjectStatus.PENDING_APPROVAL) {
      continue; // Skip investments for draft/pending projects
    }

    const amounts = investmentAmounts[projectIndex] || [500000];
    let projectTotal = 0;

    for (let invIndex = 0; invIndex < amounts.length && invIndex < investors.length; invIndex++) {
      const investor = investors[invIndex];
      const amount = amounts[invIndex];
      projectTotal += amount;

      const investment = await prisma.investment.create({
        data: {
          investorId: investor.id,
          projectId: project.id,
          amount: amount,
          status: investmentStatuses[invIndex % investmentStatuses.length],
          transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
          notes: `Investment in ${project.title}`,
        },
      });
      investments.push(investment);

      // Create payment for approved investments
      if (investment.status === InvestmentStatus.APPROVED || investment.status === InvestmentStatus.ESCROWED) {
        await prisma.payment.create({
          data: {
            userId: investor.id,
            investmentId: investment.id,
            amount: amount,
            currency: 'KES',
            status: PaymentStatus.COMPLETED,
            paymentMethod: 'BANK_TRANSFER',
            transactionId: `TXN${Date.now()}${invIndex}`,
            gatewayResponse: JSON.stringify({ provider: 'demo', status: 'success' }),
          },
        });
      }

      // Create escrow contract for escrowed investments
      if (investment.status === InvestmentStatus.ESCROWED) {
        await prisma.escrowContract.create({
          data: {
            investmentId: investment.id,
            projectId: project.id,
            contractAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
            amount: amount,
            status: EscrowStatus.ACTIVE,
            releaseConditions: JSON.stringify({
              milestone: 'Project completion',
              percentage: 100,
            }),
          },
        });
      }
    }

    // Update project current amount
    await prisma.project.update({
      where: { id: project.id },
      data: { currentAmount: projectTotal },
    });
  }
  console.log(`✅ Created ${investments.length} investments`);

  // Create compliance records
  for (let i = 0; i < 3; i++) {
    await prisma.complianceRecord.create({
      data: {
        projectId: projects[i].id,
        type: 'CMA_LICENSING',
        status: 'APPROVED',
        cmaReference: `CMA-REF-${2024 + i}`,
        documents: JSON.stringify([`https://example.com/compliance/${projects[i].id}.pdf`]),
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      },
    });
  }
  console.log('✅ Created compliance records');

  // Create audit logs
  const auditActions = [
    'USER_LOGIN',
    'PROJECT_CREATED',
    'INVESTMENT_CREATED',
    'PAYMENT_PROCESSED',
    'ESCROW_CREATED',
    'KYC_APPROVED',
  ];

  for (let i = 0; i < 20; i++) {
    await prisma.auditLog.create({
      data: {
        userId: investors[i % investors.length].id,
        action: auditActions[i % auditActions.length],
        entityType: 'PROJECT',
        entityId: projects[i % projects.length].id,
        changes: JSON.stringify({ field: 'status', oldValue: 'DRAFT', newValue: 'ACTIVE' }),
        ipAddress: `192.168.1.${i + 1}`,
        userAgent: 'Mozilla/5.0 (Demo Browser)',
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Spread over last 20 days
      },
    });
  }
  console.log('✅ Created audit logs');

  // ============================================
  // Trust Engine: Behavior Metrics & Trust Scores
  // ============================================
  console.log('\n📊 Creating behavior metrics and trust scores...');

  // Helper function to calculate metrics from actual data
  const calculateInvestorMetrics = async (investorId: string) => {
    const userInvestments = investments.filter((inv: Investment) => inv.investorId === investorId);
    const userPayments = await prisma.payment.findMany({
      where: { userId: investorId },
    });
    const userEscrows = await prisma.escrowContract.findMany({
      where: { investment: { investorId } },
    });

    const totalInvestments = userInvestments.length;
    const successfulInvestments = userInvestments.filter(
      (inv: Investment) => inv.status === InvestmentStatus.APPROVED || inv.status === InvestmentStatus.ESCROWED || inv.status === InvestmentStatus.RELEASED
    ).length;
    const successRate = totalInvestments > 0 ? successfulInvestments / totalInvestments : 0;

    const totalPayments = userPayments.length;
    const completedPayments = userPayments.filter((p) => p.status === PaymentStatus.COMPLETED).length;
    const onTimePayments = completedPayments; // Assume all completed payments are on-time for demo
    const paymentPunctuality = totalPayments > 0 ? (onTimePayments / totalPayments) * 100 : 0;

    const totalEscrows = userEscrows.length;
    const successfulEscrows = userEscrows.filter((e) => e.status === EscrowStatus.ACTIVE || e.status === EscrowStatus.RELEASED).length;
    const escrowSuccessRate = totalEscrows > 0 ? (successfulEscrows / totalEscrows) * 100 : 0;

    return {
      totalTransactions: totalInvestments,
      successfulTransactions: successfulInvestments,
      transactionSuccessRate: successRate,
      totalPayments,
      onTimePayments,
      paymentPunctuality,
      totalEscrows,
      successfulEscrows,
      escrowSuccessRate,
      deliveryTimeliness: 85 + Math.random() * 10, // Simulated for demo
      totalDeliveries: Math.floor(totalInvestments * 0.8), // Assume 80% have deliveries
      onTimeDeliveries: Math.floor(totalInvestments * 0.7),
      totalBids: totalInvestments,
      winningBids: successfulInvestments,
      bidWinRate: successRate,
      totalDisputes: Math.floor(totalInvestments * 0.05), // 5% dispute rate
      disputesWon: 0,
      disputesLost: 0,
      disputeRate: totalInvestments > 0 ? 0.05 : 0,
    };
  };

  const calculateFundraiserMetrics = async (fundraiserId: string) => {
    const userProjects = projects.filter((p: Project) => p.fundraiserId === fundraiserId);
    const projectInvestments = investments.filter((inv: Investment) =>
      userProjects.some((p: Project) => p.id === inv.projectId)
    );
    const userPayments = await prisma.payment.findMany({
      where: { userId: fundraiserId },
    });

    const totalProjects = userProjects.length;
    const activeProjects = userProjects.filter(
      (p: Project) => p.status === ProjectStatus.ACTIVE || p.status === ProjectStatus.APPROVED
    ).length;
    const successRate = totalProjects > 0 ? activeProjects / totalProjects : 0;

    const totalPayments = userPayments.length;
    const completedPayments = userPayments.filter((p) => p.status === PaymentStatus.COMPLETED).length;
    const paymentPunctuality = totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 90;

    return {
      totalTransactions: totalProjects,
      successfulTransactions: activeProjects,
      transactionSuccessRate: successRate,
      totalPayments,
      onTimePayments: completedPayments,
      paymentPunctuality,
      totalEscrows: 0,
      successfulEscrows: 0,
      escrowSuccessRate: 0,
      deliveryTimeliness: 80 + Math.random() * 15, // Varies by fundraiser
      totalDeliveries: Math.floor(totalProjects * 0.6),
      onTimeDeliveries: Math.floor(totalProjects * 0.5),
      totalBids: 0,
      winningBids: 0,
      bidWinRate: 0,
      totalDisputes: Math.floor(totalProjects * 0.1),
      disputesWon: 0,
      disputesLost: 0,
      disputeRate: totalProjects > 0 ? 0.1 : 0,
    };
  };

  // Create behavior metrics for all users
  // Note: allUsers includes admin, investors, fundraisers, and all end users (C2B/B2B/Trade Exchange)
  const allUsers: User[] = [
    admin,
    ...investors,
    ...fundraisers,
    ...additionalInvestors,
    ...additionalFundraisers,
    ...c2bConsumers,
    ...c2bCorporates,
    ...b2bTraders,
    ...b2bCorporates,
    ...tradeBuyers,
    ...tradeBuyerCorporates,
    ...tradeSellers,
    ...tradeSellerCorporates,
  ];
  for (const user of allUsers) {
    const isInvestor = user.userType === UserType.INVESTOR && user.role !== UserRole.ADMIN;
    const isFundraiser = user.userType === UserType.FUNDRAISER;
    const isAdmin = user.role === UserRole.ADMIN;

    let metrics;
    if (isInvestor) {
      metrics = await calculateInvestorMetrics(user.id);
    } else if (isFundraiser) {
      metrics = await calculateFundraiserMetrics(user.id);
    } else {
      // Admin - minimal activity
      metrics = {
        totalTransactions: 0,
        successfulTransactions: 0,
        transactionSuccessRate: 0,
        totalPayments: 0,
        onTimePayments: 0,
        paymentPunctuality: 100,
        totalEscrows: 0,
        successfulEscrows: 0,
        escrowSuccessRate: 0,
        deliveryTimeliness: 100,
        totalDeliveries: 0,
        onTimeDeliveries: 0,
        totalBids: 0,
        winningBids: 0,
        bidWinRate: 0,
        totalDisputes: 0,
        disputesWon: 0,
        disputesLost: 0,
        disputeRate: 0,
      };
    }

    await prisma.behaviorMetrics.create({
      data: {
        entityId: user.id,
        ...metrics,
      },
    });
  }
  console.log(`✅ Created behavior metrics for ${allUsers.length} users`);

  // Create readiness metrics for fundraisers (some have completed courses)
  for (let i = 0; i < fundraisers.length; i++) {
    const fundraiser = fundraisers[i];
    const hasCourses = i < 3; // First 3 fundraisers have completed courses
    const coursesCompleted = hasCourses ? Math.floor(Math.random() * 5) + 2 : 0;
    const certificationsEarned = hasCourses && coursesCompleted >= 3 ? 1 : 0;
    const quizAverage = hasCourses ? 75 + Math.random() * 20 : 0;

    await prisma.readinessMetrics.create({
      data: {
        entityId: fundraiser.id,
        coursesCompleted,
        certificationsEarned,
        learningHours: coursesCompleted * 2.5,
        quizAverageScore: quizAverage,
        financeCourses: hasCourses ? Math.floor(coursesCompleted * 0.4) : 0,
        governanceCourses: hasCourses ? Math.floor(coursesCompleted * 0.3) : 0,
        technicalCourses: hasCourses ? Math.floor(coursesCompleted * 0.2) : 0,
        complianceCourses: hasCourses ? Math.floor(coursesCompleted * 0.1) : 0,
        hasBusinessPlan: i < 4,
        hasFinancialStatements: i < 3,
        hasGovernanceDocs: i < 2,
        hasComplianceDocs: i < 3,
        documentationReadiness: (i < 4 ? 25 : 0) + (i < 3 ? 25 : 0) + (i < 2 ? 25 : 0) + (i < 3 ? 25 : 0),
        financialReadiness: i < 3 ? 80 + Math.random() * 15 : 50,
        governanceReadiness: i < 2 ? 75 + Math.random() * 20 : 40,
        complianceReadiness: i < 3 ? 70 + Math.random() * 25 : 30,
      },
    });
  }
  console.log(`✅ Created readiness metrics for ${fundraisers.length} fundraisers`);

  // Create readiness metrics for some investors (learning trust)
  for (let i = 0; i < Math.min(3, investors.length); i++) {
    const investor = investors[i];
    await prisma.readinessMetrics.create({
      data: {
        entityId: investor.id,
        coursesCompleted: Math.floor(Math.random() * 3) + 1,
        certificationsEarned: 0,
        learningHours: (Math.floor(Math.random() * 3) + 1) * 2,
        quizAverageScore: 70 + Math.random() * 25,
        financeCourses: 1,
        governanceCourses: 0,
        technicalCourses: 0,
        complianceCourses: 0,
        hasBusinessPlan: false,
        hasFinancialStatements: false,
        hasGovernanceDocs: false,
        hasComplianceDocs: false,
        documentationReadiness: 0,
        financialReadiness: 0,
        governanceReadiness: 0,
        complianceReadiness: 0,
      },
    });
  }
  console.log(`✅ Created readiness metrics for ${Math.min(3, investors.length)} investors`);

  // Calculate and create trust scores for all users
  if (trustService && trustService.recalculateTrustScores) {
    for (const user of allUsers) {
      try {
        await trustService.recalculateTrustScores(user.id, 'AUTOMATIC');
      } catch (error) {
        console.error(`Error calculating trust score for ${user.email}:`, error);
      }
    }
    console.log(`✅ Calculated trust scores for ${allUsers.length} users`);
  } else {
    console.log('⚠️  Skipping trust score calculation (trustService not available)');
  }
  console.log(`✅ Calculated trust scores for ${allUsers.length} users`);

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📊 Summary:');
  const totalInvestorsSummary = investors.length + additionalInvestors.length;
  const totalFundraisersSummary = fundraisers.length + additionalFundraisers.length;
  const totalC2BConsumers = c2bConsumers.length;
  const totalC2BCorporates = c2bCorporates.length;
  const totalB2BTraders = b2bTraders.length;
  const totalB2BCorporates = b2bCorporates.length;
  const totalTradeBuyers = tradeBuyers.length;
  const totalTradeBuyerCorporates = tradeBuyerCorporates.length;
  const totalTradeSellers = tradeSellers.length;
  const totalTradeSellerCorporates = tradeSellerCorporates.length;
  const totalEndUsers = totalC2BConsumers + totalC2BCorporates + totalB2BTraders + totalB2BCorporates + totalTradeBuyers + totalTradeBuyerCorporates + totalTradeSellers + totalTradeSellerCorporates;
  const totalUsers = 1 + totalInvestorsSummary + totalFundraisersSummary + totalEndUsers;
  console.log(`   - Users: ${totalUsers} (1 admin, ${totalInvestorsSummary} investors, ${totalFundraisersSummary} fundraisers, ${totalEndUsers} end users)`);
  console.log(`     • C2B Consumers: ${totalC2BConsumers + totalC2BCorporates} (${totalC2BConsumers} individuals, ${totalC2BCorporates} corporates)`);
  console.log(`     • B2B Businesses: ${totalB2BTraders + totalB2BCorporates} (${totalB2BTraders} traders, ${totalB2BCorporates} corporates)`);
  console.log(`     • Trade Exchange: ${totalTradeBuyers + totalTradeBuyerCorporates + totalTradeSellers + totalTradeSellerCorporates} (${totalTradeBuyers + totalTradeBuyerCorporates} buyers, ${totalTradeSellers + totalTradeSellerCorporates} sellers)`);
  console.log(`       - Buyers: ${totalTradeBuyers} individuals, ${totalTradeBuyerCorporates} corporates`);
  console.log(`       - Sellers: ${totalTradeSellers} individuals, ${totalTradeSellerCorporates} corporates`);
  console.log(`   - Projects: ${projects.length}`);
  console.log(`   - Investments: ${investments.length}`);
  console.log(`   - KYC Records: ${investors.filter((_, i) => i < 3).length + fundraisers.filter((_, i) => i < 3).length}`);
  console.log(`   - Due Diligence Records: ${projects.filter((p: Project) => p.status === ProjectStatus.ACTIVE || p.status === ProjectStatus.APPROVED).length}`);
  console.log(`   - Compliance Records: 3`);
  console.log(`   - Audit Logs: 20`);
  console.log(`   - Trust Scores: ${allUsers.length}`);
  console.log(`   - Behavior Metrics: ${allUsers.length}`);
  console.log(`   - Readiness Metrics: ${fundraisers.length + Math.min(3, investors.length)}`);

  // Create auctions for projects
  console.log('\n📊 Creating auctions...');
  const auctions: any[] = [];
  const auctionTypes = ['CAPITAL', 'GUARANTEE', 'SUPPLY_CONTRACT'];
  const now = new Date();

  for (let i = 0; i < Math.min(5, projects.length); i++) {
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
    });

    auctions.push(auction);

    // Create some dummy bids for active auctions
    if (auction.status === 'ACTIVE') {
      const activeInvestors = investors.filter((inv) => inv.isVerified).slice(0, 3);

      for (let j = 0; j < Math.min(3, activeInvestors.length); j++) {
        const investor = activeInvestors[j];
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
  console.log(`✅ Created ${auctions.length} auctions with bids`);

  // Create guarantee requests
  console.log('\n🛡️ Creating guarantee requests...');
  const guaranteeRequests: any[] = [];
  const guaranteeTypes = ['CREDIT_RISK', 'PERFORMANCE_RISK', 'CONTRACT_ASSURANCE'];

  for (let i = 0; i < Math.min(5, projects.length, fundraisers.length); i++) {
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
    });

    guaranteeRequests.push(request);

    // Create auction for active requests
    if (request.status === 'AUCTION_ACTIVE') {
      const guaranteeAuction = await prisma.auction.create({
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
        data: { auctionId: guaranteeAuction.id },
      });

      // Create some dummy guarantee bids
      const guarantors = investors.filter((inv) => inv.isVerified).slice(0, 3);

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
  console.log(`✅ Created ${guaranteeRequests.length} guarantee requests with bids`);

  // Create tokens
  console.log('\n🪙 Creating tokens...');
  const tokens: any[] = [];
  const tokenTypes = [
    { type: 'BTA_GOV', symbol: 'BTA-GOV', name: 'OptiChain Governance Token', initialSupply: 10000000 },
    { type: 'BTA_REWARD', symbol: 'BTA-REWARD', name: 'OptiChain Reward Token', initialSupply: 5000000 },
    { type: 'BTA_UTIL', symbol: 'BTA-UTIL', name: 'OptiChain Utility Token', initialSupply: 20000000 },
    { type: 'BTA_GUAR', symbol: 'BTA-GUAR', name: 'OptiChain Guarantee Token', initialSupply: 3000000 },
  ];

  for (const tokenData of tokenTypes) {
    const token = await prisma.token.create({
      data: {
        tokenType: tokenData.type,
        symbol: tokenData.symbol,
        name: tokenData.name,
        totalSupply: tokenData.initialSupply,
        circulatingSupply: tokenData.initialSupply * 0.7, // 70% circulating
        decimals: 18,
        initialSupply: tokenData.initialSupply,
        maxSupply: tokenData.initialSupply * 2,
        inflationRate: 5.0, // 5% annual
        burnRate: 0.1, // 0.1% per transaction
        metadata: JSON.stringify({ generated: true }),
      },
    });
    tokens.push(token);

    // Distribute tokens to users
    for (let i = 0; i < Math.min(5, allUsers.length); i++) {
      const user = allUsers[i];
      const balance = tokenData.initialSupply * (0.1 - i * 0.015); // Decreasing balances
      
      await prisma.tokenBalance.create({
        data: {
          entityId: user.id,
          tokenId: token.id,
          balance,
          available: balance * 0.8, // 80% available, 20% locked
          locked: balance * 0.2,
        },
      });
    }
  }
  console.log(`✅ Created ${tokens.length} tokens with balances`);

  // Create governance proposals
  console.log('\n🗳️ Creating governance proposals...');
  const proposals: any[] = [];
  const proposalTypes = ['POLICY_CHANGE', 'PARAMETER_UPDATE', 'FUND_ALLOCATION', 'TOKENOMICS_CHANGE'];
  const proposalTitles = [
    'Increase Minimum Trust Score for New Projects',
    'Update Platform Fee Structure',
    'Allocate Funds for Marketing Campaign',
    'Adjust Token Inflation Rate',
  ];
  const proposalDescriptions = [
    'Proposal to increase the minimum trust score requirement for new project listings from 50 to 60 to improve platform quality.',
    'Proposal to update the platform fee structure to better align with market conditions and operational costs.',
    'Proposal to allocate 500,000 KES from platform reserves for a comprehensive marketing campaign.',
    'Proposal to adjust the annual token inflation rate from 5% to 4% to better control token supply.',
  ];

  for (let i = 0; i < 4; i++) {
    const proposer = allUsers.find((u) => u.role === 'ADMIN') || allUsers[0];
    const votingStart = new Date(now.getTime() + (i * 2 * 24 * 60 * 60 * 1000));
    const votingEnd = new Date(votingStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const status = i === 0 ? 'ACTIVE' : i === 1 ? 'PASSED' : i === 2 ? 'REJECTED' : 'PENDING';

    const proposal = await prisma.governanceProposal.create({
      data: {
        proposerId: proposer.id,
        title: proposalTitles[i],
        description: proposalDescriptions[i],
        proposalType: proposalTypes[i],
        votingStart,
        votingEnd,
        quorum: 10.0,
        threshold: 50.0,
        status,
        totalVotes: i === 0 ? 1500 : i === 1 ? 2500 : i === 2 ? 1800 : 0,
        yesVotes: i === 0 ? 900 : i === 1 ? 1600 : i === 2 ? 600 : 0,
        noVotes: i === 0 ? 400 : i === 1 ? 500 : i === 2 ? 1000 : 0,
        abstainVotes: i === 0 ? 200 : i === 1 ? 400 : i === 2 ? 200 : 0,
        executedAt: i === 1 ? new Date() : null,
      },
    });

    proposals.push(proposal);

    // Create votes for active/passed proposals
    if (status === 'ACTIVE' || status === 'PASSED') {
      const voters = allUsers.filter((u) => u.isVerified).slice(0, 5);
      for (let j = 0; j < voters.length; j++) {
        const voter = voters[j];
        const voteType = j < 3 ? 'YES' : j === 3 ? 'NO' : 'ABSTAIN';
        const votingPower = 100 + (j * 50);
        const trustScore = await prisma.trustScore.findUnique({
          where: { entityId: voter.id },
        });

        await prisma.governanceVote.create({
          data: {
            proposalId: proposal.id,
            voterId: voter.id,
            vote: voteType,
            votingPower,
            weight: votingPower * ((trustScore?.trustScore || 50) / 100),
            voterTrustScore: trustScore?.trustScore || 50,
          },
        });
      }
    }
  }
  console.log(`✅ Created ${proposals.length} governance proposals with votes`);

  // Create staking pools
  console.log('\n💰 Creating staking pools...');
  const stakingPools: any[] = [];
  const govToken = tokens.find((t) => t.symbol === 'BTA-GOV');
  const rewardToken = tokens.find((t) => t.symbol === 'BTA-REWARD');

  if (govToken && rewardToken) {
    const poolConfigs = [
      { name: 'Governance Token Staking', apy: 12.0, minStake: 1000, lockPeriod: 30 },
      { name: 'High Yield Staking Pool', apy: 18.0, minStake: 5000, lockPeriod: 90 },
      { name: 'Flexible Staking Pool', apy: 8.0, minStake: 500, lockPeriod: null },
    ];

    for (const config of poolConfigs) {
      const pool = await prisma.stakingPool.create({
        data: {
          tokenId: govToken.id,
          rewardTokenId: rewardToken.id,
          name: config.name,
          description: `Stake ${govToken.symbol} to earn ${config.apy}% APY in ${rewardToken.symbol}`,
          apy: config.apy,
          minStakeAmount: config.minStake,
          maxStakeAmount: config.minStake * 100,
          lockPeriod: config.lockPeriod,
          totalStaked: config.minStake * 10,
          totalRewards: config.minStake * 10 * (config.apy / 100),
          isActive: true,
          minTrustScore: 50,
        },
      });

      stakingPools.push(pool);

      // Create some stakes
      const stakers = allUsers.filter((u) => u.isVerified).slice(0, 3);
      for (let j = 0; j < stakers.length; j++) {
        const staker = stakers[j];
        const stakeAmount = config.minStake * (2 + j);
        const unlockAt = config.lockPeriod
          ? new Date(now.getTime() + config.lockPeriod * 24 * 60 * 60 * 1000)
          : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        await (prisma.stake as any).create({
          data: {
            stakerId: staker.id,
            poolId: pool.id,
            tokenId: govToken.id,
            amount: stakeAmount,
            stakedAt: new Date(now.getTime() - (j * 5 * 24 * 60 * 60 * 1000)),
            lockedUntil: config.lockPeriod ? unlockAt : null,
            isLocked: config.lockPeriod ? unlockAt > now : false,
            status: unlockAt > now ? 'ACTIVE' : 'UNSTAKED',
            totalRewardsEarned: stakeAmount * (config.apy / 100) * 0.1, // 10% of annual
            pendingRewards: stakeAmount * (config.apy / 100) * 0.01, // 1% pending
          },
        });
      }
    }
  }
  console.log(`✅ Created ${stakingPools.length} staking pools with stakes`);

  // Create reward distributions
  console.log('\n🎁 Creating reward distributions...');
  const rewards: any[] = [];
  const rewardTypes = ['STAKING', 'GOVERNANCE', 'TRANSACTION', 'REFERRAL'];
  const rewardReasons = [
    'Staking rewards for Q4 2024',
    'Participation in governance proposal voting',
    'Successful transaction completion bonus',
    'Referral program reward',
  ];

  for (let i = 0; i < Math.min(10, allUsers.length); i++) {
    const recipient = allUsers[i];
    const rewardType = rewardTypes[i % rewardTypes.length];
    const token = rewardToken || tokens[0];
    const amount = 100 + (i * 50);
    const claimableAt = new Date(now.getTime() - (i * 2 * 24 * 60 * 60 * 1000));
    const status = i < 3 ? 'AVAILABLE' : i < 6 ? 'PENDING' : 'CLAIMED';
    const claimedAt = status === 'CLAIMED' ? new Date(claimableAt.getTime() + 24 * 60 * 60 * 1000) : null;

    const reward = await prisma.rewardDistribution.create({
      data: {
        recipientId: recipient.id,
        tokenId: token.id,
        poolId: i < 3 ? stakingPools[0]?.id : null,
        proposalId: i >= 3 && i < 6 ? proposals[0]?.id : null,
        amount,
        rewardType,
        reason: rewardReasons[i % rewardReasons.length],
        status: status === 'AVAILABLE' ? 'DISTRIBUTED' : status, // Use DISTRIBUTED instead of AVAILABLE
        distributedAt: claimableAt,
        claimedAt,
        recipientTrustScore: 60 + (i * 5),
      },
    });

    rewards.push(reward);
  }
  console.log(`✅ Created ${rewards.length} reward distributions`);

  console.log('\n📊 Final Summary:');
  const totalInvestorsFinal = investors.length + additionalInvestors.length;
  const totalFundraisersFinal = fundraisers.length + additionalFundraisers.length;
  const totalC2BConsumersFinal = c2bConsumers.length;
  const totalC2BCorporatesFinal = c2bCorporates.length;
  const totalB2BTradersFinal = b2bTraders.length;
  const totalB2BCorporatesFinal = b2bCorporates.length;
  const totalTradeBuyersFinal = tradeBuyers.length;
  const totalTradeBuyerCorporatesFinal = tradeBuyerCorporates.length;
  const totalTradeSellersFinal = tradeSellers.length;
  const totalTradeSellerCorporatesFinal = tradeSellerCorporates.length;
  const totalEndUsersFinal = totalC2BConsumersFinal + totalC2BCorporatesFinal + totalB2BTradersFinal + totalB2BCorporatesFinal + totalTradeBuyersFinal + totalTradeBuyerCorporatesFinal + totalTradeSellersFinal + totalTradeSellerCorporatesFinal;
  const totalUsersFinal = 1 + totalInvestorsFinal + totalFundraisersFinal + totalEndUsersFinal;
  console.log(`   - Users: ${totalUsersFinal} (1 admin, ${totalInvestorsFinal} investors, ${totalFundraisersFinal} fundraisers, ${totalEndUsersFinal} end users)`);
  console.log(`     • C2B: ${totalC2BConsumersFinal + totalC2BCorporatesFinal} (${totalC2BConsumersFinal} individuals, ${totalC2BCorporatesFinal} corporates)`);
  console.log(`     • B2B: ${totalB2BTradersFinal + totalB2BCorporatesFinal} (${totalB2BTradersFinal} traders, ${totalB2BCorporatesFinal} corporates)`);
  console.log(`     • Trade Exchange: ${totalTradeBuyersFinal + totalTradeBuyerCorporatesFinal + totalTradeSellersFinal + totalTradeSellerCorporatesFinal} (${totalTradeBuyersFinal + totalTradeBuyerCorporatesFinal} buyers, ${totalTradeSellersFinal + totalTradeSellerCorporatesFinal} sellers)`);
  console.log(`   - Projects: ${projects.length}`);
  console.log(`   - Investments: ${investments.length}`);
  console.log(`   - Auctions: ${auctions.length}`);
  console.log(`   - Guarantee Requests: ${guaranteeRequests.length}`);
  console.log(`   - Trust Scores: ${allUsers.length}`);
  console.log(`   - Behavior Metrics: ${allUsers.length}`);
  console.log(`   - Readiness Metrics: ${fundraisers.length + Math.min(3, investors.length)}`);
  console.log(`   - Tokens: ${tokens.length}`);
  console.log(`   - Governance Proposals: ${proposals.length}`);
  console.log(`   - Staking Pools: ${stakingPools.length}`);
  console.log(`   - Reward Distributions: ${rewards.length}`);
  console.log('\n🔑 Demo Credentials:');
  console.log('   Admin: admin@marketplace.com / admin123');
  console.log('   Investor: investor1@example.com / investor123');
  console.log('   Fundraiser: fundraiser1@example.com / fundraiser123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    // @ts-ignore - process is available in Node.js runtime
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
