# Lorum — protokół pracy z referencjami obrazowymi

**Status:** CANONICAL
**Owner:** Principal Product Designer + Visual QA
**Last reviewed:** 2026-07-26

## 1. Zasada

Obrazy załączone do bieżącej wiadomości Codexa oraz kopie w `references/` są specyfikacją wizualną. Nie wolno traktować ich jako moodboardu ani redukować do podobnej palety.

## 2. Obowiązkowy preflight

Przed kodowaniem Codex musi:

1. wypisać wszystkie widoczne obrazy,
2. opisać ich zakres,
3. potwierdzić natywny rozmiar,
4. wskazać regiony i viewporty,
5. przygotować cropy ekranów/sekcji,
6. zmapować cropy do routes i komponentów,
7. zapisać nieczytelne miejsca,
8. zatrzymać się, jeśli brakuje referencji krytycznej.

## 3. Pliki wynikowe

```text
docs/ui/REFERENCE_MANIFEST.md
docs/ui/REFERENCE_DECOMPOSITION.md
docs/ui/VISUAL_MEASUREMENTS.md
docs/ui/REFERENCE_GAPS.md
docs/ui/references/derived/
```

## 4. Co odwzorowywać

- kolejność regionów,
- proporcje,
- container i grid,
- gęstość danych,
- typografię,
- line-height,
- spacing,
- border,
- radius,
- shadow,
- wysokości kontrolek,
- ikonografię,
- stany,
- responsive transformation.

## 5. Czego nie wolno upraszczać

- tabel do pustych kart na desktopie,
- sidebara do dekoracyjnej ikony,
- pełnego rekordu leada do kilku etykiet,
- buildera do zwykłego formularza,
- demo do statycznego screenshotu,
- procesu do siatki ikon,
- pełnych sekcji landingu do tekstu i jednego obrazka,
- mobile do `transform: scale()` desktopu.

## 6. Visual QA

Dla każdego ekranu/sekcji zapisz: reference, before, after-v1, overlay-v1, after-v2, overlay-v2 i diff report. Bez overlay nie ma PASS.
