import { flowTemplates } from "@wyceno/validation";
import { LinkButton } from "@wyceno/ui";
import type { Metadata } from "next";

import { requireTenantContext } from "../../../../lib/auth/tenant-context";
import { getOnboardingState } from "../../../../lib/onboarding/service";
import { PanelIcon } from "../../panel-icon";
import { PanelPageHeader } from "../../panel-page-header";
import { TemplateCreateForm } from "../szablony/template-create-form";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Uruchomienie pierwszego procesu",
};

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  params,
}: Readonly<{
  params: Promise<{ organizationId: string }>;
}>) {
  const { organizationId } = await params;
  const context = await requireTenantContext(organizationId);
  const state = await getOnboardingState(context);
  const firstTemplates = flowTemplates.slice(0, 3);

  return (
    <main className="panel-workspace onboarding-panel">
      <PanelPageHeader
        eyebrow="Konfiguracja konta"
        title={state.activeFlow ? "Dokończ uruchomienie" : "Uruchom pierwszy proces"}
      />
      <div className="panel-page onboarding-layout">
        <aside className="onboarding-progress" aria-label="Postęp uruchomienia">
          <p className="panel-topbar__eyebrow">Pierwszy proces</p>
          <h2>{state.organizationName}</h2>
          <p>Każdy krok wynika z rzeczywistego stanu organizacji i procesu.</p>
          <ol>
            <OnboardingProgressItem complete label="Utworzono organizację" number={1} />
            <OnboardingProgressItem
              complete={state.activeFlow !== null}
              current={state.activeFlow === null}
              label="Wybrano proces"
              number={2}
            />
            <OnboardingProgressItem
              complete={state.activeFlow?.status === "published"}
              current={state.activeFlow !== null && state.activeFlow.status === "draft"}
              label="Przetestuj i opublikuj"
              number={3}
            />
            <OnboardingProgressItem
              complete={state.activeFlow?.publicId !== null && state.activeFlow !== null}
              current={state.activeFlow?.status === "published" && !state.activeFlow.publicId}
              label="Zainstaluj widget"
              number={4}
            />
          </ol>
          <small>Dane należą wyłącznie do organizacji „{state.organizationName}”.</small>
        </aside>

        <div className="onboarding-content">
          {state.activeFlow ? (
            <section className="panel-card onboarding-next-step" aria-labelledby="next-step-title">
              <div>
                <p className="panel-topbar__eyebrow">Następny krok</p>
                <h2 id="next-step-title">{nextStepTitle(state.activeFlow)}</h2>
                <p>{nextStepDescription(state.activeFlow)}</p>
              </div>
              <div className="onboarding-process-summary">
                <span className="integration-row__icon">
                  <PanelIcon name="processes" />
                </span>
                <span>
                  <strong>{state.activeFlow.name}</strong>
                  <small>
                    {state.flowCount} {state.flowCount === 1 ? "proces" : "procesów"} w organizacji
                  </small>
                </span>
                <span
                  className={`panel-status panel-status--${
                    state.activeFlow.status === "published" ? "qualified" : "waiting"
                  }`}
                >
                  {state.activeFlow.status === "published" ? "Opublikowany" : "Szkic"}
                </span>
              </div>
              <div className="onboarding-next-step__actions">
                <LinkButton href={nextStepHref(organizationId, state.activeFlow)}>
                  {nextStepAction(state.activeFlow)}
                </LinkButton>
                <LinkButton href={`/panel/${organizationId}/procesy`} variant="secondary">
                  Wszystkie procesy
                </LinkButton>
              </div>
            </section>
          ) : (
            <section className="onboarding-start" aria-labelledby="starting-point-title">
              <p className="panel-topbar__eyebrow">Pierwszy proces</p>
              <h2 id="starting-point-title">Wybierz punkt startowy</h2>
              <p>
                Szablon skopiujemy jako niezależny draft. Wszystkie pytania i reguły możesz później
                zmienić.
              </p>
              <ul>
                {firstTemplates.map((template) => (
                  <li className="panel-card" key={template.slug}>
                    <span
                      aria-hidden="true"
                      className={`onboarding-template-mark onboarding-template-mark--${template.slug}`}
                    />
                    <span>
                      <strong>{template.industry}</strong>
                      <small>
                        {template.snapshot.steps.length} pytań · {template.snapshot.rules.length}{" "}
                        reguł
                      </small>
                    </span>
                    <TemplateCreateForm
                      organizationId={organizationId}
                      templateName={template.name}
                      templateSlug={template.slug}
                    />
                  </li>
                ))}
              </ul>
              <LinkButton
                href={`/panel/${organizationId}/szablony`}
                size="small"
                variant="secondary"
              >
                Zobacz wszystkie szablony
              </LinkButton>
            </section>
          )}

          <section
            className="panel-card onboarding-install-state"
            aria-labelledby="install-state-title"
          >
            <div>
              <h2 id="install-state-title">Kanały uruchomienia</h2>
              <p>Hosted link działa po publikacji. WordPress pozostaje opcjonalnym konektorem.</p>
            </div>
            <dl>
              <div>
                <dt>Hosted link</dt>
                <dd>{state.activeFlow?.publicId ? "Gotowy" : "Po publikacji"}</dd>
              </div>
              <div>
                <dt>WordPress</dt>
                <dd>{state.wordpressConnected ? "Połączony" : "Niepołączony"}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </main>
  );
}

function OnboardingProgressItem({
  complete,
  current = false,
  label,
  number,
}: Readonly<{
  complete: boolean;
  current?: boolean;
  label: string;
  number: number;
}>) {
  return (
    <li
      aria-current={current ? "step" : undefined}
      className={complete ? "is-complete" : undefined}
    >
      <span aria-hidden="true">{complete ? "✓" : number}</span>
      {label}
    </li>
  );
}

function nextStepTitle(
  flow: NonNullable<Awaited<ReturnType<typeof getOnboardingState>>["activeFlow"]>,
): string {
  if (flow.status === "draft") return "Przetestuj i opublikuj proces";
  return "Zainstaluj opublikowany proces";
}

function nextStepDescription(
  flow: NonNullable<Awaited<ReturnType<typeof getOnboardingState>>["activeFlow"]>,
): string {
  if (flow.status === "draft") {
    return "Sprawdź pytania i wynik w builderze, a potem opublikuj pierwszą wersję.";
  }
  return "Wybierz inline, popup, fullscreen albo gotowy hosted link i uruchom test.";
}

function nextStepHref(
  organizationId: string,
  flow: NonNullable<Awaited<ReturnType<typeof getOnboardingState>>["activeFlow"]>,
): string {
  return flow.status === "draft"
    ? `/panel/${organizationId}/procesy/${flow.id}`
    : `/panel/${organizationId}/procesy/${flow.id}/instalacja`;
}

function nextStepAction(
  flow: NonNullable<Awaited<ReturnType<typeof getOnboardingState>>["activeFlow"]>,
): string {
  return flow.status === "draft" ? "Otwórz builder" : "Przejdź do instalacji";
}
