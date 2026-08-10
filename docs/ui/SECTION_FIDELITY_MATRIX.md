# Lorum — matryca zgodności sekcji landingu

**Status:** CANONICAL
**Owner:** Product Design + Frontend + Visual QA
**Last reviewed:** 2026-07-26

| #   | Sekcja              | Kompozycja desktop                                   | Transformacja mobile         | Niedozwolone uproszczenie              |
| --- | ------------------- | ---------------------------------------------------- | ---------------------------- | -------------------------------------- |
| 1   | Navigation          | płaski header, logo, linki, compact CTA, dolna linia | logo + menu, poprawny drawer | floating pill navbar, blur             |
| 2   | Hero                | copy + odpowiedzi klienta + pełny lead record        | copy, CTA, osobny mini-flow  | laptop, floating cards, sam screenshot |
| 3   | Dane zbierane       | 6 pozycji w jednym płaskim rzędzie                   | siatka 3×2                   | 6 grubych kart                         |
| 4   | Problem vs rezultat | jedna split-card z connector                         | logiczny stack               | dwie losowe karty                      |
| 5   | Jak działa          | 4 kroki + oś + compact lead                          | pionowa sekwencja            | generyczne icon tiles                  |
| 6   | Demo                | pełny toolbar, progress, pytanie, live summary       | jedna kolumna, realne flow   | statyczny mockup                       |
| 7   | Branże              | selector + aktywny template + lead                   | selector + aktywny content   | sama galeria kart                      |
| 8   | Funkcje             | 5 etapów jako jeden proces                           | pionowa oś                   | siatka 12 kart                         |
| 9   | WordPress           | copy + realny edytor/instalacja                      | jedna kolumna                | wielkie logo WordPress                 |
| 10  | Agencje             | ciemna sekcja + agency workspace                     | logiczny stack               | fałszywe KPI/przychody                 |
| 11  | Dowody              | demo, metodyka, bezpieczeństwo                       | compact stack                | fikcyjne opinie/logotypy               |
| 12  | Cennik              | pełne porównanie 4 planów                            | pionowe plany                | puste cenowe kafle                     |
| 13  | FAQ                 | split copy + accordion                               | jedna kolumna                | skrócone odpowiedzi/placeholdery       |
| 14  | Final CTA           | ciemny panel + mikro-flow                            | copy, flow, CTA              | abstrakcyjna ilustracja                |
| 15  | Footer              | logo, opis, linki, legal/status                      | priorytetowy stack           | dominujący newsletter                  |

Każda sekcja musi posiadać własny screenshot referencyjny, wpis w `REFERENCE_MANIFEST.md`, kryteria desktop/mobile i raport diff.
