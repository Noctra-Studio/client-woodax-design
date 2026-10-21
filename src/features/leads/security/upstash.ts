import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { serverEnv } from "@/lib/env";
import type { DuplicateRedis } from "@/features/leads/security/duplicate";
import type { LeadLimiters } from "@/features/leads/security/rate-limit";

let redis: Redis | null | undefined;
let limiters: LeadLimiters | null | undefined;
let loggedMissing = false;

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = serverEnv.KV_REST_API_URL;
  const token = serverEnv.KV_REST_API_TOKEN;
  if (!url || !token) {
    if (!loggedMissing) {
      loggedMissing = true;
      console.error(
        "lead rate limit unavailable; failing open",
        "missing_redis",
      );
    }
    redis = null;
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

function windowLimiter(
  client: Redis,
  tokens: number,
  window: "10 m" | "1 h" | "1 d",
  prefix: string,
) {
  const ratelimit = new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(tokens, window),
    prefix,
    analytics: false,
    timeout: 2_000,
  });

  return {
    limit: (key: string) => ratelimit.limit(key),
  };
}

/** Shared across warm invocations. Null when Redis is not configured. */
export function stepOneLimiters(): LeadLimiters | null {
  if (limiters !== undefined) return limiters;
  const client = getRedis();
  if (!client) {
    limiters = null;
    return null;
  }

  limiters = {
    ip10m: windowLimiter(client, 5, "10 m", "woodax:lead:ip10m"),
    ipDay: windowLimiter(client, 20, "1 d", "woodax:lead:ip1d"),
    emailHour: windowLimiter(client, 3, "1 h", "woodax:lead:email1h"),
    emailDay: windowLimiter(client, 5, "1 d", "woodax:lead:email1d"),
    globalHour: windowLimiter(client, 100, "1 h", "woodax:lead:global1h"),
  };
  return limiters;
}

export function duplicateRedis(): DuplicateRedis | null {
  const client = getRedis();
  if (!client) return null;
  return {
    set: async (key, value, options) => {
      const result = await client.set(key, value, options);
      return typeof result === "string" ? result : null;
    },
    del: (key) => client.del(key),
  };
}
