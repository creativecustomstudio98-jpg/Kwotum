# R5.1 — visual diff hero `/dla-agencji`

## Status

**ACCEPTED / COMPLETE.** Właściciel zaakceptował finalny render 2026-08-03
odpowiedzią „super dalej”.

Pierwszy diagram oraz druga marketingowa makieta zostały odrzucone przez
właściciela produktu mimo zielonych testów technicznych. Finalny render jest
trzecim, odrębnym kierunkiem.

## Antyreferencje

- `rejected-diagram/` — wymyślony beżowy diagram tenantów;
- `rejected-marketing-mockup/` — pływający telefon, karta roli agencji, rail i
  uproszczony dokument leada;
- oba katalogi mają zapobiec powrotowi do inscenizowanych proofów, które nie
  przypominają właściwego panelu.

## Źródła aktualnej geometrii

- `apps/web/app/panel/panel-navigation.tsx`;
- `apps/web/app/panel/[organizationId]/leady/page.tsx`;
- `apps/web/app/panel/styles.css`;
- `apps/web/app/panel/reference-fidelity.css`;
- `apps/web/app/panel/panel-icon.tsx`;
- `apps/web/app/panel/panel-navigation-icon.tsx`;
- `docs/panel-visual-qa.md`.

## Dziesięć zasadniczych różnic względem odrzuconej makiety

1. Zamiast kilku nakładających się obiektów jest jeden pełny ekran panelu.
2. Telefon i widget zostały całkowicie usunięte.
3. Skrócony `CompactLeadDocument` ze strony głównej nie jest już używany.
4. Sidebar ma rzeczywistą markę, siedem pozycji nawigacji i konto organizacji.
5. Proof pokazuje właściwy ekran listy leadów: nagłówek, wyszukiwanie, akcję,
   filtry, tabelę i paginację.
6. Ikony są importowane z panelu, a nie rysowane jako nowy system marketingowy.
7. Desktop pokazuje siedem kolumn przy pełnej szerokości i sześć na węższym
   layoucie.
8. Mobile używa listy rekordów i dolnej nawigacji zgodnej z aplikacją, zamiast
   miniaturowej tabeli lub dekoracyjnego telefonu.
9. Podział odpowiedzialności jest prostym rejestrem tekstowym, a nie osobną
   kartą unoszącą się nad produktem.
10. Demonstracja nie zawiera focusowalnych atrap kontrolek ani linków
    sugerujących dostęp do chronionego panelu.

## Pomiary finalne

| Viewport |       Hero |     Proof |     Panel |    Tabela | Mobile nav | Min. tekst | Overflow | Błędy |
| -------: | ---------: | --------: | --------: | --------: | ---------: | ---------: | -------: | ----: |
|  1536 px | 1430,67 px | 675,19 px | 608,00 px | 310,56 px |       0 px |      12 px |     0 px |     0 |
|  1440 px | 1399,58 px | 675,19 px | 608,00 px | 310,56 px |       0 px |      12 px |     0 px |     0 |
|  1280 px | 1347,69 px | 675,19 px | 608,00 px | 310,56 px |       0 px |      12 px |     0 px |     0 |
|  1024 px | 1288,56 px | 675,19 px | 608,00 px | 310,56 px |       0 px |      12 px |     0 px |     0 |
|   768 px | 1460,33 px | 709,19 px | 642,00 px | 310,56 px |      64 px |      12 px |     0 px |     0 |
|   430 px | 1656,97 px | 763,14 px | 694,16 px | 422,56 px |      64 px |      12 px |     0 px |     0 |
|   390 px | 1666,09 px | 763,14 px | 694,16 px | 422,56 px |      64 px |      12 px |     0 px |     0 |
|   375 px | 1669,56 px | 772,33 px | 703,34 px | 431,75 px |      64 px |      12 px |     0 px |     0 |
|   320 px | 1759,89 px | 791,50 px | 722,52 px | 450,92 px |      64 px |      12 px |     0 px |     0 |

## Wewnętrzna punktacja

| Kryterium              | Wynik | Uzasadnienie                                                                     |
| ---------------------- | ----: | -------------------------------------------------------------------------------- |
| Kompletność regionów   |   4/4 | Teza, akcje, odpowiedzialność i pełny ekran leadów są obecne.                    |
| Geometria i proporcje  |   4/4 | Panel ma jeden czytelny prostokąt i wierną strukturę aplikacji.                  |
| Typografia i spacing   |   4/4 | Minimum 12 px, rytm panelu i hierarchia home są zachowane.                       |
| Gęstość danych i stany |   4/4 | Pięć rekordów, statusy, filtry i paginacja odpowiadają operacyjnemu ekranowi.    |
| Transformacja mobile   |   3/4 | Lista i dolna nawigacja są poprawne, lecz kompletny panel pozostaje dość wysoki. |

**Wynik wykonawczy: 19/20. Akceptacja właściciela: potwierdzona.**

## Gate

- R5.1: 11/11 PASS;
- R5.1 + shell + home: 53/53 PASS;
- unit: 177/177 PASS;
- lint, typecheck i build: po 8/8 pakietów PASS;
- produkcyjna macierz 320–1536 px: HTTP 200, zero overflow i błędów runtime.

## Znane granice

- Proof jest nieinteraktywną demonstracją z danymi syntetycznymi. Nie daje
  dostępu do chronionego panelu i nie udaje działającego wyszukiwania.
- Niższe sekcje `/dla-agencji` nadal należą do R5.2–R5.5.
- `/branze` i trasy branżowe należą do R7–R8 i wymagają własnego proofu.
