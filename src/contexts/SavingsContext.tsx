import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
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
      return {
        symbol: "Unknown",
        decimals: 18,
      };
    }
    
    const token = SUPPORTED_TOKENS.find(
      (t) => t.address.toLowerCase() === tokenAddress.toLowerCase()
    );
    return {
      symbol: token?.symbol || "Unknown",
      decimals: token?.decimals || 18,
    };
  };

  // Enhance plan data
  const enhancedPlan = useMemo(() => {
    if (!planData) return null;

    const plan = planData as SavingsPlan;
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
  const handlePlanLoaded = (plan: EnhancedSavingsPlan) => {
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
  };

  // Reset when address changes
  useEffect(() => {
    if (address) {
      setEnhancedPlans([]);
    }
  }, [address]);

  // Calculate summary data
  const userSavingsData: UserSavingsData = useMemo(() => {
    const totalSavedBigInt = enhancedPlans.reduce((sum, plan) => {
      return sum + plan.userContribution;
    }, 0n);

    const totalTargetsBigInt = enhancedPlans.reduce((sum, plan) => {
      return sum + plan.target;
    }, 0n);

    return {
      plans: enhancedPlans,
      totalPlans: enhancedPlans.length,
      activePlans: enhancedPlans.filter((p) => p.active && !p.isExpired).length,
      completedPlans: enhancedPlans.filter((p) => p.progressPercentage >= 100).length,
      totalSaved: formatTokenAmount(totalSavedBigInt, 6), // Assuming USDC decimals
      totalTargets: formatTokenAmount(totalTargetsBigInt, 6),
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
  const planDataFetchers = React.useMemo(() => {
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
