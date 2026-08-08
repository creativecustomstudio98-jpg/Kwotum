# Landing desktop V7 — raport odbioru D1

**Status:** PASS lokalny; etap zamknięty i zatrzymany przed D2
**Data:** 2026-08-02
**Referencja:** `reference/01-hero.png`, 1672 × 941 px, SHA-256
`7113a8acc45f48e7488bb39fe1f9f4bd2933137c845e429ed4bdb7664adf41df`

## Zakres

D1 zmienia wyłącznie home-only header, pierwszy fold `/` i pasek pod hero.
Pozostałe pięć aktywnych rozdziałów strony, interaktywne demo, logika produktu,
panel oraz bezpieczeństwo danych nie zostały przebudowane.

Hero nie używa już rastrowego telefonu. Formularz klienta, dashboard leada,
score, karty informacji i następny krok są semantyczną sceną React + CSS.
Reference-only elementy bez potwierdzenia produktowego zastąpiono uczciwymi
odpowiednikami:

- fikcyjne logotypy klientów → firmy usługowe, agencje i realne kanały;
- „Umów demo” bez terminarza → działający link `Zobacz demo`;
- niepotwierdzone menu → istniejące trasy i sekcje;
- dane kontaktowe → jawny fixture demonstracyjny bez prawdziwego PII.

## Potwierdzona geometria 1672 × 941

| Region            |                      Referencja |           Implementacja finalna |
| ----------------- | ------------------------------: | ------------------------------: |
| header            |                        `y 0–96` |                        `y 0–96` |
| oś kontenera      |                     `x 64–1608` |                     `x 64–1608` |
| hero              |                      `y 96–807` |                      `y 96–807` |
| dashboard         | około `x 880–1608`, `y 125–735` | około `x 880–1608`, `y 126–731` |
| formularz overlay |  około `x 696–925`, `y 257–752` |  około `x 697–927`, `y 258–753` |
| pasek pod hero    |                     `y 807–941` |                     `y 807–941` |

Osiami krytycznymi były wspólne 64 px headera i copy, prawa krawędź 1608 px,
nałożenie formularza na dashboard oraz dokładny start paska przy 807 px. Te
relacje przechodzą review overlay. Znormalizowany RMSE całego kadru wynosi
`0.167012`; nie jest kryterium samodzielnego PASS, ponieważ copy, logotypy i
fixture celowo nie są kopią niezatwierdzonych twierdzeń z obrazu.

## Artefakty

- `artifacts/visual-qa/landing-desktop-v7/d1/pass-1-1672x941.png` — pierwszy
  render przed korektą łamania H1 i osi sceny;
- `artifacts/visual-qa/landing-desktop-v7/d1/pass-2-1672x941.png` — drugi
  render po ustawieniu dashboardu i telefonu;
- `artifacts/visual-qa/landing-desktop-v7/d1/after-1672x941.png` — finalny
  render odbiorowy;
- `artifacts/visual-qa/landing-desktop-v7/d1/overlay-45-1672x941.png` — overlay
  referencja/produkcja;
- `artifacts/visual-qa/landing-desktop-v7/d1/difference-1672x941.png` —
  bezwzględna różnica pikseli;
- snapshoty Playwright hero: 1440, 1024, 768, 390 i 320 px.

## Gate

- `pnpm --filter @wyceno/ui test -- --run` — 23/23 PASS;
- `pnpm lint` — 8/8 PASS;
- `pnpm --filter @wyceno/web typecheck` — PASS;
- `pnpm test:unit` — 147/147 PASS;
- `pnpm test:rls` — PASS po uruchomieniu z wymaganym dostępem do pamięci
  współdzielonej PostgreSQL;
- `pnpm test:wordpress` — PASS dla WordPress 6.9.2 i 7.0.2 / PHP 8.5.2;
- `pnpm build` — 8/8 PASS, 39 tras, widget 17 269 B gzip;
- `pnpm exec playwright test tests/e2e/marketing.spec.ts` — 21/21 PASS;
- axe WCAG A/AA/2.1/2.2 AA, klawiatura, reflow, forced colors, no-JS i brak
  poziomego overflow — PASS w zestawie marketingowym.

## Ryzyka i następny etap

Stare reguły hero i dwa nieużywane już WebP pozostają do kontrolowanego cleanupu
w D5; nie zostały usunięte w tym etapie. Podstawowe breakpointy zachowują smoke
regresyjny, ale właściwy redesign mobile pozostaje poza programem desktopowym.

Następny dozwolony etap to D2: wyłącznie sekcja trzech kroków według
`reference/02-process.png`, z osobnym kadrem 1672 × 941 i kolejnym STOP.

```text
STOP — D1 ZAKOŃCZONY. HEADER + HERO + PASEK POD HERO ODEBRANE. D2 NIE ROZPOCZĘTO.
```
