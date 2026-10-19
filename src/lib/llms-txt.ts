import {
  cncDeliveryText,
  cncFaqItems,
  cncFileFormatList,
  cncMaterialLabel,
  cncQuoteWithin,
  hasCncCapabilities,
  isCncMaterialKey,
  siteConfig,
  siteEmail,
} from "@/content/site-config";
import { getPathname } from "@/i18n/navigation";
import type { Locale, Pathname } from "@/i18n/routing";
import { formatSpecMm } from "@/lib/cnc-specs";
import { absoluteUrl, siteBrandName, siteOrigin } from "@/lib/seo";
import type { Site } from "@/lib/site";
import en from "@/messages/en.json";
import es from "@/messages/es.json";

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}

function localizedHref(site: Site, locale: Locale, href: Pathname): string {
  return absoluteUrl(site, getPathname({ href, locale }));
}

export function llmsTxt(site: Site): string {
  return site === "cnc" ? cncLlmsTxt() : designLlmsTxt();
}

function designLlmsTxt(): string {
  const origin = siteOrigin("design");
  const brand = siteBrandName("design");
  const copy = es.design;
  const copyEn = en.design;
  const instagram = publishedUrl(siteConfig.instagramUrl);

  return [
    `# ${brand}`,
    "",
    `> ${es.metadata.design.description}`,
    "",
    `- Website: ${origin}/`,
    `- English: ${localizedHref("design", "en", "/")}`,
    `- Sister brand: ${siteBrandName("cnc")} (${siteOrigin("cnc")}/)`,
    `- Location: ${copy.footer.location}`,
    `- Email: ${siteEmail("design")}`,
    ...(instagram ? [`- Instagram: ${instagram}`] : []),
    "",
    "## Offer",
    "",
    copy.hero.subhead,
    "",
    `- ${copy.form.options.kitchen}`,
    `- ${copy.form.options.closet}`,
    `- ${copy.form.options["custom-piece"]}`,
    `- ${copy.form.options["commercial-space"]}`,
    "",
    "## English",
    "",
    copyEn.hero.subhead,
    "",
    "## Links",
    "",
    `- [${copy.footer.privacy}](${localizedHref("design", "es", "/privacy")})`,
    `- [Privacy notice](${localizedHref("design", "en", "/privacy")})`,
    `- [${siteBrandName("cnc")}](${siteOrigin("cnc")}/)`,
    "",
  ].join("\n");
}

function cncLlmsTxt(): string {
  const origin = siteOrigin("cnc");
  const brand = siteBrandName("cnc");
  const copy = es.cnc;
  const copyEn = en.cnc;
  const instagram = publishedUrl(siteConfig.instagramUrl);
  const specs = siteConfig.cncSpecs;

  const lines = [
    `# ${brand}`,
    "",
    `> ${es.metadata.cnc.description}`,
    "",
    `- Website: ${origin}/`,
    `- English: ${localizedHref("cnc", "en", "/")}`,
    `- Parent: ${siteBrandName("design")} (${siteOrigin("design")}/)`,
    `- Location: ${siteConfig.cncOffer.location.label.es}`,
    `- Area served: ${siteConfig.cncOffer.areaServed}`,
    `- Email: ${siteEmail("cnc")}`,
    ...(instagram ? [`- Instagram: ${instagram}`] : []),
    "",
    "## Offer",
    "",
    copy.hero.subhead,
    "",
    `English: ${copyEn.hero.subhead}`,
    "",
  ];

  if (specs && hasCncCapabilities(specs)) {
    lines.push("## Machine", "");
    const { widthMm, lengthMm } = specs.cuttingArea;
    if (widthMm > 0 && lengthMm > 0) {
      lines.push(
        `- ${copy.capabilities.area}: ${fill(copy.capabilities.areaValue, {
          width: formatSpecMm("es", widthMm),
          length: formatSpecMm("es", lengthMm),
        })}`,
      );
    }
    for (const range of specs.maxThicknessByMaterial) {
      if (!isCncMaterialKey(range.group) || range.group === "other") continue;
      lines.push(
        `- ${cncMaterialLabel(range.group, "es")}: ${fill(
          copy.capabilities.thicknessValue,
          {
            min: formatSpecMm("es", range.minMm),
            max: formatSpecMm("es", range.maxMm),
          },
        )}`,
      );
    }
    lines.push("");
  }

  const offer = siteConfig.cncOffer;
  lines.push(
    "## Practical details",
    "",
    `- Formats: ${cncFileFormatList("es")}`,
    `- Material: ${offer.materialSupply.es}`,
    `- Invoicing: ${offer.invoicing.es}`,
    `- Quote: ${cncQuoteWithin("es")}`,
    `- Delivery: ${cncDeliveryText("es")}`,
    `- Logistics: ${offer.logistics.es}`,
    "",
    "English:",
    "",
    `- Formats: ${cncFileFormatList("en")}`,
    `- Material: ${offer.materialSupply.en}`,
    `- Invoicing: ${offer.invoicing.en}`,
    `- Quote: ${cncQuoteWithin("en")}`,
    `- Delivery: ${cncDeliveryText("en")}`,
    `- Logistics: ${offer.logistics.en}`,
    "",
  );

  const faqEs = cncFaqItems("es", copy.hero.subhead);
  const faqEn = cncFaqItems("en", copyEn.hero.subhead);
  if (faqEs.length > 0) {
    lines.push("## FAQ", "");
    for (const item of faqEs) {
      lines.push(`- ${item.question} ${item.answer}`);
    }
    lines.push("", "English:", "");
    for (const item of faqEn) {
      lines.push(`- ${item.question} ${item.answer}`);
    }
    lines.push("");
  }

  lines.push(
    "## Links",
    "",
    `- [${copy.footer.privacy}](${localizedHref("cnc", "es", "/privacy")})`,
    `- [Privacy notice](${localizedHref("cnc", "en", "/privacy")})`,
    `- [${siteBrandName("design")}](${siteOrigin("design")}/)`,
    "",
  );

  return lines.join("\n");
}

function publishedUrl(url: string | undefined): string | undefined {
  if (!url || url === "#") return undefined;
  return url;
}
