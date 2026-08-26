"use client";

import { Button, LinkButton } from "@wyceno/ui";
import type { WidgetManifestContract } from "@wyceno/validation";
import { type KeyboardEvent, useMemo, useState } from "react";

import { AllowedOriginsForm } from "./allowed-origins-form";
import { FlowPreview } from "./flow-preview";
import { InvitationForm } from "./invitation-form";

type InstallationMode = "fullscreen" | "hosted" | "inline" | "popup";
const installationModes = [
  ["inline", "Inline", "Proces w treści strony"],
  ["popup", "Popup", "Otwierany z przycisku"],
  ["fullscreen", "Fullscreen", "Pełny ekran procesu"],
  ["hosted", "Hosted link", "Gotowy adres Kwotum"],
] as const satisfies ReadonlyArray<readonly [InstallationMode, string, string]>;

export function InstallationPanel({
  allowedOrigins,
  appOrigin,
  currentVersion,
  flowId,
  flowName,
  invitations,
  lastWidgetOpenedAt,
  organizationId,
  manifest,
  publicId,
  publishedAt,
  wordpressConnection,
}: Readonly<{
  allowedOrigins: ReadonlyArray<string>;
  appOrigin: string;
  currentVersion: number;
  flowId: string;
  flowName: string;
  invitations: ReadonlyArray<
    Readonly<{
      attemptCount: number;
      createdAt: string;
      createdByName: string;
      id: string;
      lastErrorCode: string | null;
      recipientEmail: string;
      recipientName: string | null;
      sentAt: string | null;
      status: "failed" | "pending" | "processing" | "retry" | "sent";
      versionNumber: number;
    }>
  >;
  lastWidgetOpenedAt: string | null;
  organizationId: string;
  manifest: WidgetManifestContract | null;
  publicId: string;
  publishedAt: string;
  wordpressConnection: Readonly<{
    lastSeenAt: string;
    siteOrigin: string;
  }> | null;
}>) {
  const [mode, setMode] = useState<InstallationMode>("inline");
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const hostedUrl = `${appOrigin}/f/${publicId}`;
  const code = useMemo(
    () => installationCode(appOrigin, publicId, mode),
    [appOrigin, mode, publicId],
  );
  const dateTime = new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  });

  async function copy(value: string, target: "code" | "link") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(target);
    } catch {
      setCopied(null);
    }
  }

  const selectInstallationMode = (nextMode: InstallationMode) => {
    setMode(nextMode);
    setCopied(null);
  };

  const handleInstallationModeKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp", "End", "Home"].includes(event.key)) {
      return;
    }

    const currentMode = event.currentTarget.dataset.installationMode as
      InstallationMode | undefined;
    const currentIndex = installationModes.findIndex(([value]) => value === currentMode);
    if (currentIndex < 0) return;

    let nextIndex = currentIndex;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % installationModes.length;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + installationModes.length) % installationModes.length;
    }
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = installationModes.length - 1;

    const nextMode = installationModes[nextIndex]?.[0];
    if (!nextMode) return;
    event.preventDefault();
    selectInstallationMode(nextMode);
    event.currentTarget.parentElement
      ?.querySelector<HTMLButtonElement>(`[data-installation-mode="${nextMode}"]`)
      ?.focus();
  };

  return (
    <div className="installation-workspace installation-workspace--m7">
      <div className="sharing-workspace">
        {manifest ? (
          <FlowPreview manifest={manifest} />
        ) : (
          <section className="flow-live-preview flow-live-preview--unavailable">
            <h2>Podgląd jest chwilowo niedostępny</h2>
            <p>Odśwież stronę. Publiczny proces pozostaje aktywny.</p>
          </section>
        )}
        <aside className="sharing-panel" aria-labelledby="sharing-title">
          <header>
            <p className="panel-topbar__eyebrow">Wersja {currentVersion}</p>
            <h2 id="sharing-title">Wyślij klientowi</h2>
            <p>Klient otrzyma bezpieczny link do aktualnie opublikowanej wersji.</p>
          </header>
          <InvitationForm flowId={flowId} organizationId={organizationId} />
          <div className="sharing-panel__link">
            <span>Hosted link</span>
            <code>{hostedUrl}</code>
            <Button
              onClick={() => copy(hostedUrl, "link")}
              size="small"
              type="button"
              variant="secondary"
            >
              {copied === "link" ? "Skopiowano" : "Kopiuj link"}
            </Button>
          </div>
        </aside>
      </div>

      <section className="invitation-history" aria-labelledby="invitation-history-title">
        <header>
          <div>
            <p className="panel-topbar__eyebrow">Dostawa</p>
            <h2 id="invitation-history-title">Historia wysyłki</h2>
          </div>
          <span>
            {invitations.length} {invitations.length === 1 ? "wiadomość" : "wiadomości"}
          </span>
        </header>
        {invitations.length ? (
          <ul>
            {invitations.map((invitation) => (
              <li key={invitation.id}>
                <span className="invitation-history__recipient">
                  <strong>{invitation.recipientName ?? invitation.recipientEmail}</strong>
                  {invitation.recipientName ? <small>{invitation.recipientEmail}</small> : null}
                </span>
                <span>
                  <strong>Wersja {invitation.versionNumber || "—"}</strong>
                  <small>{invitation.createdByName}</small>
                </span>
                <time dateTime={invitation.sentAt ?? invitation.createdAt}>
                  {dateTime.format(new Date(invitation.sentAt ?? invitation.createdAt))}
                </time>
                <span className={`invitation-status is-${invitation.status}`}>
                  {invitationStatusLabel(invitation.status)}
                </span>
                <small className="invitation-history__attempts">
                  {invitation.attemptCount
                    ? `${invitation.attemptCount} ${invitation.attemptCount === 1 ? "próba" : "próby"}`
                    : "Oczekuje na worker"}
                </small>
              </li>
            ))}
          </ul>
        ) : (
          <p className="invitation-history__empty">
            Nie wysłano jeszcze formularza. Pierwsza wiadomość pojawi się tutaj wraz ze statusem
            dostawy.
          </p>
        )}
      </section>

      <div className="installation-layout">
        <div className="installation-main">
          <section className="panel-card publication-banner" aria-labelledby="publication-title">
            <span className="publication-banner__dot" aria-hidden="true" />
            <div>
              <p>Proces opublikowany</p>
              <h2 id="publication-title">{flowName}</h2>
              <small>
                Publiczny od{" "}
                {new Intl.DateTimeFormat("pl-PL", {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(new Date(publishedAt))}
              </small>
            </div>
            <a href={hostedUrl} rel="noreferrer" target="_blank">
              Otwórz wersję klienta
            </a>
          </section>

          <section className="panel-card installation-methods" aria-labelledby="method-title">
            <div className="panel-card__header">
              <div>
                <h2 id="method-title">Sposób osadzenia</h2>
                <p>Wybierz sposób uruchamiania procesu na stronie.</p>
              </div>
            </div>
            <div
              aria-label="Sposób osadzenia"
              className="installation-mode-grid panel-segmented-track panel-segmented-track--descriptive"
              role="radiogroup"
            >
              {installationModes.map(([value, label, description]) => (
                <button
                  aria-checked={mode === value}
                  data-installation-mode={value}
                  key={value}
                  onClick={() => selectInstallationMode(value)}
                  onKeyDown={handleInstallationModeKeyDown}
                  role="radio"
                  tabIndex={mode === value ? 0 : -1}
                  type="button"
                >
                  <strong>{label}</strong>
                  <small>{description}</small>
                </button>
              ))}
            </div>
          </section>

          <AllowedOriginsForm
            flowId={flowId}
            organizationId={organizationId}
            origins={allowedOrigins}
          />

          <section
            className="panel-card installation-code"
            aria-labelledby="installation-code-title"
          >
            <div className="panel-card__header">
              <div>
                <h2 id="installation-code-title">
                  {mode === "hosted" ? "Link do procesu" : "Kod instalacyjny"}
                </h2>
                <p>
                  {mode === "hosted"
                    ? "Udostępnij bez osadzania skryptu na własnej stronie."
                    : "Wklej przed zamknięciem elementu body na stronie."}
                </p>
              </div>
              <Button
                onClick={() =>
                  copy(mode === "hosted" ? hostedUrl : code, mode === "hosted" ? "link" : "code")
                }
                size="small"
                type="button"
                variant="secondary"
              >
                {copied === (mode === "hosted" ? "link" : "code") ? "Skopiowano" : "Kopiuj"}
              </Button>
            </div>
            <pre>
              <code>{mode === "hosted" ? hostedUrl : code}</code>
            </pre>
            <p className="installation-code__note">
              Kod zawiera wyłącznie publiczny identyfikator. Sekrety i logika wyceny pozostają po
              stronie Kwotum.
            </p>
          </section>
        </div>

        <aside className="installation-side" aria-label="Status instalacji">
          <section className="panel-card installation-wordpress">
            <div className="installation-side__heading">
              <span aria-hidden="true">W</span>
              <div>
                <h2>WordPress</h2>
                <p>Wtyczka konektorowa</p>
              </div>
              <span
                className={`panel-status panel-status--${
                  wordpressConnection ? "qualified" : "neutral"
                }`}
              >
                {wordpressConnection ? "Połączono" : "Niepołączono"}
              </span>
            </div>
            {wordpressConnection ? (
              <dl>
                <div>
                  <dt>Witryna</dt>
                  <dd>{wordpressConnection.siteOrigin}</dd>
                </div>
                <div>
                  <dt>Ostatni heartbeat</dt>
                  <dd>
                    {new Intl.DateTimeFormat("pl-PL", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(new Date(wordpressConnection.lastSeenAt))}
                  </dd>
                </div>
              </dl>
            ) : (
              <p>Połącz witrynę, aby użyć shortcode, bloku i triggera popup.</p>
            )}
            <LinkButton
              href={`/panel/${organizationId}/integracje/wordpress`}
              size="small"
              variant="secondary"
            >
              {wordpressConnection ? "Otwórz integrację" : "Połącz WordPress"}
            </LinkButton>
          </section>

          <section className="panel-card installation-diagnostics">
            <h2>Diagnostyka</h2>
            <ul>
              <li>
                <span>Proces opublikowany</span>
                <strong>OK</strong>
              </li>
              <li>
                <span>Hosted link</span>
                <strong>OK</strong>
              </li>
              <li>
                <span>Ostatnie otwarcie</span>
                <strong>
                  {lastWidgetOpenedAt
                    ? new Intl.DateTimeFormat("pl-PL", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(lastWidgetOpenedAt))
                    : "Brak"}
                </strong>
              </li>
              <li>
                <span>WordPress</span>
                <strong>{wordpressConnection ? "OK" : "Opcjonalny"}</strong>
              </li>
            </ul>
            <a href={hostedUrl} rel="noreferrer" target="_blank">
              Sprawdź hosted link
            </a>
          </section>
        </aside>
      </div>
    </div>
  );
}

function invitationStatusLabel(status: "failed" | "pending" | "processing" | "retry" | "sent") {
  if (status === "sent") return "Wysłano";
  if (status === "failed") return "Błąd";
  if (status === "retry") return "Ponowienie";
  if (status === "processing") return "Wysyłanie";
  return "W kolejce";
}

function installationCode(appOrigin: string, publicId: string, mode: InstallationMode): string {
  if (mode === "hosted") return `${appOrigin}/f/${publicId}`;
  const buttonLabel = mode === "popup" ? '\n  button-label="Rozpocznij wycenę"' : "";
  return `<script type="module" src="${appOrigin}/widget/v1/loader.js"></script>
<wyceno-widget
  public-id="${publicId}"
  mode="${mode}"${buttonLabel}
></wyceno-widget>`;
}
