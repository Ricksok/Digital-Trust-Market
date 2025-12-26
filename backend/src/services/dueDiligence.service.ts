import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const initiateDueDiligence = async (projectId: string) => {
  // Check if due diligence already exists
  const existing = await prisma.dueDiligence.findUnique({
    where: { projectId },
  });

  if (existing) {
    throw createError('Due diligence already initiated', 400);
  }

  // TODO: Implement automated due diligence checks
  // This could include:
  // - Financial analysis
  // - Legal compliance checks
  // - Risk assessment
  // - Background checks

  const dueDiligence = await prisma.dueDiligence.create({
    data: {
      projectId,
      score: 0, // Will be calculated
      riskLevel: 'UNKNOWN',
      checks: JSON.stringify({
        financial: { status: 'PENDING' },
        legal: { status: 'PENDING' },
        background: { status: 'PENDING' },
      }),
    },
  });

  // TODO: Trigger automated checks
  // await runAutomatedChecks(projectId);

  return dueDiligence;
};

export const updateDueDiligence = async (projectId: string, data: {
  score?: number;
  riskLevel?: string;
  checks?: any;
  reportUrl?: string;
  reviewedBy?: string;
}) => {
  const dueDiligence = await prisma.dueDiligence.update({
    where: { projectId },
    data: {
      ...data,
      reviewedAt: data.reviewedBy ? new Date() : undefined,
    },
  });

  // Update project with due diligence score
  if (data.score !== undefined) {
    await prisma.project.update({
      where: { id: projectId },
      data: { dueDiligenceScore: data.score },
    });
  }

  return dueDiligence;
};

export const getDueDiligence = async (projectId: string) => {
  const dueDiligence = await prisma.dueDiligence.findUnique({
    where: { projectId },
  });

  if (!dueDiligence) {
    throw createError('Due diligence not found', 404);
  }

  return dueDiligence;
};


