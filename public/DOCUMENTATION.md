# Spectral 402 - Complete Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [What is Spectral 402?](#what-is-spectral-402)
3. [Key Features](#key-features)
4. [How It Works](#how-it-works)
5. [Getting Started](#getting-started)
6. [Supported AI Models](#supported-ai-models)
7. [Pricing & Payment](#pricing--payment)
8. [x402 Payment Protocol](#x402-payment-protocol)
9. [Technical Architecture](#technical-architecture)
10. [API Reference](#api-reference)
11. [Wallet Integration](#wallet-integration)
12. [Troubleshooting](#troubleshooting)
13. [FAQ](#faq)

---

## Introduction

Spectral 402 is a decentralized AI assistant platform that provides pay-as-you-go access to premium Large Language Models (LLMs) using the x402 payment protocol on Solana. Unlike traditional AI services that require monthly subscriptions or API key management, Spectral 402 enables instant, wallet-based access to the world's most advanced AI models.

### Why Spectral 402?

- **No Subscriptions**: Pay only for what you use
- **No API Keys**: Your wallet is your identity
- **Instant Payments**: 200ms payment processing via Solana
- **Privacy-First**: No account creation required
- **Transparent Pricing**: See exact costs before each request

---

## What is Spectral 402?

Spectral 402 is a web application that bridges the gap between decentralized payments and AI services. It allows users to:

1. Connect their Solana wallet (Phantom, Solflare, etc.)
2. Select from premium AI models (GPT-5, Claude Opus, o4-mini, Gemini)
3. Send prompts and receive AI responses
4. Pay automatically via USDC using the x402 protocol

The platform uses the **x402 payment standard**, an internet-native payment protocol that enables seamless, autonomous payments for digital services.

---

## Key Features

### 🚀 Pay-As-You-Go Model

- **Dynamic Pricing**: Costs calculated based on actual token usage
- **No Hidden Fees**: Transparent pricing displayed before each request
- **Fair Billing**: Only pay for tokens actually consumed
- **Minimum Cost**: $0.01 USDC minimum per request

### 🧠 Premium LLM Models

Access to the world's most advanced AI models:

- **Claude Opus 4.1**: Best for complex reasoning and long-form writing
- **GPT-5**: Most capable for general tasks and analysis
- **o4-mini**: Optimized for step-by-step problem solving
- **Gemini 2.5 Flash**: Great for multimodal tasks

### 💰 Real-Time Price Estimation

- **Live Cost Calculation**: See estimated cost as you type
- **Token Breakdown**: View input/output token estimates
- **Balance Checking**: Automatic USDC balance verification
- **Cost Transparency**: See actual vs estimated costs after each request

### 🔒 Privacy & Security

- **Wallet-Based Identity**: No account creation required
- **Autonomous Agents**: Direct wallet-to-service interaction
- **Encrypted Communications**: All data secured via x402 protocol
- **No Data Storage**: Your prompts and responses aren't stored

### ⚡ Fast & Reliable

- **200ms Payment Processing**: Near-instant payment verification
- **Solana Blockchain**: High-throughput, low-cost transactions
- **USDC Stablecoin**: Price-stable payments
- **Real-Time Updates**: Live balance and transaction status

---

## How It Works

### Step-by-Step Flow

1. **Connect Your Wallet**
   - Click "Connect Wallet" button
   - Select your Solana wallet (Phantom, Solflare, etc.)
   - Approve the connection

2. **Select an AI Model**
   - Choose from available models (Claude Opus, GPT-5, o4-mini, Gemini)
   - Each model has different pricing and capabilities

3. **Type Your Prompt**
   - As you type, the system calculates:
     - Estimated input tokens
     - Estimated output tokens
     - Total cost in USDC
   - Price updates in real-time

4. **Review Estimated Cost**
   - View the price breakdown card showing:
     - Total estimated cost
     - Input/output token counts
     - Input/output costs
     - Your USDC balance
   - System automatically checks if you have sufficient balance

5. **Send Your Request**
   - Click the send button
   - If insufficient balance, you'll see an error message
   - If balance is sufficient, payment flow begins

6. **Payment Processing**
   - System requests payment quote from backend
   - Wallet prompts you to approve transaction
   - USDC transfer is executed on Solana
   - Payment is verified (takes ~200ms)

7. **AI Processing**
   - After payment verification, your prompt is sent to the selected AI model
   - AI generates response
   - Token usage is tracked

8. **Receive Response**
   - AI response is displayed
   - Usage statistics shown:
     - Actual tokens used (input/output/total)
     - Actual cost vs estimated cost
   - Response can be copied or used for further queries

### Payment Flow Diagram

```
User Types Prompt
    ↓
Price Calculated (Real-Time)
    ↓
User Clicks Send
    ↓
Check Wallet Connection & USDC Balance
    ↓
Request Payment Quote (402 Response)
    ↓
User Approves Transaction in Wallet
    ↓
USDC Transfer Executed on Solana
    ↓
Payment Verified (~200ms)
    ↓
AI Prompt Executed
    ↓
Response + Usage Stats Returned
```

---

## Getting Started

### Prerequisites

- A Solana wallet (Phantom, Solflare, Torus, or Ledger)
- USDC tokens on Solana mainnet
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Quick Start

1. **Visit the Application**
   - Navigate to the Spectral 402 website
   - Click "Get Started" on the homepage

2. **Connect Your Wallet**
   - Click "Connect Wallet" button
   - Select your wallet provider
   - Approve the connection request

3. **Fund Your Wallet**
   - Ensure you have USDC in your wallet
   - You can get USDC from:
     - Centralized exchanges (Coinbase, Binance, etc.)
     - DEXs on Solana (Jupiter, Raydium, etc.)
     - USDC faucets (for devnet testing)

4. **Start Using AI**
   - Select a model
   - Type your prompt
   - Review the estimated cost
   - Click send and approve the transaction

### First Request Tips

- Start with a simple prompt to test the flow
- Check your USDC balance before sending
- Review the price estimate before confirming
- Keep some extra USDC for transaction fees

---

## Supported AI Models

### Claude Opus 4.1

**Provider**: Anthropic  
**Best For**: Complex reasoning, long-form writing, analysis

**Pricing**:
- Input: $15.00 per 1M tokens
- Output: $75.00 per 1M tokens

**Features**:
- Extended context window for comprehensive analysis
- Superior writing quality and coherence
- Advanced reasoning capabilities
- Excellent for research and analysis tasks

### GPT-5

**Provider**: OpenAI  
**Best For**: General tasks, advanced reasoning, improved accuracy

**Pricing**:
- Input: $4.50 per 1M tokens
- Output: $6.75 per 1M tokens

**Features**:
- Latest GPT model with enhanced capabilities
- Improved accuracy and reduced hallucinations
- Better handling of nuanced instructions
- Great for general-purpose AI tasks

### o4-mini

**Provider**: OpenAI  
**Best For**: Advanced reasoning, mathematics, logic, problem-solving

**Pricing**:
- Input: $2.20 per 1M tokens
- Output: $3.30 per 1M tokens

**Features**:
- State-of-the-art reasoning architecture
- Exceptional math and logic performance
- Deep problem-solving capabilities
- Optimized for step-by-step reasoning

### Gemini 2.5 Flash

**Provider**: Google  
**Best For**: Fast responses, multimodal tasks, cost-effective solutions

**Pricing**:
- Input: Free tier
- Output: Free tier

**Features**:
- Fast response times
- Multimodal capabilities
- Cost-effective for high-volume usage
- Great for quick queries

---

## Pricing & Payment

### How Pricing Works

Pricing is calculated based on **actual token usage**, not fixed rates:

1. **Input Tokens**: Calculated from your prompt length
   - Approximately 1 token = 4 characters
   - Longer prompts = more input tokens

2. **Output Tokens**: Estimated based on model defaults
   - Default: ~2000 tokens
   - Actual output may vary

3. **Cost Calculation**:
   ```
   Input Cost = (Input Tokens / 1,000,000) × Input Price per 1M
   Output Cost = (Output Tokens / 1,000,000) × Output Price per 1M
   Total Cost = (Input Cost + Output Cost) × 1.2 (20% buffer)
   Minimum Cost = $0.01 USDC
   ```

### Price Estimation

Before sending a request, you'll see:
- **Estimated Total Cost**: With 20% safety buffer
- **Input Token Estimate**: Based on prompt length
- **Output Token Estimate**: Default ~2000 tokens
- **Cost Breakdown**: Input and output costs separately

### Actual vs Estimated Cost

After your request completes, you'll see:
- **Actual Tokens Used**: Real input/output token counts
- **Actual Cost**: Based on real token usage
- **Estimated Cost**: What you were charged upfront
- **Difference**: Usually very close due to the 20% buffer

### Payment Currency

- **USDC (USD Coin)**: Stablecoin pegged to USD
- **Network**: Solana mainnet
- **Minimum**: $0.01 USDC per request
- **Transaction Fees**: Paid in SOL (separate from request cost)

---

## x402 Payment Protocol

### What is x402?

x402 is an internet-native payment standard that enables autonomous, wallet-based payments for digital services. It's designed for:

- **No Account Required**: Direct wallet-to-service payments
- **Instant Verification**: Fast payment confirmation
- **Standardized Format**: Works across different services
- **Blockchain Agnostic**: Can work on multiple chains

### How x402 Works in Spectral 402

1. **Payment Request (402 Status)**
   - Service returns HTTP 402 status code
   - Includes payment requirements in response body
   - Contains: amount, recipient, token account, etc.

2. **Payment Quote**
   ```json
   {
     "payment": {
       "recipientWallet": "...",
       "tokenAccount": "...",
       "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
       "amount": 1000000,
       "amountUSDC": 1.0,
       "cluster": "mainnet-beta",
       "scheme": "exact"
     }
   }
   ```

3. **Transaction Creation**
   - User's wallet creates USDC transfer transaction
   - Transfers exact amount to recipient token account
   - Transaction is signed by user

4. **Payment Proof**
   - Signed transaction is serialized
   - Encoded as base64
   - Sent as `X-Payment` header

5. **Verification**
   - Backend verifies transaction on Solana
   - Confirms payment amount
   - Processes the service request

### Payment Proof Format

```json
{
  "x402Version": 1,
  "scheme": "exact",
  "network": "solana-mainnet",
  "payload": {
    "serializedTransaction": "base64-encoded-transaction"
  }
}
```

---

## Technical Architecture

### Frontend Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Wallet Integration**: Solana Wallet Adapter
- **3D Graphics**: Spline

### Backend Stack

- **API Routes**: Next.js API Routes
- **Payment Verification**: Solana Web3.js
- **LLM Integration**: 
  - OpenAI API
  - Anthropic API
  - Google Gemini API

### Blockchain Integration

- **Network**: Solana Mainnet
- **RPC Provider**: Helius (configurable)
- **Token Standard**: SPL Token (USDC)
- **Wallet Support**: Phantom, Solflare, Torus, Ledger

### Key Components

#### Frontend Components

- `WalletProvider`: Manages Solana wallet connection
- `useWalletBalance`: Fetches SOL and token balances
- `usePriceEstimate`: Calculates real-time pricing
- `useX402Payment`: Handles x402 payment flow
- `useX402API`: Manages API calls with payment

#### Backend Routes

- `/api/ai`: Main AI endpoint with x402 payment
- `/api/x402`: Payment verification endpoint

### Data Flow

```
Frontend (React)
    ↓
Wallet Adapter (Solana)
    ↓
x402 Payment Hook
    ↓
Backend API (/api/ai)
    ↓
Payment Verification (/api/x402)
    ↓
LLM Provider (OpenAI/Anthropic/Google)
    ↓
Response + Usage Stats
    ↓
Frontend Display
```

---

## API Reference

### POST /api/ai

Main endpoint for AI requests. Requires x402 payment.

**Request**:
```json
{
  "message": "Your prompt here",
  "model": "gpt-5"
}
```

**Response (402 - Payment Required)**:
```json
{
  "payment": {
    "recipientWallet": "...",
    "tokenAccount": "...",
    "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "amount": 1000000,
    "amountUSDC": 1.0,
    "cluster": "mainnet-beta",
    "message": "Payment required: 1.0000 USDC for gpt-5",
    "scheme": "exact",
    "model": "gpt-5",
    "estimatedTokens": 500
  }
}
```

**Request with Payment**:
```http
POST /api/ai
Content-Type: application/json
X-Payment: <base64-encoded-payment-proof>

{
  "message": "Your prompt here",
  "model": "gpt-5"
}
```

**Response (200 - Success)**:
```json
{
  "success": true,
  "data": {
    "response": "AI response text...",
    "model": "openai/gpt-4o",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "usage": {
      "inputTokens": 100,
      "outputTokens": 200,
      "totalTokens": 300
    },
    "cost": {
      "estimated": 1.0,
      "actual": 0.95,
      "currency": "USDC"
    }
  }
}
```

### POST /api/x402

Payment verification endpoint.

**Request (Verification)**:
```http
POST /api/x402
X-Payment: <base64-encoded-payment-proof>
```

**Response (200 - Verified)**:
```json
{
  "data": "Payment verified successfully",
  "paymentDetails": {
    "signature": "transaction-signature",
    "amount": 1000000,
    "amountUSDC": 1.0,
    "recipient": "token-account-address",
    "explorerUrl": "https://explorer.solana.com/tx/..."
  }
}
```

**Request (Quote)**:
```http
POST /api/x402
Content-Type: application/json

{
  "amount": 1.0,
  "model": "gpt-5"
}
```

**Response (402 - Payment Required)**:
```json
{
  "payment": {
    "recipientWallet": "...",
    "tokenAccount": "...",
    "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "amount": 1000000,
    "amountUSDC": 1.0,
    "cluster": "mainnet-beta",
    "message": "Send 1.0000 USDC to the token account",
    "scheme": "exact"
  }
}
```

---

## Wallet Integration

### Supported Wallets

- **Phantom**: Most popular Solana wallet
- **Solflare**: Feature-rich Solana wallet
- **Torus**: Social login wallet
- **Ledger**: Hardware wallet support

### Wallet Connection Flow

1. User clicks "Connect Wallet"
2. Wallet adapter shows available wallets
3. User selects wallet
4. Wallet extension/app opens
5. User approves connection
6. Public key is shared with application
7. Balance fetching begins

### Balance Display

The application displays:
- **SOL Balance**: Native Solana token
- **USDC Balance**: For payments
- **Other Tokens**: Any SPL tokens in wallet

### Transaction Approval

When sending a request:
1. Payment quote is calculated
2. Wallet prompts for transaction approval
3. User reviews:
   - Amount to send
   - Recipient address
   - Transaction fee
4. User approves or rejects
5. If approved, transaction is signed and sent

---

## Troubleshooting

### Common Issues

#### "Wallet not connected"
- **Solution**: Click "Connect Wallet" and approve the connection
- **Check**: Ensure wallet extension is installed and unlocked

#### "Insufficient USDC balance"
- **Solution**: Add USDC to your wallet
- **Check**: Verify you're on mainnet (not devnet)
- **Note**: You need USDC, not SOL (though SOL is needed for transaction fees)

#### "Payment verification failed"
- **Solution**: Wait a few seconds and try again
- **Check**: Ensure transaction was confirmed on Solana
- **Note**: Network congestion can cause delays

#### "Balance shows 0.0000"
- **Solution**: 
  - Refresh the page
  - Disconnect and reconnect wallet
  - Check you're on the correct network (mainnet)
  - Verify RPC endpoint is working

#### "Transaction pending"
- **Solution**: Wait for confirmation (usually < 1 second)
- **Check**: Solana network status
- **Note**: High network activity can cause delays

### Error Messages

#### "Unknown model"
- **Cause**: Invalid model name in request
- **Solution**: Use one of the supported models

#### "Message is required"
- **Cause**: Empty prompt sent
- **Solution**: Enter a message before sending

#### "Payment verification failed"
- **Cause**: Transaction not found or invalid
- **Solution**: Retry the request

### Getting Help

- **GitHub Issues**: [github.com/howlily/spectral402/issues](https://github.com/howlily/spectral402/issues)
- **Documentation**: Check this documentation
- **Community**: Join our Discord (if available)

---

## FAQ

### General Questions

**Q: Do I need to create an account?**  
A: No! Just connect your Solana wallet. Your wallet is your identity.

**Q: What wallets are supported?**  
A: Phantom, Solflare, Torus, and Ledger. More may be added in the future.

**Q: Can I use this on mobile?**  
A: Yes, if your wallet has a mobile app with browser integration.

**Q: Is my data stored?**  
A: No. Your prompts and responses are not stored on our servers.

### Payment Questions

**Q: How much does it cost?**  
A: Costs vary by model and token usage. See the Pricing section for details.

**Q: What is the minimum payment?**  
A: $0.01 USDC per request.

**Q: Do I pay for failed requests?**  
A: No. Payment is only processed after successful verification.

**Q: Can I get a refund?**  
A: No. We do not process refunds. Payments are final.

**Q: What if I overpay?**  
A: The system uses a 20% buffer, so you may pay slightly more than actual cost. This ensures your payment covers the request.

### Technical Questions

**Q: What blockchain is used?**  
A: Solana mainnet.

**Q: What token is used for payments?**  
A: USDC (USD Coin) on Solana.

**Q: How fast are payments?**  
A: Typically ~200ms for payment verification on Solana.

**Q: Can I use a custom RPC endpoint?**  
A: Yes, set `NEXT_PUBLIC_SOLANA_RPC_URL` environment variable.

**Q: Is the code open source?**  
A: Yes! Check our GitHub repository.

### Model Questions

**Q: Which model should I use?**  
A: 
- **General tasks**: GPT-5
- **Complex reasoning**: Claude Opus 4.1
- **Math/logic**: o4-mini
- **Cost-effective**: Gemini 2.5 Flash

**Q: Can I use multiple models?**  
A: Yes, switch between models for different requests.

**Q: Are there rate limits?**  
A: Rate limits depend on your USDC balance and the model provider's limits.

**Q: What's the maximum prompt length?**  
A: Varies by model. Most support up to 32K tokens for input.

---

## Conclusion

Spectral 402 represents the future of AI access: decentralized, transparent, and user-controlled. By combining the power of Solana's fast blockchain with the x402 payment protocol, we've created a seamless experience for accessing premium AI models.

### Key Takeaways

- ✅ No subscriptions or API keys needed
- ✅ Pay only for what you use
- ✅ Transparent, real-time pricing
- ✅ Privacy-first, wallet-based identity
- ✅ Access to world's best AI models

### Next Steps

1. Connect your wallet
2. Fund with USDC
3. Start using AI models
4. Explore different models for different tasks

### Resources

- **GitHub**: [github.com/howlily/spectral402](https://github.com/howlily/spectral402)
- **Documentation**: This file
- **x402 Protocol**: Learn more about the payment standard

---

**Made with ❤️ in Stockholm, Sweden**

