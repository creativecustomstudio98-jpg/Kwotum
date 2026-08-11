import { renderLegacyFlowInvitationEmail, renderLegacyNotificationEmail } from "./templates-v1";

export type NotificationKind = "lead_company_alert" | "lead_customer_confirmation";

export type LeadCustomerTemplateVersion = "lead-customer-v1" | "lead-customer-v2";
export type LeadCompanyTemplateVersion = "lead-company-v1" | "lead-company-v2";
export type NotificationTemplateVersion = LeadCompanyTemplateVersion | LeadCustomerTemplateVersion;
export type FlowInvitationTemplateVersion = "flow-invitation-v1" | "flow-invitation-v2";
export type EmailTemplateVersion = NotificationTemplateVersion | FlowInvitationTemplateVersion;

export type NotificationTemplateInput = Readonly<{
  answers: ReadonlyArray<Readonly<{ question: string; value: string }>>;
  appUrl: string;
  companyName: string;
  contactEmail: string | null;
  contactName: string | null;
  contactPhone: string | null;
  flowTitle: string;
  kind: NotificationKind;
  leadId: string;
  organizationId: string;
  price: string | null;
  score: number | null;
  templateVersion: NotificationTemplateVersion;
}>;

export type FlowInvitationTemplateInput = Readonly<{
  appUrl: string;
  companyName: string;
  flowTitle: string;
  personalMessage: string | null;
  publicId: string;
  recipientName: string | null;
  templateVersion: FlowInvitationTemplateVersion;
}>;

export type RenderedEmail = Readonly<{
  html: string;
  subject: string;
  templateVersion: EmailTemplateVersion;
  text: string;
}>;

const bodyStyle =
  "margin:0;padding:0;background-color:#ffffff;color:#1a211e;font-family:Arial,Helvetica,sans-serif;line-height:1.6;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%";
const emailStyle =
  "width:100%;max-width:640px;margin:0 auto;border-collapse:collapse;border-spacing:0;background-color:#ffffff";
const headingStyle =
  "margin:0 0 16px;color:#173d31;font-size:30px;line-height:1.2;font-weight:700;letter-spacing:-0.6px";
const paragraphStyle = "margin:0 0 16px;color:#3e4b46;font-size:16px;line-height:1.65";
const sectionHeadingStyle =
  "margin:0;color:#173d31;font-size:19px;line-height:1.35;font-weight:700";
const eyebrowStyle =
  "margin:0 0 10px;color:#2f6a4f;font-size:12px;line-height:1.4;font-weight:700;letter-spacing:1.2px;text-transform:uppercase";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeHeader(value: string): string {
  return value
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .trim()
    .slice(0, 160);
}

function safeLine(value: string): string {
  return value.replace(/[\r\n\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]+/g, " ").trim();
}

function detailRow(label: string, value: string, isLast = false): string {
  const border = isLast ? "" : "border-bottom:1px solid #e7ebe8;";
  return `<tr>
    <td width="170" valign="top" style="${border}padding:13px 16px 13px 0;color:#66716c;font-size:13px;line-height:1.5;font-weight:700">${escapeHtml(label)}</td>
    <td valign="top" style="${border}padding:13px 0;color:#1a211e;font-size:15px;line-height:1.5;overflow-wrap:anywhere;word-break:break-word">${escapeHtml(value)}</td>
  </tr>`;
}

