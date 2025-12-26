import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import axios from 'axios';

const prisma = new PrismaClient();

// String constants for SQLite (no enums)
const KYCStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const submitKYC = async (userId: string, data: {
  documentType: string;
  documentNumber: string;
  documentUrl: string;
  verificationData?: any;
}) => {
  // Check if user already has a KYC record
  const existingKYC = await prisma.kYCRecord.findUnique({
    where: { userId },
  });

  if (existingKYC && existingKYC.status === KYCStatus.APPROVED) {
    throw createError('KYC already approved', 400);
  }

  // TODO: Integrate with external KYC service
  // const kycResult = await verifyWithKYCService(data);

  const kycRecord = await prisma.kYCRecord.upsert({
    where: { userId },
    update: {
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      documentUrl: data.documentUrl,
      verificationData: data.verificationData,
      status: KYCStatus.IN_PROGRESS,
    },
    create: {
      userId,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      documentUrl: data.documentUrl,
      verificationData: data.verificationData,
      status: KYCStatus.IN_PROGRESS,
    },
  });

  return kycRecord;
};

export const getKYCStatus = async (userId: string) => {
  const kycRecord = await prisma.kYCRecord.findUnique({
    where: { userId },
  });

  if (!kycRecord) {
    return { status: 'NOT_SUBMITTED' };
  }

  return kycRecord;
};

export const getKYCRecord = async (id: string) => {
  const record = await prisma.kYCRecord.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!record) {
    throw createError('KYC record not found', 404);
  }

  return record;
};

export const verifyKYC = async (id: string, data: {
  status: string;
  rejectionReason?: string;
}) => {
  const kycRecord = await prisma.kYCRecord.update({
    where: { id },
    data: {
      status: data.status,
      rejectionReason: data.rejectionReason,
      verifiedAt: data.status === (KYCStatus.APPROVED as string) ? new Date() : null,
    },
  });

  // Update user verification status
  if (data.status === KYCStatus.APPROVED) {
    await prisma.user.update({
      where: { id: kycRecord.userId },
      data: { isVerified: true },
    });
  }

  return kycRecord;
};


