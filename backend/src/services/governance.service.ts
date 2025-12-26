import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import * as tokenService from './token.service';
import * as trustService from './trust.service';

const prisma = new PrismaClient() as any; // Temporary workaround until Prisma client is regenerated

// Helper to safely access governance models
const getGovernanceProposalModel = () => {
  if (!prisma.governanceProposal) {
    throw new Error('GovernanceProposal model not available. Please run: npx prisma generate');
  }
  return prisma.governanceProposal;
};

const getGovernanceVoteModel = () => {
  if (!prisma.governanceVote) {
    throw new Error('GovernanceVote model not available. Please run: npx prisma generate');
  }
  return prisma.governanceVote;
};

// Proposal Types
const PROPOSAL_TYPES = {
  POLICY_CHANGE: 'POLICY_CHANGE',
  PARAMETER_UPDATE: 'PARAMETER_UPDATE',
  FUND_ALLOCATION: 'FUND_ALLOCATION',
  TOKENOMICS_CHANGE: 'TOKENOMICS_CHANGE',
};

// Vote Types
const VOTE_TYPES = {
  YES: 'YES',
  NO: 'NO',
  ABSTAIN: 'ABSTAIN',
};

/**
 * Create a governance proposal
 */
export const createProposal = async (
  proposerId: string,
  data: {
    title: string;
    description: string;
    proposalType: string;
    votingStart: Date;
    votingEnd: Date;
    quorum?: number;
    threshold?: number;
  }
) => {
  // Get proposer's governance token balance
  const govToken = await tokenService.getToken('BTA-GOV');
  const balance = await tokenService.getBalance(proposerId, govToken.id);

  // Minimum balance required to propose (e.g., 1000 BTA-GOV)
  const minProposalBalance = 1000;
  if (balance.balance < minProposalBalance) {
    throw createError('Insufficient governance tokens to create proposal', 400);
  }

  const proposalModel = getGovernanceProposalModel();
  const proposal = await proposalModel.create({
    data: {
      proposerId,
      title: data.title,
      description: data.description,
      proposalType: data.proposalType,
      votingStart: data.votingStart,
      votingEnd: data.votingEnd,
      quorum: data.quorum || 10.0, // 10% default quorum
      threshold: data.threshold || 50.0, // 50% default threshold
      status: 'PENDING',
    },
    include: {
      proposer: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          companyName: true,
        },
      },
    },
  });

  return proposal;
};

/**
 * Cast a vote on a proposal
 */
export const castVote = async (
  proposalId: string,
  voterId: string,
  vote: string
) => {
  if (!Object.values(VOTE_TYPES).includes(vote)) {
    throw createError('Invalid vote type', 400);
  }

  const proposalModel = getGovernanceProposalModel();
  const proposal = await proposalModel.findUnique({
    where: { id: proposalId },
  });

  if (!proposal) {
    throw createError('Proposal not found', 404);
  }

  const now = new Date();
  if (now < proposal.votingStart) {
    throw createError('Voting has not started yet', 400);
  }
  if (now > proposal.votingEnd) {
    throw createError('Voting has ended', 400);
  }

  if (proposal.status !== 'ACTIVE' && proposal.status !== 'PENDING') {
    throw createError('Proposal is not open for voting', 400);
  }

  // Check if already voted
  const voteModel = getGovernanceVoteModel();
  const existingVote = await voteModel.findUnique({
    where: {
      proposalId_voterId: {
        proposalId,
        voterId,
      },
    },
  });

  if (existingVote) {
    throw createError('Already voted on this proposal', 400);
  }

  // Get voter's governance token balance
  const govToken = await tokenService.getToken('BTA-GOV');
  const balance = await tokenService.getBalance(voterId, govToken.id);
  const votingPower = balance.balance;

  // Get voter's trust score for weighted voting
  const trustScore = await trustService.getTrustScore(voterId);
  const weight = votingPower * (trustScore.trustScore / 100);

  // Create vote
  const voteRecord = await voteModel.create({
    data: {
      proposalId,
      voterId,
      vote,
      votingPower,
      weight,
      voterTrustScore: trustScore.trustScore,
    },
    include: {
      voter: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          companyName: true,
        },
      },
    },
  });

  // Update proposal vote counts
  await updateProposalVotes(proposalId);

  return voteRecord;
};

/**
 * Update proposal vote counts and status
 */
