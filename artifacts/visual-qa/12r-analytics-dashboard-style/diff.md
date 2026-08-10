# Visual QA — rozwinięta analityka w stylu dashboardu

## Kontrakt

- viewport bazowy: 1536 × 1024;
- mobile: 390 × 844 oraz kontrola overflow przy 320 × 800;
- anatomia produktu: crop `22,397,484,225` z
  `references/product-app-board.png`;
- nowsza decyzja właściciela: pełna analityka ma używać stylu dashboardu,
  lecz rozwijać go o dalsze realne przekroje.

## Wynik

- topbar: 1328 × 78 px;
- cztery KPI: po 309 × 118 px, wspólne `y=78`;
- wykres: 30 prawdziwych dni dla okresu 30 dni;
- dolny podział desktop: drop-off 884 px, wersje 374 px;
- mobile: karty 361 px, jedna kolumna, overflow 0 px;
- działające okresy: 7, 30 i 90 dni;
- Playwright + axe: 1/1 PASS;
- build produkcyjny: PASS.

## Świadome różnice

Crop planszy pokazuje jedynie KPI, wykres oraz jakość leadów w skali mapy wielu
ekranów. Implementacja wykorzystuje pełną trasę, wspólny sidebar Lorum i
rzeczywiste dane tenantowe. Dalsze sekcje nie są kopiami nieistniejących
ekranów: rozwijają ten sam język wizualny o lejek, score, źródła, urządzenia,
drop-off i wersje procesu. Nie dodano martwych filtrów ani przykładowych danych.

## Korekta dolnych wizualizacji

Po uwadze właściciela usunięto powtarzalny język prostych pasków:

- lejek jest sekwencją czterech zaokrąglonych etapów;
- score wykorzystuje proporcjonalnie opisane bąble;
- źródła i urządzenia używają po 40 kafelków z osobną legendą;
- drop-off jest siatką kart diagnostycznych z trzema wartościami;
- wersje używają pierścieni ukończenia;
- w dolnych regionach nie pozostał żaden element `progress`.

Duży wykres i donut jakości pozostały bez redesignu. Mobilny wykres 30 dni
pokazuje siedem niekolidujących etykiet zamiast wszystkich trzydziestu.

## Artefakty

- `reference-product.png` — crop planszy produktu;
- `before-1536x1024.png` — stan przed korektą;
- `after-v2-1536x1024.png` — końcowy desktop;
- `after-v2-390x844.png` — końcowy mobile;
- `after-production-*.png` — viewportowe i pełnostronicowe rendery builda
  produkcyjnego;
- `reference-left-after-v2-right.png` — produkt po lewej, rozwinięty ekran po
  prawej;
- `overlay-v2.png` — nakładka 50% stanu before/after;
- `difference-v2.png` — wzmocniona różnica pikselowa.
- `lower-charts-before-left-after-right.png` — stare paski po lewej, nowe
  wizualizacje po prawej;
- `lower-charts-overlay-v2.png` i `lower-charts-difference-v2.png` — porównanie
  samego dolnego regionu;
- `lower-charts-after-v2-1536x-full.png` i
  `lower-charts-after-v2-390x-full.png` — końcowe pełnostronicowe rendery.
