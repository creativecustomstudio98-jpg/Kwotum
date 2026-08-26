# Visual QA Kwotum

**Status:** kanoniczny  
**Ostatni przegląd:** 2026-08-26

Ten dokument opisuje procedurę odbioru wizualnego. Nie przechowuje historii
każdej iteracji; wynik etapu należy zapisać w jego własnym `diff.md`, a aktywne
referencje w `ui/REFERENCE_MANIFEST.md`.

## Przebieg

Dla każdego wdrażanego ekranu albo wydzielonego regionu:

1. wskaż dokładny obraz, region, SHA-256 i viewport;
2. odróżnij instrukcję wizualną od demonstracyjnej treści obrazu;
3. zapisz render `before` z tej samej platformy i przeglądarki;
4. wdroż wyłącznie zakres bieżącego etapu;
5. zapisz `after-v1` i porównanie;
6. wypisz dziesięć największych różnic;
7. popraw kompletność, geometrię, typografię, spacing, gęstość i stany;
8. zapisz finalny `after`, porównanie, reprezentatywny mobile i `diff.md`;
9. uruchom layout, dostępność, testy, build i budżety właściwe dla ryzyka;
10. dopiero po przeglądzie zaktualizuj zaakceptowany baseline.

Bez overlay albo difference nie ma wizualnego PASS. Obraz pokazany pod kątem,
ucięty lub w zbyt małej rozdzielczości może sterować kierunkiem, ale nie jest
podstawą pixel diffu 1:1.

## Punktacja

Ekran otrzymuje po 0–4 punkty za:

- kompletność regionów;
- geometrię i proporcje;
- typografię i spacing;
- gęstość danych oraz stany;
- transformację mobile.

Minimum akceptacji to 18/20. Kompletność, geometria, gęstość danych ani mobile
nie mogą otrzymać 0. Wynik automatyczny nie zastępuje przeglądu właściciela.

## Blokady

- brak krytycznej referencji w natywnym rozmiarze;
- martwa albo atrapowa kontrolka;
- utrata semantyki, fokusu lub obsługi klawiaturą;
- overflow maskowany CSS-em;
- tekst funkcjonalny poniżej 12 px;
- fikcyjny KPI, klient, wynik, integracja lub SLA bez jawnego trybu demo;
- rozszerzenie zakresu poza `SCOPE.md`;
- regresja tenant scope, RLS, capabilities, prywatności lub kalkulacji
  serwerowej;
- porównywanie renderów z różnych platform jako pixel-perfect;
- brak stanu loading, empty, error albo permission tam, gdzie jest wymagany.

## Minimalny zestaw artefaktów

Artefakty robocze trafiają do:

```text
artifacts/visual-qa/<scope>/<stage>/<screen>/
  canonical-reference.txt albo reference.png
  before.png
  after.png
  overlay-50.png albo difference.png
  mobile-390x844.png
  diff.md
```

`diff.md` zapisuje:

- route i chroniony stan;
- referencję, region, SHA-256 oraz rolę;
- viewport, platformę, przeglądarkę i skalę;
- wynik 20-punktowy;
- dziesięć głównych różnic i świadome odstępstwa;
- testy klawiatury, axe, forced colors, reduced motion, zoom i overflow;
- wpływ na dane, bezpieczeństwo, prywatność i wydajność;
- kryterium rollbacku.

Artefakty nie zastępują snapshotów E2E ani testów funkcjonalnych.

## Retencja

Przed zamknięciem etapu zachowujemy:

- jedną kanoniczną referencję albo plik wskazujący jej ścieżkę i SHA-256;
- jeden stan `before`;
- jeden finalny `after`;
- jedno odpowiadające porównanie;
- jeden reprezentatywny mobile, jeśli ma osobny układ;
- jeden raport `diff.md`.

Pośrednie iteracje, powtarzalne cropy, debug output i binarnie identyczne kopie
należy usunąć po przeniesieniu decyzji do raportu. Wyjątek musi mieć opis w
`diff.md`. Snapshoty Playwright pozostają w `tests/e2e/__screenshots__/`.

## Powtarzalność między platformami