export const updateProposalVotes = async (proposalId: string) => {
  const proposalModel = getGovernanceProposalModel();
  const proposal = await proposalModel.findUnique({
    where: { id: proposalId },
    include: {
      votes: true,
    },
  });

  if (!proposal) {
    throw createError('Proposal not found', 404);
  }

  // Calculate vote totals
  const totalVotes = proposal.votes.reduce((sum: number, v: any) => sum + (v.votingPower || 0), 0);
  const yesVotes = proposal.votes
    .filter((v: any) => v.vote === VOTE_TYPES.YES)
    .reduce((sum: number, v: any) => sum + (v.votingPower || 0), 0);
  const noVotes = proposal.votes
    .filter((v: any) => v.vote === VOTE_TYPES.NO)
    .reduce((sum: number, v: any) => sum + (v.votingPower || 0), 0);
  const abstainVotes = proposal.votes
    .filter((v: any) => v.vote === VOTE_TYPES.ABSTAIN)
    .reduce((sum: number, v: any) => sum + (v.votingPower || 0), 0);

  // Get total governance token supply for quorum calculation
  const govToken = await tokenService.getToken('BTA-GOV');
  const totalSupply = govToken.circulatingSupply;
  const quorumMet = totalSupply > 0 && (totalVotes / totalSupply) * 100 >= proposal.quorum;

  // Determine status
  let status = proposal.status;
  const now = new Date();

  if (now >= proposal.votingStart && now <= proposal.votingEnd && status === 'PENDING') {
    status = 'ACTIVE';
  } else if (now > proposal.votingEnd) {
    if (quorumMet && (yesVotes / totalVotes) * 100 >= proposal.threshold) {
      status = 'PASSED';
    } else {
      status = 'REJECTED';
    }
  }

  // Update proposal
  await proposalModel.update({
    where: { id: proposalId },
    data: {
      status,
      totalVotes,
      yesVotes,
      noVotes,
      abstainVotes,
    },
  });

  return { status, totalVotes, yesVotes, noVotes, abstainVotes, quorumMet };
};

/**
 * Get proposal by ID
 */
export const getProposal = async (proposalId: string) => {
  const proposalModel = getGovernanceProposalModel();
  const proposal = await proposalModel.findUnique({
    where: { id: proposalId },
    include: {
      proposer: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          companyName: true,
        },
      },
      votes: {
        include: {
          voter: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              companyName: true,
            },
          },
        },
        orderBy: { votingPower: 'desc' },
      },
    },
  });

  if (!proposal) {
    throw createError('Proposal not found', 404);
  }

  return proposal;
};

/**
 * List proposals
 */
export const listProposals = async (filters?: {
  status?: string;
  proposerId?: string;
  limit?: number;
}) => {
  const proposalModel = getGovernanceProposalModel();
  const proposals = await proposalModel.findMany({
    where: {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.proposerId && { proposerId: filters.proposerId }),
    },
    include: {
      proposer: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          companyName: true,
        },
      },
      votes: {
        select: {
          vote: true,
          votingPower: true,
        },
      },
      _count: {
        select: {
          votes: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: filters?.limit || 50,
  });

  // Calculate vote totals for each proposal
  return proposals.map((proposal: any) => {
    const yesVotes = proposal.votes
      .filter((v: any) => v.vote === 'YES')
      .reduce((sum: number, v: any) => sum + (v.votingPower || 0), 0);
    const noVotes = proposal.votes
      .filter((v: any) => v.vote === 'NO')
      .reduce((sum: number, v: any) => sum + (v.votingPower || 0), 0);
    const abstainVotes = proposal.votes
      .filter((v: any) => v.vote === 'ABSTAIN')
      .reduce((sum: number, v: any) => sum + (v.votingPower || 0), 0);
    const totalVotes = yesVotes + noVotes + abstainVotes;

    return {
      ...proposal,
      yesVotes: proposal.yesVotes || yesVotes,
      noVotes: proposal.noVotes || noVotes,
      abstainVotes: proposal.abstainVotes || abstainVotes,
      totalVotes: proposal.totalVotes || totalVotes,
    };
  });
};

/**
 * Execute a passed proposal (admin only)
 */
export const executeProposal = async (proposalId: string, executionHash?: string) => {
  const proposalModel = getGovernanceProposalModel();
  const proposal = await proposalModel.findUnique({
    where: { id: proposalId },
  });

  if (!proposal) {
    throw createError('Proposal not found', 404);
  }

  if (proposal.status !== 'PASSED') {
    throw createError('Proposal must be passed before execution', 400);
  }

  if (proposal.executedAt) {
    throw createError('Proposal already executed', 400);
  }

  await proposalModel.update({
    where: { id: proposalId },
    data: {
      status: 'EXECUTED',
      executedAt: new Date(),
      executionHash,
    },
  });

  return await getProposal(proposalId);
};

