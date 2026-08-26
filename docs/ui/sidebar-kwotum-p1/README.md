# Finalny sidebar Kwotum — P1

**Status:** P1 wdrożony i odebrany 19/20
**Data blokady:** 2026-08-13
**Zakres:** desktopowy sidebar i konieczna kolumna app shellu

## Referencja

- plik: `reference/sidebar-kwotum.png`;
- rozmiar: 863 × 1822 px;
- SHA-256:
  `ea188a170b984ae7554d94baefd62913175e657d9bfd0595ad7a02d321efbe87`;
- obraz pokazuje expanded i collapsed obok siebie wyłącznie porównawczo;
- specyfikacja liczbowa właściciela ma pierwszeństwo przed obrazem.

## Zamknięty zakres

- expanded 256 px, collapsed 72 px, wysokość 100dvh;
- płaskie tło `#0D2B24`, bez gradientów, glass, blur, poświaty i cienia;
- grupy Praca, Narzędzia i System;
- aktywna zakładka z dwoma ścięciami po prawej;
- rzeczywiste dane organizacji i profilu oraz istniejące capabilities;
- lokalny Instrument Sans Variable i code-native SVG;
- mobile zachowuje istniejącą dolną nawigację.

## Font

- upstream: `https://github.com/Instrument/instrument-sans`;
- commit: `7fa22308a3d0c94ee2b3cd537a1196b65db34a3e`;
- plik runtime: `apps/web/app/fonts/instrument-sans/InstrumentSansVariable.woff2`;
- SHA-256:
  `aa72922aafcc0dc18f36ec1d805b0212057dabe8b9d5b8b57f67035aea1b826d`;
- licencja: SIL Open Font License 1.1, zachowana obok fontu jako `OFL.txt`.

## Korekta wag 12ZP

Review produkcji z 2026-08-13 zachowuje Instrument Sans i całą geometrię P1,
ale usuwa arbitralne, optycznie zbyt ciężkie wagi. Runtime używa wyłącznie
centralnych tokenów:

- marka: 600;
- etykiety grup, aktywna pozycja, avatar i nazwa konta: 500;
- organizacja, zwykłe pozycje, utilities i opis organizacji: 400.

Korekta nie zmienia rozmiarów tekstu, wierszy 48 px, ikon, kolorów,
active clip-path ani wariantu collapsed.

## Visual QA

Artefakty znajdują się w `artifacts/visual-qa/sidebar-kwotum-p1/` dla
1440 × 1024 expanded/collapsed, 1280 × 800, 1024 × 768 i istniejącego mobile.
Pełne rendery, cropy, znormalizowane overlaye/diffy, pomiary, axe, klawiatura,
persistence i reduced motion zostały odebrane z wynikiem 19/20. Szczegóły:
`VISUAL_QA_REPORT.md`.

Dodatkowy crop po korekcie wag znajduje się w
`artifacts/visual-qa/12zp-panel-typography/after-sidebar-256x1024.png`.
