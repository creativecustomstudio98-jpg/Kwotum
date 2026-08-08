# R3.2 — kroki 1–3 `/jak-dziala`

**Data:** 2026-08-02
**Status:** PASS; implementacja zatrzymana przed R3.3
**Zakres:** wyłącznie sekcja `#proces` i techniczny podział dotychczasowej listy 3 + 3

## 1. Wykonane zmiany

- pierwsze trzy płaskie wiersze zastąpiła jedna code-native sekwencja
  konfiguracja → walidacja i publikacja → sesja klienta;
- każda karta pokazuje właściciela etapu, działanie, przykładowy artefakt i
  jednoznaczny rezultat;
- etap konfiguracji rozdziela pracę Ownera/Admina od walidacji systemowej;
- publikacja jest opisana jako niezmienna wersja z własnym hashem, bez
  sugerowania działania AI;
- etap sesji rozdziela rolę widgetu i serwera: przeglądarka pokazuje krok,
  serwer zapisuje odpowiedź i potwierdza routing;
- liczby, wersja i odpowiedź są jawnie opisane jako „Dane przykładowe”;
- dolna granica zaufania przypomina, że pricing i scoring nie trafiają do
  przeglądarki;
- desktop używa trzech równych kart z czytelnymi łącznikami, a poniżej 928 px
  kolejność przechodzi w natywną oś pionową;
- dawne kroki 4–6 zostały zachowane bez redesignu w osobnej sekcji
  `#proces-dalszy` do R3.3.

## 2. Pomiary

| Viewport | Sekcja przed | Sekcja po | Karty po                              | Overflow |
| -------: | -----------: | --------: | ------------------------------------- | -------: |
|  1440 px |     948,7 px | 1092,7 px | 3 × 428,8 × 538,4 px, równa wysokość  |     0 px |
|   430 px |    1210,7 px | 1680,9 px | 398 px szerokości, kolejność pionowa  |     0 px |
|   390 px |    1257,2 px | 1691,5 px | 358 px szerokości, kolejność pionowa  |     0 px |
|   320 px |    1382,3 px | 1872,9 px | 296 px szerokości, bez utraty etykiet |     0 px |

Sekcja jest wyższa od lakonicznego baseline'u, ponieważ trzy pojedyncze linie
zastąpił pełny kontrakt właściciel → działanie → artefakt → rezultat. Po
pierwszym pass-ie mobile miała 1969,2 px przy 390 px i 2041,6 px przy 320 px.
Kompresja odstępów, krótsze copy oraz poziomy footer obniżyły wynik odpowiednio
o 277,7 px i 168,7 px bez ukrywania treści. Całkowita długość sześciu etapów
zostanie oceniona po R3.3, kiedy druga połowa przestanie używać wysokich
wierszy legacy.

## 3. Visual QA

Baseline, wynik, metryki i porównania zapisano w:

- `artifacts/visual-qa/marketing-subpages-v1/r3-2/before/`;
- `artifacts/visual-qa/marketing-subpages-v1/r3-2/after/`;
- `artifacts/visual-qa/marketing-subpages-v1/r3-2/jak-dziala-steps-1-3-before-after-1440.png`;
- `artifacts/visual-qa/marketing-subpages-v1/r3-2/jak-dziala-steps-1-3-before-after-390.png`.

Brak osobnej referencji rastrowej tej podstrony. Odbiór opiera się na
side-by-side, języku home V7, kontrakcie archetypu procesu, metrykach i testach
geometrii. Screen sekcji może zawierać nakładkę sticky headera i skip linku,
ponieważ Playwright wykonuje natywny element screenshot po przewinięciu; nie są
one częścią sekcji.

### Ocena 19/20

| Kryterium               | Wynik | Uzasadnienie                                                       |
| ----------------------- | ----: | ------------------------------------------------------------------ |
| Hierarchia i kompozycja |   4/4 | jedna teza, trzy etapy i wyraźny rezultat każdej karty             |
| Geometria i rytm        |   4/4 | równe kolumny desktop oraz kontrolowana oś pionowa                 |
| Typografia i kolor      |   4/4 | spójne role tekstu, serwerowy akcent i spokojne artefakty          |
| Responsive i dostępność |   4/4 | sześć viewportów, axe, forced colors, minimum 12 px, zero overflow |
| Detale i spójność       |   3/4 | finalna długość pełnego procesu zależy od zamknięcia R3.3          |

## 4. Testy i komendy

- dedykowany R3.1 + R3.2: 16/16 PASS;
- pełny marketing R1–R3.2: 90/90 PASS;
- pełne `pnpm test`: PASS, w tym unit, RLS i WordPress;
- `pnpm lint`: PASS, 8/8 pakietów;
- `pnpm typecheck`: PASS, 8/8 pakietów;
- `pnpm build`: PASS, 8/8 pakietów i 39 tras;
- widget JavaScript: 17 269 B gzip przy budżecie 92 160 B;
- capture `before` i `after`: HTTP 200, brak console/pageerror i overflow;
- scope'owany Prettier i `git diff --check`: PASS.

Gate obejmuje 1440/1024/768/430/390/320 px, trzy karty i trzy dalsze etapy,
poprawną kolejność DOM, właścicieli i rezultaty, jawne dane demonstracyjne,
zachowaną granicę zaufania, tekst minimum 12 px, normalny axe, axe w forced
colors i brak poziomego overflow.

## 5. Wykryte i usunięte problemy

- pierwszy render miał 1131,1 px na desktopie i 1969,2–2041,6 px na małych
  ekranach; hierarchię skompresowano bez usuwania informacji;
- długi tytuł trzeciej karty powtarzał rolę etapu i niepotrzebnie zwiększał jej
  wysokość; tytuł skrócono do „Sesja klienta”, a odpowiedzialność pozostała w
  nagłówku „Widget + serwer”;
- produkcyjny Playwright początkowo próbował uruchomić drugi serwer na porcie
  3100; testy wykonano na jednym kontrolowanym buildzie poza granicą sandboxu;
- test R3.1 oczekiwał sześciu elementów w jednym `ol`; został doprecyzowany do
  trzech nowych kart i trzech zachowanych kroków, bez obniżenia zakresu gate'u.

## 6. Ryzyka i granice

- wszystkie liczby i przykładowe rekordy są oznaczone jako demonstracyjne;
- nie zmieniono pricingu, scoringu, publikacji, API, tenant scope, danych ani
  metadata SEO;
- nie dodano AI, automatycznej decyzji, wiążącej wyceny ani formalnej oferty;
- kroki 4–6 nadal używają legacy `process-narrative` i są celowo pozostawione
  do R3.3;
- bezpieczeństwo oraz finalne CTA pozostają poza zakresem do R3.4–R3.5;
- route-local CSS pozostaje do globalnego cleanupu w R12.

## 7. Następny dozwolony etap

Wyłącznie **R3.3 — kroki 4–6 `/jak-dziala`**. Bezpieczeństwo i CTA pozostają
poza zakresem do osobnych etapów.
