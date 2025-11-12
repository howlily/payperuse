import { NextRequest, NextResponse } from "next/server";

// This is a protected API endpoint that requires x402 payment
// It uses the x402 endpoint to verify payments

// LLM Provider Configuration
const LLM_CONFIG = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://api.openai.com/v1",
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseURL: "https://api.anthropic.com/v1",
  },
  google: {
    apiKey: process.env.GOOGLE_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta",
  },
};

// Token pricing per 1M tokens (input/output) in USD
// Prices are approximate and should be updated based on current API pricing
const MODEL_PRICING: Record<string, { input: number; output: number; provider: string; model: string }> = {
  "claude-opus-4.1": {
    provider: "anthropic",
    model: "claude-opus-4-1-20250805",
    input: 15.0, // $15 per 1M input tokens
    output: 75.0, // $75 per 1M output tokens
  },
  "gpt-5": {
    provider: "openai",
    model: "gpt-5", // Using GPT-4o as GPT-5 doesn't exist yet
    input: 4.5, // $4.5 per 1M input tokens
    output: 6.75, // $6.75 per 1M output tokens
  },
  "o4-mini": {
    provider: "openai",
    model: "o4-mini", // Using o1-preview as o4-mini doesn't exist yet
    input: 2.2, // $2.2 per 1M input tokens
    output: 3.3, // $3.3 per 1M output tokens
  },
  "gemini-2.5-flash": {
    provider: "google",
    model: "gemini-2.5-flash", // Using Gemini 2.5 Flash (free tier)
    input: 0.0, // Free tier
    output: 0.0, // Free tier
  },
};

// Estimate tokens (rough approximation: 1 token ≈ 4 characters)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Calculate estimated cost in USDC (direct USD pricing, no conversion needed)
function calculateEstimatedCost(modelKey: string, message: string, maxOutputTokens: number = 2000): number {
  const pricing = MODEL_PRICING[modelKey];
  if (!pricing) return 0.10; // Default fallback in USDC

  const inputTokens = estimateTokens(message);
  const estimatedOutputTokens = maxOutputTokens;

  // Calculate cost in USD (which equals USDC)
  const inputCostUSD = (inputTokens / 1_000_000) * pricing.input;
  const outputCostUSD = (estimatedOutputTokens / 1_000_000) * pricing.output;
  const totalCostUSD = (inputCostUSD + outputCostUSD) * 1.2; // Add 20% buffer
  
  // Minimum cost of 0.01 USDC
  return Math.max(totalCostUSD, 0.01);
}

// Calculate actual cost based on token usage (in USDC)
function calculateActualCost(modelKey: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[modelKey];
  if (!pricing) return 0.10;

  // Calculate cost in USD (which equals USDC)
  const inputCostUSD = (inputTokens / 1_000_000) * pricing.input;
  const outputCostUSD = (outputTokens / 1_000_000) * pricing.output;
  const totalCostUSD = inputCostUSD + outputCostUSD;
  
  return Math.max(totalCostUSD, 0.01);
}

interface LLMResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
}

