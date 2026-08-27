# System głównej akcji Kwotum — 2026-08-27

## Status i zakres

Korekta zaakceptowana tekstową decyzją właściciela. Obejmuje główny wariant
`Button`/`LinkButton`, publiczny header i wspólne CTA marketingowe oraz aktywne
hero `/`, `/produkt`, `/jak-dziala`, `/branze` i `/dla-agencji`. Nie zmienia
API komponentów, copy, routingu, logiki, danych, auth, tenant scope ani RLS.

Poza zakresem pozostają inputy, karty, badge'e, statusy, przyciski ikonowe,
akcje destrukcyjne i branding widgetu konfigurowany przez tenantów. Dzięki temu
wyróżnik głównej akcji nie staje się kolejnym globalnym promieniem wszystkich
kontrolek.

## Diagnoza stanu przed

- panel korzystał z poprawnego wspólnego komponentu, ale CTA miało ten sam
  promień 8 px co pola;
- marketing zawierał kilka aktywnych kopii stylu z promieniami 4–11 px i
  zieleniami `#003B25`, `#06753A` oraz `#0F4B36`;
- późniejsze, bardziej specyficzne selektory headera i hero nadpisywały
  podstawową klasę, więc sama zmiana jednego globalnego selektora nie dawała
  spójnego wyniku;
- cięższe cienie i lokalne kolory rozmywały jeden rozpoznawalny sygnał akcji.

## Decyzja

| Rola            | Wartość        | Powód                                                           |
| --------------- | -------------- | --------------------------------------------------------------- |
| `action`        | `#0B684A`      | jaśniejszy od głębokiego brandu, nadal spokojny i profesjonalny |
| `action-hover`  | `#07543C`      | jednoznaczna reakcja bez efektu unoszenia                       |
| `action-border` | `#075139`      | cienka, precyzyjna krawędź na jasnych tłach                     |
| `radius-action` | `14px`         | bardziej miękki i własny, ale nie generyczna pigułka            |
| wysokość        | minimum `44px` | wygodny cel dotykowy i zgodność z kontraktem panelu             |

Zachowano solidne tło bez gradientu i tylko delikatną wewnętrzną linię światła.
Biały tekst na `action` ma kontrast 6,79:1, a na `action-hover` 8,97:1.

## Visual QA

Źródła kierunku: rzeczywisty landing V7 w 1440 × 900 i 390 × 844 oraz showcase
`/design-system` w 1440 × 900. Stan `before` został odtworzony na aktualnym DOM
przez poprzednie tokeny `#003B25` i 8 px; `after` pochodzi z finalnej kaskady.

- desktop `/`: `#0B684A`, granica `#075139`, radius 14 px, hero CTA 64 px;
- mobile `/`: te same kolory i radius, hero CTA 56 px;
- `/design-system`: te same kolory i radius, wspólny `Button` 44 px;
- macierz `/`, `/produkt`, `/jak-dziala`, `/branze`, `/dla-agencji`, `/cennik`
  i `/wordpress` na 1440 × 900 oraz 390 × 844 potwierdza co najmniej jedną
  widoczną główną akcję, dokładnie 14 px promienia i 0 px overflow na każdej
  trasie;
- poziomy overflow: 0 px na 1440 × 900 i 390 × 844;
- błędy runtime strony podczas pomiaru: 0;
- forced colors usuwa dekoracyjną linię wewnętrzną i przywraca kolory systemowe;
- reduced motion nadal korzysta z istniejącego globalnego wyłączenia animacji.

Gate repozytorium: format 100%, lint 8/8, typecheck 8/8, unit 22/22 (w tym
UI 45/45 i web 225/225), build 16/16 z 43 stronami statycznymi, PostgreSQL/RLS
PASS, WordPress PASS i secret scan PASS. Pełny skrypt SAST jest czerwony przez
wcześniejszą, niezmienioną dyrektywę `eslint-disable-next-line` w bibliotece
szablonów panelu; zmienione pliki nie zawierają supresji ani pozostałych
zabronionych wzorców.

Artefakty: `artifacts/visual-qa/kwotum-action-v1/`.

## Rollback i ryzyka

Rollback polega na usunięciu ról `action*`/`radius-action` i przywróceniu
`brand` oraz `radius-md` w selektorach przycisków; nie wymaga migracji. Główne
ryzyko to przyszła lokalna reguła CSS o większej specyficzności. Ogranicza je
test tokenów, końcowy kontrakt kaskady marketingu i zakaz nowych lokalnych
kolorów CTA.
