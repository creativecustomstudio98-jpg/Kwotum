# Architektura wizualna podstron Kwotum V1

**Status:** kontrakt projektowy przed implementacją
**Relacja do home:** wspólny język marki, osobne kompozycje podstron

## 1. Zasada nadrzędna

Podstrony mają wyglądać jak naturalna część Kwotum, ale nie mogą być kopią
sekcji strony głównej. Home odpowiada „dlaczego warto”, a podstrony mają
odpowiadać „co dokładnie”, „jak”, „dla kogo” i „na jakich zasadach”.

Wspólne pozostają:

- ciepłe tło papierowe;
- ciemny, lekko zielony ink;
- głęboka zieleń jako kolor działania i stanu;
- cienkie linie, mleczne powierzchnie i ograniczone cienie;
- duża, ciasna typografia nagłówków;
- code-native proofy produktu;
- uczciwe, demonstracyjne dane i prawdziwe cele linków.

Zmienne pozostają:

- proporcja hero;
- dominujący proof;
- liczba kolumn i rytm sekcji;
- poziom techniczności treści;
- CTA właściwe dla intencji konkretnej trasy.

## 2. Fundamenty

Nowe decyzje wizualne nie mogą powstawać jako lokalne, przypadkowe tokeny w
każdej stronie. Przed pierwszą implementacją należy uzgodnić i umieścić w
`packages/ui` albo jednym współdzielonym module marketingowym:

- kolory zgodne z home: paper, ink, brand, brand-dark, brand-soft, line;
- osie kontenera desktop/tablet/mobile;
- typografię display, title, body, label i microcopy;
- promienie panelu, karty, kontrolki i badge;
- trzy poziomy powierzchni: paper, translucent surface, data surface;
- hairline, subtelny cień i focus ring;
- wysokości przycisków 52/48/44 px zależnie od kontekstu, nigdy poniżej 44 px
  dla kontroli dotykowej.

Nie wolno kopiować lokalnych wartości home do kilkunastu plików. Home i
podstrony muszą konsumować nazwane wartości o tym samym znaczeniu.

## 3. Wspólne prymitywy kompozycyjne

### `SubpageShell`

- wspólny Kwotum header i footer;
- skip link i `main#main-content`;
- paper background oraz dekoracje niewpływające na kontrast;
- pełna obsługa menu bez JavaScriptu tam, gdzie jest to możliwe.

### `SubpageHero`

- breadcrumbs nad treścią, nie jako dominujący wiersz;
- kicker, H1, opis, maksymalnie dwie akcje;
- obowiązkowy proof albo mapa decyzji na desktopie;
- osobna kompozycja proofu na mobile, nie skalowany dashboard;
- opcjonalna jawna granica produktu w formie krótkiego note panelu.

### `SectionHeading`

- kicker opcjonalny;
- jedna teza w H2;
- jedno krótkie rozwinięcie;
- spójna szerokość i rytm, ale warianty left/center/split.

### `ProductProof`

- powierzchnia code-native z prawdziwymi polami produktu;
- widoczna etykieta „dane demonstracyjne”, gdy pokazuje wartości;
- brak atrap przycisków;
- controls działają albo są prezentowane jako nieinteraktywne elementy danych.

### `ProcessSequence`

- desktop: 3–6 kroków jako logiczna sekwencja, nie generyczny grid;
- mobile: pionowy timeline o zwartej wysokości;
- każdy krok: stan wejściowy, działanie, wynik;
- połączenia nie mogą być jedynym nośnikiem kolejności.

### `EvidenceRail`

- 3–5 krótkich faktów lub granic;
- stała wysokość w obrębie sekcji;
- na mobile jedna kolumna albo przewidywalne 2 × 2, bez karuzeli wymagającej
  gestów.

### `DecisionCard`

- stosowany dla pilotażu, wdrożenia lub następnego kroku;
- jeden dominujący wybór i jawne warunki;
- równe CTA, zero fikcyjnych cen i gwarancji.

### `SubpageFinalCta`

- lżejsze niż finalne CTA home;
- jedna teza, jedna akcja główna, opcjonalna drugorzędna;
- oba linki mają realny cel;
- bez powtarzania generycznego „przejdź do panelu” na każdej trasie.

### `LegalDocumentShell`

- węższa kolumna tekstowa, spis treści i kotwice;
- widoczna wersja dokumentu;
- dobre style list, linków, druku i 200% zoom;
- bez product proofów i sprzedażowych CTA.

## 4. Archetypy stron

