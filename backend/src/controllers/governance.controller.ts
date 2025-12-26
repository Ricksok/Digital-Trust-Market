import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as governanceService from '../services/governance.service';

export const createProposal = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const proposerId = req.user!.id;
    const { title, description, proposalType, votingStart, votingEnd, quorum, threshold } = req.body;

    if (!title || !description || !proposalType || !votingStart || !votingEnd) {
      return res.status(400).json({
        success: false,
        error: { message: 'Missing required fields' },
      });
    }

    const proposal = await governanceService.createProposal(proposerId, {
      title,
      description,
      proposalType,
      votingStart: new Date(votingStart),
      votingEnd: new Date(votingEnd),
      quorum,
      threshold,
    });

    res.json({ success: true, data: proposal, message: 'Proposal created successfully' });
  } catch (error) {
    next(error);
  }
};

export const castVote = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const proposalId = req.params.proposalId;
    const voterId = req.user!.id;
    const { vote } = req.body;

    if (!vote) {
      return res.status(400).json({
        success: false,
        error: { message: 'Vote is required' },
      });
    }

    const voteRecord = await governanceService.castVote(proposalId, voterId, vote);
    res.json({ success: true, data: voteRecord, message: 'Vote cast successfully' });
  } catch (error) {
    next(error);
  }
};

export const getProposal = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const proposalId = req.params.proposalId;
    const proposal = await governanceService.getProposal(proposalId);
    res.json({ success: true, data: proposal });
  } catch (error) {
    next(error);
  }
};

export const listProposals = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as string | undefined;
    const proposerId = req.query.proposerId as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;

    const proposals = await governanceService.listProposals({
      status,
      proposerId,
      limit,
    });
    res.json({ success: true, data: proposals });
  } catch (error) {
    next(error);
  }
};

export const executeProposal = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Only admins can execute proposals
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions' },
      });
    }

    const proposalId = req.params.proposalId;
    const { executionHash } = req.body;

    const proposal = await governanceService.executeProposal(proposalId, executionHash);
    res.json({ success: true, data: proposal, message: 'Proposal executed successfully' });
  } catch (error) {
    next(error);
  }
};


