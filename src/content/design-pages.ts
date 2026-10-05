import { designAbout, isDesignAboutPublished } from "@/content/design-about";
import { designClients } from "@/content/design-clients";
import type { Pathname } from "@/i18n/routing";

export const designPages = {
  home: { href: "/", enabled: true },
  about: { href: "/about", enabled: isDesignAboutPublished(designAbout) },
  services: { href: "/services", enabled: true },
  clients: { href: "/clients", enabled: designClients.length > 0 },
  contact: { href: "/contact", enabled: true },
} as const satisfies Record<string, { href: Pathname; enabled: boolean }>;

export type DesignPageKey = keyof typeof designPages;

export const designPageKeys = [
  "home",
  "about",
  "services",
  "clients",
  "contact",
] as const satisfies readonly DesignPageKey[];

export const designNavKeys = ["about", "services", "clients"] as const;
