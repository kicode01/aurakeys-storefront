import { getProductsQuery } from "./queries";
import { Product, ShopifyProductsOperation } from "./types";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION || "2024-10";

// Fallback high-end artisanal keyboards for local dev & demo presentation
export const LUXURY_KEYBOARD_PRODUCTS: Product[] = [
  {
    id: "gid://shopify/Product/aura-titan-65",
    handle: "aura-titan-65",
    title: "Aura Titan-65 Custom Mechanical",
    description: "Solid CNC-milled 6063 aerospace aluminum chassis with mirror-polished PVD brass weight and gasket-mounted acoustic dampening.",
    availableForSale: true,
    tags: ["65%", "Brass Weight", "Hot-Swap", "Flagship"],
    featuredImage: {
      url: "/images/products/titan-65.jpg",
      altText: "Aura Titan-65 Mechanical Keyboard in Obsidian Black with Brass Front Accent",
      width: 1920,
      height: 1080,
    },
    priceRange: {
      minVariantPrice: { amount: "485.00", currencyCode: "USD" },
      maxVariantPrice: { amount: "545.00", currencyCode: "USD" },
    },
    variants: {
      edges: [
        {
          node: {
            id: "gid://shopify/ProductVariant/titan-65-tactile",
            title: "Obsidian Black / Aura Holy Panda Tactile",
            availableForSale: true,
            selectedOptions: [
              { name: "Color", value: "Obsidian Black" },
              { name: "Switch", value: "Aura Tactile 67g" },
            ],
            price: { amount: "485.00", currencyCode: "USD" },
          },
        },
        {
          node: {
            id: "gid://shopify/ProductVariant/titan-65-linear",
            title: "Nebula Silver / Lubed Gateron Oil Kings",
            availableForSale: true,
            selectedOptions: [
              { name: "Color", value: "Nebula Silver" },
              { name: "Switch", value: "Aura Linear 62g" },
            ],
            price: { amount: "515.00", currencyCode: "USD" },
          },
        },
        {
          node: {
            id: "gid://shopify/ProductVariant/titan-65-clicky",
            title: "Brushed Brass Edition / Box Navy Click",
            availableForSale: true,
            selectedOptions: [
              { name: "Color", value: "Raw Brass" },
              { name: "Switch", value: "Bespoke Clicky" },
            ],
            price: { amount: "545.00", currencyCode: "USD" },
          },
        },
      ],
    },
  },
  {
    id: "gid://shopify/Product/aura-solaris-75",
    handle: "aura-solaris-75",
    title: "Aura Solaris-75 Rotary Edition",
    description: "Precision stepped rotary encoder crafted from knurled gold brass, leaf-spring flex cut PCB, and magnetic daughterboard.",
    availableForSale: true,
    tags: ["75%", "Rotary Encoder", "Gasket", "Best Seller"],
    featuredImage: {
      url: "/images/products/solaris-75.jpg",
      altText: "Aura Solaris-75 Rotary Encoder Keyboard in Champagne Gold",
      width: 1920,
      height: 1080,
    },
    priceRange: {
      minVariantPrice: { amount: "560.00", currencyCode: "USD" },
      maxVariantPrice: { amount: "620.00", currencyCode: "USD" },
    },
    variants: {
      edges: [
        {
          node: {
            id: "gid://shopify/ProductVariant/solaris-75-linear",
            title: "Deep Space Charcoal / Silent Black Inks",
            availableForSale: true,
            selectedOptions: [
              { name: "Color", value: "Space Charcoal" },
              { name: "Switch", value: "Silent Linear" },
            ],
            price: { amount: "560.00", currencyCode: "USD" },
          },
        },
        {
          node: {
            id: "gid://shopify/ProductVariant/solaris-75-tactile",
            title: "Champagne Gold / Lubed Boba U4T",
            availableForSale: true,
            selectedOptions: [
              { name: "Color", value: "Champagne Gold" },
              { name: "Switch", value: "Thock Tactile" },
            ],
            price: { amount: "620.00", currencyCode: "USD" },
          },
        },
      ],
    },
  },
  {
    id: "gid://shopify/Product/aura-nocturne-pad",
    handle: "aura-nocturne-pad",
    title: "Aura Nocturne Macro Pad & Volume Node",
    description: "9-key ortholinear hot-swap macro matrix with an ultra-smooth dual-bearing volume wheel and custom OLED telemetry screen.",
    availableForSale: true,
    tags: ["Macro Pad", "OLED Display", "Artisan", "New"],
    featuredImage: {
      url: "/images/products/nocturne-pad.jpg",
      altText: "Aura Nocturne Macro Pad with Brass Volume Knob and OLED Screen",
      width: 1920,
      height: 1080,
    },
    priceRange: {
      minVariantPrice: { amount: "195.00", currencyCode: "USD" },
      maxVariantPrice: { amount: "220.00", currencyCode: "USD" },
    },
    variants: {
      edges: [
        {
          node: {
            id: "gid://shopify/ProductVariant/nocturne-standard",
            title: "Midnight Onyx",
            availableForSale: true,
            selectedOptions: [
              { name: "Color", value: "Midnight Onyx" },
              { name: "Switch", value: "Aura Linear 62g" },
            ],
            price: { amount: "195.00", currencyCode: "USD" },
          },
        },
      ],
    },
  },
  {
    id: "gid://shopify/Product/aura-aegis-tkl",
    handle: "aura-aegis-tkl",
    title: "Aura Aegis Tenkeyless Masterpiece",
    description: "Unibody seamless bottom case with integrated acoustic resonance chamber for the quintessential deep thock sound profile.",
    availableForSale: true,
    tags: ["TKL", "Resonance Chamber", "Flagship"],
    featuredImage: {
      url: "/images/products/aegis-tkl.jpg",
      altText: "Aura Aegis Tenkeyless Keyboard in Gunmetal Slate",
      width: 1920,
      height: 1080,
    },
    priceRange: {
      minVariantPrice: { amount: "680.00", currencyCode: "USD" },
      maxVariantPrice: { amount: "740.00", currencyCode: "USD" },
    },
    variants: {
      edges: [
        {
          node: {
            id: "gid://shopify/ProductVariant/aegis-tkl-tactile",
            title: "Gunmetal Slate / Hand-Lubed Zealio V2",
            availableForSale: true,
            selectedOptions: [
              { name: "Color", value: "Gunmetal Slate" },
              { name: "Switch", value: "Ultra Tactile 65g" },
            ],
            price: { amount: "680.00", currencyCode: "USD" },
          },
        },
      ],
    },
  },
];

