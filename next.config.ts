import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { isIndexingAllowed } from "./src/lib/flags";

const immutableAssetHeaders = [
  {
    key: "Cache-Control",
    value: "public, max-age=31536000, immutable",
  },
];

const nextConfig: NextConfig = {
  ...(process.env.QA_DIST_DIR ? { distDir: process.env.QA_DIST_DIR } : {}),
  headers() {
    const assetRules = [
      {
        source: "/media/:path*",
        headers: immutableAssetHeaders,
      },
      {
        source: "/brand/:path*",
        headers: immutableAssetHeaders,
      },
      {
        source: "/images/:path*",
        headers: immutableAssetHeaders,
      },
    ];

    if (isIndexingAllowed()) {
      return assetRules;
    }

    return [
      ...assetRules,
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
