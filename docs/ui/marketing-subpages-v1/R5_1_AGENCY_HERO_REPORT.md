# R5.1 — raport korekty hero `/dla-agencji`

**Data:** 2026-08-03
**Viewporty QA:** 320, 375, 390, 430, 768, 1024, 1280, 1440 i 1536 px
**Status:** COMPLETE — zaakceptowane przez właściciela 2026-08-03
**Następny etap:** R5.2 — wyłącznie sekcja `#model-wdrozenia`

## Dlaczego etap został otwarty po raz trzeci

Właściciel produktu odrzucił dwa kolejne kierunki:

1. pierwszy wariant tworzył beżowy diagram tenantów, który nie występował w
   aplikacji;
2. drugi wariant nadal był marketingową inscenizacją: zawierał pływający
   telefon, dodatkową kartę roli agencji, dolny rail i skrócony dokument leada
   ze strony głównej zamiast rzeczywistego ekranu panelu.

Oba warianty przeszły część testów technicznych, ale nie spełniły nadrzędnego
kryterium wizualnego. Nie wolno traktować automatycznej punktacji jako
akceptacji właściciela.

Odrzucone rendery zachowano jako antyreferencje:

- `artifacts/visual-qa/marketing-subpages-v1/r5-1/rejected-diagram/`;
- `artifacts/visual-qa/marketing-subpages-v1/r5-1/rejected-marketing-mockup/`.

## Aktualne źródła prawdy

Korekta nie opiera się na poprzednim komponencie marketingowym. Jej anatomię
wyprowadzono bezpośrednio z działającego panelu:

- nawigacja i konto organizacji:
  `apps/web/app/panel/panel-navigation.tsx`;
- ikony panelu:
  `apps/web/app/panel/panel-icon.tsx` i
  `apps/web/app/panel/panel-navigation-icon.tsx`;
- ekran listy leadów:
  `apps/web/app/panel/[organizationId]/leady/page.tsx`;
- geometria, tabela, statusy i responsive:
  `apps/web/app/panel/styles.css` oraz
  `apps/web/app/panel/reference-fidelity.css`;
- zasady wiarygodności artefaktów panelu: `docs/panel-visual-qa.md`.

Historyczny `actual/leads-1536x1024.png` nie został uznany za aktualny dowód,
ponieważ `docs/panel-visual-qa.md` jawnie oznacza go jako nieaktualny po
późniejszych korektach panelu.

## Wykonana korekta

- usunięto telefon, widget, kartę roli agencji, dekoracyjne połączenia i dolny
  rail procesu;
- proof jest jednym pełnym ekranem listy leadów, a nie zbiorem nakładających
  się makiet;
- desktop odtwarza aktualny ciemnozielony sidebar Kwotum, kompletną nawigację,
  konto organizacji, nagłówek, filtry, siedem kolumn, pięć rekordów i
  paginację;
- komponent używa bezpośrednio ikon `PanelIcon` i `PanelNavigationIcon` z
  aplikacji;
- mobile przechodzi na układ wierszy leadów i dolną nawigację, analogicznie do
  prawdziwego panelu, zamiast skalować desktopową tabelę;
- syntetyczne rekordy reprezentują pięć obsługiwanych branż i są zamknięte w
  demonstracji panelu;
- elementy przypominające kontrolki są częścią nieinteraktywnego proofu — nie
  dodano atrap przycisków, pól ani linków do chronionego panelu;
- H1, opis, dwa działające CTA i prosty rejestr odpowiedzialności pozostają w
  języku strony głównej, ale nie konkurują z ekranem produktu;
- copy jednoznacznie rozdziela wdrożenie agencji od ról, leadów, historii i
  obsługi należących do organizacji klienta;
- niższe sekcje `/dla-agencji` nie zostały objęte etapem R5.1.

## Pomiary produkcyjne

