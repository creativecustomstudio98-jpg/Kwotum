# M2 — pasek kontekstu i nawigacja kontekstowa

**Status:** PASS techniczny, 19/20; kandydat do wizualnego odbioru właściciela  
**Data:** 2026-08-26  
**Zakres:** wyłącznie M2; M4 nie został rozpoczęty

## Trasy i chroniony stan

Główne dowody wizualne obejmują tenantowe trasy
`/panel/[organizationId]/ustawienia`, `/powiadomienia`, `/prywatnosc`,
`/integracje/wordpress` i `/integracje/webhooki`. Wspólny pasek kontekstu oraz
page intro zastosowano także w zwykłych stronach panelu i ich stanach
loading/error. Szczegół leada oraz builder pozostają odseparowanymi
workspace'ami bez drugiego nagłówka.

Test korzysta z syntetycznego Ownera i danych jednej organizacji. Zakładka
prywatności wymaga `privacy:manage`, WordPress `wordpress:manage`, a webhooki
`webhook:manage`. Menu powstaje po stronie serwera z bieżącego tenant context;
brak uprawnienia usuwa pozycję zamiast tylko ukrywać ją CSS-em.

## Referencje i środowisko

- główna: `docs/ui/panel-minimal-v1/reference/panel-dashboard-primary-1199x842.png`,
  SHA-256 `824df7d47e16d9114ae66990a0d02e91f4954ce1ba7b5d1c4d180fea84aed6e1`;
  źródło proporcji, niskiego topbara i płaskiej hierarchii;
- pomocnicza:
  `docs/ui/panel-minimal-v1/reference/panel-dashboard-direction-404x316.png`,
  SHA-256 `2cd7db369c2233f08f77b497a2b2e54e5458bf840548c5ba6e791b48518e3b64`;
  wyłącznie kierunek typografii, zakładek i koloru;
- render: macOS 26.5.2, Chromium dostarczony z Playwright 1.61.0, skala 1×,
  lokalny Instrument Sans;
- główne viewporty: 1440 × 900 i 320 × 800; pełny regres obejmuje także
  390 × 844, 768 × 1024, 1024 × 768 i 1536 × 1024.

Treści Kravio/Aiyox, fikcyjne KPI, globalne wyszukiwanie i ozdobne akcje z
referencji nie zostały skopiowane. Obrazy nie służą do pixel diffu 1:1.

## Artefakty

- `before/settings-1440x900.png` i `settings/after-1440x900.png`;
- `before/integrations-1440x900.png` i `integrations/after-1440x900.png`;
- `settings/overlay-50.png` i `integrations/overlay-50.png`;
- `settings/mobile-320x800.png` oraz
  `settings/mobile-keyboard-focus-320x800.png`;
- `settings/notifications-1440x900.png` i `measurements.json`.

Stan `before` Ustawień utrwala dotychczasowy loading boundary. Dlatego jego
overlay służy do oceny zmiany chrome'u, a nie geometrii formularza. Gotowa
treść i proporcje są porównywane na parze Integracji oraz finalnych renderach.

## Punktacja

| Kryterium              |     Wynik | Uzasadnienie                                                               |
| ---------------------- | --------: | -------------------------------------------------------------------------- |
| kompletność regionów   |       4/4 | topbar, intro, menu, ready/loading/error i stany uprawnień                 |
| geometria i proporcje  |       4/4 | topbar 54 px, jedna lewa oś, brak dodatkowego raila ustawień               |
| typografia i spacing   |       4/4 | Instrument Sans, 24/32 tytułu, stały rytm 8–24 px                          |
| gęstość danych i stany |       4/4 | realna treść, bez atrap; aktywność, focus, loading i error są jednoznaczne |
| transformacja mobile   |       3/4 | 320 px bez overflow; długi trzeci label wymaga kontrolowanego scrolla      |
| **Razem**              | **19/20** | minimum 18/20 spełnione                                                    |

## Dziesięć głównych różnic i świadome decyzje

