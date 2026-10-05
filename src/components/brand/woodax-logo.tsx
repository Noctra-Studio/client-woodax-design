import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { brandAssets } from "@/lib/brand-assets";

type LogoProps = {
  className?: string;
  priority?: boolean;
};

export async function WoodaxLogo({ className, priority = false }: LogoProps) {
  const t = await getTranslations("design");

  return (
    <Image
      src={brandAssets.design.logo}
      alt={t("title")}
      width={3000}
      height={1500}
      preload={priority}
      className={className}
    />
  );
}
