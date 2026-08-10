# Visual QA Kwotum

**Status:** kanoniczny  
**Ostatni przegląd:** 2026-07-29

## Przebieg

Dla każdego wdrażanego ekranu albo sekcji:

1. wybierz dokładny obraz i viewport z `ui/REFERENCE_MANIFEST.md`;
2. zapisz `before`;
3. wdroż wyłącznie zakres bieżącego etapu;
4. zapisz `after-v1` i overlay;
5. wypisz dziesięć największych różnic;
6. popraw geometrię, gęstość i typografię;
7. zapisz `after-v2`, overlay i diff;
8. uruchom layout, a11y, testy, build i budżety;
9. dopiero wtedy aktualizuj zaakceptowany baseline.

Brak overlay oznacza brak wizualnego PASS.

## Punktacja

Ekran otrzymuje po 0–4 punkty za:

- kompletność regionów;
- geometrię i proporcje;
- typografię i spacing;
- gęstość danych oraz stany;
- transformację mobile.

Minimum akceptacji to 18/20. Kompletność, geometria, gęstość danych ani mobile
nie mogą otrzymać 0.

## Blokady

- brak krytycznej referencji w natywnym rozmiarze;
- martwa lub atrapowa kontrolka;
- utrata semantyki albo obsługi klawiaturą;
- overflow maskowany CSS-em;
- tekst proofu poniżej 12 px;
- fikcyjne KPI, testimonial, klient lub wynik bez oznaczenia demo;
- rozszerzenie zakresu poza `SCOPE.md`;
- regresja tenant scope, RLS, prywatności lub serwerowej kalkulacji.

## Artefakty

Artefakty robocze trafiają do `artifacts/visual-qa/<stage>/<screen>/`:

```text
reference.png
before.png
after-v1.png
overlay-v1.png
after-v2.png
overlay-v2.png
diff.md
```

Nie zastępują snapshotów E2E. Do raportu końcowego trafiają użyty viewport,
wynik 20-punktowej oceny, znane odchylenia, komendy i wyniki testów.

### Retencja po zamknięciu etapu

Pełny katalog roboczy nie jest automatycznie artefaktem release. Przed
commitem należy zachować minimalny, audytowalny zestaw:

- zablokowaną referencję albo jej kanoniczną ścieżkę i SHA-256;
- jeden stan `before`;
- zaakceptowany finalny `after`;
- odpowiadający mu `overlay` lub `difference`;
- reprezentatywny finalny mobile, jeżeli ekran ma osobny układ mobilny;
- `diff.md` z viewportem, oceną, odchyleniami i wynikiem testów.

Pośrednie `after-vN`, wielokrotne cropy, outputy debugowania i binarnie
identyczne kopie należy usunąć po przeniesieniu istotnych wniosków do raportu.
Wyjątek wymaga wpisania w `diff.md`, jaką decyzję dokumentuje dodatkowy plik.
Snapshoty Playwright pozostają w `tests/e2e/__screenshots__/`; outputy skryptów
`artifacts/redesign/` są odtwarzalne i celowo niewersjonowane.

### Powtarzalność snapshotów między platformami

- aplikacja dostarcza własny Inter variable; test wizualny nie może zależeć od
  fontu z CDN ani od fontów systemowych runnera;
- Playwright zapisuje aktywne baseline'y w
  `tests/e2e/__screenshots__/{platform}/`, obecnie `darwin` i `linux`;
- baseline aktualizuje się na tej samej platformie, na której ma być
  zatwierdzony; obrazu z innego systemu nie kopiuje się jako zamiennika;
- kanoniczny Linux CI to przypięty obraz
  `mcr.microsoft.com/playwright:v1.61.0-noble`; zmiana obrazu albo wersji
  Playwright lub jego zapisanego w workflow digestu wymaga osobnego visual
  review;
- różnic rasteryzacji nie naprawia się zwiększeniem tolerancji. Najpierw należy
  potwierdzić font, viewport, wersję przeglądarki i rzeczywistą geometrię;
