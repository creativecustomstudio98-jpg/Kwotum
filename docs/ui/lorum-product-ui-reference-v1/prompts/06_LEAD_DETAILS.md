# PROMPT 06 — SZCZEGÓŁY LEADA


> **V6 IMAGE-LOCKED — obowiązuje nadrzędnie**
>
> Przed wykonaniem tego etapu przeczytaj `CODEX_MASTER_PROMPT.md`, sprawdź obrazy załączone do bieżącej wiadomości oraz właściwe cropy z `docs/ui/references/derived/`. Obrazy są specyfikacją, nie inspiracją. Nie upraszczaj kompozycji, gęstości, inner UI ani mobile. Ten etap działa według zasady: `1 prompt = 1 mały etap = 1 branch = 1 końcowy commit`. Wymagane: reference → before → after-v1 → overlay → poprawki → after-v2 → overlay → layout/a11y/tests/build → raport → STOP.

## Cel

Zbudować ekran umożliwiający ocenę i obsługę leada bez szukania danych w wielu przypadkowych kartach.

## Referencje

- `reference/screenshots/lead-detail-desktop.png`,
- `reference/screenshots/lead-detail-mobile.png`,
- `reference/boards/board-01-core-operations.png`.

## Hierarchia desktop

1. identyfikacja klienta i kontekst procesu,
2. score + kategoria + reasons,
3. szybkie akcje,
4. tabs: podsumowanie, odpowiedzi, pliki, historia, zgody,
5. główna kolumna z danymi źródłowymi,
6. prawa kolumna: kontakt, status, opiekun, next step, notatka, dane techniczne.

## Mobile

1. osoba + score,
2. krótkie reasons,
3. źródłowe podsumowanie,
4. materiały,
5. obsługa,
6. historia/techniczne,
7. sticky actions: e-mail, telefon, rozpocznij obsługę.

## Zasady danych

- odpowiedzi źródłowe zawsze widoczne,
- AI summary, jeśli istnieje, ma etykietę „wygenerowane” i nie zastępuje źródła,
- score ma explainability,
- pliki używają podpisanych URL i uprawnień,
- kontakt może być maskowany zależnie od roli,
- historia statusów jest append-only zgodnie z domeną,
- notatka nie może być atrapą.

## Stany

- lead bez kontaktu,
- lead bez score,
- lead poza ofertą,
- plik w skanowaniu/niedostępny,
- brak zgody marketingowej,
- brak uprawnień do PII,
- rekord usunięty/zmieniony w innej sesji,
- zapis notatki failed,
- zmiana statusu failed,
- duplicate lead indicator, jeśli istnieje.

## Accessibility

- tabs dostępne klawiaturą,
- semantyczna definicja danych,
- akcje z pełnymi etykietami,
- dialog potwierdzenia odrzucenia/usunięcia,
- status dynamiczny ogłaszany.

## Gate

- wszystkie działania działają,
- mobile ma dostęp do kontaktu bez menu,
- źródłowe odpowiedzi są dominantą informacyjną,
- visual diff zgodny,
- testy uprawnień i tenant scope przechodzą,
- zatrzymaj się.