| Viewport |       Hero |     Proof |     Panel |    Tabela | Dolna nawigacja | Min. tekst | Overflow | Błędy |
| -------: | ---------: | --------: | --------: | --------: | --------------: | ---------: | -------: | ----: |
|  1536 px | 1430,67 px | 675,19 px | 608,00 px | 310,56 px |            0 px |      12 px |     0 px |     0 |
|  1440 px | 1399,58 px | 675,19 px | 608,00 px | 310,56 px |            0 px |      12 px |     0 px |     0 |
|  1280 px | 1347,69 px | 675,19 px | 608,00 px | 310,56 px |            0 px |      12 px |     0 px |     0 |
|  1024 px | 1288,56 px | 675,19 px | 608,00 px | 310,56 px |            0 px |      12 px |     0 px |     0 |
|   768 px | 1460,33 px | 709,19 px | 642,00 px | 310,56 px |           64 px |      12 px |     0 px |     0 |
|   430 px | 1656,97 px | 763,14 px | 694,16 px | 422,56 px |           64 px |      12 px |     0 px |     0 |
|   390 px | 1666,09 px | 763,14 px | 694,16 px | 422,56 px |           64 px |      12 px |     0 px |     0 |
|   375 px | 1669,56 px | 772,33 px | 703,34 px | 431,75 px |           64 px |      12 px |     0 px |     0 |
|   320 px | 1759,89 px | 791,50 px | 722,52 px | 450,92 px |           64 px |      12 px |     0 px |     0 |

Główne CTA mają 52 px na desktopie i 56 px na telefonach. Metryki pochodzą z
produkcjnego buildu, dlatego nie zawierają developerskiego komunikatu CSP o
`eval()`.

## Visual QA

- wewnętrzna ocena wykonawcza: **19/20**;
- kompletność 4/4, geometria 4/4, typografia 4/4, gęstość 4/4, mobile 3/4;
- punkt mobile odjęto za wysokość kompletnego proofu 694–723 px;
- właściciel zaakceptował finalny render odpowiedzią „super dalej”;
- finalne rendery i metryki:
  `artifacts/visual-qa/marketing-subpages-v1/r5-1/after/`;
- porównania z pierwotnym baseline'em:
  `artifacts/visual-qa/marketing-subpages-v1/r5-1/compare/`;
- szczegółowy diff: `artifacts/visual-qa/marketing-subpages-v1/r5-1/diff.md`.

## Gate techniczny

- dedykowany Playwright R5.1: 11/11 PASS;
- R5.1 + wspólny shell + regresja strony głównej: 53/53 PASS;
- testy jednostkowe: 177/177 PASS;
- lint: 8/8 pakietów PASS;
- typecheck: 8/8 pakietów PASS;
- build: 8/8 pakietów PASS, 40 wygenerowanych stron;
- widget: 18 912 B gzip przy limicie 92 160 B;
- dziewięć viewportów: HTTP 200, brak overflow i błędów runtime;
- repo-wide RLS nie był ponownie uruchamiany; poprzednią próbę blokował limit
  shared memory hosta, a R5.1 nie zmienia bazy ani polityk.

## Decyzja właściciela

Właściciel zaakceptował finalny render odpowiedzią „super dalej”. Tym samym
potwierdzono, że:

1. ekran jest rozpoznawalny jako panel Kwotum bez dodatkowego wyjaśnienia;
2. pełna lista leadów jest właściwym głównym dowodem dla strony agencji;
3. proporcja tekstu do panelu jest właściwa na desktopie;
4. mobilny wariant z listą i dolną nawigacją odpowiada jakości produktu;
5. R5.1 może zostać oznaczone jako COMPLETE, a praca może przejść wyłącznie do
   R5.2.

Podstrona `/branze` oraz pięć tras branżowych nadal wymagają osobnego etapu R7
i R8. Nie wolno kopiować do nich tego ekranu bez ustalenia właściwego proofu
dla branż.
