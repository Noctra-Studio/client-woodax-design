import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "as-needed",
  localeDetection: false,
  alternateLinks: false,
  pathnames: {
    "/": "/",
    "/privacy": {
      es: "/privacidad",
      en: "/privacy",
    },
  },
});

export type Locale = (typeof routing.locales)[number];
