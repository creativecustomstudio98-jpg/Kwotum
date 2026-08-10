# Landing desktop V7 — raport odbioru finalnego CTA

**Status:** PASS lokalny; panel zamknięty przed audytem footera i overview
**Data:** 2026-08-02
**Viewport:** 1672 × 941 px
**Referencja:** `reference/07-final-cta.png`, SHA-256
`da0587ba1ecc2694186ad84ef9f5aaf52f5101f944f273cf5cfadf5afcc95282`

## Zakres i źródło prawdy

Mikroetap dodaje wyłącznie sekcję `data-home-section="final-cta"` pomiędzy FAQ
a istniejącym footerem. Odtwarza V7-07: duży panel z logo, asymetryczne copy,
dwa CTA, trzy dolne fakty oraz dwie górne i jedną dolną kartę proof.

Liczby 128, +20%, 72, +15% oraz procenty 85/72/68/61 z referencji nie są
potwierdzonymi wynikami Lorum. Zostały zastąpione faktami widocznymi na stronie:
pięcioma grupami danych przykładowego leada, czterema istniejącymi kanałami i
jawnie demonstracyjnym score 87/100 z wyjaśnialnymi powodami.

## Implementacja i uczciwość produktu

- główne CTA „Zobacz demo” prowadzi do `#przykladowy-lead`;
- drugie CTA „Poznaj produkt” prowadzi do istniejącej strony `/produkt`;
- pięć grup oznacza budżet, termin, lokalizację, pliki i następny krok pokazane
  w przykładzie leada;
- cztery kanały odpowiadają e-mailowi, webhookowi, WordPressowi i hosted linkowi
  opisanym w sekcji integracji;
- wynik 87/100 jest jawnie oznaczony jako przykładowy i powtarza fixture
  demonstracyjnego leada, a nie statystykę klientów;
- dolne fakty powtarzają zatwierdzone warunki: jeden proces na start,
  indywidualna wycena i decyzja po pilotażu;
- nie dodano KPI, trendów, wzrostów, opinii, formularza kontaktowego ani
  gwarancji efektu;
- UI i delikatne łuki są code-native HTML/CSS; nie dodano rastrów;
- API, baza, autoryzacja, RLS, tenant scope, pricing i scoring nie zostały
  zmienione.

## Potwierdzona geometria 1672 × 941 px

| Region      |  Referencja V7-07 |       Implementacja finalna |
| ----------- | ----------------: | --------------------------: |
| sekcja      |      `1672 × 941` |                `1672 × 941` |
| panel       |      `x 64, y 80` |              `x 64, y 79.8` |
| panel       |      `1544 × 777` |                `1544 × 777` |
| logo        |    `x 115, y 126` |          `x 116.2, y 128.0` |
| kicker      |     około `y 218` |                   `y 217.6` |
| H2          |     około `x 115` |                   `x 116.2` |
| H2          |        trzy linie |            `534 × 194.4 px` |
| opis        |     około `y 509` |                   `y 508.8` |
| CTA         |     około `y 640` | `y 641.9`, wysokość `68 px` |
| proof       |    `x 866, y 188` |          `x 866.6, y 188.0` |
| proof       | około `674 × 566` |                 `674 × 566` |
| dolne fakty |     około `y 770` |                   `y 770.8` |

Desktop nie ma poziomego overflow. Przy 1440 px copy i proof pozostają obok
siebie. Przy 1024 px panel przechodzi do kolejnych bloków, przy 768 px karty
proof układają się pionowo, a 390/320 px zachowują kolejność i tekst ≥12 px.

## Dwa passy i główne korekty

1. Przed mikroetapem region finalnego CTA nie istniał; po FAQ następował footer.
2. Pierwszy pass trafił w panel `x 64 / y 79.8 / 1544 × 777` oraz proof
   `x 866.6 / y 188.0 / 674 × 566` bez późniejszego przesuwania.
