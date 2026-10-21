"use server";

import { headers } from "next/headers";
import { checkBotId } from "botid/server";
import { Resend } from "resend";
import {
  detailsContent,
  LeadNotificationEmail,
  notificationContent,
  withSpamMarkers,
  type LeadEmailContent,
} from "@/emails/lead-notification";
import { serverEnv } from "@/lib/env";
import { decideLeadContent } from "@/features/leads/security/content";
import {
  claimSubmission,
  releaseSubmission,
  submissionFingerprint,
} from "@/features/leads/security/duplicate";
import {
  normalizeContact,
  normalizeEmail,
} from "@/features/leads/security/email";
import {
  safeReplyTo,
  singleLineSubject,
} from "@/features/leads/security/headers";
import { logLeadDecision } from "@/features/leads/security/log";
import {
  clientIp,
  consumeStepOneRateLimit,
} from "@/features/leads/security/rate-limit";
import {
  signLeadToken,
  verifyLeadToken,
} from "@/features/leads/security/token";
import {
  duplicateRedis,
  stepOneLimiters,
} from "@/features/leads/security/upstash";
import {
  fieldErrorsFrom,
  honeypotFilled,
  leadDetailsPayload,
  leadDetailsSchema,
  leadError,
  leadPayload,
  leadSchema,
  MIN_SUBMIT_MS,
  parseContact,
  readLeadValues,
  submitElapsedMs,
  type Lead,
  type LeadDetails,
} from "@/features/leads/schema";
import type { LeadActionState } from "@/features/leads/state";

const resend = new Resend(serverEnv.RESEND_API_KEY);

export async function submitLead(
  _previous: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const values = readLeadValues(formData);

  if (await isBot()) {
    logLeadDecision("bot", "bot");
    return silentSuccess(values);
  }

  if (honeypotFilled(formData)) {
    logLeadDecision("discarded", "honeypot");
    return silentSuccess(values);
  }

  const elapsed = submitElapsedMs(formData);
  const shortSubmit = elapsed !== null && elapsed < MIN_SUBMIT_MS;

  const parsed = leadSchema.safeParse(leadPayload(formData));
  if (!parsed.success) {
    return {
      status: "error",
      delivered: false,
      fieldErrors: fieldErrorsFrom(parsed.error),
      values,
    };
  }

  const lead = parsed.data;
  const contact = parseContact(lead.contact);
  const contactKey = contactIdentity(contact, lead.contact);
  const email =
    contact?.kind === "email" ? normalizeEmail(contact.value) : null;
  const rejected = rejectContent(lead, email, undefined, values);
  if (rejected) return rejected;

  const limit = await stepOneLimit(await requestIp(), email);
  if (limit === "limited") {
    logLeadDecision("rate_limited", "rate_limit");
    return {
      status: "error",
      delivered: false,
      fieldErrors: { form: leadError.rateLimited },
      values,
    };
  }

  const decision = decideLeadContent({
    name: lead.name,
    company: lead.company,
    message: lead.message,
    email,
  });
  if (decision.outcome !== "send") {
    logLeadDecision("discarded", decision.reason);
    if (decision.outcome === "reject") {
      return {
        status: "error",
        delivered: false,
        fieldErrors: {
          [decision.field]:
            decision.field === "name" ? leadError.name : leadError.generic,
        },
        values,
      };
    }
    return silentSuccess(values);
  }

  const token = signLeadToken(
    { site: lead.site, contact: contactKey, name: lead.name },
    serverEnv.RESEND_API_KEY,
  );
  const fingerprint = submissionFingerprint(
    contactKey,
    [
      lead.message ?? "",
      lead.name,
      lead.company ?? "",
      lead.site,
      leadOptions(lead),
    ].join("\n"),
  );
  const claim = await claimSubmission(duplicateRedis(), fingerprint);
  if (claim === "duplicate") {
    logLeadDecision("discarded", "duplicate");
    return silentSuccess(values, token);
  }

  const reasons = [
    ...(shortSubmit ? ["short_submit"] : []),
    ...decision.reasons,
  ];
  const content = withSpamMarkers(
    notificationContent(lead, new Date()),
    reasons,
    elapsed,
  );
  const sent = await sendEmail({
    to:
      lead.site === "design"
        ? serverEnv.CONTACT_TO_EMAIL
        : serverEnv.CONTACT_TO_EMAIL_CNC,
    subject: content.subject,
    replyTo: contact?.kind === "email" ? contact.value : undefined,
    content,
  });

  if (!sent) {
    await releaseSubmission(duplicateRedis(), fingerprint);
    return {
      status: "error",
      delivered: false,
      fieldErrors: { form: leadError.generic },
      values,
    };
  }

  logLeadDecision(
    reasons.length > 0 ? "flagged" : "accepted",
    reasons.length > 0 ? reasons.join(",") : "ok",
  );

  return {
    status: "success",
    delivered: true,
    leadToken: token,
    ...(reasons.length > 0 ? { flagged: true } : {}),
    values,
  };
}

