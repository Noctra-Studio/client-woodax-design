import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { cncEmailNextStep, cncMaterialLabel } from "@/content/site-config";
import {
  type Lead,
  type LeadDetails,
  parseContact,
} from "@/features/leads/schema";
import { classifyFileLink } from "@/features/leads/security/file-link";
import { singleLineSubject } from "@/features/leads/security/headers";
import { defangUrls } from "@/features/leads/security/plain-text";

const projectTypeLabel = {
  kitchen: "Cocina",
  closet: "Clóset",
  "custom-piece": "Pieza a medida",
  "commercial-space": "Espacio comercial",
} as const;

const materialLabel = {
  wood: cncMaterialLabel("wood", "es"),
  acrylic: cncMaterialLabel("acrylic", "es"),
  aluminum: cncMaterialLabel("aluminum", "es"),
  other: cncMaterialLabel("other", "es"),
} as const;

const projectStateLabel = {
  "file-ready": "Tengo el archivo listo",
  "needs-help": "Necesito ayuda con el archivo",
  idea: "Solo tengo la idea",
} as const;

const stageLabel = {
  idea: "Idea",
  measurements: "Ya tengo medidas",
  "ready-to-quote": "Listo para cotizar",
} as const;

const timelineLabel = {
  now: "Ya",
  "1-3-months": "En 1–3 meses",
  later: "Más adelante",
} as const;

const quantityLabel = {
  "1-10": "1–10",
  "11-100": "11–100",
  "100+": "Más de 100",
} as const;

const localeLabel = {
  es: "Español",
  en: "English",
} as const;

const nextStepCopy = {
  design: "Agenda una llamada para levantar medidas y alcance.",
} as const;

const leadEyebrow = {
  cnc: "NUEVA COTIZACIÓN CNC",
  design: "NUEVO PROYECTO DESIGN",
} as const;

export type LeadReply = { kind: "email" | "phone"; value: string };

export type LeadEmailRow = {
  label: string;
  value: string;
  /** Set only for an allowlisted file link. Every other value stays plain text. */
  href?: string;
};

export type LeadEmailContent = {
  subject: string;
  preview: string;
  eyebrow: string;
  heading: string;
  rows: LeadEmailRow[];
  nextStep?: string;
  reply?: LeadReply;
};

export function mailtoReplyHref(email: string, subject: string) {
  return `mailto:${email}?subject=${encodeURIComponent(`Re: ${subject}`)}`;
}

function replyLink(reply: LeadReply, subject: string) {
  if (reply.kind === "email") {
    return {
      href: mailtoReplyHref(reply.value, subject),
      label: "Responder por email",
    };
  }

  return {
    href: `https://wa.me/${reply.value}`,
    label: "Responder por WhatsApp",
  };
}

function nextStepFor(
  site: "design" | "cnc",
  projectState?: "file-ready" | "needs-help" | "idea",
) {
  if (site === "design") return nextStepCopy.design;
  if (!projectState) return undefined;
  return cncEmailNextStep(projectState);
}

function brandName(site: "design" | "cnc") {
  return site === "design" ? "Woodax Design" : "CNC by Woodax Design";
}

