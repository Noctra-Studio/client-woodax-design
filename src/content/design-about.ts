import { hasAboutPhoto } from "@/content/design-media";
import { isProductionDeploy } from "@/lib/deploy-env";

type LocalizedLines = {
  es: readonly string[];
  en: readonly string[];
};

export type DesignAbout = {
  placeholder: boolean;
  story: LocalizedLines | null;
  audience: LocalizedLines;
};

export const designAbout: DesignAbout = {
  placeholder: true,
  story: {
    es: [
      "Adrián creció rodeado de madera. Originario de Hungría, se involucró en la carpintería desde muy joven, y desde entonces la madera ha sido su oficio.",
      "Woodax Design nace de una idea clara: hacer en Querétaro piezas de una calidad superior a la que ofrece el mercado.",
      "Hoy trabajamos con constructoras, diseñadores de interiores, negocios y familias. Cambia la escala del proyecto; el cuidado en cada pieza es el mismo.",
    ],
    en: [
      "Adrián grew up surrounded by wood. Originally from Hungary, he got into carpentry at a very young age, and wood has been his craft ever since.",
      "Woodax Design was born from a clear idea: to make pieces in Querétaro of a higher quality than the market offers.",
      "Today we work with construction companies, interior designers, businesses and families. The scale of the project changes; the care in every piece stays the same.",
    ],
  },
  audience: {
    es: [
      "Constructoras",
      "Diseñadores de interiores",
      "Negocios",
      "Familias",
    ],
    en: [
      "Construction companies",
      "Interior designers",
      "Businesses",
      "Families",
    ],
  },
};

function linesReady(copy: LocalizedLines | null): copy is LocalizedLines {
  if (!copy) return false;

  return (["es", "en"] as const).every((locale) => {
    const lines = copy[locale];
    return (
      lines.length > 0 && lines.every((line) => line.trim().length > 0)
    );
  });
}

export function isDesignAboutPublished(about: DesignAbout): boolean {
  if (about.placeholder) return !isProductionDeploy();
  if (!linesReady(about.story) || !linesReady(about.audience)) return false;
  return hasAboutPhoto();
}
