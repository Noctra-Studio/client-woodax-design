const SUBJECT_MAX = 150;

/** One line, capped, so a name cannot inject extra mail headers. */
export function singleLineSubject(value: string): string {
  const single = value
    .replace(/[\r\n]+/g, " ")
    .replace(/[ \t\f\v]+/g, " ")
    .trim();
  if (single.length <= SUBJECT_MAX) return single;
  return single.slice(0, SUBJECT_MAX).trimEnd();
}

/** Reply-To only for a single validated address. Never a display name or extra header. */
export function safeReplyTo(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 254 || /[\r\n\s]/.test(trimmed)) {
    return undefined;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return undefined;
  return trimmed;
}
