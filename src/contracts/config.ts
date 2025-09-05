import { Address } from "viem";
import { baseSepolia } from "wagmi/chains";
import BITSAVE_POOLS_ABI from "@/abis/BITSAVE_POOLS.json";
import ERC20_ABI from "@/abis/ERC20.json";

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  [baseSepolia.id]: {
    BITSAVE_POOLS: "0xbc9987159307d00844944221Ad2924B736Ab785e" as Address,
    // Common tokens on Base Sepolia
    USDC: "0xB9b65AD5B47C185D729161b1D25083bD1382D2BC" as Address, // Base Sepolia USDC
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
