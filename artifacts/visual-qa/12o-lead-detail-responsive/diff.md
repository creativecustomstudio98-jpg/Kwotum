# Visual QA — responsywna szerokość szczegółów leada

**Data:** 2026-07-29  
**Viewporty:** 1536 × 1024 i 390 × 844  
**Referencja:** `lead-detail-compact.png`, 405 × 301

## Problem

Dokument leada miał stały limit 1120 px i był centrowany w obszarze 1328 px.
Na szerokim desktopie pozostawiał przez to dwa zbędne pasy, a panel wyniku
pozostawał na stałej szerokości 760 px. Tekst 9–10 px był zbyt mały dla
rzeczywistego ekranu aplikacji. Na mobile kafle materiałów powodowały 32 px
poziomego overflow.

## Korekta

- dokument ma 1280 px i wykorzystuje pełny obszar roboczy z marginesem 24 px;
- panel wyniku skaluje się do 74% treści i ma 916 px przy 1536 px;
- prawa kolumna rośnie do 419 px;
- tekst operacyjny ma 11–13 px zamiast 9–10 px;
- na mobile dokument ma 370 px przy viewport 390 px;
- wynik, prawa kolumna i materiały wykorzystują pełną szerokość 344 px;
- materiały przechodzą w responsywną siatkę trzech elastycznych kolumn;
- dokument nie ma poziomego overflow;
- trzy kolory niespełniające kontrastu zostały przyciemnione.

## Weryfikacja

- izolowany Playwright: PASS;
- axe WCAG A/AA/2.1 AA/2.2 AA: zero naruszeń;
- pełnowierszowe dane, formularz notatki, status i CTA zachowują działanie;
- loading i error state dziedziczą pełną szerokość tego samego dokumentu.

## Artefakty

- `reference.png`
- `before-1536x1024.png`, `before-normalized.png`
- `after-production-1536x1024.png`, `after-production-390x844.png`
- `after-normalized.png`, `overlay.png`, `difference.png`
- `reference-left-after-right.png`
