import type { Metadata } from "next";

import { AUTH_PRIVACY_VERSION } from "../../../lib/auth/legal-consent";
import { Breadcrumbs } from "../components";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Informacja prywatności",
};

export default function PrivacyPage() {
  return (
    <div className="marketing-container legal-page">
      <Breadcrumbs items={[{ href: "/", label: "Start" }, { label: "Informacja prywatności" }]} />
      <header>
        <p className="wy-kicker marketing-eyebrow">Wersja {AUTH_PRIVACY_VERSION}</p>
        <h1 className="wy-marketing-heading-1">Informacja prywatności dla konta Kwotum</h1>
        <p>
          To techniczny zakres informacji dla wersji walidacyjnej. Dane administratora, kontakt
          prywatności i finalna lista podmiotów przetwarzających muszą zostać uzupełnione przed
          publicznym uruchomieniem.
        </p>
      </header>
      <section>
        <h2 className="wy-marketing-heading-2">Dane konta</h2>
        <p>
          Rejestracja przetwarza adres e-mail, imię i nazwisko, nazwę organizacji, wersję
          zaakceptowanych dokumentów oraz techniczne dane sesji. Hasło obsługuje Supabase Auth i nie
          jest zapisywane w tabelach produktu.
        </p>
      </section>
      <section>
        <h2 className="wy-marketing-heading-2">Cel i dostęp</h2>
        <p>
          Dane są potrzebne do uwierzytelnienia, utworzenia profilu i kontrolowanego przypisania
          pierwszej organizacji. Dostęp do danych organizacji jest ograniczony rolą, tenant scope i
          RLS.
        </p>
      </section>
      <section>
        <h2 className="wy-marketing-heading-2">Google</h2>
        <p>
          Wybranie Google rozpoczyna zewnętrzne uwierzytelnienie. Kwotum otrzymuje dane profilu
          zwrócone przez providera, ale utworzenie organizacji nadal wymaga świadomego podania jej
          nazwy i zaakceptowania dokumentów.
        </p>
      </section>
      <section>
        <h2 className="wy-marketing-heading-2">Prawa i retencja</h2>
        <p>
          Mechanizmy eksportu, usunięcia, retencji i legal hold są ograniczone uprawnieniami Ownera.
          Formalny kanał realizacji praw osoby musi zostać wskazany przed publicznym startem.
        </p>
      </section>
    </div>
  );
}
