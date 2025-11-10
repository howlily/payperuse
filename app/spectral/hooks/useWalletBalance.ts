"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

interface TokenAccount {
  mint: string;
  balance: number;
  decimals: number;
  uiAmount: number;
}

export function useWalletBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [tokens, setTokens] = useState<TokenAccount[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setBalance(0);
      setTokens([]);
      return;
    }

    const fetchBalance = async () => {
      try {
        setLoading(true);
        
        // Fetch SOL balance
        const solBalance = await connection.getBalance(publicKey);
        setBalance(solBalance / 1e9); // Convert lamports to SOL

        // Fetch token accounts
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: TOKEN_PROGRAM_ID }
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
      } catch (error) {
        console.error("Error fetching wallet data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();

    // Refresh every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [publicKey, connection]);

  return { balance, tokens, loading };
}

