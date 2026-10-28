"use client";

import { useEffect } from "react";
import { hasLocale, useLocale, useTranslations } from "next-intl";
import { AnalyticsButton } from "@/components/analytics/tracked-link";
import { Button } from "@/components/ui/button";
import { routing, type Locale } from "@/i18n/routing";
import { fraunces } from "@/lib/font-design";
import type { Site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { whatsappHref } from "@/lib/whatsapp";
import enMessages from "@/messages/en.json";
import esMessages from "@/messages/es.json";

export function detectClientSite(preferred?: Site): Site {
  if (preferred) return preferred;
  try {
    if (typeof document !== "undefined") {
      const attr = document.body?.dataset?.site;
      if (attr === "cnc" || attr === "design") return attr;
    }
    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      if (host.startsWith("cnc.")) return "cnc";
      if (window.location.pathname.includes("/cnc")) return "cnc";
      const params = new URLSearchParams(window.location.search);
      if (params.get("site") === "cnc") return "cnc";
    }
  } catch {
    // Default to design when DOM/location access is restricted.
  }
  return "design";
}

export function detectClientLocale(): Locale {
  try {
    if (typeof document !== "undefined") {
      const lang = document.documentElement?.lang;
      if (hasLocale(routing.locales, lang)) return lang;
    }
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path === "/en" || path.startsWith("/en/")) return "en";
    }
  } catch {
    // Default to Spanish.
  }
  return routing.defaultLocale;
}

export function RouteErrorView({
  site,
  locale,
  title,
  body,
  retryLabel,
  whatsappLabel,
  reset,
}: {
  site: Site;
  locale: Locale;
  title: string;
  body: string;
  retryLabel: string;
  whatsappLabel: string;
  reset: () => void;
}) {
  const isDesign = site === "design";
  const href = whatsappHref(site, locale);
  const primaryVariant = isDesign ? "design-primary" : "cnc-primary";
  const secondaryVariant = isDesign ? "design-secondary" : "cnc-secondary";

  return (
    <main
      data-site={site}
      className={cn(
        "mx-auto flex w-full max-w-[62ch] flex-1 flex-col items-start justify-center gap-6 px-5 py-24",
        isDesign
          ? `${fraunces.variable} bg-woodax-paper text-woodax-charcoal`
          : "bg-cnc-bg text-cnc-text",
      )}
    >
      <h1
        className={cn(
          "text-[clamp(1.875rem,4vw,3rem)] leading-[1.05] text-balance",
          isDesign
            ? "font-serif font-light tracking-[-0.01em]"
            : "font-normal tracking-[-0.02em]",
        )}
      >
        {title}
      </h1>
      <p
        className={cn(
          "text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.6] font-medium text-pretty",
          isDesign ? "text-woodax-charcoal/85" : "text-cnc-muted",
        )}
      >
        {body}
      </p>
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button
          type="button"
          variant={secondaryVariant}
          onClick={() => reset()}
        >
          {retryLabel}
        </Button>
        {href ? (
          <AnalyticsButton
            href={href}
            variant={primaryVariant}
            arrow
            target="_blank"
            rel="noopener noreferrer"
            aria-label={whatsappLabel}
            tracking={{
              event: "whatsapp_click",
              params: { site, location: "contact" },
            }}
          >
            {whatsappLabel}
          </AnalyticsButton>
        ) : null}
      </div>
    </main>
  );
}

export function RouteError({
  error,
  reset,
  site: preferredSite,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  site?: Site;
}) {
  const rawLocale = useLocale();
  const locale: Locale = hasLocale(routing.locales, rawLocale)
    ? rawLocale
    : routing.defaultLocale;
  const t = useTranslations("common.error");
  const site = detectClientSite(preferredSite);

  useEffect(() => {
    console.error("route error boundary", error.digest ?? error.name);
  }, [error]);

  return (
    <RouteErrorView
      site={site}
      locale={locale}
      title={t("title")}
      body={t("body")}
      retryLabel={t("retry")}
      whatsappLabel={t("whatsapp")}
      reset={reset}
    />
  );
}

export function FallbackRouteError({
  error,
  reset,
  site: preferredSite,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  site?: Site;
}) {
  const site = detectClientSite(preferredSite);
  const locale = detectClientLocale();
  const dict =
    locale === "en" ? enMessages.common.error : esMessages.common.error;

  useEffect(() => {
    console.error("global error boundary", error.digest ?? error.name);
  }, [error]);

  return (
    <RouteErrorView
      site={site}
      locale={locale}
      title={dict.title}
      body={dict.body}
      retryLabel={dict.retry}
      whatsappLabel={dict.whatsapp}
      reset={reset}
    />
  );
}
