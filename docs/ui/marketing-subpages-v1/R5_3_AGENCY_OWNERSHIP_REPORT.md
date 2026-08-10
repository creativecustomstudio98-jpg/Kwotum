# R5.3 — raport przebudowy własności leadów `/dla-agencji`

**Data:** 2026-08-04
**Viewporty QA:** 320, 375, 390, 430, 768, 1024, 1280, 1440 i 1536 px
**Status:** COMPLETE — zaakceptowane przez właściciela 2026-08-04
**Następny etap:** R5.4 — wyłącznie izolacja widgetu od CSS strony hosta

## Problem wyjściowy

Legacy’owy blok o własności danych był krótkim artykułem tekstowym połączonym
na jednej powierzchni z opisem izolacji widgetu. Merytorycznie wskazywał, że
lead pozostaje w organizacji klienta, ale nie pokazywał rzeczywistych zasad
dostępu i wizualnie nie przypominał ani zaakceptowanej strony głównej, ani
panelu Kwotum:

- brakowało rozpoznawalnego kontekstu aktywnej organizacji;
- role Owner, Admin i Sales nie miały pokazanej macierzy uprawnień;
- nie było widocznej granicy pomiędzy agencją wdrożeniową a tenantem klienta;
- serwerowy `TenantContext` i RLS występowały wyłącznie jako abstrakcyjny opis;
- temat własności danych i temat Shadow DOM należący do R5.4 były wizualnie
  sklejone.

Baseline zachowano w
`artifacts/visual-qa/marketing-subpages-v1/r5-3/before/`.

## Zweryfikowane źródła prawdy

Przed zaprojektowaniem sekcji sprawdzono `docs/AUTHORIZATION.md` oraz
`packages/database/src/tenancy.ts`. Sekcja odzwierciedla bieżący kontrakt:

- Owner, Admin i Sales mogą czytać leady oraz zmieniać status, notatki i dane
  operacyjne;
- Owner i Admin mogą przypisać właściciela leada, Sales nie może;
- eksport i zarządzanie retencją są obecnie uprawnieniem Ownera;
- dostęp wymaga zweryfikowanego użytkownika, aktywnego członkostwa i aktywnej
  organizacji w `TenantContext`;
- RLS jest drugą warstwą izolacji danych;
- samo wdrożenie strony przez agencję nie tworzy roli ani dostępu do tenantów
  klienta.

## Wykonana przebudowa

- utworzono osobny komponent `AgencyOwnership` i izolowany CSS Module;
- główny komunikat brzmi: „Lead należy do firmy. Dostęp wynika z roli, nie z
  wdrożenia”;
- lewa kolumna podaje właściciela danych, domyślny dostęp agencji i warunek
  dostępu;
- prawa powierzchnia korzysta z języka rzeczywistego panelu: aktywna
  organizacja, identyfikator tenanta, role i tabela uprawnień;
- macierz pokazuje cztery prawdziwe operacje oraz różnice Owner/Admin/Sales;
- oddzielny pas „Agencja wdrożeniowa — poza organizacją domyślnie” zamyka
  błędną sugestię, że wykonawca automatycznie widzi leady;
- trzy warstwy egzekwowania granicy pokazują aktywną organizację,
  `TenantContext` i RLS;
- opis Shadow DOM został strukturalnie odłączony i pozostawiony bez przebudowy
  jako zakres R5.4;
- sekcja nie zawiera przycisków, linków, formularzy ani atrap funkcji;
- zaakceptowane R5.1 i R5.2 nie zostały zmienione.

## Kontrakt responsive

- powyżej 1152 px tekst i powierzchnia uprawnień tworzą układ dwukolumnowy;
- przy 1024 px pełna powierzchnia panelowa przechodzi pod treść i wykorzystuje
  szerokość kontenera;
- przy 768 px tabela pozostaje tabelą, a trzy warstwy izolacji przechodzą w
  pionową sekwencję;
- do 560 px każdy wiersz uprawnień staje się samodzielnym blokiem z jawnymi
  etykietami Owner/Admin/Sales;
- przy 320 px nie występuje ściskanie ani poziomy overflow; najdłuższy wariant
  ma 2064,36 px wysokości i zachowuje logiczną kolejność czytania;
- najmniejszy widoczny tekst ma 12 px.

## Pomiary produkcyjne

