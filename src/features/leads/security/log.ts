export type LeadDecision =
  | "accepted"
  | "flagged"
  | "discarded"
  | "rate_limited"
  | "bot"
  | "send_failed";

const REASON = /^[a-z0-9_,]+$/;

/** One line. Reason codes only — never a name, email, or message. */
export function logLeadDecision(decision: LeadDecision, reason: string) {
  const safe = REASON.test(reason) ? reason : "unspecified";
  console.info(`lead ${decision} reason=${safe}`);
}
