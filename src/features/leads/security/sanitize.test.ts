import { describe, expect, it } from "vitest";
import { sanitizeText } from "@/features/leads/security/sanitize";

describe("sanitizeText", () => {
  it("normalizes compatibility characters", () => {
    expect(sanitizeText("ａｂｃ")).toBe("abc");
  });

  it("removes zero-width characters", () => {
    expect(sanitizeText("a\u200Bb\uFEFFc")).toBe("abc");
  });

  it("replaces control characters and collapses whitespace", () => {
    expect(sanitizeText("a\u0000b\n\tc   d")).toBe("a b c d");
  });
});
