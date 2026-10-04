import Image from "next/image";
import { getTranslations } from "next-intl/server";

type LogoProps = {
  className?: string;
  priority?: boolean;
};

export async function WoodaxLogo({ className, priority = false }: LogoProps) {
  const t = await getTranslations("design");

  return (
    <Image
      src="/brand/woodax-logo.svg"
      alt={t("title")}
      width={160}
      height={40}
      preload={priority}
      className={className}
    />
  );
}
