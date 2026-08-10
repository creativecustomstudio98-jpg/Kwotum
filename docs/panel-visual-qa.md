# Visual QA rekonstrukcji panelu Lorum

**Status:** PASS lokalny  
**Data:** 2026-07-27  
**Zakres:** ponownie otwarty Etap 12A — panel aplikacji  
**Referencje:** `apps/web/public/panel/` i `references/product-app-board.png`

## 1. Metoda

1. Zablokowano cztery oryginały przez rozmiar i SHA-256.
2. Z plansz 1536 × 1024 wycięto osobne ekrany zamiast porównywać cały board z
   jednym route’em.
3. Uruchomiono produkcyjny build na lokalnym Supabase.
4. Idempotentny, ograniczony do loopbacka seed utworzył pięć rzeczywistych
   procesów, immutable publikację procesu głównego, 88 leadów obejmujących
   bieżące i poprzednie 30 dni, wszystkie statusy, odpowiedzi, historię,
   706 zdarzeń analitycznych,
   przykładowe połączenie WordPress, politykę retencji i rzeczywisty plik w
   prywatnym lokalnym Storage. Normalne route’y i usługi aplikacji nie
   korzystają z fixture’ów.
5. Playwright zalogował rzeczywistego użytkownika tenantowego, odwiedził
   chronione route’y i zapisał rendery 1448 × 1086, 1536 × 1024, 390 × 844
   oraz 430 × 932.
6. Dla dwóch pełnoekranowych referencji wykonano side-by-side, overlay 50% i
   difference. Ponieważ treść biznesowa referencji różni się od realnego
   modelu Lorum, difference służy do oceny geometrii, a nie jako arbitralny
   próg procentowy pikseli.

Artefakty:

- cropy: `artifacts/visual-qa/12a-panel-reconstruction/reference-crops/`;
- rendery: `artifacts/visual-qa/12a-panel-reconstruction/actual/`;
- zestawienia, overlay i diff:
  `artifacts/visual-qa/12a-panel-reconstruction/comparisons/`.

## 2. Benchmarki pełnoekranowe

### Builder procesu

| Pole         | Wynik                                                  |
| ------------ | ------------------------------------------------------ |
| Referencja   | `ChatGPT Image 26 lip 2026, 18_28_24.png`, 1448 × 1086 |
| Render       | `actual/builder-1448x1086.png`                         |
| Overlay      | `comparisons/builder-overlay-50.png`                   |
| Difference   | `comparisons/builder-difference.png`                   |
| Side-by-side | `comparisons/builder-reference-left-actual-right.png`  |

Overlay potwierdza rail 78 px, topbar 85 px oraz granice kolumn przy `x≈438`
i `x≈1019`. Centralna karta preview ma 464 px szerokości; jej lewa krawędź
różni się od referencji o około 3 px, a górna krawędź pokrywa się przy
`y≈255`. Po renderach skorygowano box sizing, stałą wysokość topbara,
szerokość pola nazwy, wysokość karty i pionowy rytm inspektora.

Świadome odstępstwa:

- realny szablon ma 8 kroków zamiast 14 pytań z przykładu;
- builder operuje na liniowej liście i deklaratywnych regułach, nie na
  node-canvasie wykluczonym z MVP;
- `Cofnij` przywraca początkowy draft, `Podgląd` przełącza tryb, a split
  publikacji wykonuje realne `save` i `publish`;
- inspector pokazuje pola wspierane przez `FlowDocument`, a nie nieistniejący
  osobny model walidacji.

### Lead operacyjny

| Pole         | Wynik                                                     |
| ------------ | --------------------------------------------------------- |
| Referencja   | `ChatGPT Image 26 lip 2026, 18_25_28.png`, 1448 × 1086    |
| Render       | `actual/lead-detail-1448x1086.png`                        |
| Overlay      | `comparisons/lead-detail-overlay-50.png`                  |
| Difference   | `comparisons/lead-detail-difference.png`                  |
| Side-by-side | `comparisons/lead-detail-reference-left-actual-right.png` |

