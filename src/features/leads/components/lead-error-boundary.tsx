"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AnalyticsButton } from "@/components/analytics/tracked-link";
import { Button } from "@/components/ui/button";
import type { LeadCopy } from "@/features/leads/copy";
import { cn } from "@/lib/utils";

type LeadErrorBoundaryProps = {
  copy: LeadCopy;
  onReset?: () => void;
  children: ReactNode;
};

type LeadErrorBoundaryState = {
  hasError: boolean;
};

const FALLBACK_COPY = {
  es: {
    body: "Algo salió mal. Si enviaste una solicitud, probablemente sí la recibimos. Escríbenos por WhatsApp para confirmar.",
    retry: "Reintentar",
    whatsapp: "Escribir por WhatsApp",
  },
  en: {
    body: "Something went wrong. If you sent a request, we likely received it. Message us on WhatsApp to confirm.",
    retry: "Try again",
    whatsapp: "Message us on WhatsApp",
  },
} as const;

export class LeadErrorBoundary extends Component<
  LeadErrorBoundaryProps,
  LeadErrorBoundaryState
> {
  override state: LeadErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): LeadErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      "lead form render error",
      error.name,
      info.componentStack ? "component_boundary" : "boundary",
    );
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
    this.props.onReset?.();
  };

  override render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { copy } = this.props;
    const isDesign = copy.variant === "design";
    const fallback = FALLBACK_COPY[copy.locale] ?? FALLBACK_COPY.es;
    const body = copy.errorBoundaryBody || fallback.body;
    const retry = copy.errorBoundaryRetry || fallback.retry;
    const whatsappLabel =
      copy.errorBoundaryWhatsapp || copy.whatsapp || fallback.whatsapp;
    const primaryVariant = isDesign ? "design-primary" : "cnc-primary";
    const secondaryVariant = isDesign ? "design-secondary" : "cnc-secondary";

    return (
      <div
        role="alert"
        className={cn(
          "flex flex-col gap-5 rounded-[var(--radius-card)] border p-5 md:p-6",
          isDesign
            ? "border-woodax-line bg-woodax-paper text-woodax-charcoal"
            : "border-cnc-line bg-cnc-surface text-cnc-text",
        )}
      >
        <p className="max-w-[62ch] text-[16px] leading-relaxed font-medium">
          {body}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant={secondaryVariant}
            onClick={this.handleRetry}
          >
            {retry}
          </Button>
          {copy.whatsappHref ? (
            <AnalyticsButton
              href={copy.whatsappHref}
              variant={primaryVariant}
              arrow
              target="_blank"
              rel="noopener noreferrer"
              aria-label={copy.whatsappAria || whatsappLabel}
              tracking={{
                event: "whatsapp_click",
                params: { site: copy.variant, location: "contact" },
              }}
            >
              {whatsappLabel}
            </AnalyticsButton>
          ) : null}
        </div>
      </div>
    );
  }
}
