import { isProductionDeploy } from "@/lib/deploy-env";

/**
 * Photo slots for Woodax Design.
 * `src: null` is a placeholder: drawn outside production, omitted in production.
 * Files belong at public/images/design/{id}-vN.jpg. Bump N when replacing one.
 */

export const designMediaIds = [
  "home-hero",
  "home-audience-home",
  "home-audience-business",
  "projects-1",
  "projects-2",
  "projects-3",
  "projects-4",
  "projects-5",
  "projects-6",
  "services-kitchens",
  "services-closets",
  "services-custom",
  "services-commercial",
  "about-workshop-1",
  "about-workshop-2",
  "about-workshop-3",
  "about-workshop-4",
  "about-portrait",
  "clients-logo-1",
  "clients-logo-2",
  "clients-logo-3",
  "clients-logo-4",
  "clients-logo-5",
  "clients-logo-6",
  "contact-side",
] as const;

export type DesignMediaId = (typeof designMediaIds)[number];

export type DesignMediaRatio = "4/5" | "4/3" | "3/4" | "1/1";

export type DesignMediaTag =
  "kitchen" | "closet" | "custom-piece" | "commercial-space";

export type DesignMediaPage =
  "home" | "about" | "services" | "clients" | "contact";

type DesignMediaBase = {
  id: DesignMediaId;
  ratio: DesignMediaRatio;
  alt: { es: string; en: string };
  tag?: DesignMediaTag;
  /** object-position when the frame crops the photo. Omit to keep center. */
  focal?: string;
};

export type DesignMediaSlot =
  | (DesignMediaBase & { src: null })
  | (DesignMediaBase & { src: string; width: number; height: number });

const pendingAlt = { es: "TODO(copy)", en: "TODO(copy)" };

export const designMedia: readonly DesignMediaSlot[] = [
  {
    id: "home-hero",
    ratio: "4/5",
    src: designMediaFile("home-hero"),
    width: 1600,
    height: 2000,
    alt: {
      es: "Cocina con isla de concreto, barra de madera y bancos tapizados",
      en: "Kitchen with a concrete island, wooden bar and upholstered stools",
    },
  },
  {
    id: "home-audience-home",
    ratio: "4/5",
    src: designMediaFile("home-audience-home"),
    width: 1600,
    height: 2000,
    alt: {
      es: "Cocina con gabinetes de madera y repisas abiertas",
      en: "Kitchen with wooden cabinets and open shelving",
    },
  },
  {
    id: "home-audience-business",
    ratio: "4/5",
    src: designMediaFile("home-audience-business", 2),
    width: 1600,
    height: 2000,
    alt: {
      es: "Oficina con escritorios de madera y repisas sobre muro",
      en: "Office with wooden desks and wall-mounted shelving",
    },
  },
  {
    id: "projects-1",
    ratio: "4/5",
    src: designMediaFile("projects-1"),
    width: 1600,
    height: 2000,
    alt: {
      es: "Cocina con muro de madera integrado al refrigerador",
      en: "Kitchen with a wooden wall built around the refrigerator",
    },
    tag: "kitchen",
  },
  {
    id: "projects-2",
    ratio: "4/5",
    src: designMediaFile("projects-2"),
    width: 1600,
    height: 2000,
    alt: {
      es: "Clóset de madera con paneles de rejilla",
      en: "Wooden wardrobe with cane panels",
    },
    tag: "closet",
  },
  {
    id: "projects-3",
    ratio: "4/5",
    src: designMediaFile("projects-3"),
    width: 1600,
    height: 2000,
    alt: {
      es: "Escalera flotante con escalones de madera",
      en: "Floating staircase with wooden treads",
    },
    tag: "custom-piece",
  },
  {
    id: "projects-4",
    ratio: "4/5",
    src: designMediaFile("projects-4"),
    width: 1600,
    height: 2000,
    alt: {
      es: "Interior de dulcería con mobiliario a medida",
      en: "Candy shop interior with custom furniture",
    },
    tag: "commercial-space",
  },
  {
    id: "projects-5",
    ratio: "4/5",
    src: designMediaFile("projects-5"),
    width: 1600,
    height: 2000,
    alt: {
      es: "Recámara con clóset de celosía de madera",
      en: "Bedroom with a wooden lattice wardrobe",
    },
    tag: "closet",
  },
  {
    id: "projects-6",
    ratio: "4/5",
    src: designMediaFile("projects-6"),
    width: 1600,
    height: 2000,
    alt: {
      es: "Nicho de madera con repisas iluminadas",
      en: "Wooden niche with lit shelves",
    },
    tag: "custom-piece",
  },
  {
    id: "services-kitchens",
    ratio: "4/3",
    src: designMediaFile("services-kitchens"),
    width: 1600,
    height: 1200,
    alt: {
      es: "Cocina con repisa iluminada y cubierta de concreto",
      en: "Kitchen with a lit shelf and concrete countertop",
    },
  },
  {
    id: "services-closets",
    ratio: "4/3",
    src: designMediaFile("services-closets"),
    width: 1600,
    height: 1200,
    alt: {
      es: "Clóset de madera con rejilla junto a un baño",
      en: "Wooden cane-panel wardrobe beside a bathroom",
    },
  },
  {
    id: "services-custom",
    ratio: "4/3",
    src: designMediaFile("services-custom"),
    width: 1600,
    height: 1200,
    alt: {
      es: "Detalle de unión entre madera y cubierta de piedra",
      en: "Detail of a wood and stone countertop joint",
    },
  },
  {
    id: "services-commercial",
    ratio: "4/3",
    src: designMediaFile("services-commercial", 2),
    width: 1600,
    height: 1200,
    alt: {
      es: "Oficina ejecutiva con escritorio de piedra y muebles iluminados",
      en: "Executive office with a stone desk and lit cabinetry",
    },
  },
  {
    id: "about-workshop-1",
    ratio: "4/3",
    src: designMediaFile("about-workshop-1"),
    width: 1600,
    height: 1200,
    alt: {
      es: "Taller de Woodax con router CNC y tableros de madera",
      en: "Woodax workshop with a CNC router and wood panels",
    },
  },
  {
    id: "about-workshop-2",
    ratio: "4/3",
    // History column crops this 4/3 frame to 4/5. 32% keeps the group of people in frame.
    focal: "32% center",
    src: designMediaFile("about-workshop-2"),
    width: 1600,
    height: 1200,
    alt: {
      es: "Carpinteros trabajando piezas en el taller",
      en: "Carpenters working on pieces in the workshop",
    },
  },
  {
    id: "about-workshop-3",
    ratio: "4/3",
    src: designMediaFile("about-workshop-3"),
    width: 1600,
    height: 1200,
    alt: {
      es: "Sierra escuadradora y bancos de trabajo en el taller",
      en: "Panel saw and workbenches in the workshop",
    },
  },
  { id: "about-workshop-4", ratio: "4/3", src: null, alt: pendingAlt },
  { id: "about-portrait", ratio: "4/5", src: null, alt: pendingAlt },
  { id: "clients-logo-1", ratio: "1/1", src: null, alt: pendingAlt },
  { id: "clients-logo-2", ratio: "1/1", src: null, alt: pendingAlt },
  { id: "clients-logo-3", ratio: "1/1", src: null, alt: pendingAlt },
  { id: "clients-logo-4", ratio: "1/1", src: null, alt: pendingAlt },
  { id: "clients-logo-5", ratio: "1/1", src: null, alt: pendingAlt },
  { id: "clients-logo-6", ratio: "1/1", src: null, alt: pendingAlt },
  {
    id: "contact-side",
    ratio: "3/4",
    src: designMediaFile("contact-side"),
    width: 1200,
    height: 1600,
    alt: {
      es: "Puerta de madera de encino con jaladera negra",
      en: "Oak door with a black handle",
    },
  },
];

