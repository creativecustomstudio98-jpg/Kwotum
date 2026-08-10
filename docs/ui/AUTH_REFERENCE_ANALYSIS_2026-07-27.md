# Analiza referencji auth — logowanie i rejestracja

**Status:** zaakceptowana referencja Etapu 12K, implementacja i QA w toku  
**Data analizy:** 2026-07-27  
**Zakres:** pełnoekranowe logowanie i rejestracja oraz ich transformacja
responsive  
**Źródła:** `apps/web/public/ekranylogowania.png` 1536 × 1024, prompt
`pasted-text.txt` z załącznika rozmowy oraz nowszy, jednoznaczny wzorzec
pełnoekranowego logowania 2048 × 1157

## Status źródła

Oryginał planszy jest zapisany lokalnie. Jego SHA-256 to
`ba9927f454330835c6a7d1663cd294913ceafdf6f322aef44ea7e059eca630fd`.
Plansza pozostaje źródłem anatomii, treści i języka wizualnego. Nowszy wzorzec
użytkownika rozstrzyga sposób prezentacji pojedynczej trasy: trójkolumnowy auth
zajmuje cały pierwszy viewport, bez zewnętrznego nagłówka, sloganu, podpisu
„Logowanie” albo wyśrodkowanej karty. Późniejsza korekta wymaga widocznej, lecz
nadal subtelnej białej oprawy 0,75–1,5 rem wewnątrz pierwszego viewportu.

Pixel-perfect PASS nadal wymaga lokalnego zrzutu implementacji, overlay i diff.

## Jak czytać planszę

To plansza porównawcza pokazująca dwa osobne ekrany desktopowe obok siebie, a
nie jeden ekran aplikacji z dwoma formularzami.

- lewa połowa: ekran logowania;
- prawa połowa: ekran rejestracji;
- nagłówki „Logowanie” i „Rejestracja” nad kartami są wyłącznie podpisami
  planszy i nie mogą wystąpić na trasach;
- wspólny pasek marki na górze jest ramą planszy i nie może wystąpić na
  trasach;
- właściwą jednostką implementacji jest pełnoekranowy region
  `branding / formularz / korzyści`;
- sekcja pięciu cech jest osobną kolejną sekcją dokumentu; zaczyna się dopiero
  poniżej pierwszego viewportu.

Ten odczyt jest zgodny z promptem, który wymaga osobnych stron i opisuje kartę
auth jako trzy logiczne strefy, oraz z późniejszym doprecyzowaniem właściciela
produktu.

## Pomiary planszy desktop

Pomiary są odczytem z obrazu rozmowy, dlatego mają status przybliżony do czasu
pozyskania oryginału.

| Element                          |             Przybliżony pomiar |
| -------------------------------- | -----------------------------: |
| Canvas                           |                 1536 × 1024 px |
| Biała oprawa trasy auth          |                 około 12–24 px |
| Górna rama marki na trasie       |                           brak |
| Karta logowania                  |  x ≈ 34, y ≈ 149, 716 × 664 px |
| Karta rejestracji                | x ≈ 787, y ≈ 149, 715 × 664 px |
| Odstęp między kartami na planszy |                        ≈ 37 px |
| Radius zewnętrznej karty         |                        ≈ 12 px |
| Border                           |            1 px, jasny neutral |
| Kontrolki formularza             |           ≈ 32–36 px wysokości |
| Bok kontenera ikony benefitu     |                        ≈ 40 px |
| Box cytatu                       |                 ≈ 174 × 100 px |

### Proporcje kolumn

| Ekran       |         Branding |        Formularz |         Benefity |
| ----------- | ---------------: | ---------------: | ---------------: |
| Logowanie   | ≈ 227 px / 31,7% | ≈ 278 px / 38,8% | ≈ 211 px / 29,5% |
| Rejestracja | ≈ 219 px / 30,7% | ≈ 281 px / 39,3% | ≈ 214 px / 30,0% |

