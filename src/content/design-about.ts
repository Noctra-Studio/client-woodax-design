import { hasAboutPhoto } from "@/content/design-media";
import { isProductionDeploy } from "@/lib/deploy-env";

export type DesignAbout = {
  placeholder: boolean;
  story: { es: string; en: string } | null;
};

export const designAbout: DesignAbout = {
  placeholder: true,
  story: {
    es: "[PENDIENTE: historia de Adrián]",
    en: "[PENDIENTE: historia de Adrián]",
  },
};

export function isDesignAboutPublished(about: DesignAbout): boolean {
  if (about.placeholder) return !isProductionDeploy();

  const story = about.story;
  if (!story) return false;
  if (story.es.trim().length === 0 || story.en.trim().length === 0) {
    return false;
  }

  return hasAboutPhoto();
}