1. Zamiast wysokiego, mieszanego nagłówka działa stały pasek kontekstu 54 px.
2. Tekstowe eyebrow zastąpił prawdziwy breadcrumb „Przegląd → bieżący moduł”.
3. Tytuł i opis są osobnym page intro; każda zwykła trasa ma dokładnie jeden H1.
4. Drugi lewy rail Ustawień zastąpiły trzy płaskie, route-based zakładki.
5. WordPress i Webhooki otrzymały wspólne menu Integracji z jedną aktywną trasą.
6. Aktywność wskazuje tekst i linia 2 px; zieleń nie tworzy kolejnej powierzchni.
7. Loading i error zachowują tenantowy breadcrumb, tytuł, opis oraz menu; stan
   WordPressa zachowuje także prawdziwą akcję przejścia do procesów.
8. Builder i szczegół leada nie dostały globalnego chrome'u ani podwójnego H1.
9. Mobile zachowuje jeden rząd zakładek, przewijanie poziome i cele 44 px.
10. W arkuszu „Więcej” prywatność ma dokładnie jeden stan aktywny; nadrzędne
    Ustawienia nie są równocześnie oznaczone jako bieżąca strona.

Formularze, tabele i karty pozostają w dotychczasowej anatomii, ponieważ ich
przebudowa należy do M4/M5/M9. Widok Integracji celowo zachowuje dużo oddechu,
gdy organizacja ma tylko jedno realne połączenie.

## Dostępność, responsive i funkcje

- klawiatura: Tab przechodzi po zakładkach, focus ostatniej zakładki przewija
  ją do widocznego obszaru, Enter zmienia trasę i `aria-current`;
- axe: 0 naruszeń WCAG 2 A/AA, 2.1 AA i 2.2 AA na ekranie 320 px;
- forced colors + reduced motion: 0 naruszeń axe, aktywny marker pozostaje
  widoczny przez systemowy `Highlight`, bez zależności wyłącznie od zieleni;
- zoom/reflow: równoważny test reflow przy 320 px oraz pełna macierz panelu;
- overflow: dokument 0 px, menu `nowrap`, `overflow-x: auto`, wszystkie trzy
  cele mają 44 px i track jest faktycznie przewijalny;
- loading/error: wspólny `PanelTenantPageHeader` zachowuje tenantowy link
  „Przegląd”, zamiast prowadzić do selektora organizacji.

## Dane, bezpieczeństwo, prywatność i wydajność

M2 nie zmienia zapytań domenowych, wycen, scoringu ani RLS. `organizationRoot`
pochodzi z autoryzowanego layoutu, a osobne capabilities nadal kontrolują każdą
pozycję Integracji i Prywatności. Linki statycznego shellu mają wyłączony
automatyczny prefetch, co usuwa lawinę spekulacyjnych żądań RSC i stabilizuje
autosave buildera. Nie ujawniono sekretów ani PII. Po obrocie webhooka
jednorazowy nowy sekret pozostaje widoczny; numer w istniejącym wierszu SSR
odświeża się przy kolejnej nawigacji — świadomy, nieblokujący kompromis, który
zapobiega utracie action state.

## Testy i rollback

- końcowy test M2: 1/1 PASS, w tym keyboard, mobile, privacy active state,
  axe, forced colors i reduced motion; fixture cleanup: 0;
- pełny bazowy panel E2E: 21/21 PASS; po końcowych korektach M2 test zakresowy
  przeszedł 1/1, a dwa dotknięte długie scenariusze 2/2;
- finalny build: 16/16 PASS; web unit: 178/178 PASS;
- pomiary automatyczne: `measurements.json`.

Dodatkowy pełny rerun po wszystkich kontrolach dotarł do 18/21, po czym
seryjny retry utracił jednorazowy fixture organizacji. Nie wystąpiła regresja
asercji M2; przebieg zatrzymano, aby nie zapętlać środowiska. Sprzątanie zostało
wykonane osobno i potwierdziło `0|0|0` dla organizacji, kont i osieroconych
obiektów. Pełny gate zostanie ponownie wykonany przy konsolidacji M10.

Rollback uruchamia regresja tenant scope/capabilities, podwójny H1, błędny
`aria-current`, niedziałająca klawiatura, overflow dokumentu >1 px albo wynik
poniżej 18/20. Cofnięcie obejmuje wyłącznie komponenty nagłówka, model menu i
reguły M2; zaakceptowane M1/M3, dane i autoryzacja pozostają nietknięte.
