# Minimalistyczny panel Kwotum V1

**Status:** kanoniczny kontrakt nowego kierunku panelu
**Data blokady:** 2026-08-26
**Bieżący etap:** M5 zamknięty; następny dozwolony etap to M6
**Zakres:** panel administracyjny; bez zmiany logiki produktu, danych i uprawnień

## 1. Cel

Panel ma stać się jasnym, spokojnym i precyzyjnym narzędziem operacyjnym.
Profesjonalny charakter ma wynikać z proporcji, typografii, rytmu, hierarchii
informacji i spójnych kontrolek, a nie z dekoracji. Interfejs pozostaje gęsty
tam, gdzie użytkownik porównuje dane, ale nie może wyglądać na przeładowany.

Nowy kierunek zastępuje wszystkie wcześniejsze wizualne referencje panelu.
Nie zastępuje wymagań bezpieczeństwa, produktu, dostępności, danych ani
architektury.

## 2. Zablokowane referencje

| Rola                                              | Plik                                                      |    Rozmiar | SHA-256                                                            |
| ------------------------------------------------- | --------------------------------------------------------- | ---------: | ------------------------------------------------------------------ |
| główna, mierzalna geometria i hierarchia          | `reference/panel-dashboard-primary-1199x842.png`          | 1199 × 842 | `824df7d47e16d9114ae66990a0d02e91f4954ce1ba7b5d1c4d180fea84aed6e1` |
| pomocniczy kierunek typografii, zakładek i koloru | `reference/panel-dashboard-direction-404x316.png`         |  404 × 316 | `2cd7db369c2233f08f77b497a2b2e54e5458bf840548c5ba6e791b48518e3b64` |
| regionalny wzorzec przełącznika segmentowego      | `reference/panel-segmented-control-direction-798x144.png` |  798 × 144 | `9c085accf0f15fb8e721b99de1b7e76c4bfc0f035ff01c8b60288cd85b45bf3e` |

Pierwszy obraz jest źródłem proporcji. Drugi jest ucięty, pokazany pod kątem i
ma małą rozdzielczość, dlatego nie służy do pomiarów 1:1 ani pixel diffu.

Trzeci obraz jest nowszym nadpisaniem wyłącznie dla przełączników z kilkoma
równorzędnymi wariantami. Steruje relacją jednego długiego tracku,
sąsiadujących segmentów i miękko zaznaczonego aktywnego wyboru. Nie przenosimy
z niego ciemnego tła, poświaty, nazewnictwa ani palety; panel pozostaje jasny,
płaski i oparty na tokenach Kwotum. Podkreślenie z osobną dolną linią nie jest
już wzorcem dla takiego przełącznika.

### Mapa pomiarowa obrazu głównego

Pomiary są wykonywane na pliku 1199 × 842 px. Osadzona aplikacja ma około
1080 × 768 px (`x=59`, `y=37`); tolerancja krawędzi wynosi ±2 px ze względu na
antyaliasing i jasne linie.

| Region          |     Pomiar natywny | Relacja                              |
| --------------- | -----------------: | ------------------------------------ |
| sidebar         |       około 187 px | 17,3% szerokości aplikacji           |
| workspace       |       około 893 px | 82,7% szerokości aplikacji           |
| pasek kontekstu |        około 40 px | niski, jednowierszowy                |
| padding treści  |        około 12 px | wspólna lewa i prawa oś              |
| karta KPI       | około 195 × 105 px | trzy równe karty przed prawym railem |
| główny wykres   | około 608 × 307 px | dominuje w głównej kolumnie          |
| prawy rail      | około 249 × 420 px | około 29% szerokości treści          |
| przerwa kolumn  |     około 11–12 px | jeden stały rytm                     |
| dolna tabela    | około 868 × 216 px | pełna szerokość treści               |

