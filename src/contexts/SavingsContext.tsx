import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { useUserPlans, usePlan, useUserContribution, formatTokenAmount, SavingsPlan } from "@/contracts/hooks";
import { SUPPORTED_TOKENS } from "@/contracts/config";

// Extended plan interface with additional computed data
export interface EnhancedSavingsPlan extends SavingsPlan {
  progressPercentage: number;
  formattedTarget: string;
  formattedDeposited: string;
  userContribution: bigint;
  formattedUserContribution: string;
  isExpired: boolean;
  daysRemaining: number;
  tokenSymbol: string;
  tokenDecimals: number;
}

// User savings summary
export interface UserSavingsData {
  plans: EnhancedSavingsPlan[];
  totalPlans: number;
  activePlans: number;
  completedPlans: number;
  totalSaved: string;
  totalTargets: string;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Context interface
interface SavingsContextType {
  userSavings: UserSavingsData;
  getPlanById: (planId: number) => EnhancedSavingsPlan | undefined;
  refreshPlan: (planId: number) => void;
  refreshUserData: () => void;
}

// Create context
const SavingsContext = createContext<SavingsContextType | undefined>(undefined);

// Individual plan data component that fetches and enhances plan data
function PlanDataFetcher({ 
  planId, 
  userAddress, 
  onPlanLoaded 
}: { 
  planId: bigint; 
  userAddress: Address; 
  onPlanLoaded: (plan: EnhancedSavingsPlan) => void;
}) {
  const { data: planData, isLoading: isPlanLoading } = usePlan(Number(planId));
  const { data: userContribution } = useUserContribution(Number(planId), userAddress);
  const safeUserContribution: bigint = typeof userContribution === 'bigint' ? userContribution : 0n;

  // Function to get token info
  const getTokenInfo = (tokenAddress: Address) => {
    if (!tokenAddress) {
      // Use the first supported token as fallback instead of hardcoding
      const fallbackToken = SUPPORTED_TOKENS[0];
      return {
        symbol: "Unknown",
        decimals: fallbackToken.decimals,
      };
    }
    
    const token = SUPPORTED_TOKENS.find(
      (t) => t.address.toLowerCase() === tokenAddress.toLowerCase()
    );
    
    // Use the first supported token as fallback instead of hardcoding
    const fallbackToken = SUPPORTED_TOKENS[0];
    return {
      symbol: token?.symbol || "Unknown",
      decimals: token?.decimals || fallbackToken.decimals,
    };
  };

  // Enhance plan data
  const enhancedPlan = useMemo(() => {
    if (!planData) return null;

    // Convert tuple to object format if needed
    const plan = Array.isArray(planData) ? {
      id: planData[0] as bigint,
      name: planData[1] as string,
      owner: planData[2] as Address,
      beneficiary: planData[3] as Address,
      token: planData[4] as Address,
      target: planData[5] as bigint,
      deposited: planData[6] as bigint,
      deadline: planData[7] as bigint,
      active: planData[8] as boolean,
      withdrawn: planData[9] as boolean,
      cancelled: planData[10] as boolean,
    } as SavingsPlan : planData as SavingsPlan;
    
    if (!plan.token) return null; // Add null check for token
    
    const tokenInfo = getTokenInfo(plan.token);
    const progressPercentage = plan.target > 0n ? Number((plan.deposited * 100n) / plan.target) : 0;
    const now = Date.now() / 1000;
    const deadline = Number(plan.deadline);
    const isExpired = now > deadline;
    const daysRemaining = Math.max(0, Math.ceil((deadline - now) / (24 * 60 * 60)));

    return {
      ...plan,
      progressPercentage,
      formattedTarget: formatTokenAmount(plan.target, tokenInfo.decimals),
      formattedDeposited: formatTokenAmount(plan.deposited, tokenInfo.decimals),
      userContribution: safeUserContribution,
      formattedUserContribution: formatTokenAmount(safeUserContribution, tokenInfo.decimals),
      isExpired,
      daysRemaining,
      tokenSymbol: tokenInfo.symbol,
      tokenDecimals: tokenInfo.decimals,
    } as EnhancedSavingsPlan;
  }, [planData, safeUserContribution]);

  // Call parent callback when plan is loaded
  useEffect(() => {
    if (enhancedPlan && !isPlanLoading) {
      onPlanLoaded(enhancedPlan);
    }
  }, [enhancedPlan, isPlanLoading, onPlanLoaded]);

  return null; // This component doesn't render anything
}

// Provider component
export function SavingsProvider({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();
  const [enhancedPlans, setEnhancedPlans] = useState<EnhancedSavingsPlan[]>([]);

  // Get user's plan IDs
  const {
    data: planIds,
    isLoading: isLoadingPlanIds,
    error: planIdsError,
    refetch: refetchPlanIds,
  } = useUserPlans(address);

  // Handle when a plan is loaded
  const handlePlanLoaded = useCallback((plan: EnhancedSavingsPlan) => {
    setEnhancedPlans(prev => {
      const existing = prev.find(p => p.id === plan.id);
      if (existing) {
        // Update existing plan
        return prev.map(p => p.id === plan.id ? plan : p);
      } else {
        // Add new plan
        return [...prev, plan];
      }
    });
  }, []);

  // Reset when address changes
  useEffect(() => {
    if (address) {
      setEnhancedPlans([]);
    }
  }, [address]);

  // Calculate summary data
  const userSavingsData: UserSavingsData = useMemo(() => {
    // Use the first supported token's decimals as the common standard for aggregation
    const commonDecimals = SUPPORTED_TOKENS[0].decimals;
    
    // Convert all amounts to common decimal for aggregation
    const totalSavedInCommonDecimals = enhancedPlans.reduce((sum, plan) => {
      // Convert from plan's decimals to common decimals for consistent aggregation
      const scaleFactor = commonDecimals - plan.tokenDecimals;
      const scaledAmount = scaleFactor >= 0 
        ? plan.userContribution * (10n ** BigInt(scaleFactor))
        : plan.userContribution / (10n ** BigInt(-scaleFactor));
      return sum + scaledAmount;
    }, 0n);

    const totalTargetsInCommonDecimals = enhancedPlans.reduce((sum, plan) => {
      // Convert from plan's decimals to common decimals for consistent aggregation
      const scaleFactor = commonDecimals - plan.tokenDecimals;
      const scaledAmount = scaleFactor >= 0 
        ? plan.target * (10n ** BigInt(scaleFactor))
        : plan.target / (10n ** BigInt(-scaleFactor));
      return sum + scaledAmount;
    }, 0n);

    return {
      plans: enhancedPlans,
      totalPlans: enhancedPlans.length,
      activePlans: enhancedPlans.filter((p) => p.active && !p.isExpired).length,
      completedPlans: enhancedPlans.filter((p) => p.progressPercentage >= 100).length,
      totalSaved: formatTokenAmount(totalSavedInCommonDecimals, commonDecimals), // Using common decimals for aggregated display
      totalTargets: formatTokenAmount(totalTargetsInCommonDecimals, commonDecimals),
      isLoading: isLoadingPlanIds,
      error: planIdsError?.message || null,
      refetch: () => {
        refetchPlanIds();
        setEnhancedPlans([]);
      },
    };
  }, [enhancedPlans, isLoadingPlanIds, planIdsError, refetchPlanIds]);

  // Context methods
  const getPlanById = (planId: number) => {
    return enhancedPlans.find((plan) => Number(plan.id) === planId);
  };

  const refreshPlan = (planId: number) => {
    // Remove the plan from enhanced plans to force reload
    setEnhancedPlans(prev => prev.filter(p => Number(p.id) !== planId));
  };

  const refreshUserData = () => {
    refetchPlanIds();
    setEnhancedPlans([]);
  };

  const contextValue: SavingsContextType = {
    userSavings: userSavingsData,
    getPlanById,
    refreshPlan,
    refreshUserData,
  };

  // Render plan data fetchers for each plan ID
  const planDataFetchers = useMemo(() => {
    if (!address || !planIds || !Array.isArray(planIds)) {
      return null;
    }
    return (planIds as bigint[]).map((planId) => (
      <PlanDataFetcher
        key={planId.toString()}
        planId={planId}
        userAddress={address}
        onPlanLoaded={handlePlanLoaded}
      />
    ));
  }, [address, planIds, handlePlanLoaded]);

  return (
    <SavingsContext.Provider value={contextValue}>
      {planDataFetchers}
      {children}
    </SavingsContext.Provider>
  );
}

// Hook to use the savings context
export function useSavings() {
  const context = useContext(SavingsContext);
  if (context === undefined) {
    throw new Error("useSavings must be used within a SavingsProvider");
  }
  return context;
}

// Convenience hooks
export function useUserSavingsData() {
  const { userSavings } = useSavings();
  return userSavings;
}

export function usePlanData(planId: number) {
  const { getPlanById, refreshPlan } = useSavings();
  return {
    plan: getPlanById(planId),
    refresh: () => refreshPlan(planId),
  };
}
