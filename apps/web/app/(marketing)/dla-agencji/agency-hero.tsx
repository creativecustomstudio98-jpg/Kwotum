import Image from "next/image";
import Link from "next/link";

import { PanelIcon } from "../../panel/panel-icon";
import { PanelNavigationIcon } from "../../panel/panel-navigation-icon";
import { Breadcrumbs } from "../components";
import styles from "./agency-hero.module.css";

const navigationItems = [
  { icon: "dashboard", label: "Dashboard" },
  { icon: "leads", label: "Leady" },
  { icon: "processes", label: "Procesy" },
  { icon: "templates", label: "Szablony" },
  { icon: "analytics", label: "Analityka" },
  { icon: "integration", label: "Integracje" },
  { icon: "settings", label: "Ustawienia" },
] as const;

const leads = [
  {
    budget: "25 000–35 000 zł",
    client: "Anna Kowalska",
    date: "dzisiaj, 09:41",
    initials: "AK",
    score: 85,
    service: "Kuchnia na wymiar",
    status: "W trakcie",
    statusKind: "progress",
    timeline: "Do 3 miesięcy",
  },
  {
    budget: "27 500–38 000 zł",
    client: "Piotr Nowak",
    date: "wczoraj, 16:20",
    initials: "PN",
    score: 82,
    service: "Ogrodzenia panelowe",
    status: "Nowy",
    statusKind: "new",
    timeline: "Do 2 miesięcy",
  },
  {
    budget: "30 000–41 000 zł",
    client: "Katarzyna Wiśniewska",
    date: "1 sie, 13:04",
    initials: "KW",
    score: 79,
    service: "Strona internetowa",
    status: "Zakwalifikowany",
    statusKind: "qualified",
    timeline: "Do 1 miesiąca",
  },
  {
    budget: "32 500–44 000 zł",
    client: "Michał Zieliński",
    date: "31 lip, 11:32",
    initials: "MZ",
    score: 83,
    service: "Remont mieszkania",
    status: "Zakończony",
    statusKind: "completed",
    timeline: "Do 3 miesięcy",
  },
  {
    budget: "35 000–47 000 zł",
    client: "Joanna Lewandowska",
    date: "30 lip, 08:57",
    initials: "JL",
    score: 87,
    service: "Klimatyzacja",
    status: "W trakcie",
    statusKind: "progress",
    timeline: "Do 2 miesięcy",
  },
] as const;

export function AgencyHero() {
  return (
    <section aria-labelledby="agency-hero-title" className={styles.hero} data-agency-hero>
      <div className={`marketing-container ${styles.inner}`}>
        <Breadcrumbs items={[{ href: "/", label: "Start" }, { label: "Dla agencji" }]} />

        <div className={styles.intro}>
          <header className={styles.copy}>
            <p className={`wy-kicker marketing-eyebrow ${styles.eyebrow}`}>Dla agencji</p>
            <h1 id="agency-hero-title">
              Wdrażacie proces. <span>Klient zarządza leadami.</span>
            </h1>
            <p className={styles.description}>
              Agencja projektuje pytania, konfiguruje proces i publikuje go na stronie. Firma
              otrzymuje kompletne zapytania w swoim panelu Kwotum — z własnymi rolami, historią i
              odpowiedzialnością za dalszą obsługę.
            </p>
            <div className={styles.actions}>
              <Link className={styles.primaryAction} href="#model-wdrozenia">
                Zobacz model wdrożenia
              </Link>
              <Link className={styles.secondaryAction} href="/branze">
                Porównaj branże
              </Link>
            </div>
          </header>

          <dl aria-label="Podział odpowiedzialności" className={styles.ownership}>
            <div>
              <dt>Agencja</dt>
              <dd>Warsztat, konfiguracja i publikacja procesu</dd>
            </div>
            <div>
              <dt>Firma klienta</dt>
              <dd>Role, leady, historia i bieżąca obsługa sprzedaży</dd>
            </div>
            <div>
              <dt>Uprawnienia</dt>
              <dd>Agencja nie otrzymuje automatycznego dostępu do leadów.</dd>
            </div>
          </dl>
        </div>

        <AgencyPanelProof />
      </div>
    </section>
  );
}