Różnica szerokości lewego panelu wynika z kompozycji planszy, nie z potrzeby
utrzymywania dwóch osobnych shelli. Docelowy wspólny shell zachowuje relację
`31 / 39 / 30`. W nowszym wzorcu 2048 × 1157 granice kolumn wypadają około
`x=632` i `x=1433`, co potwierdza proporcję 30,9% / 39,1% / 30,0%.

## Anatomia wspólna

### 1. Panel brandingowy

- pełna wysokość karty;
- głęboka zieleń i biały tekst;
- mały znak oraz nazwa produktu u góry;
- nagłówek i dwuwierszowy opis pod logo;
- centralna, dedykowana ilustracja produktowa;
- blok bezpieczeństwa przy dolnej krawędzi z liniową ikoną tarczy;
- wewnętrzny padding około 24–26 px;
- elementy są wyrównane do jednej lewej osi.

Panel nie jest dekoracyjną połową typowego split-screen. Ma własną hierarchię,
treść zaufania oraz ilustrację związaną z konkretnym ekranem.

### 2. Panel formularza

- biały, wyraźnie oddzielony pionowymi hairline'ami;
- tytuł 14–16 px o mocniejszej wadze;
- krótki tekst pomocniczy 10–12 px;
- etykiety zawsze nad polami;
- pola z ikoną po lewej, a dla hasła także kontrolą widoczności po prawej;
- główne CTA na pełną szerokość;
- separator „lub” z dwiema subtelnymi liniami;
- dwa pełnoszerokie przyciski dostawców;
- link do alternatywnego flow przy dolnej krawędzi.

Formularz jest zwarty względem dostępnej kolumny. Natywna plansza porównawcza
pokazuje kontrolki około 32–36 px, ale nowszy pełnoekranowy wzorzec skaluje je
do około 76 px przy szerokości 2048 px. Najnowsza korekta użytkownika odrzuca
to mechaniczne powiększenie jako zbyt ciężkie: implementacja używa 46–56 px,
zachowując zwartą gęstość rejestracji i co najmniej 44 px celu dotykowego.

### 3. Panel korzyści

- tytuł „Dlaczego Wyceno?” w górnej części;
- dokładnie cztery powtarzalne wiersze benefitów;
- każdy wiersz ma osobny kontener ikony, tytuł i krótki opis;
- rytm jest pionowy, bez kart otaczających każdy benefit;
- na dole znajduje się osobny box cytatu.

Krytyczny jest rytm `ikona → tytuł → opis`, ale cytat nie może zostać
wdrożony jako fikcyjny testimonial. Referencja wizualna nie znosi zakazu
fabrykowania klientów i dowodów społecznych.

## Ekran logowania

### Panel brandingowy

- logo;
- „Witaj ponownie”;
- opis o logowaniu i zarządzaniu leadami;
- ilustracja kilku przechylonych powierzchni produktu w przestrzeni;
- główna miniatura pokazuje nawigację, metryki i wykres;
- przed nią znajduje się jasna karta z listą osób/leadów;
- dwa małe pływające moduły mają charakter wskaźnika postępu/statusu;
- blok „Twoje dane są bezpieczne” przy dole.

Ilustracja ma wyglądać jak zestaw rzeczywistych fragmentów interfejsu, nie jak
losowe 3D, stock ani generyczna abstrakcja.

### Formularz

1. e-mail;
2. hasło z pokaż/ukryj;
3. „Zapamiętaj mnie” i „Nie pamiętasz hasła?” w jednym wierszu;
4. CTA „Zaloguj się”;
5. separator;
6. Google;
7. link do rejestracji.

Wartości widoczne w polach są treścią demonstracyjną planszy. Produkcyjny
formularz nie powinien być wstępnie wypełniony syntetycznymi danymi osoby.

## Ekran rejestracji

### Panel brandingowy