- aplikacja korzysta z lokalnych fontów; test nie może zależeć od CDN ani
  fontu systemowego runnera;
- baseline Playwright powstaje na tej samej platformie, na której będzie
  zatwierdzany;
- kanoniczny Linux CI pozostaje przypięty do wersji obrazu i Playwrighta
  wskazanych w workflow;
- różnic rasteryzacji nie naprawiamy przez zwiększenie tolerancji;
- najpierw potwierdzamy font, viewport, wersję przeglądarki, skalę i geometrię;
- nowy baseline wymaga side-by-side review, nie tylko zielonego joba.

## Macierz wspólna

Jeżeli kontrakt etapu nie zawęża zakresu, sprawdzamy:

- 320 × 800;
- 375 × 812;
- 390 × 844;
- 430 × 932;
- 768 × 1024;
- 1024 × 768;
- 1280 × 800;
- 1440 × 900;
- 1536 × 1024;
- 200% zoom lub odpowiadający mu reflow;
- długie polskie treści;
- klawiaturę, reduced motion i forced colors.

Nie wolno stosować `transform: scale()` jako transformacji responsive ani
`overflow-x: hidden` jako naprawy geometrii.

## Panel administracyjny — Minimal V1

Jedynym aktywnym kontraktem panelu jest
`ui/panel-minimal-v1/README.md`, a jedynymi aktywnymi obrazami są dwa pliki
w `ui/panel-minimal-v1/reference/`, zablokowane w
`ui/REFERENCE_MANIFEST.md`. Poprzednie referencje i artefakty panelu zostały
wycofane na mocy ADR-049.

Artefakty kolejnych etapów M1–M10 trafiają do:

```text
artifacts/visual-qa/panel-minimal-v1/<stage>/<screen>/
```

Główne porównanie shellu i dashboardu powstaje przy 1440 × 900 oraz
1536 × 1024. Pomocnicza referencja 404 × 316 służy wyłącznie do oceny kierunku
typografii, zakładek i oszczędnego użycia koloru.

Etap M0 nie zmienia runtime i nie otrzymuje wyniku podobieństwa. Jego gate to:

- dwa nowe obrazy z poprawnym rozmiarem i SHA-256;
- brak aktywnych odwołań do starych referencji panelu;
- skonsolidowany plan M0–M10;
- zielony baseline modeli nawigacji, typecheck web i `git diff --check`;
- udokumentowana możliwość odzyskania usuniętego materiału.

## Inne aktywne powierzchnie

- landing desktop: `ui/landing-desktop-v7/`;
- landing mobile: `ui/landing-mobile-v1/`;
- podstrony marketingowe: `ui/marketing-subpages-v1/`;
- auth: `apps/web/public/ekranylogowania.png` oraz
  `ui/AUTH_REFERENCE_ANALYSIS_2026-07-27.md`;
- marka: `ui/kwotum-brand-v2/README.md`.

Ich obrazy nie sterują panelem. Historyczne wyniki pozostają w raportach
zakresowych lub historii Git i nie są duplikowane w tym dokumencie.

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

## Etap 12ZN — finalny wybór organizacji Kwotum

- zakres: `/panel` po uwierzytelnieniu;
- referencja: 1536 × 1024, SHA-256
  `572cb0009eb74051e97c37578ae9b11bbfa5c3c1381140272874380852eb1810`;
- kontrakt: header 80 px, intro 484 px, lista 932–935 px, search 376 × 50 px,
  nagłówek listy 62 px i wiersz 111 px;
- dane: wyłącznie aktywne członkostwa, organizacje i ostatnia aktywność
  dostępne przez uwierzytelnionego klienta oraz RLS;
- mobile: 390 × 844, karta zachowująca kolejność DOM, maksymalnie 1 px
  tolerancji overflow i axe bez naruszeń;
- artefakty: `artifacts/visual-qa/12zn-organization-picker/`;
- wynik: **PASS, 19/20**; osobnej referencji mobile nie dostarczono.

E2E dodatkowo sprawdza działający submit wyszukiwarki, pusty wynik i href
wiersza. Fikcyjne dane z obrazu nie mogą być kopiowane dla zmniejszenia diffu.

