import { brandAssets, type BrandVariant } from "@/lib/brand-assets";

type BrandIconProps = {
  variant: BrandVariant;
  className?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
  "aria-hidden"?: boolean | "true" | "false";
};

export function BrandIcon({
  variant,
  className,
  loading = "eager",
  "aria-hidden": ariaHidden,
}: BrandIconProps) {
  return (
    // Brand SVGs are served as-is; next/image would emit unscoped preloads.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={brandAssets[variant].icon}
      alt=""
      width={1888}
      height={2157}
      loading={loading}
      decoding="async"
      className={className}
      aria-hidden={ariaHidden}
    />
  );
}
