# Landing desktop V7 — mapa pomiarów D0

**Viewport podstawowy:** 1672 × 941 px
**Charakter pomiarów:** preflight z tolerancją około ±8 px; D1–D4 potwierdzają
wartości przez overlay i pomiar DOM

## Wspólna siatka

| Parametr                          |                                                Wartość robocza |
| --------------------------------- | -------------------------------------------------------------: |
| viewport sekcyjny                 |                                                  1672 × 941 px |
| zewnętrzna oś lewa/prawa          |                                             około 64 / 1608 px |
| szerokość maksymalna              |                                                  około 1544 px |
| główna szerokość treści kart      |                               1410–1450 px zależnie od regionu |
| główny promień dużych powierzchni |                                                 około 18–24 px |
| promień kontrolek i małych kart   |                                                 około 10–14 px |
| hairline                          |                                    około 1 px, chłodna szarość |
| tło                               | chłodne off-white z bardzo subtelną niebiesko-zieloną poświatą |
| nagłówek sekcji                   |                           około 52–64 px, 1.0–1.08 line-height |
| body sekcji                       |                          około 18–22 px, 1.45–1.65 line-height |
| kicker                            |                    około 14–16 px, uppercase, szeroki tracking |

## V7-01 — header i hero

| Element        | Pomiar roboczy                                                          |
| -------------- | ----------------------------------------------------------------------- |
| header         | `y 0–96`, logo około `x 64`, nav wycentrowana, akcje przy `x 1308–1608` |
| hero content   | `y 124–807`, dwie główne strefy około 40% / 60%                         |
| copy           | `x 65–620`, początek kickera około `y 160`                              |
| H1             | szerokość około 570 px, cztery linie, około 60 px                       |
| body           | szerokość około 550 px, trzy linie                                      |
| CTA            | dwa przyciski około 186 × 64 i 236 × 64 px                              |
| facts          | trzy pozycje w jednym rzędzie poniżej CTA                               |
| aplikacja      | `x około 880–1608`, `y około 125–735`                                   |
| panel procesu  | pionowy overlay około 230 × 495 px, zachodzący na panel leada           |
| pasek pod hero | `y około 807–941`, jedna linia dowodu/capabilities                      |

Krytyczne: wspólna oś headera i hero, duża różnica skali między copy a
product UI, panel procesu przed panelem leada, brak rastra tekstu.

## V7-02 — trzy kroki

| Element            | Pomiar roboczy                                        |
| ------------------ | ----------------------------------------------------- |
| heading group      | środek, `y około 123–290`                             |
| karty              | `y około 354–750`, `x około 129–1543`                 |
| siatka             | 3 kolumny, każda około 440 px, gap około 46 px        |
| numer              | koło około 42 px przy lewym górnym rogu karty         |
| ikona              | kwadrat około 80 px, `y około 455`                    |
| łączniki           | białe koła około 64 px na przerwie między kartami     |
| dolna powierzchnia | bardzo lekki szeroki panel kończący się około `y 827` |

Krytyczne: trzy równorzędne kroki, widoczne strzałki pośrodku gapu, karty nie
mogą wyglądać jak pricing ani generyczne feature cards.

## V7-03 — kluczowe informacje

| Element       | Pomiar roboczy                                    |
| ------------- | ------------------------------------------------- |
| heading group | środek, `y około 120–420`                         |
| karty         | `y około 482–815`                                 |
| kolumny       | 4, szerokość około 324–345 px, gap około 34 px    |
| karta 1       | `x około 109–433`                                 |
| karta 2       | `x około 468–788`                                 |
| karta 3       | `x około 821–1165`                                |
| karta 4       | `x około 1199–1554`                               |
| ikony         | kwadrat około 78 px                               |
| wartości      | zielona lekka powierzchnia, bez ciężkiego badge'a |
| score         | pierścień około 98 px + label pod nim             |

Krytyczne: pierwsze dwie karty są bardzo spokojne, trzecia pokazuje prawdziwe
miniatury, czwarta ma mierzalny pierścień score.

## V7-04 — integracje