function AgencyPanelProof() {
  return (
    <figure className={styles.proof} data-agency-tenant-proof>
      <figcaption className="wy-sr-only">
        Demonstracyjny widok listy leadów w panelu organizacji klienta. Panel korzysta z tej samej
        nawigacji, tabeli, statusów i układu responsywnego co aplikacja Kwotum.
      </figcaption>

      <div className={styles.panelShell} data-agency-panel-preview>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarBrand}>
            <Image alt="" height={38} src="/kwotum-logo-v3.png" width={38} />
            <span>
              <strong>Kwotum</strong>
              <small>Panel operacyjny</small>
            </span>
          </div>

          <div className={styles.sidebarNavigation}>
            {navigationItems.map((item) => (
              <span
                className={item.icon === "leads" ? styles.activeNav : undefined}
                key={item.label}
              >
                <PanelNavigationIcon name={item.icon} />
                {item.label}
              </span>
            ))}
          </div>

          <div className={styles.sidebarAccount}>
            <span>AK</span>
            <p>
              <strong>Anna Kowalska</strong>
              <small>Kuchnie Nowa Forma</small>
            </p>
          </div>
        </aside>

        <div className={styles.panelMain}>
          <header className={styles.panelHeader}>
            <div>
              <small>Organizacja klienta</small>
              <h2>Leady</h2>
            </div>
            <div className={styles.panelHeaderActions}>
              <span className={styles.searchField}>
                <PanelIcon name="search" />
                Szukaj leadów…
              </span>
              <span className={styles.newLead}>
                <PanelIcon name="plus" />
                Nowy lead
              </span>
            </div>
          </header>

          <div className={styles.filters}>
            <span className={styles.activeFilter}>
              Wszystkie <small>88</small>
            </span>
            <span>
              Nowe <small>18</small>
            </span>
            <span>
              W trakcie <small>19</small>
            </span>
            <span>
              Zakończone <small>35</small>
            </span>
            <span>
              Odrzucone <small>16</small>
            </span>
          </div>

          <div className={styles.tableWrap} data-agency-lead-table>
            <table>
              <thead>
                <tr>
                  <th>Klient</th>
                  <th>Usługa</th>
                  <th>Wynik</th>
                  <th>Budżet</th>
                  <th>Termin</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.client}>
                    <th data-label="Klient">
                      <span className={styles.leadIdentity}>
                        <span>{lead.initials}</span>
                        <strong>{lead.client}</strong>
                      </span>
                    </th>
                    <td data-label="Usługa">{lead.service}</td>
                    <td data-label="Wynik">
                      <strong className={styles.score}>
                        {lead.score}
                        <small>/100</small>
                      </strong>
                    </td>
                    <td data-label="Budżet">{lead.budget}</td>
                    <td data-label="Termin">{lead.timeline}</td>
                    <td data-label="Status">
                      <span className={`${styles.status} ${styles[`status_${lead.statusKind}`]}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td data-label="Data">{lead.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <span className={styles.currentPage}>1</span>
            <span>2</span>
            <span>3</span>
            <span>…</span>
            <span>11</span>
          </div>
        </div>

        <div className={styles.mobileNavigation} data-agency-mobile-navigation>
          {navigationItems.slice(0, 4).map((item) => (
            <span
              className={item.icon === "leads" ? styles.mobileActive : undefined}
              key={item.label}
            >
              <PanelNavigationIcon name={item.icon} />
              <small>{item.label === "Dashboard" ? "Start" : item.label}</small>
            </span>
          ))}
          <span>
            <PanelNavigationIcon name="more" />
            <small>Więcej</small>
          </span>
        </div>
      </div>

      <div className={styles.proofCaption}>
        <span>Oddzielna organizacja klienta</span>
        <p>Agencja przekazuje gotowe wdrożenie. Firma pracuje dalej w swoim panelu.</p>
      </div>
    </figure>
  );
}
