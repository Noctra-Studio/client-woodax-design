export type CncMaterial = "wood" | "acrylic" | "aluminum";

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

export type SiteConfig = {
  instagramUrl?: string;
  instagramHandle?: string;
  cncHero: CncHero;
  cncSpecs?: {
    maxThicknessByMaterial?: Partial<Record<CncMaterial, string>>;
    cuttingArea?: string;
  };
};

export const siteConfig: SiteConfig = {
  cncHero: {
    type: "none",
    src: undefined,
    poster: undefined,
    alt: undefined,
  },
};
