# R3.5 — finalne CTA i overview `/jak-dziala`

**Data:** 2026-08-02
**Status:** R3.5 PASS; kryterium długości całej trasy R3 pozostaje otwarte
**Zakres:** wyłącznie `#how-final-cta` i testy jego kontraktu

## 1. Wykonane zmiany

- historyczny, współdzielony band z self-linkiem do `/jak-dziala` zastąpił
  lokalny, nazwany finał tej trasy;
- główna akcja prowadzi do `/branze`, gdzie użytkownik może wybrać właściwy
  kontekst usługi, a druga do istniejącego `/logowanie`;
- trzy krótkie zasady podsumowują wspólny mechanizm, dopasowanie pytań i
  pozostawienie decyzji po stronie firmy;
- code-native overview rozdziela stały rdzeń procesu od elementów zależnych od
  usługi: pytań, warunków, zakresu, materiałów i kolejnego kroku;
- desktop używa kontrastowego panelu w dwóch kolumnach, a poniżej 1088 px
  zachowuje tę samą kolejność DOM w jednej osi;
- oba CTA mają identyczną szerokość i wysokość na każdym testowanym viewportcie;
- nie dodano cen, triala, KPI, klientów, CRM, AI ani nowych funkcji produktu.

## 2. Pomiary sekcji

| Viewport | Sekcja przed | Sekcja po | CTA po              | Overview po      | Overflow |
| -------: | -----------: | --------: | ------------------- | ---------------- | -------: |
|  1440 px |     351,4 px |  903,4 px | 2 × 241,6 × 56,8 px | 596,4 × 540,4 px |     0 px |
|   430 px |     461,4 px | 1199,7 px | 2 × 359,2 × 56,8 px | 364,0 × 472,7 px |     0 px |
|   390 px |     486,2 px | 1238,3 px | 2 × 319,2 × 56,8 px | 324,0 × 500,5 px |     0 px |
|   320 px |     525,1 px | 1299,4 px | 2 × 257,2 × 56,8 px | 262,0 × 589,2 px |     0 px |

Wysokość całego dokumentu po R3.5 wynosi 5223 px przy 1440 px, 8526 px przy
430 px, 8704 px przy 390 px i 9350 px przy 320 px. Historyczny audyt R0 miał
4082 px na desktopie i 5698 px przy 390 px. Oznacza to, że implementacja R3.5
spełnia własny kontrakt geometrii, responsive i treści, ale ilościowy gate R3
„mobile wyraźnie krótszy od baseline'u” nie jest zamknięty. Bezpieczna redukcja
wymaga osobnego passu obejmującego rytm R3.1–R3.4; nie została ukryta przez
agresywne ścinanie copy w tym mikroetapie.

## 3. Visual QA

Baseline, wynik, metryki i porównania zapisano w:

- `artifacts/visual-qa/marketing-subpages-v1/r3-5/before/`;
- `artifacts/visual-qa/marketing-subpages-v1/r3-5/after/`;
- `artifacts/visual-qa/marketing-subpages-v1/r3-5/jak-dziala-final-cta-before-after-1440.png`;
- `artifacts/visual-qa/marketing-subpages-v1/r3-5/jak-dziala-final-cta-before-after-390.png`.

Brak osobnej referencji rastrowej tej podstrony. Odbiór opiera się na
side-by-side, systemie home V7, archetypie finalnego CTA, dziewięciu
viewportach i bezpośrednim snapshotcie semantycznego DOM z przeglądarki.

### Ocena 19/20

| Kryterium               | Wynik | Uzasadnienie                                                             |
| ----------------------- | ----: | ------------------------------------------------------------------------ |
| Hierarchia i kompozycja |   4/4 | jedna decyzja, dwa kolejne kroki i czytelne podsumowanie                 |
| Geometria i rytm        |   4/4 | równe CTA, stabilne osie desktopu i kontrolowany stack mobile            |
| Typografia i kolor      |   4/4 | kontrastowy finał domyka jasną sekcję bezpieczeństwa                     |
| Responsive i dostępność |   4/4 | dziewięć viewportów, axe, forced colors, minimum 12 px, zero overflow    |
| Detale i spójność       |   3/4 | sama sekcja jest zamknięta; całkowita długość R3 wymaga osobnej redukcji |

## 4. Testy i komendy

- dedykowany R3.1–R3.5: 49/49 PASS;
- pełny marketing R1–R3.5: 123/123 PASS;
- pełne `pnpm test`: PASS, w tym 85 testów web, unit, RLS i WordPress;
- `pnpm lint`: PASS, 8/8 pakietów;
- `pnpm typecheck`: PASS, 8/8 pakietów;
- `pnpm build`: PASS, 8/8 pakietów i 39 tras;
- widget JavaScript: 17 269 B gzip przy budżecie 92 160 B;
- capture `before` i `after`: HTTP 200, brak console/pageerror i overflow;
- scope'owany Prettier, bezpośredni snapshot przeglądarki i `git diff --check`:
  PASS.

Gate sekcji obejmuje 1536/1440/1280/1024/768/430/390/375/320 px, nazwaną
sekcję, dokładnie dwa działające linki, identyczną geometrię CTA, jeden H2,
komplementarny overview, poprawną kolejność DOM, tekst minimum 12 px, normalny
axe, axe w forced colors i brak poziomego overflow.

## 5. Wykryte i usunięte problemy

- stary główny CTA prowadził z `/jak-dziala` ponownie do `/jak-dziala`; nowy
  finał usuwa self-link i prowadzi naturalnie do wyboru branży;
- współdzielony band nie podsumowywał relacji między stałym procesem a
  branżowym kontekstem; lokalny overview pokazuje ten podział bez nowych
  obietnic produktu;
- test R3.4 zakładał obecność starego finalnego CTA; został zaktualizowany do
  nowego, rzeczywistego kontraktu bez osłabienia asercji;
- bezpośredni snapshot przeglądarki potwierdził nazwany region, H2, poprawne
  linki `/branze` i `/logowanie`, listę zasad oraz nazwany `complementary`.

## 6. Ryzyka i granice

- cały dokument jest dłuższy od historycznego R0, więc route-level gate R3 nie
  może zostać uznany za kompletny wyłącznie na podstawie poprawnej sekcji R3.5;
- kompresja R3.1–R3.4 jest poza zakresem tej jednostki i wymaga osobnego
  baseline'u oraz pełnego visual QA, aby nie utracić treści bezpieczeństwa;
- route-local CSS pozostaje do konsolidacji w R12;
- nie zmieniono API, danych, auth, tenant scope, RLS, pricingu, scoringu,
  uploadu, storage ani metadata SEO.

## 7. Następny dozwolony etap

Wyłącznie **R3.C — przekrojowa redukcja rytmu i długości `/jak-dziala`** bez
zmiany informacji, kolejności procesu ani kontraktów bezpieczeństwa. R4.1
`/cennik` pozostaje wstrzymany do zamknięcia ilościowego gate'u R3.
