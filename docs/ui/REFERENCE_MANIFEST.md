# Manifest aktywnych referencji UI Kwotum

**Status:** kanoniczny  
**Ostatnia aktualizacja:** 2026-08-28

Ten plik zawiera wyłącznie referencje, które nadal sterują przyszłą pracą.
Historyczne obrazy panelu i ich pakiety źródłowe zostały usunięte po decyzji
ADR-058. Historia śledzonych plików pozostaje w Git, a pozostałe materiały w
tymczasowej kopii M0; żadna z tych kopii nie może przywracać poprzedniego
kierunku bez nowej decyzji.

## Hierarchia

1. bezpieczeństwo, prywatność, zakres produktu i zaakceptowane ADR-y;
2. najnowszy obraz zaakceptowany dla konkretnego regionu;
3. specyfikacja liczbowa powiązana z obrazem;
4. aktywne referencje wymienione poniżej;
5. prototypy i rendery pomocnicze wyłącznie jako źródło pomiaru.

Referencja wizualna nie dodaje funkcji, danych, ról ani uprawnień. Nazwy,
liczby i osoby na obrazie są przykładową treścią, dopóki wymagania produktu nie
stanowią inaczej.

## Integracje panelu — M9.1, 2026-08-28

Zaakceptowany obraz 1651 × 953 px, SHA-256
`d864f27cdb08a1b0c5110b04da97935863d42c8f7534359de6fccb2a4c479cc3`,
nadpisuje wcześniejszy kierunek wyłącznie dla tras WordPress/Webhooki:
segmentowego przełącznika, dwukolumnowej powierzchni stanu i konfiguracji,
lokalnych obramowań podsekcji oraz kompaktowych pól. Oryginał nie jest
przechowywany w repozytorium z powodu widocznych danych konta i organizacji;
identyfikują go hash oraz wymiary.

Obraz nie zmienia HMAC, sekretów, walidacji HTTPS/DNS/IP, request IDs, audytu,
capabilities, RLS, tenant scope ani danych domenowych. Aktywne artefakty i
raport znajdują się w `artifacts/visual-qa/panel-minimal-v1/m9-integrations/`
oraz `panel-minimal-v1/M9_1_INTEGRATIONS_IMPLEMENTATION_2026-08-28.md`.

## Główna akcja Kwotum — korekta tekstowa 2026-08-27

Najnowsza decyzja właściciela nadpisuje wcześniejszy promień i kolor wyłącznie
dla głównych przycisków akcji. Panel i marketing używają szmaragdu Kwotum
`#0B684A`, hover `#07543C`, granicy `#075139` oraz promienia 14 px. Jest to
zaokrąglony prostokąt, nie pełna pigułka. Pola, karty, statusy, ikonowe
kontrolki, destrukcyjne akcje i tenantowy branding widgetu pozostają poza
zakresem tej korekty.

Korekta jest code-native i nie otrzymuje sztucznego pixel-perfect wyniku.
Porównanie rzeczywistego pierwszego folda w 1440 × 900 i 390 × 844 oraz wspólnego
komponentu w `/design-system` znajduje się w
`artifacts/visual-qa/kwotum-action-v1/`. Kontrakt i analiza są zapisane w
`docs/ui/KWOTUM_ACTION_SYSTEM_2026-08-27.md`.

## Panel administracyjny — Minimal V1

**Kontrakt:** `panel-minimal-v1/README.md`
**Decyzja:** ADR-058

| Plik                                                                               |    Rozmiar | SHA-256                                                            | Rola                                                                           |
| ---------------------------------------------------------------------------------- | ---------: | ------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `docs/ui/panel-minimal-v1/reference/panel-dashboard-primary-1199x842.png`          | 1199 × 842 | `824df7d47e16d9114ae66990a0d02e91f4954ce1ba7b5d1c4d180fea84aed6e1` | główna geometria, hierarchia, powierzchnie, topbar, dashboard i tabele         |
| `docs/ui/panel-minimal-v1/reference/panel-dashboard-direction-404x316.png`         |  404 × 316 | `2cd7db369c2233f08f77b497a2b2e54e5458bf840548c5ba6e791b48518e3b64` | pomocniczy kierunek typografii, zakładek i oszczędnego koloru; bez pomiaru 1:1 |
| `docs/ui/panel-minimal-v1/reference/panel-segmented-control-direction-798x144.png` |  798 × 144 | `9c085accf0f15fb8e721b99de1b7e76c4bfc0f035ff01c8b60288cd85b45bf3e` | regionalny wzorzec długiego tracku i aktywnej pigułki; bez ciemnego tła        |