Nie kopiujemy tych liczb bezpośrednio do CSS. Po normalizacji do panelu
1440 px zachowujemy istniejący sidebar 256 px, odstępy 16–24 px, prawy rail
288–320 px i elastyczną kolumnę główną. Pasek kontekstu zwiększamy do 52–56 px,
a cele dotykowe do minimum 44 px, ponieważ natywny screenshot jest
zeskalowanym podglądem, nie specyfikacją dostępności.

### Co z obrazów jest instrukcją wizualną

- niemal monochromatyczna baza: biel, ciepłe szarości i grafit;
- jeden stały sidebar, niski pasek kontekstu i płaski workspace;
- cienkie granice zamiast ciężkich cieni;
- małe, spójne promienie;
- profesjonalna, neutralna typografia UI;
- kolor tylko dla aktywności, fokusu, jednej serii wykresu i stanów;
- nagłówek strony z działaniami po prawej;
- wewnętrzne zakładki u góry po lewej dla modułów z kilkoma ekranami;
- kompaktowe KPI, dominująca wizualizacja, panel operacyjny i tabela/lista;
- kontrolki okresu jako lokalny segmented control, nie globalna nawigacja.

### Co nie jest instrukcją

Nazwy Kravio i Aiyox, moduły Tickets/Clients/Agents, przykładowe osoby, daty,
kwoty, statusy, liczby i wykresy są treścią demonstracyjną. Nie wolno ich
kopiować ani tworzyć odpowiadających im funkcji. Perspektywa monitora,
marketingowe tło i watermark drugiego obrazu także nie należą do aplikacji.

## 3. Hierarchia decyzji

1. bezpieczeństwo, prywatność, RLS, tenant scope i serwerowa autoryzacja;
2. zaakceptowane ADR-y oraz zakres produktu;
3. realne dane, routing, capabilities i działające akcje;
4. niniejszy kontrakt i dwie nowe referencje;
5. dotychczasowy CSS tylko tam, gdzie nie jest sprzeczny z punktami 1–4.

Obraz nigdy nie zezwala na atrapę, fikcyjny KPI, nieistniejące ustawienie,
martwy przycisk ani ujawnienie danych innego tenanta.

## 4. Audyt bieżącego panelu

### Architektura i zachowania chronione

- Next.js App Router, React i TypeScript strict pozostają bez zmian;
- tenantowy layout serwerowo buduje menu według capabilities;
- `requireTenantContext`, RLS, noindex i prywatny cache pozostają obowiązkowe;
- sidebar zachowuje stan expanded/collapsed i kompatybilny klucz preferencji;
- mobile zachowuje dolną nawigację, dialog „Więcej”, focus trap, Escape,
  focus return i safe area;
- builder zachowuje autosave, konflikty rewizji, undo/redo, publikację i tryby
  mobilne;
- leady zachowują query params, filtry, paginację, semantyczną tabelę i
  transformację do listy;
- pricing i score nadal są obliczane albo potwierdzane po stronie serwera.

### Potwierdzone problemy prezentacji

1. Dwa nakładające się arkusze panelu mają łącznie około 14 tysięcy linii,
   wiele historycznych media queries, twarde kolory i lokalne rozmiary.
2. Zawartość panelu nadal używa Intera, a ukończony sidebar lokalnego
   Instrument Sans; typografia nie jest jeszcze jednym systemem.
3. Dashboard pokazuje sześć KPI w jednym rzędzie i jedenaście dalszych sekcji.
   Część tekstu ma 7,5–10 px, co daje gęstość z obrazu pomniejszonego zamiast
   dojrzałej aplikacji.
4. Nagłówki nie są wspólne: dziewięć tras używa `PanelPageHeader`, a leady,
   procesy, szablony, lead detail i builder mają własne warianty.
5. Ustawienia używają dodatkowego lewego raila, a WordPress i webhooki nie mają
   wspólnego menu kontekstowego.
6. Pełna ciemnozielona powierzchnia sidebara jest mocniejsza niż nowy kierunek,
   który przewiduje kolor marki jako sygnał, nie tło większości nawigacji.
