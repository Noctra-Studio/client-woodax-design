import { brandAssets, type BrandVariant } from "@/lib/brand-assets";
import { cncLogoAsset } from "@/lib/cnc-nav-logo";

export function NavLogoPreload({ variant }: { variant: BrandVariant }) {
  const desktopSrc =
    variant === "cnc" ? cncLogoAsset("nav").src : brandAssets.design.logo;
  const mobileSrc = brandAssets[variant].icon;

  return (
    <>
      <link
        rel="preload"
        as="image"
        href={desktopSrc}
        media="(min-width: 768px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href={mobileSrc}
        media="(max-width: 767px)"
        fetchPriority="high"
      />
    </>
  );
}
