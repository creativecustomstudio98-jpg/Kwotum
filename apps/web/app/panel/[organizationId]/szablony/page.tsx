import { flowTemplates } from "@wyceno/validation";
import { LinkButton } from "@wyceno/ui";
import type { Metadata } from "next";
import Link from "next/link";

import { requireTenantContext } from "../../../../lib/auth/tenant-context";
import { PanelIcon } from "../../panel-icon";
import { TemplateLibrary, type TemplateLibraryItem } from "./template-library";

export const metadata: Metadata = { title: "Szablony branżowe" };
export const dynamic = "force-dynamic";

export default async function TemplatesPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  await requireTenantContext(organizationId);
  const templates: readonly TemplateLibraryItem[] = flowTemplates.map((template) => ({
    description: template.description,
    industry: template.industry,
    name: template.name,
    priority: template.priority,
    questionCount: template.snapshot.steps.length,
    requiredQuestionCount: template.snapshot.steps.filter((step) => step.required).length,
    ruleCount: template.snapshot.rules.length,
    sectionTitles: template.snapshot.sections.map((section) => section.title),
    slug: template.slug,
    stepTitles: template.snapshot.steps.map((step) => step.title),
  }));

  return (
    <main className="panel-workspace templates-panel">
      <div className="panel-page">
        <section
          aria-labelledby="template-library-title"
          className="panel-card template-library-surface"
        >
          <header className="template-library-heading">
            <nav aria-label="Ścieżka nawigacji">
              <Link href={`/panel/${organizationId}/procesy`}>Procesy</Link>
              <PanelIcon name="chevron-right" />
              <span aria-current="page">Szablony branżowe</span>
            </nav>
            <div className="template-library-heading__row">
              <div>
                <h1 id="template-library-title">Szablony branżowe</h1>
                <p>Wybierz gotowy punkt startowy dla nowego procesu.</p>
              </div>
              <div className="template-library-heading__actions">
                <LinkButton
                  className="template-library-heading__secondary"
                  href={`/panel/${organizationId}/procesy`}
                  size="small"
                >
                  <PanelIcon name="arrow-left" />
                  Moje procesy
                </LinkButton>
                <LinkButton
                  className="template-library-heading__primary"
                  href="#template-library-grid"
                  size="small"
                  variant="primary"
                >
                  <PanelIcon name="plus" />
                  Nowy proces
                </LinkButton>
              </div>
            </div>
          </header>
          <TemplateLibrary organizationId={organizationId} templates={templates} />
        </section>
      </div>
    </main>
  );
}
