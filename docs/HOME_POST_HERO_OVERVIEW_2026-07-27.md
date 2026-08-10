# Sekcje pod hero — szablony oraz porównanie procesu

**Data:** 2026-07-27  
**Zakres:** wyłącznie `/`, bez zmian API, panelu, widgetu, danych i tokenów  
**Referencja nadrzędna:** najnowsze dwa załączniki rozmowy pokazujące okrągłe
ikony oraz dwukolumnowy region porównanie → proces → dokument leada

## Wynik

Nowszy załącznik zastąpił interpretację z poziomym blokiem czterech kroków.
Aktualna kolejność po hero jest następująca:

1. pasek sześciu danych z zielonymi ikonami liniowymi w jasnych, okrągłych
   oprawach;
2. samodzielna sekcja „Gotowe szablony dla Twojej branży” z pięcioma
   fotograficznymi kaflami;
3. pełnoszeroki region:
   - po lewej komunikat o niekompletnym formularzu oraz porównanie
     „Typowe zapytanie” / „Lead po przejściu Lorum”;
   - po prawej pionowy proces 01–04 i kompaktowy dokument leada.

Poziomy blok „Jak działa Lorum?” nad szablonami został usunięty. Wszystkie
kafle szablonów nadal prowadzą do istniejących stron branżowych.

## Geometria

Hero, pasek danych, szablony i region porównania korzystają z tej samej osi
kontenera:

| Viewport | Lewa krawędź | Szerokość każdego regionu |
| -------: | -----------: | ------------------------: |
|  2048 px |      79,9 px |                 1888,3 px |
|  1440 px |      56,2 px |                 1327,7 px |

Na 2048 px podział regionu porównania ma `1085,7 / 802,5 px`, czyli
57,5% / 42,5%. Karta porównania ma `603,5 × 392 px`, a dokument leada
`354,1 × 448 px`. Etykiety i wartości dokumentu mają osobne kolumny, pełne
materiały, następny krok i aktywną akcję.

## Responsive

- 1152 px i szerzej: referencyjny układ dwóch kolumn;
- poniżej 1152 px: porównanie i proces układają się pionowo;
- 390/320 px: porównanie przechodzi na dwie powierzchnie jedna pod drugą,
  timeline pozostaje pionowy, a dokument leada używa kompaktowej typografii;
- brak poziomego overflow i brak nakładania się dwóch głównych regionów.

## Visual QA

- artefakty:
  `artifacts/visual-qa/12j-icons-comparison-process/`;
- automatyczne baseline’y pięciu viewportów:
  `tests/e2e/__screenshots__/marketing-home-comparison-process-*.png`;
- sprawdzone viewporty: 2048, 1440, 1024, 768, 390 i 320 px;
- test geometrii mierzy kolejność i brak przecięcia regionów;
- test ikon sprawdza kołową oprawę i nieprzezroczyste, jasne zielone tło;
- najnowszy załącznik rozmowy nie jest dostępny jako lokalne binarium, dlatego
  nie raportujemy sztucznego RMSE ani pixel diffu.

Zachowaną różnicą tekstową jest aktywna marka Lorum zamiast historycznej nazwy
Wyceno widocznej w źródle. Wynika to z aktywnego kontraktu marki.

## Bezpieczeństwo i zakres

Sekcje są statycznym, serwerowo renderowanym UI. Nie zapisują danych, nie
wykonują estymacji i nie dodają uprawnień. Obrazy kafli są syntetycznym
materiałem demonstracyjnym bez osób, tekstu i znaków marek. Etap nie obejmuje
deploymentu.

## Weryfikacja

- `pnpm format:check` — PASS;
- `pnpm lint` — 8/8 PASS;
- `pnpm typecheck` — 8/8 PASS;
- `pnpm test` — 87 testów jednostkowych oraz pełne RLS/PostgreSQL i WordPress
  PASS;
- `pnpm security:scan` — PASS;
- `pnpm build` — 8/8, 37 tras, widget 15 903 B gzip;
- `pnpm e2e` — 32/32 PASS.
