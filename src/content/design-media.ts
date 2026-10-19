import { isProductionDeploy } from "@/lib/deploy-env";

/**
 * Photo slots for Woodax Design.
 * `src: null` is a placeholder: drawn outside production, omitted in production.
 * Files belong at public/images/design/{id}-vN.jpg. Bump N when replacing one.
 */

export const designMediaIds = [
  "home-hero",
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
  | "kitchen"
  | "closet"
  | "custom-piece"
  | "commercial-space";

export type DesignMediaPage =
  | "home"
  | "about"
  | "services"
  | "clients"
  | "contact";

type DesignMediaBase = {
  id: DesignMediaId;
  ratio: DesignMediaRatio;
  alt: { es: string; en: string };
  tag?: DesignMediaTag;
};

export type DesignMediaSlot =
  | (DesignMediaBase & { src: null })
  | (DesignMediaBase & { src: string; width: number; height: number });

const pendingAlt = { es: "TODO(copy)", en: "TODO(copy)" };

export const designMedia: readonly DesignMediaSlot[] = [
  { id: "home-hero", ratio: "4/5", src: null, alt: pendingAlt },
  {
    id: "projects-1",
    ratio: "4/5",
    src: null,
    alt: pendingAlt,
    tag: "kitchen",
  },
  {
    id: "projects-2",
    ratio: "4/5",
    src: null,
    alt: pendingAlt,
    tag: "closet",
  },
  {
    id: "projects-3",
    ratio: "4/5",
    src: null,
    alt: pendingAlt,
    tag: "custom-piece",
  },
  {
    id: "projects-4",
    ratio: "4/5",
    src: null,
    alt: pendingAlt,
    tag: "commercial-space",
  },
  {
    id: "projects-5",
    ratio: "4/5",
    src: null,
    alt: pendingAlt,
    tag: "kitchen",
  },
  {
    id: "projects-6",
    ratio: "4/5",
    src: null,
    alt: pendingAlt,
    tag: "closet",
  },
  { id: "services-kitchens", ratio: "4/3", src: null, alt: pendingAlt },
  { id: "services-closets", ratio: "4/3", src: null, alt: pendingAlt },
  { id: "services-custom", ratio: "4/3", src: null, alt: pendingAlt },
  { id: "services-commercial", ratio: "4/3", src: null, alt: pendingAlt },
  { id: "about-workshop-1", ratio: "4/3", src: null, alt: pendingAlt },
  { id: "about-workshop-2", ratio: "4/3", src: null, alt: pendingAlt },
  { id: "about-workshop-3", ratio: "4/3", src: null, alt: pendingAlt },
  { id: "about-workshop-4", ratio: "4/3", src: null, alt: pendingAlt },
  { id: "about-portrait", ratio: "4/5", src: null, alt: pendingAlt },
  { id: "clients-logo-1", ratio: "1/1", src: null, alt: pendingAlt },
  { id: "clients-logo-2", ratio: "1/1", src: null, alt: pendingAlt },
  { id: "clients-logo-3", ratio: "1/1", src: null, alt: pendingAlt },
  { id: "clients-logo-4", ratio: "1/1", src: null, alt: pendingAlt },
  { id: "clients-logo-5", ratio: "1/1", src: null, alt: pendingAlt },
  { id: "clients-logo-6", ratio: "1/1", src: null, alt: pendingAlt },
  { id: "contact-side", ratio: "3/4", src: null, alt: pendingAlt },
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
  if (id === "home-hero" || id.startsWith("projects-")) return "home";
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
