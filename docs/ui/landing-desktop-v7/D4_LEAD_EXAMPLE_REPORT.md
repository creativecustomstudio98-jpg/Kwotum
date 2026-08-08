# Landing desktop V7 — raport odbioru D4, przykładowy lead

**Status:** PASS lokalny; mikroetap zamknięty przed integracjami
**Data:** 2026-08-02
**Referencja:** `reference/08-full-overview.png`, 941 × 1672 px, SHA-256
`8ddaca5adef25e9205910c93816fc7501668b397f14e34411bb94f3780edace6`

## Zakres i sposób porównania

Mikroetap przebudowuje wyłącznie sekcję `decision-document` do pełnego,
demonstracyjnego leada: pięciu parametrów, galerii projektu, wyniku 87/100,
zalecanego następnego kroku oraz dwóch działających CTA.

V7-08 jest planszą przeglądową, a nie natywnym screenshotem strony przy 941 px.
Fragment `y 955–1280` został wycięty wyłącznie do analizy proporcji i przeskalowany
współczynnikiem około `1,7768` do szerokości 1672 px. Overlay jest dowodem
kompozycyjnym; zgodnie z `MEASUREMENTS.md` nie podajemy pozornego RMSE.

## Implementacja i uczciwość produktu

- UI, ikony, dane, wskaźnik, teksty i CTA są code-native HTML/CSS/SVG;
- trzy rastry zawierają wyłącznie fotografie kuchni wycięte z zaakceptowanej
  referencji V7-08, bez tekstu lub kontrolek;
- wartości są objęte nazwą dostępną „Dane demonstracyjne” i nie udają rekordu
  klienta;
- nie dodano fikcyjnego przypisywania handlowca z planszy;
- zielone CTA prowadzi do działającej trasy `/jak-dziala`, a drugie do
  istniejącej trasy `/produkt`;
- wynik nie zmienia logiki scoringu i nie jest obliczany po stronie klienta.

## Potwierdzona geometria desktopu 1672 px

| Region             |      V7-08 po skali | Implementacja finalna |
| ------------------ | ------------------: | --------------------: |
| wysokość sekcji    |      około `577 px` |              `576 px` |
| kicker             |        około `y 41` |          około `y 41` |
| H2                 |        około `y 69` |          około `y 69` |
| karta              |        `x 126–1530` |          `x 126–1546` |
| pion karty         |   około `y 123–521` |     około `y 123–520` |
| główne zdjęcie     |         `x 481–880` |           `x 481–879` |
| dwa zdjęcia boczne |        `x 890–1063` |          `x 889–1065` |
| separator wyniku   |      około `x 1096` |        około `x 1093` |
| prawa kolumna      | około `x 1136–1506` |   około `x 1137–1506` |

Różnica końcowej prawej krawędzi karty wynika z zachowania wspólnej osi
1546 px używanej przez desktopowy kontener oraz z miękkiego cienia referencji.
Kluczowe osie treści mieszczą się w tolerancji około 0–3 px po przeskalowaniu.

## Dwa passy i dziesięć głównych korekt

1. Stara sekcja miała ciemne tło i wysokość około 811 px → jasna sekcja 576 px.
2. Copy po lewej zastępowało przykład produktu → centralny kicker i tytuł.
3. Karta zaczynała się przy około x742 → finalnie x126 jak w overview.
4. Brakowało galerii → dodano układ 398 px + dwa kadry około 176 px.
5. Pierwszy pass przesuwał galerię o około 28 px w prawo → finalnie x481.
6. Panoramiczny asset nie zachowywał kadru → wycięto trzy fotografie z V7-08.
7. Pierwszy pass rozciągał zdjęcia do około 371 px wysokości → finalnie 344 px.
8. Pierwszy pass miał zbyt wąską drugą akcję → finalnie około 244 px.
9. Prawa kolumna była około 6–10 px za daleko w lewo → padding skorygowany do
   osi x≈1137.
10. Pierwszy test axe wykrył błędne opakowanie `dt/dd` w `span` → struktura
    `<dl>` została poprawiona bez wyłączania reguły i finalny axe przechodzi.

## Artefakty i ocena

- `artifacts/visual-qa/landing-desktop-v7/d4/reference-fragment-941x325.png` —
  natywny fragment overview;
- `artifacts/visual-qa/landing-desktop-v7/d4/reference-scaled-1672x576.png` —
  wersja pomocnicza wyłącznie do overlayu;
- `artifacts/visual-qa/landing-desktop-v7/d4/before-1672.png` — stara sekcja;
- `artifacts/visual-qa/landing-desktop-v7/d4/pass-1-1672.png` — pierwszy pass;
- `artifacts/visual-qa/landing-desktop-v7/d4/after-1672.png` — finalny render;
- `artifacts/visual-qa/landing-desktop-v7/d4/overlay-compositional-1672.png` —
  overlay 45%;
- `artifacts/visual-qa/landing-desktop-v7/d4/difference-compositional-1672.png` —
  różnica kompozycyjna;
- `artifacts/visual-qa/landing-desktop-v7/d4/diff.md` — skrócony protokół.

Ocena: **19/20** — kompletność 4, geometria 4, typografia 4, gęstość 4,
transformacja mobile 3. Mobile przechodzi reflow i smoke, ale nie ma osobnej
zaakceptowanej referencji tego regionu.

## Gate

- `pnpm format:check` — PASS po formatowaniu testu;
- `pnpm lint` — 8/8 PASS;
- `pnpm typecheck` — 8/8 PASS;
- `pnpm test:unit` — 15/15 zadań PASS; web 85/85;
- `pnpm build` — 8/8 PASS, 39 tras, widget 17 269 B gzip;
- `pnpm exec playwright test tests/e2e/marketing.spec.ts` — finalnie 21/21 PASS;
- axe, klawiatura, no-JS, reduced motion, forced colors, reflow, CTA i brak
  poziomego overflow — PASS.

## Ryzyka i kryteria odbioru

- Fotografie pochodzą z pomniejszonego overview i mogą być delikatnie miękkie
  na ekranie HiDPI; odpowiadają jednak zaakceptowanej scenie dokładniej niż
  wcześniejszy panoramiczny asset.
- Brak natywnego kadru 1672 × 941 uniemożliwia uczciwy pixel diff; geometria jest
  oceniana proporcjami i overlayem kompozycyjnym.
- API, baza, tenant scope, RLS, scoring i inne trasy nie zostały zmienione.
- `artifacts/promo/` pozostał nietknięty.

Następna dozwolona sekcja to wyłącznie integracje i automatyzacje według
`reference/04-integrations.png`, z zachowaniem tylko faktycznie istniejących
kanałów, po czym STOP.

```text
STOP — D4 LEAD ZAKOŃCZONY. INTEGRACJI NIE ROZPOCZĘTO.
```
