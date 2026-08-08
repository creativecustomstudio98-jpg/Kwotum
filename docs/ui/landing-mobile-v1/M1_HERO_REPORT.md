# Landing mobile V1 — raport M1 header + hero

**Status:** PASS lokalny; M1 zamknięty
**Data:** 2026-08-02
**Viewporty odbioru:** 320, 375, 390 i 430 px
**Desktop regression:** 1440 × 1000 px

## Zakres

Etap obejmuje wyłącznie home-only header, menu mobilne, copy hero, oba CTA,
trzy fakty, code-native scenę produktu oraz pasek sześciu zastosowań. Treść i
semantyka pozostają z V7; V6 mobile służy wyłącznie jako wzorzec pionowej
hierarchii i kadrowania.

Nie zmieniono dalszych sekcji, API, routingu, auth, RLS, tenant scope, pricingu
ani scoringu. Nie wykonano cleanupu legacy D5.

## Główna diagnoza

Jednokolumnowy grid używał toru `1fr`, a dwa wiersze H1 miały desktopowe
`white-space: nowrap`. Min-content rozszerzał tor mimo deklarowanej szerokości
kontenera. `overflow: hidden` na hero maskował błąd, więc `scrollWidth` błędnie
wyglądał poprawnie.

## Geometria przed i po

| Pomiar            |                        Przed |                       Po |
| ----------------- | ---------------------------: | -----------------------: |
| H1 przy 390 px    | `x=16, w=397,1, right=413,1` | `x=16, w=358, right=374` |
| CTA przy 390 px   |              `w=397,1, h=64` |            `w=358, h=56` |
| hero przy 390 px  |                    1504,5 px |                1284,2 px |
| scena przy 390 px |                około `y=794` |                `y=669,6` |
| H1 przy 320 px    | `x=16, w=346,7, right=362,7` | `x=12, w=296, right=308` |
| CTA przy 320 px   |              `w=346,7, h=64` |            `w=296, h=56` |
| hero przy 320 px  |                      1484 px |                1287,2 px |
| menu              |                   44 × 44 px | 44 × 44 px z czytelnym X |

Przy 375 px największa prawa krawędź kontrolowanego regionu wynosi 359 px, a
przy 430 px 414 px. Każdy region zachowuje 16 px bezpiecznego marginesu; przy
320 px kompaktowy wariant używa 12 px.

## Decyzje projektowe

- `grid-template-columns: minmax(0, 1fr)` i `min-width: 0` usuwają źródło
  min-content overflow zamiast je maskować;
- H1 używa `clamp(2.2rem, 10.8vw, 2.7rem)`, `text-wrap: balance` i kontrolowanego
  łamania, dzięki czemu zachowuje trzy czytelne linie przy 320–430 px;
- oba CTA są pełnoszerokościowe, mają 56 px wysokości i 16 px tekst;
- trzy fakty tworzą skanowalną siatkę 3-kolumnową z ikonami i tekstem 12 px;
- scena produktu jest świadomie kadrowana w kontenerze 432 px, ale sam kontener
  zawsze mieści się w bezpiecznej osi;
- pasek zastosowań używa 2 × 3 elementów, 12 px tekst i normalne zawijanie;
- menu ma sześć wierszy po 60 px, akcje po 52 px, safe-area padding, focus trap,
  Escape, focus return i blokadę scrolla;
- hamburger używa stabilnej geometrii absolutnej i po 160 ms przechodzi w
  symetryczny znak zamknięcia.

## Artefakty

- baseline: `artifacts/visual-qa/landing-mobile-v1/m0/before-fold-390.png`;
- baseline pełny: `artifacts/visual-qa/landing-mobile-v1/m0/before-full-390.png`;
- finalny fold 390: `artifacts/visual-qa/landing-mobile-v1/m1/after-fold-390.png`;
- finalny fold 320: `artifacts/visual-qa/landing-mobile-v1/m1/after-fold-320.png`;
- finalna strona 390: `artifacts/visual-qa/landing-mobile-v1/m1/after-full-390.png`;
- finalne menu: `artifacts/visual-qa/landing-mobile-v1/m1/after-menu-390.png`;
- side-by-side: `artifacts/visual-qa/landing-mobile-v1/m1/before-after-fold-390.png`;
- opis różnic: `artifacts/visual-qa/landing-mobile-v1/m1/diff.md`.

RMSE: **nie dotyczy** — V6 i V7 mają inną treść. Ocena visual QA: **19/20** —
kompletność 4, geometria 4, typografia 4, gęstość 3, transformacja mobile 4.

## Gate i bezpieczeństwo

- geometria 320/375/390/430 px i cele dotykowe — PASS;
- menu: focus trap, Escape, focus return, scroll lock — PASS;
- axe, klawiatura, no-JS, reduced motion i forced colors — PASS;
- marketingowy Playwright — 25/25 PASS;
- format plików etapu — PASS;
- `pnpm lint` — 8/8 PASS;
- `pnpm typecheck` — 8/8 PASS;
- `pnpm test:unit` — 15/15 zadań PASS; web 85/85;
- `pnpm build` — 8/8 PASS, 39 tras, widget 17 269 B gzip;
- `pnpm format:check` — wyjątek worktree: FAIL wyłącznie na nietkniętych
  `artifacts/promo/lorum-launch-v2/STORYBOARD.md`,
  `artifacts/promo/lorum-launch-v3/STORYBOARD.md`,
  `artifacts/promo/lorum-launch-v4/STORYBOARD.md`,
  `artifacts/promo/lorum-launch-v5/scripts/capture_ui.cjs` i
  `artifacts/promo/lorum-launch-v5/ui/mobile-lead.html`;
- `git diff --check` — PASS;
- desktopowy snapshot 1440 × 1000 pozostał bez zmiany;
- nowe zależności: brak; logika produktu i dane: bez zmian.

## Ryzyka i następny etap

Wewnętrzne teksty dekoracyjnej sceny są małe, ale cały proof jest
`aria-hidden`, a pełny opis zapewnia `figcaption`. Nie jest to działający
formularz ani źródło treści dla czytnika ekranu. Dalsze sekcje zachowują obecny
reflow i będą poprawiane osobno.

Następny dozwolony etap: **M2 — trzy kroki procesu**. Nie rozpoczynaj M3 ani
cleanupu D5 w tym samym przebiegu.

```text
STOP — M1 HEADER + HERO ZAKOŃCZONE. M2 NIE ROZPOCZĘTO.
```
