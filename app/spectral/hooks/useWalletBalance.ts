"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAccount, getAssociatedTokenAddress } from "@solana/spl-token";

// USDC mint addresses
const USDC_MINT_MAINNET = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const USDC_MINT_DEVNET = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
const USDC_DECIMALS = 6;

interface TokenAccount {
  mint: string;
  balance: number;
  decimals: number;
  uiAmount: number;
}

export function useWalletBalance() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [tokens, setTokens] = useState<TokenAccount[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(async (retryCount = 0) => {
    if (!publicKey || !connected) {
      setBalance(0);
      setTokens([]);
      return;
    }

    try {
      setLoading(true);
      
      console.log("Fetching USDC balance for:", publicKey.toBase58());
      console.log("Connection endpoint:", connection.rpcEndpoint);
      
      // Determine USDC mint based on network
      const isMainnet = connection.rpcEndpoint.includes("mainnet") || connection.rpcEndpoint.includes("helius-rpc.com");
      const usdcMint = isMainnet ? USDC_MINT_MAINNET : USDC_MINT_DEVNET;
      
      // Get USDC token account
      try {
        const usdcTokenAccount = await getAssociatedTokenAddress(usdcMint, publicKey);
        const tokenAccountInfo = await getAccount(connection, usdcTokenAccount);
        const usdcBalance = Number(tokenAccountInfo.amount);
        const usdcAmount = usdcBalance / Math.pow(10, USDC_DECIMALS); // Convert to USDC
        setBalance(usdcAmount);
        
        console.log("USDC Balance fetched:", usdcAmount, "USDC (", usdcBalance, "smallest units)");
      } catch (error) {
        // Token account doesn't exist or error fetching
        console.log("USDC token account not found or error:", error);
        setBalance(0);
      }

      // Fetch token accounts
      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: TOKEN_PROGRAM_ID },
          "confirmed"
        );

        const tokenData: TokenAccount[] = tokenAccounts.value
          .map((accountInfo) => {
            const parsedInfo = accountInfo.account.data.parsed.info;
            return {
              mint: parsedInfo.mint,
              balance: parsedInfo.tokenAmount.amount,
              decimals: parsedInfo.tokenAmount.decimals,
              uiAmount: parsedInfo.tokenAmount.uiAmount || 0,
            };
          })
          .filter((token) => token.uiAmount > 0); // Only show tokens with balance

        setTokens(tokenData);
        console.log("Token accounts fetched:", tokenData.length);
      } catch (tokenError) {
        console.error("Error fetching token accounts:", tokenError);
        setTokens([]);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      
      // Retry up to 2 times with exponential backoff
      if (retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s
        console.log(`Retrying balance fetch in ${delay}ms...`);
        setTimeout(() => fetchBalance(retryCount + 1), delay);
        return;
      }
      
      // Don't reset balance to 0 on error, keep previous value
      console.error("Failed to fetch balance after retries");
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection, connected]);

  useEffect(() => {
    if (!publicKey || !connected) {
      setBalance(0);
      setTokens([]);
      return;
    }

    // Small delay to ensure connection is ready after wallet connects
    const timeoutId = setTimeout(() => {
      fetchBalance();
    }, 500);

    // Refresh every 30 seconds as fallback
    const interval = setInterval(fetchBalance, 30000);
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [publicKey, connection, connected, fetchBalance]);

  return { balance, tokens, loading };
}

