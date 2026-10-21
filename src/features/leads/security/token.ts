import { createHmac, timingSafeEqual } from "node:crypto";

export const LEAD_TOKEN_TTL_MS = 2 * 60 * 60 * 1000;

export type LeadTokenClaims = {
  site: "design" | "cnc";
  contact: string;
  name: string;
};

type TokenPayload = LeadTokenClaims & { exp: number };

function signBody(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

export function signLeadToken(
  claims: LeadTokenClaims,
  secret: string,
  now = Date.now(),
): string {
  const payload: TokenPayload = {
    site: claims.site,
    contact: claims.contact,
    name: claims.name,
    exp: now + LEAD_TOKEN_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${signBody(body, secret)}`;
}

export function verifyLeadToken(
  token: string,
  secret: string,
  expected: LeadTokenClaims,
  now = Date.now(),
): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [body, signature] = parts;
  if (!body || !signature) return false;

  const expectedSignature = signBody(body, secret);
  const actual = Buffer.from(signature);
  const wanted = Buffer.from(expectedSignature);
  if (actual.length !== wanted.length || !timingSafeEqual(actual, wanted)) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as Partial<TokenPayload>;
    if (typeof payload.exp !== "number" || payload.exp <= now) return false;
    return (
      payload.site === expected.site &&
      payload.contact === expected.contact &&
      payload.name === expected.name
    );
  } catch {
    return false;
  }
}
