import { useAccount, useConnect } from "wagmi";

export function ConnectWallet() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();

  if (isConnected) {
    return (
      <div className="absolute top-4 right-4 z-50 px-5 py-2 rounded-xl font-bold text-white bg-green-600 shadow-lg brutalist-button glassmorphic border-2 border-black/80">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connected"}
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="absolute top-4 right-4 z-50 px-5 py-2 rounded-xl font-bold text-primary-foreground bg-primary shadow-lg brutalist-button glassmorphic hover:scale-105 transition-transform border-2 border-black/80"
      onClick={() => connect({ connector: connectors[0] })}
    >
      Connect Wallet
    </button>
  );
}
