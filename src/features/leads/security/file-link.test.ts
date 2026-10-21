import { describe, expect, it } from "vitest";
import { classifyFileLink } from "@/features/leads/security/file-link";

describe("classifyFileLink", () => {
  it("allows the file-host list, including subdomains", () => {
    expect(
      classifyFileLink("https://drive.google.com/file/d/abc"),
    ).toMatchObject({
      kind: "allowlisted",
      href: "https://drive.google.com/file/d/abc",
    });
    expect(classifyFileLink("https://www.dropbox.com/s/abc").kind).toBe(
      "allowlisted",
    );
    expect(classifyFileLink("https://1drv.ms/b/s!abc").kind).toBe(
      "allowlisted",
    );
    expect(classifyFileLink("https://we.tl/t-abc").kind).toBe("allowlisted");
  });

  it("keeps other domains as plain text", () => {
    expect(classifyFileLink("https://evil.com/file").kind).toBe("plain");
    expect(classifyFileLink("https://drive.google.com.evil.com/x").kind).toBe(
      "plain",
    );
    expect(classifyFileLink("javascript:alert(1)").kind).toBe("plain");
    expect(
      classifyFileLink("https://user:pass@drive.google.com/file").kind,
    ).toBe("plain");
  });

  it("treats a blank value as empty", () => {
    expect(classifyFileLink("  ")).toEqual({ kind: "empty" });
  });
});
