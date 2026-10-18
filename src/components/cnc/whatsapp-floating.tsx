"use client";

import { useEffect, useState } from "react";
import { AnalyticsAnchor } from "@/components/analytics/tracked-link";
import { WhatsAppIcon } from "@/components/icons/brand-social";
import { cn } from "@/lib/utils";

export function WhatsappFloating({
  href,
  label,
  ariaLabel,
}: {
  href: string;
  label: string;
  ariaLabel: string;
}) {
  const [heroInView, setHeroInView] = useState(true);
  const [contactInView, setContactInView] = useState(false);
  const [footerInView, setFooterInView] = useState(false);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    function watch(
      element: Element | null,
      onChange: (inView: boolean) => void,
    ) {
      if (!element) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          onChange(Boolean(entry?.isIntersecting));
        },
        { threshold: 0 },
      );
      observer.observe(element);
      observers.push(observer);
    }

    watch(document.getElementById("hero"), setHeroInView);
    watch(document.getElementById("contacto"), setContactInView);
    watch(document.querySelector("footer"), setFooterInView);

    return () => {
      for (const observer of observers) observer.disconnect();
    };
  }, []);

  const visible = !heroInView && !contactInView && !footerInView;

  return (
    <AnalyticsAnchor
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      aria-hidden={visible ? undefined : true}
      inert={visible ? undefined : true}
      tabIndex={visible ? undefined : -1}
      tracking={{
        event: "whatsapp_click",
        params: { site: "cnc", location: "floating" },
      }}
      className={cn(
        "border-cnc-muted bg-cnc-bg/80 text-cnc-text fixed right-6 bottom-6 z-20 hidden min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium backdrop-blur md:inline-flex",
        "focus-visible:outline-cnc-white pointer-fine:hover:border-cnc-text pointer-fine:hover:bg-cnc-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        "duration-ui transition-[opacity,translate,border-color,background-color] ease-out motion-reduce:transition-none",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <WhatsAppIcon className="size-4 shrink-0" />
      {label}
    </AnalyticsAnchor>
  );
}
