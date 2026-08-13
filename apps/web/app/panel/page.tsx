import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "../../lib/supabase/server";
import { signOut } from "../logowanie/actions";
import {
  OrganizationChartIcon,
  OrganizationChevronIcon,
  OrganizationHelpIcon,
  OrganizationLayersIcon,
  OrganizationLogoutIcon,
  OrganizationSearchIcon,
  OrganizationShieldIcon,
} from "./organization-picker-icons";
import {
  formatLastActivity,
  latestIsoDate,
  normalizeOrganizationSearch,
  organizationMatchesSearch,
  organizationRolePresentation,
  organizationStatusPresentation,
} from "./organization-picker-model";

export const metadata: Metadata = {
  title: "Organizacje",
};

export const dynamic = "force-dynamic";

type PanelPageProps = Readonly<{
  searchParams: Promise<{ q?: string }>;
}>;

const organizationBenefits = [
  {
    description: "Każda organizacja ma własne dane, członków i konfigurację.",
    icon: OrganizationLayersIcon,
    title: "Oddzielne obszary pracy",
  },
  {
    description: "Zakres panelu wynika z roli przypisanej w danej organizacji.",
    icon: OrganizationShieldIcon,
    title: "Bezpieczny dostęp",
  },
  {
    description: "Procesy i leady otwierasz zawsze we właściwym kontekście.",
    icon: OrganizationChartIcon,
    title: "Pełny kontekst operacyjny",
  },
] as const;

