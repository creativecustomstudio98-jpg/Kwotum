import Link from "next/link";

import { marketingMetadata } from "../../../lib/marketing/metadata";
import { Breadcrumbs } from "../components";

export const metadata = marketingMetadata(
  "Cennik — program pilotażowy Kwotum",
  "Program pilotażowy Kwotum jest wyceniany indywidualnie po ustaleniu jednego procesu. Publiczny model self-service pozostaje w walidacji.",
  "/cennik",
);

const pilotBenefits = [
  "Warsztat i dopasowanie jednego procesu",
  "Konfiguracja pytań, wyniku i kwalifikacji",
  "Widget na stronie albo osobny hosted link",
  "Weryfikacja kompletności briefów i jakości leadów",
  "Wsparcie podczas uzgodnionego pilotażu",
] as const;

const validationFacts = [
  "Kwota miesięczna nie została zatwierdzona",
  "Limity procesów i leadów pozostają otwarte",
  "Płatności samoobsługowe są poza obecnym MVP",
  "Dalszy model zależy od wyników pilotaży",
] as const;

export default function PricingPage() {
  return (
    <>
      <section aria-labelledby="pricing-title" className="pricing-simple-hero" data-pricing-simple>
        <div className="marketing-container">
          <Breadcrumbs items={[{ href: "/", label: "Start" }, { label: "Cennik" }]} />

          <header className="pricing-simple-hero__heading">
            <p className="wy-kicker marketing-eyebrow">Przejrzysty model współpracy</p>
            <h1 id="pricing-title">Najpierw pilotaż. Potem świadoma decyzja.</h1>
            <p>
              Nie publikujemy sztucznych pakietów. Zaczynamy od jednego rzeczywistego procesu,
              ustalamy zakres wdrożenia i dopiero wtedy przygotowujemy indywidualną wycenę.
            </p>
          </header>

          <div
            aria-label="Dwa aktualne modele współpracy"
            className="pricing-simple-plans"
            data-pricing-paths
          >
            <article className="pricing-simple-card pricing-simple-card--pilot">
              <header className="pricing-simple-card__header">
                <span aria-hidden="true" className="pricing-simple-card__icon">
                  <svg fill="none" viewBox="0 0 32 32">
                    <path d="M7 22.5 14 15l4.5 4.5L26 10" />
                    <path d="M19.5 10H26v6.5" />
                  </svg>
                </span>
                <div>
                  <p className="wy-kicker marketing-eyebrow">Program pilotażowy</p>
                  <h2>Wdrożenie z ustalonym zakresem</h2>
                </div>
                <span className="pricing-simple-card__status">Dostępne teraz</span>
              </header>

              <div className="pricing-simple-card__value">
                <strong>Wycena indywidualna</strong>
                <span>po ustaleniu jednego procesu</span>
              </div>

              <p className="pricing-simple-card__description">
                Uruchamiamy jeden realny przepływ i sprawdzamy, czy zebrany brief pozwala zespołowi
                działać bez kolejnej rundy pytań.
              </p>

              <ul aria-label="Zakres programu pilotażowego" className="pricing-simple-card__list">
                {pilotBenefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>

              <Link
                className="marketing-button pricing-simple-card__action"
                href="/jak-dziala#proces"
              >
                Zobacz przebieg pilotażu
              </Link>

              <footer>
                <small>Rezultat</small>
                <strong>Gotowy proces do weryfikacji z klientami</strong>
              </footer>
            </article>

            <article className="pricing-simple-card pricing-simple-card--validation">
              <header className="pricing-simple-card__header">
                <span aria-hidden="true" className="pricing-simple-card__icon">
                  <svg fill="none" viewBox="0 0 32 32">
                    <path d="M8 9.5h16M8 16h16M8 22.5h10" />
                    <circle cx="24" cy="22.5" r="2.5" />
                  </svg>
                </span>
                <div>
                  <p className="wy-kicker marketing-eyebrow">Self-service</p>
                  <h2>Model w trakcie walidacji</h2>
                </div>
                <span className="pricing-simple-card__status">W walidacji</span>
              </header>

              <div className="pricing-simple-card__value">
                <strong>Bez publicznej ceny</strong>
                <span>do czasu zatwierdzenia modelu</span>
              </div>

              <p className="pricing-simple-card__description">
                Nie pokazujemy przyszłego self-service jak gotowego planu. Najpierw oceniamy
                rzeczywiste potrzeby i wyniki programu pilotażowego.
              </p>

              <ul
                aria-label="Otwarte decyzje modelu self-service"
                className="pricing-simple-card__list"
              >
                {validationFacts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>

              <Link
                className="marketing-button marketing-button--secondary pricing-simple-card__action"
                href="/produkt"
              >
                Poznaj obecny produkt
              </Link>

              <footer>
                <small>Stan obecny</small>
                <strong>Brak planu dostępnego do samodzielnego zakupu</strong>
              </footer>
            </article>
          </div>

          <ul aria-label="Zasady programu pilotażowego" className="pricing-simple-assurances">
            <li>Bez fikcyjnych cen</li>
            <li>Bez karty płatniczej</li>
            <li>Decyzja po pilotażu</li>
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="pricing-next-title"
        className="marketing-container pricing-simple-next"
        data-pricing-final-cta
      >
        <div>
          <p className="wy-kicker marketing-eyebrow">Następny krok</p>
          <h2 id="pricing-next-title">Zobacz proces, zanim porozmawiamy o zakresie.</h2>
          <p>
            Przejdź przez architekturę Kwotum albo zaloguj się do istniejącej organizacji. Nie ma tu
            fikcyjnego formularza kontaktowego.
          </p>
        </div>
        <div className="marketing-actions pricing-simple-next__actions">
          <Link className="marketing-button" href="/jak-dziala#proces">
            Zobacz, jak działa
          </Link>
          <Link className="marketing-button marketing-button--secondary" href="/logowanie">
            Przejdź do logowania
          </Link>
        </div>
      </section>
    </>
  );
}
