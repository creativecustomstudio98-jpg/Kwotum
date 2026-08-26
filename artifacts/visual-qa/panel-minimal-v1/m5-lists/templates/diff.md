# M5 — biblioteka szablonów

## Wynik

PASS, 19/20. Zakres obejmuje wybór szablonu i utworzenie procesu, bez zmian
FlowDocument lub buildera.

| Kryterium                   | Punkty |
| --------------------------- | -----: |
| kompletność danych i stanów |    4/4 |
| geometria i proporcje       |    3/4 |
| typografia i spacing        |    4/4 |
| gęstość i hierarchia        |    4/4 |
| transformacja mobile        |    4/4 |

Punkt geometrii pozostaje niewykorzystany, ponieważ referencja nie zawiera
biblioteki szablonów ani jej szczegółu. Dopasowanie dotyczy języka listy,
kontrolek i rytmu, nie nieistniejącego układu 1:1.

## Trasa i chroniony stan

- `/panel/:organizationId/szablony`;
- jednorazowy tenant testowy i kanoniczne szablony z `@wyceno/validation`;
- trasa po tenant context jawnie wymusza `flow:read`;
- server action ponownie pobiera tenant context, a utworzenie procesu wymusza
  `flow:write` w serwisie;
- klient wysyła wyłącznie slug. Nazwa, dokument i prefiks sluga nowego procesu
  pochodzą z kanonicznego szablonu po stronie serwera.

## Referencja i artefakty

Główna referencja:
`docs/ui/panel-minimal-v1/reference/panel-dashboard-primary-1199x842.png`,
SHA-256 `824df7d47e16d9114ae66990a0d02e91f4954ce1ba7b5d1c4d180fea84aed6e1`.
Użyty region: toolbar, zakładki, płaskie wiersze, granice i oszczędny kolor.
Pomocniczy obraz wyznacza wyłącznie profesjonalną typografię i proporcje
kontrolek.

Artefakty: `before.png`, `after.png` 1536 × 1024,
`mobile-390x844.png`, `overlay-50.png`, `measurements.json` i
`canonical-reference.txt`. `before.png` jest stanem sprzed ujednolicenia
shellu, dlatego overlay dokumentuje także wcześniejszą zmianę chrome.

## Dziesięć głównych różnic przed/po

1. Usunięto dekoracyjne zdjęcia, trzy KPI i kartową prezentację niepotrzebne
   do wyboru szablonu.
2. Szablony są płaskimi wierszami zadaniowymi z jednym separatorem.
3. Nazwa, opis, pytania, wymagane pola, reguły i złożoność są porównywalne na
   wspólnych osiach.
4. Wyszukiwanie, kategoria, złożoność, sortowanie i strona są trwałym stanem
   URL, obsługują Back/Forward oraz odświeżenie.
5. Query params są allowlistowane i ograniczone długością przed renderem.
6. Oddzielono prawdziwy brak szablonów od braku wyników bieżącego filtra.
7. „Podgląd” jest rzeczywistym przełącznikiem z `aria-pressed`; pełny podgląd
   pokazuje wszystkie pytania, a po wyborze fokus i viewport przechodzą do
   zmienionego szczegółu także na mobile.
8. „Użyj szablonu” jest prawdziwym server action ze stanem loading i błędem,
   bez zaufania do nazwy przesłanej przez klienta.
9. Usunięto atrapę „Nowy proces”; topbar ma tylko działający powrót „Moje
   procesy”.
10. Mobile układa filtry i metadane w czytelnej kolejności oraz pokazuje obie
    akcje pierwszego wiersza bez przewijania poza pierwszy ekran.

## QA

- M5 Playwright: scenariusz szablonów 1/1; cały etap 3/3;
- wyszukiwanie, kategoria, złożoność, sortowanie, Back, Forward, reload,
  wybór oraz pełny podgląd 5 pytań: PASS;
- model właściwy dla `TemplateLibrary` pokrywa 0, 1 i 101 rekordów, filtry,
  sortowanie, clamping oraz trwały URL: unit PASS;
- bezpośrednia trasa dla Sales zwraca bezpieczny error state bez danych i
  akcji; negatywny test `flow:write` zatrzymuje tworzenie przed klientem bazy:
  PASS;
- pozytywna akcja wysyła wyłącznie slug i tworzy proces z kanoniczną nazwą,
  dokumentem oraz prefiksem sluga po stronie serwera: PASS;
- brak `.template-summary-card` i mediów: PASS;
- axe desktop + mobile: 0 naruszeń; forced colors: fokus 3 px;
- pierwsza akcja mobile ma co najmniej 44 px i mieści się w 844 px;
- 320/375/390/430/720/768/1024/1280/1440/1536 px: 0 px overflow;
- wspólny model 0/1/101 rekordów i paginacja kolekcji: unit PASS;
- lint 8/8, typecheck 8/8, web unit 192/192, UI 38/38, RLS, WordPress i
  produkcyjny build 16/16: PASS.

## Bezpieczeństwo, prywatność i wydajność

Bezpośrednia trasa nie polega już wyłącznie na ukryciu linku w menu. Nazwa
procesu i dokument nie są danymi z klienta; nieznany slug kończy się błędem.
Nie zmieniono RLS, tenant scope ani walidacji FlowDocument. Filtrowanie pięciu
kanonicznych rekordów odbywa się lokalnie bez żądań sieciowych; paginacja mały
stały rozmiar strony 8. Nie dodano zależności ani mediów.

## Rollback

Rollback jest wymagany, jeśli filtr nie odtwarza się z URL, Back/Forward
traci stan, przycisk staje się atrapą, klient może nadać nazwę lub dokument
procesu, trasa omija `flow:read`, utworzenie omija `flow:write`, albo mobile
ma overflow lub zasłonięte akcje. Cofnięcie obejmuje bibliotekę, bezpieczną
akcję tworzenia, wspólną paginację i reguły M5; nie wymaga migracji bazy.