| Viewport |     Sekcja | Proof panelu | Granica agencji |   Warstwy | Min. tekst | Overflow | Błędy |
| -------: | ---------: | -----------: | --------------: | --------: | ---------: | -------: | ----: |
|  1536 px |  974,33 px |    727,58 px |       102,39 px | 123,77 px |      12 px |     0 px |     0 |
|  1440 px |  958,95 px |    727,58 px |       102,39 px | 123,77 px |      12 px |     0 px |     0 |
|  1280 px |  933,36 px |    727,58 px |       102,39 px | 123,77 px |      12 px |     0 px |     0 |
|  1024 px | 1382,81 px |    721,61 px |       102,39 px | 117,80 px |      12 px |     0 px |     0 |
|   768 px | 1650,39 px |    961,80 px |       121,13 px | 263,30 px |      12 px |     0 px |     0 |
|   430 px | 1973,77 px |   1238,92 px |       171,83 px | 317,30 px |      12 px |     0 px |     0 |
|   390 px | 2030,98 px |   1238,92 px |       171,83 px | 317,30 px |      12 px |     0 px |     0 |
|   375 px | 2049,45 px |   1264,39 px |       171,83 px | 317,30 px |      12 px |     0 px |     0 |
|   320 px | 2064,36 px |   1301,86 px |       209,30 px | 317,30 px |      12 px |     0 px |     0 |

Wszystkie pomiary pochodzą z produkcyjnego buildu, mają HTTP 200, zerowy
poziomy overflow oraz pustą listę błędów konsoli i `pageerror`.

## Visual QA

- wewnętrzna ocena wykonawcza: **20/20**;
- kompletność 4/4, geometria 4/4, typografia 4/4, zgodność z UI 4/4, mobile
  4/4;
- finalne rendery i metryki:
  `artifacts/visual-qa/marketing-subpages-v1/r5-3/after/`;
- porównania przed/po:
  `artifacts/visual-qa/marketing-subpages-v1/r5-3/compare/`;
- szczegółowy diff:
  `artifacts/visual-qa/marketing-subpages-v1/r5-3/diff.md`.

## Gate techniczny

- dedykowany Playwright R5.3: 11/11 PASS;
- finalna regresja R5.1 + R5.2 + R5.3 + shell + home: 75/75 PASS;
- testy jednostkowe: 177/177 PASS;
- testy izolacji RLS i wszystkich migracji: PASS;
- WordPress: PASS dla WP 6.9.2 i 7.0.2 na PHP 8.5.2;
- lint: 8/8 pakietów PASS;
- typecheck: 8/8 pakietów PASS;
- build: 8/8 pakietów PASS, 40 wygenerowanych stron;
- widget: 18 912 B gzip przy limicie 92 160 B;
- axe WCAG 2.2 AA, klawiatura i forced colors: PASS.

Pierwsza próba startu osobnego klastra testowego RLS została zablokowana przez
limit pozostawionych segmentów SysV hosta. Bez zmiany testów pełny gate
uruchomiono na jednoznacznie nazwanej, tymczasowej bazie w działającym lokalnym
klastrze. Baza została po teście usunięta.

## Ryzyka i granice decyzji

- macierz jest wiernym obrazem bieżących capability; każda przyszła zmiana
  autoryzacji wymaga aktualizacji sekcji i testu kontraktowego;
- R5.3 nie przyznaje agencji dostępu i nie obiecuje delegacji, white-label ani
  panelu partnerskiego;
- R5.4 nadal ma legacy’ową formę wizualną. Zostało jedynie rozdzielone od R5.3
  i nie powinno być przebudowywane przed akceptacją tego etapu;
- zaakceptowany R5.3 zostaje zamrożony na czas prac nad R5.4.

## Kryteria odbioru właściciela

1. sekcja jednoznacznie komunikuje, że właścicielem leada jest organizacja
   klienta;
2. powierzchnia uprawnień wygląda jak część tego samego produktu co panel i
   zaakceptowane R5.1–R5.2;
3. różnice Owner/Admin/Sales są czytelne bez dopowiadania;
4. granica agencji, `TenantContext` i RLS nie tworzą obietnic poza MVP;
5. mobile zachowuje hierarchię informacji i nie wygląda jak ścieśniona tabela.

## Decyzja właściciela

Właściciel zaakceptował etap poleceniem „dalej”, wydanym po prezentacji
finalnego renderu, wyników testów i wskazaniu R5.4 jako następnego etapu.
R5.3 zostaje oznaczone jako `COMPLETE`, a dalsza praca obejmuje wyłącznie
izolację widgetu.
