import { Address } from "viem";
import { base, baseSepolia } from "wagmi/chains";
import BITSAVE_POOLS_ABI from "@/abis/BITSAVE_POOLS.json";
import ERC20_ABI from "@/abis/ERC20.json";

// Environment-based network configuration
export const IS_TESTNET = import.meta.env.VITE_USE_TESTNET === "true";

console.log("IS_TESTNET:", IS_TESTNET);

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  [base.id]: {
    BITSAVE_POOLS: "0xb9F201160C68539a8a860188B30d5ddd0C098885" as Address, // TODO: Replace with actual mainnet address
    // Common tokens on Base Mainnet
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address, // Base Mainnet USDC
  },
  [baseSepolia.id]: {
    BITSAVE_POOLS: "0x3caAB09d265f701171247Fa697a1fC5fAd8F28Ba" as Address,
    // Common tokens on Base Sepolia
    USDC: "0xa3d69B7217B096709170f6fc50535e6aBc084f3A" as Address, // Base Sepolia USDC
    // Add more testnet tokens as needed
  },
} as const;

// Get current network configuration
export const CURRENT_NETWORK = IS_TESTNET ? baseSepolia : base;
export const CURRENT_CHAIN_ID = CURRENT_NETWORK.id;

// Contract ABIs
export const ABIS = {
  BITSAVE_POOLS: BITSAVE_POOLS_ABI,
  ERC20: ERC20_ABI,
} as const;

// Get contract address for current network
export function getContractAddress(
  chainId: number,
  contract:
    | keyof (typeof CONTRACT_ADDRESSES)[typeof base.id]
    | keyof (typeof CONTRACT_ADDRESSES)[typeof baseSepolia.id]
) {
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!addresses) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return addresses[contract as keyof typeof addresses];
}

// Get chain configuration for current network
export function getChainConfig(chainId: number) {
  switch (chainId) {
    case base.id:
      return base;
    case baseSepolia.id:
      return baseSepolia;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}

// Token configurations for different networks
const MAINNET_TOKENS = [
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: CONTRACT_ADDRESSES[base.id].USDC,
  },
] as const;

const TESTNET_TOKENS = [
  {
    symbol: "USDC",
    name: "USD Coin (Testnet)",
    decimals: 18,
    address: CONTRACT_ADDRESSES[baseSepolia.id].USDC,
  },
  // Add more testnet tokens as they become available
] as const;

// Export supported tokens based on current network
export const SUPPORTED_TOKENS = IS_TESTNET ? TESTNET_TOKENS : MAINNET_TOKENS;

export type SupportedToken = (typeof SUPPORTED_TOKENS)[number];
export type ContractName =
  | keyof (typeof CONTRACT_ADDRESSES)[typeof base.id]
  | keyof (typeof CONTRACT_ADDRESSES)[typeof baseSepolia.id];

// Helper function to get token decimals
export function getTokenDecimals(tokenAddress: Address): number {
  const token = SUPPORTED_TOKENS.find(
    (t) => t.address.toLowerCase() === tokenAddress.toLowerCase()
  );
  return token?.decimals ?? 18; // Default to 18 decimals if not found
}

// Helper function to get token info
export function getTokenInfo(tokenAddress: Address) {
  return SUPPORTED_TOKENS.find((t) => t.address.toLowerCase() === tokenAddress.toLowerCase());
}
