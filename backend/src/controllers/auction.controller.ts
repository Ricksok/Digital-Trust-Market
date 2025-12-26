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

