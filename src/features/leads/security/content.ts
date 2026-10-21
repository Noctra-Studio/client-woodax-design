import { isDisposableEmail } from "@/features/leads/security/disposable";
import { classifyFileLink } from "@/features/leads/security/file-link";
import { inspectUrls } from "@/features/leads/security/urls";

const SPAM_PATTERNS = [
  /\bcasinos?\b/i,
  /\bcrypto(?:currency)?\b/i,
  /\bcripto(?:monedas?)?\b/i,
  /\bbitcoins?\b/i,
  /\bviagra\b/i,
  /\bcialis\b/i,
  /\bseo\s+services?\b/i,
  /\bservicios?\s+seo\b/i,
  /\bbacklinks?\b/i,
  /\bforex\b/i,
  /\blotter(?:y|ies)\b/i,
  /\bloter[ií]as?\b/i,
  /\bporn(?:ography)?\b/i,
  /\bxxx\b/i,
  /\bpayday\b/i,
];

export type IdentityReason =
  "identity_url" | "identity_email" | "identity_markup";

export type LeadContentInput = {
  name: string;
  company?: string;
  message?: string;
  email?: string | null;
  fileLink?: string | null;
};

export type LeadContentDecision =
  | { outcome: "reject"; field: "name" | "company"; reason: IdentityReason }
  | { outcome: "discard"; reason: string }
  | { outcome: "send"; reasons: string[] };

const EMAIL_IN_TEXT = /[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+/;

export function identityIssue(value: string): IdentityReason | null {
  if (/[<>]/.test(value)) return "identity_markup";
  if (EMAIL_IN_TEXT.test(value)) return "identity_email";
  if (inspectUrls(value).urls.length > 0) return "identity_url";
  return null;
}

export function hasSpamWords(value: string): boolean {
  return SPAM_PATTERNS.some((pattern) => pattern.test(value));
}

export function decideLeadContent(
  input: LeadContentInput,
): LeadContentDecision {
  const nameIssue = identityIssue(input.name);
  if (nameIssue) return { outcome: "reject", field: "name", reason: nameIssue };

  if (input.company) {
    const companyIssue = identityIssue(input.company);
    if (companyIssue) {
      return { outcome: "reject", field: "company", reason: companyIssue };
    }
  }

  const message = input.message ?? "";
  const urls = inspectUrls(message);
  if (urls.discardReason) {
    return { outcome: "discard", reason: urls.discardReason };
  }

  const reasons: string[] = [];
  if (urls.flagOneUrl) reasons.push("one_url");

  const searchable = [input.name, input.company ?? "", message].join("\n");
  if (hasSpamWords(searchable)) reasons.push("spam_word");

  if (input.email && isDisposableEmail(input.email)) reasons.push("disposable");

  if (input.fileLink) {
    const file = classifyFileLink(input.fileLink);
    if (file.kind === "plain") reasons.push("file_link");
  }

  return { outcome: "send", reasons };
}
