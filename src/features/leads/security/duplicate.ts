import { createHash } from "node:crypto";
import { sanitizeText } from "@/features/leads/security/sanitize";

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

const duplicateKey = (hash: string) => `woodax:lead:dup:${hash}`;

/**
 * First writer in 24h wins. Redis down or missing fails open so a real lead is still sent.
 */
export async function claimSubmission(
  redis: DuplicateRedis | null,
  hash: string,
): Promise<"new" | "duplicate" | "open"> {
  if (!redis) {
    if (!loggedUnavailable) {
      loggedUnavailable = true;
      console.error("lead duplicate check unavailable; failing open");
    }
    return "open";
  }

  try {
    const result = await redis.set(duplicateKey(hash), "1", {
      nx: true,
      ex: DAY_SECONDS,
    });
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
) {
  if (!redis) return;
  try {
    await redis.del(duplicateKey(hash));
  } catch (error) {
    console.error(
      "lead duplicate release failed",
      error instanceof Error ? error.name : "Error",
    );
  }
}
