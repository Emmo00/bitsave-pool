import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";

export const config = createConfig({
  chains: [base],
  connectors: [miniAppConnector()],
  transports: {
    [base.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
