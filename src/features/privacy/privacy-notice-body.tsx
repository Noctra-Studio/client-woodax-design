import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const contactEmail = "hello@woodax.design";
const gaOptOutUrl = "https://tools.google.com/dlpage/gaoptout";

export function PrivacyNoticeBody({ className }: { className?: string }) {
  const t = useTranslations("privacy");
  const [beforeEmail, afterEmail] = t("contact").split(contactEmail);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 text-[17px] leading-relaxed font-medium",
        className,
      )}
    >
      <p>{t("intro")}</p>
      <p>{t("purpose")}</p>
      <p>{t("sale")}</p>
      {/* Copy pending Adrián's approval. */}
      <p>
        {t.rich("analytics", {
          optOut: (chunks) => (
            <a
              href={gaOptOutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-current/40 underline-offset-4"
            >
              {chunks}
            </a>
          ),
        })}
      </p>
      <p>
        {beforeEmail}
        <a
          href={`mailto:${contactEmail}`}
          className="underline decoration-current/40 underline-offset-4"
        >
          {contactEmail}
        </a>
        {afterEmail}
      </p>
    </div>
  );
}