Rail, topbar, outer padding, szerokość głównej kolumny i prawy panel
sprzedażowy mieszczą się w tolerancji 2–6 px względem geometrii referencji.
Dokument ma analogiczną hierarchię: kontakt → zakres → trzy fakty → pliki →
dopasowanie, a prawy panel zawiera status, notatki i aktywność. Zamknięte
pozostałe odpowiedzi przeniesiono do menu w nagłówku zakresu, dzięki czemu nie
przesuwają kolejnych modułów. Topbar odtwarza cofnięcie, podgląd, menu i split
statusu prawdziwymi linkami kotwiczącymi i kanałami kontaktu.

Świadome odstępstwa:

- brak opiekuna, następnego kroku, kalendarza i źródła, ponieważ tych pól nie
  ma w modelu i autoryzacji;
- pierwszy testowy lead ma rzeczywisty załącznik w prywatnym lokalnym Storage,
  a pozostałe pokazują prawdziwy empty state;
- wynik, score, przyczyny, zgody i historia pochodzą z serwera.

## 3. Pozostałe ekrany desktop

| Ekran / route                       | Viewport i render                             | Porównanie                                                               | Wynik i poprawki                                                        |
| ----------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Dashboard `/panel/[organizationId]` | 1536 × 1024, `actual/dashboard-1536x1024.png` | `dashboard.png`, `comparisons/dashboard-reference-left-actual-right.png` | cztery KPI, pionowy trend z dat leadów, ring jakości i gęsta lista      |
| Leady `/leady`                      | poprzedni render 1536 × 1024                  | załącznik rozmowy L, 816 × 592                                           | jedna powierzchnia, search + CTA, 5 filtrów, 7 kolumn i 8 wierszy       |
| Analityka `/analityka`              | 1536 × 1024, `actual/analytics-1536x1024.png` | `analytics.png`, `comparisons/analytics-reference-left-actual-right.png` | KPI, pionowy trend i ring jak w cropie; niżej realny lejek i breakdown  |
| Procesy `/procesy`                  | 1536 × 1024, `actual/processes-1536x1024.png` | plansza produktu                                                         | rzeczywiste drafty, wersje i link do edytora                            |
| Szablony `/szablony`                | 1536 × 1024, `actual/templates-1536x1024.png` | plansza produktu                                                         | pięć prawdziwych szablonów i działająca akcja utworzenia draftu         |
| WordPress `/integracje/wordpress`   | 1536 × 1024, `actual/wordpress-1536x1024.png` | `integrations.png`                                                       | zwarty settings shell, działający token single-use, status i revocation |
| Prywatność `/prywatnosc`            | 1536 × 1024, `actual/privacy-1536x1024.png`   | `company-settings.png`, `notification-settings.png`                      | ograniczona szerokość, owner-only formularz; bez martwych preferencji   |

Po audycie usunięto 404 generowane przez prefetch nieistniejącego `/kontakt`;
skrót Pomoc prowadzi teraz do istniejącego `/jak-dziala`. Kontrola konsoli i
odpowiedzi sieciowych jest zielona.

Załącznik L nadpisuje wcześniejszy crop i porównanie tylko dla listy leadów.
Poprzedni plik `actual/leads-1536x1024.png` nie jest dowodem wizualnym nowej
korekty. Wbudowana przeglądarka nie była dostępna, dlatego nie zapisano
pozornego aktualnego renderu ani overlay; techniczny gate pozostaje osobny.

Załącznik rozmowy M nadpisuje również wcześniejszy benchmark pełnego dokumentu
operacyjnego wyłącznie dla szczegółów leada. Poprzednie pliki
`actual/lead-detail-*` pozostają artefaktami historycznymi, nie dowodem nowej
korekty. Nowa struktura zachowuje dane i operacje, ale wymaga świeżego renderu
oraz overlay przed ponownym wizualnym PASS.

