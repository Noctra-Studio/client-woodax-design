import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requestSite } from "@/lib/request-site";
import { cn } from "@/lib/utils";

export default async function NotFound() {
  const [t, site] = await Promise.all([
    getTranslations("common"),
    requestSite(),
  ]);
  const isDesign = site === "design";

  return (
    <main
      data-site={site}
      className={cn(
        "mx-auto flex w-full max-w-[62ch] flex-1 flex-col items-start justify-center gap-6 px-5 py-24",
        isDesign
          ? "bg-woodax-paper text-woodax-charcoal"
          : "bg-cnc-bg text-cnc-text",
      )}
    >
      <p
        className={cn(
          "text-xs font-medium tracking-[0.18em] uppercase",
          isDesign ? "text-woodax-charcoal/75" : "text-cnc-muted font-mono",
        )}
      >
        404
      </p>
      <h1
        className={cn(
          "text-[clamp(1.875rem,4vw,3rem)] leading-[1.05] font-normal text-balance",
          isDesign ? "tracking-[-0.01em]" : "tracking-[-0.02em]",
        )}
      >
        {t("notFoundTitle")}
      </h1>
      <p
        className={cn(
          "text-[clamp(1.0625rem,1.1vw,1.125rem)] leading-[1.6] font-medium text-pretty",
          isDesign ? "text-woodax-charcoal/85" : "text-cnc-muted",
        )}
      >
        {t("notFoundDescription")}
      </p>
      <Link
        href="/"
        className="inline-flex min-h-11 items-center underline underline-offset-4"
      >
        {t("backHome")}
      </Link>
    </main>
  );
}
