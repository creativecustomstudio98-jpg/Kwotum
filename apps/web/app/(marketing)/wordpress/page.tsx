import Link from "next/link";

import { marketingMetadata } from "../../../lib/marketing/metadata";
import { Breadcrumbs, CtaBand } from "../components";

export const metadata = marketingMetadata(
  "Kwalifikacja zapytań w WordPress — bez danych leadów w CMS",
  "Osadź proces Kwotum na stronie WordPress przez cienki konektor bez przechowywania leadów i sekretów we froncie.",
  "/wordpress",
);

export default function WordPressPage() {
  return (
    <>
      <div className="marketing-container marketing-page-hero">
        <Breadcrumbs items={[{ href: "/", label: "Start" }, { label: "WordPress" }]} />
        <div className="marketing-page-hero__grid">
          <div className="marketing-page-hero__copy">
            <p className="wy-kicker marketing-eyebrow">WordPress</p>
            <h1>Kalkulator na stronie. Dane leadów poza WordPressem.</h1>
            <p>
              Cienka wtyczka łączy stronę z opublikowanym procesem i osadza go jako shortcode, blok
              albo popup. Panel Kwotum pozostaje źródłem danych.
            </p>
            <div className="marketing-actions">
              <Link className="marketing-button" href="/funkcje/widget-na-strone">
                Poznaj widget
              </Link>
              <Link className="marketing-button marketing-button--secondary" href="/dla-agencji">
                Zobacz model dla agencji
              </Link>
            </div>
          </div>
          <aside className="marketing-page-hero__aside">
            <strong>Konektor ukończony lokalnie</strong>
            <span>
              Publiczna dystrybucja nastąpi dopiero po audycie bezpieczeństwa i bramce produkcyjnej.
              Strona nie udaje gotowego release’u.
            </span>
          </aside>
        </div>
      </div>

      <section className="marketing-section marketing-section--surface">
        <div className="marketing-container">
          <div className="marketing-section__heading">
            <p className="wy-kicker marketing-eyebrow">Architektura integracji</p>
            <h2>Wąskie połączenie zamiast drugiej bazy leadów.</h2>
          </div>
          <ol className="wordpress-flow">
            <li>
              <span>01</span>
              <strong>WordPress</strong>
              <p>Shortcode, blok albo popup wybiera publiczny identyfikator procesu.</p>
            </li>
            <li>
              <span>02</span>
              <strong>Izolowany widget</strong>
              <p>Shadow DOM chroni interfejs przed stylami motywu.</p>
            </li>
            <li>
              <span>03</span>
              <strong>Kwotum</strong>
              <p>Odpowiedzi, pliki, wynik i lead trafiają do właściwego tenanta.</p>
            </li>
          </ol>
          <p className="wordpress-flow__boundary">
            Credential konektora pozostaje poza HTML i JavaScriptem strony. WordPress nie
            przechowuje leadów.
          </p>
        </div>
      </section>

      <section className="marketing-section">
        <div className="marketing-container">
          <div className="marketing-section__heading">
            <p className="wy-kicker marketing-eyebrow">Gotowy zakres konektora</p>
            <h2>Mała powierzchnia, jawne kontrole bezpieczeństwa.</h2>
          </div>
          <ul className="marketing-list">
            <li>Capability i nonce dla każdej operacji administracyjnej</li>
            <li>Escaping konfiguracji i brak sekretu w kodzie publicznym</li>
            <li>Shortcode, blok Gutenberg, popup i diagnostyka połączenia</li>
            <li>Testy wspieranych wersji WordPress/PHP oraz konfliktów globalnych</li>
            <li>Bezpieczne odłączenie bez usuwania danych produktu</li>
          </ul>
        </div>
      </section>

      <CtaBand
        description="Konektor przeszedł lokalne testy. Publiczny release nadal wymaga audytu Etapu 12 i gotowości produkcyjnej Etapu 13."
        title="Bezpieczny konektor bez przenoszenia danych do CMS."
      />
    </>
  );
}