Pierwszy obraz zastępuje wszystkie wcześniejsze referencje panelu w zakresie
języka wizualnego. Nie zastępuje rzeczywistej architektury informacji:
dashboard, leady, procesy, builder, analityka, integracje, ustawienia i stany
korzystają wyłącznie z istniejących danych i działania opisanych w
`UI_SCREEN_SPEC.md`.

Kontrolne viewporty: 320 × 800, 375 × 812, 390 × 844, 430 × 932, 768 × 1024,
1024 × 768, 1280 × 800, 1440 × 900 i 1536 × 1024. Główny visual diff dla
shellu/dashboardu powstaje w 1440 × 900 i 1536 × 1024. Drugi obraz nie otrzymuje
pixel diffu z powodu perspektywy i cropu. Trzeci obraz nadpisuje wyłącznie
geometrię przełączników wielowariantowych: jeden spokojny track, sąsiadujące
segmenty i jednoznaczny aktywny segment. Jego ciemne tło, poświata, treść i
kolory nie są częścią panelu; implementacja używa jasnych tokenów Minimal V1.

### Korekta białego canvasa i nawigacji 2026-08-27

Cztery nowsze zrzuty właściciela nadpisują wyłącznie pokazane regiony:

| ID   |     Rozmiar | SHA-256                                                            | Zakres                                                   |
| ---- | ----------: | ------------------------------------------------------------------ | -------------------------------------------------------- |
| PN-1 | 3840 × 2486 | `6f123b976464e8de3c5506c3316fa8be8d0eafe5b71c6d87d777504085d62bd7` | filtr Leadów ma szerokość treści, nie całego workspace'u |
| PN-2 |   470 × 206 | `ea930569c9e7ed7f64c1e7c60cd459f00f3818de8ab671931320cd3da6316cb5` | zakładki Integracji bez dominującej linii przez stronę   |
| PN-3 | 3338 × 1982 | `befb4246aa6b4aeee3ac51844043b43f2017e7c8df23dc80e6a597f8a70510fb` | zwarte menu tras Ustawień bez pustej belki               |
| PN-4 | 3338 × 1982 | `975a1d083f948998999d998cb6fd7b7ee668145316ffbf4e6b093b39cfd4e4b3` | Pomoc na białym canvasie bez ramy i cienia całej strony  |

Oryginały nie są przechowywane w repozytorium, ponieważ pochodzą z
zalogowanego panelu i zawierają dane produkcyjne. Hashe, pomiary i syntetyczne
QA znajdują się w
`artifacts/visual-qa/panel-minimal-v1/m2-white-navigation-correction/`.

Wymagane artefakty każdego etapu:

```text
artifacts/visual-qa/panel-minimal-v1/<stage>/<screen>/
  reference.png lub canonical-reference.txt
  before.png
  after.png
  overlay-50.png albo difference.png
  mobile-390x844.png
  diff.md
```

## Landing desktop V7

**Kontrakt:** `landing-desktop-v7/REFERENCE_AUDIT.md` i raporty sekcyjne.
Źródło: `lorum-product-ui-reference-v1/reference/manifest.json`.

- 20 screenshotów ekranów: 14 desktop 1440 × 900 i 6 mobile 390 × 844;
- 5 plansz tematycznych 1536 × 1024;
- przyjęte obszary: operacje leadów, builder/reguły, analityka i wdrożenie,
  system/onboarding oraz zestaw mobile.

## Załączniki nowsze niż pakiet

