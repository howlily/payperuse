"use client";

import { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletContextProviderProps {
  children: ReactNode;
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({
  children,
}) => {
  // Use Helius RPC if API key is provided, otherwise fall back to default
  const heliusApiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
  const customRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  const cluster = process.env.NEXT_PUBLIC_SOLANA_CLUSTER || "mainnet-beta";
  
  const endpoint = useMemo(() => {
    // Priority 1: Custom RPC URL
    if (customRpc) {
      console.log("Using custom RPC endpoint:", customRpc);
      return customRpc;
    }
    
    // Priority 2: Helius RPC (if API key is provided)
    if (heliusApiKey) {
      const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
      console.log("Using Helius RPC endpoint");
      return heliusUrl;
    }
    
    // Priority 3: Default cluster API URL
    const endpointUrl = clusterApiUrl(cluster as "mainnet-beta" | "devnet" | "testnet");
    console.log("Using Solana cluster:", cluster, "Endpoint:", endpointUrl);
    return endpointUrl;
  }, [heliusApiKey, customRpc, cluster]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

