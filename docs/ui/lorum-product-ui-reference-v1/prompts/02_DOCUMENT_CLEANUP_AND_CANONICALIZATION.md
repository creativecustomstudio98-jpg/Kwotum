# PROMPT 02 — CZYSZCZENIE I KANONIZACJA DOKUMENTACJI


> **V6 IMAGE-LOCKED — obowiązuje nadrzędnie**
>
> Przed wykonaniem tego etapu przeczytaj `CODEX_MASTER_PROMPT.md`, sprawdź obrazy załączone do bieżącej wiadomości oraz właściwe cropy z `docs/ui/references/derived/`. Obrazy są specyfikacją, nie inspiracją. Nie upraszczaj kompozycji, gęstości, inner UI ani mobile. Ten etap działa według zasady: `1 prompt = 1 mały etap = 1 branch = 1 końcowy commit`. Wymagane: reference → before → after-v1 → overlay → poprawki → after-v2 → overlay → layout/a11y/tests/build → raport → STOP.

Wykonaj ten etap dopiero po zaakceptowanym audycie. Nie przebudowuj jeszcze ekranów.

## Cel

Doprowadzić repozytorium do sytuacji, w której istnieje jedno aktywne źródło decyzji produktowych, technicznych i UI. Usunąć chaos dokumentacyjny bez utraty unikalnych informacji.

## Źródła

- `docs/_migration/UI_REBUILD_AUDIT.md`,
- `docs/_migration/UI_DOC_INVENTORY.md`,
- `docs/ui/lorum-product-ui-reference-v1/docs/06_DOCUMENT_MIGRATION_AND_CLEANUP.md`,
- wszystkie aktywne dokumenty repozytorium,
- historię git potrzebną do oceny plików.

## Przebieg zespołowy

### Product Lead

- zachowuje aktualne decyzje o produkcie, scope, non-goals i głównej pętli,
- wykrywa sprzeczności między dokumentami.

### Architect/Security

- chroni decyzje o bazie, API, auth, RLS, bezpieczeństwie i migracjach,
- nie pozwala, by czyszczenie UI usunęło istotne wymagania techniczne.

### UX/Visual Lead

- przenosi aktywne decyzje UI do dokumentów kanonicznych,
- oznacza stare koncepcje jako historyczne.

### Documentation Curator

- wykonuje KEEP / REPLACE / MERGE / ARCHIVE / DELETE,
- aktualizuje indeks i linki,
- tworzy raport migracji.

## Obowiązkowe działania

1. Utwórz katalog:

```text
docs/_archive/YYYY-MM-DD-pre-lorum-ui-v1/
```

2. Utwórz lub zaktualizuj `docs/INDEX.md`.
3. Każdemu aktywnemu dokumentowi dodaj status, owner i last reviewed.
4. Przenieś unikalne decyzje przed archiwizacją źródła.
5. Zamień widoczną nazwę produktu w aktywnych dokumentach na Lorum.
6. Nie zmieniaj globalnie technicznych identyfikatorów „wyceno”.
7. Zaktualizuj `AGENTS.md`, `README.md`, `docs/TASKS.md`, `docs/DECISIONS.md`, `docs/RISKS.md`.
8. Sprawdź wszystkie linki i odwołania do starych ścieżek.
9. Usuń tylko pliki spełniające kryteria DELETE z dokumentu kanonicznego.
10. Utwórz raport:

```text
docs/_migration/UI_DOC_MIGRATION_REPORT.md
```

## Minimalny docelowy zestaw UI

```text
docs/DESIGN_PRINCIPLES.md
docs/DESIGN_SYSTEM.md
docs/INFORMATION_ARCHITECTURE.md
docs/ACCESSIBILITY.md
docs/CONTENT_DESIGN.md
docs/EMPTY_LOADING_ERROR_STATES.md
docs/QA_PLAN.md
docs/TASKS.md
```

Włącz do nich lub linkuj dokumenty z pakietu referencyjnego. Nie kopiuj tych samych reguł do pięciu plików.

## Walidacja

- `rg` dla usuniętych nazw plików,
- `rg -i "Wyceno"` i klasyfikacja każdego zachowanego wystąpienia,
- sprawdzenie linków,
- git diff z listą przeniesień,
- brak zmian w kodzie aplikacji poza ścieżkami dokumentacyjnymi i `AGENTS.md`.

## Gate

- jedna kanoniczna ścieżka dokumentacji,
- brak aktywnych konfliktów,
- archiwum opisane,
- raport kompletny,
- zero zmian UI.

Zatrzymaj się po raporcie.
