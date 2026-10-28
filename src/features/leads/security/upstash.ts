import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { serverEnv } from "@/lib/env";
import type { DuplicateRedis } from "@/features/leads/security/duplicate";
import type { LeadLimiters } from "@/features/leads/security/rate-limit";
import { RATE_LIMIT_PREFIX } from "@/features/leads/security/redis-keys";
import {
  UPSTASH_TIMEOUT_MS,
  withTimeout,
} from "@/features/leads/security/timeout";

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

  redis = new Redis({
    url,
    token,
    retry: false,
    signal: () => AbortSignal.timeout(UPSTASH_TIMEOUT_MS),
  });
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
    timeout: UPSTASH_TIMEOUT_MS,
  });

  return {
    limit: (key: string) =>
      withTimeout(ratelimit.limit(key), UPSTASH_TIMEOUT_MS),
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
    ip10m: windowLimiter(client, 5, "10 m", RATE_LIMIT_PREFIX.ip10m),
    ipDay: windowLimiter(client, 20, "1 d", RATE_LIMIT_PREFIX.ipDay),
    emailHour: windowLimiter(client, 3, "1 h", RATE_LIMIT_PREFIX.emailHour),
    emailDay: windowLimiter(client, 5, "1 d", RATE_LIMIT_PREFIX.emailDay),
    globalHour: windowLimiter(client, 100, "1 h", RATE_LIMIT_PREFIX.globalHour),
  };
  return limiters;
}

export function duplicateRedis(): DuplicateRedis | null {
  const client = getRedis();
  if (!client) return null;
  return {
    set: async (key, value, options) => {
      const result = await withTimeout(
        client.set(key, value, options),
        UPSTASH_TIMEOUT_MS,
      );
      return typeof result === "string" ? result : null;
    },
    del: (key) => withTimeout(client.del(key), UPSTASH_TIMEOUT_MS),
  };
}
