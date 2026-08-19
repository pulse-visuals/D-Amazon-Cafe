import type { MetadataRoute } from "next";
import { getCategories } from "@/lib/menu";

// Regenerate per-request instead of baking category URLs in at build time —
// the build environment (e.g. Railway, Vercel, CI) doesn't have a seeded
// database available, only the running server does.
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getCategories();

  const staticRoutes = ["", "/menu", "/about", "/location", "/contact", "/terms", "/privacy", "/refund-policy", "/payment-policy"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${SITE_URL}/menu/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes];
}
