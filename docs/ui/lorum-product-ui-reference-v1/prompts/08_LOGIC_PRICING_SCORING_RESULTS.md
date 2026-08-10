# PROMPT 08 — LOGIKA, WYCENA, SCORING I WYNIKI


> **V6 IMAGE-LOCKED — obowiązuje nadrzędnie**
>
> Przed wykonaniem tego etapu przeczytaj `CODEX_MASTER_PROMPT.md`, sprawdź obrazy załączone do bieżącej wiadomości oraz właściwe cropy z `docs/ui/references/derived/`. Obrazy są specyfikacją, nie inspiracją. Nie upraszczaj kompozycji, gęstości, inner UI ani mobile. Ten etap działa według zasady: `1 prompt = 1 mały etap = 1 branch = 1 końcowy commit`. Wymagane: reference → before → after-v1 → overlay → poprawki → after-v2 → overlay → layout/a11y/tests/build → raport → STOP.

## Cel

Zbudować czytelny, testowalny interfejs reguł, który nie ukrywa konsekwencji i pozostaje zgodny z obliczeniami po stronie serwera.

## Referencje

- `reference/screenshots/rules-desktop.png`,
- `reference/screenshots/widget-result-desktop.png`,
- `reference/boards/board-02-builder-rules.png`,
- `reference/boards/board-04-system-onboarding.png`.

## Architektura ekranu

Zakładki:

1. Logika,
2. Wycena,
3. Scoring,
4. Warianty wyniku.

Desktop:

- główna kolumna z regułami,
- prawa kolumna z podglądem i explainability.

Mobile/tablet:

- reguły jako lista,
- edycja w osobnym ekranie/drawerze,
- podgląd dostępny jako osobna zakładka.

## Logika

Czytelny język:

```text
IF [pole] [operator] [wartość]
THEN [akcja] [wartość]
```

Obsłuż istniejące operatory/akcje z domeny. Waliduj:

- pętle,
- niedostępne kroki,
- martwe ścieżki,
- konflikt akcji,
- usunięte opcje,
- brak wyniku.

Nie buduj node graphu w MVP.

## Wycena

Interfejs dla:

- ceny bazowej,
- kwoty +/- ,
- przedziału,
- mnożnika,
- procentu,
- ceny za jednostkę,
- progów,
- min/max,
- warunkowego kosztu,
- korekty niewidocznej.

Pokaż:

- breakdown,
- min/max/reference,
- walutę,
- rounding,
- presentation mode,
- disclaimer,
- wersję kalkulacji.

Cena musi być obliczona lub potwierdzona server-side.

## Scoring

- deterministyczne reguły,
- add/subtract,
- minimum priority,
- disqualify,
- kategoria,
- reasons,
- test lead.

Nie dodawaj „AI confidence”.

## Warianty wyniku

Konfiguruj:

- nagłówek,
- podsumowanie,
- cenę/przedział/od/brak,
- czynniki,
- rekomendację,
- CTA,
- kolejny krok,
- termin kontaktu,
- disclaimer.

Tryby kontaktu przed/po wyniku muszą wynikać z domeny i być testowalne.

## Test case runner

Dodaj sposób sprawdzenia przykładowych odpowiedzi bez tworzenia produkcyjnego leada:

- wejście,
- aktywne reguły,
- wynik ceny,
- score,
- wariant wyniku,
- warnings.

## QA

Edge cases:

- min > max,
- multiplier zero,
- missing currency,
- score <0/>100,
- contradictory rules,
- disqualification,
- hidden price,
- result without CTA,
- stale draft,
- server/client mismatch.

## Gate

- wynik jest deterministyczny,
- explainability kompletna,
- UI odpowiada referencji,
- testy jednostkowe silników przechodzą,
- zero logiki biznesowej w komponentach prezentacyjnych,
- zatrzymaj się.
