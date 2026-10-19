import type { Locale } from "@/i18n/routing";
import { clientEnv } from "@/lib/env";
import type { Site } from "@/lib/site";

/**
 * Prefill bodies for wa.me. They open in WhatsApp and are not rendered on the page.
 * The phone number itself is never included in visible copy.
 */
const prefill: Record<Site, Record<Locale, string>> = {
  cnc: {
    es: "Hola, vengo de cnc.woodax.design y quiero cotizar un corte.",
    en: "Hi, I found you on cnc.woodax.design and I'd like a cutting quote.",
  },
  design: {
    es: "Hola, vengo de woodax.design y me interesa un proyecto.",
    en: "Hi, I found you on woodax.design and I'm interested in a project.",
  },
};

/** wa.me link for the configured number, or null when the env var is empty or invalid. */
export function whatsappHref(site: Site, locale: Locale): string | null {
  const number = clientEnv.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!number) return null;

  const text = encodeURIComponent(prefill[site][locale]);
  return `https://wa.me/${number}?text=${text}`;
}
