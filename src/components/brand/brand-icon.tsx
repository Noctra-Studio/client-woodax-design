import Image from "next/image";
import { brandAssets, type BrandVariant } from "@/lib/brand-assets";

type BrandIconProps = {
  variant: BrandVariant;
  className?: string;
  priority?: boolean;
};

export function BrandIcon({
  variant,
  className,
  priority = false,
}: BrandIconProps) {
  return (
    <Image
      src={brandAssets[variant].icon}
      alt=""
      width={1888}
      height={2157}
      preload={priority}
      className={className}
    />
  );
}
