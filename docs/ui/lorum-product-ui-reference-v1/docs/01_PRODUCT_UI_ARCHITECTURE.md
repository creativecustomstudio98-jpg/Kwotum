# 01 — Architektura interfejsu produktu

**Status:** CANONICAL

## 1. Model nawigacji

### Główna nawigacja panelu

1. Dashboard
2. Leady
3. Procesy
4. Szablony
5. Analityka
6. Integracje
7. Klienci — tylko dla kont agencyjnych
8. Ustawienia
9. Pomoc

Nawigacja ma być trwała, spokojna i przewidywalna. Nie używaj rozwijanych „mega menu” wewnątrz panelu. Moduły podrzędne trafiają do lokalnej nawigacji ekranu, zakładek lub listy ustawień.

## 2. App shell — desktop

```text
[sidebar 208 px] [stage: topbar 76 px + content]
```

### Sidebar

- stała szerokość około 208 px,
- ciemna zieleń,
- jedna aktywna pozycja z delikatnym jaśniejszym tłem,
- logo i nazwa na górze,
- profil na dole,
- bez dużych kafli i ilustracji,
- ikony liniowe, 17–19 px,
- tekst 14–15 px w produkcyjnym CSS.

### Topbar

- kontekst organizacji lub procesu nad H1,
- H1 i status w jednej logicznej grupie,
- działania po prawej,
- maksymalnie jedno główne CTA,
- akcje drugorzędne jako outline/ghost,
- wysokość stała, bez hero-like pustej przestrzeni.

### Obszar treści

- tło warm off-white,
- panele białe,
- wyraźna siatka,
- desktopowa gęstość B2B,
- brak losowych maksymalnych szerokości w każdym ekranie,
- sticky tylko tam, gdzie wspiera długą pracę: builder, lead actions, filtry.

## 3. App shell — mobile

Mobile nie jest zwężonym desktopem.

```text
[header 56–60 px]
[content]
[bottom navigation 60–64 px] — tylko główne moduły
```

- sidebar znika,
- bottom navigation pokazuje maksymalnie 5 najważniejszych modułów,
- widoki szczegółowe używają nagłówka z powrotem i menu kontekstowym,
- akcja główna może być sticky na dole,
- filtry otwierają drawer,
- tabele zamieniają się w listy rekordów,
- builder przechodzi w drill-down: lista kroków → edycja kroku → ustawienia.

## 4. Moduły i ich rola

### 4.1 Dashboard

Odpowiada na:

- co wymaga reakcji,
- czy proces działa,
- ile leadów powstało,
- jaka jest ich jakość,
- co właściciel powinien zrobić teraz.

Kolejność:

1. „Wymaga uwagi”,
2. główne wartości,
3. trend i jakość,
4. najnowsze leady,
5. następny krok.

### 4.2 Leady

Desktop:

- status tabs,
- wyszukiwanie,
- filtry,
- tabela,
- paginacja,
- opcjonalny detail drawer dopiero później.

Mobile:

- kompaktowe karty rekordów,
- score, budżet, status,
- telefon i e-mail dostępne bez wejścia w szczegóły,
- filtry w drawerze.

### 4.3 Szczegóły leada

- nagłówek z identyfikacją i score,
- źródłowe podsumowanie,
- odpowiedzi,
- pliki,
- historia,
- zgody,
- panel kontaktu i obsługi,
- dane techniczne/UTM jako informacja drugorzędna.

AI summary może być dodatkiem, nie źródłem prawdy.

### 4.4 Procesy

Widok listy procesów powinien pokazywać:

- nazwę,
- status publikacji,
- wersję,
- liczbę leadów,
- conversion rate,
- datę modyfikacji,
- instalację,
- szybki dostęp do edycji, testu i publikacji.

Nie używaj wielkich kart ze screenshotem dla każdego procesu. Główna forma to zwarta lista/tabela z jednym wyróżnionym pustym stanem dla pierwszego procesu.

### 4.5 Builder

Najważniejszy ekran produktu.

Desktop:

```text
[lista kroków 278 px] [podgląd 1fr] [inspektor 330 px]
```

- lewa: kroki, grupy, wynik, ostrzeżenia,
- środek: realny widget i test zachowania,
- prawa: ustawienia zależne od zaznaczonego elementu,
- topbar: status, zapis, undo/redo, desktop/mobile, test, publikacja.

Mobile:

- lista kroków,
- oddzielna strona edycji wybranego kroku,
- oddzielne ekrany odpowiedzi, logiki, wyceny i scoringu,
- sticky save/publish,
- brak prób zmieszczenia trzech kolumn.

### 4.6 Logika, wycena, scoring i wyniki

Wspólny obszar konfiguracyjny z zakładkami:

- Logika,
- Wycena,
- Scoring,
- Warianty wyniku.

Każda reguła ma czytelny język IF/THEN, status, walidację i możliwość testu. Podgląd wyniku pozostaje widoczny w prawej kolumnie na desktopie.

### 4.7 Analityka

- lejek procesu,
- trend leadów,
- źródła i jakość,
- urządzenia,
- wersje flow,
- jasne komunikaty przy zbyt małej liczbie danych.

Nie pokazuj wykresu dla dwóch rekordów tylko dlatego, że „dashboard powinien mieć wykres”.

### 4.8 Szablony

- realny zakres pytań, logiki i wyników,
- filtr branży,
- akcja „Zobacz proces” i „Użyj szablonu”,
- oznaczenie Gotowy/Beta,
- konfiguracja done-for-you jako osobna, rzeczowa oferta.

### 4.9 Instalacja i WordPress

- status publikacji,
- tryb inline/popup/fullscreen/hosted,
- kod instalacyjny,
- trigger button,
- diagnostyka,
- połączenie WordPress,
- test działania.

### 4.10 Integracje i webhooki

- lista połączeń,
- stan połączenia,
- ustawienia,
- log dostaw webhooków,
- retry,
- podpis/sekret maskowany,
- jasne błędy i dokumentacja payloadu.

### 4.11 Agency

- lista klientów,
- procesy i zużycie,
- plan/status,
- szybkie utworzenie draftu,
- white-label,
- marża i rozliczenia jako osobne ustawienia,
- role oraz granice dostępu.

### 4.12 Ustawienia

Lokalna nawigacja:

- Organizacja,
- Branding widgetu,
- Domeny,
- Powiadomienia,
- Zespół i role,
- Dane i prywatność,
- API i klucze,
- Plan i rozliczenia.

Każda zakładka ma jeden główny cel. Nie łącz wszystkiego w jedną niekończącą się stronę formularza.

### 4.13 Onboarding

- zapis postępu,
- możliwość pominięcia,
- postęp krok po kroku,
- wybór szablonu/start od zera/zamówienie konfiguracji,
- branding,
- test,
- publikacja,
- instalacja.

Nie używaj marketingowej karuzeli ani ilustracji bez funkcji.

### 4.14 Publiczny widget

- jasny progress,
- jedno pytanie na ekran,
- odpowiedzi wygodne dotykowo,
- wstecz/dalej,
- autosave sesji,
- upload,
- kontakt i zgody,
- wynik z orientacyjnym charakterem,
- jasny następny krok,
- możliwość osadzenia i hosted link.