| ID    | Zakres                              | Decyzja                                                                                                                |
| ----- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| A i B | identyczny builder desktop          | wąski rail, sekcje/pytania, centralny preview, prawy inspector; nadpisuje starszy builder                              |
| C     | lead operacyjny desktop             | bogaty dokument i stały panel sprzedażowy; nadpisuje prostszy lead detail                                              |
| D     | plansza produktu Wyceno             | źródło gęstości i regionów, ale nie nazwy marki ani grafu node-based                                                   |
| E     | landing desktop/mobile Wyceno       | źródło geometrii pierwszego folda                                                                                      |
| F     | zaakceptowany master board Wyceno   | starszy poprzednik planszy Lorum                                                                                       |
| G     | starsza sekcja pod hero             | cztery poziome kroki i pięć kafli; zastąpiona dla tego regionu przez załącznik H                                       |
| H     | ikony i sekcje poniżej hero         | okrągłe zielone ikony, osobne szablony oraz porównanie + pionowy proces + dokument leada                               |
| I     | plansza auth 1536 × 1024            | osobne desktopowe ekrany logowania i rejestracji; lokalny oryginał blokuje anatomię                                    |
| J     | pełnoekranowe logowanie 2048 × 1157 | auth wypełnia pierwszy viewport; bez zewnętrznej ramy, cechy dopiero poniżej                                           |
| K     | korekta gęstości auth 2048 × 1202   | mniejsze kontrolki, ikony, typografia i ilustracje; więcej oddechu między grupami                                      |
| L     | lista leadów 816 × 592              | jeden lekki kontener, search + CTA, pięć filtrów, siedem kolumn i zwarta paginacja                                     |
| M     | szczegóły leada 794 × 578           | profil, score + 3 powody, 4 zakładki i podsumowanie z prawym panelem obsługi                                           |
| N     | biblioteka szablonów, pełna trasa   | pięć mniejszych kart w jednym rzędzie, zwarty nagłówek; nadpisuje kolumny wąskiego cropa                               |
| O     | cały landing `/`, kierunek tekstowy | autorskie telefony 3D, profesjonalny minimalizm i jeden język wizualny całej strony                                    |
| P     | analityka, kierunek tekstowy        | styl dashboardu; dolne dane jako etapy, bąble, kafelki, karty i pierścienie zamiast pasków                             |
| Q     | pozostałe ekrany produktu           | Lorum, jeden zwijany sidebar, pełny workspace i wdrożenie wszystkich powierzchni z realnym modelem danych              |
| R     | pełny dashboard operacyjny          | sześć KPI, trzy rzędy danych, szybkie akcje i realne statusy; nadpisuje wcześniejszy ubogi dashboard                   |
| S     | landing `/`, korekta tekstowa       | trzy faktyczne ekrany Lorum jako szklane panele 3D; nadpisuje telefony i dekoracyjny render                            |
| T     | rozbudowana biblioteka szablonów    | toolbar, KPI, pięć bogatych kart i detal wyboru; nadpisuje pustą kompozycję N, ale nie dodaje atrap funkcji            |
| U     | hero `/`, render telefonu           | fizyczny telefon bez prostokątnego tła, UI wychodzące z ekranu, sześć ikon; nadpisuje S tylko w hero                   |
| V     | pełny landing desktop V7            | osiem obrazów 2026-08-01; nadpisuje desktopową geometrię `/`, ale nie zatwierdza cen, klientów, CRM, statystyk ani SLA |
| X     | sidebar panelu Kwotum               | znak bez płytki, ikony bez kafelków i szerokość 240 px; funkcje, rail 78 px i mobile bez zmiany                        |
| Y     | wybór organizacji Kwotum            | szeroki header, oś 1260 px i pozioma karta z realnym podsumowaniem; mobile zachowuje jedną kolumnę                     |
| Z     | operacyjna obsługa leada            | zwarta prawa kolumna: status, właściciel, priorytet, kontakt, notatki i zadania; wyłącznie z prawdziwym zapisem        |
| AA    | webhook v1 w panelu                 | dziedziczy wyłącznie anatomię Integracji 12S; treść, stany i bezpieczeństwo określają ADR-034 oraz `WEBHOOKS.md`       |
| AD    | tenantowe centrum pomocy            | płaska anatomia panelu i instrukcje filtrowane capability; bez fikcyjnego kanału wsparcia                              |

Oryginały panelowe A/C/F są dostępne w `apps/web/public/panel/`, a D w
`references/product-app-board.png`; zostały zablokowane 2026-07-27:

| Plik                                       | Rozmiar     | SHA-256                                                            | Rola             |
| ------------------------------------------ | ----------- | ------------------------------------------------------------------ | ---------------- |
| `ChatGPT Image 26 lip 2026, 18_28_24.png`  | 1448 × 1086 | `918e0d8edfdb02d899310e61b36bcf25618bd1a761bf62809fb9927d4a68a526` | builder desktop  |
| `ChatGPT Image 26 lip 2026, 18_25_28.png`  | 1448 × 1086 | `703c33bad14a870d60f43e8d7051774e9f439b8bfe74aaf258c0c7ab64ed41cd` | lead operacyjny  |
| `references/product-app-board.png`         | 1536 × 1024 | `df3c7894a60bddfb2f3268b2e1525097abc93b25ff4535a6303741bab0a31101` | plansza produktu |
| `42114905-a89b-4b72-b59e-383662af41ae.png` | 1536 × 1024 | `33d06d6680b312baf09b11ead9065d220b6098d40149927f4d5dcbf68fb537e7` | master board     |

