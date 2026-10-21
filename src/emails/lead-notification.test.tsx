import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LeadNotificationEmail } from "@/emails/lead-notification";

describe("LeadNotificationEmail", () => {
  it("escapes html and only links an allowlisted file url", () => {
    const html = renderToStaticMarkup(
      createElement(LeadNotificationEmail, {
        subject: "Hola",
        preview: "prev",
        eyebrow: "eye",
        heading: "Ana <b>",
        rows: [
          {
            label: "Mensaje",
            value: "ver <script>alert(1)</script> https://evil.example/a",
          },
          {
            label: "Archivo",
            value: "https://drive.google.com/file/d/abc",
            href: "https://drive.google.com/file/d/abc",
          },
          {
            label: "Trampa",
            value: "javascript:alert(1)",
            href: "javascript:alert(1)",
          },
        ],
      }),
    );

    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;b&gt;");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain('href="https://evil.example/a"');
    expect(html).not.toContain('href="javascript:alert(1)"');
    expect(html).toContain('href="https://drive.google.com/file/d/abc"');
  });
});
