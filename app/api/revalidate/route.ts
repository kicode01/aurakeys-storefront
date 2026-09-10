import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
    const topicHeader = req.headers.get("x-shopify-topic");
    const secret = process.env.SHOPIFY_REVALIDATION_SECRET;

    // Validate webhook HMAC signature if secret is defined
    if (secret && hmacHeader) {
      const generatedHash = crypto
        .createHmac("sha256", secret)
        .update(rawBody, "utf8")
        .digest("base64");

      if (generatedHash !== hmacHeader) {
        return NextResponse.json(
          { error: "Invalid HMAC signature" },
          { status: 401 }
        );
      }
    }

    // Trigger instant ISR revalidation for the "products" cache tag
    revalidateTag("products");

    console.log(`[Shopify Webhook] Successfully revalidated products cache tag for topic: ${topicHeader}`);

    return NextResponse.json({
      revalidated: true,
      topic: topicHeader,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("[Shopify Webhook Error]:", error);
    return NextResponse.json(
      { error: "Error during revalidation" },
      { status: 500 }
    );
  }
}
