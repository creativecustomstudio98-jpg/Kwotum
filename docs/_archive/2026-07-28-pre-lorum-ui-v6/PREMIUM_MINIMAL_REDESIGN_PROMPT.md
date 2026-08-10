# Master prompt v2 — kompletny premium minimalistyczny redesign Wyceno

> **ARCHIVED — nie jest źródłem prawdy.** Zastąpiony przez:
> `CODEX_MASTER_PROMPT.md` oraz aktywny kontrakt UI wskazany w
> `docs/INDEX.md`.

## Status i sposób użycia

Ten dokument jest briefem wykonawczym do osobnego etapu redesignu interfejsu.
Nie oznacza rozpoczęcia Etapu 13 ani zgody na publikację. Przed implementacją
należy wybrać ten redesign jako zamknięty etap w `docs/TASKS.md`, opisać gate i
wykonać pełną procedurę z `AGENTS.md`.

Materiały referencyjne wygenerowane dla tego kierunku:

- `/images/redesign/wyceno-premium-product-concept.webp` — kompozycja hero i
  docelowa relacja kwalifikacji do briefu;
- `/images/redesign/inquiry-to-brief-line-illustration.webp` — lekki motyw
  liniowy do sekcji procesu albo logowania.

## Prompt do wykonania

### 0. Tryb pracy — działasz jak doświadczony zespół produktowy

Nie działaj jak generator landing page’y ani jak pojedynczy frontend developer.
Przeprowadź redesign tak, jak zrobiłby to doświadczony zespół tworzący
profesjonalne narzędzie B2B:

- **Product strategist** pilnuje problemu użytkownika, hierarchii komunikatów i
  zgodności każdej sekcji z rzeczywistą funkcją produktu.
- **Creative director** odpowiada za jeden rozpoznawalny język wizualny,
  proporcje, rytm, napięcie kompozycji i usuwanie wszystkiego, co wygląda jak
  szablon lub grafika AI.
- **Senior product designer** projektuje realne zadania, ekrany, stany i
  zależności informacji, a nie kolekcję efektownych kart.
- **Design systems designer** utrzymuje tokeny, typografię, siatkę, komponenty,
  ikonografię i spójność marketingu, panelu, logowania oraz widgetu.
- **UX writer** skraca treści, usuwa slogany i pilnuje konkretnego języka
  decyzji.
- **Senior frontend engineer** implementuje wygląd jako responsywne,
  semantyczne komponenty produkcyjne bez psucia logiki i kontraktów.
- **Accessibility specialist** kontroluje WCAG 2.2 AA, klawiaturę, focus,
  reflow, reduced motion i komunikację stanów.
- **Performance/SEO engineer** pilnuje Server Components, LCP, CLS, budżetu
  JavaScript, obrazów, metadata, crawl i indeksacji.
- **QA lead** wykonuje testy funkcjonalne, wizualne i regresyjne na wszystkich
  kluczowych powierzchniach.

Każda rola wykonuje własny review, ale rezultat musi być jednym spójnym
projektem. Creative director i product designer odrzucają każdą sekcję, która
wygląda jak:

- wynik promptu „modern SaaS landing page”;
- gotowy template z biblioteki UI;
- zestaw równo ułożonych kart z ikonami;
- efektowna grafika bez związku z działaniem Wyceno;
- dekoracyjny dashboard z fikcyjnymi wykresami;
- przypadkowe połączenie popularnych trendów Dribbble.

Przebuduj warstwę wizualną Wyceno w kierunku premium, minimalistycznego SaaS
B2B. Zachowaj całą istniejącą logikę biznesową, bezpieczeństwo, tenant
isolation, autoryzację, routing, SEO, semantykę, dostępność i kontrakty testowe.
Redesign nie może tworzyć atrap, nieaktywnych kontrolek, fałszywych danych,
opinii, logotypów klientów ani statystyk.

#### Obowiązkowy proces przed napisaniem kodu

1. Przeczytaj `AGENTS.md`, `docs/TASKS.md`, dokumentację produktu, designu,
   marketingu, architektury, dostępności, bezpieczeństwa i SEO.
2. Sprawdź `git status` i zachowaj wszystkie niezwiązane zmiany.
3. Uruchom bazowe testy dla aktualnego stanu.
4. Zrób inwentaryzację wszystkich publicznych stron, panelu, logowania,
   hosted flow, widgetu, design systemu oraz stanów systemowych.
5. Wykonaj screenshoty przed zmianą przynajmniej w 1440, 1024 i 390 px.
6. Wskaż powtarzalne wzorce „AI/template”: identyczne karty, nadmiar radiusów,
   badge’y, przypadkowe ikony, zbyt wiele ramek, słabą hierarchię i
   niewiarygodne mockupy.
7. Przygotuj tekstowy wireframe każdej powierzchni oraz listę komponentów do
   zachowania, przebudowy i usunięcia.
8. Zapisz krótki plan, ryzyka i mierzalny gate redesignu w `docs/TASKS.md`.
9. Nie rozpoczynaj następnego etapu i nie publikuj aplikacji.

Nie zaczynaj od losowej zmiany CSS. Najpierw ustal całą architekturę wizualną,
a dopiero potem wdrażaj ją konsekwentnie od fundamentów.

### 1. Oczekiwany efekt

