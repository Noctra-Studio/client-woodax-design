import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import {
  type Lead,
  type LeadDetails,
  parseContact,
} from "@/features/leads/schema";

const projectTypeLabel = {
  kitchen: "Cocina",
  closet: "Clóset",
  "custom-piece": "Pieza a medida",
  "commercial-space": "Espacio comercial",
} as const;

const materialLabel = {
  wood: "Madera",
  acrylic: "Acrílico",
  aluminum: "Aluminio",
  other: "Otro",
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

export type LeadEmailContent = {
  subject: string;
  preview: string;
  eyebrow: string;
  rows: { label: string; value: string }[];
  whatsappHref?: string;
};

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
  rows: { label: string; value: string }[],
  label: string,
  value: string | undefined,
) {
  if (!value) return;
  rows.push({ label, value });
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

export function leadSubject(lead: SubjectInput) {
  if (lead.site === "design") {
    return `[Design] Nuevo proyecto: ${projectTypeLabel[lead.projectType]} — ${lead.name}`;
  }

  return `[CNC] Solicitud de cotización: ${materialLabel[lead.material]} — ${lead.name}`;
}

export function notificationContent(
  lead: Lead,
  sentAt: Date,
): LeadEmailContent {
  const contact = parseContact(lead.contact);
  const rows: { label: string; value: string }[] = [
    { label: "Marca", value: brandName(lead.site) },
    { label: "Nombre", value: lead.name },
    {
      label: contact?.kind === "phone" ? "WhatsApp" : "Email",
      value: contact?.value ?? lead.contact,
    },
  ];

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
  rows.push({ label: "Fecha", value: mexicoCityTimestamp(sentAt) });

  return {
    subject: leadSubject(lead),
    preview: `${brandName(lead.site)} · ${lead.name}`,
    eyebrow: "Nuevo contacto",
    rows,
    whatsappHref:
      contact?.kind === "phone" ? `https://wa.me/${contact.value}` : undefined,
  };
}

export function detailsContent(
  details: LeadDetails,
  sentAt: Date,
): LeadEmailContent {
  const contact = parseContact(details.contact);
  const rows: { label: string; value: string }[] = [
    { label: "Marca", value: brandName(details.site) },
    { label: "Nombre", value: details.name },
    {
      label: contact?.kind === "phone" ? "WhatsApp" : "Email",
      value: contact?.value ?? details.contact,
    },
  ];

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
  }

  rows.push(
    { label: "Idioma del visitante", value: localeLabel[details.locale] },
    { label: "Fecha", value: mexicoCityTimestamp(sentAt) },
  );

  const base = leadSubject(details);
  return {
    subject: `${base} · detalles`,
    preview: `Detalles adicionales · ${details.name}`,
    eyebrow: "Detalles adicionales",
    rows,
    whatsappHref:
      contact?.kind === "phone" ? `https://wa.me/${contact.value}` : undefined,
  };
}

export function LeadNotificationEmail({
  preview,
  eyebrow,
  rows,
  whatsappHref,
}: LeadEmailContent) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={eyebrowStyle}>{eyebrow}</Text>
          <Heading style={heading}>{rows[0]?.value}</Heading>
          <Hr style={rule} />
          {rows.map((row) => (
            <Section key={row.label} style={rowStyle}>
              <Text style={labelStyle}>{row.label}</Text>
              <Text style={valueStyle}>{row.value}</Text>
            </Section>
          ))}
          {whatsappHref ? (
            <Button href={whatsappHref} style={whatsappButton}>
              Responder por WhatsApp
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

const whatsappButton = {
  backgroundColor: "#483D3C",
  borderRadius: "9999px",
  color: "#E5E1D1",
  display: "inline-block",
  fontSize: "15px",
  marginTop: "28px",
  padding: "12px 20px",
  textDecoration: "none",
};
