import type { OrganizationMemberRole, OrganizationMemberStatus } from "@wyceno/database";

export type OrganizationRolePresentation = Readonly<{
  description: string;
  label: string;
}>;

export type OrganizationStatusPresentation = Readonly<{
  label: string;
  tone: "active" | "invited" | "suspended";
}>;

export function latestIsoDate(values: ReadonlyArray<string | null | undefined>): string | null {
  const timestamps = values.flatMap((value) => {
    if (!value) return [];
    const timestamp = new Date(value).getTime();
    return Number.isFinite(timestamp) ? [timestamp] : [];
  });

  return timestamps.length === 0 ? null : new Date(Math.max(...timestamps)).toISOString();
}

export function formatLastActivity(
  value: string | null,
  now = new Date(),
  timeZone = "Europe/Warsaw",
): string {
  if (!value) return "Brak aktywności";

  const activity = new Date(value);
  if (!Number.isFinite(activity.getTime())) return "Brak aktywności";

  const dayDistance = calendarDayDistance(activity, now, timeZone);
  const time = new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    timeZone,
  }).format(activity);

  if (dayDistance === 0) return `Dzisiaj, ${time}`;
  if (dayDistance === 1) return `Wczoraj, ${time}`;
  if (dayDistance > 1 && dayDistance <= 30) {
    return `${dayDistance} ${polishCount(dayDistance, "dzień temu", "dni temu", "dni temu")}, ${time}`;
  }

  return `${new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
    timeZone,
  })
    .format(activity)
    .replace(".", "")}, ${time}`;
}

export function organizationRolePresentation(
  role: OrganizationMemberRole,
): OrganizationRolePresentation {
  switch (role) {
    case "owner":
      return { description: "Pełny dostęp", label: "Właściciel" };
    case "admin":
      return { description: "Pełny dostęp", label: "Administrator" };
    case "sales":
      return { description: "Obsługa leadów", label: "Sprzedaż" };
  }
}

export function organizationStatusPresentation(
  status: OrganizationMemberStatus,
): OrganizationStatusPresentation {
  switch (status) {
    case "active":
      return { label: "Aktywna", tone: "active" };
    case "invited":
      return { label: "Oczekująca", tone: "invited" };
    case "suspended":
      return { label: "Wstrzymana", tone: "suspended" };
  }
}

export function normalizeOrganizationSearch(value: string | undefined): string {
  return value?.trim().replace(/\s+/g, " ").slice(0, 120) ?? "";
}

export function organizationMatchesSearch(
  organization: Readonly<{ name: string; slug: string }>,
  query: string,
): boolean {
  if (!query) return true;
  const normalizedQuery = query.toLocaleLowerCase("pl-PL");
  return [organization.name, organization.slug].some((value) =>
    value.toLocaleLowerCase("pl-PL").includes(normalizedQuery),
  );
}

function calendarDayDistance(activity: Date, now: Date, timeZone: string): number {
  const [activityYear, activityMonth, activityDay] = dayKey(activity, timeZone)
    .split("-")
    .map(Number);
  const [nowYear, nowMonth, nowDay] = dayKey(now, timeZone).split("-").map(Number);
  const activityUtc = Date.UTC(activityYear ?? 0, (activityMonth ?? 1) - 1, activityDay ?? 1);
  const nowUtc = Date.UTC(nowYear ?? 0, (nowMonth ?? 1) - 1, nowDay ?? 1);
  return Math.round((nowUtc - activityUtc) / (24 * 60 * 60 * 1_000));
}

function dayKey(value: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).format(value);
}

function polishCount(count: number, singular: string, paucal: string, plural: string): string {
  const absolute = Math.abs(count);
  const modulo100 = absolute % 100;
  const modulo10 = absolute % 10;

  if (absolute === 1) return singular;
  if (modulo10 >= 2 && modulo10 <= 4 && !(modulo100 >= 12 && modulo100 <= 14)) return paucal;
  return plural;
}