Interfejs ma sprawiać wrażenie spokojnego, precyzyjnego i kosztownego w
wykonaniu, ale nie luksusowego w modowym znaczeniu. Premium ma wynikać z
proporcji, typografii, światła, rytmu, jakości hierarchii i konsekwencji, a nie
z ozdobników.

Pierwsze wrażenie:

- bardzo dużo kontrolowanej, ciepłej białej przestrzeni;
- duży, czytelny komunikat wartości;
- produkt pokazany jako główny dowód, nie jako mała dekoracyjna karta;
- głęboka zieleń używana oszczędnie do prowadzenia uwagi;
- cienkie linie, małe promienie narożników i niemal niewidoczne cienie;
- brak wizualnego hałasu, przypadkowych kart i generycznego dashboardu;
- spokojny marketing oraz informacyjnie gęsty, lecz uporządkowany panel B2B.

Inspiracje należy interpretować, a nie kopiować. Docelowy interfejs ma być
oryginalnym systemem Wyceno opartym o ideę:

> Nieuporządkowane pytanie klienta przechodzi przez prowadzoną kwalifikację i
> staje się uporządkowanym briefem gotowym do następnego działania.

#### Wierność przesłanym referencjom

Referencje definiują cechy, które muszą być widoczne w finalnym projekcie:

- duża, jasna płaszczyzna z delikatnym ciepłym odcieniem;
- niemal architektoniczna siatka i dużo pustej przestrzeni;
- głęboko zielony, bardzo wąski rail panelu;
- duży panel leada z cienkimi podziałami zamiast wielu unoszących się kart;
- mały moduł kwalifikacji wizualnie połączony z dużym briefem;
- czytelne grupy: kontakt, zakres, budżet, termin, lokalizacja, załączniki,
  dopasowanie, status i następny krok;
- czarny, redakcyjny nagłówek landingu po lewej i produkt jako duży dowód po
  prawej;
- oszczędne statusy, małe promienie, lekkie linie i bardzo subtelne cienie;
- interfejs wyglądający jak narzędzie pracy, a nie reklama aplikacji.

Nie kopiuj danych ani układu piksel w piksel. Zachowaj jednak poziom ciszy
wizualnej, proporcje produktu do tekstu i dyscyplinę kompozycji. Jeżeli finalny
screenshot obok referencji wygląda bardziej kolorowo, bardziej „kartowo”,
bardziej zaokrąglono albo bardziej dekoracyjnie, projekt jest nieudany i wymaga
poprawy.

### 2. Zasady nienegocjowalne

1. Funkcja jest ważniejsza od dekoracji.
2. Jeden ekran ma mieć jeden oczywisty punkt ciężkości.
3. Produkt jest bohaterem landingu.
4. Zieleń sygnalizuje porządek, gotowość, ukończenie i akcję. Nie oznacza
   ekologii, finansów ani „wzrostu”.
5. Stan nie może być komunikowany wyłącznie kolorem.
6. Każda kontrolka wygląda jak kontrolka i naprawdę działa.
7. Cena i score pozostają opisane jako orientacyjne oraz wyjaśnialne.
8. Kompozycja musi działać od 320 px do szerokiego desktopu bez poziomego
   przewijania.
9. Nie zmieniaj kolorów ani geometrii lokalnie w aplikacji. Wszystkie decyzje
   przekrojowe wprowadź w `packages/ui`.
10. Jeżeli redesign wymaga zmiany zatwierdzonych tokenów albo architektury,
    najpierw dodaj ADR w `docs/DECISIONS.md`.

### 3. Kierunek artystyczny

#### Kolor

Punktem wyjścia są aktualne tokeny:

- tło: `#F5F6F2`;
- powierzchnia: `#FFFFFF`;
- powierzchnia pomocnicza: `#EEF1ED`;
- główny tekst: `#17201D`;
- tekst drugorzędny: `#58645F`;
- mocna zieleń: `#123D2C`;
- akcent sukcesu: `#39D98A`;
- linie: przygaszona szarozieleń zgodna z systemem.

Dominować mają off-white, biel i grafit. Głęboka zieleń może zajmować około
5–12% typowego ekranu. Jasna zieleń ma występować punktowo: check, status,
progress lub krótki znacznik. Nie stosuj dużych jaskrawozielonych powierzchni.

Nie używaj gradientów jako efektu. Dopuszczalne jest wyłącznie bardzo subtelne,
niemal niewidoczne światło tła, bez kolorowych przejść.

#### Typografia

- użyj jednej współczesnej rodziny sans-serif o neutralnym, redakcyjnym
  charakterze;
- nagłówki mają być czarne lub niemal czarne, mocne, ale nie groteskowo ciężkie;
- hero desktop: około 64–80 px, `line-height` 0.98–1.06, ciasny tracking;
- hero mobile: około 40–48 px z naturalnym łamaniem;
- nagłówki sekcji: około 40–56 px na desktopie i 30–38 px na mobile;
- tekst prowadzący: 18–22 px, maksymalnie 55–65 znaków w wierszu;
- treść produktu: 13–16 px z wyraźną różnicą między etykietą i wartością;
- liczby, ID, daty i ceny powinny korzystać z cyfr tabelarycznych;
- nie nadużywaj wersalików; eyebrow ma być krótki i dyskretny;
- nie centruj długich akapitów.

