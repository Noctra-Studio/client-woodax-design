export const brandAssets = {
  design: {
    logo: "/brand/woodax-design-logo.svg",
    icon: "/brand/woodax-design-icon.svg",
  },
  cnc: {
    logo: "/brand/cnc-woodax-logo.svg",
    icon: "/brand/cnc-woodax-icon.svg",
  },
} as const;

export type BrandVariant = keyof typeof brandAssets;
