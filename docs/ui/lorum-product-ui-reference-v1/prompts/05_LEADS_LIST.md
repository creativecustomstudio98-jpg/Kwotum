# PROMPT 05 — LISTA LEADÓW


> **V6 IMAGE-LOCKED — obowiązuje nadrzędnie**
>
> Przed wykonaniem tego etapu przeczytaj `CODEX_MASTER_PROMPT.md`, sprawdź obrazy załączone do bieżącej wiadomości oraz właściwe cropy z `docs/ui/references/derived/`. Obrazy są specyfikacją, nie inspiracją. Nie upraszczaj kompozycji, gęstości, inner UI ani mobile. Ten etap działa według zasady: `1 prompt = 1 mały etap = 1 branch = 1 końcowy commit`. Wymagane: reference → before → after-v1 → overlay → poprawki → after-v2 → overlay → layout/a11y/tests/build → raport → STOP.

## Cel

Zbudować wydajną, zwartą kolejkę operacyjną zamiast galerii kart.

## Referencje

- `reference/screenshots/leads-desktop.png`,
- `reference/screenshots/leads-mobile.png`,
- `reference/boards/board-01-core-operations.png`.

## Desktop

- status tabs z liczbami,
- wyszukiwanie,
- filtry,
- aktywne filtry,
- wybór kolumn,
- tabela,
- sortowanie,
- paginacja/cursor,
- eksport zgodny z uprawnieniami,
- selekcja grupowa tylko dla realnych operacji.

Minimalne kolumny:

- klient/usługa,
- score,
- budżet/wartość,
- termin,
- status,
- źródło,
- data,
- działania.

## Mobile

Każdy rekord jako kompaktowa karta/list item:

- klient/usługa,
- score,
- status,
- najważniejsza wartość,
- telefon,
- e-mail,
- wejście w szczegóły.

Filtry w drawer/bottom sheet. Nie twórz poziomej tabeli.

## Wymagania funkcjonalne

- wyszukiwanie z debounce lub server-side zgodnie z istniejącą architekturą,
- sortowanie i filtr w URL, jeśli projekt już tak działa,
- zachowanie filtrów po powrocie,
- pagination bez duplikatów,
- uprawnienia do eksportu,
- loading skeleton zachowujący geometrię,
- empty wyników filtrów,
- empty całej organizacji,
- błąd pobierania,
- lead bez score/budżetu/telefonu.

## Anti-slop

- nie zamykaj każdej wartości w badge,
- nie dodawaj avatarów stockowych,
- nie twórz dużych shadow cards,
- nie używaj kolorowych ikon jako ozdoby,
- nie rozciągaj wierszy do 80–100 px.

## QA

- keyboard navigation,
- screen reader table labels,
- 1000+ rekordów,
- długie nazwy,
- brak danych opcjonalnych,
- mobile szybki telefon/e-mail,
- URL/shareable filters, jeżeli wymagane.

## Gate

- tabela i mobile list odpowiadają referencji,
- filtry realnie działają,
- brak regresji wydajności,
- screenshoty przed/po i visual diff,
- zatrzymaj się.