Hierarchia ma pozostać czytelna również po usunięciu kolorów.

#### Geometria i powierzchnie

- główny kontener marketingowy: około 1280–1440 px;
- landing desktop: 12-kolumnowa siatka i szerokie marginesy;
- podstawowy rytm pionowy sekcji: 112–160 px;
- wewnętrzne odstępy dużych powierzchni: 24–40 px;
- border: 1 px, jasny i spokojny;
- promień kontrolek: 6–8 px;
- promień dużych paneli: 10–14 px;
- żadnych wszechobecnych kart z identycznym radius i cieniem;
- cień tylko dla powierzchni, która faktycznie leży nad inną powierzchnią;
- maksymalnie jeden subtelny cień warstwowy na głównym widoku produktu;
- przyciski są zwarte i prostokątne, bez gigantycznych pigułek.

### 4. Landing page — nowa architektura

Landing ma być jedną zaplanowaną opowieścią, a nie zbiorem niezależnych sekcji.
Każdy kolejny fragment odpowiada na następne pytanie użytkownika:

1. Co Wyceno robi?
2. Jak wygląda efekt?
3. Jak powstaje uporządkowany lead?
4. Co dokładnie dostaje firma?
5. Jak działa wdrożenie?
6. Czy rozwiązanie jest bezpieczne i wiarygodne?
7. Jaki jest następny krok?

Nie powtarzaj układu `eyebrow + nagłówek + trzy karty` w kolejnych sekcjach.
Na całym landing page mogą wystąpić maksymalnie dwa miejsca z regularną siatką
kart i tylko wtedy, gdy dane naprawdę wymagają porównania.

#### Nawigacja

Zaprojektuj niski, lekki header. Logo po lewej, maksymalnie 4–5 głównych
linków, „Zaloguj się” jako akcja drugorzędna i jedno główne CTA. Tło ma być
ciepłobiałe, z cienką linią lub subtelnym efektem po scrollu. Nie buduj ciężkiej
belki aplikacyjnej.

Na mobile użyj prawdziwego, dostępnego menu z poprawną obsługą fokusu, Escape,
aria-expanded i blokadą przewijania wyłącznie w czasie otwarcia.

#### Hero

Desktop ma być asymetryczny:

- lewa kolumna zajmuje około 34–40%;
- prawa kolumna z produktem zajmuje około 60–66%;
- produkt może delikatnie wychodzić poza standardową siatkę, lecz nie viewport;
- wysokość hero powinna sprawiać wrażenie pełnego pierwszego ekranu bez
  wymuszania stałego `100vh`.

Proponowany przekaz:

**Eyebrow:** `Kwalifikacja zapytań dla firm usługowych`

**H1:** `W kilka sekund wiadomo, czy i jak obsłużyć zapytanie.`

**Lead:** `Wyceno porządkuje odpowiedzi, ocenia dopasowanie według ustalonych
zasad i wskazuje kolejny krok.`

**CTA główne:** `Zobacz działający proces`

**CTA drugorzędne:** `Przejdź do panelu demo` — tylko jeżeli istnieje prawdziwy,
bezpieczny tryb demo. W przeciwnym razie użyj istniejącego, działającego celu.

Pod tekstem mogą znaleźć się maksymalnie trzy krótkie korzyści z prostymi
ikonami liniowymi:

- `Mniej powtarzalnych pytań`;
- `Lepsza priorytetyzacja leadów`;
- `Jasny następny krok`.

Prawa strona hero nie może być przechyloną kartą formularza. Zbuduj duży,
code-native widok produktu odpowiadający realnemu panelowi:

- wąski ciemnozielony rail;
- niewielki moduł kwalifikacji z zakresem, budżetem i terminem;
- subtelne połączenie pokazujące przepływ;
- duży brief leada: kontakt, zakres, budżet, termin, lokalizacja, pliki;
- widoczny, wyjaśnialny score `85/100`;
- status `Gotowy do kontaktu`;
- jedna oczywista kolejna akcja.

Widok w hero jest demonstracją i nie może zawierać prawdziwych danych.
Tekst musi być semantycznym HTML, gdy ma być czytany lub indeksowany. Grafika
rastrowa może pełnić rolę nastrojowego materiału referencyjnego, ale finalny
hero należy odtworzyć komponentami HTML/CSS, żeby zachować ostrość,
responsywność, dostępność i wydajność.

Na mobile zmień układ na tekst, CTA i uproszczony widok produktu. Nie próbuj
ściskać pełnego desktopowego dashboardu. Pokaż sekwencyjnie 2–3 najważniejsze
fragmenty albo przesuń szczegóły do dostępnego poziomego obszaru z jasną
etykietą, tylko jeśli testy użyteczności to uzasadnią.

Dokładna kompozycja desktopowa dla 1440 px:

- header około 72–80 px wysokości;
- hero zaczyna się bez wielkiej pustej przerwy pod nawigacją;
- kontener około 1320 px z marginesem minimum 48–60 px;
- blok tekstowy około 440–500 px szerokości;
- `h1` łamany świadomie na 3–4 linie, bez pojedynczego krótkiego słowa w
  ostatnim wierszu;
