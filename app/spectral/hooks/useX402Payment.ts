"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import {
  Transaction,
  PublicKey,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";

interface PaymentRequirements {
  payment: {
    recipientWallet: string;
    tokenAccount: string;
    mint: string;
    amount: number;
    amountUSDC: number;
    cluster: string;
    message: string;
    scheme: string;
  };
}

interface PaymentResult {
  success: boolean;
  signature?: string;
  explorerUrl?: string;
  paymentProof?: string; // X-Payment header for reuse
  error?: string;
}

export function useX402Payment() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  const makePayment = async (quoteUrl: string, paymentUrl: string = "/api/x402"): Promise<PaymentResult> => {
    if (!publicKey || !signTransaction) {
      return {
        success: false,
        error: "Wallet not connected",
      };
    }

    setIsProcessing(true);

    try {
      // Step 1: Request payment quote from the protected endpoint
      const quoteResponse = await fetch(quoteUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (quoteResponse.status !== 402) {
        return {
          success: false,
          error: `Unexpected response: ${quoteResponse.status}`,
        };
      }

      const quote: PaymentRequirements = await quoteResponse.json();

      if (!quote.payment) {
        return {
          success: false,
          error: "Invalid payment requirements",
        };
      }

      const recipientTokenAccount = new PublicKey(quote.payment.tokenAccount);
      const mint = new PublicKey(quote.payment.mint);
      const amount = quote.payment.amount; // Amount in smallest units (already calculated)

      // Step 2: Get or create the payer's associated token account
      console.log("Checking/creating associated token account...");
      const payerTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        publicKey, // payer
        mint,
        publicKey // owner
      );

      console.log(`Payer Token Account: ${payerTokenAccount.address.toBase58()}`);

      // Check if payer has enough USDC
      const balance = await connection.getTokenAccountBalance(
        payerTokenAccount.address
      );
      console.log(`Current Balance: ${balance.value.uiAmountString} USDC`);

      if (Number(balance.value.amount) < amount) {
        return {
          success: false,
          error: `Insufficient USDC balance. Have: ${balance.value.uiAmountString}, Need: ${quote.payment.amountUSDC}`,
        };
      }

      // Step 3: Check if recipient token account exists, create if not
      console.log("Checking recipient token account...");
      let recipientAccountExists = false;
      try {
        await getAccount(connection, recipientTokenAccount);
        recipientAccountExists = true;
        console.log("✓ Recipient token account exists");
      } catch (error) {
        console.log("⚠ Recipient token account doesn't exist, will create it");
      }

      // Step 4: Create USDC transfer transaction
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      const transaction = new Transaction({
        feePayer: publicKey,
        blockhash,
        lastValidBlockHeight,
      });

      // Add create account instruction if needed
      if (!recipientAccountExists) {
        const recipientWallet = new PublicKey(quote.payment.recipientWallet);
        const createAccountIx = createAssociatedTokenAccountInstruction(
          publicKey, // payer
          recipientTokenAccount, // associated token account address
          recipientWallet, // owner
          mint // mint
        );
        transaction.add(createAccountIx);
        console.log("+ Added create token account instruction");
      }

      // Add transfer instruction
      const transferIx = createTransferInstruction(
        payerTokenAccount.address, // source
        recipientTokenAccount, // destination
        publicKey, // owner
        amount // amount in smallest units
      );
      transaction.add(transferIx);

      // Step 3: Sign the transaction
      const signedTransaction = await signTransaction(transaction);

      // Step 4: Serialize the signed transaction
      const serializedTx = signedTransaction.serialize().toString("base64");

      // Step 5: Create payment proof
      const paymentProof = {
        x402Version: 1,
        scheme: quote.payment.scheme || "exact",
        network: quote.payment.cluster === "mainnet-beta" 
          ? "solana-mainnet" 
          : "solana-devnet",
        payload: {
          serializedTransaction: serializedTx,
        },
      };

      // Step 6: Base64 encode the payment proof
      const xPaymentHeader = btoa(JSON.stringify(paymentProof));

      // Step 7: Send payment proof to x402 payment endpoint for verification
      const paidResponse = await fetch(paymentUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Payment": xPaymentHeader,
        },
      });

      const result = await paidResponse.json();

      if (paidResponse.status !== 200) {
        return {
          success: false,
          error: result.error || "Payment verification failed",
        };
      }

      return {
        success: true,
        signature: result.paymentDetails?.signature,
        explorerUrl: result.paymentDetails?.explorerUrl,
        paymentProof: xPaymentHeader, // Return the payment proof for reuse
      };
    } catch (error) {
      console.error("x402 payment error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    makePayment,
    isProcessing,
  };
}

