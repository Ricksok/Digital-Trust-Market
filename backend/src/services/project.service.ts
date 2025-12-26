import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

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

export const createProject = async (fundraiserId: string, data: {
  title: string;
  description: string;
  category: string;
  targetAmount: number;
  minInvestment: number;
  maxInvestment?: number;
  images?: string[];
  documents?: string[];
  metadata?: any;
  startDate?: Date;
  endDate?: Date;
}) => {
  const project = await prisma.project.create({
    data: {
      fundraiserId,
      title: data.title,
      description: data.description,
      category: data.category,
      targetAmount: data.targetAmount,
      minInvestment: data.minInvestment,
      maxInvestment: data.maxInvestment,
      images: data.images ? JSON.stringify(data.images) : null,
      documents: data.documents ? JSON.stringify(data.documents) : null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      startDate: data.startDate,
      endDate: data.endDate,
      status: ProjectStatus.DRAFT,
    },
    include: {
      fundraiser: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return project;
};

export const getAllProjects = async (query: any) => {
  const { page = 1, limit = 10, status, category, search } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        fundraiser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            investments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.project.count({ where }),
  ]);

  return {
    projects,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getProjectById = async (id: string) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      fundraiser: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isVerified: true,
        },
      },
      investments: {
        include: {
          investor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      _count: {
        select: {
          investments: true,
        },
      },
    },
  });

  if (!project) {
    throw createError('Project not found', 404);
  }

  return project;
};

export const updateProject = async (id: string, fundraiserId: string, data: any) => {
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    throw createError('Project not found', 404);
  }

  if (project.fundraiserId !== fundraiserId) {
    throw createError('Unauthorized', 403);
  }

  if (project.status !== ProjectStatus.DRAFT) {
    throw createError('Cannot update project in current status', 400);
  }

  // Stringify JSON fields for SQLite compatibility
  const updateData: any = { ...data };
  if (updateData.images !== undefined) {
    updateData.images = Array.isArray(updateData.images) 
      ? JSON.stringify(updateData.images) 
      : updateData.images;
  }
  if (updateData.documents !== undefined) {
    updateData.documents = Array.isArray(updateData.documents) 
      ? JSON.stringify(updateData.documents) 
      : updateData.documents;
  }
  if (updateData.metadata !== undefined && typeof updateData.metadata !== 'string') {
    updateData.metadata = JSON.stringify(updateData.metadata);
  }

  const updatedProject = await prisma.project.update({
    where: { id },
    data: updateData,
    include: {
      fundraiser: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return updatedProject;
};

export const deleteProject = async (id: string, fundraiserId: string) => {
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    throw createError('Project not found', 404);
  }

  if (project.fundraiserId !== fundraiserId) {
    throw createError('Unauthorized', 403);
  }

  if (project.status !== ProjectStatus.DRAFT) {
    throw createError('Cannot delete project in current status', 400);
  }

  await prisma.project.delete({
    where: { id },
  });
};

export const submitForApproval = async (id: string, fundraiserId: string) => {
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    throw createError('Project not found', 404);
  }

  if (project.fundraiserId !== fundraiserId) {
    throw createError('Unauthorized', 403);
  }

  if (project.status !== ProjectStatus.DRAFT) {
    throw createError('Project already submitted', 400);
  }

  const updatedProject = await prisma.project.update({
    where: { id },
    data: { status: ProjectStatus.PENDING_APPROVAL },
  });

  // TODO: Trigger due diligence process
  // await dueDiligenceService.initiateDueDiligence(id);

  return updatedProject;
};

export const approveProject = async (id: string) => {
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    throw createError('Project not found', 404);
  }

  if (project.status !== ProjectStatus.PENDING_APPROVAL) {
    throw createError('Project is not pending approval', 400);
  }

  const updatedProject = await prisma.project.update({
    where: { id },
    data: { status: ProjectStatus.APPROVED },
  });

  return updatedProject;
};


