# R3.1 — hero i mapa zaufania `/jak-dziala`

**Data:** 2026-08-02
**Status:** PASS; implementacja zatrzymana przed R3.2
**Zakres:** wyłącznie sekcja `#how-it-works-hero` oraz kotwica `#proces`

## 1. Wykonane zmiany

- tekstowy hero zastąpiła dwukolumnowa kompozycja teza + code-native mapa
  zaufania;
- H1 rozdziela prowadzenie klienta od decyzji firmy bez przypisywania systemowi
  automatycznej decyzji handlowej;
- trzy jawne strefy pokazują odpowiedzialność przeglądarki, serwera i panelu
  firmy;
- centralna karta serwera jednoznacznie wskazuje źródło potwierdzonego wyniku i
  kontroli dostępu;
- przeglądarka nie wygląda jak źródło pricingu ani scoringu, a panel nie wygląda
  jak automat podejmujący decyzję;
- dwa równe CTA prowadzą do istniejącej kotwicy sześciu etapów i podstrony
  produktu;
- mobile używa zwartej osi pionowej z zachowaniem kolejności DOM, zamiast
  skalować trzy kolumny;
- późniejsze sześć kroków, bezpieczeństwo i finalne CTA pozostały wizualnie
  niezmienione do R3.2–R3.5.

## 2. Pomiary

| Viewport | Hero przed |   Hero po | Mapa przed      | Mapa po          | CTA po             | Overflow |
| -------: | ---------: | --------: | --------------- | ---------------- | ------------------ | -------: |
|  1440 px |   622,2 px |  903,5 px | 394,7 × 96,4 px | 758,4 × 533,2 px | 236 × 56 px, równe |     0 px |
|   430 px |   678,2 px | 1524,5 px | 398 × 96,4 px   | 398 × 784,2 px   | 398 × 56 px, równe |     0 px |
|   390 px |   678,2 px | 1549,8 px | 358 × 96,4 px   | 358 × 784,2 px   | 358 × 56 px, równe |     0 px |
|   320 px |   708,4 px | 1570,4 px | 296 × 96,4 px   | 296 × 806,2 px   | 296 × 56 px, równe |     0 px |

Hero jest świadomie wyższy od baseline'u, ponieważ lakoniczny note został
zastąpiony rzeczywistym proofem trzech granic. Cała trasa zostanie skrócona
względem baseline'u w R3.2–R3.3, gdy długa lista sześciu kroków przejdzie w
sekwencję 3 + 3 i zwarty timeline mobile.

Przy 1024 px hero zachowuje dwie kolumny, ale akcje układają się pionowo, aby
dłuższa polska etykieta nie zmieniała wysokości pierwszego CTA. Przy 768 px
copy znajduje się nad mapą, a trzy strefy przechodzą w jedną kolumnę.

## 3. Visual QA

Baseline, wynik, metryki i porównania zapisano w:

- `artifacts/visual-qa/marketing-subpages-v1/r3-1/before/`;
- `artifacts/visual-qa/marketing-subpages-v1/r3-1/after/`;
- `artifacts/visual-qa/marketing-subpages-v1/r3-1/jak-dziala-hero-before-after-1440.png`;
- `artifacts/visual-qa/marketing-subpages-v1/r3-1/jak-dziala-hero-before-after-390.png`.

Brak osobnego obrazu referencyjnego tej podstrony, dlatego odbiór opiera się na
side-by-side, języku home V7, kontrakcie archetypu procesu, pomiarach i testach.
Stan `before` obejmuje wcześniejszy kontener hero, natomiast `after` pokazuje
świadomie wprowadzony pełnoszeroki region z tłem.

### Ocena 19/20

| Kryterium               | Wynik | Uzasadnienie                                                     |
| ----------------------- | ----: | ---------------------------------------------------------------- |
| Hierarchia i kompozycja |   4/4 | jedna teza i jedna dominująca mapa odpowiedzialności             |
| Geometria i rytm        |   4/4 | kontrolowany split desktop, stack tablet i oś pionowa mobile     |
| Typografia i kolor      |   4/4 | ciasny display, czytelny akcent oraz wyróżnione źródło wyniku    |
| Responsive i dostępność |   4/4 | sześć viewportów, axe, forced colors i brak overflow             |
| Detale i spójność       |   3/4 | finalna długość trasy zależy od zamknięcia sekwencji w R3.2–R3.3 |

## 4. Testy i komendy

- baseline wspólnego shellu: 8/8 PASS;
- dedykowany R3.1: 8/8 PASS;
- pełny marketing R1–R3.1: 82/82 PASS;
- pełne `pnpm test`: PASS, w tym unit, RLS i WordPress;
- `pnpm lint`: PASS, 8/8 pakietów;
- `pnpm typecheck`: PASS, 8/8 pakietów;
- `pnpm build`: PASS, 8/8 pakietów i 39 tras;
- widget JavaScript: 17 269 B gzip przy budżecie 92 160 B;
- scope'owany Prettier i `git diff --check`: PASS.

Gate obejmuje 1440/1024/768/430/390/320 px, jedną H1, semantyczny region i
figure, trzy strefy zaufania, działające linki, niezmienione sześć dalszych
kroków, równe CTA, tekst minimum 12 px, normalny axe, axe w forced colors i brak
poziomego overflow.

## 5. Wykryte i usunięte problemy

- pierwsza kaskada pozostawiała na ciemnej karcie serwera bazowe kolory tytułu
  i opisu o kontraście 1,59:1 i 1,56:1; selektory otrzymały właściwy scope;
- przy 1024 px dłuższa etykieta zawijała się i zwiększała pierwsze CTA o
  19,44 px; akcje przechodzą wcześniej w jedną kolumnę;
- w forced colors bardziej szczegółowe kolory centralnej karty przetrwały nad
  `CanvasText`; jawny scope wariantu serwera zamknął naruszenia axe;
- pierwsza asercja forced colors liczyła również link breadcrumbs; test został
  ograniczony do dwóch właściwych akcji hero.

## 6. Ryzyka i granice

- mapa wyjaśnia granice techniczne, ale nie ujawnia prywatnych reguł ani danych
  organizacji;
- nie zmieniono sposobu obliczania pricingu i scoringu, API, tenant scope,
  danych, metadata SEO ani logiki aplikacji;
- nie dodano AI, automatycznej decyzji, wiążącej wyceny ani formalnej oferty;
- wysokość całej trasy mobile pozostaje do optymalizacji razem z sześcioma
  krokami w R3.2–R3.3;
- route-local CSS pozostaje do globalnego cleanupu w R12.

## 7. Następny dozwolony etap

Wyłącznie **R3.2 — kroki 1–3 `/jak-dziala`**. Kroki 4–6, bezpieczeństwo i CTA
pozostają poza zakresem do osobnych etapów.
