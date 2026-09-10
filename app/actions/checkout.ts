"use server";

import { shopifyFetch } from "@/lib/shopify";
import { createCartMutation } from "@/lib/shopify/mutations";

export interface CheckoutResponse {
  checkoutUrl?: string;
  error?: string;
}

export async function createCheckoutSession(
  lines: { merchandiseId: string; quantity: number }[]
): Promise<CheckoutResponse> {
  try {
    const res = await shopifyFetch<any>({
      query: createCartMutation,
      variables: {
        lines,
      },
      cache: "no-store", // We don't want to cache cart creations
    });

    const cart = res?.data?.cartCreate?.cart;
    const userErrors = res?.data?.cartCreate?.userErrors;

    if (userErrors && userErrors.length > 0) {
      return { error: userErrors[0].message };
    }

    if (cart?.checkoutUrl) {
      return { checkoutUrl: cart.checkoutUrl };
    }

    return { error: "Failed to generate checkout URL." };
  } catch (error: any) {
    console.error("Shopify Checkout Error:", error);
    
    // Graceful fallback for demo/development environments
    if (error.message?.includes("Shopify credentials not configured")) {
      return { error: "DEMO MODE: Live checkout is disabled because Shopify API keys are not configured in .env.local." };
    }

    return { error: error.message || "An unexpected error occurred during checkout." };
  }
}
