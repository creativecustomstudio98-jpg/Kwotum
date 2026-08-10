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
  const contactLabel = lead.contactName ?? lead.contactEmail;
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
      <article className="lead-reference">
        <header className="lead-reference__header">
          <Link className="lead-reference__back" href={`/panel/${organizationId}/leady`}>
            <PanelIcon name="arrow-left" />
            Powrót
          </Link>
          <div className="lead-reference__identity">
            <div className="lead-reference__avatars" aria-hidden="true">
              <Image
                alt=""
                height={40}
                priority
                src="/images/redesign/anna-kowalska-avatar-v1.webp"
                unoptimized
                width={40}
              />
              <span>{initials(contactLabel)}</span>
            </div>
            <div>
              <h1>{contactLabel}</h1>
              <p>{lead.flowTitle}</p>
            </div>
          </div>
          <div className="lead-reference__meta">
            <span>ID: {lead.id.slice(0, 8).toLocaleUpperCase()}</span>
            <time dateTime={lead.submittedAt}>{formatHeaderDate(lead.submittedAt)}</time>
          </div>
        </header>

        <section className="lead-reference-score" aria-labelledby="lead-reference-score-title">
          <div className="lead-reference-score__value">
            <strong id="lead-reference-score-title">
              {lead.score ?? "—"}
              {lead.score === null ? null : <small>/100</small>}
            </strong>
            <span>{fitLabel(lead.score)}</span>
          </div>
          <div className="lead-reference-score__reasons">
            {lead.triggeredScoringRules.length === 0 ? (
              <p>Brak zapisanych powodów dopasowania.</p>
            ) : (
              <ul>
                {lead.triggeredScoringRules.slice(0, 3).map((rule) => (
                  <li key={rule.id}>
                    <span className="lead-reference-check" aria-hidden="true">
                      <PanelIcon name="check" />
                    </span>
                    {rule.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <nav aria-label="Sekcje szczegółów leada" className="lead-reference-tabs">
          <a className="is-summary" href="#summary-panel">
            Podsumowanie
          </a>
          <a className="is-answers" href="#answers-panel">
            Odpowiedzi
          </a>
          <a className="is-files" href="#files-panel">
            Pliki
          </a>
          <a className="is-history" href="#history-panel">
            Historia
          </a>
        </nav>

        <section className="lead-reference-panel lead-reference-summary" id="summary-panel">
          <div className="lead-reference-summary__main">
            <dl className="lead-reference-summary-list">
              <SummaryRow icon="leads" label="Usługa" value={lead.flowTitle} />
              <SummaryRow icon="templates" label="Zakres" value={buildScopeSummary(lead.answers)} />
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
              <SummaryRow icon="location" label="Lokalizacja" value={location ?? "Nie podano"} />
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
          </div>

          <LeadOperationsPanel
            canAssign={hasCapability(context, "lead:assign")}
            canManageAllTasks={context.role === "owner" || context.role === "admin"}
            contactEmail={lead.contactEmail}
            currentUserId={context.userId}
            leadId={lead.id}
            notes={lead.notes}
            operation={lead.operation}
            organizationId={organizationId}
            status={lead.status}
          />
        </section>

        <section className="lead-reference-panel lead-reference-answers" id="answers-panel">
          <div className="lead-reference-panel-heading">
            <div>
              <h2>Odpowiedzi klienta</h2>
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

        <section className="lead-reference-panel lead-reference-files" id="files-panel">
          <div className="lead-reference-panel-heading">
            <div>
              <h2>Pliki klienta</h2>
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

        <section className="lead-reference-panel lead-reference-history" id="history-panel">
          <div>
            <h2>Historia</h2>
            <ol>
              {lead.history.map((entry, index) => (
                <li key={`${entry.changedAt}-${index}`}>
                  <span className="lead-reference-check" aria-hidden="true">
                    <PanelIcon name="edit" />
                  </span>
                  <span>
                    <strong>
                      {entry.fromStatus
                        ? `${leadStatusLabels[entry.fromStatus]} → `
                        : "Utworzono → "}
                      {leadStatusLabels[entry.toStatus]}
                    </strong>
                    <small>{formatDateTime(entry.changedAt)}</small>
                  </span>
                </li>
              ))}
              {lead.notes.map((note) => (
                <li key={`note-${note.id}`}>
                  <span className="lead-reference-check" aria-hidden="true">
                    <PanelIcon name="edit" />
                  </span>
                  <span>
                    <strong>Notatka · {note.createdByName}</strong>
                    <small>{formatDateTime(note.createdAt)}</small>
                    <p>{note.body}</p>
                  </span>
                </li>
              ))}
              {lead.operation.activities.map((activity) => (
                <li key={`operation-${activity.id}`}>
                  <span className="lead-reference-check" aria-hidden="true">
                    <PanelIcon name={activity.kind.startsWith("task_") ? "check" : "settings"} />
                  </span>
                  <span>
                    <strong>{operationActivityLabel(activity)}</strong>
                    <small>
                      {activity.actorName} · {formatDateTime(activity.occurredAt)}
                    </small>
                  </span>
                </li>
              ))}
              {lead.notifications.map((notification) => (
                <li key={notification.kind}>
                  <span className="lead-reference-check" aria-hidden="true">
                    <PanelIcon name="email" />
                  </span>
                  <span>
                    <strong>
                      {notification.kind === "lead_company_alert"
                        ? "Alert dla firmy"
                        : "Potwierdzenie dla klienta"}
                    </strong>
                    <small>
                      {notificationStatusLabels[notification.status]}
                      {notification.sentAt ? ` · ${formatDateTime(notification.sentAt)}` : ""}
                    </small>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <details>
            <summary>Prywatność i zgody</summary>
            <ul>
              {lead.consents.map((consent) => (
                <li key={`${consent.type}-${consent.contentVersion}`}>
                  {consent.type === "privacy_notice"
                    ? "Informacja o prywatności"
                    : "Marketing e-mail"}
                  <small>
                    wersja {consent.contentVersion} · {formatDateTime(consent.recordedAt)}
                  </small>
                </li>
              ))}
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