Ich cropy, rendery aplikacji, overlay 50% i difference są indeksowane w
`panel-visual-qa.md`. Referencje nadal nie są importowane do produkcyjnego UI.

Pomocniczy, odpowiadający załącznikowi crop G jest zapisany jako
`ui/references/accepted/home-post-hero-overview-1098x624.png`; ma rozmiar
1098 × 624 px i SHA-256
`8afeef589bd3e32752117181fc159dbfce91e8474eff92139622198bfdc7b4f2`.
Załącznik H jest dostępny wyłącznie w rozmowie i ma pierwszeństwo przed G dla
ikon, kolejności sekcji oraz dwukolumnowego regionu porównania. Do czasu
zapisania oryginału w repozytorium nie przypisujemy mu sztucznego SHA-256 ani
wyniku pixel diff.

Załącznik I jest zapisany jako `apps/web/public/ekranylogowania.png`; ma
1536 × 1024 px i SHA-256
`ba9927f454330835c6a7d1663cd294913ceafdf6f322aef44ea7e059eca630fd`.
Pokazuje dwa trójstrefowe ekrany auth na wspólnej planszy. Załącznik J
rozstrzyga, że na pojedynczej trasie trójkolumnowy region wypełnia cały pierwszy
viewport, bez zewnętrznego nagłówka, sloganu i podpisu ekranu; sekcja pięciu
cech zaczyna się poniżej. Dekompozycję zapisuje
`AUTH_REFERENCE_ANALYSIS_2026-07-27.md`. Osobne referencje mobile oraz lokalne
zrzuty i overlay są nadal wymagane przed visual PASS.

Załącznik L jest dostępny wyłącznie w rozmowie i nadpisuje wcześniejszą listę
leadów tylko na trasie `/panel/[organizationId]/leady`. Do czasu zapisania
oryginału nie przypisujemy mu sztucznego SHA-256 ani wyniku pixel diff.

Załącznik M jest dostępny wyłącznie w rozmowie i nadpisuje wcześniejszy ekran
szczegółów tylko na trasie `/panel/[organizationId]/leady/[leadId]`. Zachowuje
realne odpowiedzi, pliki, historię, notatki, status i uprawnienia tenantowe.

Decyzja Z pochodzi z zaakceptowanego załącznika właściciela z 2026-08-03 i
precyzuje wyłącznie prawą kolumnę tego szczegółu. Referencja definiuje zwarty
układ obsługi, notatki z autorem i czasem oraz akcje kontaktu i zadania, ale nie
zatwierdza atrap CRM. Implementacja używa tenantowego stanu, RPC, forced RLS i
append-only activity. Oryginał 770 × 1104 px ma SHA-256
`ab5fb8075ef249b146778ccd7d2aa2ef8ae340b952ab52f94ac925ef9efc4afa` i jest
zapisany jako
`artifacts/visual-qa/12zi-lead-operations/reference-lead-operations-770x1104.png`.

Decyzja N jest tekstową korektą właściciela do regionu szablonów z planszy D.
Na pełnej trasie `/panel/[organizationId]/szablony` pięć kart ma pozostać
w jednym rzędzie i używać mniejszych obrazów oraz zwartego nagłówka. Nie
zatwierdza nowej funkcji tworzenia szablonu; istniejące przyciski nadal tworzą
niezależny draft z wybranego, walidowanego szablonu.

Decyzja O jest tekstową dyspozycją właściciela z 2026-07-29 i nadpisuje język
wizualny całej strony głównej bez zmiany jej kontraktów produktu. Hero oraz
sekcja branżowa używają code-native telefonów 3D, a dalsze proofy wspólnej
perspektywy, promieni i rytmu. Nie dostarczono nowego obrazu źródłowego, więc
nie przypisujemy tej decyzji sztucznego SHA-256 ani pixel-perfect PASS.
Artefakty before/after i overlay znajdują się w
`artifacts/visual-qa/landing-3d-redesign/`.

