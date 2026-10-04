export type LeadActionState = {
  status: "idle" | "success" | "error";
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

export const initialLeadState: LeadActionState = { status: "idle" };
