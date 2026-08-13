# Manifest referencji V6 Image-Locked

**Status:** kanoniczny  
**Data blokady:** 2026-07-27  
**Źródło historyczne:** `nowydesign.zip` — usunięte po poprawnej ekstrakcji  
**SHA-256 archiwum:** `f1e86da64f28788065d687e7c2b65e9199af162ca4ff1bec9e05266b838fc141`

## Hierarchia

1. Najnowsze zaakceptowane załączniki rozmowy — wyłącznie dla regionu, który
   pokazują czytelniej niż plik repozytorium.
2. Cztery główne obrazy w `references/`.
3. Pełne plansze landingowe i produktowe z pakietów źródłowych.
4. Prototypy HTML/CSS i generatory — źródło pomiarów, nie kod produkcyjny.
5. Starsze screenshoty i raporty — kontekst historyczny.

Wymagania bezpieczeństwa, `DECISIONS.md`, `SCOPE.md` i `NON_GOALS.md` mają
pierwszeństwo przed każdym obrazem.

## Główne obrazy

| Plik                                   |     Rozmiar | SHA-256            | Zakres                                                   |
| -------------------------------------- | ----------: | ------------------ | -------------------------------------------------------- |
| `references/accepted-master-board.png` | 1536 × 1024 | `992ebb2b…e201696` | landing, dashboard, lead detail, mobile, design system   |
| `references/product-app-board.png`     | 1536 × 1024 | `df3c7894…a31101`  | leady, procesy, szablony, analityka, ustawienia, builder |
| `references/landing-desktop-full.png`  | 1536 × 7708 | `e4d89c09…ce657`   | 15 sekcji landingu desktop                               |
| `references/landing-mobile-full.png`   | 390 × 14302 | `eb43b17e…c7063`   | pełna transformacja mobile                               |

Pełne sumy znajdują się w historii kontroli
`_migration/LORUM_REFERENCE_LOCK_REPORT.md`.

## Landing

Źródło: `lorum-landing-reference-v2/`.

| Render                                  |     Rozmiar |
| --------------------------------------- | ----------: |
| `screenshots/lorum-board-1-desktop.png` | 1536 × 1311 |
| `screenshots/lorum-board-2-desktop.png` | 1536 × 1710 |
| `screenshots/lorum-board-3-desktop.png` | 1536 × 2470 |
| `screenshots/lorum-board-4-desktop.png` | 1536 × 2220 |
| `screenshots/lorum-board-1-mobile.png`  |  390 × 2355 |
| `screenshots/lorum-board-2-mobile.png`  |  390 × 3053 |
| `screenshots/lorum-board-3-mobile.png`  |  390 × 5210 |
| `screenshots/lorum-board-4-mobile.png`  |  390 × 3687 |

`index.html` i `styles.css` służą do odczytu proporcji. Produkcja używa
semantycznego React/Next.js i wspólnych tokenów `packages/ui`.

## Produkt

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

Decyzja W pochodzi z czterech obrazów zaakceptowanych przez właściciela
2026-08-02. Pierwszy nadpisuje wcześniejszy znak i widoczną nazwę Lorum na
**Kwotum** zgodnie z ADR-033. Drugi wskazuje problem rytmu finalnego CTA na
mobile. Trzeci wskazuje nierówny rail warunków finalnego CTA, a czwarty różne
szerokości dwóch akcji przykładowego leada. Nie są wzorcem nowej treści ani
powrotem do starego układu proof. Korekta obejmuje wyłącznie bezpieczne insets,
szerokości dzieci, rytm i znak marki. Desktopowa geometria V7 pozostaje bez
zmian poza pokazanymi dwoma mikroregionami.

| Plik                                                                | Rozmiar    | SHA-256                                                            |
| ------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------ |
| `docs/ui/kwotum-brand-v1/reference/01-kwotum-logo-direction.png`    | 1600 × 900 | `0ae9103735a3b0bf0d48653cdc38ba311776c7d175efe45b48a26ba9a1083a97` |
| `docs/ui/kwotum-brand-v1/reference/02-mobile-final-cta-padding.png` | 780 × 1688 | `97ac5c1ba02547248da3006173c8a146f906e483f4e88ba1fd473981d3c87fb7` |
| `docs/ui/kwotum-brand-v1/reference/03-final-cta-facts-spacing.png`  | 1460 × 158 | `2fa98bbf8b746e189373210250a779a4c48f721e37180f633a29ca0a1fb6e683` |
| `docs/ui/kwotum-brand-v1/reference/04-lead-actions-width.png`       | 564 × 262  | `b048c0a8cdb6e15c0f59f8048c0397e53fab3576c7cc5078dc04228d9896e72d` |