function documentV2(subject: string, content: string, appUrl: string): string {
  const logoUrl = new URL(appUrl);
  logoUrl.pathname = "/kwotum-logo-icon-v3.png";
  logoUrl.search = "";
  logoUrl.hash = "";
  return `<!doctype html>
<html lang="pl" style="background-color:#ffffff">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="${bodyStyle}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(subject)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="width:100%;border-collapse:collapse;border-spacing:0;background-color:#ffffff">
    <tr>
      <td align="center" bgcolor="#ffffff" style="padding:0 20px;background-color:#ffffff">
        <!--[if mso]>
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" align="center"><tr><td>
        <![endif]-->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="${emailStyle}">
          <tr>
            <td bgcolor="#ffffff" style="padding:28px 0 22px;border-bottom:1px solid #d9e2dd;background-color:#ffffff">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;border-spacing:0">
                <tr>
                  <td style="padding:0 12px 0 0;vertical-align:middle">
                    <img src="${escapeHtml(logoUrl.toString())}" width="44" height="44" alt="" role="presentation" style="display:block;width:44px;height:44px;border:0;outline:none;text-decoration:none">
                  </td>
                  <td style="color:#143d2f;font-size:22px;line-height:1.2;font-weight:700;letter-spacing:-0.3px;vertical-align:middle">Kwotum</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td bgcolor="#ffffff" style="padding:36px 0 34px;background-color:#ffffff">
              <main>
                ${content}
              </main>
            </td>
          </tr>
          <tr>
            <td bgcolor="#ffffff" style="padding:20px 0 28px;border-top:1px solid #e5eae7;background-color:#ffffff;color:#66716c;font-size:12px;line-height:1.6">
              Wiadomość transakcyjna wygenerowana przez Kwotum.<br>
              <span style="color:#84908a">app.kwotum.pl</span>
            </td>
          </tr>
        </table>
        <!--[if mso]>
        </td></tr></table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function customerTemplateV2(input: NotificationTemplateInput): RenderedEmail {
  const company = safeLine(input.companyName);
  const flow = safeLine(input.flowTitle);
  const greeting = input.contactName
    ? `Dzień dobry, ${safeLine(input.contactName)}!`
    : "Dzień dobry!";
  const priceText = input.price
    ? `Orientacyjny wynik zapisany przy zapytaniu: ${safeLine(input.price)}.`
    : "Firma otrzymała zakres zapytania i dane kontaktowe.";
  const subject = safeHeader(`Potwierdzenie zapytania — ${company}`);
  return {
    html: documentV2(
      subject,
      `<p style="${eyebrowStyle}">Potwierdzenie zapytania</p>
    <h1 style="${headingStyle}">${escapeHtml(greeting)}</h1>
    <p style="${paragraphStyle}">Twoje zapytanie dotyczące procesu „${escapeHtml(flow)}” zostało przekazane do firmy ${escapeHtml(company)}.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:26px 0;border-collapse:collapse;border-spacing:0;border-top:1px solid #d9e2dd;border-bottom:1px solid #d9e2dd">
      <tr>
        <td style="padding:18px 0">
          <p style="margin:0 0 5px;color:#66716c;font-size:12px;line-height:1.4;font-weight:700;letter-spacing:0.8px;text-transform:uppercase">Status</p>
          <p style="margin:0;color:#173d31;font-size:17px;line-height:1.5;font-weight:700">${escapeHtml(priceText)}</p>
        </td>
      </tr>
    </table>
    <p style="${paragraphStyle}">Wynik ma charakter orientacyjny i nie stanowi oferty. Firma może skontaktować się, aby potwierdzić zakres i warunki.</p>`,
      input.appUrl,
    ),
    subject,
    templateVersion: "lead-customer-v2",
    text: `${greeting}

Twoje zapytanie dotyczące procesu „${flow}” zostało przekazane do firmy ${company}.

${priceText}

Wynik ma charakter orientacyjny i nie stanowi oferty. Firma może skontaktować się, aby potwierdzić zakres i warunki.

Wiadomość transakcyjna wygenerowana przez Kwotum.`,
  };
}

function companyTemplateV2(input: NotificationTemplateInput): RenderedEmail {
  const company = safeLine(input.companyName);
  const flow = safeLine(input.flowTitle);
  const contactEmail = input.contactEmail ? safeLine(input.contactEmail) : null;
  const contactName = input.contactName ? safeLine(input.contactName) : null;
  const contactPhone = input.contactPhone ? safeLine(input.contactPhone) : null;
  const appUrl = new URL(input.appUrl);
  appUrl.pathname = `/panel/${encodeURIComponent(input.organizationId)}/leady/${encodeURIComponent(input.leadId)}`;
  appUrl.search = "";
  appUrl.hash = "";
  const detailsUrl = appUrl.toString();
  const subject = safeHeader(`Nowy lead — ${flow}`);
  const scoreLine = input.score === null ? null : `${input.score}/100`;
  const priceLine = input.price ? safeLine(input.price) : null;
  const contactDetails = [
    ...(contactPhone ? [{ label: "Telefon", value: contactPhone }] : []),
    ...(contactName ? [{ label: "Imię", value: contactName }] : []),
    ...(contactEmail ? [{ label: "E-mail", value: contactEmail }] : []),
  ];
  const qualificationDetails = [
    ...(priceLine ? [{ label: "Orientacyjny wynik", value: priceLine }] : []),
    ...(scoreLine ? [{ label: "Score", value: scoreLine }] : []),
  ];
  const contactHtml =
    contactDetails.length === 0
      ? `<p style="${paragraphStyle}">Brak danych kontaktowych.</p>`
      : `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;border-spacing:0;border-top:1px solid #d9e2dd;border-bottom:1px solid #d9e2dd">${contactDetails
          .map((detail, index) =>
            detailRow(detail.label, detail.value, index === contactDetails.length - 1),
          )
          .join("")}</table>`;
  const qualificationHtml =
    qualificationDetails.length === 0
      ? ""
      : `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:28px 0 0;border-collapse:collapse;border-spacing:0">
      <tr>
        <td style="padding:0 0 8px"><h2 style="${sectionHeadingStyle}">Wynik kwalifikacji</h2></td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;border-spacing:0;border-top:1px solid #d9e2dd;border-bottom:1px solid #d9e2dd">${qualificationDetails
      .map((detail, index) =>
        detailRow(detail.label, detail.value, index === qualificationDetails.length - 1),
      )
      .join("")}</table>`;
  const contactText =
    contactDetails.length === 0
      ? "Brak danych kontaktowych."
      : contactDetails.map((detail) => `${detail.label}: ${detail.value}`).join("\n");
  const qualificationText =
    qualificationDetails.length === 0
      ? ""
      : `\nWynik kwalifikacji:\n${qualificationDetails
          .map((detail) => `${detail.label}: ${detail.value}`)
          .join("\n")}\n`;
  const answers = input.answers.slice(0, 40).map((answer) => ({
    question: safeLine(answer.question).slice(0, 240),
    value: safeLine(answer.value).slice(0, 2000),
  }));
  const answersHtml =
    answers.length === 0
      ? `<p style="${paragraphStyle}">Brak zapisanych odpowiedzi.</p>`
      : `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;border-spacing:0;border-top:1px solid #d9e2dd">${answers
          .map(
            (answer, index) => `<tr>
              <td style="padding:16px 0;${index === answers.length - 1 ? "" : "border-bottom:1px solid #e7ebe8;"}">
                <p style="margin:0 0 5px;color:#173d31;font-size:14px;line-height:1.5;font-weight:700;overflow-wrap:anywhere;word-break:break-word">${escapeHtml(answer.question)}</p>
                <p style="margin:0;color:#3e4b46;font-size:15px;line-height:1.6;overflow-wrap:anywhere;word-break:break-word">${escapeHtml(answer.value)}</p>
              </td>
            </tr>`,
          )
          .join("")}</table>`;
  const answersText =
    answers.length === 0
      ? "Brak zapisanych odpowiedzi."
      : answers.map((answer) => `${answer.question}: ${answer.value}`).join("\n");
  return {
    html: documentV2(
      subject,
      `<p style="${eyebrowStyle}">Nowe zapytanie</p>
    <h1 style="${headingStyle}">Nowy lead dla ${escapeHtml(company)}</h1>
    <p style="${paragraphStyle}">Klient ukończył proces „${escapeHtml(flow)}”. Poniżej znajdziesz dane kontaktowe i uporządkowany zakres zapytania.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:28px 0 0;border-collapse:collapse;border-spacing:0">
      <tr>
        <td style="padding:0 0 8px"><h2 style="${sectionHeadingStyle}">Dane kontaktowe</h2></td>
      </tr>
    </table>
    ${contactHtml}
    ${qualificationHtml}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:30px 0 8px;border-collapse:collapse;border-spacing:0">
      <tr>
        <td><h2 style="${sectionHeadingStyle}">Odpowiedzi klienta</h2></td>
      </tr>
    </table>
    ${answersHtml}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:30px 0 0;border-collapse:separate;border-spacing:0">
      <tr>
        <td bgcolor="#143d2f" style="border-radius:7px;background-color:#143d2f">
          <a href="${escapeHtml(detailsUrl)}" style="display:inline-block;padding:13px 20px;color:#ffffff;font-size:15px;line-height:1.4;font-weight:700;text-decoration:none">Otwórz szczegóły leada w panelu</a>
        </td>
      </tr>
    </table>`,
      input.appUrl,
    ),
    subject,
    templateVersion: "lead-company-v2",
    text: `Nowy lead dla ${company}

