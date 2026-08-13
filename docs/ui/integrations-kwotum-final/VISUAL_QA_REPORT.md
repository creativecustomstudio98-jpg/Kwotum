# Visual QA — centrum integracji Kwotum

**Data:** 2026-08-13
**Wynik:** PASS, 19/20

## Ocena

| Obszar      | Wynik | Dowód                                                    |
| ----------- | ----: | -------------------------------------------------------- |
| Kompletność |   4/4 | nawigacja, 4 statusy, operacje i historia                |
| Geometria   |   4/4 | płaski desktop 1448 px i kontrolowany stack 390 px       |
| Typografia  |   4/4 | spokojne 8–18 px, wagi 400/500/600, kontrast AA          |
| Gęstość     |   4/4 | techniczna tabela bez podwójnych powierzchni             |
| Mobile      |   3/4 | pełny reflow bez overflow; brak obrazu źródłowego mobile |

## Dowody runtime

- `artifacts/visual-qa/12zq-integrations-navigation/desktop/webhook-1448x-full.png`;
- `artifacts/visual-qa/12zq-integrations-navigation/desktop/wordpress-1448x-full.png`;
- `artifacts/visual-qa/12zq-integrations-navigation/mobile/webhook-390x-full.png`;
- `artifacts/visual-qa/12zq-integrations-navigation/mobile/wordpress-390x-full.png`.

Izolowany Playwright przechodzi 1/1 na produkcyjnym standalone. Potwierdza
Enter na nawigacji kanałów, obrót sekretu z wynikiem pokazanym dokładnie raz,
negatywny DNS guard testu, 44 px kontrolek mobile, brak poziomego overflow,
forced colors i axe bez naruszeń. Akcje zwracające sekret lub ID dostawy nie
rewalidują strony przed pokazaniem wyniku. Dane fixture są syntetyczne i
usuwane po teście; referencja nie trafia do runtime.
