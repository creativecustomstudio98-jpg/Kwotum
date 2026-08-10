# Lorum

Lorum jest projektowanym SaaS-em do porządkowania i kwalifikacji zapytań dla
firm usługowych. Zbiera zakres, budżet, termin, lokalizację i materiały,
wyjaśnia dopasowanie oraz wskazuje następny krok sprzedażowy. Discovery i fundament techniczny są
udokumentowane. Etap 2 dostarcza dostępną warstwę UI, Etap 3 bazę tenantową i
Auth SSR, Etap 4 wersjonowaną domenę procesów, a Etap 5 izolowany widget z
sesją, autosave i hosted linkiem. Etap 6 dodaje deterministyczny, serwerowy
pricing i prywatny scoring.
Etap 7 domyka kontakt, zgody, prywatne pliki i tenantowy panel leadów, a Etap 8
dodaje transakcyjny outbox oraz dostępne wiadomości HTML/text. Etap 9 dostarcza
analitykę first-party opartą na zgodzie, progi małej próby i tenantowy
dashboard. Etap 10 dodaje statyczny marketing, pięć stron branżowych, pięć
stron funkcyjnych i techniczne SEO.

Nazwa „Lorum” nie została prawnie zweryfikowana. Nie używaj jej jako
potwierdzonego znaku ani nie kupuj materiałów marketingowych przed badaniem
prawnym i domenowym opisanym w `docs/RISKS.md`.

## Zacznij tutaj

1. `AGENTS.md` — obowiązkowe zasady każdej sesji.
2. `docs/PRODUCT_VISION.md` — problem i pozycjonowanie.
3. `docs/SCOPE.md` oraz `docs/NON_GOALS.md` — granice MVP.
4. `docs/ASSUMPTIONS_AND_OPEN_QUESTIONS.md` — jawne założenia i decyzje właściciela.
5. `docs/ARCHITECTURE.md` — docelowa architektura.
6. `docs/TASKS.md` — etapowy backlog i gate’y.
7. `docs/DEVELOPMENT.md` — bootstrap, komendy i troubleshooting.
8. `docs/DEPENDENCIES.md` — decyzje o wersjach i supply chain.
9. `docs/WIDGET_IMPLEMENTATION.md` — kontrakt widgetu i instrukcja osadzenia.
10. `docs/ESTIMATION_ENGINE.md` — model reguł pricingu i scoringu.
11. `docs/LEAD_PIPELINE.md` — submit, pliki, panel leadów i kontrola dostępu.
12. `docs/NOTIFICATIONS.md` — szablony, outbox, worker, retry i test mode.
13. `docs/ANALYTICS_IMPLEMENTATION.md` — zgoda, eventy, agregaty, retencja i dashboard.
14. `docs/MARKETING_IMPLEMENTATION.md` — strony, cennik, SEO, crawl i bramki launchu.

## Status

Etapy 5–8 udostępniają natywny Web Component w trybach inline, popup i
fullscreen, hosted link, allowlistowany manifest, przypięte sesje, autosave,
wznowienie, odporną na utratę sieci kolejkę, serwerowy wynik i atomowy submit.
PostgreSQL sprawdza odpowiedzi i routing, liczy pricing/scoring z immutable
snapshotu oraz izoluje leady, pliki, notatki, statusy i outbox tenantowym RLS.
Powiadomienia HTML/text działają w bezsieciowym test mode z historią prób i
retry. Analityka zapisuje tylko allowlistowane zdarzenia po aktywnej zgodzie,
usuwa je po wycofaniu dla sesji i ukrywa agregaty dla próby mniejszej niż pięć.
Marketing udostępnia 18 prerenderowanych, indeksowalnych stron z crawl testem,
sitemap, robots, canonical, structured data i noindex powierzchni prywatnych.
Lokalny gate z lintem, typami, testami, buildem i Playwrightem jest zielony.
GitHub Actions jest skonfigurowane, lecz konto GitHub nie uruchamia runnerów z
powodu zewnętrznej blokady billingowej.

## Uruchomienie

```bash
corepack enable
corepack prepare pnpm@11.17.0 --activate
pnpm install --frozen-lockfile
pnpm dev
```

Otwórz `http://localhost:3000`, aby zobaczyć landing page. Projekt jest
workspace’em pnpm, dlatego nie używaj `npm run dev`. pnpm uruchamia przypięty
Node 24.18.0 nawet wtedy, gdy systemowy `node --version` wskazuje Node 26.

Logowanie i panel wymagają działającego projektu Supabase oraz wartości
`NEXT_PUBLIC_SUPABASE_URL` i `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` w
`apps/web/.env.local`. Bez nich marketing działa, ale `/logowanie` i `/panel`
celowo kończą się błędem konfiguracji. Pełna instrukcja, w tym wariant lokalny
i hostowany, znajduje się w `docs/DEVELOPMENT.md`.

## Struktura

```text
apps/web                 panel, API i marketing w Next.js
apps/widget-demo         izolowane środowisko integracyjne widgetu
apps/wordpress-plugin    wtyczka konektorowa WordPress
packages/ui              tokeny i komponenty
packages/widget          renderer publicznego procesu
packages/database        schemat, klient i kontrakty danych
packages/validation      schematy wejścia i referencyjny silnik estymacji
packages/email           e-maile transakcyjne
packages/analytics       kontrakty eventów
packages/config          konfiguracja narzędzi
packages/types           typy domenowe bez zależności runtime
packages/testing         fabryki i narzędzia testowe
supabase                 migracje, seed i funkcje
docs                     dokumentacja źródłowa
```

## Zasady

Nie instaluj zależności ani nie implementuj funkcji poza aktywnym etapem.
Sekrety aplikacji web trafiają wyłącznie do lokalnego
`apps/web/.env.local`; kontrakt znajduje się w `.env.example` i
`@wyceno/config`.

## Stabilne identyfikatory techniczne

Pakiety `@wyceno/*`, custom element, eventy, nagłówki API i namespace konektora
pozostają nazwami kompatybilności zgodnie z ADR-024. Nie są widoczną nazwą
produktu i nie należy ich zmieniać bez osobnej migracji kontraktów.