Decyzja X jest tekstową dyspozycją właściciela z 2026-08-03 i nadpisuje
Etap 12M tylko w warstwie wizualnej wspólnego sidebara panelu. Rozwinięty
wariant ma 240 px, znak Kwotum nie ma osobnego tła ani obramowania, a główne
narzędzia otrzymują osobny, code-native zestaw ikon bez teł i obramowań.
Zwinięty rail pozostaje
78 px, breakpoint 56 rem i dolna nawigacja mobilna nie zmieniają struktury,
capability-gated linków ani zachowania. Dyspozycja nie dodaje nowych funkcji,
tras ani zależności. Ponieważ nie dostarczono obrazu źródłowego, nie przypisuje
się jej sztucznego SHA-256; dowody runtime znajdują się w
`artifacts/visual-qa/12m-panel-shell/sidebar-kwotum-glass/`.

Decyzja Y pochodzi z obrazu zaakceptowanego przez właściciela 2026-08-03 i
nadpisuje wyłącznie trasę wyboru organizacji `/panel`. Desktop używa headera
około 102 px, osi treści 1260 px, dużego nagłówka i poziomej karty organizacji
z avatarem, nazwą, slugiem, trzema metadanymi oraz dwiema działającymi akcjami.
Liczby widoczne na obrazie nie są fixture'em produkcyjnym: aplikacja pobiera
liczbę opublikowanych procesów, leadów `new`/`in_progress` oraz ostatnią
aktywność przez uwierzytelniony klient i istniejące RLS. Mobile zachowuje
kolejność DOM, składa kartę do jednej kolumny i nie przewija się poziomo.

| Plik                                                                                     | Rozmiar     | SHA-256                                                            |
| ---------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------ |
| `artifacts/visual-qa/12m-panel-shell/organization-picker-kwotum/reference-2872x1608.png` | 2872 × 1608 | `783b30ceadefada2a5841af73c1b5334cb672f10723e555a53309d929975f133` |

Decyzja AA dotyczy wyłącznie trasy
`/panel/[organizationId]/integracje/webhooki`. Ponieważ nie dostarczono
osobnego obrazu webhooka, ekran dziedziczy shell, oś treści, hierarchię kart,
gęstość i responsywną transformację z zaakceptowanego ekranu Integracji 12S:
`artifacts/visual-qa/12s-remaining-screens/after/integrations-1536x1024.png`,
SHA-256
`208f8d84508909fee0c5baed36c6ce773b8fee4d64dd0d1e406a14754c8c8296`.
Nie dziedziczy treści WordPressa, statystyk ani kontrolek. Dane, role, stany,
one-time secret, retry i dead letter wynikają wyłącznie z ADR-034 i
`WEBHOOKS.md`. Finalne viewporty, overlay i różnice zapisuje
`artifacts/visual-qa/12zf-webhook-v1/diff.md`.

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

Wygenerowane ilustracje produktowe Etapu 12K:

| Plik                                           | Rozmiar     | SHA-256                                                            |
| ---------------------------------------------- | ----------- | ------------------------------------------------------------------ |
| `apps/web/public/auth-login-product-v2.png`    | 1024 × 1536 | `5314c0b79ab860aa7faff51574d9972d08a7fa108318590dc8a667ecb0161cba` |
| `apps/web/public/auth-register-product-v2.png` | 1024 × 1536 | `c5f2cd0104b9cfbfe212b7505d7b0d4d0b11a4275b75ed4ac41119e9afb408f9` |

Obie grafiki mają kanał alfa. Logowanie pokazuje rail procesu, builder
formularza, wynik i listę leadów; rejestracja pokazuje potwierdzenie,
organizację i uruchomienie formularza. Nie zawierają tekstu, logo ani
syntetycznych danych osobowych.

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
