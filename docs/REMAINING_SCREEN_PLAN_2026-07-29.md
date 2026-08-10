# Plan domknięcia pozostałych ekranów — 2026-07-29

**Status:** zakończony Etap 12S  
**Źródło geometrii:** `references/product-app-board.png` oraz obrazy z
`docs/ui/lorum-product-ui-reference-v1/reference/screenshots/`  
**Viewport referencyjny:** 1536 × 1024; transformacje kontrolne: 1024 × 768,
768 × 1024, 390 × 844 i 320 × 800.

## Granica etapu

Etap domyka wszystkie brakujące lub wyraźnie odstające wizualnie powierzchnie,
które mają istniejący model danych albo mogą być zbudowane na realnym stanie
produktu. Nie dodaje atrap, pustych integracji, pozornych ustawień ani funkcji
spoza `SCOPE.md`.

| Powierzchnia             | Trasa / stan                        | Stan przed 12S                                  | Decyzja 12S                                                                                                             | Referencja                                         |
| ------------------------ | ----------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Dashboard                | `/panel/[organizationId]`           | zamknięty                                       | bez zmian                                                                                                               | `dashboard-*`                                      |
| Leady                    | `/leady`                            | zamknięty                                       | bez zmian                                                                                                               | `leads-*`                                          |
| Szczegóły leada          | `/leady/[leadId]`                   | zamknięty                                       | bez zmian                                                                                                               | `lead-detail-*`                                    |
| Procesy                  | `/procesy`                          | zamknięty                                       | bez zmian                                                                                                               | plansza produktu                                   |
| Builder i podgląd        | `/procesy/[flowId]`                 | zamknięty                                       | dodać wyłącznie wejście do instalacji                                                                                   | `builder-*`, `rules-desktop`                       |
| Szablony                 | `/szablony`                         | zamknięty                                       | bez zmian                                                                                                               | `templates-desktop`                                |
| Analityka                | `/analityka`                        | zamknięty                                       | bez zmian                                                                                                               | `analytics-desktop`                                |
| Instalacja               | `/procesy/[flowId]/instalacja`      | brak trasy                                      | zbudować z realnego `published_flows`, kodów embed, hosted linku i stanu WordPress                                      | `installation-desktop`                             |
| Integracje               | `/integracje/wordpress`             | działająca, lecz zbyt wąska i w starym układzie | przebudować pełną szerokość, zachować token jednorazowy, listę połączeń i unieważnienie                                 | `integrations-desktop`                             |
| Ustawienia organizacji   | `/ustawienia`                       | brak trasy                                      | dodać bezpieczną zmianę nazwy oraz tenantowy profil organizacji                                                         | `settings-desktop`                                 |
| Dane i prywatność        | `/prywatnosc`                       | działająca, lecz zbyt wąska i w starym układzie | włączyć do wspólnej nawigacji ustawień i dopasować geometrię                                                            | `settings-desktop`                                 |
| Powiadomienia            | `/powiadomienia`                    | brak trasy, istnieją realne dostawy             | pokazać rzeczywiste reguły systemowe, statusy i ostatnie dostawy; bez nieistniejących przełączników preferencji         | plansza produktu + analogia `integrations-desktop` |
| Onboarding               | `/start`                            | brak trasy                                      | zbudować launchpad oparty na realnej organizacji, procesach, publikacji i instalacji; postęp wynika z danych domenowych | `onboarding-*`                                     |
| Widget — pytanie         | `/f/[publicId]`                     | funkcjonalny, ale za mały i wizualnie odłączony | przebudować desktop/mobile na pełną powierzchnię procesu                                                                | `widget-desktop`, `widget-mobile`                  |
| Widget — wynik i kontakt | stan `/f/[publicId]`                | funkcjonalny, lecz niespójny z referencją       | ujednolicić wynik, cenę, disclaimer, kontakt i potwierdzenie                                                            | `widget-result-desktop`                            |
| Auth                     | `/logowanie`, `/rejestracja`, reset | wdrożony; brak pełnego raportu 12K              | wykonać brakujący odbiór bez redesignu                                                                                  | referencja auth z Etapu 12K                        |

