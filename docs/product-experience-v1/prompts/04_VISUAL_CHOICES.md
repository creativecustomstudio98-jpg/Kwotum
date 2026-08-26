# PROMPT 04 — PX4 visual choices

Dodaj tylko warianty, których użycie zostało uzasadnione w PX1. Nie zamieniaj
wszystkich pytań w kafelki.

## Kolejność

1. `text_cards` z opisem opcji.
2. `icon_cards` z zamkniętej biblioteki.
3. `image_cards` dopiero po zatwierdzeniu bezpiecznego asset pipeline.
4. `swatches` wyłącznie z etykietą i niekolorowym stanem wyboru.

## Wymagania

- Builder i preview pokazują dokładnie publiczną kompozycję.
- Ustawienie kolumn jest ograniczone i ma responsywny fallback.
- Wybranie opcji jest widoczne przez minimum dwa sygnały, w tym niekolorowy.
- Brak assetu nie zmienia znaczenia, routingu ani ceny.
- Media mają limity wymiaru/formatu, lazy loading, stabilny aspect ratio i alt.
- Ikony są semantyczne i spójne kreską; żadnych emoji i przypadkowych symboli.

## Visual QA

Zablokuj osobne referencje dla co najmniej: usługa/icon cards, styl/image cards,
budżet/list oraz mobile. Porównuj geometrię, hierarchię, selected, focus, error,
disabled, loading assetu i fallback. Raport i STOP.
