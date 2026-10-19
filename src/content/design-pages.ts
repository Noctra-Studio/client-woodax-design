import { designAbout, isDesignAboutPublished } from "@/content/design-about";
import { designClients } from "@/content/design-clients";
import { designGallery } from "@/content/design-gallery";
import type { Pathname } from "@/i18n/routing";
import { isDesignFull } from "@/lib/seo";

const full = isDesignFull();

export const designPages = {
  home: { href: "/", enabled: true },
  about: {
    href: "/about",
    enabled: full && isDesignAboutPublished(designAbout),
  },
  services: { href: "/services", enabled: full },
  clients: { href: "/clients", enabled: full && designClients.length > 0 },
  contact: { href: "/contact", enabled: full },
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

export function designSectionAnchors() {
  return [
    ...(designGallery.length > 0
      ? [{ id: "proyectos", labelKey: "projects" as const }]
      : []),
    { id: "proceso", labelKey: "process" as const },
    { id: "contacto", labelKey: "contact" as const },
  ] as const;
}
