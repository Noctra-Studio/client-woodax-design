import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { clientEnv } from "@/lib/env";
import { isIndexingAllowed, siteOrigin } from "@/lib/seo";
import { allowsPreviewSiteOverride, getSite, hostFromHeaders } from "@/lib/site";

const INDEXING_AGENTS = [
  "*",
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "PerplexityBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
] as const;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerStore = await headers();
  const host = hostFromHeaders(headerStore);
  const site = getSite(host);
  const isProduction =
    clientEnv.NEXT_PUBLIC_APP_ENV === "production" &&
    !allowsPreviewSiteOverride(host);

  if (!isProduction || !isIndexingAllowed()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: INDEXING_AGENTS.map((userAgent) => ({
      userAgent,
      allow: "/",
    })),
    sitemap: `${siteOrigin(site)}/sitemap.xml`,
  };
}
