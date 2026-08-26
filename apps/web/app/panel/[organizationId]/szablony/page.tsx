import { assertCapability } from "@wyceno/database";
import { LinkButton } from "@wyceno/ui";
import { flowTemplates } from "@wyceno/validation";
import type { Metadata } from "next";

import { requireTenantContext } from "../../../../lib/auth/tenant-context";
import { parseListPage } from "../../pagination-model";
import { PanelIcon } from "../../panel-icon";
import { PanelPageHeader } from "../../panel-page-header";
import {
  TemplateLibrary,
  type TemplateLibraryFilters,
  type TemplateLibraryItem,
} from "./template-library";

export const metadata: Metadata = { title: "Szablony branżowe" };
export const dynamic = "force-dynamic";

type TemplateSearchParams = {
  category?: string | string[];
  complexity?: string | string[];
  page?: string | string[];
  q?: string | string[];
  sort?: string | string[];
};

export default async function TemplatesPage({
  params,
  searchParams,
}: {
  params: Promise<{ organizationId: string }>;
  searchParams: Promise<TemplateSearchParams>;
}) {
  const { organizationId } = await params;
  const query = await searchParams;
  const context = await requireTenantContext(organizationId);
  assertCapability(context, "flow:read");
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
  const categories = new Set(templates.map((template) => template.industry));
  const categoryValue = searchParamValue(query.category);
  const complexityValue = searchParamValue(query.complexity);
  const sortValue = searchParamValue(query.sort);
  const initialFilters: TemplateLibraryFilters = {
    category: categoryValue && categories.has(categoryValue) ? categoryValue : "all",
    complexity:
      complexityValue === "advanced" || complexityValue === "standard" ? complexityValue : "all",
    page: parseListPage(query.page),
    query: (searchParamValue(query.q) ?? "").trim().slice(0, 80),
    sortOrder: sortValue === "name" || sortValue === "questions" ? sortValue : "default",
  };

  return (
    <main className="panel-workspace templates-panel">
      <PanelPageHeader
        actions={
          <LinkButton
            className="template-back-action"
            href={`/panel/${organizationId}/procesy`}
            size="small"
          >
            <PanelIcon name="arrow-left" />
            Moje procesy
          </LinkButton>
        }
        breadcrumbs={[
          { href: `/panel/${organizationId}/procesy`, label: "Procesy" },
          { label: "Szablony" },
        ]}
        description="Wybierz gotowy punkt startowy dla nowego procesu."
        title="Szablony branżowe"
      />

      <section aria-label="Biblioteka szablonów" className="template-library-surface">
        <TemplateLibrary
          initialFilters={initialFilters}
          key={`${initialFilters.query}:${initialFilters.category}:${initialFilters.complexity}:${initialFilters.sortOrder}:${initialFilters.page}`}
          organizationId={organizationId}
          templates={templates}
        />
      </section>
    </main>
  );
}

function searchParamValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
