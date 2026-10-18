import { getLocale, getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { siteConfig, type CncSpecs } from "@/content/site-config";
import { clientEnv } from "@/lib/env";
import { routing, type Locale } from "@/i18n/routing";
import type { LeadOption } from "@/features/leads/components/option-group";

export type LeadCopy = {
  variant: "design" | "cnc";
  locale: Locale;
  title: string;
  subtitle?: string;
  stepIndicator?: {
    step1: string;
    step2: string;
  };
  step1Label?: string;
  step1Question: string;
  options: LeadOption[];
  step1bLabel?: string;
  step1bQuestion?: string;
  stateOptions?: LeadOption[];
  nameLabel: string;
  contactLabel: string;
  cityLabel?: string;
  consentBefore: string;
  consentLink: string;
  next: string;
  back: string;
  submit: string;
  successTitle: string;
  successBody: string;
  stageQuestion?: string;
  stageOptions?: LeadOption[];
  timelineQuestion?: string;
  timelineOptions?: LeadOption[];
  quantityOptions?: LeadOption[];
  whatsapp: string;
  detailsSubmit: string;
  errorGeneric: string;
  errorPrefix: string;
  errors: Record<string, string>;
  closeLabel: string;
  mobileBar: string;
  whatsappHref: string | null;
};

function withGeneric(
  errors: Record<string, string>,
  generic: string,
): Record<string, string> {
  return {
    ...Object.fromEntries(
      Object.entries(errors).map(([key, value]) => [`errors.${key}`, value]),
    ),
    "errors.generic": generic,
  };
}

export async function getLeadCopy(
  variant: "design" | "cnc",
): Promise<LeadCopy> {
  const requested = await getLocale();
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  const whatsappNumber = clientEnv.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : null;

  if (variant === "design") {
    const form = await getTranslations("design.form");
    return {
      variant,
      locale,
      title: form("title"),
      step1Question: form("step1.question"),
      options: [
        { value: "kitchen", label: form("options.kitchen") },
        { value: "closet", label: form("options.closet") },
        { value: "custom-piece", label: form("options.custom-piece") },
        { value: "commercial-space", label: form("options.commercial-space") },
      ],
      nameLabel: form("step2.name"),
      contactLabel: form("step2.contact"),
      cityLabel: form("step2.city"),
      consentBefore: form("consentBefore"),
      consentLink: form("consentLink"),
      next: form("next"),
      back: form("back"),
      submit: form("submit"),
      successTitle: form("success.title"),
      successBody: form("success.body"),
      stageQuestion: form("success.stageQuestion"),
      stageOptions: [
        { value: "idea", label: form("success.stage.idea") },
        { value: "measurements", label: form("success.stage.measurements") },
        {
          value: "ready-to-quote",
          label: form("success.stage.ready-to-quote"),
        },
      ],
      timelineQuestion: form("success.timelineQuestion"),
      timelineOptions: [
        { value: "now", label: form("success.timeline.now") },
        { value: "1-3-months", label: form("success.timeline.1-3-months") },
        { value: "later", label: form("success.timeline.later") },
      ],
      whatsapp: form("success.whatsapp"),
      detailsSubmit: form("success.detailsSubmit"),
      errorGeneric: form("error.generic"),
      errorPrefix: form("errorPrefix"),
      errors: withGeneric(
        {
          name: form("errors.name"),
          contact: form("errors.contact"),
          consent: form("errors.consent"),
          projectType: form("errors.projectType"),
          city: form("errors.city"),
          details: form("errors.details"),
        },
        form("error.generic"),
      ),
      closeLabel: form("close"),
      mobileBar: form("mobileBar"),
      whatsappHref,
    };
  }

  const [form, materials] = await Promise.all([
    getTranslations("cnc.form"),
    getTranslations("cnc.materials"),
  ]);
  const specs = siteConfig.cncSpecs;

  return {
    variant,
    locale,
    title: form("title"),
    subtitle: form("subtitle"),
    stepIndicator: {
      step1: form("stepIndicator", { current: "01", total: "02" }),
      step2: form("stepIndicator", { current: "02", total: "02" }),
    },
    step1Label: form("step1.label"),
    step1Question: form("step1.question"),
    options: [
      {
        value: "wood",
        label: form("materialOptions.wood"),
        meta: resolveMaterialThickness(specs, "wood", locale, materials),
      },
      {
        value: "acrylic",
        label: form("materialOptions.acrylic"),
        meta: resolveMaterialThickness(specs, "acrylic", locale, materials),
      },
      {
        value: "aluminum",
        label: form("materialOptions.aluminum"),
        meta: resolveMaterialThickness(specs, "aluminum", locale, materials),
      },
      { value: "other", label: form("materialOptions.other") },
    ],
    step1bLabel: form("step1b.label"),
    step1bQuestion: form("step1b.question"),
    stateOptions: [
      { value: "file-ready", label: form("stateOptions.file-ready") },
      { value: "needs-help", label: form("stateOptions.needs-help") },
      { value: "idea", label: form("stateOptions.idea") },
    ],
    nameLabel: form("step2.name"),
    contactLabel: form("step2.contact"),
    consentBefore: form("consentBefore"),
    consentLink: form("consentLink"),
    next: form("next"),
    back: form("back"),
    submit: form("submit"),
    successTitle: form("success.title"),
    successBody: form("success.body"),
    quantityOptions: [
      { value: "1-10", label: form("success.quantity.1-10") },
      { value: "11-100", label: form("success.quantity.11-100") },
      { value: "100+", label: form("success.quantity.100+") },
    ],
    whatsapp: form("success.whatsapp"),
    detailsSubmit: form("success.detailsSubmit"),
    errorGeneric: form("error.generic"),
    errorPrefix: form("errorPrefix"),
    errors: withGeneric(
      {
        name: form("errors.name"),
        contact: form("errors.contact"),
        consent: form("errors.consent"),
        material: form("errors.material"),
        projectState: form("errors.projectState"),
        details: form("errors.details"),
      },
      form("error.generic"),
    ),
    closeLabel: form("close"),
    mobileBar: form("mobileBar"),
    whatsappHref,
  };
}

function resolveMaterialThickness(
  specs: CncSpecs | undefined,
  groupKey: "wood" | "acrylic" | "aluminum",
  locale: Locale,
  t: Awaited<ReturnType<typeof getTranslations<"cnc.materials">>>,
): string | undefined {
  if (!specs) return undefined;
  const match =
    specs.maxThicknessByMaterial.find((item) => item.group === groupKey) ??
    (groupKey !== "aluminum"
      ? specs.maxThicknessByMaterial.find((item) => item.group === "panels")
      : undefined);

  if (!match) return undefined;

  return t("thicknessValue", {
    min: formatMm(locale, match.minMm),
    max: formatMm(locale, match.maxMm),
  });
}

function formatMm(locale: Locale, value: number) {
  return new Intl.NumberFormat(locale === "en" ? "en" : "es-MX", {
    maximumFractionDigits: 1,
    useGrouping: false,
  }).format(value);
}
