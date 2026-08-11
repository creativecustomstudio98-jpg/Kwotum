import type {
  FlowInvitationTemplateInput,
  NotificationTemplateInput,
  RenderedEmail,
} from "./templates";

const bodyStyle =
  "margin:0;background:#f4f7f5;color:#17352c;font-family:Arial,sans-serif;line-height:1.6";
const mainStyle =
  "max-width:640px;margin:0 auto;padding:32px 24px;background:#ffffff;border-top:4px solid #16634a";

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

function documentV1(subject: string, content: string, appUrl: string): string {
  const logoUrl = new URL(appUrl);
  logoUrl.pathname = "/kwotum-logo-v3.png";
  logoUrl.search = "";
  logoUrl.hash = "";
  return `<!doctype html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="${bodyStyle}">
  <main style="${mainStyle}">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 28px">
      <tr>
        <td style="padding-right:10px;vertical-align:middle"><img src="${escapeHtml(logoUrl.toString())}" width="36" height="36" alt="" style="display:block;width:36px;height:36px"></td>
        <td style="color:#143d2f;font-size:20px;font-weight:bold;vertical-align:middle">Kwotum</td>
      </tr>
    </table>
    ${content}
    <p style="margin-top:32px;color:#52675f;font-size:14px">Wiadomość transakcyjna wygenerowana przez Kwotum.</p>
  </main>
</body>
</html>`;
}

function customerTemplateV1(input: NotificationTemplateInput): RenderedEmail {
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
    html: documentV1(
      subject,
      `<h1 style="margin:0 0 16px;font-size:28px">${escapeHtml(greeting)}</h1>
    <p>Twoje zapytanie dotyczące procesu „${escapeHtml(flow)}” zostało przekazane do firmy ${escapeHtml(company)}.</p>
    <p>${escapeHtml(priceText)}</p>
    <p>Wynik ma charakter orientacyjny i nie stanowi oferty. Firma może skontaktować się, aby potwierdzić zakres i warunki.</p>`,
      input.appUrl,
    ),
    subject,
    templateVersion: "lead-customer-v1",
    text: `${greeting}

Twoje zapytanie dotyczące procesu „${flow}” zostało przekazane do firmy ${company}.

${priceText}

Wynik ma charakter orientacyjny i nie stanowi oferty. Firma może skontaktować się, aby potwierdzić zakres i warunki.

Wiadomość transakcyjna wygenerowana przez Kwotum.`,
  };
}

