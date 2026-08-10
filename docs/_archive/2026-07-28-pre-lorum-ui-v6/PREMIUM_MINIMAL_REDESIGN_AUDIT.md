# Audyt premium minimalistycznego redesignu

> **ARCHIVED — nie jest źródłem prawdy.** Zastąpiony przez:
> `docs/INDEX.md`, `docs/DESIGN_SYSTEM.md`, `docs/UI_SCREEN_SPEC.md` i
> `docs/VISUAL_QA.md`.
>
> **Status historyczny:** dokument opisuje Etap 12A i jego ówczesny baseline.
> Nie jest już kontraktem odbioru landing page. Wizualną część zastępują
> ADR-025, Etap 12D i kanoniczne dokumenty wskazane wyżej.

## Zakres i decyzja

Etap obejmuje istniejące powierzchnie prezentacyjne: 18 tras marketingowych,
logowanie, wybór organizacji, listę i szczegóły leadów, analitykę, integrację
WordPress, prywatność, hosted flow, widget, design system oraz strony systemowe.
Nie dodaje nieistniejącego buildera ani onboardingu UI i nie zmienia kontraktów
domenowych, autoryzacji, RLS, routingu ani SEO.

Zatwierdzone tokeny kolorów, promieni i ruchu już odpowiadają kierunkowi z
`PREMIUM_MINIMAL_REDESIGN_PROMPT.md`. Etap porządkuje ich użycie i uzupełnia
brakujące aliasy, ale nie zmienia wartości zatwierdzonych w ADR-011. Nowy ADR
nie jest wymagany.

## Baseline 2026-07-25

- `pnpm format:check` — zielony;
- `pnpm lint` — 8/8 pakietów;
- `pnpm typecheck` — 8/8 pakietów;
- `pnpm test` — 82 testy jednostkowe, pełne testy PostgreSQL/RLS i WordPress
  zielone; PostgreSQL wymaga uruchomienia poza sandboxem ze względu na SHM;
- `pnpm build` — 37 tras, widget 15 888 B gzip przy budżecie 90 KiB;
- 33 screenshoty baseline zapisane w `artifacts/redesign/before` dla 1440,
  1024 i 390 px;
- wszystkie kontrolowane strony bez poziomego overflow; oczekiwany request 404
  jest jedynym błędem konsoli na stronie not-found.

## Inwentaryzacja powierzchni

| Powierzchnia            | Stan przed redesignem               | Decyzja                                                   |
| ----------------------- | ----------------------------------- | --------------------------------------------------------- |
| Landing i 17 podstron   | kompletne, SSR/SSG, wspólny shell   | przebudować rytm i kompozycje bez zmiany allowlisty       |
| Demo marketingowe       | działające, syntetyczne, bez zapisu | zachować jako interakcję; odsunąć z roli głównego mockupu |
| Logowanie               | działające e-mail/hasło             | uprościć kompozycję; nie dodawać atrapy resetu hasła      |
| Panel organizacji       | działające role i przekierowania    | zachować jako punkt wejścia                               |
| Leady                   | lista i szczegóły z realnych danych | tabela desktop/lista mobile; dokumentowy szczegół         |
| Analityka               | realne agregaty i próg małej próby  | ograniczyć „metryczne karty”, zachować dane i stany       |
| WordPress i prywatność  | działające akcje z kontrolą roli    | ujednolicić shell i formularze                            |
| Widget/hosted flow      | inline, popup, fullscreen i hosted  | zmniejszyć radius/cień, zagęścić odpowiedzi               |
| Loading/empty/error/404 | istniejące                          | ujednolicić jako spokojne części widoku                   |
| Builder i onboarding    | domena istnieje, brak tras UI       | poza etapem; nie tworzyć atrap                            |

## Wzorce wymagające usunięcia