Decyzja S jest nowszą tekstową korektą właściciela z 2026-07-29 i zastępuje
Decyzję O wyłącznie dla całej kompozycji `/`. Hero pokazuje proces klienta,
builder z regułą oraz gotowy lead jako trzy code-native szklane powierzchnie
w jednej perspektywie. Nie używa telefonicznych ramek, wygenerowanego tekstu
ani dekoracyjnego renderu 3D. Pięć telefonów branżowych i powtarzalne proofy
zastępuje sześcioczęściowa narracja z jednym ciągłym storyboardem. Nie
dostarczono nowego obrazu źródłowego, więc decyzji nie przypisujemy sztucznego
SHA-256; deterministyczne baseline’y znajdują się w
`artifacts/visual-qa/landing-glass-panels/`.

Decyzja P jest tekstową dyspozycją właściciela z 2026-07-29 dla trasy
`/panel/[organizationId]/analityka`. Górny region ma korzystać z geometrii,
gęstości i języka wizualnego dashboardu, a dalsza część ma rozwijać widok
o rzeczywiste trendy, lejek, score, źródła, urządzenia, drop-off i wersje.
Nie zatwierdza atrap filtrów; wybór 7/30/90 dni pozostaje działającą nawigacją,
a agregaty zachowują minimalną próbę i tenant scope. Kolejna korekta
właściciela zastępuje powtarzalne paski dolnego regionu etapami, bąblami,
wykresami kafelkowymi, kartami diagnostycznymi i pierścieniami. Crop planszy
produktu, pełne rendery i porównania znajdują się w
`artifacts/visual-qa/12r-analytics-dashboard-style/`.

Decyzja Q jest dyspozycją właściciela z 2026-07-29, aby domknąć pozostałe
ekrany bez kolejnych zmian sidebara i bez atrap funkcji. Obejmuje ustawienia
organizacji, powiadomienia, integrację WordPress, instalację, onboarding, auth
QA oraz widget desktop/mobile/result. Nazwa prezentacyjna pozostaje Lorum,
sidebar jest jeden i zwijany, a treść wypełnia workspace. Elementy z referencji
bez modelu danych — agency clients, billing, branding, domeny, zespół, API keys
i przełączniki preferencji — pozostają świadomie wyłączone. Plan, decyzje
i dowody znajdują się w `REMAINING_SCREEN_PLAN_2026-07-29.md` oraz
`artifacts/visual-qa/12s-remaining-screens/`.

Decyzja R pochodzi z załącznika właściciela o rozmiarze 1964 × 1500 px
z 2026-07-29 i nadpisuje wcześniejszą treść trasy
`/panel/[organizationId]`. Dashboard zachowuje sidebar Lorum, ale przejmuje
z obrazu gęsty rząd sześciu KPI, trzy główne wizualizacje, tabelę leadów,
ranking procesów, źródła, przedziały wartości, rekordy wymagające reakcji,
powiadomienia i szybkie akcje. Moduły bez modelu danych nie są kopiowane.
Oryginał, kontrakt i dowody znajdują się w
`artifacts/visual-qa/12t-dashboard-reconstruction/` oraz
`DASHBOARD_REFERENCE_IMPLEMENTATION_2026-07-29.md`.

Decyzja T pochodzi z zaakceptowanego załącznika właściciela
`ChatGPT Image 29 lip 2026, 20_09_10.png`, 1448 × 1086 px, SHA-256
`7078cfed148b3734ae1ed40fa92b4161d222641bdb97ca6f30b1b8d6c7885ec1`.
Nadpisuje Decyzję N wyłącznie dla trasy
`/panel/[organizationId]/szablony`: wprowadza breadcrumb, nagłówek z akcjami,
działające wyszukiwanie i filtry, trzy KPI, bogatsze karty oraz szczegół
wybranego szablonu. Obraz nie zatwierdza nieistniejącego importu, tworzenia
własnych szablonów, dwunastu rekordów ani analityki wykorzystania. Produkcja
używa pięciu walidowanych `flowTemplates`, realnych liczników dokumentu
i istniejącej akcji tworzenia tenantowego draftu. Zablokowana referencja,
stan przed i dowody znajdują się w
`artifacts/visual-qa/12zc-template-library-override/`.

Korekta 12ZO pochodzi z zaakceptowanego zrzutu produkcji 3338 × 1962 px,
SHA-256
`b3ebc842faab96619ee12a562638ee4bd2f53a417bae53f5e1d29b6850e90ff6`.
Nadpisuje Decyzję T wyłącznie dla zewnętrznej powierzchni trasy szablonów:
cała biblioteka nie może być dodatkową białą kartą z ramką i cieniem.
Nagłówek oraz wewnętrzne powierzchnie toolbaru, KPI, kart i detalu pozostają
bez zmian. Artefakty korekty znajdują się w
`artifacts/visual-qa/12zo-template-surface-hotfix/`.