7. Wiele kart, statusów, tabel i formularzy ma różną gęstość mimo podobnej
   funkcji.
8. Duży, niecommitowany worktree wymaga małych zmian i zakazuje masowego
   formatowania lub przepisywania panelu jednocześnie.

### Inwentarz ekranów

| Moduł      | Trasy / powierzchnie                                                       |
| ---------- | -------------------------------------------------------------------------- |
| wejście    | `/panel` — wybór organizacji                                               |
| przegląd   | `/panel/[organizationId]`                                                  |
| leady      | lista, szczegół, odpowiedzi, pliki, historia, prywatność i operacje        |
| procesy    | lista, szablony, builder, podgląd i instalacja                             |
| analityka  | zakres 7/30/90 dni, KPI, lejek, score, źródła, urządzenia i drop-off       |
| integracje | WordPress i webhooki                                                       |
| system     | ustawienia organizacji, branding, dostawa leadów, powiadomienia i retencja |
| start      | onboarding wynikający z rzeczywistych rekordów domeny                      |

## 5. System wizualny

### Kolor

Docelowa proporcja to około 90% neutralnych powierzchni, 8% marki i 2% stanów
alarmowych. Wszystkie wartości trafiają do semantycznych tokenów w
`packages/ui`; ekran nie dostaje lokalnej palety.

| Rola                        | Kierunek                                          |
| --------------------------- | ------------------------------------------------- |
| canvas                      | czysta biel `#FFFFFF`                             |
| sidebar / subtle surface    | neutralne `#FAFAF9`                               |
| surface                     | `#FFFFFF`                                         |
| tekst główny                | grafit około `#171A1F`                            |
| tekst drugorzędny           | neutralny około `#60666C`                         |
| border                      | jasny neutral około `#E4E7E5`                     |
| aktywność / focus / primary | istniejąca głęboka zieleń Kwotum                  |
| wykres                      | jedna seria marki, serie kontekstowe w neutralach |
| success / warning / danger  | wyłącznie znaczenie semantyczne                   |

Nie stosujemy gradientów dekoracyjnych, glassmorphismu, poświat, wzorów w
nagłówkach kart, wielu kolorów wykresu ani pełnych pigułek poza statusem i
małym filtrem lokalnym.

### Typografia

Panel użyje istniejącego, lokalnego **Instrument Sans Variable** na licencji
OFL 1.1. Nie pobieramy fontu, nie dodajemy zależności i nie używamy CDN. Jest
neutralny, ma profesjonalne metryki UI i obsługuje polskie znaki. Inter
pozostaje fallbackiem technicznym.

| Rola               | Rozmiar / interlinia |    Waga |
| ------------------ | -------------------- | ------: |
| tytuł strony       | 24 / 32 px           |     600 |
| duża wartość KPI   | 28–32 / 36 px        |     600 |
| tytuł sekcji       | 15–16 / 21 px        |     600 |
| body               | 14 / 20 px           |     400 |
| nawigacja i tabela | 13 / 18 px           |     500 |
| label              | 12 / 17 px           |     500 |
| metadata           | 12 / 16 px           | 400–500 |
| grupa sidebara     | 11 / 16 px           |     600 |

Dozwolone są tylko wagi 400/500/600/700. Liczby, daty, kwoty i kolumny tabel
używają `font-variant-numeric: tabular-nums`. Nie kopiujemy mikrotekstu ze
zeskalowanych screenshotów.

### Geometria i rytm

- expanded sidebar: zachować 256 px; collapsed: 72 px;
- pasek kontekstu desktop: 52–56 px;
- page padding desktop: 24 px, szeroki desktop maksymalnie 32 px;
- page padding mobile: 16 px;
- główne odstępy: 4 / 8 / 12 / 16 / 20 / 24 / 32 px;
- kontrolka desktop: 40 px; cel dotykowy minimum 44 px;
- karta: border 1 px, radius 8–10 px, shadow brak albo 0 1px 2px / 4%;
- pole i button: radius 8 px;
- ikona: 16–18 px, maksymalnie 20 px;
- wiersz tabeli: 44–48 px;
- content wykorzystuje workspace; formularze mogą mieć funkcjonalny max-width,
  dashboard i tabele nie są zamykane w wąskim marketingowym kontenerze.

