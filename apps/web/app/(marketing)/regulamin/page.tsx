import type { Metadata } from "next";

import { AUTH_TERMS_VERSION } from "../../../lib/auth/legal-consent";
import { Breadcrumbs } from "../components";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Warunki korzystania",
};

export default function TermsPage() {
  return (
    <div className="marketing-container legal-page">
      <Breadcrumbs items={[{ href: "/", label: "Start" }, { label: "Warunki korzystania" }]} />
      <header>
        <p className="wy-kicker marketing-eyebrow">Wersja {AUTH_TERMS_VERSION}</p>
        <h1 className="wy-marketing-heading-1">Warunki korzystania z wersji pilotażowej Kwotum</h1>
        <p>
          Ten dokument opisuje zasady konta firmowego w środowisku walidacyjnym. Dane operatora i
          finalne warunki komercyjne muszą zostać uzupełnione i zatwierdzone przed publicznym
          uruchomieniem.
        </p>
      </header>
      <section>
        <h2 className="wy-marketing-heading-2">Charakter usługi</h2>
        <p>
          Kwotum pomaga budować procesy pytań, kwalifikować zapytania i prezentować orientacyjny
          wynik. Nie tworzy wiążącej oferty, kosztorysu, umowy ani porady prawnej.
        </p>
      </section>
      <section>
        <h2 className="wy-marketing-heading-2">Konto i bezpieczeństwo</h2>
        <p>
          Użytkownik podaje prawdziwe dane służbowe, chroni dostęp do konta i nie udostępnia sesji
          osobom nieuprawnionym. Uprawnienia do danych zależą od aktywnego członkostwa w
          organizacji.
        </p>
      </section>
      <section>
        <h2 className="wy-marketing-heading-2">Dozwolone użycie</h2>
        <p>
          Nie wolno omijać autoryzacji, naruszać separacji organizacji, przesyłać bezprawnych
          materiałów ani używać wyniku jako automatycznej, wiążącej decyzji wobec klienta.
        </p>
      </section>
      <section>
        <h2 className="wy-marketing-heading-2">Wersja pilotażowa</h2>
        <p>
          Funkcje mogą być rozwijane etapowo. Publiczne wdrożenie, płatności i gwarantowany poziom
          dostępności wymagają osobnych, zatwierdzonych warunków.
        </p>
      </section>
    </div>
  );
}