## Etap 12ZO — pojedyncza powierzchnia biblioteki szablonów

- zakres: zewnętrzny kontener `/panel/[organizationId]/szablony`;
- źródło korekty: zaakceptowany zrzut produkcji 3338 × 1962 px, SHA-256
  `b3ebc842faab96619ee12a562638ee4bd2f53a417bae53f5e1d29b6850e90ff6`;
- kontrolny desktop: 2048 × 1220; mobile: 390 × 844;
- kontrakt: `.template-library-surface` jest przezroczysty, bez obramowania i
  cienia; toolbar, KPI, karty i detal zachowują własne powierzchnie;
- stany loading i error dziedziczą ten sam płaski kontener;
- artefakty: `artifacts/visual-qa/12zo-template-surface-hotfix/`.

Ta korekta nadpisuje starszą referencję 12ZC-T wyłącznie w regionie
zewnętrznej karty. Nie zmienia jej kontraktu funkcjonalnego ani wewnętrznej
geometrii biblioteki.

## Etap 12ZP — spokojniejsza typografia panelu

- zakres: desktopowy sidebar oraz stan małej próby na
  `/panel/[organizationId]/analityka`;
- źródło korekty stanu pustego: zaakceptowany crop produkcji 1136 × 456 px,
  SHA-256
  `1b90189a221d164a2e9ea92d141ec5d0cfdff1c50c2a8383d553c94eb8903070`;
- pomiar `before`: karta 968 × 226 px, `.wy-state` bez poziomego insetu,
  nagłówek 18,72 px, opis 16 px i maksymalna szerokość 544 px;
- kontrakt `after` desktop: inset 32 px, minimum 176 px, etykieta 12/500,
  nagłówek 16/600, opis 14/400 o `max-width: 736px`, bez wewnętrznego
  `border-block`;
- kontrakt `after` mobile: inset 24 px i naturalna wysokość;
- sidebar: marka 600, etykiety grup i aktywna pozycja 500, organizacja,
  pozycje zwykłe, utilities i opis organizacji 400;
- bez zmian: 256/72 px, 48 px wiersza, ikony, kolory, active clip-path,
  routing, focus, persistence i dolna nawigacja mobile;
- artefakty: `artifacts/visual-qa/12zp-panel-typography/`;
- automatyczny gate: Playwright 2/2, desktop 1536 × 1024, mobile 390 × 844,
  computed styles, build produkcyjny i cleanup tenanta bez pozostałości.

Render stanu pustego w teście jest kontrolowaną powierzchnią QA z tym samym
markupem `StateContent` i produkcyjnym CSS. Fixture analityki celowo zawiera
wystarczającą próbę, więc sonda nie zmienia danych ani progu prywatności.

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

## Etap 12ZE — self-service pricing, scoring i wynik

- zakres: trzy nowe obszary istniejącego buildera procesu;
- referencja geometrii: builder 1448 × 1086 z 12W, SHA-256
  `918e0d8edfdb02d899310e61b36bcf25618bd1a761bf62809fb9927d4a68a526`;
- artefakty: `artifacts/visual-qa/12ze-self-service-estimation/`;
- wynik: **PASS, 19/20**; kompletność 4, geometria 4, typografia 4, gęstość 4,
  transformacja mobile 3;
- desktop zachowuje shell i trzy kolumny 12W, a mobile używa osobnych zakładek
  obszaru oraz `Reguły / Podgląd / Ustawienia`;
- prywatny scoring nie jest pokazany w publicznym preview, a włączenie wyceny
  wymaga jawnych kwot zamiast syntetycznej rekomendacji biznesowej.

Playwright publikuje działającą konfigurację, sprawdza dialog zależności,
autosave, undo, klawiaturę, cele 44 px, axe, overflow, 1448 × 1086,
390 × 844, reflow i forced colors przy 320 × 800. Pełny produkcyjny zestaw
przechodzi 18/18 z cleanupem syntetycznego tenanta 0. Brak osobnej referencji
mobile pozostawia transformację na 3/4; overlay desktop ocenia shell i osie,
ponieważ źródło nie zawierało edytora estymacji.

## Etap 12ZF — webhook v1