export default async function PanelPage({ searchParams }: PanelPageProps) {
  const [{ q }, supabase] = await Promise.all([searchParams, createClient()]);
  const searchQuery = normalizeOrganizationSearch(q);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/logowanie");
  }

  const { data: memberships, error } = await supabase
    .from("organization_members")
    .select("organization_id, role, status")
    .eq("user_id", user.id)
    .eq("status", "active");

  if (error) {
    throw new Error("Nie udało się pobrać organizacji.");
  }

  const organizationIds = memberships.map((membership) => membership.organization_id);
  const { data: organizations, error: organizationsError } =
    organizationIds.length > 0
      ? await supabase
          .from("organizations")
          .select("id, name, slug")
          .in("id", organizationIds)
          .is("deleted_at", null)
          .order("name", { ascending: true })
      : { data: [], error: null };

  if (organizationsError) {
    throw new Error("Nie udało się pobrać danych organizacji.");
  }

  const membershipByOrganizationId = new Map(
    memberships.map((membership) => [membership.organization_id, membership]),
  );

  if (organizations.length === 1) {
    const onlyOrganization = organizations[0];
    const membership = onlyOrganization
      ? membershipByOrganizationId.get(onlyOrganization.id)
      : undefined;
    if (
      onlyOrganization &&
      membership &&
      (membership.role === "owner" || membership.role === "admin")
    ) {
      const { data: firstFlow, error: firstFlowError } = await supabase
        .from("flows")
        .select("id")
        .eq("organization_id", onlyOrganization.id)
        .limit(1)
        .maybeSingle();
      if (firstFlowError) {
        throw new Error("Nie udało się sprawdzić postępu organizacji.");
      }
      if (!firstFlow) redirect(`/panel/${onlyOrganization.id}/start`);
    }
  }

  const visibleOrganizations = organizations.filter((organization) =>
    organizationMatchesSearch(organization, searchQuery),
  );
  const organizationOverviews = await Promise.all(
    visibleOrganizations.map(async (organization) => {
      const membership = membershipByOrganizationId.get(organization.id);
      if (!membership) {
        throw new Error("Nie udało się potwierdzić dostępu do organizacji.");
      }

      const canReadFlows = membership.role === "owner" || membership.role === "admin";
      const [latestLead, latestFlow] = await Promise.all([
        supabase
          .from("leads")
          .select("submitted_at")
          .eq("organization_id", organization.id)
          .order("submitted_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        canReadFlows
          ? supabase
              .from("flows")
              .select("updated_at")
              .eq("organization_id", organization.id)
              .order("updated_at", { ascending: false })
              .limit(1)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (latestLead.error || latestFlow.error) {
        throw new Error("Nie udało się pobrać ostatniej aktywności organizacji.");
      }

      return {
        id: organization.id,
        lastActivityAt: latestIsoDate([latestLead.data?.submitted_at, latestFlow.data?.updated_at]),
        membership,
      };
    }),
  );
  const overviewByOrganizationId = new Map(
    organizationOverviews.map((overview) => [overview.id, overview]),
  );

  return (
    <main className="organization-picker wy-panel-theme">
      <header className="organization-picker__header">
        <Link className="organization-picker__brand" href="/" aria-label="Kwotum — strona główna">
          <Image alt="" height={34} priority src="/kwotum-logo-v3.png" width={34} />
          <strong>Kwotum</strong>
        </Link>
        <form action={signOut} className="organization-picker__logout">
          <button type="submit">
            <OrganizationLogoutIcon />
            <span>Wyloguj się</span>
          </button>
        </form>
      </header>

      <div className="organization-picker__shell">
        <aside className="organization-picker__intro" aria-labelledby="organization-picker-title">
          <div className="organization-picker__intro-copy">
            <h1 id="organization-picker-title">Wybierz organizację</h1>
            <p>
              Masz dostęp do poniższych organizacji.
              <br />
              Wybierz obszar pracy, aby przejść do panelu.
            </p>
          </div>

          <ul className="organization-picker__benefits">
            {organizationBenefits.map(({ description, icon: Icon, title }) => (
              <li key={title}>
                <span className="organization-picker__benefit-icon">
                  <Icon />
                </span>
                <span>
                  <strong>{title}</strong>
                  <small>{description}</small>
                </span>
              </li>
            ))}
          </ul>

          <div className="organization-picker__help">
            <span className="organization-picker__help-icon">
              <OrganizationHelpIcon />
            </span>
            <span>
              <strong>Potrzebujesz pomocy?</strong>
              <small>Poproś administratora o dostęp do organizacji.</small>
            </span>
          </div>
        </aside>

        <section
          className="organization-picker__workspace"
          aria-labelledby="organization-list-title"
        >
          <div className="organization-picker__toolbar">
            <h2 id="organization-list-title">Twoje organizacje</h2>
            <form
              action="/panel"
              className="organization-picker__search"
              method="get"
              role="search"
            >
              <label className="wy-sr-only" htmlFor="organization-search">
                Szukaj organizacji
              </label>
              <OrganizationSearchIcon />
              <input
                defaultValue={searchQuery}
                id="organization-search"
                maxLength={120}
                name="q"
                placeholder="Szukaj organizacji..."
                type="search"
              />
              <button className="wy-sr-only" type="submit">
                Wyszukaj
              </button>
            </form>
          </div>

          <p aria-live="polite" className="wy-sr-only">
            {searchQuery
              ? `Znaleziono organizacji: ${visibleOrganizations.length}.`
              : `Dostępnych organizacji: ${organizations.length}.`}
          </p>

          {organizations.length === 0 ? (
            <div className="organization-picker__empty">
              <strong>Brak dostępnych organizacji</strong>
              <p>Administrator musi dodać Cię do aktywnej organizacji.</p>
            </div>
          ) : visibleOrganizations.length === 0 ? (
            <div className="organization-picker__empty">
              <strong>Brak wyników</strong>
              <p>Nie znaleźliśmy organizacji pasującej do „{searchQuery}”.</p>
              <Link href="/panel">Wyczyść wyszukiwanie</Link>
            </div>
          ) : (
            <div className="organization-list">
              <div aria-hidden="true" className="organization-list__header">
                <span>Organizacja</span>
                <span>Rola</span>
                <span>Status</span>
                <span>Ostatnia aktywność</span>
                <span />
              </div>
              <ul aria-label="Dostępne organizacje" className="organization-list__rows">
                {visibleOrganizations.map((organization) => {
                  const overview = overviewByOrganizationId.get(organization.id);
                  if (!overview) return null;
                  const role = organizationRolePresentation(overview.membership.role);
                  const status = organizationStatusPresentation(overview.membership.status);

                  return (
                    <li key={organization.id}>
                      <Link
                        aria-label={`Otwórz organizację ${organization.name}`}
                        className="organization-list__row"
                        href={`/panel/${organization.id}`}
                      >
                        <span className="organization-list__organization">
                          <span aria-hidden="true" className="organization-list__avatar">
                            {initials(organization.name)}
                          </span>
                          <span className="organization-list__identity-copy">
                            <strong>{organization.name}</strong>
                            <small>/{organization.slug}</small>
                          </span>
                        </span>
                        <span className="organization-list__cell organization-list__role">
                          <small className="organization-list__mobile-label">Rola</small>
                          <strong>{role.label}</strong>
                          <small>{role.description}</small>
                        </span>
                        <span className="organization-list__cell organization-list__status-cell">
                          <small className="organization-list__mobile-label">Status</small>
                          <span className="organization-list__status" data-tone={status.tone}>
                            <span aria-hidden="true" />
                            {status.label}
                          </span>
                        </span>
                        <span className="organization-list__cell organization-list__activity">
                          <small className="organization-list__mobile-label">
                            Ostatnia aktywność
                          </small>
                          <time dateTime={overview.lastActivityAt ?? undefined}>
                            {formatLastActivity(overview.lastActivityAt)}
                          </time>
                        </span>
                        <span className="organization-list__chevron">
                          <OrganizationChevronIcon />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function initials(value: string): string {
  return (
    value
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toLocaleUpperCase("pl-PL") ?? "")
      .join("") || "OR"
  );
}
