import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { brandAssets } from "@/lib/brand-assets";

type LogoProps = {
  className?: string;
  priority?: boolean;
};

export async function CncLogo({ className, priority = false }: LogoProps) {
  const t = await getTranslations("cnc");

  return (
    <Image
      src={brandAssets.cnc.logo}
      alt={t("title")}
      width={1787}
      height={733}
      preload={priority}
      className={className}
    />
  );
}