- przy niepowodzeniu CI należy przejrzeć dołączony `playwright-report` i trace,
  a nowy baseline zaakceptować dopiero po side-by-side review.

## Ostatni wynik — Etap 12F, landing board 2

- zakres: wyłącznie `/`, sekcje `client-demo` i `process-fit`;
- referencje: `lorum-board-2-desktop.png` 1536 × 1710 oraz
  `lorum-board-2-mobile.png` 390 × 3053;
- artefakty: `artifacts/visual-qa/12f-board-2/desktop/` i `mobile/`;
- wynik: 18/20; kompletność 4, geometria 3, typografia 3, gęstość 4,
  transformacja mobile 4;
- dodatkowe viewporty: 1440, 1024, 768, 390 i 320 px bez overflow;
- znane odchylenie: implementacja jest wyższa od natywnego boardu z powodu
  istniejących chapter markers, rytmu rozdziałów i tekstu proofu ≥12 px.

Kontrolki demo, linki oraz tablist są aktywne. Dane pozostają syntetyczne,
jawnie oznaczone i nie są zapisywane ani wysyłane.

## Ostatni wynik — Etap 12J, ikony i region porównania pod hero

- zakres: wyłącznie `/`, sekcje `data-strip`, `industry-templates-overview`
  oraz `comparison-and-process`;
- nadrzędna referencja: najnowszy załącznik rozmowy H;
- artefakty: `artifacts/visual-qa/12j-icons-comparison-process/`;
- hero, pasek danych, szablony i porównanie mają wspólną oś: na 2048 px
  `x=79,9`, `width=1888,3`; na 1440 px `x=56,2`, `width=1327,7`;
- podział desktopowego porównania: 57,5% / 42,5%;
- viewporty 2048, 1440, 1024, 768, 390 i 320 px bez overflow i bez przecięcia
  głównych regionów;
- pięć kafli prowadzi do istniejących tras branżowych, bez atrap działań;
- ikony mają liniowy zielony znak w jasnej, okrągłej oprawie.

Załącznik H nie ma lokalnego oryginału, dlatego wynik nie podaje pozornego RMSE.
Zachowane odchylenie tekstowe to aktywna marka Kwotum zamiast historycznego
Wyceno widocznego w źródle.

## Etap 12K — auth Kwotum, status QA

- lokalna referencja: `apps/web/public/ekranylogowania.png`, 1536 × 1024;
- nowsze rozstrzygnięcie: każdy ekran auth wypełnia pierwszy viewport z
  delikatną białą oprawą; bez paska marki i podpisu planszy;
- trasy `/logowanie` i `/rejestracja` odpowiadają HTTP 200;
- HTML obu tras nie zawiera sloganu planszy ani Microsoftu i zawiera wyłącznie
  właściwą akcję Google;
- dwie ilustracje 1024 × 1536 z kanałem alfa pokazują rzeczywiste elementy
  buildera, leadów i konfiguracji organizacji;
- pass gęstości K ogranicza kontrolki do 46–56 px i korzysta z nowych adresów
  `auth-*-product-v2.png`, aby przeglądarka nie zachowała starszych brył;
- 38/38 testów web przechodzi, w tym walidacja auth, bezpieczny redirect i
  semantyka cookie sesyjnego;
- lokalny podgląd przeglądarkowy nie był dostępny w sesji, dlatego nie zapisano
  `after`, overlay ani diff i nie przyznano pozornego score.

Powyższy akapit zachowuje stan historycznego passu 12K. Etap 12S zastąpił jego
otwarty gate pełną macierzą czterech powierzchni auth: produkcyjne rendery
1536 × 1024 i 390 × full, klawiatura, axe, reduced motion, forced colors,
reflow i brak overflow przechodzą. Aktualne obrazy znajdują się w
`artifacts/visual-qa/12s-remaining-screens/after/`. Nie przypisuje się wstecz
pozornego score passowi bez overlay; obowiązującym dowodem jest późniejszy
gate 12S oraz `tests/e2e/auth.spec.ts`.

## Najnowsza korekta — lista leadów