async function callOpenAI(model: string, message: string): Promise<LLMResponse> {
  if (!LLM_CONFIG.openai.apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  console.log(`[OpenAI API] Calling model: ${model}`);

  // Handle different model types which use different parameters
  const isO1Model = model.startsWith("o1");
  const isO4Model = model.startsWith("o4");
  const isGpt5Model = model === "gpt-5" || model.startsWith("gpt-5");
  
  console.log(`[OpenAI API] Model type detection - isO1: ${isO1Model}, isO4: ${isO4Model}, isGpt5: ${isGpt5Model}`);
  
  const requestBody: any = {
    model,
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
  };

  if (isO4Model || isGpt5Model) {
    // o4 models and gpt-5 use max_completion_tokens instead of max_tokens
    // Note: gpt-5 and o4 models don't support temperature parameter (only default value of 1)
    requestBody.max_completion_tokens = 2000;
    console.log(`[OpenAI API] Using max_completion_tokens for model: ${model} (no temperature parameter)`);
  } else if (!isO1Model) {
    // Regular older models (gpt-4, etc.) use max_tokens and temperature
    requestBody.temperature = 0.7;
    requestBody.max_tokens = 2000;
    console.log(`[OpenAI API] Using max_tokens and temperature for model: ${model}`);
  } else {
    console.log(`[OpenAI API] No max_tokens/max_completion_tokens for o1 model: ${model}`);
  }
  // o1 models don't need max_tokens or max_completion_tokens
  
  console.log(`[OpenAI API] Request body:`, JSON.stringify(requestBody, null, 2));

  const response = await fetch(`${LLM_CONFIG.openai.baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LLM_CONFIG.openai.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0]?.message?.content || "No response generated",
    inputTokens: data.usage?.prompt_tokens || estimateTokens(message),
    outputTokens: data.usage?.completion_tokens || 0,
  };
}

async function callAnthropic(model: string, message: string): Promise<LLMResponse> {
  if (!LLM_CONFIG.anthropic.apiKey) {
    throw new Error("Anthropic API key not configured");
  }

  const response = await fetch(`${LLM_CONFIG.anthropic.baseURL}/messages`, {
    method: "POST",
    headers: {
      "x-api-key": LLM_CONFIG.anthropic.apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    content: data.content[0]?.text || "No response generated",
    inputTokens: data.usage?.input_tokens || estimateTokens(message),
    outputTokens: data.usage?.output_tokens || 0,
  };
}

async function callGoogle(model: string, message: string): Promise<LLMResponse> {
  if (!LLM_CONFIG.google.apiKey) {
    throw new Error("Google API key not configured");
  }

  console.log(`[Google API] Calling model: ${model}`);
  console.log(`[Google API] Message length: ${message.length} characters`);

  // Use the newer Gemini API format
  const apiUrl = `${LLM_CONFIG.google.baseURL}/models/${model}:generateContent?key=${LLM_CONFIG.google.apiKey}`;
  console.log(`[Google API] URL: ${apiUrl.replace(LLM_CONFIG.google.apiKey, "***")}`);
  
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: message,
          },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens: 2000,
      temperature: 0.7,
    },
  };

  console.log(`[Google API] Request body:`, JSON.stringify(requestBody, null, 2));

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Google API error: ${response.status}`;
    try {
      const errorData = JSON.parse(errorText);
      errorMessage += ` - ${errorData.error?.message || errorText}`;
    } catch {
      errorMessage += ` - ${errorText}`;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log("[Google API] Response data:", JSON.stringify(data, null, 2));
  
  // Check if there are any candidates
  if (!data.candidates || data.candidates.length === 0) {
    console.error("[Google API] No candidates in response:", data);
    throw new Error("No response candidates from Google API");
  }

  // Check for finish reason (might indicate blocking)
  const finishReason = data.candidates[0]?.finishReason;
  if (finishReason && finishReason !== "STOP") {
    console.warn(`[Google API] Finish reason: ${finishReason}`);
  }

  const content = data.candidates[0]?.content?.parts?.[0]?.text || "No response generated";
  
  if (content === "No response generated") {
    console.error("[Google API] No text content in response:", data);
    throw new Error("No text content in Google API response");
  }
  
  return {
    content,
    inputTokens: data.usageMetadata?.promptTokenCount || estimateTokens(message),
    outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
  };
}

async function callLLM(provider: string, model: string, message: string): Promise<LLMResponse> {
  switch (provider) {
    case "openai":
      return await callOpenAI(model, message);
    case "anthropic":
      return await callAnthropic(model, message);
    case "google":
      return await callGoogle(model, message);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, model: modelKey } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Check if model is supported
    const modelConfig = MODEL_PRICING[modelKey];
    if (!modelConfig) {
      return NextResponse.json(
        { error: `Unknown model: ${modelKey}` },
        { status: 400 }
      );
    }

    // Check if this is a free model (no payment required)
    const isFreeModel = modelConfig.input === 0 && modelConfig.output === 0;
    
    console.log(`[AI API] Model: ${modelKey}, IsFreeModel: ${isFreeModel}`);
    
    // Check if payment was made by verifying with x402 endpoint
    const xPaymentHeader = request.headers.get("X-Payment");
    
    // Skip payment for free models
    if (isFreeModel) {
      console.log(`[AI API] Processing free model ${modelKey} - skipping payment`);
      // For free models, proceed directly to LLM call
      const providerConfig = LLM_CONFIG[modelConfig.provider as keyof typeof LLM_CONFIG];
      if (!providerConfig?.apiKey) {
        return NextResponse.json(
          {
            error: `${modelConfig.provider} API key not configured`,
            details: `Please set ${modelConfig.provider.toUpperCase()}_API_KEY environment variable`,
          },
          { status: 500 }
        );
      }

      // Call the actual LLM API
      try {
        const llmResponse = await callLLM(
          modelConfig.provider,
          modelConfig.model,
          message
        );

        const aiResponse = {
          response: llmResponse.content,
          model: `${modelConfig.provider}/${modelConfig.model}`,
          timestamp: new Date().toISOString(),
          usage: {
            inputTokens: llmResponse.inputTokens,
            outputTokens: llmResponse.outputTokens,
            totalTokens: llmResponse.inputTokens + llmResponse.outputTokens,
          },
          cost: {
            estimated: 0,
            actual: 0,
            currency: "USDC",
          },
        };

        return NextResponse.json({
          success: true,
          data: aiResponse,
        });
      } catch (llmError) {
        console.error(`[AI API] Error calling LLM for free model ${modelKey}:`, llmError);
        return NextResponse.json(
          {
            error: "LLM API error",
            details: llmError instanceof Error ? llmError.message : "Unknown error",
            model: modelKey,
          },
          { status: 500 }
        );
      }
    }
    
    if (!xPaymentHeader) {
      // Calculate estimated cost and return 402 with payment requirements
      const estimatedCost = calculateEstimatedCost(modelKey, message);
      
      const baseUrl = request.nextUrl.origin;
      const quoteResponse = await fetch(`${baseUrl}/api/x402`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: estimatedCost,
          model: modelKey,
        }),
      });
      
      if (quoteResponse.status === 402) {
        const quote = await quoteResponse.json();
        return NextResponse.json(quote, { status: 402 });
      }
      
      // Fallback quote - need to get recipient token account
      const { getAssociatedTokenAddress } = await import("@solana/spl-token");
      const { PublicKey } = await import("@solana/web3.js");
      const USDC_MINT_MAINNET = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
      const USDC_MINT_DEVNET = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
      const USDC_DECIMALS = 6;
      const cluster = process.env.SOLANA_CLUSTER || "mainnet-beta";
      const usdcMint = cluster === "mainnet-beta" ? USDC_MINT_MAINNET : USDC_MINT_DEVNET;
      const recipientWallet = new PublicKey(process.env.X402_RECIPIENT_WALLET || "seFkxFkXEY9JGEpCyPfCWTuPZG9WK6ucf95zvKCfsRX");
      const recipientTokenAccount = await getAssociatedTokenAddress(usdcMint, recipientWallet);
      const amountUSDC = Math.floor(estimatedCost * Math.pow(10, USDC_DECIMALS)); // Convert to smallest units
      
      return NextResponse.json(
        {
          payment: {
            recipientWallet: recipientWallet.toBase58(),
            tokenAccount: recipientTokenAccount.toBase58(),
            mint: usdcMint.toBase58(),
            amount: amountUSDC, // Amount in USDC smallest units (6 decimals)
            amountUSDC: estimatedCost,
            cluster: cluster,
            message: `Payment required: ${estimatedCost.toFixed(2)} USDC for ${modelKey}`,
            scheme: "exact",
            model: modelKey,
            estimatedTokens: estimateTokens(message),
          },
        },
        { status: 402 }
      );
    }

    // Verify payment by forwarding to x402 endpoint
    const baseUrl = request.nextUrl.origin;
    const verifyResponse = await fetch(`${baseUrl}/api/x402`, {
      method: "POST",
      headers: {
        "X-Payment": xPaymentHeader,
        "Content-Type": "application/json",
      },
    });

    if (verifyResponse.status !== 200) {
      const error = await verifyResponse.json();
      return NextResponse.json(
        {
          error: error.error || "Payment verification failed",
          details: error.details,
        },
        { status: 402 }
      );
    }

    const paymentData = await verifyResponse.json();
    const paidAmount = paymentData.paymentDetails?.amountUSDC || 0.10;

    // Payment verified successfully - now call the LLM
    const providerConfig = LLM_CONFIG[modelConfig.provider as keyof typeof LLM_CONFIG];
    if (!providerConfig?.apiKey) {
      return NextResponse.json(
        {
          error: `${modelConfig.provider} API key not configured`,
          details: `Please set ${modelConfig.provider.toUpperCase()}_API_KEY environment variable`,
        },
        { status: 500 }
      );
    }

    // Call the actual LLM API
    const llmResponse = await callLLM(
      modelConfig.provider,
      modelConfig.model,
      message
    );

    // Calculate actual cost
    const actualCost = calculateActualCost(
      modelKey,
      llmResponse.inputTokens,
      llmResponse.outputTokens
    );

    // Verify payment covers actual cost (allow 10% tolerance for estimation errors)
    if (paidAmount < actualCost * 0.9) {
      return NextResponse.json(
        {
          error: "Insufficient payment",
          details: `Paid ${paidAmount.toFixed(2)} USDC, but actual cost is ${actualCost.toFixed(2)} USDC`,
          actualCost,
          paidAmount,
        },
        { status: 402 }
      );
    }

    const aiResponse = {
      response: llmResponse.content,
      model: `${modelConfig.provider}/${modelConfig.model}`,
      timestamp: new Date().toISOString(),
      usage: {
        inputTokens: llmResponse.inputTokens,
        outputTokens: llmResponse.outputTokens,
        totalTokens: llmResponse.inputTokens + llmResponse.outputTokens,
      },
      cost: {
        estimated: paidAmount,
        actual: actualCost,
        currency: "USDC",
      },
    };

    return NextResponse.json({
      success: true,
      data: aiResponse,
    });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
