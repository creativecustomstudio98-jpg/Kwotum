# R5.2 — raport przebudowy metody wdrożenia `/dla-agencji`

**Data:** 2026-08-03
**Viewporty QA:** 320, 375, 390, 430, 768, 1024, 1280, 1440 i 1536 px
**Status:** COMPLETE — zaakceptowane przez właściciela 2026-08-04
**Następny etap:** R5.3 — wyłącznie granice tenantów i własność leadów

## Problem wyjściowy

Legacy’owa sekcja `#model-wdrozenia` była czterokolumnową listą z globalnego
`marketing.css`. Przekazywała poprawną kolejność kroków, ale wizualnie nie
odpowiadała ani zaakceptowanej stronie głównej, ani panelowi Kwotum:

- nie tworzyła jednego rozpoznawalnego modułu produktu;
- wszystkie etapy miały tę samą wagę, bez właściciela i rezultatu;
- na desktopie wyglądała jak cztery luźne bloki redakcyjne;
- mobile tylko układał te bloki jeden pod drugim;
- brakowało jawnego rozdzielenia wspólnej architektury, indywidualnej treści i
  danych należących do organizacji klienta.

Baseline zachowano w
`artifacts/visual-qa/marketing-subpages-v1/r5-2/before/`.

## Źródła kierunku

- zaakceptowane hero R5.1 i jego pełny ekran listy leadów;
- prowadzony przebieg na stronie głównej:
  `apps/web/app/(marketing)/home-redesign.tsx`;
- rzeczywiste ikony nawigacji panelu:
  `apps/web/app/panel/panel-navigation-icon.tsx`;
- wymagania sekcji R5.2 z
  `docs/ui/marketing-subpages-v1/ROUTE_AND_SECTION_AUDIT.md`;
- kontrakt responsive i visual QA repozytorium.

Sekcja wykorzystuje język wizualny tych źródeł, ale nie kopiuje trzech kart ze
strony głównej i nie udaje kolejnego ekranu aplikacji.

## Wykonana przebudowa

- zastąpiono legacy’owe `.agency-flow` osobnym komponentem `AgencyMethod` i
  izolowanym CSS Module;
- nagłówek jednoznacznie wyjaśnia zasadę: powtarzalna jest metoda, a nie zestaw
  pytań;
- cztery etapy tworzą jeden plan wdrożenia zamiast czterech niezależnych kart;
- każdy etap ma numer, ikonę panelu, kontekst, właściciela, opis działania i
  konkretny rezultat;
- sekwencja rozdziela wspólny warsztat, konfigurację i publikację agencji od
  przekazania codziennej obsługi firmie klienta;
- dolny rejestr utrwala trzy granice: wspólna architektura, indywidualna treść i
  logika oraz dane w organizacji klienta;
- sekcja nie zawiera przycisków, pól, linków ani innych atrap kontrolek;
- nie dodano obietnic white-label, automatycznej delegacji ani wspólnej bazy
  leadów;
- zaakceptowane hero R5.1 oraz sekcje R5.3–R5.5 nie zostały zmienione.

## Kontrakt responsive

- powyżej 1024 px plan jest zwartą, czterokolumnową tabelą procesu;
- od 1024 do 545 px rezultat przechodzi pod treść kroku, bez ściskania kolumn;
- do 544 px każdy etap staje się pionowym fragmentem jednej osi procesu;
- mobilny wariant zachowuje jedną powierzchnię, wspólny nagłówek i rejestr
  zasad, zamiast tworzyć cztery odłączone karty;
- najmniejszy widoczny tekst ma 12 px, a dokument nie ma poziomego overflow.

## Pomiary produkcyjne

| Viewport |     Sekcja |       Plan | Pierwszy etap | Rejestr zasad | Min. tekst | Overflow | Błędy |
| -------: | ---------: | ---------: | ------------: | ------------: | ---------: | -------: | ----: |
|  1536 px | 1237,03 px |  662,73 px |     123,19 px |      91,19 px |      12 px |     0 px |     0 |
|  1440 px | 1203,97 px |  662,73 px |     123,19 px |      91,19 px |      12 px |     0 px |     0 |
|  1280 px | 1147,55 px |  662,73 px |     123,19 px |      91,19 px |      12 px |     0 px |     0 |
|  1024 px | 1466,56 px |  985,31 px |     203,42 px |      92,83 px |      12 px |     0 px |     0 |
|   768 px | 1501,75 px | 1040,44 px |     197,83 px |     135,42 px |      12 px |     0 px |     0 |
|   430 px | 2007,72 px | 1476,84 px |     279,75 px |     202,77 px |      12 px |     0 px |     0 |
|   390 px | 2074,34 px | 1561,78 px |     302,27 px |     220,16 px |      12 px |     0 px |     0 |
|   375 px | 2107,38 px | 1601,69 px |     302,27 px |     237,55 px |      12 px |     0 px |     0 |
|   320 px | 2296,23 px | 1745,36 px |     343,81 px |     237,55 px |      12 px |     0 px |     0 |

Wszystkie pomiary pochodzą z produkcyjnego buildu i mają HTTP 200 oraz pustą
listę błędów konsoli i `pageerror`.

## Visual QA

- wewnętrzna ocena wykonawcza: **19/20**;
- kompletność 4/4, geometria 4/4, typografia 4/4, zgodność z UI 4/4, mobile
  3/4;
- punkt mobile odjęto za wysokość 2296 px przy 320 px, mimo że układ pozostaje
  czytelny i nie ma overflow;
- finalne rendery i metryki:
  `artifacts/visual-qa/marketing-subpages-v1/r5-2/after/`;
- porównania przed/po:
  `artifacts/visual-qa/marketing-subpages-v1/r5-2/compare/`;
- szczegółowy diff:
  `artifacts/visual-qa/marketing-subpages-v1/r5-2/diff.md`.

## Gate techniczny

- dedykowany Playwright R5.2: 11/11 PASS;
- R5.1 + R5.2: 22/22 przypadki PASS w finalnej regresji;
- pełna regresja R5.1 + R5.2 + shell + home: 62/64 przy pierwszym równoległym
  uruchomieniu; dwa pełne crawle shellu przekroczyły 30 s bez błędu asercji,
  a izolowany rerun przeszedł 2/2 w 14,6 s bez zmiany timeoutu;
- testy jednostkowe: 177/177 PASS;
- lint: 8/8 pakietów PASS;
- typecheck: 8/8 pakietów PASS;
- build: 8/8 pakietów PASS, 40 wygenerowanych stron;
- widget: 18 912 B gzip przy limicie 92 160 B;
- axe WCAG 2.2 AA, klawiatura, reduced motion i forced colors: PASS;
- RLS nie był uruchamiany, ponieważ etap nie zmienia danych, autoryzacji ani
  polityk bazy.

## Decyzja właściciela

Właściciel zaakceptował etap poleceniem „kontynuuj”, wydanym bezpośrednio po
pytaniu o przejście do R5.3. Tym samym potwierdzono, że:

1. sekcja wygląda jak część tego samego produktu co hero i panel;
2. jedna powierzchnia procesu jest właściwsza niż cztery osobne karty;
3. właściciel i rezultat każdego etapu są wystarczająco czytelne;
4. mobilna oś procesu zachowuje właściwą gęstość informacji;
5. R5.2 może zostać oznaczone jako COMPLETE, a praca może przejść wyłącznie do
   R5.3.
