# PayPerUse - Pay-As-You-Go AI Access

A decentralized AI assistant platform that provides pay-as-you-go access to premium Large Language Models (LLMs) using the x402 payment protocol on Solana. No subscriptions, no API keys needed - just connect your wallet and pay per use.

## 🚀 What is PayPerUse?

PayPerUse is a web application that bridges the gap between decentralized payments and AI services. It allows users to:

- Connect their Solana wallet (Phantom, Solflare, etc.)
- Select from premium AI models (GPT-5, Claude Opus, o4-mini, Gemini)
- Send prompts and receive AI responses
- Pay automatically via USDC using the x402 protocol

## ✨ Key Features

### Pay-As-You-Go Model
- **No Subscriptions**: Pay only for what you use
- **No API Keys**: Your wallet is your identity
- **Instant Payments**: 200ms payment processing via Solana
- **Transparent Pricing**: See exact costs before each request
- **Privacy-First**: No account creation required

### Premium LLM Models
Access to the world's most advanced AI models:

- **Claude Opus 4.1**: Best for complex reasoning and long-form writing ($45 per 1M tokens)
- **GPT-5**: Most capable for general tasks and analysis ($11.25 per 1M tokens)
- **o4-mini**: Optimized for step-by-step problem solving ($5.50 per 1M tokens)
- **Gemini 2.5 Flash**: Great for multimodal tasks (FREE tier available)

### Real-Time Price Estimation
- Live cost calculation as you type
- Token breakdown (input/output estimates)
- Automatic USDC balance verification
- Actual vs estimated cost comparison

## 🎯 How It Works

1. **Connect Your Wallet** - Click "Connect Wallet" and select your Solana wallet
2. **Select an AI Model** - Choose from Claude Opus, GPT-5, o4-mini, or Gemini
3. **Type Your Prompt** - See real-time price estimation as you type
4. **Review Estimated Cost** - Check the price breakdown before sending
5. **Send Your Request** - Approve the transaction in your wallet
6. **Payment Processing** - USDC transfer executed on Solana (~200ms)
7. **Receive Response** - Get AI response with usage statistics

## 🛠️ Technology Stack

- **Next.js 14** - Modern React framework with App Router
- **TypeScript** - Full type safety
- **Tailwind CSS** - Beautiful, responsive UI
- **Solana Web3.js** - Blockchain integration
- **x402 Protocol** - Internet-native payment standard
- **USDC on Solana** - Stablecoin payments

## 📋 Prerequisites

- A Solana wallet (Phantom, Solflare, Torus, or Ledger)
- USDC tokens on Solana mainnet
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Quick Start

1. **Visit the Application**
   - Navigate to the PayPerUse website
   - Click "Get Started" on the homepage

2. **Connect Your Wallet**
   - Click "Connect Wallet" button
   - Select your wallet provider
   - Approve the connection request

3. **Fund Your Wallet**
   - Ensure you have USDC in your wallet
   - Minimum: $0.01 USDC per request

4. **Start Using AI**
   - Select a model
   - Type your prompt
   - Review the estimated cost
   - Click send and approve the transaction

## 💰 Pricing

Pricing is calculated based on **actual token usage**:

- **Input Tokens**: Calculated from your prompt length (~1 token = 4 characters)
- **Output Tokens**: Estimated based on model defaults (~2000 tokens)
- **Cost Calculation**: `(Input Cost + Output Cost) × 1.2 (20% buffer)`
- **Minimum Cost**: $0.01 USDC per request

### Model Pricing

| Model | Input (per 1M) | Output (per 1M) |
|-------|---------------|----------------|
| Claude Opus 4.1 | $15.00 | $75.00 |
| GPT-5 | $4.50 | $6.75 |
| o4-mini | $2.20 | $3.30 |
| Gemini 2.5 Flash | FREE | FREE |

## 📝 Contract Address

**Contract Address**: `6z4aGvKAuqbdXoUaHw4VEUq6mU8WpmgPG3sC4dkspump`

## 🔐 x402 Payment Protocol

PayPerUse uses the **x402 payment standard**, an internet-native payment protocol that enables:

- **No Account Required**: Direct wallet-to-service payments
- **Instant Verification**: Fast payment confirmation (~200ms)
- **Standardized Format**: Works across different services
- **Blockchain Agnostic**: Can work on multiple chains

## 📚 Documentation

For complete documentation, including:
- Detailed API reference
- Technical architecture
- Troubleshooting guide
- FAQ

See the [Complete Documentation](./public/DOCUMENTATION.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

## 🔗 Links

- **GitHub**: [github.com/howlily/spectral402](https://github.com/howlily/spectral402)
- **x402 Protocol**: Learn more about the payment standard

---

**Made with ❤️ in Stockholm, Sweden**
