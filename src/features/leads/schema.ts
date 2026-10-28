import { z } from "zod";
import { TEXT_LIMITS, sanitizeText } from "@/features/leads/security/sanitize";

export const MIN_SUBMIT_MS = 3_000;

export const leadError = {
  name: "errors.name",
  contact: "errors.contact",
  consent: "errors.consent",
  projectType: "errors.projectType",
  city: "errors.city",
  material: "errors.material",
  projectState: "errors.projectState",
  details: "errors.details",
  generic: "errors.generic",
  message: "errors.message",
  rateLimited: "errors.rateLimited",
  sendFailed: "errors.sendFailed",
} as const;

export const projectTypes = [
  "kitchen",
  "closet",
  "custom-piece",
  "commercial-space",
] as const;

export const materials = ["wood", "acrylic", "aluminum", "other"] as const;

export const projectStates = ["file-ready", "needs-help", "idea"] as const;

export const stages = ["idea", "measurements", "ready-to-quote"] as const;

export const timelines = ["now", "1-3-months", "later"] as const;

export const quantities = ["1-10", "11-100", "100+"] as const;

const phonePattern = /^\d{10,15}$/;

export function parseContact(
  raw: string,
): { kind: "email"; value: string } | { kind: "phone"; value: string } | null {
  const value = raw.trim();
  if (!value) return null;

  if (value.includes("@")) {
    const parsed = z.email().safeParse(value);
    return parsed.success ? { kind: "email", value: parsed.data } : null;
  }

  const digits = value.replace(/\D/g, "");
  if (!phonePattern.test(digits)) return null;
  return { kind: "phone", value: digits };
}

function emptyToUndefined(value: unknown): unknown {
  if (typeof value !== "string") return undefined;
  const trimmed = sanitizeText(value);
  return trimmed === "" ? undefined : trimmed;
}

const optionalText = (max: number, error?: string) =>
  z.preprocess(
    emptyToUndefined,
    error
      ? z.string().max(max, error).optional()
      : z.string().max(max).optional(),
  );

/** Keep the lead. A long file URL is clipped and then classified, not rejected. */
function cappedText(max: number) {
  return (value: unknown): unknown => {
    if (typeof value !== "string") return undefined;
    const trimmed = sanitizeText(value);
    if (!trimmed) return undefined;
    return trimmed.slice(0, max);
  };
}

/** Origin and pathname only. Query and hash can carry tokens from other sites. */
export function referrerOriginPath(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return `${url.origin}${url.pathname}`.slice(0, 200);
  } catch {
    return undefined;
  }
}

function referrerField(value: unknown): unknown {
  if (typeof value !== "string") return undefined;
  return referrerOriginPath(value);
}

const nameField = z.preprocess(
  (value) => (typeof value === "string" ? sanitizeText(value) : value),
  z.string().min(2, leadError.name).max(TEXT_LIMITS.name, leadError.name),
);

const companyField = optionalText(TEXT_LIMITS.company);
const messageField = optionalText(TEXT_LIMITS.message, leadError.message);

const contactField = z.preprocess(
  (value) => (typeof value === "string" ? sanitizeText(value) : value),
  z
    .string()
    .min(1, leadError.contact)
    .refine((value) => parseContact(value) !== null, leadError.contact),
);

const localeField = z.enum(["es", "en"], { error: leadError.generic });

const sharedFields = {
  name: nameField,
  company: companyField,
  message: messageField,
  contact: contactField,
  locale: localeField,
  consent: z.literal(true, { error: leadError.consent }),
  utm_source: optionalText(200),
  utm_medium: optionalText(200),
  utm_campaign: optionalText(200),
  page: optionalText(200),
  referrer: z.preprocess(referrerField, z.string().max(200).optional()),
  startedAt: z.coerce.number({ error: leadError.generic }),
};

export const leadSchema = z.discriminatedUnion("site", [
  z.object({
    site: z.literal("design"),
    ...sharedFields,
    projectType: z.enum(projectTypes, { error: leadError.projectType }),
    city: z.preprocess(
      emptyToUndefined,
      z.string().min(2, leadError.city).max(60, leadError.city).optional(),
    ),
  }),
  z.object({
    site: z.literal("cnc"),
    ...sharedFields,
    material: z.enum(materials, { error: leadError.material }),
    projectState: z.enum(projectStates, { error: leadError.projectState }),
  }),
]);

const detailsShared = {
  name: nameField,
  company: companyField,
  message: messageField,
  contact: contactField,
  locale: localeField,
  startedAt: z.coerce.number({ error: leadError.generic }),
};

