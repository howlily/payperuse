"use client";

import { useX402Payment } from "./useX402Payment";
import { useState } from "react";

interface APIResponse<T = any> {
  data?: T;
  error?: string;
  paymentDetails?: {
    signature: string;
    amount: number;
    amountSOL: number;
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
    console.log("[x402 API] callAPI called for endpoint:", endpoint);
    setIsCalling(true);

    try {
      // Check if this is a free model before making the request
      let isFreeModel = false;
      try {
        const requestBody = options?.body ? JSON.parse(options.body as string) : {};
        isFreeModel = requestBody.model === "gemini-2.5-flash";
        console.log("[x402 API] Model:", requestBody.model, "Is free:", isFreeModel);
      } catch {
        // If parsing fails, continue normally
      }

      // First attempt - might get 402 (but shouldn't for free models)
      console.log("[x402 API] Making initial request to:", endpoint);
      let response = await fetch(endpoint, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      console.log("[x402 API] Initial response status:", response.status);

      // If we get 402, handle payment (skip for free models)
      if (response.status === 402) {
        console.log("[x402 API] Received 402 - payment required");
        // For free models, backend should never return 402, but if it does, return error
        if (isFreeModel) {
          const errorData = await response.json();
          console.error("[x402 API] Unexpected 402 for free model");
          return {
            error: errorData.error || "Unexpected payment request for free model",
          };
        }
        
        // Paid model - proceed with payment
        const quoteData = await response.json();
        console.log("[x402 API] Payment quote received:", quoteData);
        console.log("[x402 API] Calling makePayment with quote...");
        
        // Make payment: pass the quote directly (we already have it from the 402 response)
        const paymentResult = await makePayment(quoteData, "/api/x402");
        console.log("[x402 API] Payment result:", paymentResult);

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

