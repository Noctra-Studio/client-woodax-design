import { useTranslations } from "next-intl";
import { useCookieConsent } from "@/components/consent/cookie-consent-provider";
import { closePrivacyDialog } from "@/features/privacy/privacy-dialog-provider";
import { siteConfig } from "@/content/site-config";
import { cn } from "@/lib/utils";

const gaOptOutUrl = "https://tools.google.com/dlpage/gaoptout";

export function PrivacyNoticeBody({ className }: { className?: string }) {
  const t = useTranslations("privacy");
  const { openPreferences } = useCookieConsent();
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
            <button
              type="button"
              onClick={(event) => {
                openPreferences(event.currentTarget);
                closePrivacyDialog();
              }}
              className="cursor-pointer underline decoration-current/40 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            >
              {chunks}
            </button>
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
