# `/jak-dziala` — korekta zgodności z marketingiem V7

## Wynik

Podstrona `/jak-dziala` została przebudowana z niezależnego, kartowego
template'u na ciągłą historię procesu zgodną z zaakceptowaną stroną główną i
`/produkt`. Zakres jest prezentacyjny: nie zmienia logiki produktu, API,
autoryzacji, tenant scope, RLS, pricingu ani scoringu.

## Źródła wizualne

- zaakceptowana strona główna V7:
  `artifacts/visual-qa/landing-desktop-v7/footer-overview/full-page-1672.png`;
- zaakceptowany `/produkt`:
  `artifacts/visual-qa/marketing-subpages-v1/r2-home-aligned/product-1440-final.png`
  i `product-390-final.png`;
- stan wejściowy `/jak-dziala`:
  `artifacts/visual-qa/marketing-subpages-v1/r3-home-aligned/before/how-1440.png`
  i `how-390.png`;
- wynik:
  `artifacts/visual-qa/marketing-subpages-v1/r3-home-aligned/after/how-1440-final.png`
  i `how-390-final.png`.

## Zrealizowana kompozycja

1. Hero wykorzystuje V7 copy + proof i pokazuje realną drogę od wyniku klienta
   do leada w panelu, z serwerem jako jawną granicą potwierdzenia.
2. Rail pokazuje od początku pełną ścieżkę: konfiguracja, publikacja, sesja,
   wynik, gotowy lead i decyzja firmy.
3. Trzy rozdziały łączą po dwa etapy z jednym dominującym ekranem produktu.
   Numeracja biegnie 01–06 i nie resetuje się lokalnie.
4. Desktop oraz mobile korzystają z osobnych, rzeczywistych kadrów tego samego
   zadania. Wszystkie obrazy mają opis alternatywny i podpis danych
   demonstracyjnych.
5. Bezpieczeństwo jest jednym modelem trzech barier, bez marketingowych
   gwarancji i bez mnożenia kart.
6. Finał jest jasny, zgodny z `/produkt` i prowadzi do działających tras
   `/branze` oraz `/logowanie`.

## Kontrola jakości

- viewporty: 1536, 1440, 1280, 1024, 768, 430, 390 i 320 px;
- dedykowane E2E R3.V7: 42/42;
- axe: brak naruszeń WCAG 2 A/AA, 2.1 AA i 2.2 AA;
- forced-colors: hero i model bezpieczeństwa zachowują strukturę;
- bez JavaScriptu: sześć sekcji, sześć etapów i trzy ekrany są dostępne;
- brak poziomego overflow;
- najmniejszy tekst: 12 px;
- finalny build web: 42 trasy, `/jak-dziala` prerenderowane statycznie.

## Ryzyka i rollback

Pełna narracja jest na telefonie dłuższa niż wcześniejszy wariant oparty na
zamkniętych `details`, ale nie ukrywa kluczowych informacji i pozostaje w tym
samym rytmie co zaakceptowany `/produkt`. Assety ekranów ważą łącznie poniżej
160 KB i są ładowane z lokalnego originu. Rollback wymaga wyłącznie
przywrócenia poprzedniego JSX, CSS i testów; migracja danych nie istnieje.

## Odbiór ręczny

- `http://127.0.0.1:3000/jak-dziala`;
- sprawdzić pierwszy viewport 1440 × 1000 oraz 390 × 844;
- potwierdzić, że wizualny język jest tym samym systemem co home V7 i
  `/produkt`, a nie osobnym template'em;
- potwierdzić czytelność kolejności 01–06 i właściwe kadry desktop/mobile.
