"use client";

import { Suspense, useLayoutEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const locales = ["es", "en"] as const;
const LOCALE_SCROLL_KEY = "woodax-locale-scroll";

type Variant = "design" | "cnc";

export function LocaleSlot({
  variant,
  label,
}: {
  variant: Variant;
  label: string;
  size: "bar" | "menu";
}) {
  return (
    <Suspense fallback={<LocaleFallback variant={variant} />}>
      <LocaleSwitch variant={variant} label={label} />
    </Suspense>
  );
}

function LocaleFallback({ variant }: { variant: Variant }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "h-11 w-[5.5rem]",
        variant === "design" ? "rounded-full" : "rounded-[4px]",
      )}
    />
  );
}

function LocaleSwitch({
  variant,
  label,
}: {
  variant: Variant;
  label: string;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusRing =
    variant === "design"
      ? "focus-visible:outline-woodax-charcoal"
      : "focus-visible:outline-cnc-white";
  const hit = "min-h-11 min-w-11";

  useLayoutEffect(() => {
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem(LOCALE_SCROLL_KEY);
      sessionStorage.removeItem(LOCALE_SCROLL_KEY);
    } catch {
      return;
    }
    if (!raw) return;

    let saved: { y?: number; hash?: string };
    try {
      saved = JSON.parse(raw) as { y?: number; hash?: string };
    } catch {
      return;
    }

    const hash = saved.hash ?? "";
    if (hash && window.location.hash !== hash) {
      const next = `${window.location.pathname}${window.location.search}${hash}`;
      window.history.replaceState(null, "", next);
    }
    if (typeof saved.y === "number") window.scrollTo(0, saved.y);
  }, [locale]);

  function selectLocale(code: (typeof locales)[number]) {
    if (code === locale) return;
    try {
      sessionStorage.setItem(
        LOCALE_SCROLL_KEY,
        JSON.stringify({
          y: window.scrollY,
          hash: window.location.hash,
        }),
      );
    } catch {
      // Private browsing can reject storage; the locale still changes.
    }
    const query = Object.fromEntries(searchParams.entries());
    const href = Object.keys(query).length > 0 ? { pathname, query } : pathname;
    router.replace(href, { locale: code, scroll: false });
  }

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex items-center p-0.5 text-[13px]",
        variant === "design"
          ? "text-woodax-charcoal rounded-full"
          : "border-cnc-line rounded-[4px] border tracking-[0.08em]",
      )}
    >
      {locales.map((code) => {
        const codeLabel = code.toUpperCase();
        const active = code === locale;
        const shape = variant === "design" ? "rounded-full" : "rounded-[4px]";
        if (active) {
          return (
            <span
              key={code}
              aria-current="true"
              lang={code}
              className={cn(
                "inline-flex items-center justify-center px-2 font-medium",
                hit,
                shape,
                variant === "design"
                  ? "bg-woodax-cream text-woodax-charcoal"
                  : "bg-cnc-white text-cnc-bg",
              )}
            >
              {codeLabel}
            </span>
          );
        }

        return (
          <button
            key={code}
            type="button"
            lang={code}
            onClick={() => selectLocale(code)}
            className={cn(
              "inline-flex items-center justify-center px-2 font-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
              hit,
              shape,
              focusRing,
              variant === "design"
                ? "text-woodax-charcoal/75 pointer-fine:hover:bg-woodax-cream"
                : "text-cnc-muted pointer-fine:hover:bg-cnc-surface",
            )}
          >
            {codeLabel}
          </button>
        );
      })}
    </div>
  );
}