- zakres: wyłącznie `/panel/[organizationId]/leady`;
- nadrzędna referencja: najnowszy załącznik rozmowy L, 816 × 592;
- ekran używa jednej białej powierzchni z lekkim cieniem, wyszukiwaniem i
  działającym linkiem „Nowy lead” do opublikowanego formularza;
- filtry są zgrupowane do pięciu pozycji, tabela ma kolumny Klient, Usługa,
  Wynik, Budżet, Termin, Status i Data oraz osiem wierszy na stronę;
- usługi, terminy, budżety, wyniki i statusy pochodzą z lokalnych danych
  tenantowych; paginacja i wyszukiwanie są serwerowe;
- załącznik L nie ma lokalnego pliku źródłowego, dlatego nie przypisano mu
  sztucznego SHA-256 ani pozornego wyniku overlay.

Do wizualnego PASS nadal wymagany jest nowy render przeglądarkowy oraz overlay;
wbudowana przeglądarka nie była dostępna podczas tej korekty.

## Najnowsza korekta — szczegóły leada

- zakres: wyłącznie `/panel/[organizationId]/leady/[leadId]`;
- nadrzędna referencja: najnowszy załącznik rozmowy M, 794 × 578;
- ekran ma kompaktowy profil, kartę score z trzema rzeczywistymi powodami,
  cztery kotwicowe zakładki i podsumowanie w układzie treść + obsługa;
- podsumowanie pokazuje usługę, zakres, budżet, termin, lokalizację i realne
  materiały z prywatnego Storage;
- notatka, zmiana statusu i rozpoczęcie obsługi wykonują istniejące server
  actions; odpowiedzi, pliki i historia pozostają dostępne przez zakładki;
- loading i error state korzystają z tej samej powierzchni.

Załącznik M nie ma lokalnego oryginału. Nowy render i overlay pozostają
wymagane przed przyznaniem wizualnego PASS.

## Etap 12Q — autorski landing 3D

- zakres: wyłącznie `/`;
- dyspozycja: tekstowy kierunek właściciela z 2026-07-29, bez nowego obrazu
  referencyjnego;
- hero: trzy code-native telefony 3D pokazujące zapytanie → proces → gotowy
  lead;
- kolejne regiony: mobilne ekrany branżowe, ciemny rozdział porównania,
  zachowane interaktywne demo i wspólna perspektywa proofów;
- artefakty: `artifacts/visual-qa/landing-3d-redesign/`;
- viewporty: 1440 × 1000, 1024 × 900, 768 × 1000, 390 × 844 i 320 × 844;
- ocena briefu: 19/20; kompletność 4, geometria 4, typografia 4, gęstość 3,
  mobile 4.

Brak nowego obrazu nie pozwala przyznać pixel-perfect PASS ani RMSE. Overlay
porównuje świadomy redesign z lokalnym stanem `before`. Test marketingowy
potwierdza minimum 12 px w proofach, brak overflow, klawiaturę, axe, no-JS,
reduced motion, forced colors, SEO i budżet JavaScriptu.

## Etap 12V — stan profesjonalnego buildera

- zakres: cykl edycji `/panel/[organizationId]/procesy/[flowId]`, bez finalnej
  korekty geometrii;
- zablokowana referencja: `apps/web/public/panel/ChatGPT Image 26 lip 2026,
18_28_24.png`, 1448 × 1086;
- zmienione regiony: status zapisu, Cofnij/Ponów, menu ręcznego zapisu,
  funkcjonalne zamknięcie inspektora i osobna akcja usunięcia pytania;
- dowód manualny:
  `artifacts/visual-qa/12v-builder-state/manual/builder-state-1280x720.png`;
- manualny test zalogowanej aplikacji potwierdził autosave, undo/redo, konflikt
  dwóch kart, brak force overwrite, jawne wczytanie serwera, przywrócenie
  fixture’u i zero poziomego overflow przy dostępnym viewportcie 1280 × 720;
- pełny test Playwright 1448 × 1086 jest warunkowy na
  `PANEL_E2E_EDITOR_FLOW_ID` oraz pozostałe `PANEL_E2E_*`.

