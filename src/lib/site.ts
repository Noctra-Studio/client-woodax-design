export type Site = "design" | "cnc";

/**
 * CNC is served from hosts that start with `cnc.` (including `cnc.localhost`
 * in development) or `cnc-staging.`.
 */
export function isCncHost(host: string): boolean {
  const hostname = hostnameFromHost(host);
  return hostname.startsWith("cnc.") || hostname.startsWith("cnc-staging.");
}

export function getSite(host: string): Site {
  return isCncHost(host) ? "cnc" : "design";
}

function hostnameFromHost(host: string): string {
  const first = host.split(",")[0]?.trim().toLowerCase() ?? "";
  return first.replace(/:\d+$/, "");
}
