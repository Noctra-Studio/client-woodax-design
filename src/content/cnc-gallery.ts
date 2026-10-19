export type CncGalleryItem = {
  src: string;
  width: number;
  height: number;
  alt: { es: string; en: string };
};

/**
 * Real photos from public/images/cnc only.
 * The first item is the hero poster.
 * If an alt is not approved yet, set it to "TODO(copy)".
 */
export const cncGallery: CncGalleryItem[] = [];
