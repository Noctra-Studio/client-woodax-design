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
  maxThicknessByMaterial: readonly CncThicknessRange[];
  machineImage?: CncSpecsImage;
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
  instagramUrl: "https://www.instagram.com/woodaxdesign",
  facebookUrl: "https://www.facebook.com/share/1AkP7NEJno/",
  cncHero: {
    type: "video",
    src: {
      mobileMp4: "/media/cnc/cnc-hero-mobile.mp4",
      desktopMp4: "/media/cnc/cnc-hero-desktop.mp4",
      mp4: "/media/cnc/cnc-hero-desktop.mp4",
    },
    poster: "/media/cnc/cnc-hero-desktop-poster.jpg",
    mobilePoster: "/media/cnc/cnc-hero-mobile-poster.jpg",
    alt: {
      es: "Router CNC SIDECO ProCut SIR-1325VI en el taller",
      en: "SIDECO ProCut SIR-1325VI CNC router in the workshop",
    },
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
