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
};

export type CncHero =
  | {
      type: "none";
      src?: undefined;
      poster?: undefined;
      alt?: undefined;
    }
  | {
      type: "image";
      src: string;
      poster?: undefined;
      alt: CncHeroAlt;
    }
  | {
      type: "video";
      src: CncHeroVideoSrc;
      poster: string;
      alt: CncHeroAlt;
    };

export type CncSpecs = {
  cuttingArea: { widthMm: number; lengthMm: number };
  maxThicknessByMaterial: readonly CncThicknessRange[];
};

export type SiteConfig = {
  instagramUrl?: string;
  instagramHandle?: string;
  facebookUrl?: string;
  cncHero: CncHero;
  cncSpecs?: CncSpecs;
};

export const siteConfig: SiteConfig = {
  // Launch blocker: instagramUrl and facebookUrl cannot stay "#" in production.
  instagramUrl: "#",
  facebookUrl: "#",
  cncHero: {
    type: "none",
    src: undefined,
    poster: undefined,
    alt: undefined,
  },
  cncSpecs: {
    cuttingArea: { widthMm: 1300, lengthMm: 2500 },
    maxThicknessByMaterial: [
      {
        group: "panels",
        materials: [
          "wood",
          "mdf",
          "melamine",
          "plywood",
          "acrylic",
          "plastic",
          "corian",
        ],
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
  },
};

export function hasCncCapabilities(specs: CncSpecs | undefined): specs is CncSpecs {
  if (!specs) return false;
  const { widthMm, lengthMm } = specs.cuttingArea;
  return (
    (widthMm > 0 && lengthMm > 0) || specs.maxThicknessByMaterial.length > 0
  );
}

/** Real profile URLs. The temporary "#" placeholder stays out of nav, contact and JSON-LD. */
export function publishedSocialUrl(url: string | undefined): string | undefined {
  if (!url || url === "#") return undefined;
  return url;
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