3. H2 miał szerokość 568 px i łamał „kwalifikować leady jak” w drugim wierszu.
4. Szerokość H2 zmniejszono z `9.5em` do `8.9em`, uzyskując podział
   „Gotowy, aby” / „kwalifikować leady” / „jak najlepiej?”.
5. Opis przesunięto z `y 498.4` do `y 508.8`.
6. CTA przesunięto z `y 631.5` do `y 641.9`, zachowując 68 px wysokości.
7. Logo przesunięto z `y 126.4` do `y 128.0`.
8. Dolne fakty przesunięto z `y 768.8` do `y 770.8` i ustawiono na osiach
   około `x 116/292/556`.
9. Etykiety dwóch górnych kart przesunięto w dół bez tworzenia wykresów trendu.
10. Podgląd przeglądarkowy potwierdził `#przykladowy-lead` i przejście do
    `/produkt`; Playwright powtórzył oba kontrakty.

## Artefakty i visual QA

- `artifacts/visual-qa/landing-desktop-v7/final-cta/before-1672x941.png`;
- `artifacts/visual-qa/landing-desktop-v7/final-cta/pass-1-1672x941.png`;
- `artifacts/visual-qa/landing-desktop-v7/final-cta/after-1672x941.png`;
- `artifacts/visual-qa/landing-desktop-v7/final-cta/overlay-1672x941.png`;
- `artifacts/visual-qa/landing-desktop-v7/final-cta/difference-1672x941.png`;
- `artifacts/visual-qa/landing-desktop-v7/final-cta/diff.md`.

Finalny znormalizowany RMSE: **0,146519**. Największa kontrolowana różnica
wynika z zastąpienia fikcyjnych KPI, trendów i procentów rzeczywistym zakresem
oraz demonstracyjnym wynikiem. Krytyczne osie panelu, proof, opisu, CTA i faktów
odbiegają od referencji o około 0–2 px.

Ocena visual QA: **19/20** — kompletność 4, geometria 4, typografia 4,
gęstość 4, transformacja mobile 3. Mobile przechodzi reflow i smoke, ale nie ma
osobnej zaakceptowanej referencji tego regionu.

## Gate

- `pnpm exec prettier --check <pliki mikroetapu>` — PASS;
- `pnpm format:check` — wyjątek worktree: FAIL wyłącznie na nieśledzonych
  `artifacts/promo/lorum-launch-v2/STORYBOARD.md` i
  `artifacts/promo/lorum-launch-v3/STORYBOARD.md`; pliki nie należą do etapu i
  pozostały nietknięte;
- `pnpm lint` — 8/8 PASS;
- `pnpm typecheck` — 8/8 PASS;
- `pnpm test:unit` — 15/15 zadań PASS; web 85/85;
- `pnpm build` — 8/8 PASS, 39 tras, widget 17 269 B gzip;
- `pnpm exec playwright test tests/e2e/marketing.spec.ts` — 23/23 PASS;
- axe, klawiatura, no-JS, reduced motion, forced colors, breakpointy i brak
  poziomego overflow — PASS;
- test blokuje w finalnym CTA liczby 128, +20%, +15% i procenty 85/72/68/61.

## Ryzyka i kryteria odbioru

- Liczby 5 i 4 opisują pokazany zakres, nie wyniki biznesowe ani limity planu.
- Score 87/100 jest fixture'em demonstracyjnym, nie średnią klientów.
- CTA demo przewija do istniejącego przykładu; nie udaje formularza spotkania.
- Footer pozostaje istniejącym, osobnym regionem do kolejnego audytu V7-08.
- Stare, nieużywane selektory pozostają do audytowanego cleanupu D5.
- `artifacts/promo/` pozostał nietknięty; jego niezależne błędy Prettiera są
  jedynym wyjątkiem pełnego root gate'u.

Następny dozwolony mikroetap to wyłącznie integracja istniejącego footera i
kompozycyjny audyt V7-08 całej strony, bez cleanupu legacy.

```text
STOP — FINALNE CTA ZAKOŃCZONE. FOOTERA I OVERVIEW NIE ROZPOCZĘTO.
```
