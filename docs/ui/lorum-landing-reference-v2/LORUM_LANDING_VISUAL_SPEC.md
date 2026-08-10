# Lorum — zamknięta specyfikacja wizualna landing page

## 1. Status dokumentu

Ten dokument oraz pliki wizualne w katalogu `screenshots/` są **źródłem prawdy dla implementacji landingu**.

Codex nie ma projektować, interpretować ani „ulepszać” kompozycji. Ma przenieść ją do istniejącej aplikacji, zachowując logikę, routing, dane i architekturę projektu.

Nazwa widoczna w interfejsie: **Lorum**. Nazwa „Wyceno” z pierwotnego master promptu była nazwą roboczą.

## 2. Pliki referencyjne

### Pełna strona

- `screenshots/lorum-landing-desktop-full.png` — pełny desktop, viewport 1536 px.
- `screenshots/lorum-landing-mobile-full.png` — pełny mobile, viewport 390 px.

### Podział na etapy implementacji

- `screenshots/lorum-board-1-desktop.png`
- `screenshots/lorum-board-1-mobile.png`
  - navbar,
  - hero,
  - pasek zbieranych informacji,
  - problem kontra rezultat,
  - „Jak działa”.

- `screenshots/lorum-board-2-desktop.png`
- `screenshots/lorum-board-2-mobile.png`
  - interaktywne demo,
  - szablony branżowe.

- `screenshots/lorum-board-3-desktop.png`
- `screenshots/lorum-board-3-mobile.png`
  - funkcje pokazane jako jeden proces,
  - WordPress i osadzanie,
  - moduł dla agencji,
  - dowody i metodyka.

- `screenshots/lorum-board-4-desktop.png`
- `screenshots/lorum-board-4-mobile.png`
  - cennik,
  - FAQ,
  - finalne CTA,
  - footer.

### Wzorzec możliwy do uruchomienia

- `index.html`
- `styles.css`

HTML i CSS są wizualnym prototypem referencyjnym. Nie muszą zostać skopiowane 1:1 do architektury aplikacji, ale geometria, hierarchia, gęstość i zachowanie responsywne mają zostać zachowane.

---

## 3. Ostateczna kolejność sekcji

1. Navigation
2. Hero
3. Pasek informacji zbieranych przez system
4. Problem kontra rezultat
5. Jak działa
6. Interaktywne demo
7. Szablony branżowe
8. Funkcje jako sekwencja rezultatu
9. WordPress i instalacja
10. Dla agencji
11. Dowody zamiast fałszywego social proof
12. Cennik
13. FAQ
14. Final CTA
15. Footer

Nie dodawać:

- osobnej sekcji z generyczną siatką 3×3,
- logotypów „zaufali nam” bez prawdziwych klientów,
- opinii i case studies bez danych,
- dekoracyjnego dashboardu niezwiązanego z procesem,
- dodatkowego modułu AI,
- sekcji „wszystko w jednym miejscu”,
- ozdobnych statystyk bez źródła.

---

## 4. Design tokens

### Kolory

```css
--background: #FAF9F6;
--background-subtle: #F4F5F0;
--surface: #FFFFFF;
--text-primary: #17201D;
--text-secondary: #65706B;
--text-tertiary: #8A938F;
--brand: #0A4E36;
--brand-dark: #073F2C;
--brand-mid: #16895A;
--success: #2FAF70;
--success-soft: #DCEBD9;
--success-surface: #EEF6EC;
--border: #E3E1DA;
--border-strong: #D4D8D3;
--error: #C74948;
--error-soft: #FBEFEE;
--warning: #A56A1C;
--warning-soft: #FBF2E4;
```

### Typografia

Jedna rodzina groteskowa: Inter, Geist albo bardzo zbliżona. Nie łączyć kilku fontów.

```text
H1 desktop: 48 px / 1.06 / 770
H1 mobile: 39 px / 1.08 / 770
H2 desktop: 42 px / 1.12 / 750
H2 mobile: 32 px / 1.12 / 750
H3 sekcji: 28–32 px
Body desktop: 15–16 px
Body mobile: 13–14 px
UI labels: 8–12 px zależnie od komponentu
```

Zasady:

- mocne ujemne `letter-spacing` wyłącznie dla dużych nagłówków,
- żadnych ultralekkich odmian,
- liczby i wyniki mają pozostać czytelne,
- nie zwiększać nagłówków tylko po to, aby „wyglądały premium”.

### Promienie

```text
4 px — najmniejsze kontrolki i tagi
6 px — przyciski, inputy, answer options
9 px — standardowe karty i porównania
12 px — duże powierzchnie produktu
```

Nie stosować pigułek poza statusem, małą etykietą i wynikiem.

### Linie i cienie

```css
border: 1px solid #E3E1DA;
shadow-card: 0 10px 30px rgba(18,43,31,.06), 0 1px 2px rgba(18,43,31,.05);
shadow-large: 0 24px 60px rgba(18,43,31,.08), 0 2px 6px rgba(18,43,31,.05);
```

