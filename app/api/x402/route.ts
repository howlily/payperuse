import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";

// Configuration - in production, use environment variables
const RECIPIENT_WALLET = process.env.X402_RECIPIENT_WALLET || "seFkxFkXEY9JGEpCyPfCWTuPZG9WK6ucf95zvKCfsRX";
const PRICE_USDC = 0.10; // 0.10 USDC per API call (adjust as needed)
const CLUSTER = process.env.SOLANA_CLUSTER || "mainnet-beta"; // Default to mainnet to match frontend

// USDC mint addresses
const USDC_MINT_MAINNET = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const USDC_MINT_DEVNET = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
const USDC_DECIMALS = 6; // USDC has 6 decimals
const RPC_URL = CLUSTER === "mainnet-beta" 
  ? (process.env.NEXT_PUBLIC_HELIUS_API_KEY 
      ? `https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`
      : process.env.SOLANA_MAINNET_RPC || "https://api.mainnet-beta.solana.com")
  : process.env.SOLANA_DEVNET_RPC || "https://api.devnet.solana.com";

const connection = new Connection(RPC_URL, "confirmed");

interface PaymentProof {
  x402Version: number;
  scheme: string;
  network: string;
  payload: {
    serializedTransaction: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const xPaymentHeader = request.headers.get("X-Payment");

    // If X-Payment header is present, verify the payment
    if (xPaymentHeader) {
      return await verifyPayment(xPaymentHeader);
    }

    // No payment provided - return 402 with payment requirements
    // Try to get dynamic amount from request body
    let requestedAmount = PRICE_USDC;
    try {
      const body = await request.json();
      if (body.amount && typeof body.amount === 'number') {
        requestedAmount = Math.max(body.amount, 0.01); // Minimum 0.01 USDC
      }
    } catch {
      // No body or invalid JSON, use default
    }

    const recipientPubkey = new PublicKey(RECIPIENT_WALLET);
    const usdcMint = CLUSTER === "mainnet-beta" ? USDC_MINT_MAINNET : USDC_MINT_DEVNET;
    const recipientTokenAccount = await getAssociatedTokenAddress(usdcMint, recipientPubkey);
    const amountUSDC = Math.floor(requestedAmount * Math.pow(10, USDC_DECIMALS)); // Convert to smallest units

    return NextResponse.json(
      {
        payment: {
          recipientWallet: RECIPIENT_WALLET,
          tokenAccount: recipientTokenAccount.toBase58(),
          mint: usdcMint.toBase58(),
          amount: amountUSDC, // Amount in USDC smallest units (6 decimals)
          amountUSDC: requestedAmount,
          cluster: CLUSTER,
          message: `Send ${requestedAmount.toFixed(2)} USDC to ${RECIPIENT_WALLET}`,
          scheme: "exact",
        },
      },
      { status: 402 }
    );
  } catch (error) {
    console.error("x402 API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function verifyPayment(xPaymentHeader: string): Promise<NextResponse> {
  try {
    // Decode the X-Payment header
    const paymentProof: any = JSON.parse(
      Buffer.from(xPaymentHeader, "base64").toString("utf-8")
    );

    if (paymentProof.x402Version !== 1) {
      return NextResponse.json(
        { error: "Unsupported x402 version" },
        { status: 400 }
      );
    }

    if (paymentProof.scheme !== "exact") {
      return NextResponse.json(
        { error: "Only 'exact' payment scheme is supported" },
        { status: 400 }
      );
    }

    // x402 standard: payment proof contains serialized signed transaction
    if (!paymentProof.payload.serializedTransaction) {
      return NextResponse.json(
        { error: "Invalid payment proof: missing serializedTransaction" },
        { status: 400 }
      );
    }

    // Deserialize the signed transaction
    const serializedTx = Buffer.from(
      paymentProof.payload.serializedTransaction,
      "base64"
    );

    let transaction: Transaction | VersionedTransaction;
    try {
      transaction = Transaction.from(serializedTx);
    } catch {
      transaction = VersionedTransaction.deserialize(serializedTx);
    }

    console.log(`[x402] Deserialized transaction, submitting to blockchain...`);

    // Submit the transaction (x402 standard: server submits the signed transaction)
    // Note: Transaction is already signed by the client, so we can skip preflight
    // to avoid simulation errors (the client has already validated the transaction)
    const serializedTransaction = transaction instanceof VersionedTransaction
      ? transaction.serialize()
      : transaction.serialize();
    
    let signature: string;
    try {
      // Try with preflight first (more secure)
      signature = await connection.sendRawTransaction(serializedTransaction, {
        skipPreflight: false,
        maxRetries: 3,
      });
    } catch (preflightError: any) {
      // If preflight fails (e.g., rent exemption simulation error), 
      // but transaction is valid, try without preflight
      // This can happen if the simulation is overly strict or blockhash is close to expiring
      console.warn(`[x402] Preflight check failed, retrying without preflight:`, preflightError.message);
      signature = await connection.sendRawTransaction(serializedTransaction, {
        skipPreflight: true,
        maxRetries: 3,
      });
    }

    console.log(`[x402] Transaction submitted with signature: ${signature}`);

    // Wait for confirmation with timeout
    // Use a Promise.race to add a timeout to the confirmation
    const CONFIRMATION_TIMEOUT = 30000; // 30 seconds timeout
    
    try {
      const confirmationPromise = connection.confirmTransaction(signature, "confirmed");
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Confirmation timeout")), CONFIRMATION_TIMEOUT)
      );
      
      const confirmation = await Promise.race([confirmationPromise, timeoutPromise]) as any;
      
      if (confirmation.value?.err) {
        console.error(`[x402] Transaction failed:`, confirmation.value.err);
        return NextResponse.json(
          { error: "Transaction failed", details: confirmation.value.err },
          { status: 402 }
        );
      }

      console.log(`[x402] Transaction confirmed successfully`);
    } catch (confirmError: any) {
      // If confirmation times out, check if transaction was actually processed
      console.warn(`[x402] Confirmation timeout or error:`, confirmError.message);
      
      // Try to get the transaction status directly
      try {
        const tx = await connection.getTransaction(signature, {
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0,
        });
        
        if (tx && tx.meta && !tx.meta.err) {
          // Transaction was actually successful, just confirmation timed out
          console.log(`[x402] Transaction found on-chain despite confirmation timeout`);
        } else if (tx && tx.meta && tx.meta.err) {
          // Transaction failed
          return NextResponse.json(
            { error: "Transaction failed", details: tx.meta.err },
            { status: 402 }
          );
        } else {
          // Transaction not found yet - might still be processing
          // Return the signature and let client check status
          console.log(`[x402] Transaction not found yet, returning signature for client to verify`);
          return NextResponse.json({
            data: "Payment submitted (verification pending)",
            paymentDetails: {
              signature,
              amount: 0, // Will be verified later
              amountUSDC: 0,
              recipient: RECIPIENT_WALLET,
              explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=${CLUSTER}`,
              pending: true,
            },
          });
        }
      } catch (txError) {
        console.error(`[x402] Error checking transaction status:`, txError);
        // Return signature anyway - client can verify
        return NextResponse.json({
          data: "Payment submitted (verification pending)",
          paymentDetails: {
            signature,
            amount: 0,
            amountUSDC: 0,
            recipient: RECIPIENT_WALLET,
            explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=${CLUSTER}`,
            pending: true,
          },
        });
      }
    }

    // If we reach here, confirmation was successful (or transaction found on-chain)
    // Verify the payment amount
    const tx = await connection.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 402 }
      );
    }

