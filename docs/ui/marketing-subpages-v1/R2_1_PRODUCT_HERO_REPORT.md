# R2.1 — hero `/produkt`

**Data:** 2026-08-02
**Status:** PASS; implementacja zatrzymana przed R2.2
**Zakres:** wyłącznie hero podstrony produktu oraz jego code-native proof

## 1. Wykonane zmiany

- hero otrzymał jednoznaczną tezę: proces od konfiguracji do gotowego leada;
- stary, tekstowy blok zastąpiła dwukolumnowa kompozycja z dominującym proofem;
- proof pokazuje trzy prawdziwe etapy: konfigurację, publikację i gotowy lead;
- dolny rail rozdziela odpowiedzialność przeglądarki, serwera i firmy;
- jawnie opisano zakres MVP oraz granicę „bez płatności i pełnego CRM”;
- oba CTA prowadzą do istniejących tras i mają równą geometrię;
- wariant mobile jest osobną, zwartą osią procesu, a nie pomniejszonym desktopem;
- wszystkie ilustracje i ikony są code-native; nie dodano fikcyjnych danych,
  integracji, KPI, cen ani kontrolek bez działania;
- późniejsza mapa produktu, sekcja granic i finalne CTA pozostały nietknięte.

## 2. Pomiary

| Viewport | Hero przed |   Hero po | Proof po         | CTA po         | Overflow |
| -------: | ---------: | --------: | ---------------- | -------------- | -------: |
|  1440 px |   651,9 px |  774,2 px | 771,6 × 555,6 px | 2 × 226,4 × 52 |     0 px |
|   430 px |   776,0 px | 1802,7 px | 398 × 1017,7 px  | 2 × 398 × 56   |     0 px |
|   390 px |   806,2 px | 1813,1 px | 358 × 1017,7 px  | 2 × 358 × 56   |     0 px |
|   320 px |   806,2 px | 1786,4 px | 296 × 1008,1 px  | 2 × 296 × 56   |     0 px |

Mobile proof używa trzech równych kart z wąskim railem ikon i pionowymi
łącznikami. Dzięki temu mieści pełną narrację w około 1,0 tys. px zamiast
początkowego prostego stacku przekraczającego 1,33 tys. px.

## 3. Visual QA

Baseline, wynik i metryki zapisano w:

- `artifacts/visual-qa/marketing-subpages-v1/r2-1/before/`;
- `artifacts/visual-qa/marketing-subpages-v1/r2-1/after/`;
- `artifacts/visual-qa/marketing-subpages-v1/r2-1/produkt-hero-before-after-1440.png`;
- `artifacts/visual-qa/marketing-subpages-v1/r2-1/produkt-hero-before-after-390.png`.

Nie ma osobnego obrazu referencyjnego tej podstrony, dlatego wynik nie używa
sztucznego RMSE. Odbiór opiera się na side-by-side, osiach home V7, pomiarach,
kontrakcie responsive i testach funkcjonalnych.

### Ocena 19/20

| Kryterium               | Wynik | Uzasadnienie                                                      |
| ----------------------- | ----: | ----------------------------------------------------------------- |
| Hierarchia i kompozycja |   4/4 | teza i proof tworzą jeden czytelny pierwszy ekran                 |
| Geometria i rytm        |   4/4 | dwie osie desktopu, równe CTA i zwarta pionowa sekwencja mobile   |
| Typografia i kolor      |   4/4 | język Kwotum, spokojne powierzchnie i kontrolowany zielony akcent |
| Responsive i dostępność |   4/4 | sześć breakpointów, axe, forced colors i brak overflow            |
| Detale i spójność       |   3/4 | dalsze sekcje celowo zachowują starszy język do etapów R2.2–R2.4  |

## 4. Testy i komendy

- scope'owany Prettier: PASS;
- `pnpm --filter @wyceno/web lint`: PASS;
- `pnpm --filter @wyceno/web typecheck`: PASS;
- `pnpm --filter @wyceno/web build`: PASS, 39 tras;
- dedykowany `marketing-product-r2.spec.ts`: 8/8 PASS;
- pełny marketing R1 + R2.1: 50/50 PASS;
- pełne `pnpm test`: PASS, w tym unit, RLS i WordPress;
- widget JavaScript: 17 269 B gzip przy budżecie 92 160 B;
- `git diff --check`: PASS.

Dedykowany gate obejmuje 1440/1024/768/430/390/320 px, równość kart i CTA,
minimalny tekst 12 px, granice wysokości, brak overflow, zachowanie późniejszych
sekcji oraz axe w trybie forced colors.

## 5. Wykryte i usunięte problemy

- pierwszy wariant mobile był zbyt długi; osobna kompozycja rail skróciła proof
  o ponad 300 px;
- axe wykrył zbyt jasny numer `03` po przejściu zielonej karty do `Canvas` w
  forced colors; numer dziedziczy teraz `CanvasText`;
- pełna regresja ujawniła, że leniwa miniatura 76 px na home pozostaje pending
  w Chromium bez JavaScriptu i blokuje zdarzenie `load`; jawne
  `loading="eager"` usuwa problem bez zmiany obrazu i przywraca test no-JS.

## 6. Ryzyka i granice

- CSS R2.1 pozostaje końcowym, lokalnym cascade lockiem; cleanup legacy należy
  wykonać dopiero w R12 po potwierdzeniu wszystkich konsumentów;
- proof objaśnia produkt, ale nie jest interaktywną makietą panelu i nie może
  być interpretowany jako nowa funkcja;
- nie zmieniono architektury, API, tenant scope, danych, scoringu, pricingu ani
  metadata SEO;
- pełne visual QA dalszych sekcji `/produkt` pozostaje otwarte.

## 7. Następny dozwolony etap

Wyłącznie **R2.2 — mapa produktu `/produkt`**. R2.3 granice produktu i R2.4
finalne CTA pozostają poza zakresem do osobnych odbiorów.
