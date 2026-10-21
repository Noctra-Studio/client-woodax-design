export const CONSENT_COOKIE = "woodax_consent";
export const CONSENT_VERSION = 1 as const;
/** 400 days. Chrome caps a cookie at this lifetime. */
export const CONSENT_MAX_AGE = 34_560_000;

export type StoredConsent = {
  v: typeof CONSENT_VERSION;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  ts: number;
};

export type ConsentChoice = {
  analytics: boolean;
  marketing: boolean;
};

/**
 * Shared across woodax.design and cnc.woodax.design in production only.
 * Previews, staging and localhost stay host-only.
 */
export function consentCookieDomain(
  appEnv: string,
  hostname: string,
): string | null {
  if (appEnv !== "production") return null;
  if (hostname === "woodax.design" || hostname.endsWith(".woodax.design")) {
    return ".woodax.design";
  }
  return null;
}

export function serializeConsent(
  choice: ConsentChoice,
  ts = Date.now(),
): string {
  const value: StoredConsent = {
    v: CONSENT_VERSION,
    necessary: true,
    analytics: choice.analytics,
    marketing: choice.marketing,
    ts,
  };
  return JSON.stringify(value);
}

export function parseConsent(raw: string | null | undefined): StoredConsent | null {
  if (!raw) return null;

  try {
    const value: unknown = JSON.parse(raw);
    if (!isStoredConsent(value)) return null;
    return value;
  } catch {
    return null;
  }
}

function isStoredConsent(value: unknown): value is StoredConsent {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    record.v === CONSENT_VERSION &&
    record.necessary === true &&
    typeof record.analytics === "boolean" &&
    typeof record.marketing === "boolean" &&
    typeof record.ts === "number" &&
    Number.isFinite(record.ts)
  );
}
