/** Shared Upstash database. Every key for this project starts here. */
export const REDIS_NAMESPACE = "woodax";

function redisKey(...parts: readonly string[]): string {
  return [REDIS_NAMESPACE, ...parts].join(":");
}

/** One Ratelimit prefix per window so limits never share a counter. */
export const RATE_LIMIT_PREFIX = {
  ip10m: redisKey("lead", "ip", "10m"),
  ipDay: redisKey("lead", "ip", "day"),
  emailHour: redisKey("lead", "email", "hour"),
  emailDay: redisKey("lead", "email", "day"),
  globalHour: redisKey("lead", "global", "hour"),
} as const;

export function duplicateKey(hash: string): string {
  return redisKey("lead", "dedupe", hash);
}
