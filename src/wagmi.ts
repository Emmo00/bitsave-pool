import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { createConfig, webSocket } from "wagmi";
import { baseSepolia } from "wagmi/chains";

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [miniAppConnector()],
  transports: {
    [baseSepolia.id]: webSocket("wss://base-sepolia.drpc.org"),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
