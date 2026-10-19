import {
  formatMmSize,
  formatThicknessMm,
  thicknessRangeForGroup,
} from "@/lib/cnc-specs";

export const cncThicknessMaterials = [
  "wood",
  "mdf",
  "melamine",
  "plywood",
  "acrylic",
  "plastic",
  "corian",
  "aluminum",
] as const;

export type CncThicknessMaterial = (typeof cncThicknessMaterials)[number];

export type CncThicknessRange = {
  group: string;
  materials: readonly CncThicknessMaterial[];
  minMm: number;
  maxMm: number;
};

export type CncHeroAlt = {
  es: string;
  en: string;
};

export type CncHeroVideoSrc = {
  webm?: string;
  mp4?: string;
  mobileMp4?: string;
  desktopMp4?: string;
};

export type CncHero =
  | {
      type: "none";
      src?: undefined;
      poster?: undefined;
      mobilePoster?: undefined;
      alt?: undefined;
    }
  | {
      type: "image";
      src: string;
      poster?: undefined;
      mobilePoster?: string;
      alt: CncHeroAlt;
    }
  | {
      type: "video";
      src: CncHeroVideoSrc;
      poster: string;
      mobilePoster?: string;
      alt: CncHeroAlt;
    };

export type CncSpecsImage = {
  src: string;
  width: number;
  height: number;
  alt: CncHeroAlt;
};

export type CncSpecs = {
  cuttingArea: { widthMm: number; lengthMm: number };
  /** Sheets accepted when the client supplies the material. */
  standardSheet?: { widthMm: number; lengthMm: number };
  maxThicknessByMaterial: readonly CncThicknessRange[];
  machineImage?: CncSpecsImage;
};

export type CncFileFormat = "DXF" | "DWG" | "SVG" | "PDF";

/** Small-project turnaround. Approved by Adrián 2026-10-18. */
export type CncDelivery = {
  smallProjectFromBusinessDays: number;
};

export const cncMaterialKeys = [
  "wood",
  "acrylic",
  "aluminum",
  "other",
] as const;

export type CncMaterialKey = (typeof cncMaterialKeys)[number];

export type LocaleText = {
  readonly es: string;
  readonly en: string;
};

export type CncFaqSource = {
  id: string;
  question: LocaleText;
};

export type CncOffer = {
  quoteBusinessHours: number;
  /** `{days}` is `cncDelivery.smallProjectFromBusinessDays`. */
  smallProjectLead: LocaleText;
  materialSupply: LocaleText;
  materialAnswer: LocaleText;
  invoicing: LocaleText;
  quoteWithin: LocaleText;
  quoteShort: LocaleText;
  delivery: LocaleText;
  orderAnswer: LocaleText;
  filesAnswer: LocaleText;
  pickupAnswer: LocaleText;
  sizeAnswer: LocaleText;
  pricingAnswer: LocaleText;
  logistics: LocaleText;
  location: {
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
    label: LocaleText;
  };
  areaServed: string;
  trust: readonly LocaleText[];
  successFileReady: LocaleText;
  successFollowUp: LocaleText;
  emailCommitment: string;
  emailNextStep: {
    readonly "file-ready": string;
    readonly "needs-help": string;
    readonly idea: string;
  };
  faq: readonly CncFaqSource[];
};

export type SiteConfig = {
  privacyEmail: string;
  designEmail: string;
  cncEmail: string;
  instagramUrl?: string;
  instagramHandle?: string;
  facebookUrl?: string;
  cncHero: CncHero;
  cncSpecs?: CncSpecs;
  cncDelivery: CncDelivery;
  cncMaterialLabels: Record<CncMaterialKey, LocaleText>;
  cncOffer: CncOffer;
  cncFileFormats: readonly CncFileFormat[];
  showFileFormats: boolean;
  /** Pricing FAQ stays unpublished until Adrián approves the answer. */
  faqPricing: boolean;
};