- zakres: `/panel/[organizationId]/integracje/webhooki`;
- źródło anatomii: ekran Integracji 12S 1536 × 1024, SHA-256
  `208f8d84508909fee0c5baed36c6ce773b8fee4d64dd0d1e406a14754c8c8296`;
- artefakty: `artifacts/visual-qa/12zf-webhook-v1/`;
- wynik: **PASS, 19/20**; kompletność 4, geometria 4, typografia 4, gęstość 4,
  transformacja mobile 3;
- desktop 1448 × 1086 pokazuje realną konfigurację, one-time secret i stany
  delivered/retry/dead-letter, bez payloadu, response body ani PII;
- mobile 390 × 844 i reflow 320 × 800 nie mają overflow, kontrolki mają minimum
  44 px, a rotacja i wyłączenie wymagają potwierdzenia.

Playwright przechodzi 19/19 na produkcyjnym standalone, axe nie zgłasza
naruszeń desktop/mobile, a cleanup pozostawia 0 rekordów syntetycznego tenanta.
Overlay 50% oraz difference ×3 obejmują pełny desktop. Źródło 12S określa
anatomię integracji, nie treść webhooka; brak osobnej referencji mobile
pozostawia transformację na 3/4. Szczegółową listę różnic zapisuje `diff.md`.

## Etap 12ZK — ustawienia dostawy nowych leadów

- zakres: karta `Dostawa nowych leadów` na
  `/panel/[organizationId]/ustawienia`;
- źródło anatomii: zaakceptowany ekran ustawień 12S 1536 × 1024, SHA-256
  `af0e83d101f559587ba060072a20a56429102fcca4606001685c88f40f135766`;
- artefakty: `artifacts/visual-qa/12zk-contact-delivery-settings/`;
- wynik: **PASS, 19/20**; kompletność 4, geometria 4, typografia 4, gęstość
  i stany 3, transformacja mobile 4;
- desktop zachowuje istniejącą oś i szerokość kart, a mobile 390 × 844 składa
  etykietę, pole, opis i działającą akcję do jednej kolumny bez overflow;
- dostęp do karty i zapisu mają wyłącznie Owner/Admin; Sales nie otrzymuje
  danych konfiguracyjnych ani kontrolki.

Izolowany scenariusz produkcyjnego standalone przechodzi 1/1, axe nie zgłasza
naruszeń, a cleanup pozostawia 0 rekordów syntetycznych. Pełny bieżący E2E jest
blokowany przez równoległy Etap 12ZL na niezwiązanym ekranie wyboru organizacji;
szczegóły, difference i kryteria odbioru zapisuje `diff.md`.

## Podetap 13B / FTZ-03A — originy publicznego formularza

- zakres: karta `Dozwolone domeny` i spójność dolnej powierzchni instalacji na
  `/panel/[organizationId]/procesy/[flowId]/instalacja`;
- referencja języka panelu: zaakceptowany szczegół leada 1536 × 1024 z 12O;
  stan `before-template-redesign.png` został odrzucony jako zbyt generyczny;
- artefakty: `artifacts/visual-qa/13b-ftz03a-public-guard/`;
- wynik: **PASS, 19/20**; kompletność 4, geometria 4, typografia 4, gęstość
  i stany 4, transformacja mobile 3;
- desktop 1536 × 1024 używa jednej powierzchni z pionowym podziałem, sekcjami
  liniowymi i płaskimi statusami zamiast zestawu kart SaaS;
- mobile 390 × 844 składa etykietę, textarea i akcję w jedną kolumnę bez
  poziomego overflow.

Izolowany scenariusz produkcyjnego standalone przechodzi 1/1, axe nie zgłasza
naruszeń, a cleanup pozostawia 0 rekordów syntetycznych. Ten sam test potwierdza
zapis dwóch originów po reloadzie, exact CORS, odmowę obcej witryny, preflight
oraz `429` z `Retry-After`. `reference.png`, `after.png`, overlay 50% i
difference obejmują zmieniony region przy identycznym płótnie;
`redesign-before-after.png` dokumentuje usunięcie generycznego układu kart, a
pełny mobilny render ma 390 × 3622 px. Szczegółowe różnice zapisuje `diff.md`.

