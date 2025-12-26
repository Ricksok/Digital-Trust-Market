import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import * as trustService from './trust.service';
import * as auctionService from './auction.service';

const prisma = new PrismaClient();

// Guarantee Request Status
const GuaranteeRequestStatus = {
  PENDING: 'PENDING',
  AUCTION_ACTIVE: 'AUCTION_ACTIVE',
  ALLOCATED: 'ALLOCATED',
  EXPIRED: 'EXPIRED',
};

// Guarantee Bid Status
const GuaranteeBidStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
};

// Guarantee Allocation Status
const GuaranteeAllocationStatus = {
  ACTIVE: 'ACTIVE',
  DRAWN: 'DRAWN',
  RELEASED: 'RELEASED',
  EXPIRED: 'EXPIRED',
};

/**
 * Create a guarantee request
 */
export const createGuaranteeRequest = async (data: {
  issuerId: string;
  projectId?: string;
  investmentId?: string;
  guaranteeType: string;
  requestedCoverage: number;
  amount: number;
  currency?: string;
  expiresAt?: Date;
  metadata?: any;
}) => {
  // Validate coverage
  if (data.requestedCoverage < 0 || data.requestedCoverage > 100) {
    throw createError('Coverage must be between 0 and 100', 400);
  }

  const request = await prisma.guaranteeRequest.create({
    data: {
      issuerId: data.issuerId,
      projectId: data.projectId,
      investmentId: data.investmentId,
      guaranteeType: data.guaranteeType,
      requestedCoverage: data.requestedCoverage,
      amount: data.amount,
      currency: data.currency || 'KES',
      status: GuaranteeRequestStatus.PENDING,
      expiresAt: data.expiresAt,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
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
          status: true,
        },
      },
    },
  });

  return request;
};

/**
 * Create a reverse auction for guarantee allocation
 */
export const createGuaranteeAuction = async (guaranteeRequestId: string) => {
  const request = await prisma.guaranteeRequest.findUnique({
    where: { id: guaranteeRequestId },
  });

  if (!request) {
    throw createError('Guarantee request not found', 404);
  }

  if (request.status !== GuaranteeRequestStatus.PENDING) {
    throw createError('Guarantee request is not in PENDING status', 400);
  }

  // Create auction for guarantee allocation
  const auction = await auctionService.createAuction({
    auctionType: 'GUARANTEE',
    guaranteeRequestId,
    title: `Guarantee Auction: ${request.guaranteeType}`,
    description: `Reverse auction for guarantee allocation. Coverage: ${request.requestedCoverage}%, Amount: ${request.amount} ${request.currency}`,
    reservePrice: 0, // No minimum fee
    currency: request.currency,
    startTime: new Date(),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    minTrustScore: 60, // Minimum trust for guarantors
    trustWeight: 1.2, // Higher weight for guarantee trust
  });

  // Update request status
  await prisma.guaranteeRequest.update({
    where: { id: guaranteeRequestId },
    data: {
      status: GuaranteeRequestStatus.AUCTION_ACTIVE,
      auctionId: auction.id,
    },
  });

  return auction;
};

/**
 * Place a guarantee bid
 */
export const placeGuaranteeBid = async (
  guaranteeRequestId: string,
  guarantorId: string,
  data: {
    coveragePercent: number;
    feePercent: number;
    layer?: string;
    maxCapacity?: number;
    notes?: string;
    metadata?: any;
  }
) => {
  const request = await prisma.guaranteeRequest.findUnique({
    where: { id: guaranteeRequestId },
    include: { guaranteeBids: true },
  });

  if (!request) {
    throw createError('Guarantee request not found', 404);
  }

  if (request.status !== GuaranteeRequestStatus.AUCTION_ACTIVE) {
    throw createError('Guarantee request is not accepting bids', 400);
  }

  // Validate coverage
  if (data.coveragePercent < 0 || data.coveragePercent > 100) {
    throw createError('Coverage must be between 0 and 100', 400);
  }

  // Check guarantor's guarantee trust score
  const guarantorScore = await prisma.guarantorScore.findUnique({
    where: { entityId: guarantorId },
  });

  if (!guarantorScore || guarantorScore.guaranteeTrustScore < 50) {
    throw createError('Insufficient guarantee trust score', 403);
  }

  // Check capacity
  if (data.maxCapacity && request.amount > data.maxCapacity) {
    throw createError('Requested amount exceeds guarantor capacity', 400);
  }

  // Get guarantor's trust score for weighting
  const trustScore = await trustService.getOrCreateTrustScore(guarantorId);
  const effectiveBid = data.feePercent * 1.2 * ((guarantorScore.guaranteeTrustScore || 0) / 100);

  const bid = await prisma.guaranteeBid.create({
    data: {
      guaranteeRequestId,
      guarantorId,
      coveragePercent: data.coveragePercent,
      feePercent: data.feePercent,
      layer: data.layer,
      maxCapacity: data.maxCapacity,
      availableCapacity: data.maxCapacity ? data.maxCapacity - request.amount : null,
      status: GuaranteeBidStatus.PENDING,
      guarantorTrustScore: guarantorScore.guaranteeTrustScore,
      effectiveBid,
      notes: data.notes,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    },
    include: {
      guarantor: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          companyName: true,
        },
      },
      guaranteeRequest: true,
    },
  });

  return bid;
};

