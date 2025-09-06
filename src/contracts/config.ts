import { Address } from "viem";
import { baseSepolia } from "wagmi/chains";
import BITSAVE_POOLS_ABI from "@/abis/BITSAVE_POOLS.json";
import ERC20_ABI from "@/abis/ERC20.json";

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  [baseSepolia.id]: {
    BITSAVE_POOLS: "0x6E31632D6A7Af8d30766AA9E216c49F5AAb846c2" as Address,
    // Common tokens on Base Sepolia
    USDC: "0xa3d69B7217B096709170f6fc50535e6aBc084f3A" as Address, // Base Sepolia USDC
    // Add more tokens as they become available on Base Sepolia
  },
} as const;

// Contract ABIs
export const ABIS = {
  BITSAVE_POOLS: BITSAVE_POOLS_ABI,
  ERC20: ERC20_ABI,
} as const;

// Get contract address for current network
export function getContractAddress(chainId: number, contract: keyof typeof CONTRACT_ADDRESSES[typeof baseSepolia.id]) {
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!addresses) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return addresses[contract];
}

// Get chain configuration for current network
export function getChainConfig(chainId: number) {
  switch (chainId) {
    case baseSepolia.id:
      return baseSepolia;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}

// Common tokens configuration
export const SUPPORTED_TOKENS = [
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 18,
    address: CONTRACT_ADDRESSES[baseSepolia.id].USDC,
  },
  // Note: Add more tokens here as they become available on Base Sepolia
  // For demo purposes, you can add mainnet tokens if testing with other networks
] as const;

export type SupportedToken = typeof SUPPORTED_TOKENS[number];
export type ContractName = keyof typeof CONTRACT_ADDRESSES[typeof baseSepolia.id];
