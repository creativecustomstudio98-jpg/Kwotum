# R4.1 — hero `/cennik`

**Data:** 2026-08-03
**Status:** PASS; R4.1 zamknięte
**Zakres:** wyłącznie hero i kotwica do istniejącego modelu współpracy

## 1. Wykonane zmiany

- płaski układ tekst + mała notka zastąpił code-native hero archetypu
  pilotażu: copy po lewej i mapa kwalifikacji wdrożenia po prawej;
- H1 komunikuje kolejność decyzji: najpierw rzeczywisty proces, dopiero potem
  model współpracy;
- trzy rekordy mapy pokazują wyłącznie faktyczne zmienne zakresu: proces,
  sposób publikacji i kryteria walidacji;
- rezultat rozdziela „ustalony zakres pilotażu” od późniejszej „wyceny
  indywidualnej”, bez sugerowania automatycznej kalkulacji;
- status self-service zachowuje pełny komunikat o braku zatwierdzonych kwot,
  limitów planów i rozliczeń;
- dwa równe CTA prowadzą do istniejącej sekcji `#model-wspolpracy` oraz
  `/jak-dziala#proces`;
- 1024 px zachowuje układ poziomy, 768 px przechodzi do jednej osi, a mobile
  otrzymuje osobną kompozycję rekordów;
- nie zmieniono treści ani wyglądu dwóch ścieżek współpracy, finalnego CTA,
  headera, footera, metadata ani logiki produktu.

## 2. Uczciwość treści

Hero nie zawiera kwot, planów abonamentowych, trialu, karty płatniczej,
limitów, gwarancji, KPI, opinii ani fikcyjnego formularza. Nie przedstawia mapy
jako automatycznego kalkulatora. Pricing i model self-service pozostają
niezatwierdzone zgodnie z ADR-020, `PRODUCT_REQUIREMENTS.md`, `SCOPE.md` i
`NON_GOALS.md`.

## 3. Pomiary

| Viewport | Hero przed |   Hero po | Proof po | CTA po              | Overflow |
| -------: | ---------: | --------: | -------: | ------------------- | -------: |
|  1536 px |   580,5 px |  880,0 px | 546,0 px | 2 × 242,4 × 52 px   |     0 px |
|  1440 px |   570,1 px |  847,7 px | 546,0 px | 2 × 242,4 × 52 px   |     0 px |
|  1280 px |   530,3 px |  794,0 px | 546,0 px | 2 × 224,9 × 52 px   |     0 px |
|  1024 px |   621,1 px |  768,2 px | 546,0 px | 2 × 172,5 × 61,2 px |     0 px |
|   768 px |   570,6 px | 1284,9 px | 546,0 px | 2 × 242,4 × 52 px   |     0 px |
|   430 px |   609,1 px | 1593,4 px | 729,4 px | 2 × 398,0 × 56 px   |     0 px |
|   390 px |   609,1 px | 1588,2 px | 729,4 px | 2 × 358,0 × 56 px   |     0 px |
|   375 px |   639,3 px | 1597,7 px | 748,1 px | 2 × 343,0 × 56 px   |     0 px |
|   320 px |   639,3 px | 1573,8 px | 766,8 px | 2 × 296,0 × 56 px   |     0 px |

Wzrost wysokości jest świadomy: wcześniejszy hero nie zawierał wymaganego
proofu. Cały dokument ma 3019 px przy 1440 px i 5053 px przy 390 px, nadal bez
martwej przestrzeni oraz overflow.

## 4. Visual QA

Artefakty:

- `artifacts/visual-qa/marketing-subpages-v1/r4-1/before/`;
- `artifacts/visual-qa/marketing-subpages-v1/r4-1/after/`;
- `artifacts/visual-qa/marketing-subpages-v1/r4-1/cennik-hero-before-after-1440.png`;
- `artifacts/visual-qa/marketing-subpages-v1/r4-1/cennik-hero-before-after-390.png`;
- `artifacts/visual-qa/marketing-subpages-v1/r4-1/diff.md`.

### Ocena 19/20

| Kryterium              | Wynik | Uzasadnienie                                              |
| ---------------------- | ----: | --------------------------------------------------------- |
| Kompletność regionów   |   4/4 | teza, status, dwa CTA, trzy decyzje i rezultat            |
| Geometria i proporcje  |   4/4 | stabilne osie, poziomy 1024 px, zero overflow             |
| Typografia i spacing   |   4/4 | hierarchia zgodna z Kwotum, minimum 12 px                 |
| Gęstość danych i stany |   4/4 | proof zawiera wyłącznie potrzebne zmienne zakresu         |
| Transformacja mobile   |   3/4 | pełna i czytelna; hero celowo zajmuje około dwóch ekranów |

## 5. Testy i weryfikacja

- dedykowany R4.1: 11/11 PASS;
- pełny marketing R1–R4.1: 145/145 PASS;
- pełne `pnpm test`: PASS, w tym unit, RLS i WordPress;
- `pnpm lint`: PASS, 8/8 pakietów;
- `pnpm typecheck`: PASS, 8/8 pakietów;
- `pnpm build`: PASS, 8/8 pakietów i 39 tras;
- widget JavaScript: 17 269 B gzip przy budżecie 92 160 B;
- capture: HTTP 200, brak console/pageerror, tekst minimum 12 px i zero
  overflow w dziewięciu viewportach;
- klawiatura, długie polskie copy, reduced motion, forced colors i axe: PASS;
- przeglądarka potwierdziła nazwany region/figure i działającą kotwicę, która
  ustawia `#model-wspolpracy` na początku viewportu;
- Prettier i `git diff --check`: PASS.

## 6. Wykryte i usunięte problemy

- dekoracyjny okrąg pierwszego passu zwiększał `scrollWidth` o 69–308 px;
  usunięto go zamiast maskować błąd `overflow-x: hidden`;
- przy 1024 px dłuższa etykieta podnosiła tylko pierwszy przycisk; grid
  otrzymał wspólne rozciągnięcie i oba CTA mają 61,2 px;
- istniejący test ceny używał globalnego selektora „Wycena indywidualna”. Po
  dodaniu uczciwego rezultatu w hero asercję zawężono do
  `#model-wspolpracy`, bez osłabienia zakazu publikowania kwot;
- bezpośredni snapshot DOM potwierdził jedno H1, nazwany region, figure, trzy
  decyzje i komplet dalszych sekcji bez zmiany kolejności.

## 7. Ryzyka i granice

- hero jest dłuższy na mobile, ponieważ wcześniejszy nie zawierał proofu;
- mapa kwalifikacji jest informacją, nie formularzem i nie zapisuje danych;
- route-local CSS pozostaje do konsolidacji dopiero w R12;
- nie zmieniono API, danych, auth, tenant scope, RLS, pricingu, scoringu,
  płatności, SEO ani mechanizmu publikacji.

## 8. Następny dozwolony etap

Wyłącznie **R4.2 — dwie ścieżki współpracy `/cennik`**. Model w walidacji,
kryteria zakresu i finalne CTA pozostają poza zakresem następnego mikroetapu.
