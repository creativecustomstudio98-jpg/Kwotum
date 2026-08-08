# Landing desktop V7 — raport odbioru D2

**Status:** PASS lokalny; etap zamknięty i zatrzymany przed D3
**Data:** 2026-08-02
**Referencja:** `reference/02-process.png`, 1672 × 941 px, SHA-256
`e7ce0ef29bd71eb4246aa68e3efec06f0f82a47acdfc28a6f57387206962d025`

## Zakres

D2 przebudowuje wyłącznie sekcję `guided-flow` pod hero. Poprzedni storyboard
zapytanie → rail → lead został zastąpiony trzema równorzędnymi, semantycznymi
krokami zgodnymi z V7-02:

1. zebranie kompletu informacji;
2. analiza kompletności, kwalifikacja i uporządkowanie;
3. przekazanie gotowego leada wraz z kolejnym krokiem.

Numery, ikony i strzałki są code-native SVG/CSS. Sekcja pozostaje uporządkowaną
listą i nie zawiera atrap kontrolek ani obietnicy automatycznego uzupełniania
danych za klienta.

## Potwierdzona geometria 1672 × 941

| Region             |           Referencja | Implementacja finalna |
| ------------------ | -------------------: | --------------------: |
| sekcja             |         `1672 × 941` |          `1672 × 941` |
| karty              |    około `y 354–750` |     około `y 353–748` |
| karta 1            |    około `x 129–570` |     około `x 128–569` |
| karta 2            |   około `x 616–1056` |    około `x 615–1057` |
| karta 3            |  około `x 1103–1543` |   około `x 1103–1544` |
| dolna powierzchnia | koniec około `y 827` |  koniec około `y 827` |

Łączniki mają 64 px i są osadzone pośrodku przerw między kartami. Numery mają
około 42 px, a oprawy ikon 80 px. Znormalizowany RMSE całej sekcji wynosi
`0.107663`. Wartość wspiera overlay, ale nie zastępuje review semantycznego i
typograficznego.

## Artefakty i ocena

- `artifacts/visual-qa/landing-desktop-v7/d2/pass-1-1672x941.png` — pierwszy
  render, który ujawnił pattern przez całą szerokość i zbyt mały tekst kart;
- `artifacts/visual-qa/landing-desktop-v7/d2/after-1672x941.png` — finalny kadr
  samej sekcji bez nakładki sticky header;
- `artifacts/visual-qa/landing-desktop-v7/d2/overlay-45-1672x941.png` — overlay;
- `artifacts/visual-qa/landing-desktop-v7/d2/difference-1672x941.png` —
  bezwzględna różnica;
- snapshoty Playwright guided-flow: 1440, 1024, 768, 390 i 320 px.

Ocena: **19/20** — kompletność 4, geometria 4, typografia 4, gęstość 4,
transformacja mobile 3. Mobile ma smoke regresyjny i poprawny reflow, ale nie
ma dostarczonej referencji pozwalającej przyznać pełny punkt transformacji.

## Gate

- `pnpm lint` — 8/8 PASS;
- `pnpm typecheck` — 8/8 PASS;
- `pnpm build` — 8/8 PASS, 39 tras, widget 17 269 B gzip;
- `pnpm exec playwright test tests/e2e/marketing.spec.ts` — 21/21 PASS;
- axe, klawiatura, no-JS, reduced motion, forced colors, reflow i brak
  poziomego overflow — PASS w zestawie marketingowym.

## Następny etap

Następny dozwolony etap to D3: wyłącznie sekcja czterech kluczowych informacji
według `reference/03-key-information.png`, z osobnym kadrem 1672 × 941 i STOP.

```text
STOP — D2 ZAKOŃCZONY. SEKCJA TRZECH KROKÓW ODEBRANA. D3 NIE ROZPOCZĘTO.
```
