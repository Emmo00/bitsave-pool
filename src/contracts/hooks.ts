import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { Address, parseUnits, formatUnits } from "viem";
import { ABIS, getContractAddress } from "./config";

// Plan interface based on the smart contract
export interface SavingsPlan {
  id: bigint;
  owner: Address;
  beneficiary: Address;
  token: Address;
  target: bigint;
  deposited: bigint;
  deadline: bigint;
  active: boolean;
  withdrawn: boolean;
  cancelled: boolean;
}

// Hook to read a specific plan
export function usePlan(planId: number) {
  const chainId = useChainId();
  
  return useReadContract({
    address: getContractAddress(chainId, "BITSAVE_POOLS"),
    abi: ABIS.BITSAVE_POOLS,
    functionName: "plans",
    args: [BigInt(planId)],
    query: {
      enabled: planId >= 0, // Plans can start from 0
    },
  });
}

// Hook to get the next plan ID (useful for checking if plans exist)
export function useNextPlanId() {
  const chainId = useChainId();
  
  return useReadContract({
    address: getContractAddress(chainId, "BITSAVE_POOLS"),
    abi: ABIS.BITSAVE_POOLS,
    functionName: "nextPlanId",
  });
}

// Hook to get user's plans
export function useUserPlans(userAddress?: Address) {
  const chainId = useChainId();
  
  return useReadContract({
    address: getContractAddress(chainId, "BITSAVE_POOLS"),
    abi: ABIS.BITSAVE_POOLS,
    functionName: "getPlansByUser",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });
}

// Hook to get user's contribution to a specific plan
export function useUserContribution(planId: number, userAddress?: Address) {
  const chainId = useChainId();
  
  return useReadContract({
    address: getContractAddress(chainId, "BITSAVE_POOLS"),
    abi: ABIS.BITSAVE_POOLS,
    functionName: "getContribution",
    args: [BigInt(planId), userAddress],
    query: {
      enabled: planId >= 0 && !!userAddress, // Updated to allow plan ID 0
    },
  });
}

// Hook to get plan participants
export function usePlanParticipants(planId: number) {
  const chainId = useChainId();
  
  return useReadContract({
    address: getContractAddress(chainId, "BITSAVE_POOLS"),
    abi: ABIS.BITSAVE_POOLS,
    functionName: "getParticipants",
    args: [BigInt(planId)],
    query: {
      enabled: planId >= 0, // Updated to allow plan ID 0
    },
  });
}

// Hook for ERC20 token balance
export function useTokenBalance(tokenAddress: Address, userAddress?: Address) {
  return useReadContract({
    address: tokenAddress,
    abi: ABIS.ERC20,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });
}

// Hook for ERC20 token allowance
export function useTokenAllowance(tokenAddress: Address, userAddress?: Address) {
  const chainId = useChainId();
  const spenderAddress = getContractAddress(chainId, "BITSAVE_POOLS");
  
  return useReadContract({
    address: tokenAddress,
    abi: ABIS.ERC20,
    functionName: "allowance",
    args: userAddress ? [userAddress, spenderAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });
}

// Hook for writing contracts (transactions)
export function useBitSaveContracts() {
  const chainId = useChainId();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createPlan = (
    name: string,
    tokenAddress: Address,
    target: string,
    beneficiary: Address,
    deadline: bigint,
    initialParticipants: Address[] = []
  ) => {
    writeContract({
      address: getContractAddress(chainId, "BITSAVE_POOLS"),
      abi: ABIS.BITSAVE_POOLS,
      functionName: "createPlan",
      args: [
        name,
        tokenAddress,
        parseUnits(target, 6), // Assuming USDC with 6 decimals
        beneficiary,
        deadline,
        initialParticipants,
      ],
    });
  };

  const deposit = (planId: number, amount: string, decimals: number = 6) => {
    writeContract({
      address: getContractAddress(chainId, "BITSAVE_POOLS"),
      abi: ABIS.BITSAVE_POOLS,
      functionName: "deposit",
      args: [BigInt(planId), parseUnits(amount, decimals)],
    });
  };

  const approveToken = (tokenAddress: Address, amount: string, decimals: number = 6) => {
    writeContract({
      address: tokenAddress,
      abi: ABIS.ERC20,
      functionName: "approve",
      args: [getContractAddress(chainId, "BITSAVE_POOLS"), parseUnits(amount, decimals)],
    });
  };

  const addParticipant = (planId: number, participant: Address) => {
    writeContract({
      address: getContractAddress(chainId, "BITSAVE_POOLS"),
      abi: ABIS.BITSAVE_POOLS,
      functionName: "addParticipant",
      args: [BigInt(planId), participant],
    });
  };

  const withdrawToBeneficiary = (planId: number) => {
    writeContract({
      address: getContractAddress(chainId, "BITSAVE_POOLS"),
      abi: ABIS.BITSAVE_POOLS,
      functionName: "withdrawToBeneficiary",
      args: [BigInt(planId)],
    });
  };

  const claimRefund = (planId: number) => {
    writeContract({
      address: getContractAddress(chainId, "BITSAVE_POOLS"),
      abi: ABIS.BITSAVE_POOLS,
      functionName: "claimRefund",
      args: [BigInt(planId)],
    });
  };

  const cancelPlan = (planId: number) => {
    writeContract({
      address: getContractAddress(chainId, "BITSAVE_POOLS"),
      abi: ABIS.BITSAVE_POOLS,
      functionName: "cancelPlan",
      args: [BigInt(planId)],
    });
  };

  return {
    createPlan,
    deposit,
    approveToken,
    addParticipant,
    withdrawToBeneficiary,
    claimRefund,
    cancelPlan,
    hash,
    error,
    isPending,
    isConfirming,
    isSuccess,
  };
}

// Utility functions
export function formatTokenAmount(amount: bigint, decimals: number = 6): string {
  return formatUnits(amount, decimals);
}

export function parseTokenAmount(amount: string, decimals: number = 6): bigint {
  return parseUnits(amount, decimals);
}