Korekta 12ZP pochodzi z zaakceptowanego cropu produkcyjnego stanu małej próby
1136 × 456 px, SHA-256
`1b90189a221d164a2e9ea92d141ec5d0cfdff1c50c2a8383d553c94eb8903070`.
Nadpisuje starszy kontrakt tylko dla `.analytics-privacy-state`: wprowadza
poziomy inset 32 px na desktopie i 24 px na mobile, hierarchię 16/14 px oraz
usuwa wewnętrzne linie. Ta sama korekta zastępuje arbitralne wagi sidebara
centralnymi tokenami 400/500/600, bez zmiany zatwierdzonej geometrii P1,
kolorów, ikon i aktywnego skosu. Dowody znajdują się w
`artifacts/visual-qa/12zp-panel-typography/`.

Decyzja U jest nowszą dyspozycją właściciela z 2026-07-29 i nadpisuje
Decyzję S wyłącznie w hero trasy `/`. Desktop używa jednego fizycznego
telefonu z demonstracyjnym ekranem procesu oraz elementami kwalifikacji
wychodzącymi poza ekran. Mobile używa osobnego kadru z samym telefonem,
uciętym prawą krawędzią. Prostokątne tło renderu zostało usunięte kanałem
alfa, a pod hero wraca sześć okrągłych ikon z Decyzji H. Dalsza
sześcioczęściowa struktura landingu pozostaje bez zmian.

| Plik                                                                           | Rozmiar     | SHA-256                                                            |
| ------------------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------ |
| `apps/web/public/images/redesign/lorum-hero-phone-desktop-transparent-v4.webp` | 1536 × 1024 | `1781845b7dcebedb086200d409e0807c368706a45bdf2a0794b782c7e9a7c0eb` |
| `apps/web/public/images/redesign/lorum-hero-phone-mobile-transparent-v4.webp`  | 864 × 1821  | `bef2d7c2f74702d0bc47cf146c4a922fc4ba75dccc53d4db951c44a38c490537` |

Decyzja V pochodzi z ośmiu obrazów dostarczonych przez właściciela
2026-08-01. Zastępuje wcześniejsze decyzje O, S i U oraz starszy pełny landing
V6 wyłącznie dla geometrii desktopowego `/`. Siedem kadrów ma natywny rozmiar
1672 × 941 px; ósmy, 941 × 1672 px, jest planszą kolejności i nie może być
traktowany jako pełnostronicowy pixel-perfect screenshot.

Nowa sekwencja desktopu to: header/hero → pasek dowodu → trzy kroki → cztery
grupy danych → przykładowy lead → integracje → dwa warianty rozpoczęcia →
FAQ/pomoc → final CTA → footer. V7-04 (integracje) jest wstawiany po przykładzie
leada, mimo że nie występuje na pomniejszonym overview.

Obrazy V7 nie zatwierdzają widocznych na nich niepotwierdzonych logotypów
klientów, cen 249/549 zł, trialu, płatności, limitów planów, natywnych CRM/Google
Sheets, danych kontaktowych, 98% satysfakcji, SLA `< 2h`, wzrostów `+20%/+15%`
ani liczby 128 leadów. Produkcja zachowuje ich rolę kompozycyjną wyłącznie za
pomocą prawdziwych funkcji i uczciwego copy zgodnego z `SCOPE.md` oraz
`NON_GOALS.md`.

| Plik                                                          |    Rozmiar | SHA-256                                                            |
| ------------------------------------------------------------- | ---------: | ------------------------------------------------------------------ |
| `docs/ui/landing-desktop-v7/reference/01-hero.png`            | 1672 × 941 | `7113a8acc45f48e7488bb39fe1f9f4bd2933137c845e429ed4bdb7664adf41df` |
| `docs/ui/landing-desktop-v7/reference/02-process.png`         | 1672 × 941 | `e7ce0ef29bd71eb4246aa68e3efec06f0f82a47acdfc28a6f57387206962d025` |
| `docs/ui/landing-desktop-v7/reference/03-key-information.png` | 1672 × 941 | `f659ff69af90114cab05774f95dd1a8f7432c4cb4d75cddabbd4b7e3b776ff27` |
| `docs/ui/landing-desktop-v7/reference/04-integrations.png`    | 1672 × 941 | `8c89d943581eac353cd699ebf5d2a7b1388ec3b8f7bbbf42c4d70226460301ed` |
| `docs/ui/landing-desktop-v7/reference/05-pricing.png`         | 1672 × 941 | `9b0d2e08274cee4622d2dbbbbe26cf1da781f331e00431ba22355f82b709c1fc` |
| `docs/ui/landing-desktop-v7/reference/06-faq.png`             | 1672 × 941 | `ba3ecf0284c557b21363270658f4ecb2f6bd780be20cf2ed62549ae10918abc0` |
| `docs/ui/landing-desktop-v7/reference/07-final-cta.png`       | 1672 × 941 | `da0587ba1ecc2694186ad84ef9f5aaf52f5101f944f273cf5cfadf5afcc95282` |
| `docs/ui/landing-desktop-v7/reference/08-full-overview.png`   | 941 × 1672 | `8ddaca5adef25e9205910c93816fc7501668b397f14e34411bb94f3780edace6` |