## 4. Responsive

| Viewport   | Rendery                                                                                                                                 | Wynik                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 390 × 844  | `dashboard-390x844.png`, `leads-390x844.png`, `lead-detail-390x844.png`, `builder-preview-390x844.png`, `builder-inspector-390x844.png` | dolna nawigacja, lista zamiast tabeli i task-focused builder bez poziomego scrolla          |
| 430 × 932  | `dashboard-430x932.png`, `builder-preview-430x932.png`                                                                                  | zachowany rytm i safe-area przy szerszym telefonie                                          |
| 768 × 1000 | `dashboard-768x1000.png`, `builder-inspector-768x1000.png`                                                                              | rail przechodzi w dolną nawigację; builder używa jawnych trybów zamiast skalowania desktopu |

Pierwszy render mobilny wykazał nakładanie CTA nagłówka na treść. Przyczyną
była desktopowa stała wysokość topbara zachowana po przejściu na układ
kolumnowy. Mobile używa teraz `height: auto`; desktop zachowuje referencyjne
85 px.

## 5. Stany i interakcje

- loading i error boundaries istnieją dla dashboardu, leadów, szczegółu
  leada, analityki, procesów, szablonów, buildera, WordPressa i prywatności;
- empty state jest używany dla braku leadów, procesów, połączeń, załączników,
  danych analitycznych i reguł;
- tabela i builder mają dostępne nazwy, natywne formularze i alternatywne
  przyciski przenoszenia pytań;
- test mobilny przełącza `Pytania` / `Podgląd` / `Ustawienia`;
- test desktopowy wykonuje rzeczywisty zapis i publikację nowej immutable
  wersji procesu;
- axe WCAG A/AA/2.1 AA/2.2 AA: zero naruszeń na chronionej powierzchni;
- brak błędów konsoli, page errors, odpowiedzi HTTP 4xx/5xx i poziomego
  overflow.

## 6. Wynik

Lokalny gate visual QA: **PASS**. Rekonstrukcja odtwarza geometrię, gęstość,
hierarchię i profesjonalny charakter referencji, jednocześnie zachowując markę
Lorum, realne dane, tenant scope, capability checks i ograniczenia MVP.
Ręczny VoiceOver/NVDA i test na fizycznych urządzeniach pozostają bramką
release, nie tej lokalnej rekonstrukcji.

Gate techniczny po rekonstrukcji:

- `pnpm lint`, `pnpm typecheck`, `pnpm test` i `pnpm build`: **PASS**;
- panelowy Playwright z realnym auth i publikacją: **2/2 PASS**;
- Prettier dla wszystkich plików rekonstrukcji: **PASS**;
- repozytoryjne `pnpm format:check`: blokują wyłącznie dwa istniejące,
  równolegle zmieniane pliki marketingowe:
  `app/(marketing)/polityka-prywatnosci/page.tsx` i
  `app/(marketing)/regulamin/page.tsx`. Nie zostały dotknięte w etapie panelu.

## 7. Korekta 12M — jeden sidebar Lorum

**Data:** 2026-07-28  
**Status:** PASS dla wspólnego shella, 18/20

Nowsza decyzja właściciela zachowuje nazwę Lorum i zastępuje historyczny,
route-specific rail 78 px jednym sidebarem dla całego panelu:

- 208 px domyślnie na desktopie;
- 78 px po ręcznym zwinięciu;
- preferencja `lorum:panel-sidebar-collapsed` zawiera wyłącznie ustawienie UI;
- aktualny `Logoicon.svg` oraz nazwa Lorum są identyczne na dashboardzie,
  leadach i pozostałych trasach;
- Enter obsługuje przełącznik, focus jest widoczny, a reduced motion wyłącza
  przejścia;
