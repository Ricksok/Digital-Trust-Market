// Export all query hooks from a single entry point

// Auth queries
export {
  useLogin,
  useRegister,
  useCurrentUser,
  useLogout,
  useConnectWallet,
} from './auth.queries';

// Onboarding queries
export {
  useRegisterOnboarding,
  useOnboardingStatus,
  useUserProfile,
  useSubmitBusinessVerification,
  useLinkMembership,
  useCompleteOnboarding,
} from './onboarding.queries';

// Vendor Central queries
export {
  useVendorDashboard,
} from './vendor-central.queries';

// Learning queries
export {
  useCourses,
  useCourse,
  useLearningProfile,
  useEnrollInCourse,
  useUpdateProgress,
  useCompleteCourse,
  useFeatureUnlock,
  useSubmitQuiz,
  // Admin queries
  useAllCourses,
  useCreateCourse,
  useUpdateCourse,
  usePublishCourse,
  useUnpublishCourse,
  useDeleteCourse,
} from './learning.queries';

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
  useDecayRecoveryHistory,
  useTrackActivity,
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

// Cart queries
export {
  useCart,
  useAddToCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
} from './cart.queries';

// Checkout queries
export {
  useOrders,
  useOrder,
  useCheckout,
} from './checkout.queries';

