import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🗑️  Resetting database...');

  try {
    // Delete in order to respect foreign key constraints
    await prisma.auditLog.deleteMany();
    await prisma.complianceRecord.deleteMany();
    await prisma.dueDiligence.deleteMany();
    await prisma.escrowContract.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.investment.deleteMany();
    await prisma.project.deleteMany();
    await prisma.kYCRecord.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Database reset complete');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();


