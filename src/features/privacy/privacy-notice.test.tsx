import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import esMessages from "@/messages/es.json";
import enMessages from "@/messages/en.json";
import { PrivacyNoticeBody } from "@/features/privacy/privacy-notice-body";

vi.mock("@/components/consent/cookie-consent-provider", () => ({
  useCookieConsent: () => ({ openPreferences: vi.fn() }),
}));

vi.mock("@/features/privacy/privacy-dialog-provider", () => ({
  closePrivacyDialog: vi.fn(),
}));

describe("PrivacyNoticeBody server rendering", () => {
  it("renders in Spanish and English without calling client hooks from server component", () => {
    const htmlEs = renderToStaticMarkup(
      <NextIntlClientProvider
        locale="es"
        timeZone="America/Mexico_City"
        messages={esMessages}
      >
        <PrivacyNoticeBody />
      </NextIntlClientProvider>,
    );
    expect(htmlEs).toContain("Preferencias de cookies");

    const htmlEn = renderToStaticMarkup(
      <NextIntlClientProvider
        locale="en"
        timeZone="America/Mexico_City"
        messages={enMessages}
      >
        <PrivacyNoticeBody />
      </NextIntlClientProvider>,
    );
    expect(htmlEn).toContain("Cookie preferences");
  });
});
