
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { Address, formatUnits, Abi } from 'viem';
import { ABIS, getContractAddress, SUPPORTED_TOKENS } from '@/contracts/config';
import { baseSepolia } from 'wagmi/chains';
import { useMemo } from 'react';

export interface UserPlanSummary {
  id: number;
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
}

export function useUserPlans() {
  const { address } = useAccount();
  const contractAddress = getContractAddress(baseSepolia.id, 'BITSAVE_POOLS');

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

  const plans: UserPlanSummary[] = useMemo(() => {
    if (!plansData || !planIds || !myContributions) return [];
    return (plansData as any[]).map((planData, i) => {
      if (!planData?.result) return null;
      const id = Number((planData.result as any)[0]);
      const owner = (planData.result as any)[1] as Address;
      const beneficiary = (planData.result as any)[2] as Address;
      const token = (planData.result as any)[3] as Address;
      const target = (planData.result as any)[4] as bigint;
      const deposited = (planData.result as any)[5] as bigint;
      const deadline = (planData.result as any)[6] as bigint;
      const active = (planData.result as any)[7] as boolean;
      const withdrawn = (planData.result as any)[8] as boolean;
      const cancelled = (planData.result as any)[9] as boolean;
      // participants not available here, would need extra call if needed
      const myContribution = myContributions[i]?.result as bigint || 0n;
      const tokenInfo = SUPPORTED_TOKENS.find(t => t.address.toLowerCase() === token.toLowerCase());
      return {
        id,
        owner,
        beneficiary,
        token,
        target,
        deposited,
        deadline,
        active,
        withdrawn,
        cancelled,
        participants: [],
        myContribution,
        formattedContribution: tokenInfo ? formatUnits(myContribution, tokenInfo.decimals) : '0',
      };
    }).filter(Boolean) as UserPlanSummary[];
  }, [plansData, planIds, myContributions]);

  return {
    plans,
    loading: loadingPlanIds || loadingPlans || loadingContributions,
    address,
  };
}
