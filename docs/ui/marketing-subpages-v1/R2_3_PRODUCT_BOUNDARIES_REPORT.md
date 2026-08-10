# R2.3 — granice produktu `/produkt`

**Data:** 2026-08-02
**Status:** PASS; implementacja zatrzymana przed R2.4
**Zakres:** wyłącznie sekcja `#granice` podstrony produktu

## 1. Wykonane zmiany

- prostą listę trzech negacji zastąpił code-native kontrakt odpowiedzialności;
- rozdział otrzymał ciemną, kontrastową powierzchnię odcinającą granice od
  wcześniejszej mapy produktu;
- trzy karty opisują wynik orientacyjny, uporządkowany lead oraz jawne reguły;
- każda karta pokazuje osobno odpowiedzialność Kwotum i odpowiedzialność firmy;
- końcowy rail eksponuje najważniejszą granicę: niewiążący wynik wymaga
  weryfikacji firmy;
- mobile używa zwartej listy trzech kontraktów zamiast pomniejszonej tabeli;
- copy nie dodaje AI, automatycznych decyzji, pełnego CRM, wiążącej oferty ani
  funkcji poza zatwierdzonym MVP;
- finalne CTA pozostało nietknięte do R2.4.

## 2. Pomiary

| Viewport | Sekcja przed | Sekcja po | Karty po               | Overflow |
| -------: | -----------: | --------: | ---------------------- | -------: |
|  1440 px |     480,3 px |  894,4 px | 3 × 442,6 × 303,2 px   |     0 px |
|   430 px |     719,6 px | 1225,8 px | 396 px; 218/198/198 px |     0 px |
|   390 px |     744,4 px | 1254,5 px | 356 px; 218/219/198 px |     0 px |
|   320 px |     744,4 px | 1305,1 px | 294 px; 239/240/240 px |     0 px |

Sekcja jest świadomie wyższa od tekstowego baseline'u, ponieważ pokazuje sześć
konkretnych odpowiedzialności i wyodrębniony kontrakt końcowy. Pozostaje poniżej
900 px na desktopie i 1 500 px na mobile zgodnie z dedykowanym gate'em.

## 3. Visual QA

Baseline, wynik, metryki i porównania zapisano w:

- `artifacts/visual-qa/marketing-subpages-v1/r2-3/before/`;
- `artifacts/visual-qa/marketing-subpages-v1/r2-3/after/`;
- `artifacts/visual-qa/marketing-subpages-v1/r2-3/produkt-boundaries-before-after-1440.png`;
- `artifacts/visual-qa/marketing-subpages-v1/r2-3/produkt-boundaries-before-after-390.png`.

Brak osobnego obrazu referencyjnego tej podstrony, dlatego odbiór opiera się na
side-by-side, języku home V7, pomiarach, kontrakcie responsive i testach.

### Ocena 19/20

| Kryterium               | Wynik | Uzasadnienie                                                  |
| ----------------------- | ----: | ------------------------------------------------------------- |
| Hierarchia i kompozycja |   4/4 | mocny kontrastowy rozdział i jednoznaczny finał kontraktu     |
| Geometria i rytm        |   4/4 | trzy równe kolumny desktop oraz zwarta sekwencja mobile       |
| Typografia i kolor      |   4/4 | czytelna hierarchia na ciemnej zieleni i kontrolowany akcent  |
| Responsive i dostępność |   4/4 | sześć viewportów, normalny axe, forced colors i brak overflow |
| Detale i spójność       |   3/4 | finalne CTA zachowuje starszy wariant wyłącznie do etapu R2.4 |

## 4. Testy i komendy

- scope'owany Prettier: PASS;
- `pnpm lint`: PASS, 8/8 pakietów;
- `pnpm typecheck`: PASS, 8/8 pakietów;
- `pnpm build`: PASS, 8/8 pakietów i 39 tras;
- dedykowane R2.2 + R2.3: 16/16 PASS;
- pełny marketing R1 + R2.1–R2.3: 66/66 PASS;
- pełne `pnpm test`: PASS, w tym unit, RLS i WordPress;
- widget JavaScript: 17 269 B gzip przy budżecie 92 160 B;
- `git diff --check`: PASS.

Gate obejmuje 1440/1024/768/430/390/320 px, trzy granice i sześć stron
odpowiedzialności, kolejność mobile, minimalny tekst 12 px, normalny axe, axe w
forced colors, granice wysokości, brak overflow i zachowanie finalnego CTA.

Root `pnpm format:check` pozostaje czerwony wyłącznie przez 13 wcześniejszych,
nietkniętych plików w `artifacts/promo/` i
`artifacts/visual-qa/marketing-subpages-v1/audit/`; pliki R2.3 przechodzą.

## 5. Wykryte i usunięte problemy

- późniejsza wspólna reguła shellu nadpisywała ciemne tło, przez co axe widział
  jasny tekst na bieli; lokalny scope R2.3 otrzymał właściwą specyficzność;
- późniejsze tokeny przyciemniały kicker oraz etykiety `Kwotum` i `Firma`;
  lokalne selektory zachowują teraz zamierzony kontrast również wizualnie;
- wyższa specyficzność kolorów bazowych wymagała analogicznego scope'u w
  `forced-colors`; oba dedykowane testy dostępności wykryły i zamknęły problem;
- początkowa wysokość desktopu przekraczała gate o 3 px; skorygowano pionowy
  rytm zamiast rozluźniać limit.

## 6. Ryzyka i granice

- CSS R2.3 pozostaje lokalnym cascade lockiem do cleanupu w R12;
- kontrakt opisuje odpowiedzialność, ale nie jest dokumentem prawnym ani nową
  funkcją aplikacji;
- nie zmieniono architektury, API, tenant scope, danych, pricingu, scoringu ani
  metadata SEO;
- finalne visual QA CTA i overview pozostaje otwarte.

## 7. Następny dozwolony etap

Wyłącznie **R2.4 — finalne CTA i overview `/produkt`**. Inne trasy pozostają poza
zakresem do osobnych etapów.