- lead maksymalnie 520 px szerokości;
- jedna główna akcja i jedna spokojna akcja tekstowa lub obrysowana;
- wizualizacja produktu około 760–860 px szerokości;
- górna krawędź produktu zaczyna się nieco wcześniej niż środek nagłówka, aby
  kompozycja nie wyglądała jak dwie równe kolumny;
- pod hero nie umieszczaj paska przypadkowych logotypów ani statystyk.

Tło hero może mieć delikatną siatkę konstrukcyjną albo miękki cień papieru,
ale efekt powinien być widoczny dopiero po uważnym spojrzeniu.

#### Sekcja „od zapytania do briefu”

Zamiast dwóch generycznych kart pokaż jedną szeroką, liniową transformację:

`„Ile kosztuje?” → pytania → komplet odpowiedzi → gotowy brief`

Każdy etap ma mieć realny przykład danych, nie abstrakcyjny slogan. Na desktopie
sekwencja może być pozioma, na mobile pionowa. Animacja ma jedynie podkreślać
kolejność i działać także bez JavaScriptu.

Użyj wygenerowanego motywu `inquiry-to-brief-line-illustration.webp` wyłącznie
jako referencji. Finalnie odtwórz schemat w lekkim SVG/HTML, jeśli zapewni to
lepszą ostrość i dostępność. Po lewej pokaż realne braki typowego zapytania, a
po prawej konkretne, uporządkowane pola. Nie używaj ogólnego tekstu o
„transformacji biznesu”.

#### Sekcja korzyści

Zbuduj trzy redakcyjne wiersze, nie siatkę identycznych kart. Każdy wiersz:

- krótki numer lub podpis;
- mocny nagłówek korzyści;
- zwięzłe wyjaśnienie;
- mały, code-native detal produktu.

Naprzemiennie ustawiaj tekst i podgląd produktu, zachowując spokojny rytm.

Każdy z trzech wierszy ma mieć inną kompozycję wynikającą z treści:

- **Mniej pytań uzupełniających:** fragment odpowiedzi klienta z kompletem
  danych i brakami jasno oznaczonymi tekstem.
- **Priorytetyzacja bez zgadywania:** score z listą rzeczywistych powodów, bez
  dekoracyjnego wykresu.
- **Następny krok:** status, opiekun i konkretna akcja w jednym spokojnym
  wierszu operacyjnym.

Nie umieszczaj tych korzyści w trzech kartach obok siebie.

#### Sekcja procesu

Pokaż cztery kroki jako jedną oś z czytelnymi numerami `01–04`. Nie umieszczaj
każdego kroku w osobnej unoszącej się karcie. Aktywny krok może uruchamiać
powiązany fragment produktu, ale pełna treść musi być dostępna bez hovera.

#### Funkcje i branże

Nie pokazuj wszystkich elementów w identycznej siatce kart. Wyróżnij 2–3
najważniejsze funkcje większą kompozycją, a pozostałe przedstaw jako prostą
listę z liniami i linkami. Branże potraktuj jako spokojny indeks zastosowań.
Każdy link ma mieć jednoznaczny tekst i widoczny stan focus.

Docelowy układ:

- jedna szeroka sekcja funkcji z dużym fragmentem produktu po jednej stronie i
  pionowym indeksem funkcji po drugiej;
- aktywna funkcja może zmieniać pokazywany fragment, ale całość pozostaje
  dostępna bez JavaScriptu;
- branże jako typograficzna lista w dwóch kolumnach z krótkim opisem i strzałką,
  oddzielona cienkimi liniami;
- bez pięciu identycznych ikon branżowych i kolorowych ilustracji dla każdej
  pozycji.

#### Dowód i wiarygodność

Do czasu zebrania prawdziwych danych nie dodawaj opinii, logotypów,
procentowych wyników klientów ani liczników. Wiarygodność mają budować:

- działające demo;
- widoczna metoda obliczeń;
- prywatność i tenant isolation opisane zwykłym językiem;
- informacja, że wynik jest orientacyjny;
- konkretne stany produktu i następne działania.

#### FAQ i finałowe CTA

FAQ ma być typograficzną listą z cienkimi liniami, nie zestawem ciężkich kart.
Finałowe CTA może użyć dużej głębokozielonej powierzchni, ale zachowaj dużo
wewnętrznego oddechu i jedno główne działanie. Nie używaj gradientu ani
dekoracyjnych blobów.

#### Dokładna kolejność sekcji strony głównej

1. Lekki header.
2. Hero z komunikatem i dużym widokiem produktu.
3. Cienki pasek trzech faktów produktowych, nie statystyk marketingowych.
4. Transformacja „zapytanie → brief”.
5. Duży redakcyjny blok „co widzi firma po przesłaniu formularza”.
6. Trzy naprzemienne korzyści z realnymi detalami interfejsu.
7. Czterostopniowa oś wdrożenia.
8. Wyróżnione funkcje oraz prosty indeks pozostałych.
9. Lista branż bez powtarzalnych kart.
10. Sekcja bezpieczeństwa i uczciwości wyniku.
11. FAQ jako lista.
12. Jedno mocne finałowe CTA.
13. Zwarta stopka z realnymi linkami.

Każda sekcja ma mieć inny rytm wynikający z treści, ale wszystkie korzystają z
tej samej siatki, typografii, linii i palety.

### 4A. Pozostałe strony marketingowe