1. Hero używa przechylonej karty formularza zamiast produktu jako dużego dowodu.
2. Sekcje powtarzają schemat `eyebrow + nagłówek + trzy identyczne karty`.
3. Branże, funkcje, proces i bezpieczeństwo różnią się głównie tekstem, a nie
   kompozycją wynikającą z treści.
4. Dużo danych zamknięto w kartach z tym samym promieniem i obramowaniem.
5. Nawigacja mobilna jest przewijanym rzędem linków zamiast dostępnego menu.
6. Filtry i statusy zbyt często używają pełnych pigułek.
7. Panel nie ma wspólnego operacyjnego raila; każda trasa zaczyna się jak
   samodzielna strona.
8. Szczegół leada jest pionowym stosem kart zamiast jednego dokumentowego
   workspace z liniami i logicznymi grupami.
9. Widget ma 20 px radius i mocny cień, niezgodne z resztą zatwierdzonego
   systemu.
10. Treść strony głównej o WordPressie jest nieaktualna po ukończeniu Etapu 11.

## Wireframe’y tekstowe

### Landing

`lekki header → asymetryczne hero (copy 5 kolumn | code-native brief 7 kolumn)
→ trzy fakty w jednym pasie → liniowa transformacja zapytanie–brief → duży
dokument leada → trzy naprzemienne korzyści → oś 01–04 → duży detal produktu +
indeks funkcji → typograficzny indeks branż → bezpieczeństwo i granice → FAQ →
ciemnozielone CTA → zwarta stopka`

### Pozostały marketing

`breadcrumbs → indywidualny hero z jedną informacją graniczną → główna
kompozycja właściwa dla celu strony → liniowe indeksy lub numerowane osie →
spójne CTA`. Produkt otrzymuje mapę systemu, „Jak działa” pionową oś, cennik
jedną powierzchnię pilotażu, agencje diagram operacyjny, WordPress przepływ
konektora, a huby redakcyjne indeksy.

### Logowanie

`znak i kontekst → zwarty formularz → komunikat bezpieczeństwa`. Bez
dekoracyjnego półekranu i bez nieaktywnego resetu hasła.

### Panel

`wąski rail 68 px → prawie biała płaszczyzna → nagłówek widoku → treść
grupowana liniami i whitespace`. Na mobile rail przechodzi w dolny/poziomy,
przewijalny pasek z pełnymi accessible names.

### Lista leadów

`nagłówek → filtry tekstowe → tabela: kontakt | proces | score | status |
aktualizacja | akcja`. Na mobile każdy rekord staje się liniowym blokiem z
widoczną etykietą i wartością.

### Szczegóły leada

`ID + status + powrót → nagłówek kontaktu → jedna powierzchnia dokumentowa:
kontakt | wynik | score → odpowiedzi → pliki i reguły → działania i historia`.
Prawa osoby pozostają jawne wyłącznie Ownerowi.

### Analityka, WordPress i prywatność

`nagłówek → lokalne sterowanie → jedna główna powierzchnia danych/formularza →
stany empty/error`. Tabele pozostają semantyczne, agregaty nie udają dowodu
marketingowego.

### Widget i hosted flow

`nagłówek + tekstowy postęp → jedno pytanie → zwarte wiersze odpowiedzi →
nawigacja → orientacyjny wynik i kontakt`. Wszystkie tryby korzystają z tego
samego Shadow DOM i kontraktu.

### Stany systemowe

`mały znacznik → jednoznaczny tytuł → przyczyna i następny krok → maksymalnie
dwie realne akcje`, bez wielkiej dekoracyjnej karty.

## Ryzyka i kontrole

- **Regresja logiki lub tenant scope:** zmiany ograniczone do prezentacji;
  pełne testy RLS i security pozostają obowiązkowe.
- **Fałszywa kompletność:** builder i onboarding nie dostaną atrap; brak UI jest
  jawny w artefaktach odbioru.
- **Zbyt duży DOM hero:** code-native podgląd ma ograniczoną liczbę pól, wersję
  mobilną i brak klientowego JavaScriptu.
