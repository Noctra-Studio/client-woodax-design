import { describe, expect, it } from "vitest";
import { normalizeEmail } from "@/features/leads/security/email";

describe("normalizeEmail", () => {
  it("lowercases, trims, and strips gmail aliases", () => {
    expect(normalizeEmail("  Foo.Bar+tag@Gmail.com ")).toBe(
      "foo.bar@gmail.com",
    );
    expect(normalizeEmail("a+b@googlemail.com")).toBe("a@gmail.com");
  });

  it("keeps plus aliases on other domains and keeps gmail dots", () => {
    expect(normalizeEmail("A+B@Woodax.Design")).toBe("a+b@woodax.design");
    expect(normalizeEmail("foo.bar@gmail.com")).toBe("foo.bar@gmail.com");
  });
});
