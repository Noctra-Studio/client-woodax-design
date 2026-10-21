export const TEXT_LIMITS = {
  name: 80,
  company: 120,
  message: 2000,
} as const;

const ZERO_WIDTH =
  /[\u00AD\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF\uFE0E\uFE0F]/g;

const CONTROLS = /[\u0000-\u001F\u007F-\u009F]/g;

/** NFKC, strip control and zero-width characters, collapse whitespace. */
export function sanitizeText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(ZERO_WIDTH, "")
    .replace(CONTROLS, " ")
    .replace(/\s+/g, " ")
    .trim();
}
