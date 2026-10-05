import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing, type Locale } from "@/i18n/routing";
import { clientEnv } from "@/lib/env";
import {
  allowsPreviewSiteOverride,
  hostFromHeaders,
  parseSite,
  PREVIEW_SITE_COOKIE,
  PREVIEW_SITE_HEADER,
  resolveSite,
  type Site,
} from "@/lib/site";

const handleI18nRouting = createMiddleware(routing);

const cncPathPattern = new RegExp(
  `^/(?:(${routing.locales.join("|")})/)?cnc(?:/(.*))?$`,
);

export function proxy(request: NextRequest) {
  const host = hostFromHeaders(request.headers);
  const requestedSite = parseSite(request.nextUrl.searchParams.get("site"));
  const storedSite = parseSite(request.cookies.get(PREVIEW_SITE_COOKIE)?.value);
  const previewAllowed = allowsPreviewSiteOverride(host);
  const previewSite = previewAllowed ? (requestedSite ?? storedSite) : null;

  request.headers.delete(PREVIEW_SITE_HEADER);
  if (previewSite) {
    request.headers.set(PREVIEW_SITE_HEADER, previewSite);
  }

  const response = responseForSite(request, resolveSite(host, previewSite));

  if (previewAllowed && requestedSite) {
    response.cookies.set(PREVIEW_SITE_COOKIE, requestedSite, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    });
  }

  return response;
}

export const config = {
  matcher: "/((?!api|_next|icon|apple-icon|.*\\..*).*)",
};

function responseForSite(request: NextRequest, site: Site) {
  if (site === "cnc") {
    return rewriteCnc(request, handleI18nRouting(request));
  }

  return redirectDesignCncPath(request) ?? handleI18nRouting(request);
}

function redirectDesignCncPath(request: NextRequest) {
  const destinationPath = cncPublicPath(request.nextUrl.pathname);
  if (!destinationPath) return null;

  const destination = new URL(destinationPath, clientEnv.NEXT_PUBLIC_CNC_URL);
  destination.search = request.nextUrl.search;
  return NextResponse.redirect(destination, 301);
}

function cncPublicPath(pathname: string): string | null {
  const match = cncPathPattern.exec(pathname);
  if (!match) return null;

  const locale = isLocale(match[1]) ? match[1] : routing.defaultLocale;
  const rest = (match[2] ?? "").replace(/^\/+|\/+$/g, "");
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const suffix = rest ? `/${rest}` : "";
  return `${prefix}${suffix}` || "/";
}

function rewriteCnc(request: NextRequest, response: NextResponse) {
  if (response.headers.has("location")) return response;

  const rewrite = response.headers.get("x-middleware-rewrite");
  const url = rewrite ? new URL(rewrite) : request.nextUrl.clone();
  const pathname = insertCncSegment(url.pathname);

  if (pathname === url.pathname) return response;

  url.pathname = pathname;

  const headers = new Headers(response.headers);
  headers.delete("x-middleware-next");
  headers.set("x-middleware-rewrite", url.toString());

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function insertCncSegment(pathname: string): string {
  const segments = pathname.split("/");
  const locale = segments[1];

  if (!locale || !isLocale(locale) || segments[2] === "cnc") {
    return pathname;
  }

  const rest = segments.slice(2).filter(Boolean);
  const suffix = rest.length > 0 ? `/${rest.join("/")}` : "";
  return `/${locale}/cnc${suffix}`;
}

function isLocale(value: string | undefined): value is Locale {
  return routing.locales.some((locale) => locale === value);
}
