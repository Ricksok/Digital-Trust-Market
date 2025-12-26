/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import * as trustService from '../src/services/trust.service';

const prisma = new PrismaClient();

async function initTrustScores() {
  try {
    console.log('🌱 Initializing trust scores for all entities...');

    // Get all users
    const users = await prisma.user.findMany({
      include: {
        kycRecord: true,
      },
    });

    console.log(`Found ${users.length} users`);

    // Initialize trust scores for each user
    for (const user of users) {
      try {
        // Initialize behavior metrics if they don't exist
        await prisma.behaviorMetrics.upsert({
          where: { entityId: user.id },
          create: {
            entityId: user.id,
            totalTransactions: 0,
            successfulTransactions: 0,
            transactionSuccessRate: 0,
            totalPayments: 0,
            onTimePayments: 0,
            paymentPunctuality: 0,
            totalDeliveries: 0,
            onTimeDeliveries: 0,
            deliveryTimeliness: 0,
            totalBids: 0,
            winningBids: 0,
            bidWinRate: 0,
            totalDisputes: 0,
            disputeRate: 0,
            totalEscrows: 0,
            successfulEscrows: 0,
            escrowSuccessRate: 0,
          },
          update: {},
        });

        // Initialize readiness metrics if they don't exist
        await prisma.readinessMetrics.upsert({
          where: { entityId: user.id },
          create: {
            entityId: user.id,
            coursesCompleted: 0,
            certificationsEarned: 0,
            learningHours: 0,
            financeCourses: 0,
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
          update: {},
        });

        // Calculate initial trust score
        await trustService.recalculateTrustScores(user.id, 'AUTOMATIC');

        console.log(`✅ Initialized trust score for ${user.email}`);
      } catch (error) {
        console.error(`❌ Error initializing trust score for ${user.email}:`, error);
      }
    }

    console.log('🎉 Trust score initialization completed!');
  } catch (error) {
    console.error('❌ Error initializing trust scores:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

initTrustScores()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

