import { cncLogoAsset } from "@/lib/cnc-nav-logo";

type LogoProps = {
  className?: string;
  alt?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
  variant?: "full" | "nav";
  "aria-hidden"?: boolean | "true" | "false";
};

export function CncLogo({
  className,
  alt = "CNC by Woodax Design",
  loading = "eager",
  variant = "full",
  "aria-hidden": ariaHidden,
}: LogoProps) {
  const asset = cncLogoAsset(variant);

  return (
    // Brand SVGs are served as-is; next/image would emit unscoped preloads.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset.src}
      alt={alt}
      width={asset.width}
      height={asset.height}
      loading={loading}
      decoding="async"
      className={className}
      aria-hidden={ariaHidden}
    />
  );
}
