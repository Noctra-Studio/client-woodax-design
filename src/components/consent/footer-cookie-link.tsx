"use client";

import type { ReactNode } from "react";
import { useCookieConsent } from "@/components/consent/cookie-consent-provider";

export function FooterCookieLink({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const { openPreferences } = useCookieConsent();

  return (
    <button
      type="button"
      className={className}
      onClick={(event) => openPreferences(event.currentTarget)}
    >
      {children}
    </button>
  );
}
