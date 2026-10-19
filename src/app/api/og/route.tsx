import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import {
  cncMaterialLabel,
  hasCncCapabilities,
  isCncMaterialKey,
  siteConfig,
} from "@/content/site-config";
import { formatSpecMm } from "@/lib/cnc-specs";
import { requestSite } from "@/lib/request-site";
import { parseSite } from "@/lib/site";
import en from "@/messages/en.json";
import es from "@/messages/es.json";

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const site = parseSite(searchParams.get("site")) ?? (await requestSite());
  const locale = searchParams.get("locale") === "en" ? "en" : "es";
  const messages = locale === "en" ? en : es;

  if (site === "cnc") {
    const copy = messages.cnc;
    const specs = siteConfig.cncSpecs;
    const specParts: string[] = [];

    if (specs && hasCncCapabilities(specs)) {
      const { widthMm, lengthMm } = specs.cuttingArea;
      if (widthMm > 0 && lengthMm > 0) {
        specParts.push(
          `${copy.capabilities.area} ${fill(copy.capabilities.areaValue, {
            width: formatSpecMm(locale, widthMm),
            length: formatSpecMm(locale, lengthMm),
          })}`,
        );
      }

      for (const range of specs.maxThicknessByMaterial) {
        if (!isCncMaterialKey(range.group) || range.group === "other") continue;
        specParts.push(
          `${cncMaterialLabel(range.group, locale)} ${fill(
            copy.capabilities.thicknessValue,
            {
              min: formatSpecMm(locale, range.minMm),
              max: formatSpecMm(locale, range.maxMm),
            },
          )}`,
        );
      }
    }

    const specsLine = specParts.join("  ·  ");

    return new ImageResponse(
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#16171A",
          color: "#ECEDEE",
          padding: "56px 64px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            backgroundColor: "#1F2125",
            border: "1px solid #2E3136",
            borderRadius: "8px",
            padding: "48px 56px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "16px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#9A9FA6",
            }}
          >
            <span>CNC BY WOODAX DESIGN</span>
            <span>QUERÉTARO, MX</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              maxWidth: "920px",
            }}
          >
            <div
              style={{
                fontSize: "56px",
                lineHeight: 1.08,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "#FFFFFF",
              }}
            >
              {copy.hero.headline}
            </div>
            <div
              style={{
                fontSize: "24px",
                lineHeight: 1.4,
                color: "#9A9FA6",
              }}
            >
              {copy.meta.description}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #2E3136",
              paddingTop: "24px",
              fontSize: "15px",
              letterSpacing: "0.06em",
              color: "#ECEDEE",
            }}
          >
            <span>{specsLine}</span>
            <span style={{ color: "#9A9FA6" }}>cnc.woodax.design</span>
          </div>
        </div>
      </div>,
      { width: 1200, height: 630 },
    );
  }

  const copy = messages.design;

  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#F3F1EA",
        color: "#483D3C",
        padding: "56px 64px",
        fontFamily: "serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          backgroundColor: "#E5E1D1",
          border: "1px solid #D6D1BE",
          borderRadius: "24px",
          padding: "48px 56px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "16px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontFamily: "sans-serif",
            color: "#483D3C",
          }}
        >
          <span>
            {locale === "en"
              ? "WOODAX DESIGN · QUERÉTARO, MEXICO"
              : "WOODAX DESIGN · QUERÉTARO, MÉXICO"}
          </span>
          <span
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "9999px",
              backgroundColor: "#8BAF64",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "920px",
          }}
        >
          <div
            style={{
              fontSize: "56px",
              lineHeight: 1.08,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "#483D3C",
            }}
          >
            {`${copy.hero.headlineLead} ${copy.hero.headlineTail}`}
          </div>
          <div
            style={{
              fontSize: "24px",
              lineHeight: 1.4,
              fontFamily: "sans-serif",
              color: "#483D3C",
            }}
          >
            {copy.meta.description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #D6D1BE",
            paddingTop: "24px",
            fontSize: "18px",
            fontFamily: "sans-serif",
            color: "#483D3C",
          }}
        >
          <span>Woodax Design</span>
          <span>woodax.design</span>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
