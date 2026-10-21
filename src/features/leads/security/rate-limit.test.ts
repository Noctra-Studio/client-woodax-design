import { afterEach, describe, expect, it, vi } from "vitest";
import {
  consumeStepOneRateLimit,
  type LeadLimiter,
  type LeadLimiters,
} from "@/features/leads/security/rate-limit";

function countingLimiter(max: number): LeadLimiter {
  const counts = new Map<string, number>();
  return {
    limit: async (key) => {
      const next = (counts.get(key) ?? 0) + 1;
      counts.set(key, next);
      return { success: next <= max };
    },
  };
}

function limiters(): LeadLimiters {
  return {
    ip10m: countingLimiter(5),
    ipDay: countingLimiter(20),
    emailHour: countingLimiter(3),
    emailDay: countingLimiter(5),
    globalHour: countingLimiter(100),
  };
}

describe("consumeStepOneRateLimit", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("blocks the 6th submission from the same ip", async () => {
    const gates = limiters();
    const input = { ip: "203.0.113.5", email: null };
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(await consumeStepOneRateLimit(gates, input)).toBe("ok");
    }
    expect(await consumeStepOneRateLimit(gates, input)).toBe("limited");
  });

  it("blocks the 4th email in an hour on a fresh ip", async () => {
    const gates = limiters();
    const email = "ana@woodax.design";
    for (let attempt = 0; attempt < 3; attempt += 1) {
      expect(
        await consumeStepOneRateLimit(gates, {
          ip: `203.0.113.${attempt}`,
          email,
        }),
      ).toBe("ok");
    }
    expect(
      await consumeStepOneRateLimit(gates, { ip: "203.0.113.9", email }),
    ).toBe("limited");
  });

  it("fails open when redis throws", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const broken: LeadLimiter = {
      limit: async () => {
        throw new Error("redis down");
      },
    };
    const gates: LeadLimiters = {
      ip10m: broken,
      ipDay: countingLimiter(20),
      emailHour: countingLimiter(3),
      emailDay: countingLimiter(5),
      globalHour: broken,
    };

    expect(
      await consumeStepOneRateLimit(gates, {
        ip: "203.0.113.5",
        email: "ana@woodax.design",
      }),
    ).toBe("open");
    expect(error).toHaveBeenCalled();
  });

  it("fails open when redis times out", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const timeout: LeadLimiter = {
      limit: async () => ({ success: true, reason: "timeout" }),
    };
    const gates: LeadLimiters = {
      ip10m: timeout,
      ipDay: timeout,
      emailHour: timeout,
      emailDay: timeout,
      globalHour: timeout,
    };

    expect(
      await consumeStepOneRateLimit(gates, {
        ip: "203.0.113.5",
        email: null,
      }),
    ).toBe("ok");
    expect(error).toHaveBeenCalled();
  });
});
