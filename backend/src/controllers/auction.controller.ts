import { Request, Response } from 'express';
import * as auctionService from '../services/auction.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const createAuction = async (req: AuthRequest, res: Response) => {
  try {
    const auction = await auctionService.createAuction(req.body);
    res.status(201).json(auction);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const getAuctions = async (req: Request, res: Response) => {
  try {
    const result = await auctionService.getAuctions(req.query);
    // Return auctions array directly for frontend compatibility
    const auctions = result.auctions || [];
    console.log(`Returning ${auctions.length} auctions`);
    res.json({ success: true, data: auctions, pagination: result.pagination });
  } catch (error: any) {
    console.error('Error in getAuctions controller:', error);
    const errorMessage = error.message || 'Failed to load auctions';
    const statusCode = error.status || error.code === 'P2021' ? 503 : 500;
    res.status(statusCode).json({ 
      success: false, 
      error: { 
        message: errorMessage,
        code: error.code,
        hint: error.code === 'P2021' ? 'Database migration may be needed. Run: npm run db:migrate' : undefined
      } 
    });
  }
};

export const getAuctionById = async (req: Request, res: Response) => {
  try {
    const auction = await auctionService.getAuctionById(req.params.id);
    res.json({ success: true, data: auction });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: { message: error.message } });
  }
};

export const startAuction = async (req: AuthRequest, res: Response) => {
  try {
    const auction = await auctionService.startAuction(req.params.id);
    res.json(auction);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const placeBid = async (req: AuthRequest, res: Response) => {
  try {
    const bid = await auctionService.placeBid(
      req.params.id,
      req.user!.id,
      req.body
    );
    res.status(201).json({ success: true, data: bid });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: { message: error.message } });
  }
};

export const closeAuction = async (req: AuthRequest, res: Response) => {
  try {
    const result = await auctionService.closeAuction(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const withdrawBid = async (req: AuthRequest, res: Response) => {
  try {
    const bid = await auctionService.withdrawBid(
      req.params.bidId,
      req.user!.id
    );
    res.json(bid);
  } catch (error: any) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const cancelAuction = async (req: AuthRequest, res: Response) => {
  try {
    const auction = await auctionService.cancelAuction(req.params.id);
    res.json({ success: true, data: auction, message: 'Auction cancelled successfully' });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: { message: error.message } });
  }
};

export const updateAuction = async (req: AuthRequest, res: Response) => {
  try {
    const auction = await auctionService.updateAuction(req.params.id, req.body);
    res.json({ success: true, data: auction, message: 'Auction updated successfully' });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: { message: error.message } });
  }
};

export const extendAuction = async (req: AuthRequest, res: Response) => {
  try {
    const { newEndTime } = req.body;
    if (!newEndTime) {
      return res.status(400).json({ success: false, error: { message: 'newEndTime is required' } });
    }
    const auction = await auctionService.extendAuction(req.params.id, new Date(newEndTime));
    res.json({ success: true, data: auction, message: 'Auction extended successfully' });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: { message: error.message } });
  }
};

export const getUserBids = async (req: AuthRequest, res: Response) => {
  try {
    const result = await auctionService.getUserBids(req.user!.id, req.query);
    res.json({ success: true, data: result.bids, pagination: result.pagination });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: { message: error.message } });
  }
};

export const getBidById = async (req: AuthRequest, res: Response) => {
  try {
    const bid = await auctionService.getBidById(req.params.id, req.user?.id);
    res.json({ success: true, data: bid });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: { message: error.message } });
  }
};

export const updateBid = async (req: AuthRequest, res: Response) => {
  try {
    const bid = await auctionService.updateBid(req.params.id, req.user!.id, req.body);
    res.json({ success: true, data: bid, message: 'Bid updated successfully' });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, error: { message: error.message } });
  }
};

