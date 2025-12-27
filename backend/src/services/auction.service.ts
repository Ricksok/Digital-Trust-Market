import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import * as trustService from './trust.service';

const prisma = new PrismaClient() as any; // Temporary workaround until Prisma client is regenerated

// Helper to safely access auction model
const getAuctionModel = () => {
  if (!prisma.auction) {
    throw new Error('Auction model not available. Please run: npx prisma generate');
  }
  return prisma.auction;
};

// Auction Status Constants
const AuctionStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
};

// Bid Status Constants
const BidStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
};

/**
 * Create a new auction
 */
export const createAuction = async (data: {
  auctionType: string;
  projectId?: string;
  guaranteeRequestId?: string;
  title: string;
  description?: string;
  reservePrice?: number;
  targetAmount?: number;
  currency?: string;
  startTime: Date;
  endTime: Date;
  minTrustScore?: number;
  trustWeight?: number;
  metadata?: any;
}) => {
  // Validate timing
  if (data.endTime <= data.startTime) {
    throw createError('End time must be after start time', 400);
  }

  if (data.startTime < new Date()) {
    throw createError('Start time cannot be in the past', 400);
  }

  const auctionModel = getAuctionModel();
  const auction = await auctionModel.create({
    data: {
      auctionType: data.auctionType,
      projectId: data.projectId,
      guaranteeRequestId: data.guaranteeRequestId,
      title: data.title,
      description: data.description,
      reservePrice: data.reservePrice,
      targetAmount: data.targetAmount,
      currency: data.currency || 'KES',
      startTime: data.startTime,
      endTime: data.endTime,
      status: AuctionStatus.PENDING,
      minTrustScore: data.minTrustScore,
      trustWeight: data.trustWeight || 1.0,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    },
    include: {
      project: true,
      bids: true,
    },
  });

  return auction;
};

/**
 * Start an auction (change status to ACTIVE)
 */
export const startAuction = async (auctionId: string) => {
  const auctionModel = getAuctionModel();
  const auction = await auctionModel.findUnique({
    where: { id: auctionId },
  });

  if (!auction) {
    throw createError('Auction not found', 404);
  }

  if (auction.status !== AuctionStatus.PENDING) {
    throw createError('Auction can only be started from PENDING status', 400);
  }

  if (new Date() < auction.startTime) {
    throw createError('Auction start time has not been reached', 400);
  }

  const updated = await auctionModel.update({
    where: { id: auctionId },
    data: { status: AuctionStatus.ACTIVE },
  });

  return updated;
};

/**
 * Place a bid on an auction
 */
