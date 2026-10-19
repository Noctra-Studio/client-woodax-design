import { hasLocale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import {
  formatPixels,
  getDesignMedia,
  recommendedPixels,
  slotWillRender,
  type DesignMediaId,
} from "@/content/design-media";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type MediaSlotProps = {
  id: DesignMediaId;
  sizes: string;
  priority?: boolean;
  /** Stretch to a positioned parent. The label still shows the file ratio. */
  fill?: boolean;
  /** Full-bleed frames keep the label in the top band, clear of the headline. */
  labelPosition?: "center" | "top";
  className?: string;
};

function SlotTexture({ patternId }: { patternId: string }) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full text-woodax-charcoal/25"
    >
      <defs>
        <pattern
          id={patternId}
          width="180"
          height="180"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M28 156C28 84 84 28 156 28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M44 172C44 100 100 44 172 44"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

export async function MediaSlot({
  id,
  sizes,
  priority = false,
  fill = false,
  labelPosition = "center",
  className,
}: MediaSlotProps) {
  const slot = getDesignMedia(id);
  if (!slotWillRender(slot)) return null;

  const requested = await getLocale();
  const locale = hasLocale(routing.locales, requested) ? requested : "es";
  const pixels = recommendedPixels(slot.ratio);
  const t = await getTranslations("design.mediaSlot");

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        fill ? "absolute inset-0 h-full w-full" : "w-full",
        slot.src
          ? fill
            ? undefined
            : "rounded-[var(--radius-media)]"
          : cn(
              "border-woodax-charcoal/55 bg-woodax-surface border border-dashed",
              fill ? undefined : "rounded-[var(--radius-card)]",
            ),
        className,
      )}
      style={fill ? undefined : { aspectRatio: slot.ratio.replace("/", " / ") }}
    >
      {slot.src ? (
        <Image
          src={slot.src}
          alt={slot.alt[locale]}
          fill
          sizes={sizes}
          priority={priority || undefined}
          preload={priority || undefined}
          fetchPriority={priority ? "high" : undefined}
          className="object-cover"
        />
      ) : (
        <>
          <SlotTexture patternId={`arc-${slot.id}`} />
          <p
            className={cn(
              "text-woodax-charcoal relative z-10 flex items-center px-4 text-center text-[15px] leading-snug font-medium",
              labelPosition === "top"
                ? "justify-center pt-28"
                : "h-full flex-col justify-center gap-1",
            )}
          >
            <span className="block max-w-full break-words">
              {t("label", { id: slot.id })}
            </span>
            <span className={labelPosition === "top" ? "ml-2" : "block"}>
              {slot.ratio}
            </span>
            <span className={labelPosition === "top" ? "ml-2" : "block"}>
              {formatPixels(pixels)}
            </span>
          </p>
        </>
      )}
    </div>
  );
}
