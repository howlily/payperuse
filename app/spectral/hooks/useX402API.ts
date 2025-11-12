"use client";

import { useX402Payment } from "./useX402Payment";
import { useState } from "react";

interface APIResponse<T = any> {
  data?: T;
  error?: string;
  paymentDetails?: {
    signature: string;
    amount: number;
    amountUSDC: number;
    recipient: string;
    explorerUrl: string;
  };
}

/**
 * Hook for making API calls with automatic x402 payment handling
 */
export function useX402API() {
  const { makePayment, isProcessing } = useX402Payment();
  const [isCalling, setIsCalling] = useState(false);

  const callAPI = async <T = any>(
    endpoint: string,
    options?: RequestInit
  ): Promise<APIResponse<T>> => {
    setIsCalling(true);

    try {
      // Check if this is a free model before making the request
      let isFreeModel = false;
      try {
        const requestBody = options?.body ? JSON.parse(options.body as string) : {};
        isFreeModel = requestBody.model === "gemini-2.5-flash";
      } catch {
        // If parsing fails, continue normally
      }

      // First attempt - might get 402 (but shouldn't for free models)
      let response = await fetch(endpoint, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      // If we get 402, handle payment (skip for free models)
      if (response.status === 402) {
        // For free models, backend should never return 402, but if it does, return error
        if (isFreeModel) {
          const errorData = await response.json();
          return {
            error: errorData.error || "Unexpected payment request for free model",
          };
        }
        
        // Paid model - proceed with payment
        const quoteData = await response.json();
        
        // Make payment: get quote from endpoint, then pay via /api/x402
        const paymentResult = await makePayment(endpoint, "/api/x402");

        if (!paymentResult.success) {
          return {
            error: paymentResult.error || "Payment failed",
          };
        }

        // The payment was successful and we have the payment proof
        // Now retry the original API call with the X-Payment header
        response = await fetch(endpoint, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            "X-Payment": paymentResult.paymentProof || "", // Include payment proof
            ...options?.headers,
          },
        });
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return {
        data,
        paymentDetails: data.paymentDetails,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      setIsCalling(false);
    }
  };

  return {
    callAPI,
    isProcessing: isProcessing || isCalling,
  };
}

