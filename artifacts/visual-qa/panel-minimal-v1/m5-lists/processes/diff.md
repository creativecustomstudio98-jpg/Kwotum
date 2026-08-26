# M5 — lista procesów

## Wynik

PASS, 19/20. Builder, publikacja i instalacja pozostają poza zakresem M5.

| Kryterium                   | Punkty |
| --------------------------- | -----: |
| kompletność danych i stanów |    4/4 |
| geometria i proporcje       |    4/4 |
| typografia i spacing        |    4/4 |
| gęstość i hierarchia        |    4/4 |
| transformacja mobile        |    3/4 |

Mobilny widok świadomie pokazuje status i datę pod etykietami zamiast
naśladować siedmiokolumnową tabelę referencji. Jest czytelny i zadaniowy, ale
nie wykorzystuje pełnej gęstości desktopu.

## Trasa i chroniony stan

- `/panel/:organizationId/procesy`;
- jednorazowy tenant testowy i 109 syntetycznych procesów;
- strona wymaga tenant context, a serwis niezależnie wymusza `flow:read`;
- count, procesy i opublikowane wersje mają jawny `organization_id`;
- wersje są pobierane tylko dla procesów bieżącej strony.

## Referencja i artefakty

Główna referencja:
`docs/ui/panel-minimal-v1/reference/panel-dashboard-primary-1199x842.png`,
SHA-256 `824df7d47e16d9114ae66990a0d02e91f4954ce1ba7b5d1c4d180fea84aed6e1`.
Użyty region: płaska tabela operacyjna, cienkie linie, nagłówek kolumn i akcja
w topbarze. Nie kopiowano ticketów ani funkcji demonstracyjnych.

Artefakty: `before.png`, `after.png` 1536 × 1024,
`mobile-390x844.png`, `overlay-50.png`, `measurements.json` i
`canonical-reference.txt`. Odziedziczony `before.png` poprzedza zmianę shellu,
więc overlay dokumentuje również wcześniejszy chrome i nie jest automatycznym
pixel diffem samego M5.

## Dziesięć głównych różnic przed/po

1. Procesy są jedną płaską listą z separatorami zamiast zbiorem kart.
2. Cały wiersz jest jednym rzeczywistym linkiem do buildera.
3. Fokus wiersza jest widoczny klawiaturą oraz w forced colors.
4. Nazwa i liczba pytań tworzą jedną zwartą kolumnę tożsamości.
5. Status ma tekst i kropkę semantyczną, bez dekoracyjnej ikony lub gradientu.
6. Data używa tabularnych cyfr i natywnego elementu `time`.
7. Akcja „Nowy proces” prowadzi do realnej biblioteki szablonów.
8. Lista używa serwerowej paginacji po 12 rekordów oraz stabilnego porządku
   `updated_at desc`, `id asc`.
9. Mobile zmienia układ na opisane pola „Status” i „Ostatnia zmiana”, a te
   etykiety pozostają także w dostępnej nazwie desktopowego linku; nie ma
   poziomego przewijania.
10. Loading, empty i error zachowują ten sam płaski nagłówek i powierzchnię;
    błąd pozostaje komunikatem `alert`.

## QA

- M5 Playwright: scenariusz procesów 1/1; cały etap 3/3;
- 109 rekordów, 12 wierszy na stronie, jedna pozycja na stronie 10, poprawnie
  zablokowane krawędzie, pełny link i Enter do buildera: PASS;
- produkcyjna usługa `listFlowDraftPage`: 0, 1 i 109 rekordów, clamping,
  zakres ostatniej strony oraz wersje wyłącznie dla identyfikatorów bieżącej
  strony: unit PASS;
- nazwa 160 znaków bez spacji i długa nazwa ze spacjami zawijają się bez
  wejścia w sąsiednie kolumny i bez overflow na mobile: PASS;
- wysokość desktopowego wiersza 64–68 px, przerwa między wierszami 0–1 px;
- axe: 0 naruszeń; forced colors: fokus 3 px;
- 320/375/390/430/720/768/1024/1280/1440/1536 px: 0 px overflow;
- wspólny model 0/1/101 rekordów i clamping ostatniej strony: unit PASS;
- lint 8/8, typecheck 8/8, web unit 192/192, UI 38/38, RLS, WordPress i
  produkcyjny build 16/16: PASS.

## Bezpieczeństwo, prywatność i wydajność

Nie zmieniono FlowDocument, autosave, publikacji, uprawnień ani RLS. Lista nie
pobiera wszystkich procesów i wszystkich wersji: count jest osobny, rekordy
mają ograniczony zakres, a wersje są ograniczone do identyfikatorów strony.
Nie dodano zależności, zewnętrznych fontów ani fikcyjnych akcji.

## Rollback

Rollback jest wymagany, jeśli cały wiersz utraci osiągalny link, kolejność
przestanie być deterministyczna, paginacja ominie rekordy, mobile dostanie
overflow albo count, procesy lub wersje utracą tenant scope/`flow:read`.
Cofnięcie obejmuje listę, stronicowany odczyt i współdzieloną paginację; nie
wymaga migracji bazy ani zmian buildera.
