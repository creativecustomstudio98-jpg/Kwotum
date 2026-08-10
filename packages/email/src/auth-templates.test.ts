import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const templateCases = [
  ["confirmation.html", "{{ .ConfirmationURL }}"],
  ["invite.html", "{{ .ConfirmationURL }}"],
  ["magic-link.html", "{{ .ConfirmationURL }}"],
  ["email-change.html", "{{ .ConfirmationURL }}"],
  ["recovery.html", "{{ .ConfirmationURL }}"],
  ["reauthentication.html", "{{ .Token }}"],
] as const;

function loadTemplate(name: string): string {
  return readFileSync(new URL(`../../../supabase/templates/${name}`, import.meta.url), "utf8");
}

describe("Supabase Auth email templates", () => {
  it.each(templateCases)(
    "keeps %s branded, safe and wired to its required variable",
    (name, variable) => {
      const html = loadTemplate(name);

      expect(html).toContain('<html lang="pl">');
      expect(html).toContain("<title>");
      expect(html).toContain("<main>");
      expect(html).toContain("Kwotum");
      expect(html).toContain("app.kwotum.pl");
      expect(html).toContain(variable);
      expect(html).not.toMatch(/<script|<form|<iframe|<object/i);
      expect(html).not.toContain("Supabase Auth");
      expect(html).not.toContain("mail.app.supabase.io");
      expect(html).not.toContain("Confirm your email address");
      expect(html).not.toContain("Follow the link below");
      expect(Buffer.byteLength(html, "utf8")).toBeLessThan(20_000);
    },
  );

  it("uses a link only for link-based flows and a code only for reauthentication", () => {
    for (const [name] of templateCases.slice(0, 5)) {
      const html = loadTemplate(name);
      expect(html.match(/{{ \.ConfirmationURL }}/g)).toHaveLength(1);
      expect(html).not.toContain("{{ .Token }}");
    }

    const reauthentication = loadTemplate("reauthentication.html");
    expect(reauthentication.match(/{{ \.Token }}/g)).toHaveLength(1);
    expect(reauthentication).not.toContain("{{ .ConfirmationURL }}");
  });

  it("keeps the reauthentication code out of the email subject contract", () => {
    const config = readFileSync(new URL("../../../supabase/config.toml", import.meta.url), "utf8");

    expect(config).toContain('subject = "Kod weryfikacyjny Kwotum"');
    expect(config).not.toContain('subject = "Kod weryfikacyjny Kwotum: {{ .Token }}"');
  });
});