- **Mobile menu:** osobny test Escape, `aria-expanded`, return focus i blokady
  scrolla.
- **SEO i performance:** bez zmiany allowlisty, canonical i schema; brak nowej
  biblioteki; budżet marketingowego JS pozostaje 250 KiB.
- **Istniejący brudny worktree:** etap nie odwraca ani nie formatuje niezwiązanych
  zmian; self-review opiera się na jawnej liście dotkniętych plików.

## Wynik implementacji

### Zgodność z referencją

| Cecha referencji                                     | Implementacja                                                                       | Wynik  |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------- | ------ |
| Ciepła jasna płaszczyzna i architektoniczna siatka   | wspólne off-white, subtelna siatka wyłącznie konstrukcyjna, szeroki oddech          | zgodne |
| Wąski głęboko zielony rail                           | wspólny rail panelu 68 px; na mobile przechodzi w opisany pasek poziomy             | zgodne |
| Duży panel leada zamiast morza kart                  | jeden dokument z liniami, dwiema kolumnami i historią drugorzędną                   | zgodne |
| Kwalifikacja połączona z briefem                     | semantyczny `ProductWorkspace` w hero i na stronie produktu                         | zgodne |
| Kontakt, zakres, budżet, termin, lokalizacja i pliki | pola są jawne w hero i produkcyjnym szczególe leada                                 | zgodne |
| Score, powody, status i następny krok                | `85/100`, tekstowe powody, „Gotowy do kontaktu” i realny link CTA                   | zgodne |
| Redakcyjny H1 po lewej, produkt po prawej            | asymetryczna siatka 5/7 z uproszczoną kompozycją mobile                             | zgodne |
| Małe promienie, hairlines i subtelny cień            | promienie 6–12 px, linie 1 px, jeden spokojny cień dokumentu                        | zgodne |
| Narzędzie pracy, nie reklama                         | realne pola, stany, tabele, listy i proces; brak fikcyjnych wykresów/social proof   | zgodne |
| Spójny lekki widget                                  | inline, popup, fullscreen i hosted korzystają z jednego Shadow DOM i nowych tokenów | zgodne |

### Powierzchnie i artefakty

- `artifacts/redesign/before`: 33 pełnostronicowe baseline’y marketingu,
  logowania, design systemu i 404 w 1440/1024/390 px;
- `artifacts/redesign/after`: landing, produkt, „Jak działa”, cennik, agencje,
  WordPress, hub funkcji, hub branż, logowanie, design system i 404 w
  1440/1280/1024/768/390/320 px;
- `panel-dashboard-*`, `panel-leads-*`, `panel-lead-detail-*` i
  `panel-states-*`: desktop 1440 oraz mobile 390, oparte na produkcyjnym CSS i
  jawnie syntetycznych danych;
- `widget-inline-390.png`, `widget-success-390.png` i
  `widget-popup-1440.png`: działająca ścieżka widgetu z mockiem API wyłącznie w
  teście E2E.

Panel nie miał zachowanego screenshotu sprzed zmiany: prywatne trasy wymagają
sesji i tenant scope, a etap nie wprowadził bypassu tylko po to, by wykonać
zrzut. Builder i onboarding nie istnieją jako trasy UI, dlatego ich artefakty
są oznaczone jako nie dotyczy zamiast zastąpienia atrapami. To jawne odstępstwa
od listy artefaktów promptu, a nie deklaracja nieistniejącej kompletności.

## Trzy rundy jakości

### 1. Funkcja

- zachowano route handlers, server actions, pricing/scoring, role,
  `TenantContext`, RLS i noindex powierzchni prywatnych;
- menu mobilne, demo, formularz logowania, filtry, tabela, akcje leada,
  analityka, WordPress, prywatność i widget pozostają realnymi kontrolkami;
