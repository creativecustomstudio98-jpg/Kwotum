# PROMPT 12 — MODUŁ AGENCYJNY


> **V6 IMAGE-LOCKED — obowiązuje nadrzędnie**
>
> Przed wykonaniem tego etapu przeczytaj `CODEX_MASTER_PROMPT.md`, sprawdź obrazy załączone do bieżącej wiadomości oraz właściwe cropy z `docs/ui/references/derived/`. Obrazy są specyfikacją, nie inspiracją. Nie upraszczaj kompozycji, gęstości, inner UI ani mobile. Ten etap działa według zasady: `1 prompt = 1 mały etap = 1 branch = 1 końcowy commit`. Wymagane: reference → before → after-v1 → overlay → poprawki → after-v2 → overlay → layout/a11y/tests/build → raport → STOP.

## Cel

Umożliwić agencji zarządzanie wieloma klientami i procesami bez mieszania tenantów i bez tworzenia pełnego CRM.

## Referencje

- `reference/screenshots/clients-desktop.png`,
- `reference/boards/board-03-growth-delivery.png`.

## Zakres główny

### Lista klientów

- klient,
- domena,
- liczba procesów,
- leady/limit,
- status,
- plan,
- aktywność,
- otwórz kontekst.

### Szybkie wdrożenie

- wybierz szablon,
- wybierz organizację,
- skopiuj branding,
- utwórz draft,
- nie publikuj automatycznie.

### Szczegóły klienta

- health procesu,
- usage,
- ostatnie leady,
- instalacja,
- integracje,
- role klienta,
- działania administracyjne z audytem.

### White-label

- domena,
- identyfikacja,
- e-maile,
- status weryfikacji,
- wyraźne ograniczenia planu.

### Marża/rozliczenia

Interfejs może przygotować konfigurację modelu, ale nie twórz udawanych płatności. Funkcje finansowe muszą wynikać z zatwierdzonego modelu.

## Security

- brak cross-tenant leakage,
- jawne przełączanie kontekstu,
- banner/nazwa aktywnego klienta,
- audit log działań agencyjnych,
- role klienta oddzielone od roli agency owner.

## Mobile

Moduł agencyjny na mobile ma wspierać podgląd i podstawowe akcje, nie pełną masową administrację. Lista klientów → szczegóły → szybkie action.

## QA

- 1/50/500 klientów,
- limit przekroczony,
- klient zawieszony,
- brak uprawnień,
- white-label pending,
- tenant switch,
- eksport,
- audit log.

## Gate

- context switching jest jednoznaczny,
- separacja tenantów potwierdzona testami,
- UI odpowiada systemowi referencyjnemu,
- brak niezatwierdzonego kombajnu CRM,
- zatrzymaj się.