- przy 390 px sidebar przechodzi w istniejącą dolną nawigację, przełącznik
  desktopowy jest ukryty i nie występuje overflow.

Usunięto warunkowe logo dashboardu oraz selektory
`.panel-app-shell:has(.dashboard-panel) .panel-rail…`. Historyczne benchmarki
raila 78 px powyżej pozostają dowodem stanu `before`, nie aktywnym kontraktem.

Artefakty znajdują się w
`artifacts/visual-qa/12m-panel-shell/sidebar/`: `reference.png`, `before.png`,
`after-v2.png`, `overlay-v2.png`, `difference-v2.png`, pełne finalne rendery
oraz `diff.md`. Pliki v1 usunięto z working tree po zapisaniu decyzji w raporcie
zgodnie z retencją Etapu 12ZD.

Izolowany Playwright sidebara przechodzi 1/1, mobilny scenariusz panelu
przechodzi, a lint, typecheck i testy web są zielone. Etap 12ZD potwierdził
pełne 15/15 E2E panelu na wymuszonym standalone produkcyjnym. Nie osłabiono
CSP ani kontroli błędów konsoli; wcześniejsze komunikaty `eval()` pochodziły
z przypadkowo ponownie użytego `next dev`.

## 8. Korekta 12N — Procesy / Formularze

**Data:** 2026-07-29  
**Status:** PASS, 19/20

Źródłem jest dokładny crop `925,82,328,310` z
`references/product-app-board.png`. Poprzednia sześciokolumnowa tabela
rozciągała dane na całą szerokość, pokazywała techniczne slugi, dokładną
godzinę i powieloną ikonę edycji. Nowy widok zachowuje anatomię referencji:

- pięć zwartych wierszy w jednej lekkiej powierzchni;
- nazwa i realne metadane po lewej, status oraz data po prawej;
- Aktywny/Nieaktywny zamiast technicznego rozróżnienia draftu;
- cały wiersz jest dostępnym linkiem do prawdziwego buildera;
- brak tabelowego nagłówka, poziomego scrolla i danych wymyślonych z makiety;
- 66,4 px wysokości wiersza, 8 px przerwy i 82 px oddechu po ostatnim rekordzie
  przy 1536 × 1024;
- minimalistyczny tytuł 12,8 px oraz CTA `+ Nowy proces` 100 × 28 px wewnątrz
  powierzchni, bez osobnego topbara;
- powierzchnia 1280 px wykorzystuje pełny workspace 1328 px z marginesem 24 px;
- przy 390 × 844 dane przechodzą do dwóch kolumn, a wspólny sidebar pozostaje
  istniejącą dolną nawigacją.

Loading, empty i error state korzystają z tej samej powierzchni. Izolowany
Playwright sprawdza desktop, mobile, pięć linków, Enter, brak starej tabeli,
overflow oraz axe WCAG A/AA/2.1 AA/2.2 AA.

Artefakty znajdują się w `artifacts/visual-qa/12n-process-list/`. Overlay
normalizuje samą listę do rozmiaru cropa, natomiast wspólny sidebar, tytuł i
działające CTA są oceniane na pełnych renderach. Pliki
`after-v2-production-*` potwierdzają brak developmentowego portalu błędu.
Historyczny znacznik na renderach dev pochodzi z wcześniej udokumentowanego
konfliktu React `eval()` ze ścisłym CSP; produkcyjnego CSP nie poluzowano.

## 9. Korekta 12O — pełna szerokość szczegółów leada

**Data:** 2026-07-29  
**Status:** PASS

Limit 1120 px został usunięty. Dokument szczegółów ma teraz tę samą geometrię
co ekran Procesy: 1280 px w workspace 1328 px, przy 24 px marginesu. Panel
wyniku skaluje się do 916 px, a prawa kolumna notatek i statusu do 419 px.
Typografia operacyjna wzrosła z 9–10 px do 11–13 px.

