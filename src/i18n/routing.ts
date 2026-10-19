import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "as-needed",
  localeDetection: false,
  alternateLinks: false,
  pathnames: {
    "/": "/",
    "/about": {
      es: "/nosotros",
      en: "/about",
    },
    "/services": {
      es: "/servicios",
      en: "/services",
    },
    "/clients": {
      es: "/clientes",
      en: "/clients",
    },
    "/contact": {
      es: "/contacto",
      en: "/contact",
    },
    "/privacy": {
      es: "/privacidad",
      en: "/privacy",
    },
  },
});

export type Pathname = keyof typeof routing.pathnames;

export type Locale = (typeof routing.locales)[number];
