import { brandAssets } from "@/lib/brand-assets";

type LogoProps = {
  className?: string;
  alt?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
  "aria-hidden"?: boolean | "true" | "false";
};

export function WoodaxLogo({
  className,
  alt = "Woodax Design",
  loading = "eager",
  "aria-hidden": ariaHidden,
}: LogoProps) {
  return (
    // Brand SVGs are served as-is; next/image would emit unscoped preloads.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={brandAssets.design.logo}
      alt={alt}
      width={1595}
      height={472}
      loading={loading}
      decoding="async"
      className={className}
      aria-hidden={ariaHidden}
    />
  );
}