Na mobile dokument ma pełne 370 px przy viewport 390 px. Wynik i prawa kolumna
mają 344 px, a trzy materiały korzystają z elastycznej siatki zamiast stałych
82 px. Usunięto 32 px poziomego overflow. Axe wykrył po pierwszym renderze
trzy zbyt jasne kolory; wszystkie zostały przyciemnione i końcowy test WCAG
przechodzi bez naruszeń.

Artefakty before/reference/after/overlay/difference znajdują się w
`artifacts/visual-qa/12o-lead-detail-responsive/`.

## 10. Korekta 12P — zwarta biblioteka szablonów

**Data:** 2026-07-29  
**Status:** PASS, 19/20

Źródłem anatomii jest crop `1250,82,272,305` z
`references/product-app-board.png`. Plansza pokazuje wąski moduł 2 × 2, lecz
nowsza decyzja właściciela wymaga wykorzystania pełnej trasy przez pięć
mniejszych kart w jednym rzędzie.

Stan przed korektą miał topbar 1328 × 85 px, cztery kolumny po 308 px, obrazy
120 px i samotną piątą kartę w drugim rzędzie. Po korekcie:

- powierzchnia ma 1280 px w workspace 1328 px;
- pięć kart ma wspólne `y=89,5`, około 240 px szerokości i 253 px wysokości;
- wszystkie obrazy mają 92 px wysokości;
- tytuł ma 12,8 px i znajduje się wewnątrz powierzchni;
- zniknęły „Biblioteka procesów” i osobny topbar;
- nazwa, pytania, reguły oraz działające `Użyj szablonu` pozostały widoczne;
- mobile używa poziomych kart, a 390 i 320 px mają zero overflow.

Overlay pełnej powierzchni ma świadomą różnicę liczby kolumn wynikającą z
nowszej instrukcji właściciela. Produkcyjny Playwright sprawdza pięć kart
w jednym rzędzie, geometrię obrazów, działające kontrolki, desktop, 390 px,
320 px i axe WCAG A/AA/2.1 AA/2.2 AA.

Artefakty znajdują się w `artifacts/visual-qa/12p-template-library/`.

## 11. Korekta 12R — rozwinięta analityka w stylu dashboardu

**Data:** 2026-07-29  
**Status:** PASS, 19/20

Źródłem anatomii górnego regionu jest crop `22,397,484,225` z
`references/product-app-board.png`. Nowsza decyzja właściciela wymaga
zachowania stylu dashboardu i rozwinięcia widoku o pełny zestaw przekrojów,
dlatego plansza blokuje KPI, wykres i donut, a dalsze moduły rozwijają ten sam
system powierzchni.

Po korekcie:

- wspólny topbar ma 78 px, a cztery KPI po 309 × 118 px przy 1536 × 1024;
- stopki wszystkich KPI pokazują prawdziwy trend względem poprzedniego okresu;
- średnia wycena i średni score korzystają tylko z leadów wybranego okresu;
- wykres 30 dni ma 30 kolumn i tę samą jasną zieleń co dashboard;
- donut jakości ma legendę wysokich, średnich i niskich leadów;
- lejek pokazuje liczby i procenty jako cztery połączone etapy;
- score używa bąbli, a źródła i urządzenia 40-polowych wykresów kafelkowych;
- drop-off korzysta z kart diagnostycznych, a wersje z małych pierścieni
  ukończenia; dolne regiony nie zawierają natywnych pasków `progress`;
- dolny desktopowy podział ma 884 px dla drop-off i 374 px dla wersji;
- rzeczywiste linki 7/30/90 dni zmieniają okres; wariant 7 dni renderuje
  siedem kolumn;
- przy 390 px karty mają 361 px, układają się w jedną kolumnę i nie powodują
  overflow; to samo potwierdzono przy 320 px;
- produkcyjny axe nie raportuje naruszeń.

