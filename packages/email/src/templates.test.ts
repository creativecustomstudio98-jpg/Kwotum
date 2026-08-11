import { describe, expect, it } from "vitest";

import {
  renderFlowInvitationEmail,
  renderNotificationEmail,
  type NotificationKind,
  type NotificationTemplateInput,
} from "./templates";

const baseInput = {
  answers: [
    { question: "Rodzaj przyczepy", value: "Laweta <lekka>" },
    { question: "DMC", value: "do 2700 kg" },
  ],
  appUrl: "https://app.wyceno.test",
  companyName: "Studio <Mebli>",
  contactEmail: "klient@example.test",
  contactName: "Jan & Anna",
  contactPhone: "+48 500 600 700",
  flowTitle: "Kuchnia <script>alert(1)</script>",
  leadId: "e0000000-0000-4000-8000-000000000001",
  organizationId: "a0000000-0000-4000-8000-000000000001",
  price: "10 000–15 000 zł",
  score: 80,
} as const;

function notificationInput(
  kind: NotificationKind,
  generation: "v1" | "v2" = "v2",
): NotificationTemplateInput {
  const templateVersion =
    kind === "lead_company_alert"
      ? (`lead-company-${generation}` as const)
      : (`lead-customer-${generation}` as const);
  return { ...baseInput, kind, templateVersion };
}