export const siteConfig: SiteConfig = {
  privacyEmail: "privacidad@woodax.design",
  designEmail: "hello@woodax.design",
  cncEmail: "cnc@woodax.design",
  // Launch blocker: instagramUrl and facebookUrl cannot stay "#" in production.
  instagramUrl: "https://www.instagram.com/woodaxdesign",
  facebookUrl: "https://www.facebook.com/share/1AkP7NEJno/",
  cncDelivery: {
    smallProjectFromBusinessDays: 2,
  },
  cncMaterialLabels: {
    wood: {
      es: "Madera, MDF, Melamina y Triplay",
      en: "Wood, MDF, Melamine and Plywood",
    },
    acrylic: {
      es: "Acrílico, Plástico y Corian",
      en: "Acrylic, Plastic and Corian",
    },
    aluminum: {
      es: "Aluminio",
      en: "Aluminum",
    },
    other: {
      es: "Otro",
      en: "Other",
    },
  },
  cncOffer: {
    quoteBusinessHours: 48,
    smallProjectLead: {
      es: "{days} días hábiles",
      en: "{days} business days",
    },
    materialSupply: {
      es: "Nosotros lo surtimos o tú lo traes",
      en: "We can supply it, or you bring your own",
    },
    materialAnswer: {
      es: "Las dos opciones. Si nosotros lo surtimos, va incluido en la cotización; si lo traes tú, recibimos hojas estándar de {sheet} (nuestra área de trabajo es de {area}).",
      en: "Both options. If we supply it, it's included in the quote; if you bring it, we accept standard sheets of {sheet} (our work area is {area}).",
    },
    invoicing: {
      es: "Sí, emitimos CFDI.",
      en: "We issue CFDI invoices.",
    },
    quoteWithin: {
      es: "en {hours} horas hábiles o menos",
      en: "within {hours} business hours or less",
    },
    quoteShort: {
      es: "Te cotizamos en {hours} horas hábiles o menos. Para hacerlo rápido, mándanos tu archivo o medidas, el material, el espesor y la cantidad de piezas.",
      en: "We quote within {hours} business hours or less. To keep it fast, send your file or dimensions, the material, the thickness and the number of parts.",
    },
    delivery: {
      es: "Proyectos pequeños desde {lead}; proyectos grandes según volumen",
      en: "Small projects from {lead}; larger projects depend on volume",
    },
    orderAnswer: {
      es: "Proyectos pequeños desde {lead}; los grandes según volumen, te damos fecha en la cotización.",
      en: "Small projects from {lead}; larger projects depend on volume. We'll give you a date in the quote.",
    },
    filesAnswer: {
      es: "{formats}. Si solo tienes la idea o un boceto, te ayudamos.",
      en: "{formats}. If you only have the idea or a sketch, we'll help.",
    },
    pickupAnswer: {
      es: "Puedes recoger en nuestro taller en {locality} o lo entregamos; la zona y el costo de entrega se confirman en la cotización.",
      en: "You can pick up at our shop in {locality}, or we deliver; the delivery area and cost are confirmed in the quote.",
    },
    sizeAnswer: {
      es: "Hasta {area} por pieza, con espesores de {wood} en madera y derivados, {plastic} en acrílico y plásticos, y {aluminum} en aluminio.",
      en: "Up to {area} per part, with thicknesses of {wood} in wood and wood-based materials, {plastic} in acrylic and plastics, and {aluminum} in aluminum.",
    },
    pricingAnswer: {
      es: "Depende del material, espesor, tiempo de corte y cantidad. Te damos el precio exacto en la cotización, sin compromiso.",
      en: "It depends on the material, thickness, cutting time and quantity. We give you the exact price in the quote, with no obligation.",
    },
    logistics: {
      es: "Recolección en taller o entrega",
      en: "Pick up at our shop or we deliver",
    },
    location: {
      addressLocality: "Corregidora",
      addressRegion: "Querétaro",
      addressCountry: "MX",
      label: {
        es: "Corregidora, Querétaro",
        en: "Corregidora, Querétaro",
      },
    },
    areaServed: "Querétaro",
    trust: [
      {
        es: "Cotización en {hours} horas hábiles",
        en: "Quote within {hours} business hours",
      },
      {
        es: "Facturamos (CFDI)",
        en: "CFDI invoices",
      },
      {
        es: "Material tuyo o nuestro",
        en: "Your material or ours",
      },
      {
        es: "Recolección o entrega",
        en: "Pick up or delivery",
      },
    ],
    successFileReady: {
      es: "Responde al correo que te enviaremos con tu archivo ({formats}). Te cotizamos en {hours} horas hábiles o menos.",
      en: "Reply to the email we'll send you with your file ({formats}). We'll quote within {hours} business hours or less.",
    },
    successFollowUp: {
      es: "Te contactamos en {hours} horas hábiles o menos. Si tienes referencias o medidas, tenlas a la mano.",
      en: "We'll contact you within {hours} business hours or less. If you have references or dimensions, have them ready.",
    },
    emailCommitment: "Compromiso: cotizar en {hours} horas hábiles.",
    emailNextStep: {
      "file-ready":
        "Pide el archivo ({formats}) y confirma material y espesor. {commitment}",
      "needs-help":
        "Ofrece apoyo para preparar el archivo; pide medidas y referencia. {commitment}",
      idea: "Pide referencias, medidas aproximadas y cantidad. {commitment}",
    },
    faq: [
      {
        id: "pricing",
        question: {
          es: "¿Cuánto cuesta?",
          en: "How much does it cost?",
        },
      },
      {
        id: "size",
        question: {
          es: "¿Qué tamaño máximo pueden cortar?",
          en: "What is the largest size you can cut?",
        },
      },
      {
        id: "quote",
        question: {
          es: "¿Cuánto tardan en cotizar?",
          en: "How long does a quote take?",
        },
      },
      {
        id: "order",
        question: {
          es: "¿Cuánto tarda mi pedido?",
          en: "How long does my order take?",
        },
      },
      {
        id: "material",
        question: {
          es: "¿Ustedes ponen el material?",
          en: "Do you supply the material?",
        },
      },
      {
        id: "files",
        question: {
          es: "¿Qué archivos aceptan?",
          en: "Which files do you accept?",
        },
      },
      {
        id: "logistics",
        question: {
          es: "¿Recogen o entregan?",
          en: "Do you pick up or deliver?",
        },
      },
      {
        id: "volume",
        question: {
          es: "¿Hacen piezas sueltas o solo volumen?",
          en: "Do you make single parts or only volume?",
        },
      },
      {
        id: "invoice",
        question: {
          es: "¿Facturan?",
          en: "Do you issue invoices?",
        },
      },
    ],
  },
  cncFileFormats: ["DXF", "DWG", "SVG", "PDF"],
  showFileFormats: true,
  faqPricing: false,
  cncHero: {
    type: "video",
    src: {
      mobileMp4: "/media/cnc/cnc-hero-mobile-v2.mp4",
      desktopMp4: "/media/cnc/cnc-hero-desktop-v2.mp4",
      mp4: "/media/cnc/cnc-hero-desktop-v2.mp4",
    },
    poster: "/media/cnc/cnc-hero-desktop-poster-v2.jpg",
    mobilePoster: "/media/cnc/cnc-hero-mobile-poster-v2.jpg",
    alt: {
      es: "Router CNC SIDECO ProCut SIR-1325VI en el taller",
      en: "SIDECO ProCut SIR-1325VI CNC router in the workshop",
    },
  },
  cncSpecs: {
    cuttingArea: { widthMm: 1300, lengthMm: 2500 },
    standardSheet: { widthMm: 1220, lengthMm: 2440 },
    maxThicknessByMaterial: [
      {
        group: "wood",
        materials: ["wood", "mdf", "melamine", "plywood"],
        minMm: 3,
        maxMm: 40,
      },
      {
        group: "acrylic",
        materials: ["acrylic", "plastic", "corian"],
        minMm: 3,
        maxMm: 40,
      },
      {
        group: "aluminum",
        materials: ["aluminum"],
        minMm: 0.5,
        maxMm: 5,
      },
    ],
    machineImage: {
      src: "/media/cnc/cnc-maquina-frente.jpg",
      width: 1200,
      height: 1500,
      alt: {
        es: "Router CNC SIDECO ProCut SIR-1325VI en el taller",
        en: "SIDECO ProCut SIR-1325VI CNC router in the workshop",
      },
    },
  },
};