export const placeBid = async (
  auctionId: string,
  bidderId: string,
  data: {
    price: number;
    amount?: number;
    isProxyBid?: boolean;
    maxPrice?: number;
    notes?: string;
    metadata?: any;
  }
) => {
  // Get auction
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: { bids: true },
  });

  if (!auction) {
    throw createError('Auction not found', 404);
  }

  if (auction.status !== AuctionStatus.ACTIVE) {
    throw createError('Auction is not active', 400);
  }

  // Check timing
  const now = new Date();
  if (now < auction.startTime || now > auction.endTime) {
    throw createError('Auction is not currently accepting bids', 400);
  }

  // Check trust score eligibility
  if (auction.minTrustScore) {
    const trustScore = await trustService.getOrCreateTrustScore(bidderId);
    if (trustScore.trustScore < auction.minTrustScore) {
      throw createError(
        `Minimum trust score of ${auction.minTrustScore} required to bid`,
        403
      );
    }
  }

  // Get bidder's trust score for weighting
  const trustScore = await trustService.getOrCreateTrustScore(bidderId);
  const effectiveBid = data.price * auction.trustWeight * (trustScore.trustScore / 100);

  // Check reserve price
  if (auction.reservePrice && data.price < auction.reservePrice) {
    throw createError(`Bid must be at least ${auction.reservePrice}`, 400);
  }

  // Create bid
  const bid = await prisma.bid.create({
    data: {
      auctionId,
      bidderId,
      price: data.price,
      amount: data.amount,
      status: BidStatus.PENDING,
      bidderTrustScore: trustScore.trustScore,
      effectiveBid,
      isProxyBid: data.isProxyBid || false,
      maxPrice: data.maxPrice,
      notes: data.notes,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    },
    include: {
      auction: true,
      bidder: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Track user activity (bid submission)
  try {
    const { trackUserActivity } = await import('./trust.service');
    await trackUserActivity(bidderId, 'AUCTION', 1.5); // Higher value for auction participation
  } catch (error) {
    // Non-critical - log but don't fail bid
    console.error('Failed to track user activity on bid submission:', error);
  }

  return bid;
};

/**
 * Close an auction and determine winners
 */
export const closeAuction = async (auctionId: string) => {
  const auctionModel = getAuctionModel();
  const auction = await auctionModel.findUnique({
    where: { id: auctionId },
    include: {
      bids: {
        where: { status: BidStatus.PENDING },
        orderBy: { effectiveBid: 'asc' }, // Lower is better for reverse auctions
      },
    },
  });

  if (!auction) {
    throw createError('Auction not found', 404);
  }

  if (auction.status !== AuctionStatus.ACTIVE) {
    throw createError('Auction is not active', 400);
  }

  const now = new Date();
  if (now < auction.endTime && !auction.extendedEndTime) {
    throw createError('Auction end time has not been reached', 400);
  }

  // Determine clearing price and winners
  let clearedPrice: number | null = null;
  let acceptedBids: string[] = [];

  if (auction.bids.length > 0) {
    // For reverse auctions, lower price wins
    // Simple clearing: accept all bids at or below the clearing price
    const sortedBids = auction.bids.sort((a: any, b: any) => {
      const aEffective = a.effectiveBid || a.price;
      const bEffective = b.effectiveBid || b.price;
      return aEffective - bEffective;
    });

    // Determine clearing price (first price or second price)
    if (auction.clearingMethod === 'SECOND_PRICE' && sortedBids.length > 1) {
      clearedPrice = sortedBids[1].price;
    } else {
      clearedPrice = sortedBids[0].price;
    }

    // Accept bids at or below clearing price
    for (const bid of sortedBids) {
      if (bid.price <= (clearedPrice || Infinity)) {
        acceptedBids.push(bid.id);
      } else {
        break;
      }
    }
  }

  // Update auction
  const updatedAuction = await auctionModel.update({
    where: { id: auctionId },
    data: {
      status: AuctionStatus.CLOSED,
      clearedPrice,
      clearedAt: new Date(),
    },
  });

  // Update bid statuses
  await prisma.bid.updateMany({
    where: {
      id: { in: acceptedBids },
    },
    data: {
      status: BidStatus.ACCEPTED,
      acceptedAt: new Date(),
    },
  });

  await prisma.bid.updateMany({
    where: {
      auctionId,
      id: { notIn: acceptedBids },
      status: BidStatus.PENDING,
    },
    data: {
      status: BidStatus.REJECTED,
    },
  });

  return {
    ...updatedAuction,
    acceptedBids,
    clearedPrice,
  };
};

/**
 * Get auction by ID
 */
export const getAuctionById = async (auctionId: string) => {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: {
      project: true,
      bids: {
        include: {
          bidder: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      },
    },
  });

  if (!auction) {
    throw createError('Auction not found', 404);
  }

  return auction;
};

/**
 * Get all auctions with filters
 */
export const getAuctions = async (query: any) => {
  try {
    const {
      page = 1,
      limit = 10,
      auctionType,
      status,
      projectId,
      startDate,
      endDate,
    } = query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (auctionType) where.auctionType = auctionType;
    if (status) where.status = status;
    if (projectId) where.projectId = projectId;
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate);
      if (endDate) where.startTime.lte = new Date(endDate);
    }

    const auctionModel = getAuctionModel();
    const [auctions, total] = await Promise.all([
      auctionModel.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          project: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          bids: {
            take: 5,
            orderBy: { submittedAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      auctionModel.count({ where }),
    ]);

    return {
      auctions: auctions || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: total || 0,
        pages: Math.ceil((total || 0) / Number(limit)),
      },
    };
  } catch (error: any) {
    console.error('Error in getAuctions service:', error);
    // If table doesn't exist, return empty array
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      console.warn('Auction table does not exist yet. Run migration first.');
      return {
        auctions: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
      };
    }
    throw error;
  }
};

/**
 * Withdraw a bid
 */
export const withdrawBid = async (bidId: string, bidderId: string) => {
  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
    include: { auction: true },
  });

  if (!bid) {
    throw createError('Bid not found', 404);
  }

  if (bid.bidderId !== bidderId) {
    throw createError('Unauthorized', 403);
  }

  if (bid.status !== BidStatus.PENDING) {
    throw createError('Only pending bids can be withdrawn', 400);
  }

  if (bid.auction.status !== AuctionStatus.ACTIVE) {
    throw createError('Cannot withdraw bid from inactive auction', 400);
  }

  const updated = await prisma.bid.update({
    where: { id: bidId },
    data: {
      status: BidStatus.WITHDRAWN,
      withdrawnAt: new Date(),
    },
  });

  return updated;
};

/**
 * Cancel an auction
 */
export const cancelAuction = async (auctionId: string) => {
  const auctionModel = getAuctionModel();
  const auction = await auctionModel.findUnique({
    where: { id: auctionId },
    include: {
      bids: {
        where: { status: BidStatus.PENDING },
      },
    },
  });

  if (!auction) {
    throw createError('Auction not found', 404);
  }

  if (auction.status === AuctionStatus.CLOSED) {
    throw createError('Cannot cancel a closed auction', 400);
  }

  if (auction.status === AuctionStatus.CANCELLED) {
    throw createError('Auction is already cancelled', 400);
  }

  // Update auction status
  const updated = await auctionModel.update({
    where: { id: auctionId },
    data: {
      status: AuctionStatus.CANCELLED,
    },
  });

  // Reject all pending bids
  if (auction.bids.length > 0) {
    await prisma.bid.updateMany({
      where: {
        auctionId,
        status: BidStatus.PENDING,
      },
      data: {
        status: BidStatus.REJECTED,
      },
    });
  }

  return updated;
};

