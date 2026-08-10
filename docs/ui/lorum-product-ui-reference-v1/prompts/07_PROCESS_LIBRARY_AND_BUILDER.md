# PROMPT 07 — LISTA PROCESÓW I BUILDER


> **V6 IMAGE-LOCKED — obowiązuje nadrzędnie**
>
> Przed wykonaniem tego etapu przeczytaj `CODEX_MASTER_PROMPT.md`, sprawdź obrazy załączone do bieżącej wiadomości oraz właściwe cropy z `docs/ui/references/derived/`. Obrazy są specyfikacją, nie inspiracją. Nie upraszczaj kompozycji, gęstości, inner UI ani mobile. Ten etap działa według zasady: `1 prompt = 1 mały etap = 1 branch = 1 końcowy commit`. Wymagane: reference → before → after-v1 → overlay → poprawki → after-v2 → overlay → layout/a11y/tests/build → raport → STOP.

To najważniejszy etap produktu. Nie wykonuj go jako jednej ogromnej chaotycznej zmiany. Podziel implementację na wewnętrzne checkpointy, ale zakończ wyłącznie zakres tego promptu.

## Cel

Umożliwić użytkownikowi znalezienie procesu, edycję kroków, test i publikację w czytelnym interfejsie bez pustego canvasu i bez template’owego node graphu.

## Referencje

- `reference/screenshots/builder-desktop.png`,
- `reference/screenshots/builder-mobile.png`,
- `reference/boards/board-02-builder-rules.png`,
- `docs/01_PRODUCT_UI_ARCHITECTURE.md`.

## A. Lista procesów

Zaprojektuj zwarty ekran pokazujący:

- nazwę,
- status Draft/Opublikowany/Archiwalny,
- aktywną wersję,
- ostatnią zmianę,
- leady w okresie,
- conversion rate,
- stan instalacji,
- działania: edytuj, testuj, publikuj, duplikuj, archiwizuj.

Nie używaj siatki dużych kart ze screenshotami. Dopuszczalny jest jeden onboarding empty state dla pierwszego procesu.

## B. Builder desktop

Układ:

```text
[lista kroków 270–290 px]
[podgląd 1fr]
[inspektor 320–350 px]
```

### Topbar

- nazwa procesu,
- Draft/Opublikowany,
- save state,
- undo/redo tylko jeśli realnie działa,
- desktop/mobile preview,
- test,
- publikacja.

### Lista kroków

- start,
- pytania,
- grupy,
- kontakt,
- wynik,
- drag handle,
- dostępna alternatywa sortowania,
- zależności/warunki,
- błędy i ostrzeżenia,
- dodaj krok/grupę.

### Podgląd

- rzeczywisty renderer widgetu,
- nie osobna atrapa HTML,
- przejście testowe,
- progress,
- branding organizacji,
- dokładne stany selected/error.

### Inspektor

Zakładki kontekstowe:

- Treść,
- Odpowiedzi,
- Logika,
- Wycena,
- Scoring,
- Ustawienia.

Nie pokazuj zakładek, które nie dotyczą wybranego elementu.

## C. Builder mobile

Nie ściskaj trzech kolumn. Zbuduj drill-down:

1. lista kroków,
2. edycja wybranego kroku,
3. odpowiedzi,
4. logika,
5. wycena,
6. scoring,
7. test.

Sticky save/publish. Sortowanie dostępne również przyciskami.

## D. Typy kroków

Obsłuż aktualnie wspierane typy domenowe. Dla brakujących z master scope nie twórz atrapy; oznacz backlog i zachowaj extensibility.

Minimum:

- single choice,
- multiple choice,
- select,
- short/long text,
- number/range/measurement,
- date,
- location,
- contact,
- consent,
- upload,
- statement,
- appointment preference.

## E. Zachowanie

- autosave z widocznym stanem,
- konflikt dwóch kart,
- unsaved changes,
- usuwanie kroku użytego w regule,
- wersjonowanie,
- draft nie zmienia opublikowanej wersji,
- test mode nie tworzy produkcyjnych leadów bez oznaczenia,
- publication checklist.

## QA

- pełna obsługa klawiaturą,
- drag-and-drop alternative,
- screen reader labels,
- 30+ kroków,
- długie etykiety,
- mobile,
- offline/autosave retry,
- dwa otwarte okna,
- visual regression.

## Gate

- proces można edytować, testować i zapisać,
- preview korzysta z realnego renderera,
- logika i publikacja nie są jeszcze przepisywane poza integracją UI,
- builder odpowiada referencji,
- zatrzymaj się.
