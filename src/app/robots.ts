import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { clientEnv } from "@/lib/env";
import { siteOrigin } from "@/lib/seo";
import { getSite, hostFromHeaders } from "@/lib/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerStore = await headers();
  const site = getSite(hostFromHeaders(headerStore));
  const indexable =
    clientEnv.NEXT_PUBLIC_APP_ENV === "production" && site === "cnc";

  if (!indexable) {
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
    sitemap: `${siteOrigin("cnc")}/sitemap.xml`,
  };
}
