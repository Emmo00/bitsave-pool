import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";

import App from "./App.tsx";
import { config } from "./wagmi.ts";
import { SavingsProvider } from "./contexts/SavingsContext.tsx";

import "./index.css";

const queryClient = new QueryClient();
console.log("Farcaster Bitsave Pool Mini App");

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SavingsProvider>
          <App />
        </SavingsProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
