import { materials } from "@/features/leads/schema";
import type { Locale } from "@/i18n/routing";
import { clientEnv } from "@/lib/env";
import type { Site } from "@/lib/site";

type LeadMaterial = (typeof materials)[number];

type AnalyticsEventMap = {
  generate_lead:
    | { site: "design"; locale: Locale; flagged?: true }
    | { site: "cnc"; locale: Locale; material: LeadMaterial; flagged?: true };
  cta_click: {
    site: Site;
    locale: Locale;
    location: "nav" | "hero" | "home" | "mobile_bar";
  };
  social_click: {
    site: Site;
    locale: Locale;
    platform: "instagram" | "facebook";
    location: "footer" | "projects";
  };
  sister_site_click: {
    site: Site;
    locale: Locale;
    from: Site;
    to: Site;
    location: "footer" | "services";
  };
  whatsapp_click: {
    site: Site;
    location: "floating" | "mobile_bar" | "contact" | "success";
  };
};

export type AnalyticsEvent = keyof AnalyticsEventMap;

export type AnalyticsParams<E extends AnalyticsEvent = AnalyticsEvent> =
  AnalyticsEventMap[E];

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      params?: Record<string, string>,
    ) => void;
  }
}

export function analyticsLocale(locale: string): Locale {
  return locale === "en" ? "en" : "es";
}

export function isLeadMaterial(
  value: string | undefined,
): value is LeadMaterial {
  return (
    value !== undefined && (materials as readonly string[]).includes(value)
  );
}

/**
 * Sends an allowed event. Development logs it. Anywhere else, a missing
 * gtag is a no-op. Callers must not pass names, emails, phones, or free text.
 * `transport_type: beacon` lets the hit leave with the page instead of
 * holding navigation open.
 */
export function track<E extends AnalyticsEvent>(
  event: E,
  params: AnalyticsEventMap[E],
): void {
  if (clientEnv.NEXT_PUBLIC_APP_ENV === "development") {
    console.debug(event, params);
    return;
  }

  if (typeof window === "undefined") return;

  const gtag = window.gtag;
  if (typeof gtag !== "function") return;

  const payload: Record<string, string> = { transport_type: "beacon" };
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "boolean") payload[key] = value ? "true" : "false";
    else if (typeof value === "string") payload[key] = value;
  }

  gtag("event", event, payload);
}
