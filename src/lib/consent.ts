"use client";

import { clientEnv } from "@/lib/env";
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE,
  consentCookieDomain,
  parseConsent,
  serializeConsent,
  type ConsentChoice,
  type StoredConsent,
} from "@/lib/consent-config";
import {
  safeLocalGet,
  safeLocalSet,
  safeReadCookieString,
  safeWriteCookieString,
} from "@/lib/safe-storage";

const GA_COOKIE = /^_ga(?:_|$)/;

let inMemoryConsent: StoredConsent | null = null;

declare global {
  interface Window {
    __woodaxConsent?: StoredConsent | null;
  }
}

function cookieDomains(): string[] {
  try {
    const host = window.location.hostname;
    const domains = [""];
    if (host) domains.push(host);
    if (host === "woodax.design" || host.endsWith(".woodax.design")) {
      domains.push(".woodax.design");
    }
    return domains;
  } catch {
    return [""];
  }
}

function expireCookie(name: string, domain: string) {
  const domainAttr = domain ? `; Domain=${domain}` : "";
  const secure =
    typeof window !== "undefined" && window.isSecureContext ? "; Secure" : "";
  safeWriteCookieString(
    `${name}=; Path=/; Max-Age=0; SameSite=Lax${secure}${domainAttr}`,
  );
}

function writeConsentCookie(value: string) {
  for (const domain of cookieDomains()) expireCookie(CONSENT_COOKIE, domain);

  let host = "";
  try {
    host = window.location.hostname;
  } catch {
    host = "";
  }
  const domain = consentCookieDomain(clientEnv.NEXT_PUBLIC_APP_ENV, host);
  const domainAttr = domain ? `; Domain=${domain}` : "";
  const secure =
    typeof window !== "undefined" && window.isSecureContext ? "; Secure" : "";
  safeWriteCookieString(
    `${CONSENT_COOKIE}=${encodeURIComponent(value)}; Path=/; Max-Age=${CONSENT_MAX_AGE}; SameSite=Lax${secure}${domainAttr}`,
  );
}

function readCookieValues(): StoredConsent[] {
  const prefix = `${CONSENT_COOKIE}=`;
  const found: StoredConsent[] = [];
  const rawCookies = safeReadCookieString();
  if (!rawCookies) return found;
  for (const part of rawCookies.split("; ")) {
    if (!part.startsWith(prefix)) continue;
    let decoded: string;
    try {
      decoded = decodeURIComponent(part.slice(prefix.length));
    } catch {
      continue;
    }
    const parsed = parseConsent(decoded);
    if (parsed) found.push(parsed);
  }
  return found;
}

function latest(values: Array<StoredConsent | null>): StoredConsent | null {
  let best: StoredConsent | null = null;
  for (const value of values) {
    if (!value) continue;
    if (!best || value.ts >= best.ts) best = value;
  }
  return best;
}

function sameConsent(a: StoredConsent | null, b: StoredConsent | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.v === b.v &&
    a.necessary === b.necessary &&
    a.analytics === b.analytics &&
    a.marketing === b.marketing &&
    a.ts === b.ts
  );
}

export function readConsent(): StoredConsent | null {
  if (typeof document === "undefined") return inMemoryConsent;

  const fromCookie = latest(readCookieValues());
  const fromStorage = parseConsent(safeLocalGet(CONSENT_COOKIE));
  let fromWindow: StoredConsent | null = null;
  try {
    fromWindow =
      typeof window !== "undefined" ? (window.__woodaxConsent ?? null) : null;
  } catch {
    fromWindow = null;
  }

  const consent = latest([
    fromCookie,
    fromStorage,
    fromWindow,
    inMemoryConsent,
  ]);
  if (!consent) return null;

  inMemoryConsent = consent;

  if (!sameConsent(fromCookie, consent)) {
    writeConsentCookie(JSON.stringify(consent));
  }

  if (!sameConsent(fromStorage, consent)) {
    safeLocalSet(CONSENT_COOKIE, JSON.stringify(consent));
  }

  return consent;
}

function installGtag() {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === "function") return;
  window.gtag = function gtag() {
    // gtag.js reads the Arguments object.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };
}

function updateAnalyticsConsent(granted: boolean) {
  installGtag();
  window.gtag?.("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

export function deleteGaCookies() {
  if (typeof document === "undefined") return;
  const rawCookies = safeReadCookieString();
  if (!rawCookies) return;
  const names = rawCookies.split("; ").flatMap((part) => {
    const name = part.split("=")[0] ?? "";
    return GA_COOKIE.test(name) ? [name] : [];
  });
  const domains = cookieDomains();
  for (const name of names) {
    for (const domain of domains) expireCookie(name, domain);
  }
}

function shouldLoadGoogleAnalytics(): boolean {
  return (
    clientEnv.NEXT_PUBLIC_APP_ENV === "production" &&
    Boolean(clientEnv.NEXT_PUBLIC_GA_ID)
  );
}

export function ensureGoogleAnalytics() {
  if (!shouldLoadGoogleAnalytics()) return;
  const gaId = clientEnv.NEXT_PUBLIC_GA_ID;
  if (!gaId) return;

  installGtag();
  updateAnalyticsConsent(true);

  if (document.querySelector("script[data-woodax-ga]")) return;

  window.gtag?.("js", new Date());
  window.gtag?.("config", gaId);
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  script.setAttribute("data-woodax-ga", "");
  document.head.appendChild(script);
}

/**
 * Marketing tags belong in this function. It returns immediately unless
 * the visitor opted in. Nothing is installed today.
 */
export function loadMarketingScripts(consent: StoredConsent) {
  if (!consent.marketing) return;
}

export function applyConsent(consent: StoredConsent) {
  if (consent.analytics) {
    ensureGoogleAnalytics();
  } else {
    updateAnalyticsConsent(false);
    deleteGaCookies();
    requestAnimationFrame(() => deleteGaCookies());
  }
  loadMarketingScripts(consent);
}

export function saveConsent(choice: ConsentChoice): StoredConsent {
  const serialized = serializeConsent(choice);
  const consent = parseConsent(serialized);
  if (!consent) {
    throw new Error("Consent could not be stored.");
  }

  inMemoryConsent = consent;
  writeConsentCookie(serialized);
  safeLocalSet(CONSENT_COOKIE, serialized);

  try {
    applyConsent(consent);
    window.__woodaxConsent = consent;
  } catch {
    // Analytics script injection is non-critical in restricted WebViews.
  }
  return consent;
}
