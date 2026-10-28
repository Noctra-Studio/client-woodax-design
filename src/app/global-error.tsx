"use client";

import { Quicksand } from "next/font/google";
import {
  detectClientLocale,
  detectClientSite,
  FallbackRouteError,
} from "@/components/site/route-error";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  style: "normal",
  variable: "--font-quicksand",
  display: "swap",
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const site = detectClientSite();
  const locale = detectClientLocale();

  return (
    <html
      lang={locale}
      className={`${quicksand.variable} h-full antialiased [-webkit-tap-highlight-color:transparent]`}
    >
      <body
        data-site={site}
        className="flex min-h-svh touch-manipulation flex-col pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] font-sans"
      >
        <FallbackRouteError error={error} reset={reset} site={site} />
      </body>
    </html>
  );
}
