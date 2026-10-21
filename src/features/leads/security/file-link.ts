import { hostMatches, isIpLiteral } from "@/features/leads/security/urls";
import { sanitizeText } from "@/features/leads/security/sanitize";

const FILE_LINK_HOSTS = [
  "drive.google.com",
  "docs.google.com",
  "dropbox.com",
  "wetransfer.com",
  "we.tl",
  "onedrive.live.com",
  "1drv.ms",
  "icloud.com",
  "box.com",
] as const;

export type ClassifiedFileLink =
  | { kind: "empty" }
  | { kind: "allowlisted"; text: string; href: string }
  | { kind: "plain"; text: string };

export function isAllowlistedFileHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (host.includes("xn--") || isIpLiteral(host)) return false;
  return FILE_LINK_HOSTS.some((allowed) => hostMatches(host, allowed));
}

/** Allowlisted links can be clicked. Anything else is plain text and should be flagged. */
export function classifyFileLink(raw: string): ClassifiedFileLink {
  const text = sanitizeText(raw);
  if (!text) return { kind: "empty" };

  try {
    const url = new URL(text);
    if (url.username || url.password) return { kind: "plain", text };
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { kind: "plain", text };
    }
    if (!isAllowlistedFileHost(url.hostname)) return { kind: "plain", text };
    return { kind: "allowlisted", text: url.href, href: url.href };
  } catch {
    return { kind: "plain", text };
  }
}
