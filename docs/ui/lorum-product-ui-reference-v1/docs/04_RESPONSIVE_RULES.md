# 04 — Reguły responsive

**Status:** CANONICAL

## 1. Breakpointy funkcjonalne

Nie dobieraj breakpointów wyłącznie pod popularne urządzenia. Użyj punktów, w których układ przestaje działać.

Rekomendowana baza:

```text
mobile:       0–639 px
tablet:       640–1023 px
desktop:      1024–1439 px
wide desktop: 1440 px+
```

## 2. Zasada transformacji

Responsive nie oznacza tylko `grid-template-columns: 1fr`.

Dla każdego modułu określ:

- priorytet informacji,
- elementy pozostające inline,
- elementy przenoszone do drawer/menu,
- elementy sticky,
- skrócone etykiety,
- akcję główną,
- bezpieczne przewijanie.

## 3. App shell

### Desktop

- sidebar 208–224 px,
- topbar 72–80 px,
- content scrolluje niezależnie tylko tam, gdzie uzasadnione,
- minimalna szerokość aplikacji bez degradacji: około 1024 px.

### Tablet

- sidebar może przejść w wariant icon rail lub drawer,
- topbar nadal pokazuje kontekst i główne CTA,
- wielokolumnowe ekrany redukują liczbę paneli,
- tabelę można przewijać poziomo tylko jako ostateczność.

### Mobile

- header 56–60 px,
- bottom navigation 60–64 px na ekranach głównych,
- ekran szczegółowy bez bottom navigation, gdy potrzebuje sticky actions,
- padding 14–18 px,
- targety dotykowe minimum 40–44 px dla głównych kontrolek.

## 4. Dashboard

Mobile kolejność:

1. powitanie/kontekst,
2. pilne alerty,
3. 2×2 najważniejsze KPI,
4. najnowsze leady,
5. następny krok.

Wykresy z desktopu mogą zostać:

- uproszczone,
- przesunięte niżej,
- zastąpione podsumowaniem, jeżeli nie mieszczą się czytelnie.

## 5. Leady

Desktop tabela → mobile lista kart.

Mobile karta zawiera:

- klient/usługa,
- score,
- status,
- budżet lub wartość,
- telefon,
- e-mail,
- wejście w szczegóły.

Filtry otwierają bottom sheet/drawer. Nie umieszczaj 8 selectów jeden pod drugim nad listą.

## 6. Szczegóły leada

Desktop: dwie kolumny.  
Mobile: jedna kolejność:

1. osoba i score,
2. reasons/status,
3. podsumowanie,
4. materiały,
5. obsługa,
6. historia,
7. dane techniczne.

Główne działania są sticky na dole. Nie chowaj telefonu i e-maila w kebab menu.

## 7. Builder

### Desktop

- trzy kolumny,
- panel kroków i inspektor mają kontrolowaną szerokość,
- podgląd jest dominantą.

### Tablet

- lista kroków może być zwijana,
- inspektor jako panel boczny/drawer,
- podgląd pozostaje użyteczny.

### Mobile

- osobne ekrany:
  1. lista kroków,
  2. edycja podstawowa,
  3. odpowiedzi,
  4. logika,
  5. wycena,
  6. scoring,
  7. test.
- sticky save/publish,
- brak drag-and-drop jako jedynej metody sortowania,
- alternatywa: przenieś wyżej/niżej.

## 8. Analityka

- metryki 2 kolumny,
- wykresy pełna szerokość,
- tabela źródeł jako lista,
- legenda pod wykresem,
- tooltip dostępny dotykowo,
- empty state zamiast pustego wykresu.

## 9. Ustawienia

Desktop: lokalne menu + formularz.  
Mobile: lista kategorii → osobny ekran ustawień. Nie pokazuj bocznego menu nad pełnym formularzem.

## 10. Publiczny widget

- projekt mobile-first,
- jedno pytanie na ekran,
- stały progress,
- akcje w bezpiecznej strefie,
- autosave,
- klawiatura nie może zasłaniać aktywnego pola i CTA,
- safe-area inset na iOS,
- upload ma jasne limity i status.

## 11. Testowane szerokości

Obowiązkowo:

```text
375 × 812
390 × 844
768 × 1024
1280 × 800
1440 × 900
1536 × 1024
```

Dodatkowo sprawdź zoom przeglądarki 200% dla krytycznych ekranów.
