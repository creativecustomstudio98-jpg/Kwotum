# Dashboard Lorum — rekonstrukcja referencji 2026-07-29

## Kontrakt etapu

- Trasa: `/panel/[organizationId]`.
- Zaakceptowany obraz:
  `artifacts/visual-qa/12t-dashboard-reconstruction/reference-dashboard.png`.
- Oryginał: 1964 × 1500 px.
- Viewport odbioru desktop: 1536 × 1024 px z rozwiniętym sidebarem Lorum.
- Viewporty responsive: 1024 × 768, 768 × 1024, 390 × 844 i 320 × 800.
- Główny JTBD: zobaczyć wynik okresu, rekordy wymagające reakcji oraz przejść
  do prawdziwego leada lub modułu bez szukania po panelu.

Załącznik nadpisuje wcześniejszy dashboard w zakresie hierarchii, gęstości,
liczby sekcji, typów wykresów i rytmu kart. Nie nadpisuje nazwy Lorum,
wspólnego sidebara, tenant scope, progów prywatności ani istniejącego modelu
danych.

## Dekompozycja referencji

1. Nagłówek z tytułem, opisem, wyszukiwaniem i zakresem dat.
2. Sześć małych KPI z ikonami, zmianą względem poprzedniego okresu i
   oszczędnym sparkline.
3. Rząd trzech wizualizacji: trend leadów, statusy i wartość wycen.
4. Rząd danych: najnowsze leady, ranking procesów oraz źródła.
5. Rząd operacyjny: przedziały wartości, rekordy wymagające reakcji i
   dostawy powiadomień.
6. Rząd skrótów i stanu publikacji/integracji.

## Mapowanie na realne dane

| Region referencji    | Implementacja Lorum                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| Nowe leady           | tenant-scoped agregat analityczny z 30 dni                                                         |
| Wartość wycen        | suma minimalnych wartości wycen PLN, jawnie oznaczona „od”                                         |
| Konwersja            | sesja ze zgodą → zapisany lead                                                                     |
| Czas                 | serwerowa mediana start → wynik                                                                    |
| Aktywne formularze   | liczba opublikowanych procesów dla roli z `flow:read`; wynik procesu dla roli bez tego uprawnienia |
| Wymaga uwagi         | nowe leady oraz obsługa trwająca co najmniej trzy dni                                              |
| Trend i słupki       | rekordy leadów przypisane do dni okresu                                                            |
| Statusy              | rzeczywiste statusy leadów                                                                         |
| Ranking              | liczba leadów według `flowTitle`, bez udawanej konwersji formularza                                |
| Źródła               | prywatnościowy agregat RPC, tylko po osiągnięciu minimalnej próby                                  |
| Powiadomienia        | prawdziwe, zamaskowane dostawy e-mail z ostatnich 30 dni                                           |
| Procesy i integracje | opublikowane procesy, dostawy oraz połączenie WordPress                                            |

## Świadome wyłączenia

- „Aktywność zespołu” nie jest renderowana, ponieważ MVP nie ma modelu
  przypisania leada do członka zespołu.
- Google Analytics, Facebook Pixel i Google Ads nie są udawane. Dashboard
  pokazuje wyłącznie istniejącą integrację WordPress i wewnętrzną analitykę.
- Przyciski „przypomnij”, „skontaktuj się” i „aktualizuj” z obrazu nie są
  kopiowane bez odpowiadających im server actions. Każdy rekord prowadzi do
  istniejącego szczegółu leada.
- Przykładowe osoby, wartości i trendy z obrazu nie zastępują danych
  organizacji.

## Dziesięć różnic baseline → cel

1. Cztery duże KPI zastępuje sześć mniejszych kart.
2. Nagłówek otrzymuje opis, działające wyszukiwanie i dokładny zakres dat.
3. Słupki liczby leadów zastępuje dwuseryjny wykres trendu.
4. Donut jakości zastępuje operacyjny rozkład statusów.
5. Dochodzi drugi wykres rzeczywistej wartości wycen według dnia.
6. Lista czterech leadów staje się pięciowierszową, semantyczną tabelą.
7. Dochodzi ranking najaktywniejszych procesów.
8. Dochodzi prywatnościowy rozkład źródeł.
9. Dochodzą przedziały wartości, lista reakcji i historia dostaw.
10. Dochodzą działające szybkie akcje oraz stan procesów i integracji.

## Responsive i dostępność

- Desktop wide: 6 KPI, rzędy po trzy karty i pełna szerokość workspace.
- Tablet: 3 KPI w rzędzie oraz dwie kolumny kart.
- Mobile: najpierw rekordy wymagające reakcji, potem KPI 2 × 3, najnowsze
  leady i wykresy; tabela przechodzi w karty bez utraty pól.
- Wykresy mają `role="img"` i pełne etykiety tekstowe.
- Wyszukiwarka jest prawdziwym formularzem GET do listy leadów.
- Wszystkie CTA są linkami do istniejących tras i respektują capabilities.
- Loading respektuje `prefers-reduced-motion`, a wykresy mają wariant
  `forced-colors`.

## Artefakty odbioru

Katalog `artifacts/visual-qa/12t-dashboard-reconstruction/` zawiera obraz
źródłowy, baseline, kolejne rendery, wariant mobile, overlay, difference,
raport geometrii i wynik dostępności.