const designMediaById = new Map<DesignMediaId, DesignMediaSlot>(
  designMedia.map((slot) => [slot.id, slot]),
);

function assertDesignMedia() {
  const expected = new Set<string>(designMediaIds);
  for (const slot of designMedia) {
    if (!expected.delete(slot.id)) {
      throw new Error(`Duplicate or unknown media slot: ${slot.id}`);
    }
  }
  if (expected.size > 0) {
    throw new Error(`Missing media slots: ${[...expected].join(", ")}`);
  }
}

assertDesignMedia();

export function getDesignMedia(id: DesignMediaId): DesignMediaSlot {
  const slot = designMediaById.get(id);
  if (!slot) throw new Error(`Unknown design media slot: ${id}`);
  return slot;
}

/** Ratio parts × 400 (4/5 → 1600×2000). A 1/1 logo is 1600×1600. */
export function recommendedPixels(ratio: DesignMediaRatio): {
  width: number;
  height: number;
} {
  if (ratio === "1/1") return { width: 1600, height: 1600 };
  const [widthUnits, heightUnits] = ratio.split("/").map(Number) as [
    number,
    number,
  ];
  return { width: widthUnits * 400, height: heightUnits * 400 };
}

export function formatPixels(size: { width: number; height: number }): string {
  return `${size.width}×${size.height}`;
}

export function designMediaFile(id: DesignMediaId, version = 1): string {
  return `/images/design/${id}-v${version}.jpg`;
}

export function designMediaPage(id: DesignMediaId): DesignMediaPage {
  if (id.startsWith("home-") || id.startsWith("projects-")) return "home";
  if (id.startsWith("services-")) return "services";
  if (id.startsWith("about-")) return "about";
  if (id.startsWith("clients-")) return "clients";
  if (id.startsWith("contact-")) return "contact";
  throw new Error(`Media slot ${id} has no page`);
}

export function slotWillRender(slot: DesignMediaSlot): boolean {
  if (slot.src) return true;
  return !isProductionDeploy();
}

/** Empty slots the published page omits, so they are not launch blockers. */
export function slotIsOptionalEmpty(id: DesignMediaId): boolean {
  return (
    id === "about-portrait" ||
    id === "about-workshop-4" ||
    id.startsWith("clients-logo-")
  );
}

export function hasMedia(id: DesignMediaId): boolean {
  return slotWillRender(getDesignMedia(id));
}

export function visibleSlots(prefix: string): DesignMediaSlot[] {
  return designMedia.filter(
    (slot) => slot.id.startsWith(prefix) && slotWillRender(slot),
  );
}

/** Preview shows every project placeholder. Production needs at least three real photos. */
export function featuredProjectSlots(): DesignMediaSlot[] {
  const slots = visibleSlots("projects-");
  if (isProductionDeploy() && slots.length < 3) return [];
  return slots;
}

export function hasAboutPhoto(): boolean {
  return designMedia.some(
    (slot) =>
      slot.src !== null &&
      (slot.id === "about-portrait" || slot.id.startsWith("about-workshop-")),
  );
}
