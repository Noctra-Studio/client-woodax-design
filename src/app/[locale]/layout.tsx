import type { Metadata, Viewport } from "next";
import { Quicksand } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { NavLogoPreload } from "@/components/brand/nav-logo-preload";
import {
  CookieConsentChrome,
  CookieConsentProvider,
} from "@/components/consent/cookie-consent-provider";
import { PrivacyDialogProvider } from "@/features/privacy/privacy-dialog-provider";
import { routing } from "@/i18n/routing";
import { consentBootstrapScript } from "@/lib/consent-bootstrap";
import { clientEnv } from "@/lib/env";
import { requestSite } from "@/lib/request-site";
import { isIndexingAllowed, localizedMetadata } from "@/lib/seo";
import "../globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  style: "normal",
  variable: "--font-quicksand",
  display: "swap",
});

export const maxDuration = 15;
export const preferredRegion = "iad1";

export async function generateViewport(): Promise<Viewport> {
  const site = await requestSite();
  const color = site === "cnc" ? "#16171A" : "#F3F1EA";

  return {
    viewportFit: "cover",
    interactiveWidget: "resizes-content",
    themeColor: [
      { media: "(prefers-color-scheme: light)", color },
      { media: "(prefers-color-scheme: dark)", color },
    ],
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: requested } = await params;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  const site = await requestSite();
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = site === "cnc" ? t("cnc.title") : t("design.title");
  const description =
    site === "cnc" ? t("cnc.description") : t("design.description");

  return {
    ...localizedMetadata({ site, locale, title, description }),
    ...(isIndexingAllowed() ? {} : { robots: { index: false, follow: false } }),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const site = await requestSite();

  return (
    <html
      lang={locale}
      className={`${quicksand.variable} h-full antialiased [-webkit-tap-highlight-color:transparent]`}
    >
      <body
        data-site={site}
        className="flex min-h-svh touch-manipulation flex-col pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] font-sans"
      >
        <NavLogoPreload variant={site} />
        <NextIntlClientProvider>
          <CookieConsentProvider variant={site}>
            <PrivacyDialogProvider variant={site}>
              {children}
              <CookieConsentChrome />
            </PrivacyDialogProvider>
          </CookieConsentProvider>
        </NextIntlClientProvider>
        <Script
          id="woodax-consent"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: consentBootstrapScript({
              gaId: clientEnv.NEXT_PUBLIC_GA_ID,
              loadGa:
                clientEnv.NEXT_PUBLIC_APP_ENV === "production" &&
                Boolean(clientEnv.NEXT_PUBLIC_GA_ID),
            }),
          }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
