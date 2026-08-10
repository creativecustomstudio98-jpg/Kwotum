type DatedLead = Readonly<{ submittedAt: string }>;

export function buildDailyLeadCounts(
  leads: ReadonlyArray<DatedLead>,
  days: number,
): Array<{ count: number; isoDate: string; label: string }> {
  const formatter = new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - index - 1));
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);

    return {
      count: leads.filter((lead) => {
        const submittedAt = new Date(lead.submittedAt);
        return submittedAt >= date && submittedAt < nextDate;
      }).length,
      isoDate: date.toISOString().slice(0, 10),
      label: formatter.format(date),
    };
  });
}

export function LeadVolumeChart({
  days = 14,
  leads,
}: {
  days?: number;
  leads: ReadonlyArray<DatedLead>;
}) {
  const counts = buildDailyLeadCounts(leads, days);
  const maximum = Math.max(...counts.map((item) => item.count), 1);

  return (
    <ol
      aria-label={`Liczba leadów dzień po dniu: ${counts
        .map((item) => `${item.label}: ${item.count}`)
        .join(", ")}`}
      className="lead-volume-chart"
    >
      {counts.map((item) => (
        <li key={item.isoDate}>
          <span aria-hidden="true">
            <i
              style={{
                height: `${Math.max((item.count / maximum) * 100, 4)}%`,
              }}
            />
          </span>
          <small>{item.label}</small>
        </li>
      ))}
    </ol>
  );
}

export function QualityScore({ count, score }: { count: number; score: number | null }) {
  if (score === null) {
    return (
      <div className="panel-inline-state">
        <strong>Brak obliczonych wyników</strong>
        <span>Jakość pojawi się po zapisaniu leadów ze score.</span>
      </div>
    );
  }

  return (
    <div className="quality-score">
      <svg
        aria-label={`Średni score: ${score} na 100`}
        className="quality-score__ring"
        role="img"
        viewBox="0 0 120 120"
      >
        <circle className="quality-score__track" cx="60" cy="60" r="46" />
        <circle
          className="quality-score__value"
          cx="60"
          cy="60"
          pathLength="100"
          r="46"
          strokeDasharray={`${score} ${100 - score}`}
        />
      </svg>
      <div>
        <strong>{score}%</strong>
        <span>średnie dopasowanie</span>
        <small>
          {count} {count === 1 ? "lead z wynikiem" : "leadów z wynikiem"}
        </small>
      </div>
    </div>
  );
}
