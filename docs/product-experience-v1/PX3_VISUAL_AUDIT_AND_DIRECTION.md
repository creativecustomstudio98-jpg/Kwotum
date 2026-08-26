# PX3 — audyt wizualny i kierunek autorski

**Data:** 2026-08-25  
**Zakres:** quick form, jego kontekst na hosted linku oraz podgląd w builderze  
**Status:** kierunek wykonawczy; bez użycia wcześniejszych obrazów jako referencji

## Werdykt

Dotychczasowe warianty poprawiały estetykę, ale nie budowały tożsamości
produktu. Pierwszy wariant powielał współczesny szablon SaaS: duży hero,
kolorowy pasek, karty, badge'e, cienie i miękkie tło. Drugi wariant usunął
większość ozdobników, lecz stał się anonimowym formularzem systemowym. Oba
kierunki są odrzucone.

Problemem nie jest brak dekoracji. Problemem jest brak idei, która łączy wygląd
z zadaniem Wyceno: zamianą niepełnego zapytania w uporządkowany materiał do
podjęcia decyzji.

## Co dokładnie wyglądało generycznie

1. **Hero wewnątrz narzędzia.** Wielki tytuł i opis zajmowały miejsce potrzebne
   na wykonanie zadania. Formularz zachowywał się jak landing page.
2. **Karta w karcie.** Osobna rama widgetu, karta formularza, karty odpowiedzi,
   karta zgody i kapsułki tworzyły sztuczną głębię bez znaczenia funkcjonalnego.
3. **Domyślny język SaaS.** Ciemnozielony header, pastelowe tło, promienie
   10–22 px i miękkie cienie można przenieść do dowolnego produktu bez zmiany.
4. **Dekoracyjna metryka.** Etykiety „2 pytania” i „jeden formularz, jeden wynik”
   nie pomagały podjąć decyzji. Udawały wartość informacyjną.
5. **Zgoda konkurująca z zadaniem.** Opcjonalna analityka była jedną z
   najbardziej widocznych powierzchni, mimo że nie należy do głównej ścieżki.
6. **Brak związku z wynikiem.** Ekran wejściowy nie zapowiadał uporządkowanego
   briefu, który firma otrzymuje po wysłaniu.
7. **Minimalizm wyłącznie przez odejmowanie.** Płaski biały formularz był
   czystszy, ale nadal nie miał rozpoznawalnego rytmu, informacji ani zachowania
   właściwego Wyceno.

## Teza projektowa: żywy arkusz briefu

Quick form ma wyglądać jak powstający na żywo, precyzyjny dokument operacyjny,
nie jak ankieta marketingowa. Klient uzupełnia zakres, a po drugiej stronie
powstaje gotowy brief. Ten sam porządek powinien być odczuwalny przed i po
wysłaniu.

Tożsamość nie pochodzi z ilustracji. Budują ją:

- wyraźny indeks dokumentu i numeracja `01`, `02`, `03`;
- jedna pionowa oś oraz stała linia odniesienia;
- reguły i separatory przypominające profesjonalny arkusz ofertowy;
- typografia o wyraźnym kontraście między nazwą dokumentu, pytaniem i pomocą;
- pojedynczy zielony sygnał używany tylko dla wyboru, fokusu i działania;
- wynik prezentowany jako dalsza część tego samego dokumentu.

## Reguły wykonawcze

### Kompozycja desktop

- maksymalna szerokość dokumentu: 760 px;
- właściwa kolumna treści: 680 px;
- brak cienia, gradientu, ilustracji i dekoracyjnego tła;
- header dokumentu: nazwa procesu i stan zapisu, oddzielone jedną linią;
- pytanie: indeks 36 px + treść, bez badge'a i bez osobnej karty;
- odpowiedzi: rejestr wierszy, nie kafelki;
- CTA wyrównane do prawej krawędzi treści, bez pełnej belki.

### Kompozycja mobile

- pełna szerokość, 16 px marginesu roboczego;
- ten sam porządek dokumentu, bez zmiany w zestaw kart;
- odpowiedzi zawsze w jednej kolumnie;
- CTA pełnej szerokości wyłącznie ze względu na ergonomię dotyku;
- brak sticky footera zasłaniającego treść;
- stan zapisu nie może wypierać nazwy procesu.

### Kontrolki

- promień 0–3 px;
- obszar dotyku minimum 44 px;
- zaznaczenie komunikuje radio/checkbox, tekst i boczna reguła, nie sam kolor;
- focus pozostaje jawny i ma kontrast WCAG AA;
- opis, błąd i opcja „Nie wiem” mają stałe miejsce w rytmie pola.

### Zgoda analityczna

- pozostaje opcjonalna i niewymuszająca;
- trafia na koniec dokumentu, bezpośrednio przed akcją;
- wizualnie jest przypisem prywatności, nie osobnym modułem sprzedażowym;
- odmowa nie zmienia hierarchii ani możliwości wysłania.

## Zakazane wzorce

- zdjęcia i stare screenshoty jako referencja;
- mockup telefonu nałożony na mockup dashboardu;
- hero, eyebrow marketingowy i benefit chips wewnątrz formularza;
- karty dla każdego pytania lub odpowiedzi;
- duże promienie, miękkie cienie i pastelowe „soft UI”;
- ikonki bez znaczenia zadaniowego;
- elementy, które istnieją tylko po to, żeby zapełnić pustą przestrzeń;
- fikcyjny branding klienta przed zakresem PX6.

## Gate odbioru

- użytkownik w 3 sekundy rozpoznaje nazwę procesu, cel i pierwsze pytanie;
- na 320 px nic nie jest ucięte i nie występuje poziomy scroll;
- formularz działa bez myszy, przechodzi axe i respektuje reduced motion;
- opcjonalna analityka nie poprzedza pierwszego pytania;
- żaden element nie wymaga zdjęcia do zachowania hierarchii;
- podgląd buildera i hosted link używają tego samego renderera;
- visual review właściciela pozostaje osobnym, jawnym zatwierdzeniem.