- logo;
- „Załóż konto”;
- opis okresu próbnego;
- dedykowany pionowy stos modułów 3D;
- trzy główne kostki reprezentują sukces/weryfikację, konto i wzrost;
- kostki są połączone przerywaną ścieżką procesu;
- całość stoi na jasnej podstawie;
- blok „Bezpieczna rejestracja” przy dole.

Ta ilustracja nie jest wariantem grafiki logowania. Oba ekrany mają wspólny
język materiałów, światła, zieleni i bieli, lecz inną semantykę.

### Formularz

1. e-mail;
2. imię i nazwisko;
3. nazwa firmy;
4. hasło z pokaż/ukryj;
5. potwierdzenie hasła z pokaż/ukryj;
6. akceptacja Regulaminu i Polityki prywatności;
7. CTA „Załóż konto”;
8. separator;
9. Google;
10. link do logowania.

Rejestracja ma większą gęstość, ale zachowuje tę samą wysokość i trzy kolumny.
Odstępy są ciaśniejsze niż w logowaniu; nie należy powiększać karty tylko po
to, aby użyć luźniejszych domyślnych spacingów.

## Język wizualny

- ciepłe tło papierowe, nie czysta szarość;
- białe lub lekko ciepłe powierzchnie;
- grafitowy tekst główny i spokojny tekst pomocniczy;
- głęboka zieleń jako dominanta marki;
- świeższa zieleń tylko dla sukcesu, aktywności i drobnych akcentów;
- hairline'y zamiast ciężkich obramowań;
- bardzo delikatny cień głównej karty;
- umiarkowane promienie: karta około 12 px, wewnętrzne powierzchnie 6–9 px;
- mała, precyzyjna typografia produktu, nie marketingowe oversize;
- liniowe ikony o jednolitym stroke;
- brak szkła, neonów, glow, blobów, gradientowego tekstu i hover lift.

Prompt wspomina „gradientowe” tło lewego panelu, ale aktualne ADR-y zabraniają
dekoracyjnych gradientów, a sam obraz pokazuje przede wszystkim głęboką,
spokojną zieleń. Bez nowej decyzji implementacja powinna użyć semantycznego
koloru z `packages/ui`, nie lokalnego efektu.

## Wymagane komponenty wspólne

- `AuthShell`;
- `AuthBrandPanel`;
- `AuthProductIllustration` z wariantami `signIn` i `signUp`;
- `AuthFormPanel`;
- `AuthBenefitsPanel`;
- `AuthBenefit`;
- `AuthSecurityNote`;
- `AuthField` z ikoną i stanami;
- `PasswordField` z dostępną kontrolą pokaż/ukryj;
- `AuthPrimaryAction`;
- `AuthDivider`;
- `AuthProviderButton`;
- `AuthInlineAlert`;
- `AuthStatusCard` dla resetu, sprawdzenia skrzynki i sukcesu.

Nazwy są mapą odpowiedzialności, nie decyzją o dokładnych ścieżkach plików.
Prymitywy formularza i tokeny nadal należą do `packages/ui`.

## Stany i zachowania

Każda kontrolka musi mieć: default, hover, focus-visible, filled, error,
success, disabled i loading. Stan nie może zależeć wyłącznie od koloru.

Wymagane zachowania:

- walidacja dostępna dla czytnika ekranu i powiązana z polem;
- fokus po błędzie przechodzi do podsumowania lub pierwszego błędnego pola;
- pokaż/ukryj hasło zachowuje fokus i dostępne nazwy;
- loading blokuje podwójny submit, ale nie usuwa etykiety akcji;
- błędne logowanie używa komunikatu, który nie ujawnia istnienia konta;
- linki resetu mają bezpieczny, dozwolony redirect i obsługę wygaśnięcia;
- prywatne odpowiedzi pozostają `no-store`, a auth nie jest indeksowany;
- dostawca społecznościowy nie może być widocznym, martwym przyciskiem.

## Responsive

