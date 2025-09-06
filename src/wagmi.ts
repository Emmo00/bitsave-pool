import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { createConfig, webSocket, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { IS_TESTNET } from "@/contracts/config";

// Environment-based network configuration
export const config = IS_TESTNET
  ? createConfig({
      chains: [baseSepolia],
      connectors: [miniAppConnector()],
      transports: {
        [baseSepolia.id]: webSocket("wss://base-sepolia.drpc.org"),
      },
    })
  : createConfig({
      chains: [base],
      connectors: [miniAppConnector()],
      transports: {
        [base.id]: http("https://mainnet.base.org"),
      },
    });

// Export current network info for convenience
export { IS_TESTNET };
export const CURRENT_NETWORK = IS_TESTNET ? baseSepolia : base;

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
