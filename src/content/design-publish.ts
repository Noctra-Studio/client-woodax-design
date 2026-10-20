import { designAbout, isDesignAboutPublished } from "@/content/design-about";
import {
  designClients,
  isDesignClientsPublished,
} from "@/content/design-clients";
import type { DesignMediaPage } from "@/content/design-media";

/** Adrián approved the four service descriptions (kitchens, closets, custom, commercial). */
export const designServicesApproved = true;

export function isDesignModeFull(): boolean {
  return process.env.NEXT_PUBLIC_DESIGN_MODE === "full";
}

export function isDesignRouteEnabled(page: DesignMediaPage): boolean {
  const full = isDesignModeFull();

  switch (page) {
    case "home":
      return true;
    case "about":
      return full && isDesignAboutPublished(designAbout);
    case "services":
      return full && designServicesApproved;
    case "clients":
      return full && isDesignClientsPublished(designClients);
    case "contact":
      return full;
  }
}
