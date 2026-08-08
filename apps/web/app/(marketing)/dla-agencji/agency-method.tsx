import { PanelNavigationIcon } from "../../panel/panel-navigation-icon";
import styles from "./agency-method.module.css";

const implementationStages = [
  {
    description:
      "Rozpisujemy decyzje potrzebne sprzedawcy i usuwamy pytania, które nie prowadzą do konkretnego działania.",
    icon: "processes",
    label: "Ustalenie zakresu",
    owner: "Agencja + firma",
    result: "Mapa pytań i odpowiedzialności",
    title: "Warsztat",
  },
  {
    description:
      "Agencja ustawia warunki, przedziały, score oraz treści potwierdzeń w jednej wersjonowanej konfiguracji.",
    icon: "templates",
    label: "Budowa procesu",
    owner: "Agencja",
    result: "Proces gotowy do wspólnego testu",
    title: "Konfiguracja",
  },
  {
    description:
      "Widget albo hosted link trafia do właściwego miejsca i przechodzi kontrolę mobile, klawiatury oraz CSS klienta.",
    icon: "integration",
    label: "Publikacja",
    owner: "Agencja",
    result: "Sprawdzony kanał na stronie klienta",
    title: "Osadzenie",
  },
  {
    description:
      "Firma przejmuje codzienną obsługę zapytań. Kolejna zmiana procesu powstaje jako nowa, kontrolowana wersja.",
    icon: "leads",
    label: "Codzienna praca",
    owner: "Firma klienta",
    result: "Leady w jej organizacji i rolach",
    title: "Przekazanie",
  },
] as const;

const implementationRules = [
  ["Architektura", "Wspólna dla każdego wdrożenia"],
  ["Treść i logika", "Dopasowane do konkretnej firmy"],
  ["Dane i dostęp", "W organizacji klienta"],
] as const;

export function AgencyMethod() {
  return (
    <section
      aria-labelledby="agency-method-title"
      className={styles.section}
      data-agency-method
      id="model-wdrozenia"
    >
      <div className={`marketing-container ${styles.inner}`}>
        <header className={styles.heading}>
          <div>
            <p className={`wy-kicker marketing-eyebrow ${styles.eyebrow}`}>Model wdrożenia</p>
            <h2 id="agency-method-title">
              Jedna metoda wdrożenia. <span>Każdy proces dopasowany do klienta.</span>
            </h2>
          </div>
          <p className={styles.lede}>
            Powtarzamy kolejność pracy, nie zestaw pytań. Zakres, logika i publikacja powstają dla
            konkretnej firmy, a odpowiedzialność zmienia się dopiero przy przekazaniu.
          </p>
        </header>

        <div className={styles.board} data-agency-method-board>
          <div className={styles.boardHeader}>
            <p className={styles.boardTitle}>
              <span aria-hidden="true" />
              Plan wdrożenia
            </p>
            <ul aria-label="Parametry planu wdrożenia" className={styles.boardMeta}>
              <li>4 etapy</li>
              <li>wersjonowana publikacja</li>
              <li>jasne przekazanie</li>
            </ul>
          </div>

          <ol aria-label="Cztery etapy wdrożenia Kwotum" className={styles.steps}>
            {implementationStages.map((stage, index) => (
              <li data-agency-method-step key={stage.title}>
                <div className={styles.marker}>
                  <span className={styles.number}>0{index + 1}</span>
                  <span aria-hidden="true" className={styles.icon}>
                    <PanelNavigationIcon name={stage.icon} />
                  </span>
                </div>

                <div className={styles.stageTitle}>
                  <span>{stage.label}</span>
                  <h3>{stage.title}</h3>
                  <p>
                    Odpowiada: <strong>{stage.owner}</strong>
                  </p>
                </div>

                <p className={styles.description}>{stage.description}</p>

                <div className={styles.result}>
                  <span>Rezultat etapu</span>
                  <strong>{stage.result}</strong>
                </div>
              </li>
            ))}
          </ol>

          <div className={styles.rules} data-agency-method-rules>
            <p>Zasada systemu</p>
            <dl>
              {implementationRules.map(([term, description]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