### Sidebar

Geometria, routing, capabilities, mobile i preferencja P1 pozostają. Warstwa
wizualna przechodzi na jasną neutralną powierzchnię z linią 1 px. Jeden wzorzec
aktywnego elementu obowiązuje wszędzie: zwarty ciemny akcent lub jasna
powierzchnia z jednoznacznym markerem marki, wybrany i zablokowany w M1. Nie
mieszamy obu wzorców. Pełna zieleń nie jest tłem całego raila.

### Pasek kontekstu i menu wewnętrzne

- breadcrumb: 12–13 px, pierwszy poziom jest prawdziwym linkiem;
- prawdziwe utility actions po prawej, bez fikcyjnego global search;
- tytuł i opis są osobnym page intro poniżej paska;
- menu modułu znajduje się bezpośrednio pod intro, przy lewej osi treści;
- aktywna zakładka: mocniejszy tekst i linia 2 px w kolorze marki;
- zakładki nie są szeregiem dużych pigułek;
- mobile przewija zakładki poziomo bez zawijania do kilku rzędów;
- ustawienia grupują Organizację, Powiadomienia i Dane i prywatność;
- integracje grupują WordPress i Webhooki wyłącznie według capabilities;
- builder i lead detail zachowują własną task-focused nawigację do właściwych
  etapów i nie otrzymują podwójnego topbara.

### Dashboard

Kandydat M3 zachowuje realne dane w uproszczonej hierarchii:

1. page intro, zakres czasu i realne wyszukiwanie/akcja;
2. cztery główne KPI w jednym rzędzie; pozostałe dwa wskaźniki trafiają do
   drugiego poziomu, nie znikają;
3. główny trend w kolumnie elastycznej;
4. panel uwagi lub ostatnich aktywności 288–320 px po prawej;
5. jedna pełna tabela/lista operacyjna poniżej;
6. dalsze agregaty dopiero niżej, zgrupowane według decyzji użytkownika.

Sparkline i wykres powstają wyłącznie z rzeczywistych wartości. Jedna seria
jest zielona lub grafitowa, kontekst pozostaje jasny. Wykres ma opis tekstowy,
nie polega tylko na kolorze i nie używa 3D.

### Tabele i formularze

- toolbar nad tabelą: wyszukiwanie, filtry, główna akcja i overflow;
- semantyczne `table`, `th`, `scope` i obsługa klawiaturą pozostają;
- separator 1 px, bez zebra striping i ciężkich nagłówków;
- status to mała kropka/ikona oraz tekst albo kompaktowy badge;
- formularze grupują pola według zadania, nie według przypadkowych kart;
- error, help i success są blisko pola i dostępne dla czytnika ekranu;
- disabled nie może być jedyną kontrolą uprawnień.

## 6. Responsive i dostępność

Każdy etap sprawdza 320×800, 375×812, 390×844, 430×932, 768×1024,
1024×768, 1280×800, 1440×900 i 1536×1024. Dodatkowo: zoom 200%, długie
polskie treści, klawiatura, reduced motion, forced colors i axe.

- do 56 rem desktopowy sidebar pozostaje zastąpiony obecną dolną nawigacją;
- wewnętrzne zakładki są przewijane, nie skalowane;
- dashboard przechodzi 4 → 2 → 1 kolumna zależnie od modułu;
- prawy rail schodzi pod główną treść;
- tabela zmienia się w zaprojektowaną listę albo ma kontrolowane przewijanie;
- nie używamy `overflow-x: hidden` do maskowania błędów;
- builder jest osobną transformacją Pytania / Podgląd / Ustawienia;
- sticky action rezerwuje miejsce i respektuje safe area.

## 7. Etapy wykonawcze