Cień ma oddzielać powierzchnię od tła, a nie tworzyć efekt unoszenia. Brak hover lift.

### Szerokość i siatka

```text
Viewport referencyjny desktop: 1536 px
Maksymalna szerokość treści: 1424 px
Margines zewnętrzny przy 1536 px: 44 px na stronę
Header desktop: 72 px
Header mobile: 64 px
```

---

## 5. Sekcje — dokładne wymagania

## 5.1. Navigation

Desktop:

- logo Lorum po lewej,
- linki: Produkt, Jak działa, Branże, Dla agencji, Cennik, FAQ,
- „Zaloguj się” jako zwykły link,
- „Zobacz demo” jako kompaktowy zielony button,
- wysokość 72 px,
- tylko dolna linia `1px`.

Mobile:

- logo po lewej,
- hamburger po prawej,
- bez rozbudowanego CTA w headerze,
- wysokość 64 px.

Zakaz:

- floating navbar,
- zaokrąglony kontener navbara,
- blur,
- podświetlony gradient,
- duża wysokość 90–110 px.

## 5.2. Hero

Desktop grid:

```text
390 px — copy
250 px — trzy odpowiedzi klienta
pozostała szerokość — panel gotowego leada
34 px — gap
```

Lewa kolumna:

- eyebrow,
- czterowierszowy nagłówek,
- ostatnia fraza na płaskim jasnozielonym tle,
- krótki opis,
- dwa CTA,
- trzy krótkie informacje pomocnicze,
- cienki separator i informacja o pierwszych branżach.

Środek:

- jedna karta „Zapytanie o realizację”,
- dokładnie trzy odpowiedzi,
- linie przerywane prowadzące do jednego węzła,
- jeden kierunek przepływu do panelu leada.

Prawa kolumna:

- jedna funkcjonalna powierzchnia produktu,
- ciemny pionowy pasek nawigacji,
- osoba, ID i data,
- wynik 85/100,
- trzy powody wyniku,
- wiersze: zakres, budżet, termin, lokalizacja, materiały, następny krok,
- dwa przyciski robocze.

Mobile:

- copy na pełną szerokość,
- CTA jedno pod drugim,
- pod copy kompaktowy flow: pytania po lewej, gotowy lead po prawej,
- nie wstawiać ramki telefonu,
- nie skalować całego desktopu.

## 5.3. Pasek zbieranych danych

Sześć pozycji:

1. Zakres projektu
2. Budżet
3. Termin
4. Lokalizacja
5. Pliki
6. Następny krok

Desktop: jeden rząd, pionowe separatory.

Mobile: siatka 3×2, ikona nad tekstem, bez opisów drugiego poziomu.

## 5.4. Problem kontra rezultat

Desktop:

- lewa kolumna: problem i opis,
- środek: jedna dwukolumnowa karta,
- lewa połowa karty: typowe zapytanie oraz czerwone braki,
- prawa połowa: kompletny lead i zielone potwierdzenia,
- jeden zielony węzeł pomiędzy kolumnami.

Nie tworzyć dwóch osobnych pływających kart.

## 5.5. Jak działa

- cztery kroki,
- pionowa linia i numerowane, jasnozielone koła,
- obok kompaktowy rekord leada,
- opis każdego kroku maksymalnie dwa krótkie zdania.

Mobile: kroki i panel leada jeden pod drugim.

## 5.6. Interaktywne demo

To najważniejsza sekcja marketingowa po hero.

Desktop:

- jedna duża powierzchnia produktu,
- toolbar z nazwą procesu, branżami i statusem,
- lewa kolumna: postęp i lista kroków,
- środek: aktywne pytanie,
- prawa kolumna: lead aktualizowany na żywo,
- obecny krok: wymiary kuchni,
- przyciski „Wstecz” i „Dalej: budżet”.

Mobile:

- poziomy wybór branży,
- progress bar,
- aktywne pytanie,
- pod nim podsumowanie leada,
- brak bocznego panelu nawigacji.

## 5.7. Szablony branżowe

Branże:

- meble na wymiar,
- ogrodzenia i bramy,
- strony i aplikacje,
- klimatyzacja,
- remonty.

Desktop:

- pionowa nawigacja po lewej,
- jedna aktywna branża na dużej powierzchni,
- ścieżka pytań,
- lista zawartości procesu,
- lista danych otrzymywanych przez firmę,
- przykładowy lead po prawej.

Zakaz: pięć identycznych dużych kart w siatce.

## 5.8. Funkcje jako proces

Pięć etapów:

1. Kwalifikacja
2. Wycena
3. Podsumowanie
4. Obsługa
5. Analiza

Desktop:

- jedna ciągła powierzchnia,
- pozioma linia procesu,
- każdy etap ma inny fragment UI,
- na dole jeden wspólny pasek funkcji.

Mobile:

- pionowa oś procesu,
- etapy jeden pod drugim,
- nie zmieniać ich w karuzelę.