| Element       | Pomiar roboczy                                               |
| ------------- | ------------------------------------------------------------ |
| heading group | środek, `y około 58–282`                                     |
| układ główny  | pięć powierzchni: 2 lewe + 1 centrum + 2 prawe               |
| lewa kolumna  | `x około 139–513`, dwa panele po około 168 px wysokości      |
| karta leada   | `x około 656–1015`, `y około 333–722`                        |
| prawa kolumna | `x około 1118–1525`, dwa panele                              |
| łączniki      | zielone przerywane linie z punktami końcowymi                |
| dolny rail    | `x około 139–1525`, `y około 765–881`, trzy równe komunikaty |

Krytyczne: centrum jest rekordem leada, nie logo integratora; linie mają
czytelnie pokazywać przepływ danych. Nazwy kanałów muszą odpowiadać scope.

## V7-05 — dwa warianty rozpoczęcia

| Element           | Pomiar roboczy                                    |
| ----------------- | ------------------------------------------------- |
| heading group     | środek, `y około 55–241`                          |
| karty             | `y około 280–822`                                 |
| lewa karta        | `x około 313–807`, szerokość około 494 px         |
| prawa karta       | `x około 830–1334`, szerokość około 504 px        |
| wyróżnienie       | prawa karta z zielonym borderem i pełnym CTA      |
| lista             | pięć–sześć pozycji, około 43–45 px rytmu          |
| CTA               | pełna szerokość wewnętrzna, około 64 px wysokości |
| dolne zapewnienia | trzy pozycje w jednym rzędzie około `y 852–901`   |

Krytyczne: odwzorować geometrię i hierarchię, ale nie kopiować kwot, trialu,
płatności ani limitów bez decyzji produktowej.

## V7-06 — FAQ i pomoc

| Element       | Pomiar roboczy                           |
| ------------- | ---------------------------------------- |
| lewy region   | `x około 86–968`, `y około 89–829`       |
| H2            | dwie linie, około 62 px                  |
| accordion     | pięć wierszy, wysokość około 83 px każdy |
| ikona wiersza | kwadrat około 50 px                      |
| prawa karta   | `x około 1078–1584`, `y około 146–861`   |
| karta pomocy  | padding około 40 px, trzy linki/akcje    |
| dolne facts   | dwie kolumny po hairline                 |
| CTA           | outline na pełną szerokość karty         |

Krytyczne: FAQ pozostaje natywnym `details/summary` albo równoważnym dostępnym
accordionem. Panel pomocy pokazuje tylko istniejące kanały.

## V7-07 — końcowe CTA

| Element           | Pomiar roboczy                                   |
| ----------------- | ------------------------------------------------ |
| duża powierzchnia | `x około 64–1608`, `y około 80–857`              |
| logo              | `x około 115`, `y około 126`                     |
| copy              | `x około 115–681`, `y około 218–590`             |
| CTA               | dwa przyciski około 225 × 68 i 251 × 68 px       |
| facts             | trzy pozycje w jednym rzędzie około `y 770`      |
| proof cards       | prawa połowa; dwie górne KPI i jedna dolna karta |
| łuki tła          | bardzo subtelne, nie mogą obniżać kontrastu      |

Krytyczne: duży finalny panel nie może zawierać fikcyjnych wzrostów ani KPI.
Zachować asymetrię copy/proof i jeden dominujący zielony przycisk.

## V7-08 — overview

V7-08 jest planszą pomniejszoną, nie screenshotem 941 px szerokości produkcji.
Ustala kolejność:

1. header + hero + pasek dowodu;
2. trzy kroki;
3. cztery kluczowe grupy informacji;
4. przykładowy lead;
5. integracje — dodane przez osobny V7-04 mimo braku na overview;
6. dwa warianty rozpoczęcia;
7. FAQ + końcowe CTA;
8. footer.

Nie wyliczamy RMSE pełnej produkcyjnej strony względem V7-08, ponieważ obrazy
mają inne skale i proporcje. RMSE/overlay obowiązuje siedem natywnych kadrów
1672 × 941. Dla overview wykonuje się side-by-side i ocenę kompozycyjną.