## Podetap 13B / FTZ-03B — adaptacyjny Turnstile

- zakres: mobilny stan finalnego submitu po wygaśnięciu tokenu;
- źródło języka: zaakceptowany widget 12S, lokalny `reference.png`, SHA-256
  `b2893072a81ada2c8b27fb7c2ee754d0c67bb77b28e36705caf3301704bc41c9`;
- artefakty: `artifacts/visual-qa/13b-ftz03b-turnstile/`;
- wynik: **PASS, 19/20**; kompletność 4, geometria 4, typografia 4, gęstość i
  stany 3, transformacja mobile 4;
- viewport 390 × 844 zapisuje pełny formularz 390 × 1437 bez poziomego
  overflow, utraty pól i stale widocznej karty CAPTCHA;
- komunikat wygaśnięcia ma `role=alert`, zachowuje dane i prowadzi do tej samej
  działającej akcji, która pobiera nowy token.

Pełny `widget.spec.ts` przechodzi 4/4 na mobile i desktop wraz z axe,
klawiaturą, forced colors, hostile host CSS oraz retry. Stub providera
potwierdza zero wywołań submit po wygasłym tokenie i dokładnie jeden submit po
drugim tokenie. Rzeczywista interaktywna ramka pozostaje elementem UAT na
docelowych hostach Cloudflare.

## Finalny sidebar Kwotum P1

- zakres: wspólny desktopowy sidebar i reakcja app shellu;
- referencja: `docs/ui/sidebar-kwotum-p1/reference/sidebar-kwotum.png`,
  863 × 1822 px, SHA-256
  `ea188a170b984ae7554d94baefd62913175e657d9bfd0595ad7a02d321efbe87`;
- kontrolne viewporty: 1440 × 1024, 1280 × 800, 1024 × 768 i mobile
  390 × 844;
- geometria: dokładnie 256 px rozwinięty i 72 px zwinięty, 100dvh oraz brak
  poziomego overflow;
- dostępność: klawiatura, tooltipy, Escape z powrotem fokusu, reduced motion i
  izolowany axe WCAG A/AA;
- wynik: **PASS, 19/20**; szczegóły i jawne odstępstwo krótkiego viewportu
  zapisuje `docs/ui/sidebar-kwotum-p1/VISUAL_QA_REPORT.md`.

## Etap 12ZR — tenantowe centrum pomocy

- zakres: `/panel/[organizationId]/pomoc` i mikroregion drugorzędnych akcji na
  `/panel/[organizationId]/leady/[leadId]`;
- referencja kompozycyjna Pomocy: zaakceptowany shell panelu P1 oraz płaska
  anatomia istniejących ekranów ustawień i powiadomień z
  `artifacts/visual-qa/12s-remaining-screens/after/`;
- referencja mikroregionu leada: crop użytkownika 880 × 128 px, SHA-256
  `bc03fb4756dc2764acb4188e8116e1b73febac7bbad4178f3227bddafc0aa231`;
- kontrolne viewporty: 1536 × 1024 i 390 × 844;
- artefakty: `artifacts/visual-qa/12zr-help-center/` oraz
  `artifacts/visual-qa/12o-lead-detail-responsive/after-production-*.png`;
- wynik: **PASS, 19/20**; kompletność 4, hierarchia i geometria 4, typografia
  4, gęstość 4, transformacja mobile 3;
- automatyczny gate: wyszukiwanie, klawiatura, capability-filter unit,
  `aria-live`, native accordion, axe A/AA, brak poziomego overflow i środek
  ikony względem tekstu ≤ 1 px.

Pomoc nie ma jednej zaakceptowanej referencji pixel-perfect. Ocena nie używa
fałszywego RMSE: odnosi hierarchię do dwóch wskazanych, istniejących ekranów
panelu, a kompletność do rzeczywistych tras i capabilities. Mobile otrzymuje
3/4, ponieważ jest udokumentowaną transformacją bez osobnego obrazu
referencyjnego. Pierwszy audyt wykrył niewystarczający kontrast dwóch drobnych
etykiet; po korekcie ponowny axe zakończył się bez naruszeń.