## 5.9. WordPress

- copy po lewej,
- realny widok edytora po prawej,
- widoczny widget inline,
- trzy tryby: blok, shortcode, popup,
- prosty kod osadzenia,
- trzy kroki instalacji.

Zakaz: logo WordPress jako główna dekoracja albo generyczny obrazek laptopa.

## 5.10. Dla agencji

Sekcja może używać ciemnozielonego tła jako jedynego mocnego kontrastu na stronie.

- copy i korzyści po lewej,
- panel wielu klientów po prawej,
- lista organizacji,
- kopiowanie istniejącego procesu do nowej organizacji,
- white-label i niezależny draft.

Nie pokazywać fikcyjnych przychodów agencji.

## 5.11. Dowody

Bez fałszywych logotypów, opinii, case studies i liczb.

Pokazać:

- realne demo,
- jawną metodykę,
- bezpieczeństwo procesu.

## 5.12. Cennik

Desktop:

- jedna tabela porównawcza,
- Start, Pro, Agency, Done-for-you,
- Pro subtelnie wyróżniony,
- bez ostatecznych kwot, dopóki model nie zostanie zatwierdzony.

Mobile:

- cztery pionowe karty planów,
- bez poziomej tabeli wymagającej przesuwania,
- pełne CTA w każdej karcie.

## 5.13. FAQ

Pytania:

- dokładna cena,
- WordPress,
- dopasowanie do branży,
- wpływ na wydajność,
- RODO i pliki,
- własny branding,
- działanie bez strony,
- CRM.

Desktop: copy po lewej, accordiony po prawej.

Mobile: wszystko w jednej kolumnie.

## 5.14. Final CTA

Treść:

> Zobacz, jak może wyglądać proces wyceny w Twojej firmie.

- ciemnozielony panel,
- copy po lewej,
- mikroprzepływ odpowiedzi → lead po prawej,
- dwa CTA,
- bez abstrakcyjnej ilustracji.

## 5.15. Footer

- logo i krótki opis,
- cztery proste kolumny linków,
- legal i status projektu,
- bez newslettera zajmującego pół ekranu.

---

## 6. Reguły responsywne

Breakpoint referencyjny: około 900 px.

Na mobile:

- układy przechodzą w jedną kolumnę,
- wyjątkami są wyłącznie krótkie porównania i mikroprzepływy,
- poziome listy branż mogą być przewijane,
- tabela cennika zmienia się w pionowe plany,
- sidebary produktu znikają albo stają się progress barem,
- minimalna szerokość głównego CTA: 100%,
- główny cel dotykowy: 40–46 px,
- nie używać ramek urządzeń.

Nie wolno uznać mobile za ukończony tylko dlatego, że desktop „mieści się” w 390 px.

---

## 7. Bezwzględne zakazy

- glassmorphism,
- backdrop blur,
- neon i glow,
- dekoracyjne gradienty,
- gradientowy tekst,
- wielkie rozmyte kule,
- random floating cards,
- 16–24 px radius na wszystkim,
- pigułki jako domyślny kształt przycisków,
- ikony w kolorowych kwadratach przy każdej funkcji,
- wykresy bez znaczenia,
- stockowe osoby,
- laptop i telefon jako główna ilustracja,
- generyczna siatka 3×3,
- ogromne puste przestrzenie,
- animowanie każdej sekcji przy scrollu,
- zmiana copy bez decyzji produktowej,
- nowe sekcje dopisane przez model.

---

## 8. Kryteria odbioru wizualnego

Implementacja jest zgodna tylko wtedy, gdy:

1. Sekcje występują w tej samej kolejności.
2. Kompozycja desktopowa odpowiada plikowi `lorum-landing-desktop-full.png`.
3. Kompozycja mobilna odpowiada plikowi `lorum-landing-mobile-full.png`.
4. Hero posiada trzy logiczne strefy, a nie przypadkowy zestaw kart.
5. Demo wygląda jak działający produkt, nie jak grafika marketingowa.
6. Branże są pokazane przez jedną aktywną powierzchnię, nie siatkę template’ów.
7. Funkcje tworzą proces, a nie katalog ikon.
8. Cennik na mobile jest pionowy.
9. Nie pojawił się żaden element z listy zakazów.
10. Lint, typecheck, testy i build przechodzą bez wyłączania reguł.

## 9. Procedura visual QA

Dla każdej planszy:

1. Uruchom aplikację.
2. Wykonaj screenshot desktop 1536 px.
3. Wykonaj screenshot mobile 390 px.
4. Porównaj z odpowiednią planszą referencyjną.
5. Wypisz pięć największych różnic w kolejności:
   - geometria,
   - hierarchia,
   - typografia,
   - spacing,
   - kolory, border, radius i shadow.
6. Popraw różnice.
7. Wykonaj ponowny screenshot.
8. Zatrzymaj etap i pokaż wynik do akceptacji.

Build nie jest dowodem zgodności wizualnej.
