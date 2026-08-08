import { PanelIcon } from "../../panel/panel-icon";
import { PanelNavigationIcon } from "../../panel/panel-navigation-icon";
import styles from "./agency-isolation.module.css";

const isolationContract = [
  {
    description: "Renderer ładuje się dopiero wtedy, gdy element pojawi się na stronie.",
    label: "Mały loader",
  },
  {
    description: "Kontrolki korzystają z własnego arkusza wewnątrz Shadow DOM.",
    label: "Własne style",
  },
  {
    description: "Host dostaje zdarzenia techniczne, ale nie odpowiedzi ani token sesji.",
    label: "Wąski kontrakt",
  },
] as const;

const widgetOptions = ["Jedna ściana", "W kształcie L", "W kształcie U"] as const;

export function AgencyIsolation() {
  return (
    <section
      aria-labelledby="agency-isolation-title"
      className={styles.section}
      data-agency-isolation
    >
      <div className={`marketing-container ${styles.inner}`}>
        <header className={styles.heading}>
          <div>
            <p className={`wy-kicker marketing-eyebrow ${styles.eyebrow}`}>Izolacja interfejsu</p>
            <h2 id="agency-isolation-title">
              Motyw klienta zostaje na zewnątrz. <span>Widget zachowuje własny interfejs.</span>
            </h2>
          </div>
          <div className={styles.introduction}>
            <p>
              Loader rejestruje natywny element, a jego kontrolki działają wewnątrz Shadow DOM.
              Globalne style WordPressa lub własnego frontendu nie przejmują typografii, pól ani
              układu procesu.
            </p>
            <ul aria-label="Zakres izolacji widgetu">
              <li>inline</li>
              <li>popup</li>
              <li>fullscreen</li>
            </ul>
          </div>
        </header>

        <figure className={styles.proof} data-agency-isolation-proof>
          <figcaption className="wy-sr-only">
            Przykład strony klienta z agresywnym globalnym CSS oraz widgetu zachowującego własne
            style dzięki Shadow DOM.
          </figcaption>

          <header className={styles.proofHeader}>
            <div>
              <span aria-hidden="true" className={styles.proofIcon}>
                <PanelNavigationIcon name="integration" />
              </span>
              <p>
                <small>Podgląd osadzenia</small>
                <strong>Odporność na CSS strony hosta</strong>
              </p>
            </div>
            <span className={styles.testStatus}>
              <PanelIcon aria-hidden="true" name="check" />
              Testowane automatycznie
            </span>
          </header>

          <div className={styles.comparison}>
            <section aria-label="Style strony klienta" className={styles.hostPage}>
              <div className={styles.hostBrowserBar}>
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <code>twoja-strona.pl</code>
              </div>
              <div className={styles.hostContent}>
                <p className={styles.hostLabel}>Motyw klienta</p>
                <h3>Zarezerwuj konsultację</h3>
                <p className={styles.hostDescription}>
                  Globalny arkusz motywu próbuje zmienić każdy przycisk i każde pole.
                </p>
                <div aria-label="Przykładowe reguły CSS hosta" className={styles.hostRules}>
                  <p>
                    <code>*</code>
                    <span>font-family: serif</span>
                  </p>
                  <p>
                    <code>button</code>
                    <span>background: hotpink</span>
                  </p>
                  <p>
                    <code>input</code>
                    <span>border-radius: 0</span>
                  </p>
                </div>
                <span aria-hidden="true" className={styles.hostControl}>
                  Przycisk motywu
                </span>
              </div>
            </section>

            <div aria-hidden="true" className={styles.boundaryRail}>
              <span>
                <PanelIcon name="arrow-right" />
              </span>
              <p>Granica</p>
            </div>

            <section aria-label="Widget odizolowany przez Shadow DOM" className={styles.shadowRoot}>
              <div className={styles.shadowLabel}>
                <span aria-hidden="true">
                  <PanelNavigationIcon name="privacy" />
                </span>
                <p>
                  <small>Shadow root</small>
                  <strong>Style hosta zatrzymane</strong>
                </p>
                <code>&lt;wyceno-widget&gt;</code>
              </div>

              <div className={styles.widgetCard}>
                <header>
                  <span aria-hidden="true" className={styles.widgetMark}>
                    KN
                  </span>
                  <p>
                    <strong>Kuchnia na wymiar</strong>
                    <small>Proces wyceny</small>
                  </p>
                  <span>Postęp zapisany.</span>
                </header>

                <div className={styles.widgetBody}>
                  <div className={styles.progressLabel}>
                    <span>Krok 2 z 6</span>
                    <span>33%</span>
                  </div>
                  <div aria-hidden="true" className={styles.progressTrack}>
                    <span />
                  </div>

                  <p className={styles.widgetEyebrow}>Układ pomieszczenia</p>
                  <h3>Jaki układ kuchni planujesz?</h3>
                  <p className={styles.widgetHint}>Wybierz wariant najbliższy Twojemu wnętrzu.</p>

                  <div aria-label="Przykładowe opcje widgetu" className={styles.widgetOptions}>
                    {widgetOptions.map((option) => (
                      <div
                        className={option === "W kształcie L" ? styles.selected : undefined}
                        key={option}
                      >
                        <span aria-hidden="true" />
                        <strong>{option}</strong>
                        {option === "W kształcie L" ? (
                          <PanelIcon aria-hidden="true" name="check" />
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                <footer>
                  <span>
                    <PanelIcon aria-hidden="true" name="check" />
                    Typografia
                  </span>
                  <span>
                    <PanelIcon aria-hidden="true" name="check" />
                    Kontrolki
                  </span>
                  <span>
                    <PanelIcon aria-hidden="true" name="check" />
                    Odstępy
                  </span>
                </footer>
              </div>
            </section>
          </div>

          <ol aria-label="Kontrakt izolacji widgetu" className={styles.contract}>
            {isolationContract.map((item, index) => (
              <li key={item.label}>
                <span>0{index + 1}</span>
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </figure>
      </div>
    </section>
  );
}
