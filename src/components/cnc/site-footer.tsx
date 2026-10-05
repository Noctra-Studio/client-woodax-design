import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function SiteFooter({
  logo,
  designUrl,
  instagramUrl,
  instagramHandle,
}: {
  logo: ReactNode;
  designUrl: string;
  instagramUrl?: string;
  instagramHandle?: string;
}) {
  const t = await getTranslations("cnc.footer");

  return (
    <footer className="scroll-mt-24 px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start gap-6">
        <div translate="no">{logo}</div>
        <p className="text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.6] font-light">
          {t("location")}
        </p>
        {instagramUrl ? (
          <a
            href={instagramUrl}
            className="focus-visible:outline-cnc-white pointer-fine:hover:decoration-current inline-flex min-h-11 items-center underline decoration-current/40 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {instagramHandle ?? instagramUrl}
          </a>
        ) : null}
        <a
          href={designUrl}
          className="focus-visible:outline-cnc-white pointer-fine:hover:decoration-current inline-flex min-h-11 max-w-[62ch] items-center underline decoration-current/40 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {t("designLink")}
        </a>
        <Link
          href="/privacy"
          className="focus-visible:outline-cnc-white pointer-fine:hover:decoration-current inline-flex min-h-11 items-center underline decoration-current/40 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {t("privacy")}
        </Link>
      </div>
    </footer>
  );
}
