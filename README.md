# Kwotum

**Konfigurator zapytań i orientacyjnych wycen dla firm usługowych.**

Kwotum prowadzi klienta przez pytania o zakres usługi, oblicza orientacyjną wycenę i przekazuje firmie uporządkowany lead. Repozytorium obejmuje panel firmy, osadzany widget, API, model danych i integrację z WordPressem.

Projekt rozwijany przez **Custom Studio**. Stos: **TypeScript · Next.js · React · PostgreSQL / Supabase · Web Components**.

## Przegląd kodu — od czego zacząć

Poniższe moduły pokazują logikę biznesową, kontrolę dostępu i obsługę błędów wraz z testami.

| Obszar | Implementacja | Testy |
| --- | --- | --- |
| Silnik wyceny: kwoty w jednostkach najmniejszych, jawne zaokrąglenia, kolejność reguł i scoring | [estimation.ts](packages/validation/src/estimation.ts) | [estimation.test.ts](packages/validation/src/estimation.test.ts) |
| Uprawnienia ról i izolacja danych organizacji | [tenancy.ts](packages/database/src/tenancy.ts) | [tenant_isolation.sql](supabase/tests/tenant_isolation.sql) |
| Widget: sesja, przejścia, zapis odpowiedzi i odzyskiwanie stanu | [controller.ts](packages/widget/src/controller.ts) | [controller.test.ts](packages/widget/src/controller.test.ts) |
| Webhooki: walidacja adresów, ochrona przed SSRF i przypięcie adresu po rozwiązaniu DNS | [security.ts](apps/web/lib/webhooks/security.ts), [transport.ts](apps/web/lib/webhooks/transport.ts) | [security.test.ts](apps/web/lib/webhooks/security.test.ts) |
| Powiadomienia: przetwarzanie kolejki i ponawianie dostarczenia | [worker.ts](apps/web/lib/notifications/worker.ts) | [worker.test.ts](apps/web/lib/notifications/worker.test.ts) |

Szerszy kontekst: [architektura](docs/ARCHITECTURE.md), [decyzje techniczne](docs/DECISIONS.md), [zasady bezpieczeństwa](docs/SECURITY.md).

## Funkcje

- Edytor procesów z wersjonowaniem i publikacją formularzy.
- Widget jako Web Component z Shadow DOM: inline, popup i fullscreen oraz osobny link do formularza.
- Sesje, autosave, wznowienie i kolejka odpowiedzi na wypadek utraty sieci.
- Serwerowa wycena i kwalifikacja zapytania na podstawie przypiętej wersji procesu.
- Panel leadów, role użytkowników i izolacja danych organizacji przez PostgreSQL Row Level Security.
- Prywatne załączniki, zgody, historia operacji i powiadomienia z kolejką outbox.
- Analityka oparta na zgodzie, webhooki i konektor WordPress.

## Architektura repozytorium

Monorepo pnpm + Turborepo rozdziela aplikacje od współdzielonych pakietów.

```text
apps/web                 panel, marketing i API w Next.js
apps/widget-demo         środowisko integracyjne widgetu
apps/wordpress-plugin    konektor WordPress w PHP
packages/validation      schematy wejścia i referencyjny silnik wyceny
packages/database        typy danych i reguły uprawnień
packages/widget          renderer i kontroler widgetu
packages/ui              komponenty i tokeny interfejsu
packages/email           szablony i kontrakty powiadomień
packages/analytics       kontrakty zdarzeń
packages/config          konfiguracja i walidacja środowiska
packages/types           współdzielone typy domenowe
packages/testing         fabryki danych i narzędzia testowe
supabase                 migracje, seed i testy SQL
tests/e2e                scenariusze Playwright
```

Walidacja i autoryzacja odbywają się po stronie serwera. Publiczny widget nie ustala ceny ani prywatnego scoringu. Dane organizacji są chronione zarówno kontrolą uprawnień aplikacji, jak i politykami RLS w bazie.

## Uruchomienie lokalne

Wymagania: Node.js **24.18.0**, pnpm **11.17.0** i Git. Wersje narzędzi i zależności są przypięte w repozytorium.

```bash
git clone https://github.com/creativecustomstudio98-jpg/Kwotum.git
cd Kwotum
corepack enable
corepack prepare pnpm@11.17.0 --activate
pnpm install --frozen-lockfile
pnpm dev
```

Strony marketingowe można przeglądać pod `http://localhost:3000` bez podłączenia bazy. Logowanie, panel i rzeczywiste zapytania wymagają własnego środowiska Supabase.

Konfigurację aplikacji web umieść w ignorowanym pliku `apps/web/.env.local`, korzystając z [.env.example](.env.example). Pełne kroki konfiguracji lokalnego Supabase i migracji opisuje [instrukcja deweloperska](docs/DEVELOPMENT.md). Używaj osobnego środowiska deweloperskiego i danych syntetycznych.

## Testy i kontrola jakości

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:rls
pnpm test:wordpress
pnpm build
pnpm e2e
```

- **Vitest**: logika domenowa, walidacja, uprawnienia, widget i moduły serwera.
- **PostgreSQL**: izolacja organizacji, polityki RLS i operacje na danych.
- **Playwright + axe**: przepływy użytkownika, klawiatura, dostępność i regresje wizualne.
- **GitHub Actions**: [konfiguracja CI](.github/workflows/ci.yml), skan sekretów i kontrole bezpieczeństwa.

Testy SQL wymagają PostgreSQL 17 lub osobnej pustej bazy testowej; testy konektora wymagają PHP. Przed pierwszym uruchomieniem E2E zainstaluj Chromium przez `pnpm exec playwright install chromium`. Szczegóły środowiska znajdują się w [DEVELOPMENT.md](docs/DEVELOPMENT.md).

Konfiguracja testów nie jest deklaracją aktualnego zielonego przebiegu. Wyniki zdalnych uruchomień są dostępne w zakładce [Actions](https://github.com/creativecustomstudio98-jpg/Kwotum/actions); historyczne wyniki i ograniczenia opisuje [backlog](docs/TASKS.md).

## Status i dokumentacja

Kwotum jest rozwijanym produktem. Repozytorium pokazuje zaimplementowane moduły; gotowość konkretnego wdrożenia zależy także od konfiguracji infrastruktury i spełnienia [checklisty wydania](docs/RELEASE_CHECKLIST.md).

- [Indeks dokumentacji](docs/INDEX.md) — mapa aktualnych źródeł.
- [Architektura](docs/ARCHITECTURE.md) — podział odpowiedzialności.
- [Środowisko deweloperskie](docs/DEVELOPMENT.md) — instalacja, konfiguracja i testy.
- [Zadania i ograniczenia](docs/TASKS.md) — stan prac.
- [Współpraca](CONTRIBUTING.md) i [zasady pracy](AGENTS.md).

Wyceno i Lorum to wcześniejsze nazwy projektu, nadal występujące w historycznej dokumentacji. Identyfikatory `@wyceno/*`, nazwa custom elementu i kontrakty integracji pozostają stabilne dla zgodności; aktualna nazwa produktu to **Kwotum**.
