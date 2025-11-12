"use client";

import { useMemo } from "react";

// Model pricing per 1M tokens (input/output) in USD
// This should match the backend pricing
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "claude-opus-4.1": {
    input: 15.0,
    output: 75.0,
  },
  "gpt-5": {
    input: 4.5,
    output: 6.75,
  },
  "o4-mini": {
    input: 2.2,
    output: 3.3,
  },
  "gemini-2.5-flash": {
    input: 0.0,
    output: 0.0,
  },
};

// Estimate tokens (rough approximation: 1 token ≈ 4 characters)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

interface PriceEstimate {
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  totalCostWithBuffer: number;
}

export function usePriceEstimate(message: string, model: string, estimatedOutputTokens: number = 2000): PriceEstimate {
  return useMemo(() => {
    const pricing = MODEL_PRICING[model];
    
    if (!pricing) {
      return {
        inputTokens: 0,
        outputTokens: estimatedOutputTokens,
        inputCost: 0,
        outputCost: 0,
        totalCost: 0,
        totalCostWithBuffer: 0.01, // Minimum
      };
    }

    const inputTokens = estimateTokens(message);
    const outputTokens = estimatedOutputTokens;

    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;
    
    const totalCost = inputCost + outputCost;
    
    // Check if this is a free model
    const isFreeModel = pricing.input === 0 && pricing.output === 0;
    
    // Add 20% buffer for safety (but keep free models at 0)
    const totalCostWithBuffer = isFreeModel ? 0 : Math.max(totalCost * 1.2, 0.01); // Minimum $0.01 for paid models

    return {
      inputTokens,
      outputTokens,
      inputCost,
      outputCost,
      totalCost,
      totalCostWithBuffer,
    };
  }, [message, model, estimatedOutputTokens]);
}

