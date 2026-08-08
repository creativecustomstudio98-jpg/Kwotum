import Link from "next/link";
import type { ReactNode } from "react";

import { HomeIndustryTemplates } from "./home-industry-templates";
import { HomeInteractiveDemo } from "./home-interactive-demo";
import styles from "./home-conversion.module.css";

const leadActivity = [
  ["10:24", "Lead utworzony", "Formularz na stronie"],
  ["10:25", "Wynik potwierdzony", "Przedział 25 000–35 000 zł"],
  ["10:31", "Status zmieniony", "W kontakcie"],
] as const;

const embedModes = [
  ["Inline", "W treści strony"],
  ["Popup", "Po działaniu użytkownika"],
  ["Fullscreen", "Pełny proces bez rozproszeń"],
  ["Hosted link", "Osobny adres procesu"],
] as const;

const pilotSteps = [
  "Typowe zapytania i kryteria firmy",
  "Pytania, warunki, wynik i kwalifikacja",
  "Publikacja oraz wybrany sposób osadzenia",
  "Wspólna weryfikacja jakości briefów",
] as const;

export function HomeConversionJourney() {
  return (
    <>
      <section
        aria-labelledby="home-demo-title"
        className={`${styles.section} ${styles.demoSection}`}
        data-home-section="client-demo"
        id="demo-procesu"
      >
        <div className={`marketing-container ${styles.sectionInner}`}>
          <div className={styles.demoIntro}>
            <p className={styles.eyebrow}>Interaktywne demo</p>
            <h2 id="home-demo-title">Przejdź przykładowy proces tak, jak zrobi to Twój klient.</h2>
            <p>
              Wybierz branżę, odpowiedz na kilka pytań i zobacz, jak z każdą odpowiedzią powstaje
              uporządkowany lead.
            </p>
          </div>

          <div className={styles.demoProof} data-home-proof="interactive-client-process">
            <HomeInteractiveDemo />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="home-fit-title"
        className={`${styles.section} ${styles.fitSection}`}
        data-home-section="process-fit"
        id="dla-kogo"
      >
        <div className={`marketing-container ${styles.sectionInner}`}>
          <div className={styles.industryIntro}>
            <div>
              <p className={styles.eyebrow}>Szablony branżowe</p>
              <h2 id="home-fit-title">Gotowe procesy dla firm usługowych.</h2>
            </div>
            <div className={styles.industryIntroCopy}>
              <p>
                Każda branża zbiera inne informacje. Kwotum nie zaczyna od pustego formularza —
                dostajesz logiczny proces, który można dopasować do własnej oferty.
              </p>
            </div>
          </div>

          <HomeIndustryTemplates />
        </div>
      </section>

      <section
        aria-labelledby="home-rules-title"
        className={`${styles.section} ${styles.rulesSection}`}
        data-home-section="explainable-rules"
        id="reguly"
      >
        <div className={`marketing-container ${styles.sectionInner}`}>
          <ChapterMarker label="Wynik i kwalifikacja" number="05" />
          <div className={`${styles.chapterGrid} ${styles.gridFourEight}`}>
            <ChapterCopy
              eyebrow="Bez czarnej skrzynki"
              titleId="home-rules-title"
              title="Reguły firmy liczą wynik. AI nie ustala ceny ani score."
            >
              <p>
                Serwer odtwarza wynik z zapisanych odpowiedzi i przypiętej wersji procesu. Klient
                widzi bezpieczny wynik orientacyjny, a firma — score oraz powody dopasowania.
              </p>
              <div className={styles.inlineLinks}>
                <TextLink href="/funkcje/kalkulator-wyceny">Zobacz zasady wyniku</TextLink>
                <TextLink href="/funkcje/lead-scoring">Jak działa score</TextLink>
              </div>
            </ChapterCopy>

            <figure
              className={styles.rulesProof}
              data-home-proof="server-rules"
              data-reveal="right"
              data-reveal-delay="2"
            >
              <figcaption className="wy-sr-only">
                Demonstracyjny przepływ od odpowiedzi i wersji procesu przez obliczenie serwerowe do
                wyniku klienta oraz kontekstu firmy.
              </figcaption>
              <div className={styles.ruleInputs}>
                <header>
                  <span>Wejście</span>
                  <strong>Odpowiedzi + wersja 3</strong>
                </header>
                <dl>
                  <div>
                    <dt>Zakres</dt>
                    <dd>Kuchnia w kształcie L</dd>
                  </div>
                  <div>
                    <dt>Budżet</dt>
                    <dd>25 000–35 000 zł</dd>
                  </div>
                  <div>
                    <dt>Termin</dt>
                    <dd>Do 3 miesięcy</dd>
                  </div>
                </dl>
              </div>
              <div aria-hidden="true" className={styles.ruleConnector}>
                <span />
                <strong>Reguły serwerowe</strong>
                <span />
              </div>
              <div className={styles.ruleOutputs}>
                <article>
                  <span>Wynik klienta</span>
                  <strong>25 000–35 000 zł</strong>
                  <small>Orientacyjny przedział</small>
                </article>
                <article>
                  <span>Kontekst firmy</span>
                  <strong>
                    85<small>/100</small>
                  </strong>
                  <ul>
                    <li>Budżet w przedziale</li>
                    <li>Termin realny</li>
                    <li>Zakres w ofercie</li>
                  </ul>
                </article>
              </div>
              <p className={styles.proofNote}>Dane demonstracyjne · wynik niewiążący</p>
            </figure>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="home-ops-title"
        className={`${styles.section} ${styles.opsSection}`}
        data-home-section="lead-operations"
        id="obsluga-leada"
      >
        <div className={`marketing-container ${styles.sectionInner}`}>
          <ChapterMarker label="Obsługa leada" number="06" />
          <div className={`${styles.chapterGrid} ${styles.gridFourEight}`}>
            <ChapterCopy
              eyebrow="Po wysłaniu formularza"
              titleId="home-ops-title"
              title="Handlowiec przejmuje kontekst, nie zaczyna od zera."
            >
              <p>
                Odpowiedzi, wynik, pliki, status, historia i notatki pozostają w jednym rekordzie.
                Następny krok jest widoczny przy leadzie, bez udawania pełnego CRM.
              </p>
              <TextLink href="/funkcje/kwalifikacja-leadow">Zobacz kwalifikację leadów</TextLink>
            </ChapterCopy>

            <figure
              className={styles.opsProof}
              data-home-proof="lead-operations"
              data-reveal="left"
              data-reveal-delay="2"
            >
              <figcaption className="wy-sr-only">
                Demonstracyjny widok listy leadów i historii obsługi wybranego rekordu.
              </figcaption>
              <aside className={styles.leadIndex}>
                <header>
                  <strong>Leady</strong>
                  <span>3 rekordy</span>
                </header>
                <ol>
                  <li className={styles.leadIndexActive}>
                    <span>AK</span>
                    <span>
                      <strong>Anna Kowalska</strong>
                      <small>Kuchnia na wymiar</small>
                    </span>
                    <span>85</span>
                  </li>
                  <li>
                    <span>PM</span>
                    <span>
                      <strong>Piotr Maj</strong>
                      <small>Szafa wnękowa</small>
                    </span>
                    <span>72</span>
                  </li>
                  <li>
                    <span>MK</span>
                    <span>
                      <strong>Marta K.</strong>
                      <small>Meble łazienkowe</small>
                    </span>
                    <span>64</span>
                  </li>
                </ol>
              </aside>
              <article className={styles.leadRecord}>
                <header>
                  <span>
                    <strong>Lead L-2026-0152</strong>
                    <small>Anna Kowalska · kuchnia na wymiar</small>
                  </span>
                  <span className={styles.status}>W kontakcie</span>
                </header>
                <div className={styles.leadRecordBody}>
                  <section aria-label="Historia leada" className={styles.activityLog}>
                    <h3>Historia</h3>
                    <ol>
                      {leadActivity.map(([time, title, detail]) => (
                        <li key={time}>
                          <time dateTime={`2026-07-26T${time}:00+02:00`}>{time}</time>
                          <span>
                            <strong>{title}</strong>
                            <small>{detail}</small>
                          </span>
                        </li>
                      ))}
                    </ol>
                  </section>
                  <aside className={styles.nextStep}>
                    <span>Następny krok</span>
                    <strong>Kontakt telefoniczny do 24 h</strong>
                    <p>Notatka: potwierdzić termin pomiaru i dostęp do pomieszczenia.</p>
                    <dl>
                      <div>
                        <dt>Opiekun</dt>
                        <dd>Jan Kowalski</dd>
                      </div>
                      <div>
                        <dt>Priorytet</dt>
                        <dd>Wysoki</dd>
                      </div>
                    </dl>
                  </aside>
                </div>
              </article>
            </figure>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="home-publish-title"
        className={`${styles.section} ${styles.publishSection}`}
        data-home-section="versioned-publishing"
        id="osadzenie"
      >
        <div className={`marketing-container ${styles.sectionInner}`}>
          <ChapterMarker label="Publikacja i osadzenie" number="07" />
          <div className={styles.publishIntro}>
            <ChapterCopy
              eyebrow="Jedna logika procesu"
              titleId="home-publish-title"
              title="Publikujesz jedną wersję. Osadzasz ją bez kopiowania reguł."
            >
              <p>
                Inline, popup, fullscreen i hosted link korzystają z tego samego opublikowanego
                procesu. Nowa publikacja nie zmienia danych istniejących sesji i leadów.
              </p>
              <div className={styles.inlineLinks}>
                <TextLink href="/funkcje/widget-na-strone">Sprawdź sposób osadzenia</TextLink>
                <TextLink href="/wordpress">Zobacz WordPress</TextLink>
              </div>
            </ChapterCopy>
          </div>
          <figure
            className={styles.publishProof}
            data-home-proof="versioned-publishing"
            data-reveal="up"
            data-reveal-delay="2"
          >
            <figcaption className="wy-sr-only">
              Przepływ od wersji roboczej przez walidację i publikację do czterech sposobów
              osadzenia oraz wspólnego panelu leadów.
            </figcaption>
            <div className={styles.versionPath}>
              <article>
                <span>01</span>
                <strong>Wersja robocza</strong>
                <small>Pytania i reguły</small>
              </article>
              <span aria-hidden="true">→</span>
              <article>
                <span>02</span>
                <strong>Walidacja</strong>
                <small>Ścieżki i wynik</small>
              </article>
              <span aria-hidden="true">→</span>
              <article className={styles.publishedVersion}>
                <span>03</span>
                <strong>Wersja 3 opublikowana</strong>
                <small>Niezmienny snapshot</small>
              </article>
            </div>
            <div aria-hidden="true" className={styles.publishBranch} />
            <div className={styles.embedModes}>
              {embedModes.map(([mode, description]) => (
                <article key={mode}>
                  <strong>{mode}</strong>
                  <small>{description}</small>
                </article>
              ))}
            </div>
            <div className={styles.panelDestination}>
              <span>Wspólny cel</span>
              <strong>Tenantowy panel leadów</strong>
              <small>WordPress przechowuje konfigurację osadzenia, nie dane leadów.</small>
            </div>
          </figure>
        </div>
      </section>

      <section
        aria-labelledby="home-agency-title"
        className={`${styles.section} ${styles.agencySection}`}
        data-home-section="agency-boundary"
        id="dla-agencji"
      >
        <div className={`marketing-container ${styles.sectionInner}`}>
          <ChapterMarker label="Firma i agencja" number="08" />
          <div className={`${styles.chapterGrid} ${styles.gridFiveSeven}`}>
            <ChapterCopy
              eyebrow="Jasna odpowiedzialność"
              titleId="home-agency-title"
              title="Agencja wdraża proces. Firma zachowuje kontrolę nad leadami."
            >
              <p>
                Agencja może poprowadzić warsztat, skonfigurować pytania i osadzić widget. Role oraz
                tenant scope nadal decydują, kto widzi dane.
              </p>
              <TextLink href="/dla-agencji">Zobacz model dla agencji</TextLink>
            </ChapterCopy>

            <figure
              className={styles.agencyProof}
              data-home-proof="agency-data-boundary"
              data-reveal="right"
              data-reveal-delay="2"
            >
              <figcaption className="wy-sr-only">
                Podział odpowiedzialności agencji i firmy z zaznaczoną granicą dostępu do danych
                tenantowych.
              </figcaption>
              <div className={styles.responsibilityLane}>
                <header>
                  <span>Agencja</span>
                  <strong>Wdrożenie procesu</strong>
                </header>
                <ol>
                  <li>
                    <span>01</span> Warsztat
                  </li>
                  <li>
                    <span>02</span> Konfiguracja
                  </li>
                  <li>
                    <span>03</span> Osadzenie
                  </li>
                </ol>
              </div>
              <div className={styles.dataBoundary}>
                <span>Granica danych organizacji</span>
                <strong>Role + tenant scope</strong>
                <small>Samo wdrożenie nie nadaje dostępu do leadów.</small>
              </div>
              <div className={styles.responsibilityLane}>
                <header>
                  <span>Firma</span>
                  <strong>Decyzje i obsługa</strong>
                </header>
                <ol>
                  <li>
                    <span>01</span> Zatwierdzenie
                  </li>
                  <li>
                    <span>02</span> Leady
                  </li>
                  <li>
                    <span>03</span> Następny krok
                  </li>
                </ol>
              </div>
            </figure>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="home-pilot-title"
        className={`${styles.section} ${styles.pilotSection}`}
        data-home-section="pilot-scope"
        id="pilotaz"
      >
        <div className={`marketing-container ${styles.sectionInner}`}>
          <ChapterMarker label="Program pilotażowy" number="09" />
          <div className={`${styles.chapterGrid} ${styles.gridFiveSeven}`}>
            <ChapterCopy
              eyebrow="Konkretny następny krok"
              titleId="home-pilot-title"
              title="Zacznij od jednego procesu i sprawdź jakość briefów."
            >
              <p>
                Pilotaż obejmuje warsztat procesu, konfigurację pytań i wyniku, osadzenie lub hosted
                link oraz wspólną weryfikację jakości leadów. Zakres i wycena są ustalane
                indywidualnie.
              </p>
              <div className={styles.pilotActions}>
                <Link className={styles.primaryAction} href="/cennik">
                  Sprawdź zakres pilotażu
                </Link>
                <Link className={styles.secondaryAction} href="/branze/meble-na-wymiar">
                  Najpierw zobacz demo
                </Link>
              </div>
            </ChapterCopy>

            <figure
              className={styles.pilotProof}
              data-home-proof="pilot-scope"
              data-reveal="left"
              data-reveal-delay="2"
            >
              <figcaption className="wy-sr-only">
                Zakres demonstracyjnego wdrożenia pilotażowego podzielony na cztery etapy oraz
                odpowiedzialność firmy i Kwotum.
              </figcaption>
              <header>
                <span>
                  <strong>Pilotaż jednego procesu</strong>
                  <small>Zakres ustalany indywidualnie</small>
                </span>
                <span className={styles.status}>4 etapy</span>
              </header>
              <ol className={styles.pilotSteps}>
                {pilotSteps.map((step, index) => (
                  <li key={step}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{step}</strong>
                  </li>
                ))}
              </ol>
              <div className={styles.pilotHandoff}>
                <article>
                  <span>Firma dostarcza</span>
                  <ul>
                    <li>przykładowe zapytania;</li>
                    <li>kryteria zakresu i dopasowania;</li>
                    <li>osobę do odbioru procesu.</li>
                  </ul>
                </article>
                <article>
                  <span>Kwotum przygotowuje</span>
                  <ul>
                    <li>strukturę pytań i warunki;</li>
                    <li>orientacyjny wynik i score;</li>
                    <li>publikację oraz osadzenie.</li>
                  </ul>
                </article>
              </div>
            </figure>
          </div>
        </div>
      </section>
    </>
  );
}

function ChapterMarker({ label, number }: { label: string; number: string }) {
  return (
    <div aria-hidden="true" className={styles.chapterMarker}>
      <span>{number}</span>
      <strong>{label}</strong>
      <span />
    </div>
  );
}

function ChapterCopy({
  children,
  eyebrow,
  title,
  titleId,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  titleId: string;
}) {
  return (
    <div className={styles.chapterCopy} data-reveal="up" data-reveal-delay="1">
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 id={titleId}>{title}</h2>
      <div className={styles.copyBody}>{children}</div>
    </div>
  );
}

function TextLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link className={styles.textLink} href={href}>
      <span>{children}</span>
      <span aria-hidden="true">→</span>
    </Link>
  );
}
