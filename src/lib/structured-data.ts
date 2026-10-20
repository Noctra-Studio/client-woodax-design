import {
  cncMaterialLabel,
  isCncMaterialKey,
  sameAsUrls,
  siteConfig,
  siteEmail,
} from "@/content/site-config";
import type { Locale } from "@/i18n/routing";
import { formatSpecMm } from "@/lib/cnc-specs";
import { siteBrandName, siteOrigin } from "@/lib/seo";
import type { Site } from "@/lib/site";

export function organizationId(site: Site): string {
  return `${siteOrigin(site)}/#organization`;
}

export function queretaroPostalAddress() {
  return {
    "@type": "PostalAddress",
    addressLocality: "Querétaro",
    addressRegion: "Querétaro",
    addressCountry: "MX",
  };
}

export function cncPostalAddress() {
  const { addressLocality, addressRegion, addressCountry } =
    siteConfig.cncOffer.location;
  return {
    "@type": "PostalAddress",
    addressLocality,
    addressRegion,
    addressCountry,
  };
}

export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function sameAs() {
  const urls = sameAsUrls([siteConfig.instagramUrl, siteConfig.facebookUrl]);
  return urls.length > 0 ? urls : undefined;
}

export function cncSpecPropertyValues(
  locale: Locale,
  labels: {
    area: string;
    areaValue: string;
    thicknessValue: string;
  },
): Array<{ "@type": "PropertyValue"; name: string; value: string }> {
  const specs = siteConfig.cncSpecs;
  if (!specs) return [];

  const properties: Array<{
    "@type": "PropertyValue";
    name: string;
    value: string;
  }> = [];
  const { widthMm, lengthMm } = specs.cuttingArea;

  if (widthMm > 0 && lengthMm > 0) {
    properties.push({
      "@type": "PropertyValue",
      name: labels.area,
      value: fill(labels.areaValue, {
        width: formatSpecMm(locale, widthMm),
        length: formatSpecMm(locale, lengthMm),
      }),
    });
  }

  for (const range of specs.maxThicknessByMaterial) {
    if (!isCncMaterialKey(range.group) || range.group === "other") continue;
    const name = cncMaterialLabel(range.group, locale);
    properties.push({
      "@type": "PropertyValue",
      name,
      value: fill(labels.thicknessValue, {
        min: formatSpecMm(locale, range.minMm),
        max: formatSpecMm(locale, range.maxMm),
      }),
    });
  }

  return properties;
}

export function designJsonLd({
  name,
  description,
  knowsAbout,
}: {
  name: string;
  description: string;
  knowsAbout: string[];
}) {
  const origin = siteOrigin("design");
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": organizationId("design"),
    name,
    description,
    url: origin,
    email: siteEmail("design"),
    address: queretaroPostalAddress(),
    areaServed: "Querétaro",
    knowsAbout,
    subOrganization: {
      "@id": organizationId("cnc"),
      "@type": "LocalBusiness",
      name: siteBrandName("cnc"),
      url: siteOrigin("cnc"),
    },
  };

  const profiles = sameAs();
  if (profiles) data.sameAs = profiles;

  return jsonLdScript(data);
}

export function designAboutJsonLd({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  return jsonLdScript({
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name,
    description,
    url,
    about: { "@id": organizationId("design") },
  });
}

export function cncJsonLd({
  name,
  description,
  serviceType,
  knowsAbout,
  services,
  specProperties,
  faq,
}: {
  name: string;
  description: string;
  serviceType: string;
  knowsAbout: string[];
  services: Array<{ name: string; description: string }>;
  specProperties: Array<{
    "@type": "PropertyValue";
    name: string;
    value: string;
  }>;
  faq: Array<{ question: string; answer: string }>;
}) {
  const origin = siteOrigin("cnc");
  const businessId = organizationId("cnc");
  const serviceId = `${origin}/#service`;

  const business: Record<string, unknown> = {
    "@type": "LocalBusiness",
    "@id": businessId,
    name,
    description,
    url: origin,
    email: siteEmail("cnc"),
    address: cncPostalAddress(),
    areaServed: siteConfig.cncOffer.areaServed,
    parentOrganization: {
      "@id": organizationId("design"),
    },
    knowsAbout,
  };

  const profiles = sameAs();
  if (profiles) business.sameAs = profiles;

  const cuttingService: Record<string, unknown> = {
    "@type": "Service",
    "@id": serviceId,
    name: serviceType,
    description,
    serviceType,
    areaServed: siteConfig.cncOffer.areaServed,
    provider: { "@id": businessId },
  };
  if (specProperties.length > 0) {
    cuttingService.additionalProperty = specProperties;
  }

  const serviceNodes = services.map((service) => ({
    "@type": "Service",
    name: service.name,
    description: service.description,
    serviceType,
    areaServed: siteConfig.cncOffer.areaServed,
    provider: { "@id": businessId },
    ...(specProperties.length > 0
      ? { additionalProperty: specProperties }
      : {}),
  }));

  const faqPage =
    faq.length > 0
      ? {
          "@type": "FAQPage",
          mainEntity: faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  return jsonLdScript({
    "@context": "https://schema.org",
    "@graph": [
      business,
      cuttingService,
      ...serviceNodes,
      ...(faqPage ? [faqPage] : []),
    ],
  });
}

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}
