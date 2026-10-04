export type CncMaterial = "wood" | "acrylic" | "aluminum";

export type SiteConfig = {
  instagramUrl?: string;
  instagramHandle?: string;
  cncSpecs?: {
    maxThicknessByMaterial?: Partial<Record<CncMaterial, string>>;
    cuttingArea?: string;
  };
};

export const siteConfig: SiteConfig = {};
