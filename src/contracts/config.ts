import { Address } from "viem";
import { baseSepolia } from "wagmi/chains";
import BITSAVE_POOLS_ABI from "@/abis/BITSAVE_POOLS.json";
import ERC20_ABI from "@/abis/ERC20.json";

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  [baseSepolia.id]: {
    BITSAVE_POOLS: "0x0fe41e38d4244D97BE207Fd1dF513E648D1bF888" as Address,
    // Common tokens on Base Sepolia
    USDC: "0x9BeC29053DAD9B28F41ffEA16c7f20a16f79faA6" as Address, // Base Sepolia USDC
    // Add more tokens as they become available on Base Sepolia
  },
} as const;

// Contract ABIs
export const ABIS = {
  BITSAVE_POOLS: BITSAVE_POOLS_ABI,
  ERC20: ERC20_ABI,
} as const;

// Get contract address for current network
export function getContractAddress(chainId: number, contract: keyof typeof CONTRACT_ADDRESSES[84532]) {
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!addresses) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return addresses[contract];
}

// Common tokens configuration
export const SUPPORTED_TOKENS = [
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: CONTRACT_ADDRESSES[baseSepolia.id].USDC,
  },
  // Note: Add more tokens here as they become available on Base Sepolia
  // For demo purposes, you can add mainnet tokens if testing with other networks
] as const;

export type SupportedToken = typeof SUPPORTED_TOKENS[number];
export type ContractName = keyof typeof CONTRACT_ADDRESSES[84532];
