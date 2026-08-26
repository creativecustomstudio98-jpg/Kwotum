export type TemplateLibraryItem = Readonly<{
  description: string;
  industry: string;
  name: string;
  priority: boolean;
  questionCount: number;
  requiredQuestionCount: number;
  ruleCount: number;
  sectionTitles: readonly string[];
  slug: string;
  stepTitles: readonly string[];
}>;

export type ComplexityFilter = "all" | "advanced" | "standard";
export type SortOrder = "default" | "name" | "questions";
export type TemplateLibraryFilters = Readonly<{
  category: string;
  complexity: ComplexityFilter;
  page: number;
  query: string;
  sortOrder: SortOrder;
}>;

export function filterTemplateLibrary(
  templates: readonly TemplateLibraryItem[],
  filters: Pick<TemplateLibraryFilters, "category" | "complexity" | "query" | "sortOrder">,
): TemplateLibraryItem[] {
  const normalizedQuery = filters.query.trim().toLocaleLowerCase("pl-PL");
  const originalOrder = new Map(templates.map((template, index) => [template.slug, index]));
  const filtered = templates.filter((template) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [template.industry, template.name, template.description].some((value) =>
        value.toLocaleLowerCase("pl-PL").includes(normalizedQuery),
      );
    const matchesCategory = filters.category === "all" || template.industry === filters.category;
    const templateComplexity = template.ruleCount > 0 ? "advanced" : "standard";
    const matchesComplexity =
      filters.complexity === "all" || templateComplexity === filters.complexity;
    return matchesQuery && matchesCategory && matchesComplexity;
  });

  return [...filtered].sort((left, right) => {
    if (filters.sortOrder === "name") return left.industry.localeCompare(right.industry, "pl");
    if (filters.sortOrder === "questions") return right.questionCount - left.questionCount;
    if (left.priority !== right.priority) return left.priority ? -1 : 1;
    return (originalOrder.get(left.slug) ?? 0) - (originalOrder.get(right.slug) ?? 0);
  });
}

export function templateLibraryHref(
  organizationId: string,
  filters: TemplateLibraryFilters,
): string {
  const parameters = new URLSearchParams();
  const query = filters.query.trim().slice(0, 80);
  if (query) parameters.set("q", query);
  if (filters.category !== "all") parameters.set("category", filters.category);
  if (filters.complexity !== "all") parameters.set("complexity", filters.complexity);
  if (filters.sortOrder !== "default") parameters.set("sort", filters.sortOrder);
  if (filters.page > 1) parameters.set("page", String(filters.page));
  const search = parameters.toString();
  return `/panel/${organizationId}/szablony${search ? `?${search}` : ""}`;
}
