import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { clientEnv } from "@/lib/env";
import { requestSite } from "@/lib/request-site";
import { localizedMetadata } from "@/lib/seo";
import "../globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

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
    ...(clientEnv.NEXT_PUBLIC_APP_ENV !== "production"
      ? { robots: { index: false, follow: false } }
      : {}),
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
      className={`${outfit.variable} ${jetbrainsMono.variable} h-full antialiased [-webkit-tap-highlight-color:transparent]`}
    >
      <body
        data-site={site}
        className="flex min-h-svh touch-manipulation flex-col pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] font-sans"
      >
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