    // Verify USDC token transfer
    const recipientPubkey = new PublicKey(RECIPIENT_WALLET);
    const usdcMint = CLUSTER === "mainnet-beta" ? USDC_MINT_MAINNET : USDC_MINT_DEVNET;
    const recipientTokenAccount = await getAssociatedTokenAddress(usdcMint, recipientPubkey);
    let amountReceived = 0;

    // Check token balance changes
    if (tx.meta?.preTokenBalances && tx.meta?.postTokenBalances) {
      const preTokenBalances = tx.meta.preTokenBalances || [];
      const postTokenBalances = tx.meta.postTokenBalances || [];

      // Find the recipient's token account in the balance changes
      for (let i = 0; i < postTokenBalances.length; i++) {
        const postBal = postTokenBalances[i];
        const preBal = preTokenBalances.find(
          (pre) => pre.accountIndex === postBal.accountIndex
        );

        // Check if this is the recipient's token account
        const message = tx.transaction.message;
        let accountKeys: PublicKey[] = [];
        
        if ('staticAccountKeys' in message) {
          accountKeys = message.staticAccountKeys;
        } else if ('accountKeys' in message) {
          const keys = (message as any).accountKeys;
          if (Array.isArray(keys)) {
            accountKeys = keys.map((key: any) => 
              typeof key === 'string' ? new PublicKey(key) : key
            );
          }
        }

        const accountKey = accountKeys[postBal.accountIndex];
        if (accountKey && accountKey.equals(recipientTokenAccount)) {
          const postAmount = postBal.uiTokenAmount?.uiAmountString 
            ? parseFloat(postBal.uiTokenAmount.uiAmountString) * Math.pow(10, USDC_DECIMALS)
            : Number(postBal.uiTokenAmount?.amount || "0");
          const preAmount = preBal?.uiTokenAmount?.uiAmountString
            ? parseFloat(preBal.uiTokenAmount.uiAmountString) * Math.pow(10, USDC_DECIMALS)
            : Number(preBal?.uiTokenAmount?.amount || "0");
          amountReceived = postAmount - preAmount;
          break;
        }
      }
    }

