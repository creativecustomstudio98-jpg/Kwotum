import Image from "next/image";

import { marketingMetadata } from "../../../lib/marketing/metadata";
import { Breadcrumbs } from "../components";

export const metadata = marketingMetadata(
  "Integracje Kwotum — jeden proces w wielu kanałach",
  "Publikuj ten sam proces Kwotum na stronie, przez hosted link i WordPress. Lead, pliki i wynik pozostają w prywatnym panelu organizacji.",
  "/integracje",
);

const channels = {
  left: [
    {
      description: "Osadź proces inline, w popupie albo na pełnym ekranie bez przenoszenia leadów.",
      icon: "widget",
      title: "Widget na stronie",
    },
    {
      description: "Udostępnij osobny adres procesu, gdy nie chcesz zmieniać obecnej strony.",
      icon: "link",
      title: "Hosted link",
    },
  ],
  right: [
    {
      description:
        "Wybierz proces przez cienki konektor i osadź go jako blok, shortcode lub popup.",
      icon: "wordpress",
      title: "WordPress",
    },
    {
      description: "Powiadom zespół o nowym leadzie bez ujawniania prywatnego wyniku na stronie.",
      icon: "email",
      title: "Powiadomienia e-mail",
    },
  ],
} as const;

const leadDetails = [
  ["Źródło", "Widget na stronie"],
  ["Proces", "Kuchnia na wymiar"],
  ["Lokalizacja", "Kraków"],
  ["Następny krok", "Weryfikacja firmy"],
] as const;

export default function IntegrationsPage() {
  return (
    <section
      aria-labelledby="integrations-title"
      className="integrations-reference-section"
      data-integrations-hero
    >
      <div className="marketing-container integrations-reference-section__inner">
        <Breadcrumbs items={[{ href: "/", label: "Start" }, { label: "Integracje" }]} />

        <header className="integrations-reference-section__heading">
          <p className="wy-kicker marketing-eyebrow">Integracje i publikacja</p>
          <h1 id="integrations-title">Kwotum działa z Twoim obecnym procesem</h1>
          <p>
            Publikuj ten sam proces tam, gdzie zaczynają klienci. Bez drugiej bazy leadów i bez
            przenoszenia danych do strony.
          </p>
        </header>

        <div className="integrations-reference-scene" data-integrations-hero-proof>
          <svg
            aria-hidden="true"
            className="integrations-reference-scene__connectors"
            preserveAspectRatio="none"
            viewBox="0 0 1200 430"
          >
            <path d="M320 90h58q20 0 20 20v60q0 20 20 20h22" />
            <path d="M320 340h58q20 0 20-20v-60q0-20 20-20h22" />
            <path d="M880 90h-58q-20 0-20 20v60q0 20-20 20h-22" />
            <path d="M880 340h-58q-20 0-20-20v-60q0-20-20-20h-22" />
            <circle cx="320" cy="90" r="4" />
            <circle cx="320" cy="340" r="4" />
            <circle cx="440" cy="190" r="4" />
            <circle cx="440" cy="240" r="4" />
            <circle cx="880" cy="90" r="4" />
            <circle cx="880" cy="340" r="4" />
            <circle cx="760" cy="190" r="4" />
            <circle cx="760" cy="240" r="4" />
          </svg>

          <div className="integrations-reference-scene__side integrations-reference-scene__side--left">
            {channels.left.map((channel) => (
              <ChannelCard channel={channel} key={channel.title} />
            ))}
          </div>

          <LeadRecord />

          <div className="integrations-reference-scene__side integrations-reference-scene__side--right">
            {channels.right.map((channel) => (
              <ChannelCard channel={channel} key={channel.title} />
            ))}
          </div>
        </div>

        <ul aria-label="Zasady integracji Kwotum" className="integrations-reference-rail">
          <li>
            <CheckIcon />
            <div>
              <strong>Jeden opublikowany proces</strong>
              <span>Widget, link i WordPress korzystają z tej samej wersji.</span>
            </div>
          </li>
          <li>
            <CheckIcon />
            <div>
              <strong>Bez drugiej bazy leadów</strong>
              <span>Odpowiedzi i pliki pozostają w Kwotum.</span>
            </div>
          </li>
          <li>
            <CheckIcon />
            <div>
              <strong>Właściwa organizacja</strong>
              <span>Tenant scope wskazuje, gdzie trafia każdy lead.</span>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}

function ChannelCard({
  channel,
}: {
  channel: (typeof channels.left)[number] | (typeof channels.right)[number];
}) {
  return (
    <article className="integrations-reference-card">
      <span aria-hidden="true" className="integrations-reference-card__icon">
        <ChannelIcon kind={channel.icon} />
      </span>
      <div>
        <h2>{channel.title}</h2>
        <p>{channel.description}</p>
      </div>
    </article>
  );
}

function LeadRecord() {
  return (
    <figure aria-labelledby="integration-lead-title" className="integration-lead-card">
      <figcaption>
        <span className="integration-lead-card__brand">
          <BrandMark />
          kwotum
        </span>
        <small>Dane demonstracyjne</small>
      </figcaption>
      <div className="integration-lead-card__body">
        <span className="integration-lead-card__status">Nowy lead</span>
        <h2 id="integration-lead-title">Kuchnia na wymiar — Nowak</h2>
        <dl>
          {leadDetails.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <p className="integration-lead-card__confirmation">
          <CheckIcon /> Lead trafił do właściwej organizacji
        </p>
      </div>
    </figure>
  );
}

function BrandMark() {
  return <Image alt="" aria-hidden="true" height={25} src="/kwotum-logo-v3.png" width={25} />;
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.6 2.6L16.5 9" />
    </svg>
  );
}

function ChannelIcon({ kind }: { kind: string }) {
  if (kind === "widget") {
    return (
      <svg fill="none" viewBox="0 0 32 32">
        <rect height="21" rx="3" width="25" x="3.5" y="5.5" />
        <path d="M4 11h24M8 8.3h.1M11 8.3h.1M10 17h12M10 21h8" />
      </svg>
    );
  }

  if (kind === "link") {
    return (
      <svg fill="none" viewBox="0 0 32 32">
        <path d="m13.5 18.5 5-5M11.5 22.5l-1.4 1.4a4.2 4.2 0 0 1-6-6l5-5a4.2 4.2 0 0 1 6 0M20.5 9.5l1.4-1.4a4.2 4.2 0 1 1 6 6l-5 5a4.2 4.2 0 0 1-6 0" />
      </svg>
    );
  }

  if (kind === "wordpress") {
    return (
      <svg fill="none" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="12" />
        <path d="m9.5 11 5 13M16 11l4.5 13M7 11h5M14 11h5M22.5 11h2M11.5 17h9M23.8 11c1.5 3.8-.6 8.6-3.3 13" />
      </svg>
    );
  }

  return (
    <svg fill="none" viewBox="0 0 32 32">
      <rect height="20" rx="3" width="26" x="3" y="6" />
      <path d="m5 9 11 9L27 9" />
    </svg>
  );
}