export function siteEmail(site: "design" | "cnc"): string {
  return site === "cnc" ? siteConfig.cncEmail : siteConfig.designEmail;
}

export function hasCncCapabilities(
  specs: CncSpecs | undefined,
): specs is CncSpecs {
  if (!specs) return false;
  const { widthMm, lengthMm } = specs.cuttingArea;
  return (
    (widthMm > 0 && lengthMm > 0) || specs.maxThicknessByMaterial.length > 0
  );
}

/** Real profile URLs. The temporary "#" placeholder stays out of nav, contact and JSON-LD. */
export function publishedSocialUrl(
  url: string | undefined,
): string | undefined {
  if (!url || url === "#") return undefined;
  return url;
}

/** schema.org sameAs. Drops "#" and temporary Facebook /share/ links. Visible links stay as they are. */
export function sameAsUrls(urls: ReadonlyArray<string | undefined>): string[] {
  return urls.flatMap((url) => {
    if (!url || url === "#" || url.includes("/share/")) return [];
    return [url];
  });
}

export function cncLocale(locale: string): "es" | "en" {
  return locale === "en" ? "en" : "es";
}

export function isCncMaterialKey(value: string): value is CncMaterialKey {
  return (cncMaterialKeys as readonly string[]).includes(value);
}

export function cncMaterialLabel(key: CncMaterialKey, locale: string): string {
  return siteConfig.cncMaterialLabels[key][cncLocale(locale)];
}

