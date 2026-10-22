import { describe, expect, it, vi } from "vitest";
import {
  claimSubmission,
  releaseSubmission,
  type DuplicateRedis,
} from "@/features/leads/security/duplicate";
import {
  duplicateKey,
  RATE_LIMIT_PREFIX,
  REDIS_NAMESPACE,
} from "@/features/leads/security/redis-keys";

describe("redis keys", () => {
  it("namespaces every lead key under woodax", () => {
    expect(REDIS_NAMESPACE).toBe("woodax");
    expect(RATE_LIMIT_PREFIX).toEqual({
      ip10m: "woodax:lead:ip:10m",
      ipDay: "woodax:lead:ip:day",
      emailHour: "woodax:lead:email:hour",
      emailDay: "woodax:lead:email:day",
      globalHour: "woodax:lead:global:hour",
    });
    expect(duplicateKey("abc123")).toBe("woodax:lead:dedupe:abc123");
  });

  it("writes and releases duplicate claims on the namespaced key", async () => {
    const keys: string[] = [];
    const redis: DuplicateRedis = {
      set: async (key) => {
        keys.push(key);
        return "OK";
      },
      del: async (key) => {
        keys.push(key);
      },
    };

    expect(await claimSubmission(redis, "abc123")).toBe("new");
    await releaseSubmission(redis, "abc123");
    expect(keys).toEqual([
      "woodax:lead:dedupe:abc123",
      "woodax:lead:dedupe:abc123",
    ]);
  });
});

describe("stepOneLimiters prefixes", () => {
  it("passes a distinct woodax prefix to each window", async () => {
    vi.resetModules();
    const prefixes: string[] = [];

    vi.doMock("@/lib/env", () => ({
      serverEnv: {
        KV_REST_API_URL: "https://example.upstash.io",
        KV_REST_API_TOKEN: "test-token",
      },
    }));
    vi.doMock("@upstash/redis", () => ({
      Redis: class Redis {},
    }));
    vi.doMock("@upstash/ratelimit", () => ({
      Ratelimit: class Ratelimit {
        static slidingWindow() {
          return {};
        }
        constructor(config: { prefix: string }) {
          prefixes.push(config.prefix);
        }
      },
    }));

    const { stepOneLimiters } = await import(
      "@/features/leads/security/upstash"
    );
    expect(stepOneLimiters()).not.toBeNull();
    expect(prefixes).toEqual([
      "woodax:lead:ip:10m",
      "woodax:lead:ip:day",
      "woodax:lead:email:hour",
      "woodax:lead:email:day",
      "woodax:lead:global:hour",
    ]);

    vi.doUnmock("@/lib/env");
    vi.doUnmock("@upstash/redis");
    vi.doUnmock("@upstash/ratelimit");
    vi.resetModules();
  });
});
