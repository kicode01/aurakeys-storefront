import { NextRequest, NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";
import { createCartMutation } from "@/lib/shopify/mutations";

interface CheckoutRequestBody {
  lines: Array<{
    merchandiseId: string;
    quantity: number;
  }>;
}

interface ShopifyCartCreateResponse {
  data: {
    cartCreate: {
      cart: {
        id: string;
        checkoutUrl: string;
      } | null;
      userErrors: Array<{
        field: string[];
        message: string;
      }>;
    };
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: CheckoutRequestBody = await req.json();

    if (!body.lines || body.lines.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

    // Check if real Shopify credentials exist
    if (!domain || !token || token.includes("demo")) {
      // Demo checkout simulation
      return NextResponse.json({
        checkoutUrl: `https://checkout.shopify.com/demo/aurakeys?session=${Date.now()}&items=${body.lines.length}`,
        isDemo: true,
      });
    }

    // Live Shopify Storefront cartCreate GraphQL call
    const result = await shopifyFetch<ShopifyCartCreateResponse>({
      query: createCartMutation,
      variables: {
        lines: body.lines,
      },
      cache: "no-store",
    });

    const cart = result.data?.cartCreate?.cart;
    const userErrors = result.data?.cartCreate?.userErrors;

    if (userErrors && userErrors.length > 0) {
      return NextResponse.json(
        { error: userErrors[0].message },
        { status: 422 }
      );
    }

    if (!cart?.checkoutUrl) {
      throw new Error("No checkout URL returned by Shopify");
    }

    return NextResponse.json({
      checkoutUrl: cart.checkoutUrl,
      isDemo: false,
    });
  } catch (err: unknown) {
    console.error("[Checkout API Error]:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to initiate Shopify checkout" },
      { status: 500 }
    );
  }
}