export async function shopifyFetch<T>({
  query,
  variables,
  tags,
  cache = "force-cache",
}: {
  query: string;
  variables?: Record<string, unknown>;
  tags?: string[];
  cache?: RequestCache;
}): Promise<T> {
  // Validate presence of credentials
  if (!domain || !storefrontAccessToken || storefrontAccessToken.includes("demo")) {
    // If not connected to live Shopify or running demo, return mock schema directly
    if (query.includes("query getProducts")) {
      return {
        data: {
          products: {
            edges: LUXURY_KEYBOARD_PRODUCTS.map((p) => ({ node: p })),
          },
        },
      } as unknown as T;
    }
    throw new Error("Shopify credentials not configured in .env.local");
  }

  const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
      cache,
      next: {
        tags,
        revalidate: 3600, // Revalidate hourly or on webhook trigger
      },
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();

    if (json.errors) {
      console.error("Shopify GraphQL errors:", json.errors);
      throw new Error(json.errors[0]?.message || "Shopify GraphQL error");
    }

    return json as T;
  } catch (error) {
    console.warn("Shopify API request failed, falling back to local dataset:", error);
    if (query.includes("query getProducts")) {
      return {
        data: {
          products: {
            edges: LUXURY_KEYBOARD_PRODUCTS.map((p) => ({ node: p })),
          },
        },
      } as unknown as T;
    }
    throw error;
  }
}

/**
 * Fetch the first 10 luxury keyboard products
 */
export async function getProducts(first: number = 10): Promise<Product[]> {
  try {
    const res = await shopifyFetch<ShopifyProductsOperation>({
      query: getProductsQuery,
      variables: { first },
      tags: ["products"],
    });

    return res.data.products.edges.map((edge) => edge.node);
  } catch (err) {
    console.error("Error in getProducts:", err);
    return LUXURY_KEYBOARD_PRODUCTS.slice(0, first);
  }
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  // In a real app, you would run a GraphQL query by handle.
  // We'll just return from the mock data to simulate.
  const products = await getProducts(100);
  return products.find(p => p.handle === handle);
}
