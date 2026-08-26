# M5 — lista leadów

## Wynik

PASS, 19/20. Zakres obejmuje wyłącznie listę leadów; szczegół leada pozostaje
etapem M6.

| Kryterium                   | Punkty |
| --------------------------- | -----: |
| kompletność danych i stanów |    4/4 |
| geometria i proporcje       |    3/4 |
| typografia i spacing        |    4/4 |
| gęstość i hierarchia        |    4/4 |
| transformacja mobile        |    4/4 |

Jeden punkt geometrii pozostaje świadomie niewykorzystany: produktowa tabela
ma siedem kolumn zamiast kopiować układ ticketów z referencji. Zachowuje jej
rytm, płaskie separatory i hierarchię, ale nie obce pola domenowe.

## Trasa i chroniony stan

- `/panel/:organizationId/leady`;
- jednorazowy tenant testowy, 102 syntetyczne leady, strona po 8 rekordów;
- dostęp wymaga tenant context i `lead:read`; akcja „Nowy lead” jest dodatkowo
  widoczna tylko przy `flow:read` i istniejącym opublikowanym procesie;
- wszystkie zapytania, liczniki i odpowiedzi terminu mają jawny
  `organization_id`; terminy są pobierane tylko dla identyfikatorów bieżącej
  strony.

## Referencja i artefakty

Główna referencja:
`docs/ui/panel-minimal-v1/reference/panel-dashboard-primary-1199x842.png`,
SHA-256 `824df7d47e16d9114ae66990a0d02e91f4954ce1ba7b5d1c4d180fea84aed6e1`.
Użyty region: dolna tabela operacyjna, wyszukiwanie, filtr, statusy i akcja w
nagłówku. Pomocniczy obraz służy wyłącznie jako kierunek typografii i
oszczędnego koloru.

Artefakty: `before.png`, `after.png` 1536 × 1024,
`mobile-390x844.png`, `overlay-50.png`, `measurements.json` i
`canonical-reference.txt`. `before.png` jest odziedziczonym stanem sprzed
ujednolicenia shellu; overlay pokazuje więc również wcześniejszą zmianę chrome
i nie służy do automatycznego pixel diffu regionu M5.

## Dziesięć głównych różnic przed/po

1. Lista nie pobiera już maksymalnie 100 rekordów do pamięci; używa dokładnego
   countu oraz serwerowego zakresu strony.
2. Kolejność jest stabilna: `submitted_at desc`, następnie `id asc`.
3. Wyszukiwanie obejmuje klienta, e-mail, telefon i nazwę procesu, ma limit 80
   znaków i sanitację składni filtra.
4. Status, wyszukiwanie i strona pozostają w query params, także po zmianie
   filtra.
5. Krawędziowe kontrolki paginacji są prawdziwie nieaktywne i nie trafiają do
   kolejności fokusu.
6. Desktop używa semantycznych `table`, `th`, `scope` i jednego płaskiego
   separatora zamiast osobnych kart.
7. Klient, usługa, wynik, budżet, termin, status i data mają stałe osie oraz
   tabularne liczby.
8. Status jest tekstem z kropką i kolorem semantycznym, nie samym kolorem.
9. Mobile jest osobnym `ul` z czytelnym porządkiem zadaniowym, a nie tabelą
   przestylowaną przez `display: block`.
10. Każdy mobilny rekord ma widoczną, co najmniej 44-pikselową akcję „Otwórz”
    i jednoznaczny fokus w forced colors; mobilne cele paginacji także mają
    minimum 44 × 44 px.

## QA

- M5 Playwright: scenariusz leadów 1/1; cały etap 3/3;
- 102 rekordy, ostatnia strona, obie zablokowane krawędzie, wyszukiwanie oraz
  zachowanie filtrów: PASS;
- produkcyjna usługa `listLeadPage`: 0, 1 i 102 rekordy, clamping, dokładny
  count, zakres ostatniej strony, stabilne sortowanie i tenant scope: unit
  PASS; E2E dodatkowo potwierdza 1 wynik i pusty wynik wyszukiwania;
- desktopowa tabela i mobilna lista zadaniowa: PASS;
- axe WCAG 2 A/AA, 2.1 AA i 2.2 AA: 0 naruszeń;
- forced colors: fokus 3 px;
- 320/375/390/430/720/768/1024/1280/1440/1536 px: 0 px overflow;
- wspólny model 0/1/101 rekordów i okna paginacji: unit PASS;
- lint 8/8, typecheck 8/8, web unit 192/192, UI 38/38, RLS, WordPress i
  produkcyjny build 16/16: PASS.

## Bezpieczeństwo, prywatność i wydajność

Nie zmieniono RLS, autoryzacji ani publicznych kontraktów. Nie ma zapytania bez
tenant scope, danych klienta spoza bieżącej strony ani filtrowania całej bazy w
kliencie. Artefakty zawierają wyłącznie fixture syntetyczny. Strona wykonuje
ograniczone zapytanie zakresowe; dodatkowa odpowiedź „termin” dotyczy najwyżej
8 leadów. Nie dodano zależności ani żądań zewnętrznych.

## Rollback

Rollback jest wymagany, jeśli count i wyniki się rozjadą, filtr utraci query
params, tabela przestanie być semantyczna, mobile wróci do ukrytego
przestylowania tabeli, kontrolka disabled stanie się linkiem albo którekolwiek
zapytanie utraci `organization_id` lub `lead:read`. Cofnięcie obejmuje serwis
stronicowania, współdzielony model paginacji, stronę listy i reguły M5; nie
wymaga migracji bazy.
