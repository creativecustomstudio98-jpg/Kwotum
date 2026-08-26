# M7 — podgląd, udostępnianie i instalacja

## Wynik

PASS, 19/20.

| Kryterium                   | Punkty |
| --------------------------- | -----: |
| kompletność regionów        |    4/4 |
| geometria i proporcje       |    4/4 |
| typografia i spacing        |    4/4 |
| gęstość danych oraz stany   |    4/4 |
| transformacja mobile        |    3/4 |

Na mobile zachowano pełną funkcjonalność, więc ekran pozostaje długi. Logiczna
kolejność i przewijany pojedynczy rząd trybów są poprawne, lecz gęstość nie
dorównuje desktopowi.

## Trasa i chroniony stan

- `/panel/:organizationId/procesy/:flowId/instalacja`;
- jednorazowy tenant testowy z opublikowaną wersją procesu;
- podgląd jest lokalny i bezstanowy: nie wysyła żądań do `/api/v1/public/`,
  nie tworzy sesji ani leada i nie zapisuje odpowiedzi;
- hosted link nie zawiera tokenu zaproszenia, a kod instalacyjny zachowuje
  publiczny identyfikator, tryb i istniejące zabezpieczenia originów.

## Referencja, viewport i artefakty

Referencje, regiony i SHA-256 są zapisane w `canonical-reference.txt`.
Główna referencja steruje relacją dużej powierzchni roboczej i cichszego raila,
a regionalna tylko trackiem Inline/Popup/Fullscreen/Hosted link. Nie kopiowano
demonstracyjnej treści, ciemnego tła ani poświaty.

Porównanie powstało na macOS 26.5.2 arm64, Chromium z Playwright 1.61.0,
`pl-PL`, light mode i skali 1. `before.png` jest kadrem 1440 × 1000 z
poprzedniego pełnego baseline'u, a `after.png` finalnym viewportem 1440 × 1000.
`overlay-50.png` i `difference.png` służą do review kierunku, nie pixel diffu
1:1 z dashboardową referencją.

## Dziesięć głównych różnic przed/po

1. Preview i formularz wysyłki tworzą jedną dominującą powierzchnię z rail'em
   320 px zamiast obramowanej kompozycji wielu kart.
2. Device switch jest zwartym trackiem segmentowym z miękkim aktywnym stanem.
3. Sposób osadzenia jest jednym długim trackiem czterech sąsiadujących opcji.
4. Aktywny tryb nie używa dolnej linii, cienia ani dodatkowej poświaty.
5. Sekcja instalacji ma relację 812 px / 300 px i mniej konkurujących obramowań.
6. Dozwolone domeny, kod i diagnostyka zachowują realne dane oraz akcje, ale
   mają płaską hierarchię.
7. Historia wysyłki jest pełną sekcją operacyjną, nie dekoracyjnym KPI.
8. Cały podgląd klienta pozostaje tym samym rendererem, a komunikat jasno mówi
   o braku zapisu.
9. Mobile układa preview, wysyłkę, historię, tryby, originy, kod i diagnostykę
   w logicznej kolejności bez bocznego overflow dokumentu.
10. Cztery tryby na mobile pozostają jednym poziomo przewijanym rzędem z
    celami powyżej 44 px, zamiast łamać się w nierówne karty.

## QA

- celowany scenariusz M7 instalacji: 1/1, fixture cleanup: 0 pozostałości;
- tryby Inline/Popup/Fullscreen/Hosted link generują właściwy realny kod;
- hosted link nie zawiera `token=`, a link klienta pozostaje rzeczywistym
  odnośnikiem;
- ukończenie lokalnego preview: 0 żądań do publicznego API;
- macierz 320/375/390/430/768/1024/1280/1440/1536 px: 0 px overflow;
- desktop: preview 792 px, rail wysyłki 320 px, instalacja 812 px i rail 300 px;
- wszystkie płaskie powierzchnie mają `box-shadow: none`, a tekst funkcjonalny
  co najmniej 12 px;
- klawiatura: ArrowLeft/ArrowRight, Home i End dla urządzeń oraz trybów;
- axe: 0 naruszeń; forced colors: fokus 3 px; reduced motion: 0 s;
- 200% zoom sprawdzony przez równoważny reflow 768 px;
- pełny wynik repozytoryjnych bramek zapisano w `docs/TASKS.md` po końcowym
  przebiegu.

Zachowano dodatkowy obraz forced colors jako dowód osobnego ryzyka
dostępności; nie jest pośrednią iteracją.

## Bezpieczeństwo, prywatność i wydajność

Nie dodano zależności, endpointów, danych ani migracji. Tenant scope i
capability pozostają po stronie serwera. Podgląd jest bezstanowy, kod nie
ujawnia sekretu, a lista originów nadal steruje wyłącznie osadzaniem
zewnętrznym. Zmiana CSS nie zwiększa liczby zapytań ani bundle'u widgetu.

## Rollback

Rollback jest wymagany, jeśli podgląd wykona publiczny zapis, hosted link
ujawni token, kod trybu stanie się błędny, origin guard przestanie działać,
kontrolki utracą obsługę klawiaturą lub którykolwiek viewport dostanie overflow.
Wycofanie obejmuje klasy M7, semantykę segmentów i test instalacji; nie wymaga
migracji bazy ani zmiany publicznego kontraktu.