Klient ukończył proces „${flow}”.

Dane kontaktowe:
${contactText}
${qualificationText}

Odpowiedzi klienta:
${answersText}

Otwórz szczegóły leada w panelu:
${detailsUrl}

Wiadomość transakcyjna wygenerowana przez Kwotum.`,
  };
}

export function notificationTemplateMatchesKind(
  kind: NotificationKind,
  templateVersion: string,
): templateVersion is NotificationTemplateVersion {
  return kind === "lead_company_alert"
    ? templateVersion === "lead-company-v1" || templateVersion === "lead-company-v2"
    : templateVersion === "lead-customer-v1" || templateVersion === "lead-customer-v2";
}

export function isFlowInvitationTemplateVersion(
  templateVersion: string,
): templateVersion is FlowInvitationTemplateVersion {
  return templateVersion === "flow-invitation-v1" || templateVersion === "flow-invitation-v2";
}

export function renderNotificationEmail(input: NotificationTemplateInput): RenderedEmail {
  if (!notificationTemplateMatchesKind(input.kind, input.templateVersion)) {
    throw new Error("Notification kind and template version do not match.");
  }
  if (input.templateVersion.endsWith("-v1")) return renderLegacyNotificationEmail(input);
  return input.kind === "lead_company_alert" ? companyTemplateV2(input) : customerTemplateV2(input);
}

function flowInvitationTemplateV2(input: FlowInvitationTemplateInput): RenderedEmail {
  const company = safeLine(input.companyName);
  const flow = safeLine(input.flowTitle);
  const greeting = input.recipientName
    ? `Dzień dobry, ${safeLine(input.recipientName)}!`
    : "Dzień dobry!";
  const personalMessage = input.personalMessage ? safeLine(input.personalMessage) : null;
  const hostedUrl = new URL(input.appUrl);
  hostedUrl.pathname = `/f/${encodeURIComponent(input.publicId)}`;
  hostedUrl.search = "";
  hostedUrl.hash = "";
  const processUrl = hostedUrl.toString();
  const subject = safeHeader(`${company} zaprasza do uzupełnienia formularza`);
  const optionalHtml = personalMessage
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:24px 0;border-collapse:collapse;border-spacing:0;border-top:1px solid #d9e2dd;border-bottom:1px solid #d9e2dd">
      <tr>
        <td style="padding:18px 0">
          <p style="margin:0 0 5px;color:#66716c;font-size:12px;line-height:1.4;font-weight:700;letter-spacing:0.8px;text-transform:uppercase">Wiadomość od firmy</p>
          <p style="margin:0;color:#3e4b46;font-size:16px;line-height:1.65">${escapeHtml(personalMessage)}</p>
        </td>
      </tr>
    </table>`
    : "";
  const optionalText = personalMessage ? `\nWiadomość od firmy:\n${personalMessage}\n` : "";
  return {
    html: documentV2(
      subject,
      `<p style="${eyebrowStyle}">Zaproszenie do formularza</p>
    <h1 style="${headingStyle}">${escapeHtml(greeting)}</h1>
    <p style="${paragraphStyle}">Firma ${escapeHtml(company)} prosi o uzupełnienie formularza „${escapeHtml(flow)}”.</p>
    ${optionalHtml}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:26px 0 20px;border-collapse:separate;border-spacing:0">
      <tr>
        <td bgcolor="#143d2f" style="border-radius:7px;background-color:#143d2f">
          <a href="${escapeHtml(processUrl)}" style="display:inline-block;padding:13px 20px;color:#ffffff;font-size:15px;line-height:1.4;font-weight:700;text-decoration:none">Otwórz formularz</a>
        </td>
      </tr>
    </table>
    <p style="margin:0;color:#66716c;font-size:13px;line-height:1.6">Link prowadzi do bezpiecznego formularza Kwotum. Nie odpowiadaj na tę automatyczną wiadomość.</p>`,
      input.appUrl,
    ),
    subject,
    templateVersion: "flow-invitation-v2",
    text: `${greeting}

Firma ${company} prosi o uzupełnienie formularza „${flow}”.
${optionalText}
Otwórz formularz:
${processUrl}

Link prowadzi do bezpiecznego formularza Kwotum. Nie odpowiadaj na tę automatyczną wiadomość.

Wiadomość transakcyjna wygenerowana przez Kwotum.`,
  };
}

export function renderFlowInvitationEmail(input: FlowInvitationTemplateInput): RenderedEmail {
  if (!isFlowInvitationTemplateVersion(input.templateVersion)) {
    throw new Error("Unsupported flow invitation template version.");
  }
  return input.templateVersion === "flow-invitation-v1"
    ? renderLegacyFlowInvitationEmail(input)
    : flowInvitationTemplateV2(input);
}
