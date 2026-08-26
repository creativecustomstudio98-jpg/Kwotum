# PROMPT 02 — PX2 wersjonowany schema prezentacji

Pracujesz wyłącznie nad modelem i kompatybilnością. Runtime ma wyglądać tak jak
przed etapem.

## Zadanie

1. Zapisz ADR przed zmianą architektury.
2. Zaprojektuj minimalny FlowDocument v3 z `experienceMode`, prezentacją kroku
   i prezentacją opcji. Nie dodawaj pól bez konsumenta w PX3/PX4.
3. Zdefiniuj allowlistę ikon i referencję do kontrolowanego assetu; zakazane są
   dowolne URL, SVG, HTML, style i data URI.
4. Dodaj migrator v1/v2 → v3 działający w pamięci, bez przepisywania snapshotów.
5. Rozszerz walidację TypeScript i niezależną walidację PostgreSQL.
6. Rozszerz publiczny manifest wyłącznie o pola wymagane rendererowi.
7. Dodaj limity dokumentu, tekstu, liczby opcji i prezentacji.
8. Dodaj fixtures kompatybilności, round-trip, błędnych referencji i drugiego
   tenanta.

## Gate

Format, lint, typecheck, unit, RLS, build, budget manifestu i test publikacji
historycznego v1/v2. Brak zmiany screenshotu widgetu jest kryterium odbioru.
Raport i STOP.
