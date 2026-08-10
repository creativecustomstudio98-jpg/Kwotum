# Landing Lorum — trzy szklane powierzchnie produktu

Data: 2026-07-29  
Etap: 12ZB  
Trasa: `/`

## Cel

Zastąpić odrzucone telefony 3D i dekoracyjny render kompozycją, która pokazuje
rzeczywisty produkt. Hero ma przedstawiać relację:

`proces klienta → reguły firmy → gotowy lead`.

## Wykonana zmiana

- hero składa się z trzech code-native ekranów HTML ustawionych w jednej
  perspektywie;
- ekran klienta pokazuje trzeci krok procesu i wybrany budżet;
- ekran buildera pokazuje to samo pytanie, opcje i uruchomioną regułę;
- ekran leada pokazuje zakres, budżet, termin, score i następny krok;
- efekt szkła wynika z obramowania, światła, refleksu, cienia i kolejności
  warstw CSS, a nie z bitmapy;
- pięć kart w telefonicznych ramach zostało usuniętych;
- landing ma sześć regionów: hero, prowadzony przepływ, demo, dokument decyzji,
  branże z publikacją oraz pilotaż.

Odrzucony wygenerowany render nie jest używany ani przechowywany w projekcie.

## Responsive

| Viewport    | Wynik | Kryterium                                            |
| ----------- | ----- | ---------------------------------------------------- |
| 1440 × 1000 | PASS  | trzy panele w jednym kadrze, brak kolizji z copy     |
| 1024 × 900  | PASS  | scena pozostaje czytelna po zmniejszeniu             |
| 768 × 1000  | PASS  | hero przechodzi do jednego ciągu bez overflow        |
| 390 × 844   | PASS  | warstwowy kadr mobile, trzy role nadal rozpoznawalne |
| 320 × 844   | PASS  | brak poziomego przewijania i utraty CTA              |

Przy 390 px pełna strona ma około 8,2 tys. px wysokości zamiast około 15 tys.
px poprzedniej wersji.

## Visual QA

| Artefakt                            | SHA-256                                                            |
| ----------------------------------- | ------------------------------------------------------------------ |
| `desktop/hero-1440x1000.png`        | `9b3a2469e6cc4249c870ac0935b00f3e54481272ff473baf9f5a1d7656b032a4` |
| `desktop/guided-flow-1440x1000.png` | `aed4c4b251107e41d8d49ed9b7a88936091afe22bf7c47b0478c2a8a614a3c4d` |
| `mobile/hero-390x844.png`           | `3aee47b628d88b0e55028feb736be9893a9555d1a1b1543da958bc08f9c23571` |
| `mobile/guided-flow-390x844.png`    | `615d1370d6154ddf4100f629e3cfade041484767eab65525b506b3e41796dd07` |

Katalog: `artifacts/visual-qa/landing-glass-panels/`.

## Weryfikacja

- `pnpm --filter @wyceno/web lint` — PASS;
- `pnpm --filter @wyceno/web typecheck` — PASS;
- `pnpm --filter @wyceno/web build` — PASS, 39 tras;
- `pnpm exec playwright test tests/e2e/marketing.spec.ts --update-snapshots=all`
  — 21/21 PASS;
- axe WCAG 2.2 AA — 0 naruszeń;
- klawiatura, menu mobilne, brak JavaScriptu, reduced motion, forced colors,
  interaktywne demo, SEO i brak overflow — PASS.

## Ryzyka i następny etap

Tekst wewnątrz paneli jest prawdziwym HTML, dlatego dłuższe copy może zmienić
kadr i wymaga ponownego visual regression 390/320 px. Przed publicznym
wdrożeniem nadal obowiązują gate’y Etapu 13, weryfikacja nazwy Lorum i staging.
