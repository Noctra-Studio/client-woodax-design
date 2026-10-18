import { hasCncCapabilities, siteConfig, siteEmail } from "@/content/site-config";
import { formatSpecMm } from "@/lib/cnc-specs";
import { absoluteLocalizedUrl, siteBrandName, siteOrigin } from "@/lib/seo";
import type { Site } from "@/lib/site";
import en from "@/messages/en.json";
import es from "@/messages/es.json";

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
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
    `- English: ${absoluteLocalizedUrl("design", "en")}`,
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
    `- [${copy.footer.privacy}](${absoluteLocalizedUrl("design", "es", "/privacy")})`,
    `- [Privacy notice](${absoluteLocalizedUrl("design", "en", "/privacy")})`,
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
    `- English: ${absoluteLocalizedUrl("cnc", "en")}`,
    `- Parent: ${siteBrandName("design")} (${siteOrigin("design")}/)`,
    `- Location: ${copy.footer.location}`,
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
      const group =
        copy.materials.groups[
          range.group as keyof typeof copy.materials.groups
        ];
      if (!group) continue;
      lines.push(
        `- ${group.name}: ${fill(copy.capabilities.thicknessValue, {
          min: formatSpecMm("es", range.minMm),
          max: formatSpecMm("es", range.maxMm),
        })}`,
      );
    }
    lines.push("");
  }

  lines.push(
    "## Links",
    "",
    `- [${copy.footer.privacy}](${absoluteLocalizedUrl("cnc", "es", "/privacy")})`,
    `- [Privacy notice](${absoluteLocalizedUrl("cnc", "en", "/privacy")})`,
    `- [${siteBrandName("design")}](${siteOrigin("design")}/)`,
    "",
  );

  return lines.join("\n");
}

function publishedUrl(url: string | undefined): string | undefined {
  if (!url || url === "#") return undefined;
  return url;
}
