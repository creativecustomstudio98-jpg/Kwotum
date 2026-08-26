import { AuthorizationError, hasCapability, type Json } from "@wyceno/database";
import { LinkButton } from "@wyceno/ui";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireTenantContext } from "../../../../../lib/auth/tenant-context";
import { leadStatusLabels } from "../../../../../lib/leads/presentation";
import { getLeadDetail, type LeadDetail } from "../../../../../lib/leads/service";
import { getLeadLegalHold } from "../../../../../lib/privacy/service";
import { PanelIcon, type PanelIconName } from "../../../panel-icon";
import { LeadOperationsPanel } from "../lead-operations-panel";
import { LeadDetailTabs } from "./lead-detail-tabs";
import { LeadPrivacyControls } from "./privacy-controls";

export const metadata: Metadata = { title: "Szczegóły leada" };
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ leadId: string; organizationId: string }>;
};

const dateTimeFormatter = new Intl.DateTimeFormat("pl-PL", {
  dateStyle: "medium",
  timeStyle: "short",
});

const notificationStatusLabels = {
  failed: "Nie dostarczono",
  pending: "Oczekuje",
  processing: "Wysyłanie",
  retry: "Ponowienie zaplanowane",
  sent: "Dostarczono do dostawcy",
} as const;

export default async function LeadDetailPage({ params }: PageProps) {
  const { leadId, organizationId } = await params;
  const context = await requireTenantContext(organizationId);
  let lead;
  try {
    lead = await getLeadDetail(context, leadId);
  } catch (error) {
    if (error instanceof AuthorizationError && error.code === "NOT_FOUND") notFound();
    throw error;
  }

  const legalHold = context.role === "owner" ? await getLeadLegalHold(context, leadId) : null;
  const contactLabel = lead.contactName ?? lead.contactEmail ?? lead.contactPhone ?? "Klient";
  const location = findAnswer(lead.answers, ["gdzie", "lokaliz"]);
  const timing = findAnswer(lead.answers, ["kiedy", "termin", "data"]);
  const materialsLabel =
    lead.files.length === 0
      ? "Brak materiałów"
      : `${lead.files.length} ${lead.files.length === 1 ? "załącznik" : "załączniki"}`;
  const previewFile =
    lead.files.find((file) => file.downloadUrl && file.mimeType.startsWith("image/")) ??
    lead.files.find((file) => file.downloadUrl) ??
    lead.files[0] ??
    null;

  return (
    <main className="panel-workspace lead-operation lead-reference-page">
      <article className="lead-reference lead-reference--m6">
        <header className="lead-reference__header">
          <Link className="lead-reference__back" href={`/panel/${organizationId}/leady`}>
            <PanelIcon name="arrow-left" />
            Powrót
          </Link>
          <div className="lead-reference__identity">
            <span className="lead-reference__avatar" aria-hidden="true">
              {initials(contactLabel)}
            </span>
            <div>
              <h1>{contactLabel}</h1>
              <p>{lead.flowTitle}</p>
              <ul aria-label="Dane kontaktowe klienta" className="lead-reference__contact">
                {lead.contactEmail ? (
                  <li>
                    <a href={`mailto:${lead.contactEmail}`}>{lead.contactEmail}</a>
                  </li>
                ) : null}
                {lead.contactPhone ? (
                  <li>
                    <a href={`tel:${lead.contactPhone}`}>{lead.contactPhone}</a>
                  </li>
                ) : null}
                {!lead.contactEmail && !lead.contactPhone ? (
                  <li>
                    <span>Nie podano danych kontaktowych</span>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
          <div className="lead-reference__meta">
            <span>ID: {lead.id.slice(0, 8).toLocaleUpperCase()}</span>
            <time dateTime={lead.submittedAt}>{formatHeaderDate(lead.submittedAt)}</time>
          </div>
        </header>

        <section className="lead-reference-score" aria-labelledby="lead-reference-score-title">
          <h2 className="wy-sr-only" id="lead-reference-score-title">
            Wynik kwalifikacji
          </h2>
          <div className="lead-reference-score__value">
            <strong>
              {lead.score ?? "—"}
              {lead.score === null ? null : <small>/100</small>}
            </strong>
            <span>{lead.scoreCategoryLabel ?? fitLabel(lead.score)}</span>
          </div>
          <div className="lead-reference-score__reasons">
            {lead.triggeredScoringRules.length === 0 ? (
              <p>Brak zapisanych powodów dopasowania.</p>
            ) : (
              <ul>
                {lead.triggeredScoringRules.map((rule) => (
                  <li key={rule.id}>
                    <span className="lead-reference-check" aria-hidden="true">
                      <PanelIcon name="check" />
                    </span>
                    <span>{rule.label}</span>
                    <small>{formatScoringPoints(rule.points)}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <LeadDetailTabs />

        <div className="lead-reference-workspace">
          <div className="lead-reference-workspace__document">
            <section
              aria-labelledby="lead-summary-title"
              className="lead-reference-panel lead-reference-summary"
              id="summary-panel"
              tabIndex={-1}
            >
              <div className="lead-reference-summary__main">
                <h2 className="wy-sr-only" id="lead-summary-title">
                  Podsumowanie zapytania
                </h2>
                <dl className="lead-reference-summary-list">
                  <SummaryRow icon="leads" label="Usługa" value={lead.flowTitle} />
                  <SummaryRow
                    icon="templates"
                    label="Zakres"
                    value={buildScopeSummary(lead.answers)}
                  />
                  <SummaryRow
                    icon="money"
                    label="Budżet"
                    value={formatPrice(
                      lead.pricePresentation,
                      lead.priceMinMinor,
                      lead.priceMaxMinor,
                      lead.priceCurrency,
                    )}
                  />
                  <SummaryRow
                    icon="calendar"
                    label="Termin"
                    value={formatTimeline(timing ?? "Nie podano")}
                  />
                  <SummaryRow
                    icon="location"
                    label="Lokalizacja"
                    value={location ?? "Nie podano"}
                  />
                  <div className="lead-reference-summary-row lead-reference-summary-row--materials">
                    <dt>
                      <PanelIcon name="attachment" />
                      Materiały
                    </dt>
                    <dd>
                      <span>{materialsLabel}</span>
                      {lead.files.length > 0 ? (
                        <div className="lead-reference-materials">
                          {lead.files.slice(0, 2).map((file) =>
                            file.downloadUrl && file.mimeType.startsWith("image/") ? (
                              <Image
                                alt={file.name}
                                height={58}
                                key={file.id}
                                src={file.downloadUrl}
                                unoptimized
                                width={82}
                              />
                            ) : (
                              <span className="lead-reference-file-tile" key={file.id}>
                                <PanelIcon name="file" />
                              </span>
                            ),
                          )}
                          {lead.files.length > 2 ? <b>+{lead.files.length - 2}</b> : null}
                        </div>
                      ) : null}
                    </dd>
                  </div>
                </dl>

                {lead.preferredContactChannel || lead.preferredContactWindow ? (
                  <section
                    aria-labelledby="contact-preference-title"
                    className="lead-reference-summary-block"
                  >
                    <div className="lead-reference-panel-heading">
                      <div>
                        <h2 id="contact-preference-title">Preferencje kontaktu</h2>
                        <p>Wybór zapisany przez klienta w formularzu.</p>
                      </div>
                    </div>
                    <dl className="lead-reference-summary-list">
                      {lead.preferredContactChannel ? (
                        <SummaryRow
                          icon={lead.preferredContactChannel === "email" ? "email" : "phone"}
                          label="Kanał"
                          value={lead.preferredContactChannel === "email" ? "E-mail" : "Telefon"}
                        />
                      ) : null}
                      {lead.preferredContactWindow ? (
                        <SummaryRow
                          icon="calendar"
                          label="Pora"
                          value={
                            {
                              morning: "Rano (8:00–12:00)",
                              afternoon: "Po południu (12:00–17:00)",
                              evening: "Wieczorem (17:00–20:00)",
                            }[lead.preferredContactWindow]
                          }
                        />
                      ) : null}
                    </dl>
                  </section>
                ) : null}

                {lead.context.values.length > 0 ? (
                  <section
                    aria-labelledby="lead-context-title"
                    className="lead-reference-summary-block lead-reference-context"
                  >
                    <div className="lead-reference-panel-heading">
                      <div>
                        <h2 id="lead-context-title">Kontekst wejścia</h2>
                        <p>
                          {lead.context.source.kind === "embedded"
                            ? "Osadzenie na stronie"
                            : "Link bezpośredni"}
                          {lead.context.source.origin ? ` · ${lead.context.source.origin}` : ""}
                        </p>
                      </div>
                      <span>{lead.context.values.length} pól</span>
                    </div>
                    <dl>
                      {lead.context.values.map((entry) => (
                        <div key={entry.key}>
                          <dt>{entry.label}</dt>
                          <dd>{entry.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                ) : null}
              </div>
            </section>

            <section
              aria-labelledby="lead-answers-title"
              className="lead-reference-panel lead-reference-answers"
              id="answers-panel"
              tabIndex={-1}
            >
              <div className="lead-reference-panel-heading">
                <div>
                  <h2 id="lead-answers-title">Odpowiedzi klienta</h2>
                  <p>Komplet informacji przekazanych w prowadzonym procesie.</p>
                </div>
                <span>
                  {lead.answers.length} {lead.answers.length === 1 ? "odpowiedź" : "odpowiedzi"}
                </span>
              </div>
              <dl>
                {lead.answers.map((answer) => (
                  <div key={answer.stepKey}>
                    <dt>{answer.questionTitle}</dt>
                    <dd>{formatAnswer(answer.answer)}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section
              aria-labelledby="lead-files-title"
              className="lead-reference-panel lead-reference-files"
              id="files-panel"
              tabIndex={-1}
            >
              <div className="lead-reference-panel-heading">
                <div>
                  <h2 id="lead-files-title">Pliki klienta</h2>
                  <p>Materiały źródłowe do weryfikacji zakresu zapytania.</p>
                </div>
                <span>
                  {lead.files.length} {fileCountLabel(lead.files.length)}
                </span>
              </div>
              {lead.files.length === 0 ? (
                <p>Klient nie dodał plików do tego zapytania.</p>
              ) : (
                <div className="lead-reference-files-layout">
                  <ul aria-label="Lista plików klienta">
                    {lead.files.map((file) => (
                      <li key={file.id}>
                        <PanelIcon name="file" />
                        <span>
                          {file.downloadUrl ? (
                            <a href={file.downloadUrl} rel="noreferrer" target="_blank">
                              {file.name}
                            </a>
                          ) : (
                            <strong>{file.name}</strong>
                          )}
                          <small>
                            {formatFileType(file.mimeType)} · {formatFileSize(file.sizeBytes)}
                          </small>
                        </span>
                        {file.downloadUrl ? (
                          <a
                            aria-label={`Otwórz plik ${file.name}`}
                            className="lead-reference-file-open"
                            href={file.downloadUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            <PanelIcon name="external" />
                          </a>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                  {previewFile ? (
                    <aside
                      aria-label={`Podgląd pliku ${previewFile.name}`}
                      className="lead-reference-file-preview"
                    >
                      <div className="lead-reference-file-preview__header">
                        <span>Podgląd</span>
                        <small>{formatFileType(previewFile.mimeType)}</small>
                      </div>
                      {previewFile.downloadUrl && previewFile.mimeType.startsWith("image/") ? (
                        <a href={previewFile.downloadUrl} rel="noreferrer" target="_blank">
                          <Image
                            alt={`Podgląd pliku ${previewFile.name}`}
                            height={180}
                            src={previewFile.downloadUrl}
                            unoptimized
                            width={280}
                          />
                        </a>
                      ) : (
                        <div className="lead-reference-file-preview__fallback">
                          <PanelIcon name="file" />
                          <span>Podgląd niedostępny</span>
                        </div>
                      )}
                      <div className="lead-reference-file-preview__meta">
                        <strong>{previewFile.name}</strong>
                        <small>{formatFileSize(previewFile.sizeBytes)}</small>
                      </div>
                    </aside>
                  ) : null}
                </div>
              )}
            </section>

            <section
              aria-labelledby="lead-history-title"
              className="lead-reference-panel lead-reference-history"
              id="history-panel"
              tabIndex={-1}
            >
              <div>
                <h2 id="lead-history-title">Historia</h2>
                <ol>
                  {leadTimeline(lead).map((entry) => (
                    <li data-occurred-at={entry.occurredAt} key={entry.id}>
                      <span className="lead-reference-check" aria-hidden="true">
                        <PanelIcon name={entry.icon} />
                      </span>
                      <span>
                        <strong>{entry.title}</strong>
                        <small>{entry.meta}</small>
                        {entry.description ? <p>{entry.description}</p> : null}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              <details>
                <summary>Prywatność i zgody</summary>
                <ul>
                  {lead.consents.length > 0 ? (
                    lead.consents.map((consent) => (
                      <li key={`${consent.type}-${consent.contentVersion}`}>
                        {consent.type === "privacy_notice"
                          ? "Informacja o prywatności"
                          : "Marketing e-mail"}
                        <small>
                          wersja {consent.contentVersion} · {formatDateTime(consent.recordedAt)}
                        </small>
                      </li>
                    ))
                  ) : (
                    <li>Brak zapisanych zgód dla tego zapytania.</li>
                  )}
                </ul>
                {context.role === "owner" ? (
                  <div>
                    <LeadPrivacyControls
                      hold={legalHold}
                      leadId={lead.id}
                      organizationId={organizationId}
                    />
                    <LinkButton
                      href={`/panel/${organizationId}/prywatnosc`}
                      size="small"
                      variant="secondary"
                    >
                      Polityka retencji
                    </LinkButton>
                  </div>
                ) : null}
              </details>
            </section>
          </div>

          <LeadOperationsPanel
            canAssign={hasCapability(context, "lead:assign")}
            canManageAllTasks={context.role === "owner" || context.role === "admin"}
            contactEmail={lead.contactEmail}
            contactPhone={lead.contactPhone}
            currentUserId={context.userId}
            leadId={lead.id}
            notes={lead.notes}
            operation={lead.operation}
            organizationId={organizationId}
            status={lead.status}
          />
        </div>
      </article>
    </main>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: Readonly<{ icon: PanelIconName; label: string; value: string }>) {
  return (
    <div className="lead-reference-summary-row">
      <dt>
        <PanelIcon name={icon} />
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  );
}

function formatAnswer(answer: Json | undefined): string {
  if (answer === null || answer === undefined) return "Brak odpowiedzi";
  if (typeof answer === "string") return answer;
  if (typeof answer === "number") return new Intl.NumberFormat("pl-PL").format(answer);
  if (typeof answer === "boolean") return answer ? "Tak" : "Nie";
  if (Array.isArray(answer)) return answer.map(formatAnswer).join(", ");
  return Object.entries(answer)
    .map(([key, value]) => `${key}: ${formatAnswer(value)}`)
    .join(", ");
}

function formatPrice(
  presentation: string | null,
  minimum: number | null,
  maximum: number | null,
  currency: string | null,
): string {
  if (!currency || minimum === null) return "Nie obliczono";
  const formatter = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 });
  const currencyLabel = currency === "PLN" ? "zł" : currency;
  const formattedMinimum = `${formatter.format(minimum / 100)} ${currencyLabel}`;
  if (presentation === "exact" || maximum === null || maximum === minimum) {
    return formattedMinimum;
  }
  const formattedMaximum = `${formatter.format(maximum / 100)} ${currencyLabel}`;
  if (presentation === "from") return `od ${formattedMinimum}`;
  return `${formatter.format(minimum / 100)} – ${formattedMaximum}`;
}

function buildScopeSummary(
  answers: ReadonlyArray<Readonly<{ answer: Json; questionTitle: string }>>,
): string {
  const scope = findAnswer(answers, ["zabudow", "zakres"]) ?? "Nie podano";
  const dimension = findAnswer(answers, ["długoś", "wymiar"]);
  if (!dimension) return scope;
  return `${scope}, około ${dimension} cm zabudowy`;
}

function findAnswer(
  answers: ReadonlyArray<Readonly<{ answer: Json; questionTitle: string }>>,
  fragments: ReadonlyArray<string>,
): string | null {
  const match = answers.find((answer) => {
    const title = answer.questionTitle.toLocaleLowerCase("pl-PL");
    return fragments.some((fragment) => title.includes(fragment));
  });
  return match ? formatAnswer(match.answer) : null;
}

function fitLabel(score: number | null): string {
  if (score === null) return "Brak oceny";
  if (score >= 90) return "Świetne dopasowanie";
  if (score >= 80) return "Dobre dopasowanie";
  if (score >= 55) return "Średnie dopasowanie";
  return "Niskie dopasowanie";
}

function formatScoringPoints(points: number): string {
  const sign = points > 0 ? "+" : "";
  return `${sign}${points} pkt`;
}

function formatTimeline(value: string): string {
  return value.replace(/^W ciągu /, "Do ");
}

function formatHeaderDate(value: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(new Date(value))
    .replace(",", "");
}

function formatDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) {
    return `${new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 1 }).format(size / 1024)} KB`;
  }
  return `${new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 1 }).format(
    size / (1024 * 1024),
  )} MB`;
}

function formatFileType(mimeType: string): string {
  const labels: Readonly<Record<string, string>> = {
    "application/pdf": "Dokument PDF",
    "image/jpeg": "Obraz JPG",
    "image/png": "Obraz PNG",
    "image/webp": "Obraz WEBP",
  };
  return labels[mimeType] ?? mimeType;
}

function fileCountLabel(count: number): string {
  if (count === 1) return "plik";
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;
  if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwoDigits >= 12 && lastTwoDigits <= 14)) {
    return "pliki";
  }
  return "plików";
}

type LeadTimelineEntry = Readonly<{
  description: string | null;
  icon: PanelIconName;
  id: string;
  meta: string;
  occurredAt: string;
  title: string;
}>;

function leadTimeline(lead: LeadDetail): LeadTimelineEntry[] {
  const entries: LeadTimelineEntry[] = [
    ...lead.history.map((entry, index) => ({
      description: null,
      icon: "edit" as const,
      id: `status-${entry.changedAt}-${index}`,
      meta: formatDateTime(entry.changedAt),
      occurredAt: entry.changedAt,
      title: entry.fromStatus
        ? `${leadStatusLabels[entry.fromStatus]} → ${leadStatusLabels[entry.toStatus]}`
        : `Utworzono → ${leadStatusLabels[entry.toStatus]}`,
    })),
    ...lead.notes.map((note) => ({
      description: note.body,
      icon: "edit" as const,
      id: `note-${note.id}`,
      meta: `${note.createdByName} · ${formatDateTime(note.createdAt)}`,
      occurredAt: note.createdAt,
      title: "Dodano notatkę",
    })),
    ...lead.operation.activities.map((activity) => ({
      description: null,
      icon: (activity.kind.startsWith("task_") ? "check" : "settings") as PanelIconName,
      id: `operation-${activity.id}`,
      meta: `${activity.actorName} · ${formatDateTime(activity.occurredAt)}`,
      occurredAt: activity.occurredAt,
      title: operationActivityLabel(activity),
    })),
    ...lead.notifications.map((notification) => {
      const occurredAt = notification.sentAt ?? notification.createdAt;
      const attempts = notification.attemptCount > 1 ? ` · ${notification.attemptCount} próby` : "";
      return {
        description: null,
        icon: "email" as const,
        id: `notification-${notification.kind}`,
        meta: `${notificationStatusLabels[notification.status]} · ${formatDateTime(occurredAt)}${attempts}`,
        occurredAt,
        title:
          notification.kind === "lead_company_alert"
            ? "Alert dla firmy"
            : "Potwierdzenie dla klienta",
      };
    }),
  ];

  return entries.toSorted(
    (left, right) =>
      Date.parse(right.occurredAt) - Date.parse(left.occurredAt) || left.id.localeCompare(right.id),
  );
}

function operationActivityLabel(activity: LeadDetail["operation"]["activities"][number]): string {
  switch (activity.kind) {
    case "assignee_changed":
      return `Właściciel: ${activity.fromLabel ?? "Bez właściciela"} → ${activity.toLabel ?? "Bez właściciela"}`;
    case "priority_changed":
      return `Priorytet: ${priorityLabel(activity.fromLabel)} → ${priorityLabel(activity.toLabel)}`;
    case "task_created":
      return `Utworzono: ${activity.taskTitle ?? "działanie"}`;
    case "task_completed":
      return `Wykonano: ${activity.taskTitle ?? "działanie"}`;
    case "task_cancelled":
      return `Anulowano: ${activity.taskTitle ?? "działanie"}`;
  }
}

function priorityLabel(value: string | null): string {
  if (value === "high") return "Wysoki";
  if (value === "low") return "Niski";
  if (value === "medium") return "Średni";
  return "Nie ustawiono";
}

function initials(value: string): string {
  return (
    value
      .trim()
      .split(/\s+|@/)
      .slice(0, 2)
      .map((part) => part[0]?.toLocaleUpperCase("pl-PL") ?? "")
      .join("") || "L"
  );
}
