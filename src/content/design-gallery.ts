import { designMedia, type DesignMediaTag } from "@/content/design-media";

export type DesignGalleryTag = DesignMediaTag;

export type DesignGalleryItem = {
  src: string;
  width: number;
  height: number;
  alt: { es: string; en: string };
  tag: DesignGalleryTag;
};

/**
 * Real project photos only. Derived from projects-* slots that have src.
 * The home hero is the home-hero slot, not the first item here.
 */
export const designGallery: DesignGalleryItem[] = designMedia.flatMap(
  (slot) => {
    if (!slot.id.startsWith("projects-") || slot.src === null) return [];
    if (slot.tag === undefined) return [];
    return [
      {
        src: slot.src,
        width: slot.width,
        height: slot.height,
        alt: slot.alt,
        tag: slot.tag,
      },
    ];
  },
);