    // Minimum payment check (0.01 USDC)
    const minimumAmount = Math.floor(0.01 * Math.pow(10, USDC_DECIMALS));
    if (amountReceived < minimumAmount) {
      return NextResponse.json(
        {
          error: `Insufficient payment: received ${amountReceived / Math.pow(10, USDC_DECIMALS)} USDC, minimum required is 0.01 USDC`,
        },
        { status: 402 }
      );
    }

    console.log(
      `Payment verified: ${amountReceived / Math.pow(10, USDC_DECIMALS)} USDC received`
    );
    console.log(
      `View transaction: https://explorer.solana.com/tx/${signature}?cluster=${CLUSTER}`
    );

    // Payment verified! Return success with payment details
    return NextResponse.json({
      data: "Payment verified successfully",
      paymentDetails: {
        signature,
        amount: amountReceived,
        amountUSDC: amountReceived / Math.pow(10, USDC_DECIMALS),
        recipient: RECIPIENT_WALLET,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=${CLUSTER}`,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        error: "Payment verification failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 402 }
    );
  }
}

// Also support GET for payment quote
export async function GET() {
  const recipientPubkey = new PublicKey(RECIPIENT_WALLET);
  const usdcMint = CLUSTER === "mainnet-beta" ? USDC_MINT_MAINNET : USDC_MINT_DEVNET;
  const recipientTokenAccount = await getAssociatedTokenAddress(usdcMint, recipientPubkey);
  const amountUSDC = Math.floor(PRICE_USDC * Math.pow(10, USDC_DECIMALS));

  return NextResponse.json(
    {
      payment: {
        recipientWallet: RECIPIENT_WALLET,
        tokenAccount: recipientTokenAccount.toBase58(),
        mint: usdcMint.toBase58(),
        amount: amountUSDC,
        amountUSDC: PRICE_USDC,
        cluster: CLUSTER,
        message: `Send ${PRICE_USDC.toFixed(2)} USDC to ${RECIPIENT_WALLET}`,
        scheme: "exact",
      },
    },
    { status: 402 }
  );
}

