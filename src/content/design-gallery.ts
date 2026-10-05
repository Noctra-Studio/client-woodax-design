export type DesignGalleryTag =
  "kitchen" | "closet" | "custom-piece" | "commercial-space";

export type DesignGalleryItem = {
  src: string;
  width: number;
  height: number;
  alt: { es: string; en: string };
  tag: DesignGalleryTag;
};

/**
 * Real photos from public/images/design only.
 * The first item is the hero poster. Keep the list between 4 and 6.
 * If an alt is not approved yet, set it to "TODO(copy)".
 */
export const designGallery: DesignGalleryItem[] = [];