Nie poprawiaj wyłącznie strony głównej. Zastosuj system do wszystkich 18
indeksowalnych tras, zachowując ich unikalny cel i treść.

#### Produkt

- hero z jasnym opisem kompletnego przepływu;
- jedna duża mapa produktu;
- kolejne moduły jako fragmenty jednego systemu;
- bez katalogu kilkunastu kart funkcji;
- wyraźne granice orientacyjnej wyceny.

#### Jak działa

- pionowa, numerowana narracja od konfiguracji do obsługi leada;
- dla każdego kroku realny fragment produktu;
- jeden wspólny connector lub oś;
- bez czterech osobnych generycznych kart.

#### Cennik

- zachowaj prawdę o modelu pilotażowym;
- jedna spokojna powierzchnia oferty indywidualnej;
- klarowna lista tego, co obejmuje pilotaż;
- bez fikcyjnych planów, przekreślonych cen i sztucznego „najpopularniejszego”
  wariantu.

#### Dla agencji

- pokaż proces agencja → klient → opublikowany formularz;
- uwzględnij separację organizacji i powtarzalność wdrożeń;
- użyj diagramu operacyjnego, nie stockowego zdjęcia zespołu.

#### WordPress

- pokaż realny shortcode, blok, popup i diagnostykę jako jeden spójny proces;
- status dostępności wtyczki musi być prawdziwy;
- nie udawaj marketplace ani aktywnego przycisku pobierania.

#### Huby funkcji i branż

- użyj czytelnego indeksu redakcyjnego;
- elementy różnicuj treścią i hierarchią, nie przypadkowymi kolorami;
- podstrony zachowują wspólny shell, ale dostają indywidualny przykład, zestaw
  pytań i wynik;
- nie duplikuj tego samego hero i tej samej siatki z podmienionymi słowami.

### 5. Panel aplikacji

Panel ma być wizualnym rozwinięciem produktu pokazanego na landingu.

#### Shell

- bardzo wąski, głęboko zielony rail lub zwarta nawigacja boczna;
- logo u góry, narzędzia podstawowe w centrum, konto i pomoc na dole;
- ikony liniowe z tekstowym tooltipem; tooltip nie zastępuje accessible name;
- aktywny element rozpoznawalny przez powierzchnię, ikonę i dodatkowy sygnał;
- zawartość na ciepłobiałym tle, bez morza kart;
- maksymalna szerokość treści dostosowana do ekranów operacyjnych;
- header strony z nazwą widoku, kontekstem organizacji i główną akcją.

Panel desktop ma przypominać przesłane referencje:

- rail około 64–76 px, bez szerokiej tekstowej nawigacji, jeśli ikony i
  dostępne tooltipy wystarczają;
- aktywne narzędzie na subtelnie jaśniejszej zielonej powierzchni;
- główna płaszczyzna prawie biała;
- treść odsunięta od raila o 24–40 px;
- żadnego globalnego gradientu;
- informacje grupowane przez linie, kolumny i whitespace;
- radius paneli około 10–12 px, nie 20–32 px;
- cień tylko na głównej powierzchni lub modalach;
- statusy małe i informacyjne, nie jako dominujące kolorowe pigułki.

#### Lista leadów

Użyj prawdziwej tabeli na desktopie z:

- kontaktem i firmą;
- zakresem;
- budżetem;
- terminem;
- score wraz z etykietą;
- statusem;
- opiekunem;
- datą aktualizacji;
- menu działań.

Zapewnij sortowanie, filtrowanie i paginację zgodne z aktualną logiką.
Nie ukrywaj krytycznych informacji wyłącznie w hover. Na mobile tabela przechodzi
w uporządkowaną listę rekordów z widocznym statusem i najważniejszymi danymi.

#### Szczegóły leada

Układ desktop:

- pasek tytułowy z ID, statusem i jedną główną akcją;
- sekcje kontaktu, zakresu, budżetu, terminu, lokalizacji i plików;
- blok „Powody dopasowania” obok score;
- dolny pasek z opiekunem, statusem i następnym krokiem;
- historia/audyt dostępne, lecz nie dominujące.

Nie rozbijaj każdego pola na osobną kartę. Grupuj informacje przez linie,
odstępy i nagłówki. Score musi zawierać liczbę, nazwę, przyczyny i neutralny
opis. Zielony okrąg nie może być jedynym nośnikiem informacji.

Dokładny wireframe szczegółów leada:

1. Górny wiersz: numer leada, status, menu kontekstowe i główna akcja.
2. Nagłówek: firma lub kontakt, podstawowe dane, ID i daty.
3. Główna siatka: kontakt | zakres | budżet i termin.
4. Drugi wiersz: lokalizacja | załączniki | powody dopasowania.
5. Dolny pas: score i powody | status i komentarz | opiekun | następny krok.
6. Historia poniżej jako spokojna chronologia, domyślnie niedominująca.

Na szerokim ekranie nie przekraczaj 3–4 logicznych kolumn. Linie pionowe i
poziome tworzą strukturę podobną do dokumentu operacyjnego. Nie umieszczaj
dziewięciu osobnych kart z cieniami.

#### Dashboard

Dashboard nie może być kolekcją metryk i fikcyjnych wykresów. Ma odpowiadać na
pytanie: „co wymaga mojej uwagi teraz?”.