Etap 12V nie otrzymuje wizualnej punktacji ani pixel-perfect PASS, ponieważ
świadomie nie zmienia finalnej geometrii referencji. Overlay, diff i macierz
1448/768/390 należą do Etapu 12W. Gate 12V dotyczy poprawności stanu,
bezpieczeństwa zapisu i dostępności kontrolek.

## Etap 12W — finalna geometria buildera

- zakres: `/panel/[organizationId]/procesy/[flowId]`;
- referencja: `apps/web/public/panel/ChatGPT Image 26 lip 2026,
18_28_24.png`, 1448 × 1086, SHA-256
  `918e0d8edfdb02d899310e61b36bcf25618bd1a761bf62809fb9927d4a68a526`;
- artefakty: `artifacts/visual-qa/12w-builder-geometry/`;
- wynik: **19/20**; kompletność 4, geometria 4, typografia 4, gęstość 4,
  transformacja mobile 3;
- pomiar zwiniętego wariantu: rail 78 px, toolbar 85 px, kolumny
  360 / 582 / 428 px, karta preview 464 px przy Y 255,14 px;
- pomiar rozwiniętego wariantu: 208 px sidebar i kolumny 320 / 560 / 360 px,
  inspektor kończy się na 1448 px bez poziomego overflow;
- tablet i mobile używają jawnych trybów Pytania / Podgląd / Ustawienia,
  a wiersz opcji zachowuje drag handle, radio, elastyczny input i usunięcie
  w jednej linii;
- mobile skraca etykietę publikacji, a prawdziwe Cofnij/Ponów pozostają
  dostępne klawiaturą w menu publikacji.

Korekta shellu Kwotum z 2026-08-03 zastępuje wyłącznie rozwiniętą szerokość
sidebara: 240 px zamiast historycznych 208 px. Rail zwinięty pozostaje 78 px,
a minimalny kontrakt szerokości preview buildera przy 1448 px wynosi 527 px.
Artefakty i raport korekty znajdują się w
`artifacts/visual-qa/12m-panel-shell/sidebar-kwotum-glass/` oraz
`PANEL_SIDEBAR_GLASS_2026-08-03.md`.

## Korekta 12M-Y — wybór organizacji Kwotum

- zakres: `/panel` po uwierzytelnieniu;
- referencja: zaakceptowany załącznik 2872 × 1608 px, SHA-256
  `783b30ceadefada2a5841af73c1b5334cb672f10723e555a53309d929975f133`;
- kontrolny desktop: 2048 × 1152, header 101–104 px, kontener 1258–1262 px,
  karta 230–236 px, avatar 76–80 px i akcje minimum 59 px wysokości;
- mobile: 390 × 844, jedna kolejność DOM, trzy metadane, dwie widoczne akcje
  i maksymalnie 1 px tolerancji overflow;
- dane: wyłącznie rzeczywiste count/head oraz ostatnie timestampy dostępne
  przez aktywne członkostwo i RLS; liczby z obrazu nie są kopiowane;
- artefakty:
  `artifacts/visual-qa/12m-panel-shell/organization-picker-kwotum/`.

Playwright sprawdza 320/375/390/430/724/768/1024/1280/1448/1536 px, długie
polskie treści, reflow odpowiadający 200% zoom, brak kolizji topbara, cele
dotykowe, keyboard i axe. Overlay potwierdza wspólne osie głównych paneli;
różnice treści wynikają z realnego procesu i nowszej decyzji o marce Kwotum.
Oddzielnej referencji mobile nie dostarczono, dlatego nie przyznano pełnych
4 punktów za pixel fidelity transformacji mobilnej.

## Etap 12X — interakcje i walidacja buildera

- zakres: kolejność pytań i inspektor walidacji na
  `/panel/[organizationId]/procesy/[flowId]`;
- referencja i geometria: bez zmian względem 12W, 1448 × 1086;
- artefakty: `artifacts/visual-qa/12x-builder-interactions/`;
- wynik: **PASS, 19/20**; kompletność 4, geometria 4, typografia 4, gęstość 4,
  transformacja mobile 3;