| Archetyp    | Dominujący układ               | Proof                 | Główna decyzja       |
| ----------- | ------------------------------ | --------------------- | -------------------- |
| Produkt     | mapa systemu                   | rekord leada + moduły | zobacz proces        |
| Proces      | sekwencja                      | browser/server/panel  | wybierz branżę       |
| Pilotaż     | porównanie ścieżek             | zakres wdrożenia      | poznaj warunki       |
| Agencja     | relacja podmiotów              | tenant + widget       | wybierz zastosowanie |
| WordPress   | połączenie systemów            | konektor              | poznaj widget        |
| Hub branż   | porównanie                     | pytania vs brief      | wybierz branżę       |
| Branża      | narracja problem → brief       | demo + lead           | zobacz proces        |
| Hub funkcji | łańcuch zależności             | pięć funkcji          | zobacz cały przepływ |
| Funkcja     | korzyść → mechanizm → kontrola | mikrointerfejs        | zobacz kontekst      |
| Dokument    | czytanie i nawigacja           | brak                  | znajdź informację    |

## 5. Responsive

### 1440–1536 px

- główna oś boczna zgodna z home, ale sekcje tekstowe mogą używać węższej
  wewnętrznej kolumny;
- hero zwykle 5/7 albo 6/6;
- proof nie mniejszy niż około 560 px, jeśli zawiera UI;
- sekcje nie mogą wyglądać jak pomniejszone makiety rozciągnięte na ekran.

### 1024–1280 px

- desktopowy układ nadal zachowuje relacje poziome;
- hero może przejść do 5/7 lub 1fr/1fr;
- nie wolno zbyt wcześnie stackować całej strony;
- tekst nie może spadać poniżej 16 px.

### 768 px

- copy może znaleźć się nad proofem;
- sekwencje mogą przejść do 2 + 1 lub pionowego timeline'u;
- menu działa klawiaturą i dotykiem;
- CTA nadal mają jasną hierarchię.

### 430/390/375/320 px

- bezpieczna oś: 16 px od 375 px, 12 px przy 320 px;
- H1 i proof mają osobne zakresy typografii, bez `white-space: nowrap`;
- minimum 44 × 44 px dla celu dotykowego;
- zwykle pełna szerokość obu CTA i równa geometria;
- brak poziomych karuzel jako podstawowej prezentacji treści;
- mikrointerfejsy są przeprojektowane, nie tylko skalowane;
- kontrola rzeczywistych bounding boxów, nie wyłącznie `scrollWidth`.

### 200% zoom i długi polski tekst

- dwie kolumny przechodzą do jednej bez utraty kolejności DOM;
- nie wolno ustalać sztywnej wysokości sekcji zawierającej tekst;
- badge i rail mogą zawijać, ale nie mogą zasłaniać treści;
- proof zachowuje semantyczny opis, gdy wizualna gęstość musi spaść.

## 6. Motion i interakcje

- ruch tylko jako wsparcie relacji przyczynowej;
- wyłącznie `transform` i `opacity`;
- bez JS treść i CTA pozostają widoczne;
- `prefers-reduced-motion` usuwa przejścia;
- `details/summary` pozostaje natywnym mechanizmem FAQ;
- forced colors zachowuje granice i focus;
- żaden element wyglądający jak przycisk nie może być atrapą.

## 7. Treść i bezpieczeństwo obietnic

Zabronione bez osobnej, zaakceptowanej zmiany produktu:

- konkretne ceny, limity, trial, karta płatnicza i gwarancja rezygnacji;
- fikcyjne logotypy klientów, testimoniale, KPI, SLA, telefon i e-mail;
- CRM, Google Sheets, webhook lub integracje jako funkcje gotowe, jeśli nie są
  gotowe w produkcie;
- AI jako źródło pricingu lub scoringu;
- wiążąca wycena, automatyczna decyzja handlowa lub zastępowanie konsultacji;
- white-label, delegacja między tenantami i funkcje agencji poza istniejącym
  zakresem;
- dane osobowe wyglądające jak realny klient.

Każda wartość demonstracyjna musi być oznaczona. Pricing i score pozostają
potwierdzane po stronie serwera, a treści publiczne nie ujawniają prywatnych
reguł.

## 8. Gate visual QA pojedynczej sekcji

Sekcja może zostać zaakceptowana tylko po dostarczeniu:

1. wskazanej referencji i viewportu;
2. baseline'u przed zmianą;
3. renderu po zmianie na 1440 i 390 px;
4. overlay lub side-by-side wraz z listą świadomych różnic;
5. oceny minimum 18/20;
6. kontroli 320, 375, 390, 430, 768, 1024, 1280, 1440 i 1536 px;
7. 200% zoom, długiego copy, klawiatury, axe, reduced motion i forced colors;
8. braku overflow, błędów konsoli i atrap działania;
9. potwierdzenia prawdziwości copy;
10. zatrzymania przed następną sekcją do czasu akceptacji.
