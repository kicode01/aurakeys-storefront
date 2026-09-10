import { MetadataRoute } from "next";
import { getProducts } from "@/lib/shopify";

const BASE_URL = "https://aurakeys.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/studio/customizer`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/atelier`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  try {
    const products = await getProducts(100);
    const productRoutes = products.map((product) => ({
      url: `${BASE_URL}/products/${product.handle}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
    return [...routes, ...productRoutes];
  } catch (error) {
    console.error("Failed to generate sitemap for Shopify products:", error);
    return routes;
  }
}
