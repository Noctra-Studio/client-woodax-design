import { createHash } from "node:crypto";

export type LimitResult = {
  success: boolean;
  reason?: string;
};

export type LeadLimiter = {
  limit: (key: string) => Promise<LimitResult>;
};

export type LeadLimiters = {
  ip10m: LeadLimiter;
  ipDay: LeadLimiter;
  emailHour: LeadLimiter;
  emailDay: LeadLimiter;
  globalHour: LeadLimiter;
};

export type RateLimitDecision = "ok" | "limited" | "open";

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function logFailOpen(detail: string) {
  console.error("lead rate limit unavailable; failing open", detail);
}

/**
 * Step-1 limits: 5 / 10 min and 20 / day per IP, 3 / hour and 5 / day per email,
 * 100 / hour globally. A thrown limiter or a timeout fails open.
 * Step 2 must not call this.
 */
export async function consumeStepOneRateLimit(
  limiters: LeadLimiters,
  input: { ip: string | null; email: string | null },
): Promise<RateLimitDecision> {
  try {
    const checks: Promise<LimitResult>[] = [
      limiters.globalHour.limit("global"),
    ];
    if (input.ip) {
      const ipKey = digest(input.ip);
      checks.push(limiters.ip10m.limit(ipKey), limiters.ipDay.limit(ipKey));
    }
    if (input.email) {
      const emailKey = digest(input.email);
      checks.push(
        limiters.emailHour.limit(emailKey),
        limiters.emailDay.limit(emailKey),
      );
    }

    const results = await Promise.all(checks);
    if (results.some((result) => result.reason === "timeout")) {
      logFailOpen("timeout");
    }
    return results.every((result) => result.success) ? "ok" : "limited";
  } catch (error) {
    logFailOpen(error instanceof Error ? error.name : "Error");
    return "open";
  }
}

export function clientIp(forwardedFor: string | null): string | null {
  if (!forwardedFor) return null;
  const first = forwardedFor.split(",")[0]?.trim() ?? "";
  if (!first || first.length > 80 || /[\s\r\n]/.test(first)) return null;
  return first;
}
