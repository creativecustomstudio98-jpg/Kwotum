# PROMPT 04 — DASHBOARD OPERACYJNY


> **V6 IMAGE-LOCKED — obowiązuje nadrzędnie**
>
> Przed wykonaniem tego etapu przeczytaj `CODEX_MASTER_PROMPT.md`, sprawdź obrazy załączone do bieżącej wiadomości oraz właściwe cropy z `docs/ui/references/derived/`. Obrazy są specyfikacją, nie inspiracją. Nie upraszczaj kompozycji, gęstości, inner UI ani mobile. Ten etap działa według zasady: `1 prompt = 1 mały etap = 1 branch = 1 końcowy commit`. Wymagane: reference → before → after-v1 → overlay → poprawki → after-v2 → overlay → layout/a11y/tests/build → raport → STOP.

## Cel

Przebudować dashboard tak, aby odpowiadał na cztery pytania:

1. co wymaga reakcji,
2. czy proces działa,
3. jaka jest jakość i konwersja,
4. co zrobić dalej.

Nie twórz kolekcji przypadkowych KPI.

## Referencje

- `reference/screenshots/dashboard-desktop.png`,
- `reference/screenshots/dashboard-mobile.png`,
- `reference/boards/board-01-core-operations.png`,
- `docs/01_PRODUCT_UI_ARCHITECTURE.md`,
- `docs/05_CONTENT_AND_DATA_RULES.md`.

## Struktura desktop

1. Topbar:
   - okres,
   - wybrany proces,
   - podgląd,
   - główne CTA zależne od stanu.
2. „Wymaga uwagi”:
   - nowe leady,
   - draft do publikacji,
   - instalacja/webhook/config issue.
3. Metryki:
   - rozpoczęcia,
   - ukończenia,
   - conversion rate,
   - leady lub średnia wartość,
   - czas reakcji/gorące leady.
4. Trend + jakość.
5. Najnowsze leady.
6. Następny krok.

Każda liczba ma okres, źródło i porównanie. Brak danych oznacza właściwy empty state, nie zmyśloną wartość.

## Struktura mobile

1. kontekst i alerty,
2. 2×2 kluczowe KPI,
3. najnowsze leady,
4. następny krok,
5. wykresy dopiero niżej lub w Analityce.

## Product pass

- zweryfikuj znaczenie każdej metryki,
- usuń KPI bez decyzji użytkownika,
- zidentyfikuj realne zapytania/agregacje,
- nie zmieniaj definicji metryk bez dokumentacji.

## UX pass

- jedna główna hierarchia,
- alerty są actionable,
- każda karta prowadzi do właściwego kontekstu,
- mobile nie kopiuje desktopowej siatki.

## Frontend pass

- użyj server components/queries zgodnie z architekturą,
- unikaj N+1,
- nie ładuj całej analityki na landing,
- obsłuż loading/error/empty/partial,
- demo data oznacz jawnie.

## QA

Scenariusze:

- nowa organizacja bez danych,
- organizacja z jednym procesem,
- pełne dane demo,
- błąd jednej agregacji,
- użytkownik Sales bez części uprawnień,
- mobile 390 px,
- długie nazwy procesu i firmy.

## Gate

- widok wizualnie odpowiada referencji,
- priorytety są widoczne bez scrolla na desktopie,
- mobile pokazuje najważniejsze informacje bez overflow,
- wszystkie linki i CTA działają,
- screenshoty i testy załączone,
- zatrzymaj się.
