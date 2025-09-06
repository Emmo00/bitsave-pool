
import { useAccount, useReadContract, useReadContracts, useChainId } from 'wagmi';
import { Address, formatUnits, Abi } from 'viem';
import { ABIS, getContractAddress, SUPPORTED_TOKENS } from '@/contracts/config';
import { useMemo } from 'react';

export interface UserPlanSummary {
  id: number;
  name: string;
  owner: Address;
  beneficiary: Address;
  token: Address;
  target: bigint;
  deposited: bigint;
  deadline: bigint;
  active: boolean;
  withdrawn: boolean;
  cancelled: boolean;
  participants: Address[];
  myContribution: bigint;
  formattedContribution: string;
  formattedTarget: string;
  formattedDeposited: string;
}

export function useUserPlans() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId, 'BITSAVE_POOLS');

  // Get all plan IDs for this user
  const { data: planIds, isLoading: loadingPlanIds } = useReadContract({
    address: contractAddress,
    abi: ABIS.BITSAVE_POOLS as Abi,
    functionName: 'getPlansByUser',
    args: address ? [address] : undefined,
  });

  // Get all plan data for these IDs
  const { data: plansData, isLoading: loadingPlans } = useReadContracts({
    contracts: (planIds as bigint[] | undefined)?.map((id) => ({
      address: contractAddress,
      abi: ABIS.BITSAVE_POOLS as Abi,
      functionName: 'plans',
      args: [id],
    })) || [],
  });

  // Get all my contributions for these plans
  const { data: myContributions, isLoading: loadingContributions } = useReadContracts({
    contracts: (planIds as bigint[] | undefined)?.map((id) => ({
      address: contractAddress,
      abi: ABIS.BITSAVE_POOLS as Abi,
      functionName: 'getContribution',
      args: [id, address],
    })) || [],
  });

  // Get participants for each plan
  const { data: planParticipants, isLoading: loadingParticipants } = useReadContracts({
    contracts: (planIds as bigint[] | undefined)?.map((id) => ({
      address: contractAddress,
      abi: ABIS.BITSAVE_POOLS as Abi,
      functionName: 'getParticipants',
      args: [id],
    })) || [],
  });

  const plans: UserPlanSummary[] = useMemo(() => {
    if (!plansData || !planIds || !myContributions || !planParticipants) return [];
    
    // Create a map to deduplicate plans by ID
    const planMap = new Map<number, UserPlanSummary>();
    
    (plansData as any[]).forEach((planData, i) => {
      if (!planData?.result) return;
      const id = Number((planData.result as any)[0]);
      
      // Skip if we already have this plan
      if (planMap.has(id)) return;
      
      const name = (planData.result as any)[1] as string;
      const owner = (planData.result as any)[2] as Address;
      const beneficiary = (planData.result as any)[3] as Address;
      const token = (planData.result as any)[4] as Address;
      const target = (planData.result as any)[5] as bigint;
      const deposited = (planData.result as any)[6] as bigint;
      const deadline = (planData.result as any)[7] as bigint;
      const active = (planData.result as any)[8] as boolean;
      const withdrawn = (planData.result as any)[9] as boolean;
      const cancelled = (planData.result as any)[10] as boolean;
      
      // Get participants from the participants array
      const participants = (planParticipants[i]?.result as Address[]) || [];
      const myContribution = myContributions[i]?.result as bigint || 0n;
      const tokenInfo = SUPPORTED_TOKENS.find(t => t.address.toLowerCase() === token.toLowerCase());
      
      // Debug logging
      console.log('Hook formatting debug:', {
        id,
        token,
        target,
        deposited,
        tokenInfo,
        supportedTokens: SUPPORTED_TOKENS,
        targetFormatted: tokenInfo ? formatUnits(target, tokenInfo.decimals) : 'NO_TOKEN_INFO',
        depositedFormatted: tokenInfo ? formatUnits(deposited, tokenInfo.decimals) : 'NO_TOKEN_INFO',
        // Try with hardcoded 6 decimals for USDC
        targetFormattedHardcoded: formatUnits(target, 6),
        depositedFormattedHardcoded: formatUnits(deposited, 6),
        participants: participants.length,
        participantAddresses: participants,
      });
      
      planMap.set(id, {
        id,
        name,
        owner,
        beneficiary,
        token,
        target,
        deposited,
        deadline,
        active,
        withdrawn,
        cancelled,
        participants,
        myContribution,
        formattedContribution: tokenInfo ? formatUnits(myContribution, tokenInfo.decimals) : formatUnits(myContribution, 6),
        formattedTarget: tokenInfo ? formatUnits(target, tokenInfo.decimals) : formatUnits(target, 6),
        formattedDeposited: tokenInfo ? formatUnits(deposited, tokenInfo.decimals) : formatUnits(deposited, 6),
      });
    });
    
    return Array.from(planMap.values());
  }, [plansData, planIds, myContributions, planParticipants]);

  return {
    plans,
    loading: loadingPlanIds || loadingPlans || loadingContributions || loadingParticipants,
    address,
  };
}
