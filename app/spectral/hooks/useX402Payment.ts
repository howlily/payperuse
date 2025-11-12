"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import {
  Transaction,
  PublicKey,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";

// USDC mint address on Solana mainnet
const USDC_MINT_MAINNET = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const USDC_MINT_DEVNET = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"); // USDC devnet mint
const USDC_DECIMALS = 6; // USDC has 6 decimals

interface PaymentRequirements {
  payment: {
    recipientWallet: string;
    tokenAccount?: string;
    mint?: string;
    amount: number;
    amountUSDC: number;
    cluster: string;
    message: string;
    scheme: string;
  };
}

interface PaymentQuote {
  payment: {
    recipientWallet: string;
    tokenAccount?: string;
    mint?: string;
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
  pending?: boolean; // Indicates payment was submitted but verification is pending
}

export function useX402Payment() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  const makePayment = async (
    quote: PaymentQuote | string, 
    paymentUrl: string = "/api/x402"
  ): Promise<PaymentResult> => {
    console.log("[x402] makePayment called");
    console.log("[x402] publicKey:", publicKey?.toBase58());
    console.log("[x402] signTransaction available:", !!signTransaction);
    
    if (!publicKey) {
      console.error("[x402] No public key - wallet not connected");
      return {
        success: false,
        error: "Wallet not connected - no public key",
      };
    }

    if (!signTransaction) {
      console.error("[x402] signTransaction function not available");
      return {
        success: false,
        error: "Wallet does not support signing transactions",
      };
    }

    setIsProcessing(true);

    try {
      // Step 1: Get payment quote (either passed directly or fetch from URL)
      let paymentQuote: PaymentQuote;
      
      if (typeof quote === "string") {
        // Legacy: fetch quote from URL (shouldn't happen in normal flow)
        console.log("[x402] Step 1: Requesting payment quote from URL:", quote);
        const quoteResponse = await fetch(quote, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("[x402] Quote response status:", quoteResponse.status);

        if (quoteResponse.status !== 402) {
          const responseText = await quoteResponse.text();
          console.error("[x402] Unexpected response:", quoteResponse.status, responseText);
          return {
            success: false,
            error: `Unexpected response: ${quoteResponse.status}`,
          };
        }

        paymentQuote = await quoteResponse.json();
      } else {
        // Normal flow: quote passed directly from 402 response
        paymentQuote = quote;
        console.log("[x402] Step 1: Using provided payment quote");
      }
      
      console.log("[x402] Payment quote:", paymentQuote);

      if (!paymentQuote.payment) {
        console.error("[x402] Invalid payment requirements in quote");
        return {
          success: false,
          error: "Invalid payment requirements",
        };
      }

      const recipientWallet = new PublicKey(paymentQuote.payment.recipientWallet);
      const amountUSDC = paymentQuote.payment.amount; // Amount in USDC smallest units (6 decimals)
      const amountUSDCFormatted = amountUSDC / Math.pow(10, USDC_DECIMALS); // Amount in USDC
      
      // Determine USDC mint based on cluster
      const isMainnet = paymentQuote.payment.cluster === "mainnet-beta";
      const usdcMint = isMainnet ? USDC_MINT_MAINNET : USDC_MINT_DEVNET;
      
      // Validate the amount is reasonable
      if (amountUSDC <= 0) {
        console.error("[x402] Invalid transfer amount:", amountUSDC);
        return {
          success: false,
          error: `Invalid transfer amount: ${amountUSDC} USDC smallest units`,
        };
      }
      
      console.log("[x402] Payment details:", {
        recipient: recipientWallet.toBase58(),
        amountUSDC,
        amountUSDCFormatted: amountUSDCFormatted.toFixed(6),
        usdcMint: usdcMint.toBase58(),
        cluster: paymentQuote.payment.cluster,
      });

      // Step 2: Check if payer has enough USDC
      console.log("[x402] Step 2: Checking USDC balance...");
      
      // Get payer's USDC token account address
      const payerTokenAccountAddress = await getAssociatedTokenAddress(usdcMint, publicKey);
      console.log(`[x402] Payer USDC Token Account: ${payerTokenAccountAddress.toBase58()}`);
      
      // Check USDC balance (account might not exist yet)
      let usdcBalance = 0;
      let usdcBalanceFormatted = 0;
      try {
        const tokenAccountInfo = await getAccount(connection, payerTokenAccountAddress);
        usdcBalance = Number(tokenAccountInfo.amount);
        usdcBalanceFormatted = usdcBalance / Math.pow(10, USDC_DECIMALS);
        console.log(`[x402] Current USDC Balance: ${usdcBalanceFormatted.toFixed(6)} USDC (${usdcBalance} smallest units)`);
      } catch (error) {
        // Token account doesn't exist - balance is 0
        console.log("[x402] USDC token account doesn't exist yet - balance is 0");
        usdcBalance = 0;
        usdcBalanceFormatted = 0;
      }
      
      if (usdcBalance < amountUSDC) {
        const shortfall = amountUSDC - usdcBalance;
        const shortfallFormatted = shortfall / Math.pow(10, USDC_DECIMALS);
        console.error("[x402] Insufficient USDC balance");
        return {
          success: false,
          error: `Insufficient USDC balance. Need ${amountUSDCFormatted.toFixed(6)} USDC, but only have ${usdcBalanceFormatted.toFixed(6)} USDC. Shortfall: ${shortfallFormatted.toFixed(6)} USDC`,
        };
      }
      
      // Check if recipient token account exists
      const recipientTokenAccount = paymentQuote.payment.tokenAccount
        ? new PublicKey(paymentQuote.payment.tokenAccount)
        : await getAssociatedTokenAddress(usdcMint, recipientWallet);
      
      let recipientAccountExists = false;
      try {
        await getAccount(connection, recipientTokenAccount);
        recipientAccountExists = true;
        console.log("[x402] Recipient USDC token account exists:", recipientTokenAccount.toBase58());
      } catch (error) {
        console.log("[x402] Recipient USDC token account doesn't exist, will create it");
      }

      // Step 3: Create USDC transfer transaction (x402 standard flow)
      console.log("[x402] Step 3: Creating USDC transfer transaction...");
      console.log("[x402] Using RPC endpoint:", connection.rpcEndpoint);
      
      // Get fresh blockhash - use "confirmed" commitment to match Phantom's simulation
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
      console.log("[x402] Blockhash:", blockhash, "Last valid block height:", lastValidBlockHeight);

      const transaction = new Transaction({
        feePayer: publicKey,
        blockhash,
        lastValidBlockHeight,
      });

      // Add create token account instruction if recipient account doesn't exist
      if (!recipientAccountExists) {
        const createAccountIx = createAssociatedTokenAccountInstruction(
          publicKey, // payer
          recipientTokenAccount, // associated token account address
          recipientWallet, // owner
          usdcMint // mint
        );
        transaction.add(createAccountIx);
        console.log("[x402] Added create token account instruction");
      }

      // Add USDC transfer instruction
      console.log("[x402] Creating USDC transfer instruction:", {
        from: payerTokenAccountAddress.toBase58(),
        to: recipientTokenAccount.toBase58(),
        amountUSDC: amountUSDCFormatted.toFixed(6),
        amountSmallestUnits: amountUSDC,
      });
      
      const transferIx = createTransferInstruction(
        payerTokenAccountAddress, // source
        recipientTokenAccount, // destination
        publicKey, // owner
        amountUSDC // amount in smallest units
      );
      transaction.add(transferIx);
      
      // Verify the instruction was added correctly
      console.log("[x402] Transfer instruction added. Transaction summary:", {
        feePayer: transaction.feePayer?.toBase58(),
        instructions: transaction.instructions.length,
        firstInstructionProgramId: transaction.instructions[0]?.programId.toBase58(),
        firstInstructionKeys: transaction.instructions[0]?.keys.length,
      });

      console.log("[x402] Transaction created:", {
        instructions: transaction.instructions.length,
        feePayer: transaction.feePayer?.toBase58(),
        recentBlockhash: transaction.recentBlockhash,
        lastValidBlockHeight: transaction.lastValidBlockHeight,
      });

      // Validate transaction before signing
      if (!transaction.feePayer) {
        throw new Error("Transaction missing fee payer");
      }
      if (!transaction.recentBlockhash) {
        throw new Error("Transaction missing recent blockhash");
      }
      if (transaction.instructions.length === 0) {
        throw new Error("Transaction has no instructions");
      }

      // Step 4: Final USDC balance check right before signing
      console.log(`[x402] RPC Endpoint being used: ${connection.rpcEndpoint}`);
      let finalUSDCBalance = 0;
      let finalUSDCBalanceFormatted = 0;
      try {
        const finalTokenAccountInfo = await getAccount(connection, payerTokenAccountAddress);
        finalUSDCBalance = Number(finalTokenAccountInfo.amount);
        finalUSDCBalanceFormatted = finalUSDCBalance / Math.pow(10, USDC_DECIMALS);
      } catch (error) {
        // Account doesn't exist - balance is 0
        finalUSDCBalance = 0;
        finalUSDCBalanceFormatted = 0;
      }
      
      console.log(`[x402] Final pre-signature USDC balance check:`, {
        rpcEndpoint: connection.rpcEndpoint,
        currentBalance: `${finalUSDCBalanceFormatted.toFixed(6)} USDC`,
        transferAmount: `${amountUSDCFormatted.toFixed(6)} USDC`,
        remainingAfterTransfer: `${((finalUSDCBalance - amountUSDC) / Math.pow(10, USDC_DECIMALS)).toFixed(6)} USDC`,
        note: "Phantom may use a different RPC endpoint for simulation, which could show different balance",
      });
      
      if (finalUSDCBalance < amountUSDC) {
        console.error("[x402] Final check failed - insufficient USDC balance");
        return {
          success: false,
          error: `Insufficient USDC. Need ${amountUSDCFormatted.toFixed(6)} USDC, but only have ${finalUSDCBalanceFormatted.toFixed(6)} USDC.`,
        };
      }

      // Step 5: Sign the transaction (this will show the wallet popup)
      // According to x402 standard: client signs but doesn't send, server submits
      console.log(`[x402] Step 5: Requesting signature for ${amountUSDCFormatted.toFixed(6)} USDC transfer`);
      console.log(`[x402] Recipient: ${recipientWallet.toBase58()}`);
      console.log(`[x402] Recipient Token Account: ${recipientTokenAccount.toBase58()}`);
      console.log(`[x402] From: ${publicKey.toBase58()}`);
      console.log(`[x402] Amount: ${amountUSDC} smallest units (${amountUSDCFormatted.toFixed(6)} USDC)`);
      console.log(`[x402] Current USDC Balance: ${finalUSDCBalanceFormatted.toFixed(6)} USDC`);
      console.log(`[x402] ⚠️ THIS SHOULD TRIGGER THE PHANTOM WALLET POPUP ⚠️`);
      console.log("[x402] Calling signTransaction with transaction:", {
        feePayer: transaction.feePayer.toBase58(),
        instructions: transaction.instructions.length,
        hasBlockhash: !!transaction.recentBlockhash,
        transferAmountUSDC: amountUSDCFormatted.toFixed(6),
      });
      
      try {
        // Verify network before signing
        const isMainnet = connection.rpcEndpoint.includes("mainnet") || 
                         connection.rpcEndpoint.includes("helius-rpc.com");
        
        console.log("[x402] Network verification:", {
          rpcEndpoint: connection.rpcEndpoint,
          isMainnet: isMainnet,
          usdcMint: usdcMint.toBase58(),
          note: "If Phantom shows 'insufficient USDC', check that Phantom is on the same network (mainnet/devnet)",
        });
        
        // Ensure we're calling signTransaction correctly
        console.log("[x402] About to call signTransaction - wallet popup should appear NOW");
        console.log("[x402] ⚠️ IMPORTANT: If Phantom shows 'insufficient USDC' warning:");
        console.log("[x402]   1. Check that Phantom is set to MAINNET (not devnet)");
        console.log("[x402]   2. Go to Phantom Settings → Developer Settings → Change Network");
        console.log("[x402]   3. Our app is using:", isMainnet ? "MAINNET" : "DEVNET");
        console.log("[x402]   4. Your USDC balance on our network:", finalUSDCBalanceFormatted.toFixed(6), "USDC");
        
        const signedTransaction = await signTransaction(transaction);
        console.log(`[x402] ✅ Transaction signed successfully!`);
        console.log("[x402] Signed transaction signature count:", signedTransaction.signatures.length);

        // Step 5: Serialize the signed transaction (x402 standard)
        console.log("[x402] Step 5: Serializing signed transaction...");
        const serializedTx = signedTransaction.serialize().toString("base64");
        console.log(`[x402] Transaction serialized, length: ${serializedTx.length} chars`);

        // Step 6: Create payment proof according to x402 standard
        console.log("[x402] Step 6: Creating payment proof...");
        const paymentProof = {
          x402Version: 1,
          scheme: paymentQuote.payment.scheme || "exact",
          network: paymentQuote.payment.cluster === "mainnet-beta" 
            ? "solana-mainnet" 
            : "solana-devnet",
          payload: {
            serializedTransaction: serializedTx, // Standard x402 format
          },
        };

        // Step 7: Base64 encode the payment proof
        const xPaymentHeader = btoa(JSON.stringify(paymentProof));
        console.log(`[x402] Payment proof created (${xPaymentHeader.length} chars)`);

        // Step 8: Send payment proof to x402 payment endpoint
        // Server will deserialize, verify, and submit the transaction
        console.log("[x402] Step 7: Sending payment proof to server...");
        
        // Add timeout to fetch request (60 seconds)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        
        try {
          const paidResponse = await fetch(paymentUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Payment": xPaymentHeader,
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          console.log("[x402] Server response status:", paidResponse.status);
          const result = await paidResponse.json();
          console.log("[x402] Server response:", result);

          if (paidResponse.status !== 200) {
            console.error("[x402] Payment verification failed:", result);
            return {
              success: false,
              error: result.error || "Payment verification failed",
            };
          }

          // Check if payment is pending (confirmation timeout)
          if (result.paymentDetails?.pending) {
            console.log(`[x402] ⚠️ Payment submitted but verification pending: ${result.paymentDetails?.signature}`);
            // Transaction was submitted but confirmation timed out
            // We can still return success with the signature
            return {
              success: true,
              signature: result.paymentDetails?.signature,
              explorerUrl: result.paymentDetails?.explorerUrl,
              paymentProof: xPaymentHeader,
              pending: true, // Indicate that verification is pending
            };
          }

          console.log(`[x402] ✅ Payment verified and transaction submitted: ${result.paymentDetails?.signature}`);

          return {
            success: true,
            signature: result.paymentDetails?.signature,
            explorerUrl: result.paymentDetails?.explorerUrl,
            paymentProof: xPaymentHeader, // Return for reuse in subsequent requests
          };
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          if (fetchError.name === 'AbortError') {
            console.error("[x402] Request timeout - server took too long to respond");
            return {
              success: false,
              error: "Payment request timed out. The transaction may have been submitted but verification is pending. Please check the transaction status.",
            };
          }
          throw fetchError;
        }
      } catch (signError) {
        console.error("[x402] ❌ Error during signTransaction:", signError);
        if (signError instanceof Error) {
          console.error("[x402] Error name:", signError.name);
          console.error("[x402] Error message:", signError.message);
          console.error("[x402] Error stack:", signError.stack);
        }
        return {
          success: false,
          error: `Transaction signing failed: ${signError instanceof Error ? signError.message : "Unknown error"}`,
        };
      }
    } catch (error) {
      console.error("[x402] ❌ Payment flow error:", error);
      if (error instanceof Error) {
        console.error("[x402] Error name:", error.name);
        console.error("[x402] Error message:", error.message);
        console.error("[x402] Error stack:", error.stack);
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      setIsProcessing(false);
      console.log("[x402] Payment flow completed");
    }
  };

  return {
    makePayment,
    isProcessing,
  };
}

