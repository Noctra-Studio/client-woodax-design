import { visibleSlots } from "@/content/design-media";
import { isDesignRouteEnabled } from "@/content/design-publish";
import type { Pathname } from "@/i18n/routing";

export const designPages = {
  home: { href: "/", enabled: true },
  about: { href: "/about", enabled: isDesignRouteEnabled("about") },
  services: { href: "/services", enabled: isDesignRouteEnabled("services") },
  clients: { href: "/clients", enabled: isDesignRouteEnabled("clients") },
  contact: { href: "/contact", enabled: isDesignRouteEnabled("contact") },
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
    ...(visibleSlots("projects-").length > 0
      ? [{ id: "proyectos", labelKey: "projects" as const }]
      : []),
    { id: "proceso", labelKey: "process" as const },
    { id: "contacto", labelKey: "contact" as const },
  ] as const;
}