- krótki nagłówek z organizacją i zakresem czasu;
- jedna główna kolejka leadów wymagających działania;
- spokojny wiersz najważniejszych realnych wskaźników;
- lista ostatnich zmian lub aktywności;
- wykres tylko wtedy, gdy istnieją prawdziwe dane i działający zakres czasu;
- czytelny empty state nowej organizacji prowadzący do pierwszego procesu.

#### Builder procesu

Builder ma wyglądać jak profesjonalne narzędzie konfiguracji:

- lewy panel: struktura kroków i pytań;
- środek: edycja wybranego elementu;
- prawy panel: prawdziwy podgląd widgetu lub ustawienia kontekstowe;
- jeden stały pasek statusu wersji i publikacji;
- warunki oraz scoring rozwijane progresywnie;
- drag and drop ma alternatywę klawiaturową;
- nie buduj każdej właściwości jako osobnej kolorowej karty.

#### Ustawienia i administracja

- prosta lokalna nawigacja tekstowa;
- formularze o kontrolowanej szerokości;
- ustawienia pogrupowane semantycznymi nagłówkami i liniami;
- strefa niebezpieczna wyraźna, lecz bez czerwonego tła całej sekcji;
- role i członkostwa pokazane w czytelnej tabeli;
- tenant scope widoczny w kontekście, ale nie jako techniczny żargon dla
  użytkownika.

#### Stany wspólne panelu

Zachowaj progressive disclosure. Destrukcyjne działania mają jawne etykiety i
potwierdzenie adekwatne do ryzyka.

Loading, empty i error state projektuj jako integralną część widoku:

- skeleton odwzorowuje realny układ bez migających wielkich bloków;
- empty state mówi, dlaczego jest pusto i podaje realny następny krok;
- błąd wyjaśnia, co się stało i jak spróbować ponownie;
- brak uprawnień nie jest maskowany jako pusty stan.

### 6. Logowanie i onboarding

Logowanie ma być wyjątkowo proste:

- logo i krótki kontekst;
- jedna zwarta powierzchnia formularza;
- poprawne etykiety nad polami;
- widoczne błędy przy polu i komunikat ogólny, jeśli potrzebny;
- działający reset hasła;
- brak dekoracyjnego panelu zajmującego połowę ekranu bez wartości.

Można użyć bardzo subtelnego rysunku liniowego pokazującego przemianę
wiadomości w brief. Rysunek nie może konkurować z formularzem i na mobile może
zostać pominięty.

Onboarding ma prowadzić przez jedną decyzję naraz: organizacja, pierwszy
proces, testowy lead, publikacja. Nie pokazuj pustego dashboardu jako pierwszego
ekranu.

### 7. Widget

Widget ma być lżejszym wariantem systemu:

- biała powierzchnia, cienka linia, mały radius;
- jedno pytanie jako główny punkt ekranu;
- wyraźny progress tekstowy i graficzny;
- odpowiedzi jako zwarte wiersze, nie wielkie kafle;
- stały, lecz nie nachodzący footer nawigacyjny;
- przyjazne „Nie wiem” bez wizualnej kary;
- wynik z jednoznacznym zastrzeżeniem, że nie jest ofertą;
- pełna klawiatura, poprawne etykiety, live region tylko dla istotnych zmian;
- respektowanie `prefers-reduced-motion`, forced colors i powiększenia 200%.

Inline, popup, fullscreen i hosted flow mają wyglądać jak jedna rodzina.
Nie pozwól, aby styl hosta obcego serwisu przeciekał do widgetu.

### 8. Ilustracje i grafiki

Używaj przede wszystkim ilustracji produktowych tworzonych z realnych
komponentów interfejsu. Są bardziej wiarygodne, dostępne i ostre niż raster.

Dopuszczalne dodatkowe motywy:

- cienka linia przechodząca od nieuporządkowanych fragmentów wiadomości do
  uporządkowanych wierszy briefu;
- schemat trzech odpowiedzi łączących się w jedną decyzję;
- minimalistyczne symbole zakresu, budżetu, terminu, lokalizacji i pliku;
- delikatna siatka konstrukcyjna w tle, widoczna tylko na dużych ekranach;
- miękkie, abstrakcyjne światło papieru bez gradientowego efektu marketingowego.

Zakazane:

- zdjęcia stockowe ludzi przy laptopach;
- roboty, iskry „AI”, mózgi, czatbotowe dymki jako główny motyw;
- rośliny i metafory eko;
- monety, wykresy giełdowe i symbole finansowe;
- kolorowe izometryczne scenki;
- szklane karty, neon, 3D bloby i przypadkowe fale;
- ilustracje bez związku z rzeczywistym przepływem produktu.

Jeżeli generujesz raster, przygotuj go jako materiał kierunkowy lub subtelne
tło, a nie jako jedyne źródło informacji. Eksportuj wariant WebP/AVIF w
rozmiarze odpowiadającym renderowi, ustaw jawne `width` i `height`, użyj
responsywnego `sizes` i unikaj lazy-loadu dla obrazu LCP.

### 9. Ruch i interakcja

- podstawowe przejścia: 120–240 ms;
- wejście sekcji: maksymalnie 320 ms, tylko opacity + mały translate;
- hover nie może przesuwać całej geometrii strony;
- widok procesu może animować delikatny przepływ linii i checków;
- nie animuj stale elementów dekoracyjnych;
- żadnego parallaxu, scroll hijackingu i sprężystych kart;
- przy `prefers-reduced-motion: reduce` usuń ruch bez utraty informacji;
- stan loading nie może powodować layout shift.