export function cncFileFormatList(locale: string): string {
  const conjunction = cncLocale(locale) === "en" ? "or" : "o";
  const formats = siteConfig.cncFileFormats;
  if (formats.length <= 1) return formats[0] ?? "";
  const last = formats[formats.length - 1] ?? "";
  return `${formats.slice(0, -1).join(", ")} ${conjunction} ${last}`;
}

function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key];
    return value === undefined ? "" : String(value);
  });
}

function filled(
  template: string,
  values: Record<string, string | number>,
  required: readonly string[],
): string {
  if (required.some((key) => !values[key])) return "";
  return fill(template, values);
}

export function cncSmallProjectLead(locale: string): string {
  const loc = cncLocale(locale);
  const days = siteConfig.cncDelivery.smallProjectFromBusinessDays;
  if (days === 1) {
    return loc === "en" ? "1 business day" : "1 día hábil";
  }
  return fill(siteConfig.cncOffer.smallProjectLead[loc], { days });
}

export function cncQuoteWithin(locale: string): string {
  return fill(siteConfig.cncOffer.quoteWithin[cncLocale(locale)], {
    hours: siteConfig.cncOffer.quoteBusinessHours,
  });
}

export function cncDeliveryText(locale: string): string {
  const loc = cncLocale(locale);
  return fill(siteConfig.cncOffer.delivery[loc], {
    lead: cncSmallProjectLead(loc),
  });
}

export function cncTrustItems(locale: string): string[] {
  const loc = cncLocale(locale);
  return siteConfig.cncOffer.trust.map((item) =>
    fill(item[loc], { hours: siteConfig.cncOffer.quoteBusinessHours }),
  );
}

export function cncSuccessBody(projectState: string, locale: string): string {
  const loc = cncLocale(locale);
  const template =
    projectState === "file-ready"
      ? siteConfig.cncOffer.successFileReady[loc]
      : siteConfig.cncOffer.successFollowUp[loc];
  return fill(template, {
    formats: cncFileFormatList(loc),
    hours: siteConfig.cncOffer.quoteBusinessHours,
  });
}

export function cncEmailNextStep(
  projectState: "file-ready" | "needs-help" | "idea",
): string {
  const commitment = fill(siteConfig.cncOffer.emailCommitment, {
    hours: siteConfig.cncOffer.quoteBusinessHours,
  });
  return fill(siteConfig.cncOffer.emailNextStep[projectState], {
    formats: cncFileFormatList("es"),
    commitment,
  });
}

export type CncFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export function cncFaqItems(
  locale: string,
  volumeAnswer: string,
): CncFaqItem[] {
  const loc = cncLocale(locale);
  const offer = siteConfig.cncOffer;
  const specs = siteConfig.cncSpecs;
  const values = {
    hours: offer.quoteBusinessHours,
    lead: cncSmallProjectLead(loc),
    formats: cncFileFormatList(loc),
    locality: offer.location.addressLocality,
    area: formatMmSize(loc, specs?.cuttingArea),
    sheet: formatMmSize(loc, specs?.standardSheet),
    wood: formatThicknessMm(loc, thicknessRangeForGroup(specs, "wood")),
    plastic: formatThicknessMm(loc, thicknessRangeForGroup(specs, "acrylic")),
    aluminum: formatThicknessMm(loc, thicknessRangeForGroup(specs, "aluminum")),
  };
  const materialAnswer = filled(offer.materialAnswer[loc], values, [
    "sheet",
    "area",
  ]);
  const answers: Record<string, string> = {
    pricing: offer.pricingAnswer[loc],
    size: filled(offer.sizeAnswer[loc], values, [
      "area",
      "wood",
      "plastic",
      "aluminum",
    ]),
    material: materialAnswer || offer.materialSupply[loc],
    invoice: offer.invoicing[loc],
    quote: fill(offer.quoteShort[loc], values),
    order: fill(offer.orderAnswer[loc], values),
    files: fill(offer.filesAnswer[loc], values),
    logistics: fill(offer.pickupAnswer[loc], values),
    volume: volumeAnswer,
  };

  return offer.faq.flatMap((item) => {
    if (item.id === "pricing" && !siteConfig.faqPricing) return [];
    const question = item.question[loc];
    const answer = answers[item.id] ?? "";
    if (!question || !answer) return [];
    return [{ id: item.id, question, answer }];
  });
}

export function cncSectionAnchors() {
  return [
    { id: "servicio", labelKey: "how" },
    ...(hasCncCapabilities(siteConfig.cncSpecs)
      ? [{ id: "capacidades", labelKey: "capabilities" as const }]
      : []),
    { id: "materiales", labelKey: "materials" },
    { id: "contacto", labelKey: "contact" },
  ] as const;
}
