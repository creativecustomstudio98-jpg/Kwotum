# R5.4 — visual diff izolacji widgetu `/dla-agencji`

## Status

**READY FOR OWNER REVIEW.** Implementacja, produkcyjny render i pełny gate są
zamknięte. R5.5 pozostaje zamrożony do jawnej akceptacji właściciela.

## Przed

- nagłówek i krótki akapit zajmowały pustą powierzchnię bez produktu;
- izolacja CSS była wyłącznie deklaracją, bez dowodu wizualnego;
- brakowało strony hosta, agresywnych reguł CSS i właściwego shadow root;
- nie pokazano `<wyceno-widget>`, loadera ani zakresu zdarzeń;
- fragment nie przypominał zaakceptowanego home ani panelu;
- własność danych R5.3 i izolacja widgetu były wcześniej częścią jednego
  legacy’owego artykułu.

## Po

- osobna ciemnozielona sekcja „Izolacja interfejsu” zgodna z językiem marki;
- code-native porównanie strony hosta i widgetu po dwóch stronach nazwanej
  granicy;
- celowo agresywny CSS hosta z widocznie zdeformowaną kontrolką;
- pełny interfejs widgetu zachowujący typografię, kontrolki i odstępy;
- jawne etykiety „Shadow root”, „Style hosta zatrzymane” i
  `<wyceno-widget>`;
- trzy prawdziwe elementy kontraktu: mały loader, własne style i wąski zakres
  zdarzeń;
- brak interaktywnych atrap;
- dedykowana pionowa kompozycja mobile oraz zero overflow w dziewięciu
  viewportach;
- zaakceptowane R5.1–R5.3 zachowane bez zmian.

## Artefakty

- baseline: `before/dla-agencji-full-1440.png` i
  `before/dla-agencji-full-390.png`;
- finalne sekcje: `after/dla-agencji-isolation-*.png`;
- finalne pełne strony: `after/dla-agencji-full-1440.png` i
  `after/dla-agencji-full-390.png`;
- porównania: `compare/before-after-1440.png` i
  `compare/before-after-390.png`;
- dokładne pomiary: `after/metrics.json`.

## Pomiary końcowe

| Viewport |  Sekcja |   Proof | Min. tekst | Overflow | Błędy |
| -------: | ------: | ------: | ---------: | -------: | ----: |
|  1536 px | 1506,36 |  850,22 |      12 px |     0 px |     0 |
|  1440 px | 1457,72 |  840,56 |      12 px |     0 px |     0 |
|  1280 px | 1373,41 |  821,16 |      12 px |     0 px |     0 |
|  1024 px | 1709,61 | 1249,14 |      12 px |     0 px |     0 |
|   768 px | 2020,95 | 1404,80 |      12 px |     0 px |     0 |
|   430 px | 2352,00 | 1737,28 |      12 px |     0 px |     0 |
|   390 px | 2360,38 | 1737,28 |      12 px |     0 px |     0 |
|   375 px | 2372,09 | 1756,00 |      12 px |     0 px |     0 |
|   320 px | 2406,78 | 1813,25 |      12 px |     0 px |     0 |

**Wynik wykonawczy: 20/20. Akceptacja właściciela: oczekuje.**