### M0 — reset referencji, cleanup i audyt

**Zakres:** zablokować dwa nowe obrazy, usunąć stare referencje panelu,
zastąpione raporty i historyczne artefakty, skonsolidować unikalne wymagania w
tym dokumencie. Runtime bez zmian.

**Gate:** brak aktywnych odwołań do usuniętych plików, nowe SHA w manifeście,
zielone testy bazowe modeli nawigacji i typecheck web, `git diff --check` oraz
udokumentowana odzyskiwalność cleanupu.

**Wynik:** PASS lokalny. Szczegóły, lista usuniętych materiałów, odzyskiwalność
i wyniki testów: `M0_CLEANUP_AND_AUDIT.md`.

### M1 — fundament typografii i neutralny app shell

**Zakres:** aktywować Instrument Sans dla całego `.wy-panel-theme`, sprowadzić
wagi do 400/500/600/700, przenieść canvas/sidebar/border/focus do centralnych
tokenów i zmienić wyłącznie prezentację wspólnego shellu. Zachować 256/72,
routing, mobile i storage key. Bez zmian treści dashboardu.

**Gate:** expanded/collapsed, focus, keyboard, persistence, reduced motion,
forced colors, 0 overflow oraz visual QA minimum 18/20 dla regionu shellu.

**Pierwszy wynik:** ODRZUCONY w przeglądzie właściciela. Jasny sidebar nie
tworzył spójnej całości z dashboardem: konkurujące tła, nierówne osie, nadmiar
kart i generyczne wykresy wymagały wspólnej korekty.

**Korekta i odbiór 2026-08-26:** właściciel zaakceptował skorygowany kierunek.
Shell i dashboard używają jednego białego canvasu, delikatnie
odróżnionego sidebara, wspólnych osi, płaskich separatorów i Instrument Sans.
Odrzucone zrzuty M1 usunięto; aktualne artefakty znajdują się wyłącznie w
`artifacts/visual-qa/panel-minimal-v1/baseline/`.

### M2 — topbar, page intro i nawigacja kontekstowa

**Zakres:** niski pasek kontekstu, breadcrumbs, jeden `PanelPageHeader`,
route-based menu ustawień i integracji, prawdziwe utility actions. Builder i
lead detail pozostają izolowane. Bez przebudowy kart, tabel i formularzy.

**Gate:** właściwe `aria-current`, capability-gated zakładki, brak podwójnych
nagłówków, klawiatura, mobile scroll tabs, loading/error parity i 18/20.

**Wynik techniczny i wizualny 2026-08-26:** PASS 19/20; kandydat oczekuje na
wizualny odbiór właściciela. Wspólny pasek ma 54 px, breadcrumbs prowadzą do
tenantowego Przeglądu, a route-based menu obejmuje Organizację, Powiadomienia,
Dane i prywatność oraz osobno WordPress i Webhooki według capabilities.
Loading/error zachowują ten sam chrome i prawdziwe utility actions. Przy 320 px
menu pozostaje w jednym przewijanym rzędzie, dokument ma 0 px overflow, cele
mają 44 px, a axe oraz forced colors mają 0 naruszeń. Builder i lead detail
pozostają izolowane. Bazowy pełny panel E2E przeszedł 21/21, końcowy test M2
1/1, dwa dotknięte długie scenariusze 2/2, a build 16/16. Dodatkowy pełny
rerun zatrzymano po utracie jednorazowego fixture'u przez seryjny retry; cleanup
potwierdził 0 pozostałości. Raport i obrazy są w
`artifacts/visual-qa/panel-minimal-v1/m2-context-navigation/`. M4 nie został
rozpoczęty.

### M3 — minimalistyczny dashboard

**Zakres:** warstwa prezentacji dashboardu i jego loading/error oraz dokładny,
tenantowy agregat serwerowy wymagany do usunięcia limitu listy. Zachować próg
prywatności i wszystkie realne wartości. Przebudować hierarchię KPI, główny
trend, panel uwagi, najnowsze leady i dalsze agregaty.

