"use client";

import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  track,
  type AnalyticsEvent,
  type AnalyticsParams,
} from "@/lib/analytics";

type Tracking = {
  [E in AnalyticsEvent]: { event: E; params: AnalyticsParams<E> };
}[AnalyticsEvent];

function emit(tracking: Tracking) {
  switch (tracking.event) {
    case "cta_click":
      track(tracking.event, tracking.params);
      break;
    case "social_click":
      track(tracking.event, tracking.params);
      break;
    case "sister_site_click":
      track(tracking.event, tracking.params);
      break;
    case "generate_lead":
      track(tracking.event, tracking.params);
      break;
    case "whatsapp_click":
      track(tracking.event, tracking.params);
      break;
  }
}

type ButtonVariant = ComponentProps<typeof Button>["variant"];

export function AnalyticsButton({
  tracking,
  onClick,
  children,
  href,
  variant,
  arrow,
  className,
  target,
  rel,
  "aria-label": ariaLabel,
}: {
  href: string;
  variant: ButtonVariant;
  arrow?: boolean;
  className?: string;
  target?: string;
  rel?: string;
  "aria-label"?: string;
  children: ReactNode;
  tracking: Tracking;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Button
      href={href}
      variant={variant}
      arrow={arrow}
      className={className}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        emit(tracking);
      }}
    >
      {children}
    </Button>
  );
}

export function AnalyticsAnchor({
  tracking,
  onClick,
  ...props
}: ComponentProps<"a"> & { tracking: Tracking }) {
  return (
    <a
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        emit(tracking);
      }}
    />
  );
}
