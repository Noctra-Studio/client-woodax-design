import { z } from "zod";

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
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

const optionalText = (max: number) =>
  z.preprocess(emptyToUndefined, z.string().max(max).optional());

const nameField = z
  .string()
  .trim()
  .min(2, leadError.name)
  .max(80, leadError.name);

const contactField = z
  .string()
  .trim()
  .min(1, leadError.contact)
  .refine((value) => parseContact(value) !== null, leadError.contact);

const localeField = z.enum(["es", "en"], { error: leadError.generic });

const sharedFields = {
  name: nameField,
  contact: contactField,
  locale: localeField,
  consent: z.literal(true, { error: leadError.consent }),
  utm_source: optionalText(200),
  utm_medium: optionalText(200),
  utm_campaign: optionalText(200),
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
      quantity: z.preprocess(
        emptyToUndefined,
        z.enum(quantities, { error: leadError.details }).optional(),
      ),
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
  "contact",
  "locale",
  "projectType",
  "city",
  "material",
  "projectState",
  "stage",
  "timeline",
  "quantity",
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
    contact: formData.get("contact"),
    locale: formData.get("locale"),
    consent: formData.get("consent") === "on",
    utm_source: formData.get("utm_source"),
    utm_medium: formData.get("utm_medium"),
    utm_campaign: formData.get("utm_campaign"),
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
    contact: formData.get("contact"),
    locale: formData.get("locale"),
    startedAt: formData.get("startedAt"),
    projectType: formData.get("projectType"),
    material: formData.get("material"),
    stage: formData.get("stage"),
    timeline: formData.get("timeline"),
    quantity: formData.get("quantity"),
  };
}

/**
 * Bots get the same success state as a real lead, and nothing is sent.
 * A filled honeypot or a submit sooner than {@link MIN_SUBMIT_MS} qualifies.
 */
export function isSilentSubmission(
  formData: FormData,
  now = Date.now(),
): boolean {
  const website = formData.get("website");
  const honeypotFilled =
    typeof website === "string" ? website.trim() !== "" : website !== null;

  if (honeypotFilled) return true;

  const rawStartedAt = formData.get("startedAt");
  if (typeof rawStartedAt !== "string" || rawStartedAt.trim() === "") {
    return false;
  }

  const startedAt = Number(rawStartedAt);
  if (!Number.isFinite(startedAt)) return false;

  const elapsed = now - startedAt;
  return elapsed < MIN_SUBMIT_MS;
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
