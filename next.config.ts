import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { isIndexingAllowed } from "./src/lib/flags";

const nextConfig: NextConfig = {
  headers() {
    if (isIndexingAllowed()) {
      return [];
    }

    return [
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