export const leadDetailsSchema = z.discriminatedUnion("site", [
  z
    .object({
      site: z.literal("design"),
      ...detailsShared,
      projectType: z.enum(projectTypes, { error: leadError.projectType }),
      stage: z.preprocess(
        emptyToUndefined,
        z.enum(stages, { error: leadError.details }).optional(),
      ),
      timeline: z.preprocess(
        emptyToUndefined,
        z.enum(timelines, { error: leadError.details }).optional(),
      ),
    })
    .refine(
      (value) => value.stage !== undefined || value.timeline !== undefined,
      { error: leadError.details, path: ["details"] },
    ),
  z
    .object({
      site: z.literal("cnc"),
      ...detailsShared,
      material: z.enum(materials, { error: leadError.material }),
      projectState: z.preprocess(
        emptyToUndefined,
        z.enum(projectStates, { error: leadError.generic }).optional(),
      ),
      quantity: z.preprocess(
        emptyToUndefined,
        z.enum(quantities, { error: leadError.details }).optional(),
      ),
      fileLink: z.preprocess(cappedText(500), z.string().optional()),
    })
    .refine((value) => value.quantity !== undefined, {
      error: leadError.details,
      path: ["quantity"],
    }),
]);

export type Lead = z.infer<typeof leadSchema>;
export type LeadDetails = z.infer<typeof leadDetailsSchema>;

const VALUE_KEYS = [
  "site",
  "name",
  "company",
  "message",
  "contact",
  "locale",
  "projectType",
  "city",
  "material",
  "projectState",
  "stage",
  "timeline",
  "quantity",
  "fileLink",
  "startedAt",
] as const;

export function readLeadValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};

  for (const key of VALUE_KEYS) {
    const value = formData.get(key);
    if (typeof value === "string") values[key] = value;
  }

  return values;
}

export function leadPayload(formData: FormData) {
  return {
    site: formData.get("site"),
    name: formData.get("name"),
    company: formData.get("company"),
    message: formData.get("message"),
    contact: formData.get("contact"),
    locale: formData.get("locale"),
    consent: formData.get("consent") === "on",
    utm_source: formData.get("utm_source"),
    utm_medium: formData.get("utm_medium"),
    utm_campaign: formData.get("utm_campaign"),
    page: formData.get("page"),
    referrer: formData.get("referrer"),
    startedAt: formData.get("startedAt"),
    projectType: formData.get("projectType"),
    city: formData.get("city"),
    material: formData.get("material"),
    projectState: formData.get("projectState"),
  };
}

export function leadDetailsPayload(formData: FormData) {
  return {
    site: formData.get("site"),
    name: formData.get("name"),
    company: formData.get("company"),
    message: formData.get("message"),
    contact: formData.get("contact"),
    locale: formData.get("locale"),
    startedAt: formData.get("startedAt"),
    projectType: formData.get("projectType"),
    material: formData.get("material"),
    projectState: formData.get("projectState"),
    stage: formData.get("stage"),
    timeline: formData.get("timeline"),
    quantity: formData.get("quantity"),
    fileLink: formData.get("fileLink"),
  };
}

/** The hidden website field. A value here is a bot; the lead is not emailed. */
export function honeypotFilled(formData: FormData): boolean {
  const website = formData.get("website");
  return typeof website === "string" ? website.trim() !== "" : website !== null;
}

/** Milliseconds since the form was opened, or null when startedAt is unusable. */
export function submitElapsedMs(
  formData: FormData,
  now = Date.now(),
): number | null {
  const rawStartedAt = formData.get("startedAt");
  if (typeof rawStartedAt !== "string" || rawStartedAt.trim() === "") {
    return null;
  }

  const startedAt = Number(rawStartedAt);
  if (!Number.isFinite(startedAt)) return null;
  return now - startedAt;
}

/**
 * Details follow-up still drops both cases. The main lead form only drops a
 * filled honeypot; a submit sooner than {@link MIN_SUBMIT_MS} is emailed and flagged.
 */
export function isSilentSubmission(
  formData: FormData,
  now = Date.now(),
): boolean {
  if (honeypotFilled(formData)) return true;
  const elapsed = submitElapsedMs(formData, now);
  return elapsed !== null && elapsed < MIN_SUBMIT_MS;
}

export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    const name =
      typeof key === "string" || typeof key === "number" ? String(key) : "form";
    if (!fieldErrors[name] && issue.message) {
      fieldErrors[name] = issue.message;
    }
  }

  return fieldErrors;
}
