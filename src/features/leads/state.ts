export type LeadActionState = {
  status: "idle" | "success" | "error";
  /** True only after Resend accepts the message. False on the honeypot path. */
  delivered?: boolean;
  /** True when the lead was emailed with a spam marker. */
  flagged?: boolean;
  /** Binds the optional details step to this lead. Expires after 2 hours. */
  leadToken?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

export const initialLeadState: LeadActionState = { status: "idle" };
