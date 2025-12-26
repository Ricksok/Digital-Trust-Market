// Export all query hooks from a single entry point

// Auth queries
export {
  useLogin,
  useRegister,
  useCurrentUser,
  useLogout,
  useConnectWallet,
} from './auth.queries';

// Project queries
export {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useSubmitProjectForApproval,
} from './projects.queries';

// Auction queries
export {
  useAuctions,
  useAuction,
  useCreateAuction,
  useStartAuction,
  usePlaceBid,
  useWithdrawBid,
  useCloseAuction,
} from './auctions.queries';

// Guarantee queries
export {
  useGuaranteeRequests,
  useGuaranteeRequest,
  useCreateGuaranteeRequest,
  useCreateGuaranteeAuction,
  usePlaceGuaranteeBid,
  useAllocateGuarantee,
} from './guarantees.queries';

// Investment queries
export {
  useInvestments,
  useInvestment,
  useCreateInvestment,
  useCancelInvestment,
} from './investments.queries';

// Staking queries
export {
  useStakingPools,
  useUserStakes,
  useCreateStakingPool,
  useStake,
  useUnstake,
} from './staking.queries';

// Governance queries
export {
  useGovernanceProposals,
  useGovernanceProposal,
  useCreateProposal,
  useCastVote,
  useExecuteProposal,
} from './governance.queries';

// Rewards queries
export {
  useUserRewards,
  useTotalRewards,
  useClaimReward,
} from './rewards.queries';

// Trust queries
export {
  useTrustScore,
  useTrustHistory,
  useTrustExplanation,
  useUpdateTrustScore,
} from './trust.queries';

// Analytics queries
export {
  useDashboardAnalytics,
  useProjectStats,
  useInvestmentStats,
  useRevenueStats,
  useUserStats,
} from './analytics.queries';

// Regulatory Reporting queries
export {
  useRegulatoryReports,
  useRegulatoryReport,
  useGenerateCapitalMarketsReport,
  useGenerateSACCOReport,
  useGenerateTaxReport,
  useGenerateAMLReport,
  useSubmitRegulatoryReport,
} from './regulatory-reporting.queries';

// Investor Reporting queries
export {
  useInvestorReports,
  useInvestorReport,
  useGeneratePortfolioReport,
  useGenerateImpactReport,
  useGenerateFinancialReport,
  usePublishInvestorReport,
} from './investor-reporting.queries';

