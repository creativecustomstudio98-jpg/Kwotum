# PROMPT 09 — ANALITYKA


> **V6 IMAGE-LOCKED — obowiązuje nadrzędnie**
>
> Przed wykonaniem tego etapu przeczytaj `CODEX_MASTER_PROMPT.md`, sprawdź obrazy załączone do bieżącej wiadomości oraz właściwe cropy z `docs/ui/references/derived/`. Obrazy są specyfikacją, nie inspiracją. Nie upraszczaj kompozycji, gęstości, inner UI ani mobile. Ten etap działa według zasady: `1 prompt = 1 mały etap = 1 branch = 1 końcowy commit`. Wymagane: reference → before → after-v1 → overlay → poprawki → after-v2 → overlay → layout/a11y/tests/build → raport → STOP.

## Cel

Pokazać użyteczne informacje o przejściu procesu i jakości leadów, bez dashboardowego teatru.

## Referencje

- `reference/screenshots/analytics-desktop.png`,
- `reference/boards/board-03-growth-delivery.png`.

## Zakres

- kontekst: flow, wersja, okres,
- rozpoczęcia,
- ukończenia,
- leady,
- conversion rate,
- średni czas,
- lejek kroków,
- drop-off,
- trend,
- źródła,
- urządzenia,
- jakość leadów,
- porównanie wersji, gdy dane wystarczają.

## Product/Data pass

Dla każdej metryki opisz:

- definicję,
- event source,
- denominator,
- timezone,
- tenant scope,
- delay/freshness,
- minimum sample size.

Nie zmieniaj semantyki eventów bez migracji i decyzji.

## UX pass

- najpierw lejek i problem,
- potem trend,
- potem segmenty,
- wykres ma mieć kontekst i jednostki,
- brak danych → komunikat + akcja,
- mała próbka → ostrzeżenie, nie fałszywa precyzja.

## Mobile

- 2 kolumny metric cards,
- wykresy pełna szerokość,
- tabela źródeł jako list rows,
- filtry w drawer,
- tooltip dostępny po tapnięciu.

## Performance

- agregacje po stronie serwera/bazy,
- indeksy zgodne z architekturą,
- brak pobierania surowych eventów do klienta dla prostego wykresu,
- caching tylko bezpieczny tenantowo,
- pagination dla źródeł/wersji.

## QA

- brak danych,
- mała próbka,
- różne timezone,
- duży wolumen,
- błędny event,
- wersja flow usunięta/archiwalna,
- mobile,
- screen reader summary wykresu.

## Gate

- każda liczba ma definicję,
- brak zmyślonych wykresów,
- visual diff wykonany,
- testy agregacji przechodzą,
- zatrzymaj się.
