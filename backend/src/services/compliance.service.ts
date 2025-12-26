import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import axios from 'axios';

const prisma = new PrismaClient();

export const submitCompliance = async (userId: string, data: {
  type: string;
  documents: string[];
  projectId?: string;
}) => {
  const complianceRecord = await prisma.complianceRecord.create({
    data: {
      userId,
      projectId: data.projectId,
      type: data.type,
      status: 'PENDING',
      documents: Array.isArray(data.documents) ? JSON.stringify(data.documents) : data.documents,
    },
  });

  // TODO: Submit to CMA or external compliance service
  // await submitToCMA(complianceRecord);

  return complianceRecord;
};

export const getComplianceStatus = async (userId: string, query: any) => {
  const { projectId } = query;
  const where: any = { userId };
  if (projectId) where.projectId = projectId;

  const records = await prisma.complianceRecord.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return records;
};

export const registerWithCMA = async (data: {
  companyName: string;
  registrationNumber: string;
  documents: string[];
}) => {
  // TODO: Integrate with CMA API
  // const cmaResponse = await axios.post(process.env.CMA_API_URL + '/register', data);

  const complianceRecord = await prisma.complianceRecord.create({
    data: {
      type: 'CMA_REGISTRATION',
      status: 'PENDING',
      cmaReference: '', // cmaResponse.data.reference,
      documents: Array.isArray(data.documents) ? JSON.stringify(data.documents) : data.documents,
    },
  });

  return complianceRecord;
};

export const getAuditLogs = async (query: any) => {
  const { page = 1, limit = 10, userId, entityType, entityId } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (userId) where.userId = userId;
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const verifyCompliance = async (id: string, data: {
  status: string;
  auditorNotes?: string;
}) => {
  const complianceRecord = await prisma.complianceRecord.update({
    where: { id },
    data: {
      status: data.status,
      auditorNotes: data.auditorNotes,
      verifiedAt: data.status === 'APPROVED' ? new Date() : null,
    },
  });

  return complianceRecord;
};