Overlay before/after obrazuje zmianę rytmu, trendów i rozszerzenie analityki.
Side-by-side cropa produktu z górnym regionem implementacji pokazuje zgodność
hierarchii przy świadomie większej szerokości pełnej trasy. Artefakty znajdują
się w `artifacts/visual-qa/12r-analytics-dashboard-style/`.

Po korekcie właściciela zapisano dodatkowe
`lower-charts-before-left-after-right.png`, `lower-charts-overlay-v2.png`
i `lower-charts-difference-v2.png`. Porównanie obejmuje wyłącznie dolny region,
ponieważ duży wykres i donut zostały zaakceptowane bez dalszych zmian.

## 12. Etap 12W — finalna geometria profesjonalnego buildera

**Data:** 2026-07-29  
**Status:** PASS, 19/20

Zablokowany obraz buildera został porównany 1:1 przy 1448 × 1086 ze zwiniętym
wspólnym sidebarem Lorum. Produkcja trafia w geometrię referencji:

- rail 78 px i toolbar 85 px;
- lista pytań 360 px, preview 582 px, inspektor 428 px;
- centralna karta 464 px przy Y 255,14 px;
- granice regionów X: 78 / 438 / 1020 / 1448 px;
- zero poziomego overflow.

Po rozwinięciu sidebara do 208 px trzy regiony otrzymują 320 / 560 / 360 px.
Inspektor kończy się dokładnie na prawej krawędzi zamiast być maskowany przez
`overflow: hidden`. Toolbar używa kolumny `max-content` dla realnych akcji,
dlatego nazwa, status zapisu i publikacja nie nachodzą na siebie.

Przy dostępnej szerokości poniżej 77 rem builder przechodzi na trzy jawne
widoki zadaniowe. Tablet zachowuje cztery elementy każdego wiersza opcji
w jednej linii; mobile ma toolbar 61 px, cele co najmniej 44 px i kartę
350 px z marginesem 20 px. Cofnij/Ponów pozostają prawdziwymi operacjami
dostępnymi w menu publikacji.

Artefakty znajdują się w
`artifacts/visual-qa/12w-builder-geometry/`: natywna referencja, stany
`before`, rendery produkcyjne collapsed/expanded, tablet/mobile, overlay 50%,
difference, side-by-side i `diff.md`. Playwright potwierdza
320/375/390/430/724/768/1024/1280/1448/1536 px, długie polskie treści,
reflow odpowiadający 200% zoom, klawiaturę, axe i brak overflow.

## 13. Etap 12X — porządkowanie i walidacja buildera

**Data:** 2026-07-29  
**Status:** PASS, 19/20

Etap zachowuje geometrię 12W i dodaje wyłącznie brakujące interakcje robocze.
Pytania mają natywne przeciąganie z linią miejsca upuszczenia. Ta sama
operacja domenowa obsługuje `Alt+ArrowUp/ArrowDown` i menu „wyżej/niżej”,
dlatego kolejność, zmiana sekcji i usunięcie pustej sekcji są identyczne
niezależnie od metody wejścia. Fokus wraca na przeniesione pytanie, a wynik
jest ogłaszany przez `aria-live`.

Inspektor pokazuje istniejące walidacje tekstu, liczby/budżetu i daty. Błąd
ma summary, znacznik na pytaniu oraz programatyczne powiązanie z kontrolką.
Dokument niespełniający schematu nie trafia do autosave, natomiast poprawny
szkic z błędem grafu może zostać zapisany, ale nie opublikowany.

Artefakty w `artifacts/visual-qa/12x-builder-interactions/` obejmują reference,
before, czysty render produkcyjny, stan błędu, tablet, mobile, overlay,
difference, side-by-side oraz `diff.md`. Playwright potwierdza 1448/768/390 px,
mysz, klawiaturę, fokus, axe i brak overflow. Łączny odbiór autosave,
geometrii i interakcji przeszedł 3/3.
