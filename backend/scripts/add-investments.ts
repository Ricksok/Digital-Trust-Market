/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  CANCELLED: 'CANCELLED',
};

async function addInvestments() {
  try {
    console.log('🌱 Adding dummy investments...');

    // Get all investors
    const investors = await prisma.user.findMany({
      where: {
        userType: 'INVESTOR',
      },
      take: 10,
    });

    if (investors.length === 0) {
      console.log('❌ No investors found. Please seed users first.');
      return;
    }

    // Get all active/approved projects
    const projects = await prisma.project.findMany({
      where: {
        status: {
          in: ['APPROVED', 'ACTIVE'],
        },
      },
      take: 10,
    });

    if (projects.length === 0) {
      console.log('❌ No active projects found. Please seed projects first.');
      return;
    }

    console.log(`Found ${investors.length} investors and ${projects.length} projects`);

    // Create additional investments
    const investmentAmounts = [
      100000, 250000, 500000, 750000, 1000000, 1500000, 2000000, 3000000, 5000000, 10000000,
    ];

    const statuses = [
      InvestmentStatus.PENDING,
      InvestmentStatus.APPROVED,
      InvestmentStatus.ESCROWED,
      InvestmentStatus.RELEASED,
    ];

    let investmentCount = 0;

    // Add 3-5 investments per project
    for (const project of projects) {
      const numInvestments = Math.floor(Math.random() * 3) + 3; // 3-5 investments per project
      
      for (let i = 0; i < numInvestments; i++) {
        // Select a random investor (allow same investor to invest in multiple projects)
        const investor = investors[Math.floor(Math.random() * investors.length)];
        const amount = investmentAmounts[Math.floor(Math.random() * investmentAmounts.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        // Check if this investor already invested in this project (prevent duplicates in same project)
        const existing = await prisma.investment.findFirst({
          where: {
            investorId: investor.id,
            projectId: project.id,
          },
        });

        if (existing) {
          // Try a different investor
          const availableInvestors = investors.filter(
            inv => inv.id !== investor.id
          );
          if (availableInvestors.length === 0) {
            continue; // Skip if no other investors available
          }
          const altInvestor = availableInvestors[Math.floor(Math.random() * availableInvestors.length)];
          
          // Check again with alternate investor
          const altExisting = await prisma.investment.findFirst({
            where: {
              investorId: altInvestor.id,
              projectId: project.id,
            },
          });
          
          if (altExisting) {
            continue; // Skip if alternate investor also already invested
          }
          
          // Use alternate investor
          const finalAmount = Math.max(
            project.minInvestment,
            Math.min(amount, project.maxInvestment || amount)
          );

          const investment = await prisma.investment.create({
            data: {
              investorId: altInvestor.id,
              projectId: project.id,
              amount: finalAmount,
              status: status,
              transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
              notes: `Investment in ${project.title}`,
            },
          });

          investmentCount++;

          // Create payment for approved/escrowed investments
          if (status === InvestmentStatus.APPROVED || status === InvestmentStatus.ESCROWED) {
            await prisma.payment.create({
              data: {
                userId: altInvestor.id,
                investmentId: investment.id,
                amount: finalAmount,
                currency: 'KES',
                status: PaymentStatus.COMPLETED,
                paymentMethod: 'BANK_TRANSFER',
                transactionId: `TXN${Date.now()}${investmentCount}`,
                gatewayResponse: JSON.stringify({ provider: 'demo', status: 'success' }),
              },
            });
          }

          // Create escrow contract for escrowed investments
          if (status === InvestmentStatus.ESCROWED) {
            await prisma.escrowContract.create({
              data: {
                investmentId: investment.id,
                projectId: project.id,
                contractAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
                amount: finalAmount,
                status: EscrowStatus.ACTIVE,
                releaseConditions: JSON.stringify({
                  milestone: 'Project completion',
                  percentage: 100,
                }),
              },
            });
          }

          // Update project current amount
          await prisma.project.update({
            where: { id: project.id },
            data: {
              currentAmount: {
                increment: finalAmount,
              },
            },
          });
          
          continue;
        }

        // Ensure amount is within project limits
        const finalAmount = Math.max(
          project.minInvestment,
          Math.min(amount, project.maxInvestment || amount)
        );

        const investment = await prisma.investment.create({
          data: {
            investorId: investor.id,
            projectId: project.id,
            amount: finalAmount,
            status: status,
            transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
            notes: `Investment in ${project.title}`,
          },
        });

        investmentCount++;

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
              transactionId: `TXN${Date.now()}${investmentCount}`,
              gatewayResponse: JSON.stringify({ provider: 'demo', status: 'success' }),
            },
          });
        }

        // Create escrow contract for escrowed investments
        if (status === InvestmentStatus.ESCROWED) {
          await prisma.escrowContract.create({
            data: {
              investmentId: investment.id,
              projectId: project.id,
              contractAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
              amount: finalAmount,
              status: EscrowStatus.ACTIVE,
              releaseConditions: JSON.stringify({
                milestone: 'Project completion',
                percentage: 100,
              }),
            },
          });
        }

        // Update project current amount
        await prisma.project.update({
          where: { id: project.id },
          data: {
            currentAmount: {
              increment: finalAmount,
            },
          },
        });
      }
    }

    console.log(`✅ Successfully added ${investmentCount} investments`);
    console.log(`📊 Updated project funding amounts`);
  } catch (error) {
    console.error('❌ Error adding investments:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addInvestments()
  .then(() => {
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