**Gate:** dane przed/po są równoważne, żadna wartość nie jest liczona w kliencie,
wykres ma alternatywę tekstową, 320–1536 bez overflow, axe i 18/20.

**Wynik techniczny i wizualny 2026-08-26:** PASS; właściciel zaakceptował
skorygowany kierunek. Cztery
KPI, grupowany trend 14 dni, rail uwagi, tabela i cztery płaskie przekroje
korzystają z realnych danych. Operacyjne wartości liczy serwerowe RPC z forced
RLS i tenant scope; źródła sesji zachowują próg prywatności. Pełny panel E2E
przechodzi 20/20, w tym 320 px bez maskowania overflow. M3 jest zamknięty. M2
został następnie domknięty technicznie; M4 nie został rozpoczęty i pozostaje
zablokowany do wizualnego odbioru M2.

### M4 — wspólne formularze i kontrolki

**Zakres:** Button, LinkButton, input, select, textarea, checkbox/switch,
segmented control, tabs, menu i komunikaty w `packages/ui`. Builder dopiero M7.

**Gate:** default/hover/focus/disabled/loading/error/success, keyboard,
forced colors, testy komponentów i brak lokalnych konkurencyjnych tokenów.

**Wynik techniczny i wizualny 2026-08-26:** PASS 20/20. Wspólna biblioteka
obsługuje stabilny stan ładowania Button, dostępne błędy i sukcesy FormField,
natywny checkbox/radio, semantyczny switch, segmented control, tabs oraz menu
z pełną nawigacją klawiaturą i zamykaniem po wyjściu. Ustawienia organizacji,
branding, dostawa leadów, retencja, WordPress i formularz webhooka korzystają
z tych samych pól, komunikatów oraz stanu loading. Usunięto lokalne reguły
promieni i geometrii, które konkurowały z `packages/ui`; layout ekranów
pozostaje zakresem M9, a builder M7. Pole ma border 1 px, radius 8 px i cel co
najmniej 44 px; switch ma 42 × 24 px wewnątrz etykiety 65 px. Axe i forced
colors mają 0 naruszeń, a pełna macierz 320–1536 px wraz z reflow 720 px ma
0 overflow. Testy UI przechodzą 38/38, E2E M4 1/1 i build 16/16. Raport i
obrazy: `artifacts/visual-qa/panel-minimal-v1/m4-controls/`.

### M5 — tabele i listy

**Zakres:** leady, procesy i szablony. Zachować query params, paginację, linki,
semantykę tabel i realne akcje. Mobile otrzymuje jawne listy zadaniowe.

**Gate:** 0/1/100+ rekordów, długie dane, focus wiersza, filtry, paginacja,
mobile i desktop E2E oraz 18/20 dla każdego wdrożonego ekranu.

**Wynik techniczny i wizualny 2026-08-26:** PASS 19/20 osobno dla Leadów,
Procesów i Szablonów. Leady używają dokładnego countu i serwerowej paginacji
z fixture'em 102 rekordów, trwałymi filtrami i osobną semantyczną listą
mobilną; produkcyjny serwis jest sprawdzony dla 0/1/102. Procesy pobierają
tylko bieżącą stronę oraz jej opublikowane wersje i są jedną płaską listą
pełnych linków; serwis oraz E2E pokrywają 0/1/109, ostatnią stronę i nazwy do
160 znaków. Szablony straciły dekoracyjne media i KPI; wyszukiwanie, kategoria,
złożoność, sortowanie i strona są stanem URL odpornym na Back/Forward/reload,
a podgląd przenosi fokus do wyniku. Bezpośrednie wejście Sales jest odrzucane,
zaś utworzenie procesu ufa wyłącznie kanonicznemu szablonowi po stronie
serwera. Model biblioteki szablonów pokrywa 0/1/101 rekordów. Celowany E2E M5
przeszedł 3/3, a pełna bramka panelu 23/23; axe ma 0 naruszeń, fokus forced
colors 3 px, a macierz
320/375/390/430/720/768/1024/1280/1440/1536 px ma 0 overflow. Web unit
przechodzi 192/192, UI 38/38, lint i typecheck 8/8, PostgreSQL/RLS, WordPress
oraz build 16/16 są zielone. Raporty i obrazy znajdują się w
`artifacts/visual-qa/panel-minimal-v1/m5-lists/`. M6 nie został rozpoczęty.

