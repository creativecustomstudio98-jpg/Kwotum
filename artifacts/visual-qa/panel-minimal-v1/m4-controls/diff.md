# M4 — wspólne formularze i kontrolki

## Wynik

PASS, 20/20 dla zakresu M4. Odbiór dotyczy wspólnego systemu kontrolek oraz
jego użycia w Ustawieniach, Prywatności i Integracjach. Nie obejmuje układu
list (M5), szczegółu leada (M6), buildera (M7), analityki (M8) ani pełnej
rekompozycji treści tych ekranów (M9).

| Kryterium                      | Punkty |
| ------------------------------ | -----: |
| kompletność kontrolek i stanów |    4/4 |
| geometria i proporcje          |    4/4 |
| typografia i spacing           |    4/4 |
| gęstość danych i komunikaty    |    4/4 |
| transformacja mobile           |    4/4 |

## Trasy i chroniony stan

- `/panel/:organizationId/ustawienia` — Owner, syntetyczna organizacja;
- `/panel/:organizationId/prywatnosc` — Owner, syntetyczna polityka retencji;
- `/panel/:organizationId/integracje/wordpress` — Owner, syntetyczne połączenie;
- formularz webhooka został zmigrowany kodowo i objęty typecheck/lint; pełne
  operacje sieciowe pozostają pod istniejącą ochroną serwerową.

Test korzystał wyłącznie z jednorazowego tenanta i użytkownika. Cleanup po
każdym uruchomieniu potwierdził brak pozostałości danych i Storage.

## Referencje

Główna referencja:
`docs/ui/panel-minimal-v1/reference/panel-dashboard-primary-1199x842.png`,
SHA-256 `824df7d47e16d9114ae66990a0d02e91f4954ce1ba7b5d1c4d180fea84aed6e1`.
Użyty region: kontrolki daty, wyszukiwania, filtrów, zakładek i akcje tabeli.
Rola: cienkie granice, małe promienie, neutralna baza i oszczędny kolor.

Pomocnicza referencja:
`docs/ui/panel-minimal-v1/reference/panel-dashboard-direction-404x316.png`,
SHA-256 `2cd7db369c2233f08f77b497a2b2e54e5458bf840548c5ba6e791b48518e3b64`.
Użyta wyłącznie jako kierunek typografii, zakładek i koloru, bez pomiaru 1:1.
Treści, marki, KPI i funkcje demonstracyjne nie były instrukcją.

## Platforma i geometria

- macOS, Chromium Playwright, skala 1;
- główny desktop: 1440 × 900;
- reprezentatywny mobile: 320 × 800;
- macierz: 375 × 812, 390 × 844, 430 × 932, 720 × 900 jako reflow
  odpowiadający 200%, 768 × 1024, 1024 × 768, 1280 × 800 i 1536 × 1024;
- pole: wysokość 47,58 px, border 1 px, radius 8 px;
- fokus pola: outline 2 px w semantycznym kolorze focus;
- switch: 42 × 24 px, knob 18 px, przesunięcie 18 px;
- mobile label switcha: 65,28 px;
- overflow dokumentu: 0 px na całej macierzy.

## Dziesięć głównych różnic przed/po

1. Formularze używają jednego `FormField` zamiast lokalnych kombinacji label,
   small i surowego inputa.
2. Wszystkie pola tekstowe, selecty i textarea mają wspólne 8 px radius i
   border 1 px.
3. Fokus pola jest jednoznaczny i nie zależy od lokalnej strony.
4. Disabled/read-only mają neutralną powierzchnię i zachowują czytelność.
5. Button loading zachowuje szerokość etykiety, blokuje ponowne wysłanie i ma
   osobną nazwę dostępną.
6. Komunikaty error/success są jednym komponentem obok właściwej akcji lub
   pola, z poprawnym `alert`/`status`.
7. Retencja używa wspólnego switcha z natywnym checkboxem i rolą `switch`
   zamiast lokalnego CSS strony.
8. WordPress i webhook używają tych samych Input/FormField/Button co
   Ustawienia.
9. Segmented control i menu zostały dodane do biblioteki z obsługą strzałek,
   Home, End, Escape, disabled oraz zwrotem fokusu.
10. Usunięto konkurencyjne lokalne promienie i geometrię kontrolek w
    Ustawieniach, Prywatności i Integracjach; pozostawiono wyłącznie layout.

## Świadome odstępstwa

- Referencja nie jest formularzem ustawień, więc nie wykonujemy pixel-perfect
  dopasowania jej treści. Steruje językiem kontrolek i proporcjami.
- Karty i układ treści ekranów pozostają do M9. M4 nie rozszerzał zakresu o
  dekoracyjne porządki ani nowe ustawienia.
- Builder zachowuje dotychczasowe kontrolki do M7, aby nie mieszać zmian z
  autosave, undo/redo i publikacją.

## QA i testy

- UI component tests: 38/38;
- M4 Playwright: 1/1;
- axe desktop Ustawienia, desktop Prywatność, forced colors i mobile: 0
  naruszeń;
- klawiatura: switch Space, segmented arrows/Home/End, tabs
  arrows/Home/End, menu ArrowUp/ArrowDown/Home/End/Escape i focus return;
- reduced motion: aktywne w całym E2E;
- forced colors: switch i aktywny segment zachowują systemowe kolory;
- responsive/reflow: 0 px overflow na macierzy 320–1536;
- lint UI/web: PASS;
- typecheck UI/web: PASS;
- build: 16/16;
- `git diff --check`: PASS.

## Wpływ na dane, bezpieczeństwo, prywatność i wydajność

Nie zmieniono server actions, walidacji, RLS, tenant scope, capabilities,
cache ani routingu. Disabled pozostaje wyłącznie stanem prezentacji, a
autoryzacja nadal odbywa się po stronie serwera. Nie dodano zależności,
żądań sieciowych, zewnętrznych fontów ani danych klientów. Wzrost kodu to
wyłącznie współdzielone komponenty i ich testy; build nie przekroczył budżetu
widgetu.

## Rollback

Rollback jest wymagany, jeśli formularz utraci nazwę dostępną, opis lub stan,
switch przestanie być natywnym checkboxem, klawiatura nie będzie mogła
aktywować kontrolki, pojawi się overflow powyżej 1 px, lokalna strona ponownie
nadpisze promień/geometrię albo test tenantowego działania formularza
przestanie przechodzić. Cofnięcie obejmuje wyłącznie komponenty M4 i ich
migrację; nie wymaga migracji bazy.
