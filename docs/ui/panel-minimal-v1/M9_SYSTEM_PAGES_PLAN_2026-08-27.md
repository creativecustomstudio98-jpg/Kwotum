# M9 — plan profesjonalizacji Integracji, Ustawień i Pomocy

**Status:** plan sekwencyjny po korekcie białego canvasa i nawigacji
**Data:** 2026-08-27
**Zakres:** wyłącznie istniejące funkcje, dane, role i akcje panelu

## Cel

Ekrany systemowe mają wyglądać jak jedna część Kwotum, a nie trzy osobne
szablony dashboardu. Profesjonalny efekt ma wynikać z jasnej hierarchii zadań,
małej liczby celowych separatorów, wspólnych osi i spokojnej białej powierzchni.
Nie dodajemy KPI, dekoracyjnych kart, gradientów, fikcyjnych ustawień ani
„inteligentnych” podsumowań bez modelu domenowego.

Korekta M2.W, wykonana przed M9, ustanawia wspólną bazę:

- jeden biały canvas;
- kompaktowy filtr segmentowy dla pięciu statusów Leadów;
- zakładki tras Ustawień i Integracji o szerokości treści, bez pełnej dolnej
  linii;
- biała Pomoc bez lokalnego zielonoszarego tła, ramy i cienia całej strony.

## Kolejność etapów

### M9.1 — Integracje

Najpierw przebudować WordPress i Webhooki, ponieważ obecny układ ma najwięcej
konkurujących linii i dzieli jedno zadanie na zbyt wiele równorzędnych bloków.

Docelowa anatomia:

1. wspólny nagłówek i istniejące zakładki `WordPress` / `Webhooki`;
2. krótki stan połączenia z jedną najważniejszą akcją;
3. jedna powierzchnia konfiguracji, prowadzona w kolejności wykonania;
4. płaska lista połączonych stron albo endpointów, z separatorem tylko między
   rekordami;
5. historia dostaw jako osobna, skanowalna sekcja techniczna bez payloadu i
   danych osobowych.

Należy usunąć obramowanie całej siatki, podwójne granice stykających się kart i
linie niemające funkcji grupowania. Zostają: HMAC, rotacja sekretu, walidacja
HTTPS/DNS/IP, request ID, audyt, capability gating i tenant scope.

Gate M9.1: WordPress i Webhooki dla loading/empty/connected/error, Owner/Admin
oraz roli bez uprawnienia, desktop 1440 × 900, tablet 768 × 1024, mobile
390 × 844 i 320 × 800, axe, forced colors, pełne akcje i cleanup fixture'u.

### M9.2 — Ustawienia

Po zamknięciu Integracji uporządkować istniejące pola według zadań, bez
tworzenia „AI template” z przypadkowymi kartami:

1. `Organizacja`: nazwa i pola edytowalne jako główny formularz, identyfikator,
   konto i rola jako spokojne metadane tylko do odczytu;
2. `Branding`: podgląd oraz nazwa, akcent i bezpieczne logo w jednej relacji
   przyczyna–efekt;
3. `Powiadomienia`: kanały i dostawa leadów pogrupowane według odbiorcy i
   zdarzenia;
4. `Dane i prywatność`: retencja, eksport i granice tenanta z jasnym opisem
   konsekwencji.

Sekcja może mieć lokalną ramę tylko wtedy, gdy grupuje formularz i jego akcję.
Nie wolno powtarzać pełnej ramy wokół każdego pola ani prezentować danych
technicznych jak KPI. Save, success i error pozostają przy właściwym
formularzu.

Gate M9.2: role i capability, walidacja serwerowa, przypadki negatywne drugiego
tenanta, loading/success/error, klawiatura, zoom 200%, macierz responsive i
brak zmiany wartości bez jawnego zapisu.

### M9.3 — Pomoc

Na końcu uprościć informacyjną architekturę Pomocy, zachowując istniejące
wyszukiwanie, filtrowanie według roli i działające linki:

1. białe intro z wyszukiwaniem;
2. trzy szybkie ścieżki jako lekka lista celów;
3. spis treści jako pomocniczy indeks, sticky tylko na szerokim ekranie;
4. instrukcje jako spokojne sekcje rozwijane;
5. jeden separator między dużymi regionami, linie między rekordami tylko tam,
   gdzie pomagają skanowaniu.

Nie używać kolorowego tła całej strony. Zieleń służy aktywności, fokusowi,
ikonom kategorii i linkom, nie dekoracji powierzchni.

Gate M9.3: wszystkie role, wyszukiwanie z wynikiem i bez wyniku, linki,
klawiatura, czytnik ekranu, axe, forced colors oraz 320–1536 px bez overflow.

### M9.4 — wejście do panelu

Dopiero po zamknięciu trzech ekranów uporządkować onboarding i wybór
organizacji. Nie należy przenosić ich kompozycji do Ustawień ani Integracji,
ponieważ służą innemu zadaniu i innemu momentowi podróży użytkownika.

## Wspólne kryteria odbioru

- maksymalnie jedna główna akcja w regionie;
- biała powierzchnia główna i centralne tokeny `@wyceno/ui`;
- żadnej lokalnej palety, nowej zależności ani migracji;
- działanie, autoryzacja, tenant scope i stany zachowane przed zmianą wyglądu;
- `before`, `after`, `overlay/difference`, mobile i pomiary dla każdego etapu;
- format, lint, typecheck, unit, PostgreSQL/RLS, WordPress, build i celowane E2E
  przed rozpoczęciem następnego podetapu.

## Rollback

Każdy podetap jest osobnym małym diffem kompozycji i CSS. Rollback przywraca
wyłącznie układ danego ekranu; nie cofa danych, sekretów, połączeń ani migracji,
bo M9 nie zmienia ich kontraktów.