Prompt opisuje transformację, ale załączona plansza nie pokazuje mobile.
Można przyjąć jedynie kontrakt funkcjonalny:

- jedna kolumna;
- skrócony panel brandingowy jako górny hero;
- formularz jako główny region;
- benefity pod formularzem albo w wersji zredukowanej;
- pełnoszerokie CTA;
- brak skalowania desktopowej karty;
- brak poziomego overflow od 320 px;
- cele dotykowe co najmniej 44 px, nawet jeśli kontrolki desktopowe są niższe.

Bez osobnych ekranów 390 × 844 dla logowania, rejestracji i resetu nie wolno
ogłosić wizualnej zgodności mobile 1:1.

## Ekrany uzupełniające z promptu

Tekstowo zdefiniowano:

- nie pamiętasz hasła;
- ustaw nowe hasło;
- sprawdź skrzynkę e-mail;
- sukces utworzenia konta, zmiany hasła lub potwierdzenia e-maila;
- błędne hasło;
- błędny e-mail;
- konto już istnieje;
- link wygasł;
- nieważny token resetu.

Nie mają osobnych obrazów. Powinny użyć uproszczonego wariantu tego samego
shella i `AuthStatusCard`, lecz wymagają osobnej decyzji o zakresie i
działającym flow serwerowym przed wdrożeniem.

## Konflikty z bieżącym repozytorium

### Marka

Prompt i plansza używają nazwy „Wyceno”. ADR-024 wymaga widocznej marki
„Lorum”, a słowo Wyceno pozostawia tylko w identyfikatorach technicznych.
Sama plansza nie jest wystarczającą zgodą na cofnięcie tej decyzji. Przed
implementacją trzeba potwierdzić, czy użytkownik świadomie zmienia markę.

### Zakres funkcjonalny

Aktualna aplikacja ma działające logowanie hasłem na `/logowanie` i callback
PKCE. Nie ma zatwierdzonych, działających tras rejestracji, resetu ani
konfiguracji Google/Microsoft. Prompt nie może sam utworzyć nowych providerów,
redirectów, polityk konta lub triala.

### Treści niedozwolone bez potwierdzenia

- „14-dniowy okres próbny” sugeruje niezatwierdzony model planu;
- podpisany cytat klientki byłby fikcyjnym testimonialem;
- „standardy szyfrowania klasy enterprise” wymaga dowodu i precyzyjnego copy;
- checkbox „Zapamiętaj mnie” nie może być atrapą;
- Google i Microsoft nie mogą być atrapami ani samymi ikonami.

### Bieżący etap

ADR-029 uruchomił zamknięty Etap 12K. Marka to Lorum, jedynym providerem jest
Google, a Microsoft nie występuje. Wzorzec pełnoekranowy nadpisuje wcześniejszą
interpretację wyłącznie w geometrii pojedynczej trasy auth. Etap nie zmienia
pozostałego landingu ani panelu.

## Warunki domknięcia implementacji

1. Zachować pierwszy viewport wyłącznie dla trzech kolumn auth.
2. Umieścić sekcję „Wszystko, czego potrzebujesz…” po pierwszym viewportcie.
3. Zapisać zrzuty logowania i rejestracji na desktop i mobile.
4. Wykonać overlay, diff oraz score minimum 18/20.
5. Przejść testy formularzy, auth, klawiatury, axe, overflow, build i security.

## Kryteria zachowania referencji

- trzy regiony w tej samej kolejności;
- proporcje kolumn w tolerancji 3%;
- pełna lista czterech benefitów;
- dedykowana ilustracja dla każdego głównego ekranu;
- zgodna gęstość formularza;
- kontrolki desktop w tolerancji ±2 px po pomiarze oryginału;
- kluczowe spacingi w tolerancji ±4 px;
- brak obcego template'u i przypadkowej ilustracji;
- prawdziwa transformacja mobile;
- pełna klawiatura, focus-visible, komunikaty i bezpieczne flow auth.