### 10. Copy

Pisz po polsku, konkretnie i bez przesady. Używaj języka decyzji i następnego
kroku. Unikaj: „rewolucja”, „magia”, „game changer”, „najlepszy”, „AI zrobi
wszystko”, presji czasowej i obietnic bez danych.

CTA opisuje działanie: `Zobacz proces`, `Wyślij testowy lead`, `Opublikuj
wersję`, `Umów rozmowę`. Nie używaj wszędzie ogólnego `Dowiedz się więcej`.

### 11. Dostępność

Redesign musi:

- spełniać WCAG 2.2 AA;
- zachować logiczną strukturę `h1–h3` i landmarks;
- mieć kontrast tekstu minimum 4.5:1, a dużego tekstu minimum 3:1;
- mieć widoczny focus o kontraście minimum 3:1;
- zapewnić cele dotykowe około 44 × 44 px, nawet gdy wizualna ikona jest mała;
- działać bez myszy, w poprawnej kolejności fokusu;
- nie używać hover jako jedynego sposobu ujawnienia treści;
- poprawnie komunikować błędy, statusy i postęp czytnikowi ekranu;
- zachować czytelność przy 200% zoom i reflow 320 CSS px;
- nie powielać czytnikowi treści dekoracyjnego mockupu produktu;
- używać `aria-hidden` wyłącznie dla rzeczywiście dekoracyjnych kopii.

### 12. Responsywność

Projektuj mobile jako osobną kompozycję, a nie zmniejszony desktop.

- 320–479 px: jedna kolumna, 20 px gutter, uproszczony produkt;
- 480–767 px: jedna kolumna, 24 px gutter;
- 768–1023 px: układ pośredni, bez udawania pełnego desktopu;
- 1024–1279 px: kompaktowy desktop;
- od 1280 px: pełna kompozycja premium.

Użyj fluid type i spacing przez `clamp()`, ale ogranicz wartości tokenami.
Tekst, przyciski, tabele, dialogi i formularze nie mogą wyjść poza viewport.

### 13. Wydajność i SEO

- zachowaj Server Components wszędzie, gdzie nie jest potrzebna interakcja;
- nie dodawaj biblioteki animacji ani UI bez udokumentowanej potrzeby;
- ikony realizuj lekkim, kontrolowanym zestawem SVG;
- nie zwiększaj budżetu marketingowego JavaScript ponad aktualne 250 KiB;
- główna zawartość i tekst hero muszą być w HTML przy pierwszym renderze;
- nie zmieniaj canonical, sitemap, robots ani schema bez powodu;
- panel, logowanie, API, design system i hosted flows pozostają `noindex`;
- utrzymaj stabilne wymiary obrazów i unikaj CLS;
- sprawdź LCP hero, font loading i wagę wszystkich nowych assetów;
- nie ładuj pełnej grafiki 1.2 MB jako produkcyjnego assetu bez optymalizacji.

### 14. Kolejność implementacji

1. Zrób audyt wizualny wszystkich istniejących powierzchni i screenshoty
   desktop/mobile przed zmianą.
2. Dodaj wpis etapu i mierzalny gate do `docs/TASKS.md`.
3. Jeżeli zmieniasz zatwierdzone tokeny lub architekturę, dodaj ADR.
4. Uporządkuj fundamenty wyłącznie w `packages/ui`: typografia, kolor,
   spacing, radius, border, shadow, focus i motion.
5. Zbuduj code-native komponent wizualizacji produktu.
6. Przebuduj header i landing od hero do finałowego CTA.
7. Ujednolić logowanie, panel, szczegóły leada, builder i stany systemowe.
8. Ujednolić widget we wszystkich trybach osadzenia.
9. Wykonaj przegląd 1440, 1280, 1024, 768, 390 i 320 px.
10. Uruchom pełne testy i porównanie wizualne.
11. Wykonaj self-review bezpieczeństwa, prywatności, dostępności, SEO i
    wydajności.
12. Zaktualizuj dokumentację, changelog i status etapu.

#### Trzy obowiązkowe rundy jakości

Po każdej większej powierzchni wykonaj trzy osobne rundy:

**Runda 1 — funkcja**

- Czy hierarchia odpowiada realnemu zadaniu?
- Czy każda kontrolka działa?
- Czy są loading, empty, error, success i permission denied?
- Czy dane i akcje mają poprawny tenant scope?

**Runda 2 — art direction / anti-AI**

- Czy sekcja wygląda jak część jednego profesjonalnego narzędzia?
- Czy można usunąć co najmniej 20% obramowań, badge’y lub dekoracji?
- Czy informacje można grupować whitespace i liniami zamiast kartami?
- Czy powtarza się układ `nagłówek + trzy karty`?
- Czy ilustracja wyjaśnia produkt, czy tylko zajmuje miejsce?
- Czy radius, cień albo zieleń są użyte bez funkcjonalnego powodu?
- Czy screenshot można pomylić z generycznym template’em AI? Jeżeli tak,
  przeprojektuj go.

**Runda 3 — produkcja**

