"use client";

import type { ReactNode } from "react";
import { useCookieConsent } from "@/components/consent/cookie-consent-provider";
import { closePrivacyDialog } from "@/features/privacy/privacy-dialog-provider";

export function PrivacyCookieButton({ children }: { children: ReactNode }) {
  const { openPreferences } = useCookieConsent();

  return (
    <button
      type="button"
      onClick={(event) => {
        openPreferences(event.currentTarget);
        closePrivacyDialog();
      }}
      className="cursor-pointer underline decoration-current/40 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
    >
      {children}
    </button>
  );
}