function companyTemplateV1(input: NotificationTemplateInput): RenderedEmail {
  const company = safeLine(input.companyName);
  const flow = safeLine(input.flowTitle);
  const contactEmail = input.contactEmail ? safeLine(input.contactEmail) : "Nie podano";
  const contactName = input.contactName ? safeLine(input.contactName) : "Nie podano";
  const contactPhone = input.contactPhone ? safeLine(input.contactPhone) : "Nie podano";
  const appUrl = new URL(input.appUrl);
  appUrl.pathname = `/panel/${encodeURIComponent(input.organizationId)}/leady/${encodeURIComponent(input.leadId)}`;
  appUrl.search = "";
  appUrl.hash = "";
  const detailsUrl = appUrl.toString();
  const subject = safeHeader(`Nowy lead — ${flow}`);
  const scoreLine = input.score === null ? "Nie obliczono" : `${input.score}/100`;
  const priceLine = input.price ? safeLine(input.price) : "Nie obliczono";
  const answers = input.answers.slice(0, 40).map((answer) => ({
    question: safeLine(answer.question).slice(0, 240),
    value: safeLine(answer.value).slice(0, 2000),
  }));
  const answersHtml =
    answers.length === 0
      ? "<p>Brak zapisanych odpowiedzi.</p>"
      : `<dl>${answers
          .map(
            (answer) =>
              `<dt style="font-weight:bold">${escapeHtml(answer.question)}</dt><dd style="margin:0 0 12px">${escapeHtml(answer.value)}</dd>`,
          )
          .join("")}</dl>`;
  const answersText =
    answers.length === 0
      ? "Brak zapisanych odpowiedzi."
      : answers.map((answer) => `${answer.question}: ${answer.value}`).join("\n");
  return {
    html: documentV1(
      subject,
      `<h1 style="margin:0 0 16px;font-size:28px">Nowy lead dla ${escapeHtml(company)}</h1>
    <p>Klient ukończył proces „${escapeHtml(flow)}”.</p>
    <dl>
      <dt style="font-weight:bold">Imię</dt><dd style="margin:0 0 12px">${escapeHtml(contactName)}</dd>
      <dt style="font-weight:bold">Telefon</dt><dd style="margin:0 0 12px">${escapeHtml(contactPhone)}</dd>
      <dt style="font-weight:bold">E-mail</dt><dd style="margin:0 0 12px">${escapeHtml(contactEmail)}</dd>
      <dt style="font-weight:bold">Orientacyjny wynik</dt><dd style="margin:0 0 12px">${escapeHtml(priceLine)}</dd>
      <dt style="font-weight:bold">Score</dt><dd style="margin:0 0 12px">${escapeHtml(scoreLine)}</dd>
    </dl>
    <h2 style="margin:24px 0 12px;font-size:20px">Odpowiedzi klienta</h2>
    ${answersHtml}
    <p><a href="${escapeHtml(detailsUrl)}" style="color:#0d5c43;font-weight:bold">Otwórz szczegóły leada w panelu</a></p>`,
      input.appUrl,
    ),
    subject,
    templateVersion: "lead-company-v1",
    text: `Nowy lead dla ${company}

Klient ukończył proces „${flow}”.

Imię: ${contactName}
Telefon: ${contactPhone}
E-mail: ${contactEmail}
Orientacyjny wynik: ${priceLine}
Score: ${scoreLine}

Odpowiedzi klienta:
${answersText}

Otwórz szczegóły leada w panelu:
${detailsUrl}

Wiadomość transakcyjna wygenerowana przez Kwotum.`,
  };
}

export function renderLegacyNotificationEmail(input: NotificationTemplateInput): RenderedEmail {
  return input.kind === "lead_company_alert" ? companyTemplateV1(input) : customerTemplateV1(input);
}

export function renderLegacyFlowInvitationEmail(input: FlowInvitationTemplateInput): RenderedEmail {
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
    ? `<p style="margin:20px 0;padding:16px;border-left:3px solid #9ad672;background:#f4f8f5">${escapeHtml(personalMessage)}</p>`
    : "";
  const optionalText = personalMessage ? `\nWiadomość od firmy:\n${personalMessage}\n` : "";
  return {
    html: documentV1(
      subject,
      `<h1 style="margin:0 0 16px;font-size:28px">${escapeHtml(greeting)}</h1>
    <p>Firma ${escapeHtml(company)} prosi o uzupełnienie formularza „${escapeHtml(flow)}”.</p>
    ${optionalHtml}
    <p><a href="${escapeHtml(processUrl)}" style="display:inline-block;padding:12px 18px;background:#06753a;color:#ffffff;text-decoration:none;font-weight:bold">Otwórz formularz</a></p>
    <p style="color:#52675f;font-size:14px">Link prowadzi do bezpiecznego formularza Kwotum. Nie odpowiadaj na tę automatyczną wiadomość.</p>`,
      input.appUrl,
    ),
    subject,
    templateVersion: "flow-invitation-v1",
    text: `${greeting}

Firma ${company} prosi o uzupełnienie formularza „${flow}”.
${optionalText}
Otwórz formularz:
${processUrl}

Link prowadzi do bezpiecznego formularza Kwotum. Nie odpowiadaj na tę automatyczną wiadomość.

Wiadomość transakcyjna wygenerowana przez Kwotum.`,
  };
}
