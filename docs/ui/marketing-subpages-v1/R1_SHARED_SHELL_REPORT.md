# R1 — wspólny shell podstron Kwotum

**Data:** 2026-08-02
**Status:** PASS; implementacja zatrzymana przed R2.1
**Zakres:** header, osie, tło, breadcrumbs, CTA, footer i legal shell

## 1. Zakres wykonany

- dodano pełny znak Q + „kwotum” do headera każdej podstrony;
- ujednolicono desktopową nawigację do sześciu prawdziwych tras znanych z
  home;
- dodano `aria-current="page"`, także dla zagnieżdżonych stron branż i funkcji;
- zachowano route-aware CTA: home prowadzi do demo, podstrony do procesu;
- wyrównano header i główne kontenery podstron do szerokiej osi V7;
- ustawiono osobne bezpieczne osie mobile: 16 px oraz 12 px przy 320 px;
- ujednolicono 44-pikselowy przycisk menu, focus ring i pełnoekranowe menu;
- poprawiono breadcrumbs oraz kontrast bieżącej etykiety;
- ujednolicono rozmiar i szerokość dwóch akcji w końcowym CTA podstron;
- dodano papierowe tło podstron i spokojny shell dokumentów prawnych;
- zachowano istniejący wspólny footer V7;
- nie zmieniono kolejności, treści ani proofów żadnej sekcji.

## 2. Pomiary

| Region                 | Przed 1440   | Po 1440             | Przed 390      | Po 390                   |
| ---------------------- | ------------ | ------------------- | -------------- | ------------------------ |
| Header — wysokość      | 68 px        | 96 px               | 68 px          | 72 px                    |
| Header — lewa/prawa oś | 60 / 1380 px | 56 / 1384 px        | 20 / 370 px    | 16 / 374 px              |
| Znak marki             | sam wordmark | Q + wordmark        | sam wordmark   | Q + wordmark             |
| Nawigacja              | 3 pozycje    | 6 pozycji + aktywna | menu 3 pozycji | menu 6 pozycji + aktywna |
| Overflow               | 0 px         | 0 px                | 0 px           | 0 px                     |

Przy 320 px header i główna treść używają osi `x=12–308`. Przycisk menu ma
44 × 44 px. Przy 1024 px pełna nawigacja nadal mieści się bez przejścia do
mobilnego stacku; przy 768 px działa wariant menu.

## 3. Visual QA

Baseline i wynik zapisano dla czterech archetypów:

- `/produkt` — produkt;
- `/cennik` — decyzja/pilotaż;
- `/branze/meble-na-wymiar` — długa strona szablonowa;
- `/polityka-prywatnosci` — dokument prawny.

Każdy ma pełny render 1440 i 390 px w:

- `artifacts/visual-qa/marketing-subpages-v1/r1/before/`;
- `artifacts/visual-qa/marketing-subpages-v1/r1/after/`.

Porównanie produktu:

- `artifacts/visual-qa/marketing-subpages-v1/r1/product-before-after.png`;
- `artifacts/visual-qa/marketing-subpages-v1/r1/product-difference-1440.png`.

RMSE before/after top fold wynosi `0,203628`; opisuje zakres świadomej zmiany,
nie zgodność z referencją. R1 nie ma osobnego obrazu pixel-lock, dlatego odbiór
opiera się na zaakceptowanej geometrii headera home, pomiarach osi,
side-by-side i gate'ach funkcjonalnych.

### Ocena 19/20

| Kryterium               | Wynik | Uzasadnienie                                                      |
| ----------------------- | ----: | ----------------------------------------------------------------- |
| Hierarchia i kompozycja |   4/4 | marka, nawigacja i aktywna trasa mają jasny porządek              |
| Geometria i rytm        |   4/4 | osie desktop/mobile odpowiadają kontraktowi V7/M1                 |
| Typografia i kolor      |   4/4 | shell używa języka Kwotum; kontrast breadcrumbs poprawiony po axe |
| Responsive i dostępność |   4/4 | pięć breakpointów, klawiatura, focus, axe i brak overflow         |
| Detale i spójność       |   3/4 | treści sekcji celowo pozostają legacy do etapów R2–R11            |

## 4. Testy

- baseline marketingowy przed zmianą: `34/34 PASS`;
- dedykowany R1 po korekcie: `8/8 PASS`;
- pełny marketing wraz z finalnym gate'em R1: `42/42 PASS`;
- wszystkie 19 podstron: header, znak, breadcrumbs i brak overflow na 1536 i
  390 px;
- cztery archetypy: 1440/1024/768/390/320 px;
- axe WCAG 2 A/AA/2.1 AA/2.2 AA: zero naruszeń na `/produkt` 390 px;
- lint: PASS;
- typecheck: PASS;
- pełne unit, RLS i WordPress: PASS;
- build: 39 tras, PASS;
- widget JS: 17 269 B gzip przy budżecie 92 160 B;
- scope'owany Prettier i `git diff --check`: PASS.

## 5. Pierwszy wykryty problem

Dedykowany axe wykrył kontrast `#66728b` na `#f4f1ea` równy 4,28:1 dla
12-pikselowej bieżącej etykiety breadcrumbs. Kolor przyciemniono do `#566177`.
Końcowy gate nie ma naruszeń. Test aktywnego linku mobilnego doprecyzowano tak,
aby uwzględniał wizualny numer kroku, nie osłabiając sprawdzania
`aria-current`.

## 6. Ryzyka i granice

- CSS R1 jest celowo końcowym cascade lockiem; bezpieczny cleanup historycznych
  reguł pozostaje dopiero w R12.
- `:has()` rozdziela home image-lock od szerokich osi podstron; wspierają go
  docelowe nowoczesne przeglądarki testowane przez projekt.
- R1 nie rozwiązuje płaskiej hierarchii istniejących sekcji. To zakres R2–R11.
- Nie zmieniono API, danych, tenant scope, scoringu, pricingu ani SEO copy.

## 7. Następny dozwolony etap

Wyłącznie **R2.1 — hero `/produkt`**: teza, proof procesu i granica MVP. Mapa
produktu, sekcja granic oraz CTA nie mogą być jeszcze przebudowane.