- desktop pokazuje uchwyt przeciągania, wskaźnik upuszczenia, zwięzłe summary
  błędów i programatycznie powiązany komunikat pola;
- tablet mieści dwie granice walidacji bez overflow; mobile zachowuje cele
  44 px oraz jawne akcje „wyżej/niżej” zamiast uzależniać obsługę od gestu;
- czysty render produkcyjny zachowuje granice 78 / 438 / 1020 / 1448 px
  z 12W, a stan błędu nie przesuwa kolumn ani centralnej karty.

Playwright sprawdza natywne przeciągnięcie, `Alt+ArrowUp`, zachowanie fokusu,
`aria-live`, zatrzymanie autosave dla odwróconych granic, blokadę publikacji,
przywrócenie poprawnego szkicu, 1448/768/390 px, axe i brak poziomego
overflow. Overlay i difference obejmują pełny desktop; różnice tekstowe
wynikają z innego syntetycznego procesu, dlatego gate geometrii opiera się
również na niezmienionym teście 12W.

## Etap 12Z — zarządzanie sekcjami buildera

- zakres: lewa kolumna sekcji i pytań
  `/panel/[organizationId]/procesy/[flowId]`;
- referencja: builder 1448 × 1086 z 12W, SHA-256
  `918e0d8edfdb02d899310e61b36bcf25618bd1a761bf62809fb9927d4a68a526`;
- artefakty:
  `artifacts/visual-qa/12z-builder-sections/`;
- wynik: **PASS, 19/20**; kompletność 4, geometria 4, typografia 4, gęstość 4,
  transformacja mobile 3;
- desktop pokazuje działające `+ Sekcja`, zwijanie, numer, licznik i menu,
  a osobne stany dokumentują inline rename oraz modalne usunięcie
  z przeniesieniem pytań;
- czysty render produkcyjny zachowuje osie 78 / 438 / 1020 / 1448 px, toolbar
  85 px i nie przesuwa centralnej karty ani inspektora;
- tablet 768 × 1024 oraz mobile 390 × 844 używają trybu Pytania, celów
  dotykowych co najmniej 40–44 px i nie mają poziomego overflow.

Playwright tworzy sekcję z pierwszym pytaniem, zmienia nazwę, zwija i rozwija,
przenosi `Alt+ArrowDown`, sprawdza `aria-live` i fokus, anuluje dialog,
potwierdza bezpieczne przeniesienie oraz przez undo przywraca fixture.
Desktop i mobile przechodzą axe. Overlay oraz difference obejmują cały desktop;
różnice treści wynikają z realnego syntetycznego flow, a brak osobnej
referencji mobile pozostawia transformację na 3/4. Izolowany zalogowany
scenariusz przechodzi 1/1; kanoniczny zestaw produkcyjny przechodzi 34/34
z 14 warunkowymi pominięciami bez danych panelu.

## Etap 12ZA — sortowanie opcji odpowiedzi buildera

- zakres: lista opcji aktywnego pytania w prawym inspektorze
  `/panel/[organizationId]/procesy/[flowId]`;
- referencja: builder 1448 × 1086 z 12W, SHA-256
  `918e0d8edfdb02d899310e61b36bcf25618bd1a761bf62809fb9927d4a68a526`;
- artefakty: `artifacts/visual-qa/12za-builder-options/`;
- wynik: **PASS, 19/20**; kompletność 4, geometria 4, typografia 4, gęstość 4,
  transformacja mobile 3;
- desktop zachowuje inspektor x=1019, szerokość 429 px, drobny uchwyt, radio,
  elastyczny input i usunięcie w jednym wierszu;
- tablet 768 × 1024 i mobile 390 × 844 pokazują jawne menu wyżej/niżej/usuń,
  więc obsługa dotykowa nie zależy od HTML5 DnD;
- otwarte menu ukrywa przykryte wyzwalacze z drzewa interakcji i przechodzi
  regułę WCAG 2.2 target-size bez maskowania overflow.

