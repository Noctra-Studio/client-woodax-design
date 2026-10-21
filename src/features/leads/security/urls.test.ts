import { describe, expect, it } from "vitest";
import { inspectUrls } from "@/features/leads/security/urls";

describe("inspectUrls", () => {
  it("ignores ordinary text", () => {
    const result = inspectUrls("Hola, quiero una cocina en Querétaro.");
    expect(result.urls).toHaveLength(0);
    expect(result.discardReason).toBeNull();
    expect(result.flagOneUrl).toBe(false);
  });

  it("flags a single http link", () => {
    const result = inspectUrls("Mira https://example.com/foto por favor.");
    expect(result.flagOneUrl).toBe(true);
    expect(result.discardReason).toBeNull();
  });

  it("discards two links", () => {
    const result = inspectUrls("https://a.com y https://b.com");
    expect(result.discardReason).toBe("multi_url");
  });

  it("discards non-http schemes", () => {
    expect(inspectUrls("javascript:alert(1)").discardReason).toBe(
      "dangerous_scheme",
    );
    expect(inspectUrls("data:text/html,hi").discardReason).toBe(
      "dangerous_scheme",
    );
    expect(inspectUrls("file:///etc/passwd").discardReason).toBe(
      "dangerous_scheme",
    );
  });

  it("discards ip literals, shorteners, and punycode", () => {
    expect(inspectUrls("http://192.168.1.1/a").discardReason).toBe(
      "ip_literal",
    );
    expect(inspectUrls("http://bit.ly/abc").discardReason).toBe("shortener");
    expect(inspectUrls("http://xn--n3h.com").discardReason).toBe("punycode");
  });

  it("reads obfuscated links", () => {
    expect(inspectUrls("hxxps://evil.com").flagOneUrl).toBe(true);
    expect(inspectUrls("evil[.]com").flagOneUrl).toBe(true);
  });
});
