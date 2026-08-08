# R5.2 — visual diff metody wdrożenia `/dla-agencji`

## Status

**ACCEPTED / COMPLETE.** Właściciel zaakceptował etap 2026-08-04 poleceniem
„kontynuuj”, wydanym bezpośrednio po pytaniu o przejście do R5.3.

## Przed

- cztery luźne kolumny z globalnej klasy `.agency-flow`;
- numer, tytuł i opis bez wskazania właściciela oraz wyniku;
- brak wspólnego modułu wizualnego i powiązania z panelem;
- mobile układał kolejne bloki pionowo bez własnej kompozycji procesu;
- sekcja kończyła się bez wyjaśnienia, co jest wspólne, a co indywidualne.

## Po

- jedna powierzchnia „Plan wdrożenia” z czterema powiązanymi wierszami;
- ikony pochodzą bezpośrednio z systemu nawigacji panelu;
- każdy wiersz pokazuje kontekst, nazwę etapu, właściciela, działanie i rezultat;
- mobile przechodzi na czytelną oś procesu wewnątrz tej samej powierzchni;
- dolny rejestr rozdziela architekturę, treść i logikę oraz dane i dostęp;
- brak atrap kontrolek i rozszerzeń MVP;
- zaakceptowane hero oraz niższe sekcje pozostały poza zakresem.

## Artefakty

- baseline: `before/dla-agencji-full-1440.png` i
  `before/dla-agencji-full-390.png`;
- finalne sekcje: `after/dla-agencji-method-*.png`;
- finalne pełne strony: `after/dla-agencji-full-1440.png` i
  `after/dla-agencji-full-390.png`;
- porównania: `compare/before-after-1440.png` i
  `compare/before-after-390.png`;
- dokładne pomiary: `after/metrics.json`.

## Pomiary końcowe

| Viewport |     Sekcja |       Plan | Min. tekst | Overflow | Błędy |
| -------: | ---------: | ---------: | ---------: | -------: | ----: |
|  1536 px | 1237,03 px |  662,73 px |      12 px |     0 px |     0 |
|  1440 px | 1203,97 px |  662,73 px |      12 px |     0 px |     0 |
|  1280 px | 1147,55 px |  662,73 px |      12 px |     0 px |     0 |
|  1024 px | 1466,56 px |  985,31 px |      12 px |     0 px |     0 |
|   768 px | 1501,75 px | 1040,44 px |      12 px |     0 px |     0 |
|   430 px | 2007,72 px | 1476,84 px |      12 px |     0 px |     0 |
|   390 px | 2074,34 px | 1561,78 px |      12 px |     0 px |     0 |
|   375 px | 2107,38 px | 1601,69 px |      12 px |     0 px |     0 |
|   320 px | 2296,23 px | 1745,36 px |      12 px |     0 px |     0 |

**Wynik wykonawczy: 19/20. Akceptacja właściciela: potwierdzona.**