Playwright wykonuje DnD, `Alt+ArrowUp`, menu dotykowe, undo/redo i autosave,
sprawdza powrót fokusu, `aria-live`, 1448/768/390 px, axe oraz overflow.
Izolowany scenariusz produkcyjny przechodzi 1/1, a pełny sekwencyjny zestaw
49/49. Crop, overlay 50% i difference obejmują inspektor 429 × 700 px.
Różnice treści wynikają z 3 opcji realnego syntetycznego flow wobec 4 pozycji
w obrazie źródłowym; osie, pola i rytm listy pozostają zgodne. Brak osobnej
referencji mobile utrzymuje transformację na 3/4.

## Podetap 12W-N — biała nawigacja mobilna panelu

- zakres: wspólny shell `/panel/[organizationId]` przy 320–768 px, bez zmiany
  desktopowego sidebara;
- źródło: zaakceptowana referencja rozmowy `reference.png`, 390 × 844;
- stan przed: ciemnozielony, poziomo przewijany pasek z nadmiarem pozycji;
- stan końcowy: biała, nieprzewijana nawigacja Start / Leady / Procesy /
  Analityka / Więcej oraz modalny arkusz dolny;
- zachowanie zadaniowe: pasek jest ukryty na szczególe leada, w builderze
  i podczas instalacji procesu;
- artefakty: `artifacts/visual-qa/12w-mobile-navigation/`;
- ocena: 19/20; kompletność 4, geometria 4, typografia i ikony 3,
  gęstość 4, transformacja mobile 4.

Overlay ocenia wyłącznie region nawigacji, ponieważ treść dashboardu i dane
referencji nie są identyczne. „Więcej” nie ma osobnego obrazu źródłowego;
zostało ocenione przez kompletność realnych funkcji, hierarchię, cele dotykowe,
safe area, klawiaturę, focus trap, Escape i axe. Playwright potwierdza brak
poziomego overflow przy 320/390/430/768 px. Izolowany scenariusz nawigacji
przechodzi 1/1, a kanoniczny E2E 34/34 dostępnych testów z 10 warunkowymi
testami panelu pominiętymi bez `PANEL_E2E_*`.

## Podetap 12ZC-T — rozbudowana biblioteka szablonów

- zakres: `/panel/[organizationId]/szablony`;
- referencja: `ChatGPT Image 29 lip 2026, 20_09_10.png`, 1448 × 1086,
  SHA-256
  `7078cfed148b3734ae1ed40fa92b4161d222641bdb97ca6f30b1b8d6c7885ec1`;
- artefakty: `artifacts/visual-qa/12zc-template-library-override/`;
- wynik: **PASS, 19/20**; kompletność 4, geometria 4, typografia 4, gęstość 4,
  transformacja mobile 3;
- desktop 1448 × 1086 pokazuje pięć kart w jednym rzędzie, toolbar 80 px,
  trzy KPI i pełny dolny podgląd;
- obrazy kart mają proporcję 1,7:1 zamiast panoramicznego rozciągnięcia
  i zachowują zakres 1,65–1,75 także przy 390 px;
- liczby 5 / 5 / 6,8, pytania, reguły, sekcje i spis pytań pochodzą z realnych
  `flowTemplates`; nie zaimplementowano nieistniejących w produkcie danych
  `12`, `68%`, importu ani własnego szablonu.

Playwright sprawdza wyszukiwanie, kategorię, wybór podglądu klawiaturą,
rozwinięcie pytań, axe i brak poziomego overflow przy 1448 × 1086,
390 × 844 oraz 320 × 800. `reference-vs-after.png`, `overlay-50.png`
i `difference-x3.png` obejmują pełny desktop. Różnice treści i części ikon
wynikają z realnego zakresu produktu, dlatego transformacja mobile pozostaje
na 3/4 bez osobnej referencji telefonu. Pełny E2E ma 47/49: test tego ekranu
przechodzi, a dwa niezależne niepowodzenia pozostają w builderze i analityce.
