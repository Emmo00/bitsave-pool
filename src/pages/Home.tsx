import { Dashboard } from "@/components/dashboard";
import { ConnectWallet } from "@/components/connect-wallet";
import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export default function Home() {
  useEffect(() => {
    // Initialize the Farcaster Mini App SDK
    sdk.actions.ready();
  }, []);

  return (
    <div className="relative">
      <ConnectWallet />
      <Dashboard />
    </div>
  );
}