/**
 * Allocate guarantees after auction closes
 */
export const allocateGuarantees = async (guaranteeRequestId: string) => {
  const request = await prisma.guaranteeRequest.findUnique({
    where: { id: guaranteeRequestId },
  });

  if (!request) {
    throw createError('Guarantee request not found', 404);
  }

  const guaranteeBids = await prisma.guaranteeBid.findMany({
    where: {
      guaranteeRequestId,
      status: GuaranteeBidStatus.PENDING,
    },
    orderBy: { effectiveBid: 'asc' }, // Lower fee wins
  });

  const auction = request.auctionId ? await prisma.auction.findUnique({
    where: { id: request.auctionId },
  }) : null;

  if (!request) {
    throw createError('Guarantee request not found', 404);
  }

  if (request.status !== GuaranteeRequestStatus.AUCTION_ACTIVE) {
    throw createError('Guarantee request is not in auction phase', 400);
  }

  if (!auction || auction.status !== 'CLOSED') {
    throw createError('Auction must be closed before allocation', 400);
  }

  // Allocate guarantees in layers
  let remainingCoverage = request.requestedCoverage;
  const allocations: any[] = [];

  // Sort bids by layer priority: FIRST_LOSS, MEZZANINE, SENIOR
  const layerPriority = { FIRST_LOSS: 1, MEZZANINE: 2, SENIOR: 3 };
  const sortedBids = guaranteeBids.sort((a: any, b: any) => {
    const aPriority = a.layer ? layerPriority[a.layer as keyof typeof layerPriority] || 99 : 99;
    const bPriority = b.layer ? layerPriority[b.layer as keyof typeof layerPriority] || 99 : 99;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return (a.effectiveBid || a.feePercent) - (b.effectiveBid || b.feePercent);
  });

  for (const bid of sortedBids) {
    if (remainingCoverage <= 0) break;

    const coverageToAllocate = Math.min(bid.coveragePercent, remainingCoverage);
    const amountToAllocate = (request.amount * coverageToAllocate) / 100;

    const allocation = await prisma.guaranteeAllocation.create({
      data: {
        guaranteeRequestId,
        guarantorId: bid.guarantorId,
        coveragePercent: coverageToAllocate,
        feePercent: bid.feePercent,
        amount: amountToAllocate,
        layer: bid.layer || 'SENIOR',
        status: GuaranteeAllocationStatus.ACTIVE,
        expiresAt: request.expiresAt,
      },
    });

    allocations.push(allocation);
    remainingCoverage -= coverageToAllocate;

    // Update bid status
    await prisma.guaranteeBid.update({
      where: { id: bid.id },
      data: { status: GuaranteeBidStatus.ACCEPTED, acceptedAt: new Date() },
    });
  }

  // Update request status
  const totalAllocated = allocations.reduce((sum, a) => sum + a.coveragePercent, 0);
  await prisma.guaranteeRequest.update({
    where: { id: guaranteeRequestId },
    data: {
      status: GuaranteeRequestStatus.ALLOCATED,
      allocatedCoverage: totalAllocated,
      allocatedAt: new Date(),
      allocatedLayers: JSON.stringify(
        allocations.map((a) => ({
          layer: a.layer,
          coverage: a.coveragePercent,
          guarantorId: a.guarantorId,
        }))
      ),
    },
  });

  // Reject remaining bids
  await prisma.guaranteeBid.updateMany({
    where: {
      guaranteeRequestId,
      status: GuaranteeBidStatus.PENDING,
      id: { notIn: allocations.map((a) => a.id) },
    },
    data: { status: GuaranteeBidStatus.REJECTED },
  });

  return {
    request,
    allocations,
    totalCoverage: totalAllocated,
  };
};

/**
 * Get guarantee request by ID
 */
export const getGuaranteeRequestById = async (id: string) => {
  const request = await prisma.guaranteeRequest.findUnique({
    where: { id },
    include: {
      issuer: true,
      project: true,
      guaranteeBids: {
        include: {
          guarantor: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              companyName: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      },
      guaranteeAllocations: {
        include: {
          guarantor: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              companyName: true,
            },
          },
        },
      },
    },
  });

  if (!request) {
    throw createError('Guarantee request not found', 404);
  }

  return request;
};

/**
 * Get all guarantee requests
 */
export const getGuaranteeRequests = async (query: any) => {
  const {
    page = 1,
    limit = 10,
    issuerId,
    status,
    guaranteeType,
    projectId,
  } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const where: any = {};

  if (issuerId) where.issuerId = issuerId;
  if (status) where.status = status;
  if (guaranteeType) where.guaranteeType = guaranteeType;
  if (projectId) where.projectId = projectId;

  const [requests, total] = await Promise.all([
    prisma.guaranteeRequest.findMany({
      where,
      skip,
      take: Number(limit),
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
        guaranteeAllocations: {
          take: 3,
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.guaranteeRequest.count({ where }),
  ]);

  return {
    requests,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

