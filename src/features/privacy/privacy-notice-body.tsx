import { useTranslations } from "next-intl";
import { siteConfig } from "@/content/site-config";
import { PrivacyCookieButton } from "@/features/privacy/privacy-cookie-button";
import { cn } from "@/lib/utils";

const gaOptOutUrl = "https://tools.google.com/dlpage/gaoptout";

export function PrivacyNoticeBody({ className }: { className?: string }) {
  const t = useTranslations("privacy");
  const { privacyEmail } = siteConfig;
  const [beforeEmail, afterEmail] = t("contact", { email: privacyEmail }).split(
    privacyEmail,
  );

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
      <p>
        {t.rich("cookies", {
          preferences: (chunks) => (
            <PrivacyCookieButton>{chunks}</PrivacyCookieButton>
          ),
        })}
      </p>
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
          href={`mailto:${privacyEmail}`}
          className="underline decoration-current/40 underline-offset-4"
        >
          {privacyEmail}
        </a>
        {afterEmail}
      </p>
    </div>
  );
}
