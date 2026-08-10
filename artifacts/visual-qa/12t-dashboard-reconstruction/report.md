# Visual QA — Etap 12T

## Wynik

**PASS — 19/20**

Dashboard odtwarza strukturę pełnej referencji w języku Lorum: zachowuje jeden
sidebar, pełną szerokość workspace, sześć KPI, trzy główne wizualizacje, trzy
rzędy danych i realne akcje. Jeden punkt pozostaje świadomie odjęty za brak
identycznej geometrii globalnego nagłówka: źródło nie pokazuje sidebara,
natomiast produkt wymaga jego zachowania.

## Źródło i rendery

| Artefakt                         |     Rozmiar | SHA-256                                                            |
| -------------------------------- | ----------: | ------------------------------------------------------------------ |
| `reference-dashboard.png`        | 1964 × 1500 | `e75334e620430e7500e8fb7cd77eb717707a63dfb4c72738400fef7552ec4646` |
| `after-production-1536x1024.png` | 1536 × 1267 | `292b11878078312cefbdea0273a000a8ab8608ca0561719cf40f3f386b2eaa6a` |
| `after-production-390x844.png`   |  390 × 3820 | `749d4b4188e5b000dda2b6ff77a26d62f46ac82cf1826f52145207febf77d589` |

`contact-sheet-reference-after.png` pokazuje referencję i finalny render obok
siebie. `overlay-50-desktop.png` oraz `difference-desktop.png` korzystają
z normalizacji 1536 × 1173 px. RMSE wynosi `0.28242`, ale nie jest kryterium
pixel-perfect, ponieważ referencja nie zawiera obowiązkowego sidebara Lorum,
ma inny viewport i pokazuje przykładowe dane.

## Geometria

- viewport desktop: 1536 × 1024;
- sidebar: 208 px;
- workspace: 1313 px;
- powierzchnia dashboardu: 1313 px;
- sześć KPI: po 203 px, wspólna oś `y`;
- główne karty: 457 / 331 / 453 px;
- topbar: 88 px;
- wysokość pełnego dokumentu: 1267 px;
- desktop overflow: 0 px.

Mobile 390 × 844:

- efektywna szerokość dokumentu: 390 px;
- powierzchnia kart: 361 px;
- kolejność: reakcja → KPI 2 × 3 → najnowsze leady → wykresy → dalsze dane;
- pełna wysokość dokumentu: 3820 px;
- overflow: 0 px.

## Funkcjonalność i dostępność

- wyszukiwarka wysyła prawdziwy parametr `q` do listy leadów;
- każdy lead, CTA, szybka akcja i status systemu prowadzi do istniejącej trasy;
- źródła nie są renderowane poniżej progu prywatności;
- statusy, procesy, powiadomienia i WordPress respektują capability oraz
  tenant scope istniejących usług;
- wykresy mają tekstowe accessible names;
- desktop axe: 0 naruszeń;
- mobile axe: 0 naruszeń;
- reduced motion wyłącza animację loadingu;
- forced colors zachowuje czytelne kontury wykresów.

## Walidacja

- `pnpm lint` — PASS;
- `pnpm typecheck` — PASS;
- `pnpm test` — PASS, 103 testy unit oraz pełne RLS i WordPress;
- `pnpm format:check` — PASS;
- `pnpm security:scan` — PASS;
- `pnpm build` — PASS;
- izolowany produkcyjny Playwright dashboard desktop/mobile + axe — 1/1 PASS.

## Świadome różnice

1. Sidebar Lorum pozostaje, choć źródło pokazuje samą powierzchnię dashboardu.
2. „Aktywność zespołu” nie jest udawana bez modelu przypisania.
3. Reklamowe integracje zastępują prawdziwy WordPress i wewnętrzne dostawy.
4. Przyciski przypomnienia zastępuje bezpieczne przejście do szczegółu leada.
5. Suma wycen używa minimalnej wartości przedziału i jest opisana słowem „od”.
6. Dane, nazwiska, trendy i liczby pochodzą z organizacji QA, nie z obrazu.
