import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { clientEnv } from "./src/lib/env";

const nextConfig: NextConfig = {
  headers() {
    if (clientEnv.NEXT_PUBLIC_APP_ENV === "production") {
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
