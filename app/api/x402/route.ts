import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";

// Configuration - in production, use environment variables
const RECIPIENT_WALLET = process.env.X402_RECIPIENT_WALLET || "seFkxFkXEY9JGEpCyPfCWTuPZG9WK6ucf95zvKCfsRX";
const PRICE_USDC = 0.01; // 0.01 USDC per API call (adjust as needed)
const CLUSTER = process.env.SOLANA_CLUSTER || "devnet";
const RPC_URL = CLUSTER === "mainnet-beta" 
  ? process.env.SOLANA_MAINNET_RPC || "https://api.mainnet-beta.solana.com"
  : process.env.SOLANA_DEVNET_RPC || "https://api.devnet.solana.com";

// USDC mint addresses
const USDC_MINT_MAINNET = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const USDC_MINT_DEVNET = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"; // Devnet USDC (or use a test token)

const USDC_MINT = CLUSTER === "mainnet-beta" ? USDC_MINT_MAINNET : USDC_MINT_DEVNET;
const USDC_DECIMALS = 6; // USDC has 6 decimals

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
        requestedAmount = Math.max(body.amount, 0.01); // Minimum $0.01
      }
    } catch {
      // No body or invalid JSON, use default
    }

    // Get or create the recipient's associated token account
    const recipientPubkey = new PublicKey(RECIPIENT_WALLET);
    const usdcMint = new PublicKey(USDC_MINT);
    const recipientTokenAccount = await getAssociatedTokenAddress(
      usdcMint,
      recipientPubkey
    );

    return NextResponse.json(
      {
        payment: {
          recipientWallet: RECIPIENT_WALLET,
          tokenAccount: recipientTokenAccount.toBase58(),
          mint: USDC_MINT,
          amount: Math.floor(requestedAmount * Math.pow(10, USDC_DECIMALS)), // Amount in smallest units
          amountUSDC: requestedAmount,
          cluster: CLUSTER,
          message: `Send ${requestedAmount.toFixed(4)} USDC to the token account`,
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
    const paymentProof: PaymentProof = JSON.parse(
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

    // Deserialize the transaction
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

    // Submit the transaction
    const signature = await connection.sendRawTransaction(
      transaction instanceof VersionedTransaction
        ? transaction.serialize()
        : transaction.serialize(),
      {
        skipPreflight: false,
        maxRetries: 3,
      }
    );

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature, "confirmed");
    
    if (confirmation.value.err) {
      return NextResponse.json(
        { error: "Transaction failed", details: confirmation.value.err },
        { status: 402 }
      );
    }

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
    const usdcMint = new PublicKey(USDC_MINT);
    const recipientTokenAccount = await getAssociatedTokenAddress(
      usdcMint,
      recipientPubkey
    );

    let amountReceived = 0;

    // Check token balance changes
    if (tx.meta?.preTokenBalances && tx.meta?.postTokenBalances) {
      const preTokenBalances = tx.meta.preTokenBalances;
      const postTokenBalances = tx.meta.postTokenBalances;

      // Find the recipient's token account in the balance changes
      for (let i = 0; i < postTokenBalances.length; i++) {
        const postBal = postTokenBalances[i];
        const preBal = preTokenBalances.find(
          (pre) => pre.accountIndex === postBal.accountIndex
        );

        // Check if this is the recipient's token account
        // Handle both legacy and versioned transactions
        let accountKey: PublicKey | undefined;
        const message = tx.transaction.message;
        if ('staticAccountKeys' in message) {
          accountKey = message.staticAccountKeys[postBal.accountIndex];
        } else if ('accountKeys' in message) {
          const accountKeys = (message as any).accountKeys;
          if (Array.isArray(accountKeys)) {
            const key = accountKeys[postBal.accountIndex];
            if (typeof key === 'string') {
              accountKey = new PublicKey(key);
            } else if (key instanceof PublicKey) {
              accountKey = key;
            }
          }
        }
        
        if (accountKey && accountKey.equals(recipientTokenAccount)) {
          const postAmount = postBal.uiTokenAmount.amount;
          const preAmount = preBal?.uiTokenAmount.amount ?? "0";
          amountReceived = Number(postAmount) - Number(preAmount);
          break;
        }
      }
    }

    // Get the expected amount from payment proof metadata if available
    // Otherwise use default PRICE_USDC
    // Note: In a production system, you'd store the expected amount when generating the quote
    // For now, we'll accept any payment >= 0.01 USDC (minimum)
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
        recipient: recipientTokenAccount.toBase58(),
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
  const usdcMint = new PublicKey(USDC_MINT);
  const recipientTokenAccount = await getAssociatedTokenAddress(
    usdcMint,
    recipientPubkey
  );

  return NextResponse.json(
    {
      payment: {
        recipientWallet: RECIPIENT_WALLET,
        tokenAccount: recipientTokenAccount.toBase58(),
        mint: USDC_MINT,
        amount: Math.floor(PRICE_USDC * Math.pow(10, USDC_DECIMALS)),
        amountUSDC: PRICE_USDC,
        cluster: CLUSTER,
        message: "Send USDC to the token account",
        scheme: "exact",
      },
    },
    { status: 402 }
  );
}

