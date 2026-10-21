const SCHEME_PATTERN =
  /\b([a-z][a-z0-9+.-]{0,31}):(?:\/\/[^\s<>"']+|[^\s<>"']+)/gi;

const BARE_DOMAIN_PATTERN =
  /\b(?:www\.)?(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|net|org|io|co|mx|app|dev|me|info|biz|xyz|link|click|ru|cn|uk|es|design|shop|online|site|top|cc|ly|gl|gd|to|us|de|tv|live|store|tech|page|email|cloud|website|space)\b(?:\/[^\s<>"']*)?/gi;

const TRAILING_PUNCTUATION = /[.,;:!?)]+$/;

const SHORTENERS = new Set([
  "bit.ly",
  "bitly.com",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "cutt.ly",
  "rb.gy",
  "shorturl.at",
  "tiny.cc",
  "rebrand.ly",
  "bit.do",
  "adf.ly",
  "t.ly",
  "v.gd",
  "clck.ru",
  "short.link",
  "s.id",
  "db.tt",
  "short.gy",
  "tiny.one",
  "soo.gd",
  "qr.ae",
  "cutt.us",
  "bl.ink",
]);

const DISCARD_PRIORITY = [
  "dangerous_scheme",
  "ip_literal",
  "shortener",
  "punycode",
] as const;

export type UrlDiscardReason =
  "multi_url" | "dangerous_scheme" | "ip_literal" | "shortener" | "punycode";

export type UrlReason = "ok" | UrlDiscardReason;

export type UrlFinding = {
  raw: string;
  reason: UrlReason;
};

export type UrlInspection = {
  urls: UrlFinding[];
  discardReason: UrlDiscardReason | null;
  flagOneUrl: boolean;
};

export function hostMatches(hostname: string, allowed: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return host === allowed || host.endsWith(`.${allowed}`);
}

export function isShortenerHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  for (const shortener of SHORTENERS) {
    if (hostMatches(host, shortener)) return true;
  }
  return false;
}

export function isIpLiteral(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (/^\d+$/.test(host)) return true;
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) {
    return host.split(".").every((part) => Number(part) <= 255);
  }
  return host.includes(":") && /^[0-9a-f:]+$/i.test(host);
}

/** Detection-only. The stored message keeps the visitor's text. */
export function deobfuscateUrls(value: string): string {
  return value
    .replace(
      /\[\s*(?:\.|dot)\s*\]|\(\s*(?:\.|dot)\s*\)|\{\s*(?:\.|dot)\s*\}/gi,
      ".",
    )
    .replace(/\bhxxps:\/\//gi, "https://")
    .replace(/\bhxxp:\/\//gi, "http://");
}

function trimUrl(raw: string): string {
  return raw.replace(TRAILING_PUNCTUATION, "");
}

function classifyHttp(raw: string): UrlReason {
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "dangerous_scheme";
    }
    const host = url.hostname.replace(/\.$/, "").toLowerCase();
    if (!host) return "dangerous_scheme";
    if (host.includes("xn--")) return "punycode";
    if (isIpLiteral(host)) return "ip_literal";
    if (isShortenerHost(host)) return "shortener";
    return "ok";
  } catch {
    return "dangerous_scheme";
  }
}

function pushUnique(findings: UrlFinding[], raw: string, reason: UrlReason) {
  const trimmed = trimUrl(raw);
  if (!trimmed) return;
  if (findings.some((finding) => finding.raw === trimmed)) return;
  findings.push({ raw: trimmed, reason });
}

export function extractUrls(value: string): UrlFinding[] {
  const text = deobfuscateUrls(value);
  const findings: UrlFinding[] = [];
  const consumed = new Array<boolean>(text.length).fill(false);

  for (const match of text.matchAll(SCHEME_PATTERN)) {
    const raw = match[0];
    const scheme = (match[1] ?? "").toLowerCase();
    const index = match.index ?? 0;
    if (!raw || !scheme) continue;
    for (let cursor = index; cursor < index + raw.length; cursor += 1) {
      consumed[cursor] = true;
    }
    if (scheme !== "http" && scheme !== "https") {
      pushUnique(findings, raw, "dangerous_scheme");
      continue;
    }
    pushUnique(findings, raw, classifyHttp(raw));
  }

  const bareSource = text.replace(/./g, (char, index: number) =>
    consumed[index] ? " " : char,
  );

  for (const match of bareSource.matchAll(BARE_DOMAIN_PATTERN)) {
    const raw = match[0];
    if (!raw) continue;
    pushUnique(findings, raw, classifyHttp(raw));
  }

  return findings;
}

export function inspectUrls(value: string): UrlInspection {
  const urls = extractUrls(value);
  for (const reason of DISCARD_PRIORITY) {
    if (urls.some((url) => url.reason === reason)) {
      return { urls, discardReason: reason, flagOneUrl: false };
    }
  }
  if (urls.length >= 2) {
    return { urls, discardReason: "multi_url", flagOneUrl: false };
  }
  return { urls, discardReason: null, flagOneUrl: urls.length === 1 };
}