- Desktop, tablet i mobile.
- Klawiatura, focus, czytnik ekranu i reduced motion.
- LCP, CLS, JavaScript i rozmiary obrazów.
- SEO, crawl, robots i metadata.
- Visual regression oraz porównanie z referencjami.

### 15. Zakres testów i gate

Redesign jest ukończony dopiero, gdy:

- nie zmienia wyników logiki, uprawnień ani tenant scope;
- nie ma atrap przycisków i martwych linków;
- landing jasno pokazuje kwalifikację prowadzącą do uporządkowanego leada;
- hero na desktopie odpowiada kierunkowi premium i nie używa przechylonej
  generycznej karty;
- mobile 320/390 px nie ma overflow i zachowuje hierarchię;
- klawiatura przechodzi header, CTA, demo, FAQ, formularze i dialogi;
- axe nie raportuje naruszeń A/AA;
- focus, reduced motion, forced colors i zoom 200% przechodzą ręczny review;
- loading, empty, error, brak uprawnień i sukces mają kompletne stany;
- marketing pozostaje w budżecie JavaScript, a obrazy są zoptymalizowane;
- crawl, metadata, canonical, sitemap, robots i schema pozostają poprawne;
- visual review obejmuje landing, login, listę leadów, szczegóły leada,
  builder i widget;
- `format:check`, `lint`, `typecheck`, wszystkie testy, E2E i `build` są
  zielone bez wyłączeń oraz obniżania rygoru.

#### Obowiązkowe artefakty odbioru

Przed oznaczeniem redesignu jako zakończonego dostarcz:

- screenshoty „przed” i „po” dla 1440 oraz 390 px;
- landing od headera do stopki, nie tylko hero;
- produkt, jak działa, cennik, agencje, WordPress, hub funkcji i hub branż;
- logowanie;
- dashboard;
- listę leadów;
- szczegóły leada;
- builder;
- widget inline i popup;
- loading, empty, error, permission denied oraz success;
- krótką tabelę zgodności z każdą cechą przesłanych referencji;
- raport axe, test klawiatury i zestaw wyników komend;
- porównanie budżetu JavaScript i obrazów przed/po;
- self-review diffu z listą znalezionych i poprawionych problemów.

Nie akceptuj redesignu na podstawie jednego ładnego screenshotu. Cała ścieżka
od landingu do obsługi leada ma wyglądać jak jeden zaprojektowany produkt.

### 16. Antywzorce — odrzuć projekt, jeśli występują

- przechylony browser mockup jako główny motyw hero;
- wielki nagłówek bez odpowiednio silnego widoku produktu;
- każda informacja zamknięta w osobnej karcie;
- identyczna trzykolumnowa siatka powtarzana w każdej sekcji;
- nadmiar badge’y i pigułek;
- zbyt duże radiusy;
- mocne, rozlane cienie;
- gradienty, glassmorphism, neon albo ozdobne 3D;
- abstrakcyjne wykresy bez prawdziwego znaczenia;
- zielony użyty do wszystkiego;
- komponenty wyglądające jak niezmodyfikowany starter biblioteki UI;
- desktop tylko skurczony do mobile;
- raster udający interaktywny produkt;
- fałszywy social proof;
- obniżenie kontrastu pod pretekstem minimalizmu.

## Prompt użyty do grafiki kierunkowej

```text
Use case: ui-mockup. Create an original premium minimalist product-interface
concept for the Polish B2B SaaS brand “Wyceno”, using the supplied screenshots
only as visual-direction and composition references, not as edit targets and
not copying their exact layouts.

Show a guided qualification flow visibly turning an unstructured customer
inquiry into an organized lead brief. Use a large polished SaaS surface: a
narrow deep-forest-green rail, one compact qualification card with scope,
budget and deadline, a subtle directional connector, and one spacious
lead-detail workspace with contact, project scope, budget, deadline, location,
attachments, readiness reasons, status, owner and next action. Include a
restrained readiness score “85/100”.

Landscape 16:10. Product on the right 70–78%, deliberate off-white negative
space on the left. Strong editorial grid, generous margins, calm rhythm,
balanced asymmetry, thin dividers and excellent hierarchy.

High-fidelity editorial UI mockup, premium Swiss/minimal product design, quiet
luxury, modern Polish B2B SaaS. Palette: #F5F6F2, #FFFFFF, #EEF1ED, #17201D,
#58645F, #123D2C and restrained #39D98A. Use 1px hairlines, 6–10px radii,
simple monoline icons and extremely subtle ambient shadow.

No third-party logos, fake browser frame, stock photos, people, eco symbolism,
finance imagery, 3D blobs, neon, glassmorphism, loud gradients, giant pills,
huge radii, cartoon illustration, dark theme or watermark.
```

Prompt drugiej ilustracji określał szeroki, minimalistyczny rysunek liniowy:
pięć nieuporządkowanych fragmentów zapytania po lewej, trzy cienkie linie
przechodzące przez ciemnozielony punkt kwalifikacji oraz jeden uporządkowany
brief z pięcioma wierszami po prawej. Wymagał stylu szwajcarskiej infografiki
2D, dużej ilości ciepłobiałego oddechu, wyłącznie zatwierdzonej palety i
wykluczał ludzi, AI, metafory eko/finansowe, 3D, gradienty, szkło oraz tekst
akapitowy.
