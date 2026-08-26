# Responsive layout Kwotum

**Status:** kanoniczny  
**Ostatni przegląd:** 2026-07-29

## Viewporty odbioru

Każdy właściwy etap UI sprawdza co najmniej:

- 320 × 800;
- 375 × 812;
- 390 × 844;
- 430 × 932;
- 768 × 1024;
- 1024 × 768;
- 1280 × 800;
- 1440 × 900;
- 1536 × 1024.

Kontrola obejmuje również zoom 200%, długie polskie treści, obsługę klawiaturą,
reduced motion i forced colors.

## Reguły integralności

- Główne regiony używają normalnego flow, gridu albo flexa.
- `position: absolute`, ujemne marginesy i transformacje nie ustawiają głównej
  geometrii strony.
- `overflow-x: hidden` nie maskuje błędu layoutu.
- Elastyczne kolumny otrzymują `min-width: 0`, a siatki
  `minmax(0, 1fr)`.
- Dynamiczna treść nie dostaje stałej wysokości bez mierzalnego ograniczenia.
- Sticky action rezerwuje miejsce i uwzględnia safe area.
- Interfejs mobilny jest osobną transformacją zadania, nie skalą desktopu.

## Transformacje modułów

| Moduł            | Desktop                                          | Tablet                                         | Mobile                                                    |
| ---------------- | ------------------------------------------------ | ---------------------------------------------- | --------------------------------------------------------- |
| Hero             | copy → odpowiedzi → lead                         | relacja nadal pozioma, copy może przejść wyżej | mini odpowiedzi i lead obok siebie                        |
| Pasek danych     | 6 kolumn                                         | 3 × 2 albo 6 kompaktowych pozycji              | 3 × 2                                                     |
| Demo             | kroki / pytanie / live lead                      | dwie kolumny z zachowaną kolejnością           | pełny krok, wynik poniżej                                 |
| Tabela leadów    | gęsta tabela                                     | mniej kolumn i kontrolowane zawijanie          | lista kart z szybkimi akcjami                             |
| Lead detail      | dokument + panel operacyjny                      | panel schodzi pod nagłówek lub dokument        | jedna kolejność i sticky primary action                   |
| Builder          | rail + lista + preview + inspector               | trzy obszary bez przedwczesnego stacku         | drill-down: Kroki / Podgląd / Ustawienia                  |
| Nawigacja panelu | sidebar Kwotum 256 px / zwinięty rail 72 px      | biała dolna nawigacja do 56 rem                | Start / Leady / Procesy / Analityka / Więcej, bez scrolla |
| Szablony panelu  | 5 kart, filtry, KPI i podgląd procesu            | 3/2 karty, podgląd pod opisem                  | 1 karta, filtry i KPI w jednej kolumnie                   |
| Ustawienia       | menu tras + formularz                            | przewijane poziomo menu tras                   | jedna przewijana linia zakładek, osobne trasy             |
| Widget           | wycentrowana powierzchnia procesu                | pełna szerokość w kontenerze                   | pojedyncze pytanie i dolne akcje                          |
| Pricing          | tabela porównawcza tylko po zatwierdzeniu modelu | kontrolowane przewijanie semantyczne           | pionowe plany, bez ściskania tabeli                       |

Dolna nawigacja panelu uwzględnia safe area i rezerwuje własną wysokość
w dokumencie. „Więcej” jest modalnym arkuszem dla capability-gated narzędzi,
konta, powiadomień i pomocy. Globalny pasek nie jest renderowany na szczególe
leada ani w roboczych widokach procesu, które mają własne tryby i akcje.

## Tolerancje geometrii

- szerokość sekcji i kontenera: różnica do 1–2%;
- główne proporcje kolumn: do 3%;
- wysokości kontrolek: ±2 px;
- kluczowe odstępy: ±4 px;
- rozmiar tekstu: właściwy token albo ±1 px względem referencji.

Przekroczenie tolerancji wymaga wpisu w raporcie diffu, a nie ukrycia przez
crop, overflow lub zmianę baseline'u.
