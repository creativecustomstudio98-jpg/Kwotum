import { Button, EmptyState, LinkButton } from "@wyceno/ui";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "../../lib/supabase/server";
import { signOut } from "../logowanie/actions";
import {
  formatActiveProcessCount,
  formatAttentionLeadCount,
  formatLastActivity,
  latestIsoDate,
} from "./organization-picker-model";

export const metadata: Metadata = {
  title: "Organizacje",
};

export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const supabase = await createClient();
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
          .select("id, name")
          .in("id", organizationIds)
          .is("deleted_at", null)
      : { data: [], error: null };

  if (organizationsError) {
    throw new Error("Nie udało się pobrać danych organizacji.");
  }

  const organizationOverviews = await Promise.all(
    organizations.map(async (organization) => {
      const membership = memberships.find((item) => item.organization_id === organization.id);
      const canReadFlows = membership?.role === "owner" || membership?.role === "admin";
      const [publishedFlows, attentionLeads, latestLead, latestFlow] = await Promise.all([
        canReadFlows
          ? supabase
              .from("published_flows")
              .select("public_id", { count: "exact", head: true })
              .eq("organization_id", organization.id)
          : Promise.resolve({ count: null, error: null }),
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", organization.id)
          .in("status", ["new", "in_progress"]),
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

      if (publishedFlows.error || attentionLeads.error || latestLead.error || latestFlow.error) {
        throw new Error("Nie udało się pobrać podsumowania organizacji.");
      }

      return {
        activeFlowCount: canReadFlows ? (publishedFlows.count ?? 0) : null,
        attentionLeadCount: attentionLeads.count ?? 0,
        id: organization.id,
        lastActivityAt: latestIsoDate([latestLead.data?.submitted_at, latestFlow.data?.updated_at]),
      };
    }),
  );
  const overviewByOrganizationId = new Map(
    organizationOverviews.map((overview) => [overview.id, overview]),
  );

  if (organizations.length === 1) {
    const onlyOrganization = organizations[0];
    const membership = memberships.find((item) => item.organization_id === onlyOrganization?.id);
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

  return (
    <main className="organization-picker">
      <header className="organization-picker__header">
        <Link aria-label="Kwotum — strona główna" href="/">
          <Image alt="" height={46} priority src="/kwotum-logo-v3.png" width={46} />
          <strong>Kwotum</strong>
        </Link>
        <form action={signOut} className="organization-picker__logout">
          <Button size="small" type="submit" variant="secondary">
            Wyloguj się
          </Button>
        </form>
      </header>
      <div className="organization-picker__content">
        <header className="organization-picker__intro">
          <h1>Wybierz organizację</h1>
          <p>Wybierz organizację, w której chcesz pracować</p>
        </header>
        {organizations.length === 0 ? (
          <div className="panel-card">
            <EmptyState
              description="Administrator musi dodać Cię do aktywnej organizacji."
              title="Brak dostępnych organizacji"
            />
          </div>
        ) : (
          <ul className="organization-list">
            {organizations.map((organization) => {
              const overview = overviewByOrganizationId.get(organization.id);
              const activeFlowLabel =
                overview?.activeFlowCount === null
                  ? "Dostęp do leadów"
                  : formatActiveProcessCount(overview?.activeFlowCount ?? 0);
              const membership = memberships.find(
                (item) => item.organization_id === organization.id,
              );

              return (
                <li className="organization-list__card" key={organization.id}>
                  <div className="organization-list__identity">
                    <span aria-hidden="true">{initials(organization.name)}</span>
                    <div className="organization-list__copy">
                      <strong>{organization.name}</strong>
                      <small>{formatRole(membership?.role)}</small>
                    </div>
                  </div>
                  <ul
                    aria-label={`Podsumowanie organizacji ${organization.name}`}
                    className="organization-list__meta"
                  >
                    <li>{activeFlowLabel}</li>
                    <li>{formatAttentionLeadCount(overview?.attentionLeadCount ?? 0)}</li>
                    <li>{formatLastActivity(overview?.lastActivityAt ?? null)}</li>
                  </ul>
                  <div className="organization-actions">
                    <LinkButton
                      className="organization-actions__primary"
                      href={`/panel/${organization.id}`}
                      variant="secondary"
                    >
                      Wybierz
                    </LinkButton>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
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

function formatRole(role: "admin" | "owner" | "sales" | undefined): string {
  if (role === "owner") return "Właściciel organizacji";
  if (role === "admin") return "Administrator organizacji";
  return "Dostęp do obsługi leadów";
}
