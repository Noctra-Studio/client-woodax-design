export type DesignAboutPhoto = {
  src: string;
  width: number;
  height: number;
  alt: { es: string; en: string };
};

export type DesignAbout = {
  story: { es: string; en: string } | null;
  photos: DesignAboutPhoto[];
};

export const designAbout: DesignAbout = {
  story: null,
  photos: [],
};

export function isDesignAboutPublished(about: DesignAbout): boolean {
  const story = about.story;
  if (!story) return false;
  if (story.es.trim().length === 0 || story.en.trim().length === 0) return false;
  return about.photos.length > 0;
}
