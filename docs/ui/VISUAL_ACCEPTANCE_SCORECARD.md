# Lorum — scorecard odbioru wizualnego

**Status:** CANONICAL
**Owner:** Visual Regression QA
**Last reviewed:** 2026-07-26

Każdy ekran i sekcja otrzymuje 0–2 pkt w każdej kategorii:

1. kompletność regionów,
2. geometria główna,
3. proporcje paneli,
4. gęstość danych,
5. typografia,
6. spacing i alignment,
7. surfaces/border/radius/shadow,
8. komponenty i ikony,
9. responsive transformation,
10. stany i interakcje.

## Gate

- minimum 18/20,
- kategorie 1, 2, 4 i 9 nie mogą mieć 0,
- brak P0/P1,
- brak globalnego horizontal overflow,
- brak overlap/clipping,
- screenshot reference/before/after/overlay obecny,
- lint/typecheck/tests/build PASS,
- dokumentacja zaktualizowana.

## Tolerancje referencyjne

- container/section boundaries: 1–2% szerokości,
- główne proporcje kolumn: do 3%,
- kontrolki: do 2 px,
- główne spacingi: do 4 px,
- typografia: ten sam token lub do 1 px,
- liczba krytycznych regionów: 100%.

Odstępstwa wynikające z dostępności, realnej treści lub architektury wymagają wpisu w `docs/DECISIONS.md`.
