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
    model: "claude-3-opus-20240229", // Using available model, update when 4.1 is available
    input: 15.0, // $15 per 1M input tokens
    output: 75.0, // $75 per 1M output tokens
  },
  "gpt-4-32k": {
    provider: "openai",
    model: "gpt-4-32k", // Note: This model may be deprecated, using gpt-4-turbo as fallback
    input: 60.0, // $60 per 1M input tokens
    output: 120.0, // $120 per 1M output tokens
  },
  "gpt-4.5": {
    provider: "openai",
    model: "gpt-4o", // Using GPT-4o as GPT-4.5 doesn't exist yet
    input: 5.0, // $5 per 1M input tokens
    output: 15.0, // $15 per 1M output tokens
  },
  "o1-pro": {
    provider: "openai",
    model: "o1-preview", // Using o1-preview
    input: 15.0, // $15 per 1M input tokens
    output: 60.0, // $60 per 1M output tokens (o1 models have higher output costs)
  },
  "gemini-2.5-pro": {
    provider: "google",
    model: "gemini-2.0-flash-exp", // Using available model
    input: 0.0, // Free tier
    output: 0.0, // Free tier (update with actual pricing)
  },
};

// Estimate tokens (rough approximation: 1 token ≈ 4 characters)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Calculate estimated cost in USDC
function calculateEstimatedCost(modelKey: string, message: string, maxOutputTokens: number = 2000): number {
  const pricing = MODEL_PRICING[modelKey];
  if (!pricing) return 0.01; // Default fallback

  const inputTokens = estimateTokens(message);
  const estimatedOutputTokens = maxOutputTokens;

  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (estimatedOutputTokens / 1_000_000) * pricing.output;
  
  // Add 20% buffer for safety
  const totalCost = (inputCost + outputCost) * 1.2;
  
  // Minimum cost of $0.01 USDC
  return Math.max(totalCost, 0.01);
}

// Calculate actual cost based on token usage
function calculateActualCost(modelKey: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[modelKey];
  if (!pricing) return 0.01;

  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  
  return Math.max(inputCost + outputCost, 0.01);
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

  // Handle o1 models which use different parameters
  const isO1Model = model.startsWith("o1");
  const requestBody: any = {
    model,
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
  };

  if (!isO1Model) {
    requestBody.temperature = 0.7;
    requestBody.max_tokens = 2000;
  }

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

  const response = await fetch(
    `${LLM_CONFIG.google.baseURL}/models/${model}:generateContent?key=${LLM_CONFIG.google.apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";
  
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

    // Check if payment was made by verifying with x402 endpoint
    const xPaymentHeader = request.headers.get("X-Payment");
    
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
      
      // Fallback quote
      return NextResponse.json(
        {
          payment: {
            recipientWallet: process.env.X402_RECIPIENT_WALLET || "seFkxFkXEY9JGEpCyPfCWTuPZG9WK6ucf95zvKCfsRX",
            amount: estimatedCost,
            amountUSDC: estimatedCost,
            cluster: process.env.SOLANA_CLUSTER || "devnet",
            message: `Payment required: ${estimatedCost.toFixed(4)} USDC for ${modelKey}`,
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
    const paidAmount = paymentData.paymentDetails?.amountUSDC || 0.01;

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
          details: `Paid ${paidAmount.toFixed(4)} USDC, but actual cost is ${actualCost.toFixed(4)} USDC`,
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