## Świadome wyłączenia

- `clients-desktop.png` opisuje rozwinięty moduł agency/klientów. Natywne CRM-y,
  white-label, billing i delegacja są po MVP; ekran nie powstaje bez modelu
  danych i uprawnień.
- Branding, domeny, zespół, API keys i billing nie dostaną pustych kategorii ani
  martwych przycisków. Ich implementacja wymaga osobnego etapu domenowego.
- Widoczne na starszej planszy przełączniki preferencji powiadomień nie mają
  tabeli konfiguracji. Etap pokazuje prawdziwy stan dostaw, a nie pozorne toggle.
- Nazwa prezentacyjna pozostaje **Lorum**. Identyfikatory kompatybilności
  `@wyceno/*`, `<wyceno-widget>` i `wyceno:*` pozostają bez zmian.

## Kontrakt funkcjonalny

- Każdy odczyt i zapis panelu wymaga aktywnego tenant context.
- Zmiana nazwy organizacji wymaga `organization:update`, walidacji po stronie
  serwera i istniejącego audytu bazy.
- Instalacja ujawnia wyłącznie publiczny identyfikator opublikowanego procesu.
  Sekrety i tokeny WordPress nigdy nie trafiają do kodu embed.
- Onboarding nie utrzymuje równoległego stanu. Krok jest ukończony wtedy, gdy
  istnieje odpowiadający mu rekord organizacji, draft, publikacja albo kanał
  instalacji.
- Powiadomienia są tylko do odczytu; dane pochodzą z tenantowych tabel
  `notifications` i `notification_delivery_attempts`.
- Widget zachowuje produkcyjny silnik sesji, idempotencję, zgody, upload i wynik
  potwierdzany przez serwer.

## Visual QA i gate

1. Zachować `reference`, `before`, `after-v1`, `after-final`, `overlay` i
   `difference` w `artifacts/visual-qa/12s-remaining-screens/`.
2. Sprawdzić 1536/1024/768/390/320 px, brak poziomego overflow, 200% zoom,
   reduced motion i forced colors.
3. Przejść klawiaturą przez ustawienia, instalację, onboarding oraz pełny widget.
4. Uruchomić axe dla nowych powierzchni i widgetu.
5. Uruchomić Prettier dla zmienionych plików, lint, typecheck, pełne testy,
   security scan i build.

## Wynik odbioru

- Powstały realne trasy ustawień organizacji, aktywności powiadomień,
  instalacji procesu i onboardingowego launchpadu.
- Integracja WordPress, prywatność i publiczny widget używają pełnego
  workspace oraz wspólnego języka Lorum. Sidebar pozostaje jeden, zwijany
  i zachowuje nawigację mobilną.
- Ustawienia respektują `organization:update`: tylko właściciel może zmienić
  nazwę, a role bez `privacy:manage` nie dostają martwego linku do prywatności.
- Instalacja ujawnia wyłącznie publiczne ID i działające tryby inline, popup,
  fullscreen oraz hosted. Onboarding wyprowadza każdy krok z rekordów domeny.
- Powiadomienia pokazują realne tenantowe dostawy z maskowaniem adresów,
  poprawną semantyką i dostępną z klawiatury tabelą.
- E2E obejmuje 1536, 1440, 1024, 768, 390 i 320 px, axe, reduced motion,
  forced colors, klawiaturę, offline, upload, popup i brak overflow.
- Artefakty `reference`, `before`, `after`, `overlay` i `difference` są w
  `artifacts/visual-qa/12s-remaining-screens/`.
- Lint, typecheck, unit, PostgreSQL RLS, WordPress, build, Prettier oraz
  lokalne skany SAST/sekretów przechodzą. Zewnętrzny refresh advisories npm
  wymaga osobnej zgody na wysłanie metadanych pakietów do rejestru.
