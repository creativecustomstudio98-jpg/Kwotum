# 06 — Migracja i czyszczenie dokumentacji

**Status:** CANONICAL

## 1. Cel

Usunąć konfliktujące, zduplikowane i nieaktualne źródła decyzji bez utraty ważnych informacji technicznych, biznesowych ani bezpieczeństwa.

Codex nie może „posprzątać” przez masowe usunięcie katalogu `docs`.

## 2. Inwentaryzacja

Przed zmianami utwórz:

```text
docs/_migration/UI_DOC_INVENTORY.md
```

Dla każdego pliku zapisz:

| Pole | Opis |
|---|---|
| ścieżka | pełna ścieżka |
| temat | czego dotyczy |
| ostatnia aktualizacja | z git lub metadanych |
| referencje | kto linkuje do pliku |
| unikalne decyzje | czy zawiera coś, czego nie ma gdzie indziej |
| zgodność z Lorum v1 | zgodny / częściowo / sprzeczny |
| klasyfikacja | KEEP / REPLACE / MERGE / ARCHIVE / DELETE |
| cel migracji | docelowy plik kanoniczny |

## 3. Klasyfikacja

### KEEP

Dokument jest aktualny, unikalny i zgodny. Dodaj nagłówek statusu oraz link z `docs/INDEX.md`.

### REPLACE

Dokument jest nieaktualny lub sprzeczny. Przenieś potrzebne informacje do nowego pliku kanonicznego, zaktualizuj linki, a stary plik zarchiwizuj.

### MERGE

Kilka dokumentów opisuje ten sam temat. Utwórz jeden dokument kanoniczny, zachowując unikalne decyzje i historię istotnych zmian.

### ARCHIVE

Plik może być przydatny historycznie, ale nie może sterować nowymi pracami. Przenieś do:

```text
docs/_archive/YYYY-MM-DD-pre-lorum-ui-v1/
```

Na górze dodaj:

```text
ARCHIVED — nie jest źródłem prawdy. Zastąpiony przez: <ścieżka>
```

### DELETE

Dozwolone dopiero, gdy:

- plik jest duplikatem albo wygenerowanym śmieciem,
- nie zawiera unikalnych decyzji,
- nie jest linkowany,
- nie jest wymagany przez narzędzia,
- jego historia jest dostępna w git,
- usunięcie zostało zapisane w raporcie.

## 4. Dokumenty kanoniczne repozytorium

Po migracji powinny istnieć lub zostać zaktualizowane:

```text
AGENTS.md
README.md
docs/INDEX.md
docs/PRODUCT_VISION.md
docs/PRODUCT_REQUIREMENTS.md
docs/SCOPE.md
docs/NON_GOALS.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/AUTHORIZATION.md
docs/API_CONTRACTS.md
docs/DESIGN_PRINCIPLES.md
docs/DESIGN_SYSTEM.md
docs/INFORMATION_ARCHITECTURE.md
docs/ACCESSIBILITY.md
docs/CONTENT_DESIGN.md
docs/EMPTY_LOADING_ERROR_STATES.md
docs/QA_PLAN.md
docs/TASKS.md
docs/DECISIONS.md
docs/RISKS.md
docs/RELEASE_CHECKLIST.md
```

Nie twórz pustych dokumentów tylko po to, by lista wyglądała kompletne. Jeżeli temat nie jest jeszcze opracowany, dodaj jawny status `DRAFT` i konkretne braki.

## 5. Nagłówek dokumentu

Każdy aktywny dokument powinien zaczynać się od:

```md
# Tytuł

**Status:** CANONICAL | DRAFT | DEPRECATED | ARCHIVED
**Owner:** rola lub zespół
**Last reviewed:** YYYY-MM-DD
**Replaces:** ścieżki, jeśli dotyczy
```

## 6. `docs/INDEX.md`

Indeks ma grupować dokumenty według:

- Product,
- Architecture,
- UI/UX,
- Security & Privacy,
- Operations,
- Research,
- Archive.

Przy każdym pliku podaj status i jednozdaniowy opis.

## 7. Marka

W aktywnych dokumentach i screenshotach używaj Lorum. Stare „Wyceno”:

- zamień w treściach produktowych,
- zachowaj w cytatach historycznych z oznaczeniem,
- nie zmieniaj technicznych identyfikatorów bez analizy,
- utwórz `docs/decisions/ADR-BRAND-IDENTIFIER-MIGRATION.md`, jeśli potrzebna jest migracja techniczna.

## 8. Kontrola linków

Po migracji:

- wyszukaj linki do usuniętych ścieżek,
- sprawdź odwołania w `AGENTS.md`, `README.md`, CI i skryptach,
- uruchom link checker, jeśli istnieje,
- wykonaj `rg` dla nazw starych plików,
- przedstaw listę celowo zachowanych odniesień.

## 9. Raport końcowy

Utwórz:

```text
docs/_migration/UI_DOC_MIGRATION_REPORT.md
```

Zawartość:

- liczba plików KEEP/REPLACE/MERGE/ARCHIVE/DELETE,
- tabela zmian ścieżek,
- przeniesione unikalne decyzje,
- zachowane ryzyka,
- celowo pozostawione stare identyfikatory,
- linki wymagające późniejszej decyzji.
