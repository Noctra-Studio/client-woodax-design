import { sanitizeText } from "@/features/leads/security/sanitize";

const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com"]);

/**
 * Lowercase, trim, and strip Gmail +aliases.
 * `googlemail.com` is folded to `gmail.com`. Dots in the local part stay.
 */
export function normalizeEmail(raw: string): string {
  const trimmed = sanitizeText(raw).toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0 || at === trimmed.length - 1) return trimmed;

  let local = trimmed.slice(0, at);
  let domain = trimmed.slice(at + 1);
  if (GMAIL_DOMAINS.has(domain)) {
    const plus = local.indexOf("+");
    if (plus !== -1) local = local.slice(0, plus);
    domain = "gmail.com";
  }

  return `${local}@${domain}`;
}

/** Stable id for rate limits and duplicate hashes. Emails are normalized; phones keep digits. */
export function normalizeContact(raw: string): string {
  const value = sanitizeText(raw);
  if (value.includes("@")) return normalizeEmail(value);
  const digits = value.replace(/\D/g, "");
  return digits || value.toLowerCase();
}