export async function submitLeadDetails(
  _previous: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const values = readLeadValues(formData);

  if (await isBot()) {
    logLeadDecision("bot", "bot");
    return silentSuccess(values);
  }

  if (honeypotFilled(formData)) {
    logLeadDecision("discarded", "honeypot");
    return silentSuccess(values);
  }

  const detailsElapsed = submitElapsedMs(formData);
  if (detailsElapsed !== null && detailsElapsed < MIN_SUBMIT_MS) {
    logLeadDecision("discarded", "short_submit");
    return silentSuccess(values);
  }

  const parsed = leadDetailsSchema.safeParse(leadDetailsPayload(formData));
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error),
      values,
    };
  }

  const details = parsed.data;
  const contact = parseContact(details.contact);
  const contactKey = contactIdentity(contact, details.contact);
  const token = formData.get("leadToken");
  const tokenOk =
    typeof token === "string" &&
    verifyLeadToken(token, serverEnv.RESEND_API_KEY, {
      site: details.site,
      contact: contactKey,
      name: details.name,
    });
  if (!tokenOk) {
    logLeadDecision("discarded", "invalid_lead_token");
    return {
      status: "error",
      fieldErrors: { form: leadError.generic },
      values,
    };
  }

  const email =
    contact?.kind === "email" ? normalizeEmail(contact.value) : null;
  const fileLink = details.site === "cnc" ? details.fileLink : undefined;
  const rejected = rejectContent(details, email, fileLink, values);
  if (rejected) return rejected;

  const decision = decideLeadContent({
    name: details.name,
    company: details.company,
    message: details.message,
    email,
    fileLink,
  });
  if (decision.outcome !== "send") {
    logLeadDecision("discarded", decision.reason);
    if (decision.outcome === "reject") {
      return {
        status: "error",
        fieldErrors: {
          [decision.field]:
            decision.field === "name" ? leadError.name : leadError.generic,
        },
        values,
      };
    }
    return silentSuccess(values);
  }

  const fingerprint = submissionFingerprint(
    contactKey,
    [
      details.message ?? "",
      details.name,
      details.site,
      fileLink ?? "",
      detailOptions(details),
    ].join("\n"),
  );
  const claim = await claimSubmission(duplicateRedis(), fingerprint);
  if (claim === "duplicate") {
    logLeadDecision("discarded", "duplicate");
    return { status: "success", values };
  }

  const content = withSpamMarkers(
    detailsContent(details, new Date()),
    decision.reasons,
    null,
  );
  const sent = await sendEmail({
    to:
      details.site === "design"
        ? serverEnv.CONTACT_TO_EMAIL
        : serverEnv.CONTACT_TO_EMAIL_CNC,
    subject: content.subject,
    replyTo: contact?.kind === "email" ? contact.value : undefined,
    content,
  });

  if (!sent) {
    await releaseSubmission(duplicateRedis(), fingerprint);
    return {
      status: "error",
      fieldErrors: { form: leadError.generic },
      values,
    };
  }

  logLeadDecision(
    decision.reasons.length > 0 ? "flagged" : "accepted",
    decision.reasons.length > 0 ? decision.reasons.join(",") : "details",
  );

  return { status: "success", values };
}

function rejectContent(
  lead: { name: string; company?: string; message?: string },
  email: string | null,
  fileLink: string | undefined,
  values: Record<string, string>,
): LeadActionState | null {
  const decision = decideLeadContent({
    name: lead.name,
    company: lead.company,
    message: lead.message,
    email,
    fileLink,
  });
  if (decision.outcome !== "reject") return null;
  logLeadDecision("discarded", decision.reason);
  return {
    status: "error",
    delivered: false,
    fieldErrors: {
      [decision.field]:
        decision.field === "name" ? leadError.name : leadError.generic,
    },
    values,
  };
}

function leadOptions(lead: Lead): string {
  return lead.site === "design"
    ? `${lead.projectType}\n${lead.city ?? ""}`
    : `${lead.material}\n${lead.projectState}`;
}

function detailOptions(details: LeadDetails): string {
  return details.site === "design"
    ? `${details.stage ?? ""}\n${details.timeline ?? ""}`
    : `${details.quantity ?? ""}\n${details.projectState ?? ""}`;
}

function contactIdentity(
  contact: ReturnType<typeof parseContact>,
  raw: string,
): string {
  if (contact?.kind === "email") return normalizeEmail(contact.value);
  if (contact?.kind === "phone") return contact.value;
  return normalizeContact(raw);
}

async function stepOneLimit(
  ip: string | null,
  email: string | null,
): Promise<"ok" | "limited"> {
  const limiters = stepOneLimiters();
  if (!limiters) return "ok";
  const decision = await consumeStepOneRateLimit(limiters, { ip, email });
  return decision === "limited" ? "limited" : "ok";
}

async function requestIp(): Promise<string | null> {
  const headerStore = await headers();
  return clientIp(headerStore.get("x-forwarded-for"));
}

async function isBot(): Promise<boolean> {
  try {
    const verification = await checkBotId({
      advancedOptions: { checkLevel: "basic" },
    });
    return verification.isBot;
  } catch (error) {
    console.error(
      "lead bot check unavailable; failing open",
      error instanceof Error ? error.name : "Error",
    );
    return false;
  }
}

function silentSuccess(
  values: Record<string, string>,
  leadToken?: string,
): LeadActionState {
  return {
    status: "success",
    delivered: false,
    values,
    ...(leadToken ? { leadToken } : {}),
  };
}

function mailbox(value: string): string | null {
  if (/[\r\n]/.test(value)) return null;
  return value;
}

async function sendEmail({
  to,
  subject,
  replyTo,
  content,
}: {
  to: string;
  subject: string;
  replyTo?: string;
  content: LeadEmailContent;
}) {
  const from = mailbox(serverEnv.CONTACT_FROM_EMAIL);
  const recipient = mailbox(to);
  if (!from || !recipient) {
    console.error("lead mailbox rejected");
    return false;
  }

  const safeReply = safeReplyTo(replyTo);

  try {
    const result = await resend.emails.send({
      from,
      to: recipient,
      subject: singleLineSubject(subject),
      ...(safeReply ? { replyTo: safeReply } : {}),
      react: LeadNotificationEmail(content),
    });

    if (result.error) {
      console.error(
        result.error.message
          ? `${result.error.name}: ${result.error.message}`
          : result.error,
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error(error instanceof Error ? error.name : "Error");
    return false;
  }
}