- production states obejmują loading, empty, error i success, a brak uprawnień
  nie jest prezentowany jako pusta lista;
- nie dodano resetu hasła, buildera, onboardingu ani panelu demo, ponieważ nie
  istnieją dla nich działające kontrakty.

### 2. Art direction / anti-AI

- usunięto przechylony formularz z hero, powtarzalne trzykolumnowe karty,
  nadmiar badge’y, duże radiusy i gradientowy shimmer;
- marketing używa liniowej transformacji, naprzemiennych wierszy, osi 01–04,
  map systemu i indeksów redakcyjnych;
- panel grupuje dane przez linie i whitespace; tylko dokument leada ma subtelny
  cień uzasadniony warstwą;
- ponowny przegląd screenshotów wykazał i poprawił mobilny overflow dashboardu
  oraz aktywny element raila w artefakcie analityki.

### 3. Produkcja

- crawl, metadata, canonical, sitemap, robots, schema i uczciwy cennik
  przechodzą testy;
- 18/18 scenariuszy Playwright obejmuje axe, klawiaturę, menu, reflow,
  reduced motion, forced colors, mobile, security i widget;
- wszystkie kontrolowane powierzchnie są bez overflow w sześciu breakpointach;
- strona główna ładuje 154 679 B JavaScriptu Next.js przy limicie 250 000 B,
  0 requestów obrazów i 0 B rasterów; widget pozostaje 15 888 B gzip przy
  limicie 90 KiB;
- nie dodano biblioteki UI, animacji ani zależności runtime.

## Self-review diffu

Znaleziono i naprawiono:

1. niepoprawną strukturę `dl` w module kwalifikacji wykrytą przez axe;
2. niejednoznaczny locator statusu po dodaniu drugiego widoku produktu;
3. brak tworzenia katalogu screenshotów na czystym CI;
4. brak jawnego dowodu dashboardu i permission denied w artefaktach;
5. mobilny overflow analityki powodowany minimalną szerokością elementu grid;
6. nieaktualny opis WordPress po ukończeniu konektora;
7. użycia brakujących aliasów kolorów i zbyt dekoracyjny shimmer skeletonu;
8. nieaktualny selektor celu CTA w nowym teście reflow;
9. mikroodcienie zdefiniowane lokalnie w CSS zamiast zatwierdzonych tokenów.

Nie wykryto zmiany kontraktów bezpieczeństwa, prywatności, SEO ani domeny.
Ręczny VoiceOver/NVDA, docelowe przeglądarki przy zoom 200/400% oraz terenowe
Core Web Vitals pozostają bramkami publicznego release.

## Wyniki komend 2026-07-25

| Kontrola             | Wynik                                                                       |
| -------------------- | --------------------------------------------------------------------------- |
| `pnpm format:check`  | zielony                                                                     |
| `pnpm lint`          | 8/8 pakietów                                                                |
| `pnpm typecheck`     | 8/8 pakietów                                                                |
| `pnpm test`          | 82 testy jednostkowe, 9 zestawów PostgreSQL/RLS i harness WordPress zielone |
| `pnpm build`         | 8/8 pakietów, 37 tras, widget 15 888 B gzip                                 |
| `pnpm e2e`           | 18/18 scenariuszy Playwright                                                |
| `pnpm security:scan` | SAST i working-tree secret scan zielone                                     |
| `git diff --check`   | bez błędów whitespace                                                       |

Końcowa próba ponowienia `pnpm security:dependencies` została zatrzymana przez
izolację DNS, a wykonanie poza sandboxem nie zostało dopuszczone ze względu na
ujawnienie grafu zależności rejestrowi npm. Redesign nie dodał zależności i nie
zmienił `pnpm-lock.yaml`, dlatego obowiązuje zielony wynik dependency auditu z
Etapu 12. Ponowienie jest potrzebne dopiero po zmianie grafu albo za jawną zgodą
właściciela repozytorium na ten transfer metadanych.
