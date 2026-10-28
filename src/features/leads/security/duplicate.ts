import { createHash } from "node:crypto";
import { duplicateKey } from "@/features/leads/security/redis-keys";
import { sanitizeText } from "@/features/leads/security/sanitize";
import {
  UPSTASH_TIMEOUT_MS,
  withTimeout,
} from "@/features/leads/security/timeout";

const DAY_SECONDS = 24 * 60 * 60;

export type DuplicateRedis = {
  set: (
    key: string,
    value: string,
    options: { nx: true; ex: number },
  ) => Promise<string | null>;
  del: (key: string) => Promise<unknown>;
};

export function submissionFingerprint(
  contactId: string,
  message: string,
): string {
  return createHash("sha256")
    .update(`${contactId}\n${sanitizeText(message)}`)
    .digest("hex");
}

let loggedUnavailable = false;

/**
 * First writer in 24h wins. Redis down or missing fails open so a real lead is still sent.
 */
export async function claimSubmission(
  redis: DuplicateRedis | null,
  hash: string,
  timeoutMs = UPSTASH_TIMEOUT_MS,
): Promise<"new" | "duplicate" | "open"> {
  if (!redis) {
    if (!loggedUnavailable) {
      loggedUnavailable = true;
      console.error("lead duplicate check unavailable; failing open");
    }
    return "open";
  }

  try {
    const result = await withTimeout(
      redis.set(duplicateKey(hash), "1", {
        nx: true,
        ex: DAY_SECONDS,
      }),
      timeoutMs,
    );
    return result === null ? "duplicate" : "new";
  } catch (error) {
    console.error(
      "lead duplicate check unavailable; failing open",
      error instanceof Error ? error.name : "Error",
    );
    return "open";
  }
}

export async function releaseSubmission(
  redis: DuplicateRedis | null,
  hash: string,
  timeoutMs = UPSTASH_TIMEOUT_MS,
) {
  if (!redis) return;
  try {
    await withTimeout(redis.del(duplicateKey(hash)), timeoutMs);
  } catch (error) {
    console.error(
      "lead duplicate release failed",
      error instanceof Error ? error.name : "Error",
    );
  }
}