### M6 — workspace leada

**Zakres:** kompaktowy header, wynik i powody, wewnętrzne sekcje, dokument oraz
panel operacyjny. Zachować status, ownera, priorytet, notatki, zadania, pliki,
historię, zgody, signed URLs i server actions.

**Gate:** negatywne testy roli i drugiego tenanta, wszystkie sekcje osiągalne,
mobile logic order, sticky action bez zasłaniania treści, axe i 18/20.

### M7 — builder i instalacja procesu

**Zakres:** osobny task workspace, lista pytań, preview, inspector, logika,
estymacja i instalacja. Visual refresh bez zmiany FlowDocument, walidacji,
autosave, konfliktów, undo/redo, publikacji ani immutable wersji.

**Gate:** pełny cykl edycji i publikacji, negatywne przypadki walidacji,
Pytania/Podgląd/Ustawienia na mobile, keyboard alternatives i 18/20.

### M8 — analityka

**Zakres:** te same okresy i agregaty w języku nowego dashboardu. Zachować próg
małej próby, tekstowe wartości, źródła, urządzenia, drop-off i wersje procesu.

**Gate:** 7/30/90 dni, empty threshold, opisy wykresów, forced colors, mobile,
privacy tests, axe i 18/20.

### M9 — ustawienia, integracje i wejście do panelu

**Zakres:** zawartość formularzy organizacji, brandingu, dostawy leadów,
powiadomień, prywatności, WordPressa, webhooków, onboardingu i wyboru
organizacji. Menu kontekstowe pochodzi z M2. Bez nowych pól domeny.

**Gate:** capability i role, server validation, CSRF/request IDs tam, gdzie
obowiązują, sekrety niewidoczne w kliencie, loading/empty/error i 18/20.

### M10 — stany i konsolidacja

**Zakres:** wspólny loading, empty, error, permission i success; usunięcie
zastąpionych reguł CSS po sprawdzeniu `rg`; pełny responsive/a11y/performance
pass. Bez nowych funkcji.

**Gate:** format, lint, typecheck, unit, PostgreSQL/RLS, WordPress, build,
authenticated panel E2E, axe, wszystkie viewporty, self-review i brak broken
links. Każdy zmieniony ekran ma minimum 18/20.

## 8. Procedura każdego etapu

1. wskazać dokładny region referencji i viewport;
2. zapisać `before`;
3. zmienić wyłącznie zakres etapu;
4. zapisać `after-v1`, overlay i dziesięć największych różnic;
5. poprawić kompletność, geometrię, typografię, spacing i stany;
6. zapisać finalny `after`, overlay/difference i mobile;
7. uruchomić testy proporcjonalne do ryzyka;
8. wykonać self-review diffu, bezpieczeństwa, prywatności i wydajności;
9. zaktualizować backlog i dokumentację;
10. zatrzymać się przed następnym etapem, dopóki gate nie jest spełniony.

## 9. Kryteria nienegocjowalne

- zero atrap i fikcyjnych danych w runtime;
- zero zmian RLS, tenant scope i capabilities przez warstwę wizualną;
- zero lokalnych tokenów koloru/fontu poza `packages/ui`;
- zero `any`, wyłączeń lintowania i osłabiania testów;
- zero maskowania overflow;
- zero zewnętrznych fontów i zbędnych bibliotek ikon;
- wszystkie kontrolki działają klawiaturą;
- panel, leady i dane organizacji pozostają noindex i private/no-store;
- każdy etap ma rollback przez mały, odseparowany diff.
