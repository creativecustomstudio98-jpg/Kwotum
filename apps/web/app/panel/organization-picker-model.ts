export function formatActiveProcessCount(count: number): string {
  return `${count} ${polishCount(count, "aktywny proces", "aktywne procesy", "aktywnych procesów")}`;
}

export function formatAttentionLeadCount(count: number): string {
  return `${count} ${polishCount(count, "lead do obsługi", "leady do obsługi", "leadów do obsługi")}`;
}

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

  const today = dayKey(now, timeZone);
  const yesterday = dayKey(new Date(now.getTime() - 24 * 60 * 60 * 1_000), timeZone);
  const activityDay = dayKey(activity, timeZone);

  if (activityDay === today) return "Ostatnia aktywność dzisiaj";
  if (activityDay === yesterday) return "Ostatnia aktywność wczoraj";

  return `Ostatnia aktywność ${new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
    timeZone,
  })
    .format(activity)
    .replace(".", "")}`;
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
