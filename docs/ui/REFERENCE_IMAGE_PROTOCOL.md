# Kwotum — protokół pracy z referencjami obrazowymi

**Status:** CANONICAL
**Owner:** Principal Product Designer + Visual QA
**Last reviewed:** 2026-08-26

## 1. Zasada

Obraz zaakceptowany dla konkretnego regionu staje się specyfikacją wizualną
dopiero po zapisaniu go w `REFERENCE_MANIFEST.md` z rolą, rozmiarem i SHA-256.
Treść demonstracyjna obrazu nie jest wymaganiem produktu.

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
docs/ui/REFERENCE_MANIFEST.md
docs/ui/<scope>/README.md
artifacts/visual-qa/<scope>/<stage>/<screen>/diff.md
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

Dla każdego ekranu lub sekcji zapisz: referencję albo jej kanoniczną ścieżkę,
`before`, finalny `after`, overlay albo difference, reprezentatywny mobile i
`diff.md`. Bez porównania nie ma wizualnego PASS.