Pakiet nadpisuje wcześniejsze plansze desktopowego `/`. Nie zezwala na
fikcyjne ceny, klientów, CRM-y, statystyki ani SLA.

## Landing mobile

Aktywny kontrakt transformacji znajduje się w `landing-mobile-v1/`. Mobile
zachowuje treść V7 i korzysta z wcześniejszych renderingów wyłącznie tam, gdzie
raport danego etapu wskazuje je jawnie. Pełny obraz mobile nie steruje panelem.

## Auth

| Plik                                  |     Rozmiar | SHA-256                                                            | Rola                                     |
| ------------------------------------- | ----------: | ------------------------------------------------------------------ | ---------------------------------------- |
| `apps/web/public/ekranylogowania.png` | 1536 × 1024 | `ba9927f454330835c6a7d1663cd294913ceafdf6f322aef44ea7e059eca630fd` | anatomia logowania i rejestracji desktop |

Nowsze decyzje pełnoekranowe i mobile są opisane w
`docs/ui/AUTH_REFERENCE_ANALYSIS_2026-07-27.md`. Referencja auth nie steruje
panelem.

## Marka Kwotum

Decyzja AD nie pochodzi z osobnego obrazu Pomocy. Jej konkretnym źródłem
geometrii jest zaakceptowany shell sidebara P1 oraz płaska anatomia dwóch
istniejących ekranów panelu:

- `artifacts/visual-qa/12s-remaining-screens/after/organization-settings-1536x1024.png`,
  SHA-256 `af0e83d101f559587ba060072a20a56429102fcca4606001685c88f40f135766`;
- `artifacts/visual-qa/12s-remaining-screens/after/notifications-1536x1024.png`,
  SHA-256 `3a03d77daddeb13f4ce363c6007c21419e0f54b1823f2c1f568d599c38d2215a`.

Referencje ustalają białą ciągłą powierzchnię, hairline'y, spokojną typografię
i brak warstwowania kart. Nie tworzą modułów ani danych. Treść Pomocy wynika
wyłącznie z aktywnych tras, capabilities i non-goals. Dostarczony crop akcji
leada 880 × 128 px, SHA-256
`bc03fb4756dc2764acb4188e8116e1b73febac7bbad4178f3227bddafc0aa231`,
nadpisuje tylko wyrównanie ikon względem tekstu w przyciskach „Zaplanuj
kontakt” i „Utwórz zadanie”; nie zmienia ich rozmiaru ani zachowania.

Decyzja AB pochodzi z dostarczonego i zaakceptowanego przez właściciela znaku
Kwotum z 2026-08-11. Zastępuje poprzedni symbol we wszystkich powierzchniach
marki: publicznym shellu, demonstracjach produktu, auth, panelu, faviconach i
wiadomościach. Tło i światło litery Q pozostają przezroczyste; gradientowy
obwód, trzy linie i potwierdzenie należą do znaku. Wariant runtime 768 × 768 px
ma SHA-256
`9c552e5edbec779374b7b9439e096513768f7972a29913541eb4525a4b75367c`.
Kontrakt wariantów opisuje `ui/kwotum-brand-v3/README.md`.

Pełny audyt, pomiary, luki i klasyfikację cleanupu zawierają
`landing-desktop-v7/REFERENCE_AUDIT.md` oraz `MEASUREMENTS.md`. W D0 nie
zmieniono aplikacji ani nie usunięto poprzednich plików runtime.

| Plik                                                   |     Rozmiar | SHA-256                                                            | Rola                     |
| ------------------------------------------------------ | ----------: | ------------------------------------------------------------------ | ------------------------ |
| `docs/ui/kwotum-brand-v2/reference-logo-1254x1254.png` | 1254 × 1254 | `0d54c6c8673089fc65c52762b903765eccceb3ade5aeeb2a1a615497f9f9d5e9` | zaakceptowany znak marki |