describe("notification templates", () => {
  it.each(["lead_customer_confirmation", "lead_company_alert"] as const)(
    "renders accessible HTML and a useful text alternative for %s",
    (kind) => {
      const message = renderNotificationEmail(notificationInput(kind));

      expect(message.html).toContain('<html lang="pl"');
      expect(message.html).toContain("<title>");
      expect(message.html).toContain("<main");
      expect(message.html).toContain("<h1");
      expect(message.html).not.toContain("<script>");
      expect(message.html).toContain("&lt;script&gt;");
      expect(message.text.length).toBeGreaterThan(100);
      expect(message.subject).not.toMatch(/[\r\n]/);
    },
  );

  it("does not expose score or panel link in the customer confirmation", () => {
    const message = renderNotificationEmail(notificationInput("lead_customer_confirmation"));

    expect(message.text).not.toContain("80/100");
    expect(message.text).not.toContain("/panel/");
    expect(message.text).not.toContain(baseInput.contactEmail);
  });

  it("includes an escaped, self-contained brief in the company alert", () => {
    const message = renderNotificationEmail(notificationInput("lead_company_alert"));

    expect(message.html).toContain("Odpowiedzi klienta");
    expect(message.html).toContain("Laweta &lt;lekka&gt;");
    expect(message.text).toContain("Rodzaj przyczepy: Laweta <lekka>");
  });

  it.each(["lead_customer_confirmation", "lead_company_alert"] as const)(
    "uses a white email surface and a cache-safe raster Kwotum mark for %s",
    (kind) => {
      const message = renderNotificationEmail(notificationInput(kind));

      expect(message.html).toContain('<html lang="pl" style="background-color:#ffffff">');
      expect(message.html).toContain('bgcolor="#ffffff"');
      expect(message.html).toContain("background-color:#ffffff");
      expect(message.html).not.toContain("#f4f7f5");
      expect(message.html).not.toMatch(/gradient/i);
      expect(message.html).toContain('src="https://app.wyceno.test/kwotum-logo-icon-v3.png"');
      expect(message.html).toContain('alt="" role="presentation"');
      expect(message.html).toContain('width="44" height="44"');
      expect(message.html).toContain("<!--[if mso]>");
      expect(message.html).toContain('<table role="presentation" width="640"');
      expect(message.html).not.toMatch(/src="(?!https:\/\/)/i);
    },
  );

  it("keeps hostile content inert in the table-based company email", () => {
    const message = renderNotificationEmail({
      ...notificationInput("lead_company_alert"),
      answers: [
        {
          question: '\"><a href="javascript:alert(1)">Pytanie</a>',
          value: '<img src=x onerror="alert(1)">',
        },
      ],
      companyName: '\"><script>alert(1)</script>',
      contactName: "Jan\r\nBcc: attacker@example.test",
    });

    expect(message.html).toContain("&lt;script&gt;");
    expect(message.html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(message.html).not.toMatch(/<script[\s>]/i);
    expect(message.html).not.toMatch(/<img\s+src=x/i);
    expect(message.html).not.toMatch(/href=["']javascript:/i);
    const imageTags = message.html.match(/<img\b[^>]*>/gi) ?? [];
    expect(imageTags).toHaveLength(1);
    expect(imageTags[0]).not.toMatch(/\sonerror=/i);
    expect(message.subject).not.toMatch(/[\r\n]/);
  });

  it("omits unavailable contact and qualification rows from the company alert", () => {
    const message = renderNotificationEmail({
      ...notificationInput("lead_company_alert"),
      contactEmail: null,
      price: null,
      score: null,
    });

    expect(message.templateVersion).toBe("lead-company-v2");
    expect(message.html).toContain("Telefon");
    expect(message.html).toContain(baseInput.contactPhone);
    expect(message.html).toContain("Jan &amp; Anna");
    expect(message.html).not.toContain("Nie podano");
    expect(message.html).not.toContain("Nie obliczono");
    expect(message.html).not.toContain("Wynik kwalifikacji");
    expect(message.text).not.toContain("E-mail:");
    expect(message.text).not.toContain("Nie obliczono");
    expect(message.text).toContain(`Telefon: ${baseInput.contactPhone}`);
  });

  it("renders a flow invitation without recipient data or tracking in the URL", () => {
    const message = renderFlowInvitationEmail({
      appUrl: baseInput.appUrl,
      companyName: baseInput.companyName,
      flowTitle: baseInput.flowTitle,
      personalMessage: "Proszę opisać zakres <dokładnie>.",
      publicId: "f0000000-0000-4000-8000-000000000001",
      recipientName: baseInput.contactName,
      templateVersion: "flow-invitation-v2",
    });

    expect(message.templateVersion).toBe("flow-invitation-v2");
    expect(message.html).toContain("/f/f0000000-0000-4000-8000-000000000001");
    expect(message.html).toContain('src="https://app.wyceno.test/kwotum-logo-icon-v3.png"');
    expect(message.html).toContain("&lt;dokładnie&gt;");
    expect(message.html).not.toContain("utm_");
    expect(message.html).not.toContain("tracking");
    expect(message.subject).not.toMatch(/[\r\n]/);
  });

  it.each([
    ["lead_customer_confirmation", "lead-customer-v1"],
    ["lead_company_alert", "lead-company-v1"],
  ] as const)("preserves the locked %s v1 renderer", (kind, templateVersion) => {
    const message = renderNotificationEmail(notificationInput(kind, "v1"));

    expect(message.templateVersion).toBe(templateVersion);
    expect(message.html).toContain(
      'body style="margin:0;background:#f4f7f5;color:#17352c;font-family:Arial,sans-serif;line-height:1.6"',
    );
    expect(message.html).toContain(
      'main style="max-width:640px;margin:0 auto;padding:32px 24px;background:#ffffff;border-top:4px solid #16634a"',
    );
    expect(message.html).toContain('src="https://app.wyceno.test/kwotum-logo-v3.png"');
    expect(message.html).not.toContain("kwotum-logo-icon-v3.png");
    expect(message.html).not.toContain("<!--[if mso]>");
  });

  it("preserves the locked flow invitation v1 renderer", () => {
    const message = renderFlowInvitationEmail({
      appUrl: baseInput.appUrl,
      companyName: baseInput.companyName,
      flowTitle: baseInput.flowTitle,
      personalMessage: "Proszę opisać zakres <dokładnie>.",
      publicId: "f0000000-0000-4000-8000-000000000001",
      recipientName: baseInput.contactName,
      templateVersion: "flow-invitation-v1",
    });

    expect(message.templateVersion).toBe("flow-invitation-v1");
    expect(message.html).toContain('src="https://app.wyceno.test/kwotum-logo-v3.png"');
    expect(message.html).toContain("border-left:3px solid #9ad672;background:#f4f8f5");
    expect(message.html).not.toContain("<!--[if mso]>");
  });

  it("rejects a template version that does not match the notification kind", () => {
    expect(() =>
      renderNotificationEmail({
        ...notificationInput("lead_customer_confirmation"),
        templateVersion: "lead-company-v2",
      }),
    ).toThrow("Notification kind and template version do not match.");
  });
});