/**
 * Update auction details
 */
export const updateAuction = async (
  auctionId: string,
  data: {
    title?: string;
    description?: string;
    reservePrice?: number;
    targetAmount?: number;
    startTime?: Date;
    endTime?: Date;
    minTrustScore?: number;
    trustWeight?: number;
    metadata?: any;
  }
) => {
  const auctionModel = getAuctionModel();
  const auction = await auctionModel.findUnique({
    where: { id: auctionId },
  });

  if (!auction) {
    throw createError('Auction not found', 404);
  }

  // Can only update if auction is PENDING
  if (auction.status !== AuctionStatus.PENDING) {
    throw createError('Can only update auctions that are pending', 400);
  }

  // Validate timing if endTime is being updated
  if (data.endTime) {
    const startTime = data.startTime ? new Date(data.startTime) : auction.startTime;
    if (data.endTime <= startTime) {
      throw createError('End time must be after start time', 400);
    }
  }

  const updated = await auctionModel.update({
    where: { id: auctionId },
    data: {
      title: data.title,
      description: data.description,
      reservePrice: data.reservePrice,
      targetAmount: data.targetAmount,
      startTime: data.startTime ? new Date(data.startTime) : undefined,
      endTime: data.endTime ? new Date(data.endTime) : undefined,
      minTrustScore: data.minTrustScore,
      trustWeight: data.trustWeight,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
    },
  });

  return updated;
};

/**
 * Extend auction end time
 */
export const extendAuction = async (auctionId: string, newEndTime: Date) => {
  const auctionModel = getAuctionModel();
  const auction = await auctionModel.findUnique({
    where: { id: auctionId },
  });

  if (!auction) {
    throw createError('Auction not found', 404);
  }

  if (auction.status !== AuctionStatus.ACTIVE) {
    throw createError('Can only extend active auctions', 400);
  }

  if (newEndTime <= auction.endTime) {
    throw createError('New end time must be after current end time', 400);
  }

  const updated = await auctionModel.update({
    where: { id: auctionId },
    data: {
      endTime: newEndTime,
      extendedEndTime: newEndTime,
    },
  });

  return updated;
};

/**
 * Get bids for a user
 */
export const getUserBids = async (userId: string, query: any) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      auctionType,
      auctionId,
    } = query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {
      bidderId: userId,
    };

    if (status) where.status = status;
    if (auctionId) where.auctionId = auctionId;
    if (auctionType) {
      where.auction = {
        auctionType,
      };
    }

    const [bids, total] = await Promise.all([
      prisma.bid.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          auction: {
            include: {
              project: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                },
              },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      }),
      prisma.bid.count({ where }),
    ]);

    return {
      bids: bids || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: total || 0,
        pages: Math.ceil((total || 0) / Number(limit)),
      },
    };
  } catch (error: any) {
    console.error('Error in getUserBids service:', error);
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      console.warn('Bid table does not exist yet. Run migration first.');
      return {
        bids: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
      };
    }
    throw error;
  }
};

/**
 * Get bid by ID
 */
export const getBidById = async (bidId: string, userId?: string) => {
  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
    include: {
      auction: {
        include: {
          project: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      },
      bidder: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!bid) {
    throw createError('Bid not found', 404);
  }

  // Check permissions - only bidder or auction owner can view
  if (userId && bid.bidderId !== userId) {
    // Check if user is auction owner (would need project owner check)
    // For now, allow viewing own bids only
    throw createError('Access denied', 403);
  }

  return bid;
};

/**
 * Update a bid
 */
export const updateBid = async (
  bidId: string,
  bidderId: string,
  data: {
    price?: number;
    amount?: number;
    notes?: string;
    metadata?: any;
  }
) => {
  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
    include: { auction: true },
  });

  if (!bid) {
    throw createError('Bid not found', 404);
  }

  if (bid.bidderId !== bidderId) {
    throw createError('Unauthorized', 403);
  }

  if (bid.status !== BidStatus.PENDING) {
    throw createError('Only pending bids can be updated', 400);
  }

  if (bid.auction.status !== AuctionStatus.ACTIVE) {
    throw createError('Cannot update bid in inactive auction', 400);
  }

  // Recalculate effective bid if price changed
  let effectiveBid = bid.effectiveBid;
  if (data.price !== undefined) {
    const trustScore = await trustService.getOrCreateTrustScore(bidderId);
    effectiveBid = data.price * bid.auction.trustWeight * (trustScore.trustScore / 100);

    // Check reserve price
    if (bid.auction.reservePrice && data.price < bid.auction.reservePrice) {
      throw createError(`Bid must be at least ${bid.auction.reservePrice}`, 400);
    }
  }

  const updated = await prisma.bid.update({
    where: { id: bidId },
    data: {
      price: data.price,
      amount: data.amount,
      notes: data.notes,
      effectiveBid,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
    },
    include: {
      auction: true,
      bidder: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return updated;
};

