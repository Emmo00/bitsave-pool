import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { Address, formatUnits } from 'viem';
import { ABIS, getContractAddress, SUPPORTED_TOKENS } from '@/contracts/config';
import { baseSepolia } from 'wagmi/chains';
import { resolveENSOrAddress } from '@/utils/ens';
import { useState, useEffect } from 'react';

export interface PlanData {
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
}

export interface ParticipantWithContribution {
  address: Address;
  ensName?: string;
  avatar?: string;
  contribution: bigint;
  formattedContribution: string;
}

export function usePlanData(planId: string) {
  const { address } = useAccount();
  const [participantsWithENS, setParticipantsWithENS] = useState<ParticipantWithContribution[]>([]);
  const [loadingENSResolution, setLoadingENSResolution] = useState(false);

  const contractAddress = getContractAddress(baseSepolia.id, 'BITSAVE_POOLS');

  // Read the plan data
  const { 
    data: planData, 
    isLoading: loadingPlan, 
    error: planError,
    refetch: refetchPlan
  } = useReadContract({
    address: contractAddress,
    abi: ABIS.BITSAVE_POOLS,
    functionName: 'plans',
    args: [BigInt(planId)],
  });

  // Read participants list
  const { 
    data: participants, 
    isLoading: loadingParticipantsList,
    refetch: refetchParticipants
  } = useReadContract({
    address: contractAddress,
    abi: ABIS.BITSAVE_POOLS,
    functionName: 'getParticipants',
    args: [BigInt(planId)],
  });

  // Type for contributions result
  const participantsList = participants as Address[] | undefined;

  // Get contributions for all participants
  const { 
    data: contributions,
    isLoading: loadingContributions,
    refetch: refetchContributions
  } = useReadContracts({
    contracts: participantsList?.map((participant: Address) => ({
      address: contractAddress,
      abi: ABIS.BITSAVE_POOLS as any,
      functionName: 'getContribution',
      args: [BigInt(planId), participant],
    })) || [],
  });

  const plan: PlanData | null = planData ? {
    id: Number((planData as any)[0]),
    owner: (planData as any)[1] as Address,
    beneficiary: (planData as any)[2] as Address,
    token: (planData as any)[3] as Address,
    target: (planData as any)[4] as bigint,
    deposited: (planData as any)[5] as bigint,
    deadline: (planData as any)[6] as bigint,
    active: (planData as any)[7] as boolean,
    withdrawn: (planData as any)[8] as boolean,
    cancelled: (planData as any)[9] as boolean,
    participants: participantsList || [],
  } : null;

  // Find token info
  const tokenInfo = SUPPORTED_TOKENS.find(
    token => token.address.toLowerCase() === plan?.token.toLowerCase()
  );

  // Resolve ENS names and avatars for participants
  useEffect(() => {
    async function resolveParticipants() {
      if (!participantsList || !contributions || !plan) return;

      setLoadingENSResolution(true);
      try {
        const resolved = await Promise.all(
          participantsList.map(async (participant: Address, index: number) => {
            const contributionData = contributions[index];
            const contribution = contributionData?.status === 'success' 
              ? contributionData.result as bigint 
              : 0n;

            try {
              const { address, ensName, avatar } = await resolveENSOrAddress(participant);
              return {
                address: address as Address,
                ensName,
                avatar,
                contribution,
                formattedContribution: tokenInfo 
                  ? formatUnits(contribution, tokenInfo.decimals)
                  : '0',
              };
            } catch (error) {
              console.warn(`Failed to resolve ENS for ${participant}:`, error);
              return {
                address: participant as Address,
                contribution,
                formattedContribution: tokenInfo 
                  ? formatUnits(contribution, tokenInfo.decimals)
                  : '0',
              };
            }
          })
        );

        setParticipantsWithENS(resolved);
      } catch (error) {
        console.error('Error resolving participant ENS data:', error);
      } finally {
        setLoadingENSResolution(false);
      }
    }

    resolveParticipants();
  }, [participantsList, contributions, plan, tokenInfo]);

  const refetch = () => {
    refetchPlan();
    refetchParticipants();
    refetchContributions();
  };

  return {
    plan,
    participants: participantsWithENS,
    tokenInfo,
    isOwner: address && plan ? address.toLowerCase() === plan.owner.toLowerCase() : false,
    isParticipant: address && plan ? plan.participants.some(p => p.toLowerCase() === address.toLowerCase()) : false,
    loading: loadingPlan || loadingParticipantsList || loadingContributions || loadingENSResolution,
    error: planError,
    refetch,
  };
}
