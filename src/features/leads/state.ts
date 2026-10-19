export type LeadActionState = {
  status: "idle" | "success" | "error";
  /** True only after Resend accepts the message. False on the honeypot path. */
  delivered?: boolean;
  /** True when the lead was emailed inside the short-submit window. */
  flagged?: boolean;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

export const initialLeadState: LeadActionState = { status: "idle" };
