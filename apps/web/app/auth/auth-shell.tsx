import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { AuthIcon, type AuthIconName } from "./auth-icons";

type AuthMode = "login" | "register";

const benefits: ReadonlyArray<
  Readonly<{ description: string; icon: AuthIconName; title: string }>
> = [
  {
    description: "Zbieraj tylko kluczowe informacje od klientów.",
    icon: "process",
    title: "Szybsza kwalifikacja",
  },
  {
    description: "Otrzymuj leady czytelnie dopasowane do oferty.",
    icon: "location",
    title: "Lepsze dopasowanie",
  },
  {
    description: "Pracuj na kompletnym briefie zamiast luźnej wiadomości.",
    icon: "analytics",
    title: "Więcej gotowych rozmów",
  },
  {
    description: "Analizuj, optymalizuj i rozwijaj swój proces.",
    icon: "support",
    title: "Pełna kontrola",
  },
];

const foundations: ReadonlyArray<
  Readonly<{ description: string; icon: AuthIconName; title: string }>
> = [
  {
    description: "Buduj formularze z gotowych sekcji.",
    icon: "process",
    title: "Szybka konfiguracja",
  },
  {
    description: "Śledź wyniki i poprawiaj proces.",
    icon: "analytics",
    title: "Analityka na bieżąco",
  },
  {
    description: "Osadź formularz na stronie i w WordPressie.",
    icon: "integrations",
    title: "Integracje",
  },
  {
    description: "Dostęp zgodny z rolą w organizacji.",
    icon: "shield",
    title: "Bezpieczne dane",
  },
  {
    description: "Wersjonuj formularz bez chaosu.",
    icon: "check",
    title: "Rozwijaj proces",
  },
];

const modeContent: Record<
  AuthMode,
  Readonly<{
    description: string;
    illustration: string;
    illustrationAlt: string;
    securityDescription: string;
    securityTitle: string;
    title: string;
  }>
> = {
  login: {
    description: "Zaloguj się do swojego konta i zarządzaj leadami.",
    illustration: "/auth-login-product-v2.png",
    illustrationAlt:
      "Warstwowy podgląd buildera formularza, analityki i uporządkowanej listy leadów.",
    securityDescription: "Sesje i dane organizacji są chronione od pierwszego logowania.",
    securityTitle: "Twoje dane są bezpieczne",
    title: "Witaj ponownie",
  },
  register: {
    description: "Utwórz konto firmy i rozpocznij konfigurację procesu.",
    illustration: "/auth-register-product-v2.png",
    illustrationAlt:
      "Trzy etapy konfiguracji: potwierdzenie, organizacja i uruchomienie formularza.",
    securityDescription: "Organizacja powstaje w kontrolowanym, prywatnym zakresie.",
    securityTitle: "Bezpieczna rejestracja",
    title: "Załóż konto",
  },
};

function Brand({ inverse = false }: Readonly<{ inverse?: boolean }>) {
  return (
    <Link
      aria-label="Kwotum — strona główna"
      className={inverse ? "auth-brand auth-brand--inverse" : "auth-brand"}
      href="/"
    >
      <span className="auth-brand__mark" aria-hidden="true">
        <Image alt="" height={28} src="/Logoicon.svg" width={28} />
      </span>
      <span>Kwotum</span>
    </Link>
  );
}

function BenefitsPanel() {
  return (
    <aside aria-labelledby="auth-benefits-title" className="auth-benefits">
      <h2 id="auth-benefits-title">Dlaczego Kwotum?</h2>
      <div className="auth-benefits__list">
        {benefits.map((benefit) => (
          <article className="auth-benefit" key={benefit.title}>
            <span className="auth-icon-tile">
              <AuthIcon name={benefit.icon} />
            </span>
            <div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          </article>
        ))}
      </div>
      <blockquote className="auth-proof">
        <span aria-hidden="true">“</span>
        <p>Każde zapytanie trafia do zespołu jako czytelny, uporządkowany brief.</p>
        <footer>Standard pracy Kwotum</footer>
      </blockquote>
    </aside>
  );
}

function Foundations() {
  return (
    <section aria-labelledby="auth-foundations-title" className="auth-foundations">
      <h2 id="auth-foundations-title">Wszystko, czego potrzebujesz w jednym miejscu</h2>
      <div className="auth-foundations__grid">
        {foundations.map((foundation) => (
          <article className="auth-foundation" key={foundation.title}>
            <span className="auth-icon-tile auth-icon-tile--large">
              <AuthIcon name={foundation.icon} />
            </span>
            <div>
              <h3>{foundation.title}</h3>
              <p>{foundation.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AuthShell({ children, mode }: Readonly<{ children: ReactNode; mode: AuthMode }>) {
  const content = modeContent[mode];
  return (
    <main className={`auth-page auth-page--${mode}`}>
      <section
        aria-label={mode === "login" ? "Logowanie do Kwotum" : "Rejestracja w Kwotum"}
        className="auth-frame"
      >
        <aside className="auth-brand-panel">
          <Brand inverse />
          <div className="auth-brand-panel__copy">
            <h2>{content.title}</h2>
            <p>{content.description}</p>
          </div>
          <div className={`auth-illustration auth-illustration--${mode}`}>
            <Image
              alt={content.illustrationAlt}
              height={1536}
              priority
              sizes="(max-width: 760px) 180px, (max-width: 1100px) 240px, 400px"
              src={content.illustration}
              width={1024}
            />
          </div>
          <div className="auth-security">
            <AuthIcon name="shield" />
            <div>
              <strong>{content.securityTitle}</strong>
              <p>{content.securityDescription}</p>
            </div>
          </div>
        </aside>

        <section className="auth-form-panel">{children}</section>
        <BenefitsPanel />
      </section>
      <Foundations />
    </main>
  );
}
