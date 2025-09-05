import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [miniAppConnector()],
  transports: {
    [baseSepolia.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
