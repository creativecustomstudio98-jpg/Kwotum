# PX4 — visual choices

**Status:** ukończony lokalnie 2026-08-25; bez deployu.

**Główne pliki:** katalog ikon, kontrolowany model assetów, builder, preview,
widget, centralne tokeny, visual QA.  
**Zakazane:** stockowe dekoracje, dowolne URL/SVG/HTML/CSS, obraz bez etykiety.

## Wynik

Karty tekstowe, ikonowe i obrazowe są zaimplementowane lokalnie. Karty obrazowe
działają wyłącznie przez zatwierdzony tenantowy asset pipeline; nie wolno
zastąpić go publicznym URL-em użytkownika.

## Ryzyka

AI slop, przypadkowe piktogramy, CLS, ciężki bundle, kontrast selected/focus i
przeniesienie znaczenia wyłącznie do obrazu.

## Stan wykonania

- [x] Runtime `text_cards` renderuje osobno etykietę i opis, z natywnym inputem.
- [x] Test potwierdza brak obrazu i SVG w wariancie tekstowym.
- [x] Builder pozwala świadomie wybrać wariant i uzupełnić komplet opisów.
- [x] `icon_cards` korzysta wyłącznie z autorskiego, zamkniętego katalogu.
- [x] Publiczny runtime i podgląd buildera używają tego samego renderera.
- [x] Mobilna zmiana kroku przywraca początek treści i fokus pytania.
- [x] Tenantowy rejestr assetów, kontrola własności i publiczna projekcja.
- [x] `image_cards`, fallback, lazy-loading, CLS i pełny visual QA.