Runtime używa wersji V3 opisanych w `kwotum-brand-v2/README.md`. Usunięta
referencja starego wyboru organizacji nie może sterować M9; ekran wejścia do
panelu korzysta z systemu Minimal V1 i realnych danych membershipu.

## Zasada retencji

Po zamknięciu etapu zachowujemy jedną kanoniczną referencję, jeden `before`,
jeden finalny `after`, jedno porównanie, reprezentatywny mobile i raport.
Odrzucone iteracje, duplikaty oraz zastąpione pakiety wizualne nie pozostają w
repozytorium. Snapshoty testów mają osobną rolę i nie stają się referencją
projektową.

## Duplikaty

W aktywnym drzewie pozostają trzy celowe duplikaty między ścieżkami wymaganymi
przez master prompt a odtwarzalnymi pakietami źródłowymi:

- top-level `accepted-master-board.png` = produktowy `accepted-style-board.png`;
- top-level landing desktop = pełny render landingowy desktop;
- top-level landing mobile = pełny render landingowy mobile.

Cztery dodatkowe kopie plansz z `ui/references/` usunięto 2026-07-28. Pakiety
źródłowe zachowują oryginalną strukturę dla odtwarzalności.

## Finalny sidebar Kwotum P1 — 2026-08-13

| Plik                                                     | Rozmiar    | SHA-256                                                            |
| -------------------------------------------------------- | ---------- | ------------------------------------------------------------------ |
| `docs/ui/sidebar-kwotum-p1/reference/sidebar-kwotum.png` | 863 × 1822 | `ea188a170b984ae7554d94baefd62913175e657d9bfd0595ad7a02d321efbe87` |

Referencja zastępuje decyzję X wyłącznie w regionie desktopowego sidebara.
Obowiązuje 256 px w stanie rozwiniętym, 72 px w zwiniętym, płaskie tło
`#0d2b24`, Instrument Sans oraz aktywna zakładka z dwoma prawymi ścięciami.
Nie zmienia routingu, capabilities, tenant scope ani mobilnej dolnej nawigacji.
Szczegółowy kontrakt i wynik odbioru opisują ADR-045,
`ui/sidebar-kwotum-p1/README.md` i `ui/sidebar-kwotum-p1/VISUAL_QA_REPORT.md`.

Nowszy zaakceptowany zrzut produkcyjny z 2026-08-13, 3338 × 1962 px, SHA-256
`b08ac479744086b70850339e9a3b427dfb6509d443745887f91565989be55e4d`,
nadpisuje referencję P1 wyłącznie w prawym zakończeniu aktywnej pozycji.
Powierzchnia ma zachować 16 px prawego odstępu w expanded. Finalny crop
collapsed, 236 × 200 px, SHA-256
`a35d9b646ed18fc1d85c23c01e8ee5da6f4a697011b652051cd43a942360334d`,
ustala jasną powierzchnię równo z lewym brzegiem, bez lewego zaokrąglenia, oraz
prawy skos kończący się 10 px przed prawym brzegiem raila. Wymiary 256/72 px i
pozostały kontrakt P1 nie zmieniają się.

## Finalny wybór organizacji Kwotum — 2026-08-13

| Plik                                                                                   | Rozmiar     | SHA-256                                                            |
| -------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------ |
| `docs/ui/organization-picker-kwotum-final/reference/organization-picker-1536x1024.png` | 1536 × 1024 | `572cb0009eb74051e97c37578ae9b11bbfa5c3c1381140272874380852eb1810` |

Referencja zastępuje decyzję 12M-Y wyłącznie dla uwierzytelnionej trasy
`/panel`. Ustala header 80 px, lewą kolumnę 484 px, prawą oś treści około
934 px, wyszukiwarkę 376 × 50 px, nagłówek listy 62 px oraz wiersz 111 px.
Kolor fioletowy zostaje zastąpiony paletą zieleni Kwotum, a znak — aktualnym
logo V3. Przykładowe firmy, domeny, role, statusy i daty nie są kopiowane;
obowiązują rzeczywiste członkostwa, RLS, tenant scope i dane aktywności.
Szczegółowy kontrakt i wynik odbioru opisują ADR-046,
`ui/organization-picker-kwotum-final/README.md` oraz
`ui/organization-picker-kwotum-final/VISUAL_QA_REPORT.md`.
