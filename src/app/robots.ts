import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { clientEnv } from "@/lib/env";
import { isIndexingAllowed, siteOrigin } from "@/lib/seo";
import { allowsPreviewSiteOverride, getSite, hostFromHeaders } from "@/lib/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerStore = await headers();
  const host = hostFromHeaders(headerStore);
  const site = getSite(host);
  const isProduction =
    clientEnv.NEXT_PUBLIC_APP_ENV === "production" &&
    !allowsPreviewSiteOverride(host);

  if (!isProduction) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    ...(isIndexingAllowed()
      ? { sitemap: `${siteOrigin(site)}/sitemap.xml` }
      : {}),
  };
}