function mexicoCityTimestamp(date: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

function pushRow(
  rows: LeadEmailRow[],
  label: string,
  value: string | undefined,
) {
  if (!value) return;
  rows.push({ label, value });
}

const SPAM_NOTES: Record<string, string> = {
  one_url: "El mensaje incluye un enlace.",
  spam_word: "El texto incluye palabras típicas de spam.",
  disposable: "El dominio del correo aparece en listas de correos desechables.",
  file_link:
    "El enlace del archivo no está en la lista permitida y se envió como texto.",
};

/** Marks the studio email. The visitor still gets a normal success response. */
export function withSpamMarkers(
  content: LeadEmailContent,
  reasons: string[],
  elapsedMs: number | null,
): LeadEmailContent {
  const notes: string[] = [];
  if (reasons.includes("short_submit") && elapsedMs !== null) {
    notes.push(
      `Enviado ${formatElapsed(elapsedMs)} después de abrir el formulario.`,
    );
  }
  for (const reason of reasons) {
    const note = SPAM_NOTES[reason];
    if (note) notes.push(note);
  }

  const subject = singleLineSubject(
    notes.length > 0 && !content.subject.startsWith("[Posible spam]")
      ? `[Posible spam] ${content.subject}`
      : content.subject,
  );

  if (notes.length === 0) return { ...content, subject };
  return {
    ...content,
    subject,
    rows: [
      ...notes.map((note) => ({ label: "Posible spam", value: note })),
      ...content.rows,
    ],
  };
}

type SubjectInput =
  | {
      site: "design";
      name: string;
      projectType: keyof typeof projectTypeLabel;
    }
  | {
      site: "cnc";
      name: string;
      material: keyof typeof materialLabel;
    };

function formatElapsed(elapsedMs: number): string {
  const rounded = Math.round(elapsedMs);
  if (rounded < 1000) return `${rounded} ms`;
  return `${(rounded / 1000).toFixed(1)} s`;
}

export function leadSubject(lead: SubjectInput) {
  const raw =
    lead.site === "design"
      ? `[Design] Nuevo proyecto: ${projectTypeLabel[lead.projectType]} — ${lead.name}`
      : `[CNC] Solicitud de cotización: ${materialLabel[lead.material]} — ${lead.name}`;
  return singleLineSubject(raw);
}

export function notificationContent(
  lead: Lead,
  sentAt: Date,
): LeadEmailContent {
  const contact = parseContact(lead.contact);
  const rows: LeadEmailRow[] = [
    { label: "Nombre", value: lead.name },
    {
      label: contact?.kind === "phone" ? "WhatsApp" : "Email",
      value: contact?.value ?? lead.contact,
    },
  ];
  pushRow(rows, "Empresa", lead.company);
  pushRow(rows, "Mensaje", lead.message);

  if (lead.site === "design") {
    rows.push({
      label: "Proyecto",
      value: projectTypeLabel[lead.projectType],
    });
    pushRow(rows, "Ciudad", lead.city);
  } else {
    rows.push(
      { label: "Material", value: materialLabel[lead.material] },
      {
        label: "Estado del proyecto",
        value: projectStateLabel[lead.projectState],
      },
    );
  }

  rows.push({ label: "Idioma del visitante", value: localeLabel[lead.locale] });
  pushRow(rows, "UTM source", lead.utm_source);
  pushRow(rows, "UTM medium", lead.utm_medium);
  pushRow(rows, "UTM campaign", lead.utm_campaign);
  pushRow(rows, "Página", lead.page);
  pushRow(rows, "Referrer", lead.referrer);
  rows.push({ label: "Fecha", value: mexicoCityTimestamp(sentAt) });

  const subject = leadSubject(lead);
  return {
    subject,
    preview: `${brandName(lead.site)} · ${lead.name}`,
    eyebrow: leadEyebrow[lead.site],
    heading: lead.name,
    rows,
    nextStep: nextStepFor(
      lead.site,
      lead.site === "cnc" ? lead.projectState : undefined,
    ),
    reply: contact ?? undefined,
  };
}

export function detailsContent(
  details: LeadDetails,
  sentAt: Date,
): LeadEmailContent {
  const contact = parseContact(details.contact);
  const rows: LeadEmailRow[] = [
    { label: "Nombre", value: details.name },
    {
      label: contact?.kind === "phone" ? "WhatsApp" : "Email",
      value: contact?.value ?? details.contact,
    },
  ];
  pushRow(rows, "Empresa", details.company);
  pushRow(rows, "Mensaje", details.message);

  if (details.site === "design") {
    rows.push({
      label: "Proyecto",
      value: projectTypeLabel[details.projectType],
    });
    pushRow(
      rows,
      "Etapa",
      details.stage ? stageLabel[details.stage] : undefined,
    );
    pushRow(
      rows,
      "Cuándo quiere empezar",
      details.timeline ? timelineLabel[details.timeline] : undefined,
    );
  } else {
    rows.push({ label: "Material", value: materialLabel[details.material] });
    pushRow(
      rows,
      "Cantidad",
      details.quantity ? quantityLabel[details.quantity] : undefined,
    );
    if (details.fileLink) {
      const file = classifyFileLink(details.fileLink);
      if (file.kind === "allowlisted") {
        rows.push({ label: "Archivo", value: file.text, href: file.href });
      } else if (file.kind === "plain") {
        rows.push({ label: "Archivo", value: file.text });
      }
    }
  }

  rows.push(
    { label: "Idioma del visitante", value: localeLabel[details.locale] },
    { label: "Fecha", value: mexicoCityTimestamp(sentAt) },
  );

  return {
    subject: leadSubject(details),
    preview: `Detalles adicionales · ${details.name}`,
    eyebrow: "Detalles adicionales",
    heading: details.name,
    rows,
    nextStep: nextStepFor(
      details.site,
      details.site === "cnc" ? details.projectState : undefined,
    ),
    reply: contact ?? undefined,
  };
}

export function LeadNotificationEmail({
  subject,
  preview,
  eyebrow,
  heading: headingText,
  rows,
  nextStep,
  reply,
}: LeadEmailContent) {
  const action = reply ? replyLink(reply, subject) : undefined;

  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={eyebrowStyle}>{eyebrow}</Text>
          <Heading style={heading}>{headingText}</Heading>
          <Hr style={rule} />
          {rows.map((row, index) => (
            <Section key={`${row.label}-${index}`} style={rowStyle}>
              <Text style={labelStyle}>{row.label}</Text>
              <RowValue row={row} />
            </Section>
          ))}
          {nextStep ? (
            <Text style={nextStepStyle}>Siguiente paso: {nextStep}</Text>
          ) : null}
          {action ? (
            <Button href={action.href} style={replyButton}>
              {action.label}
            </Button>
          ) : null}
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#F3F1EA",
  fontFamily: "Helvetica, Arial, sans-serif",
  margin: "0",
  padding: "32px 16px",
};

const container = {
  backgroundColor: "#ffffff",
  borderRadius: "24px",
  margin: "0 auto",
  maxWidth: "560px",
  padding: "32px",
};

const eyebrowStyle = {
  color: "#483D3C",
  fontSize: "12px",
  fontWeight: "500",
  letterSpacing: "0.18em",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
};

const heading = {
  color: "#483D3C",
  fontSize: "28px",
  fontWeight: "400",
  lineHeight: "1.15",
  margin: "0 0 20px",
};

const rule = {
  borderColor: "#D6D1BE",
  margin: "0 0 8px",
};

const rowStyle = {
  margin: "0",
};

const labelStyle = {
  color: "#9A9FA6",
  fontSize: "13px",
  lineHeight: "1.4",
  margin: "14px 0 0",
};

const valueStyle = {
  color: "#483D3C",
  fontSize: "16px",
  lineHeight: "1.45",
  margin: "2px 0 0",
};

const linkStyle = {
  ...valueStyle,
  textDecoration: "underline",
};

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function RowValue({ row }: { row: LeadEmailRow }) {
  if (row.href && isHttpUrl(row.href)) {
    return (
      <Link href={row.href} style={linkStyle}>
        {row.value}
      </Link>
    );
  }

  return <Text style={valueStyle}>{defangUrls(row.value)}</Text>;
}

const nextStepStyle = {
  color: "#9A9FA6",
  fontSize: "14px",
  lineHeight: "1.45",
  margin: "22px 0 0",
};

const replyButton = {
  backgroundColor: "#483D3C",
  borderRadius: "9999px",
  color: "#E5E1D1",
  display: "inline-block",
  fontSize: "15px",
  marginTop: "28px",
  padding: "12px 20px",
  textDecoration: "none",
};
