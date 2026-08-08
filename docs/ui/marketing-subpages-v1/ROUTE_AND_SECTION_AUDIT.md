# Audyt tras i sekcji — marketing subpages V1

**Data:** 2026-08-02
**Status:** baseline 19 istniejących tras zamknięty; ujawniona luka `/integracje`
**Zakres:** 19 publicznych podstron poza zaakceptowaną stroną główną `/`

## 1. Metoda i źródła prawdy

Audyt łączy:

- render każdej trasy w `1440 × 1000` i `390 × 844`;
- pomiar wysokości dokumentu, liczby sekcji, overflow i błędów przeglądarki;
- inspekcję struktury TSX, wspólnych komponentów i aktywnych klas CSS;
- porównanie z zaakceptowanym językiem strony głównej V7/M1–M3;
- kontrolę zgodności treści z `PRODUCT_REQUIREMENTS.md`, `SCOPE.md`,
  `NON_GOALS.md`, `SECURITY.md` i ADR-027/028/033.

Artefakty baseline:

- `artifacts/visual-qa/marketing-subpages-v1/audit/desktop/`;
- `artifacts/visual-qa/marketing-subpages-v1/audit/mobile/`;
- `artifacts/visual-qa/marketing-subpages-v1/audit/metrics.json`;
- `scripts/audit-marketing-subpages.mjs`.

Wynik techniczny baseline: **38/38 renderów ma HTTP 200, zero błędów
konsoli/pageerror i zero poziomego overflow**. Stabilność nie oznacza jednak
zgodności wizualnej ze stroną główną.

## 2. Diagnoza przekrojowa

### Co działa i musi zostać zachowane

- Prawdziwa, konkretna treść produktowa bez fikcyjnych cen, klientów i KPI.
- Poprawna semantyka nagłówków, breadcrumbs, list, `details/summary` i CTA.
- Czytelny podział na huby, szablony branżowe i szablony funkcji.
- Brak overflow na 390 px i brak błędów runtime.
- Jeden wspólny header/footer oraz współdzielone wzorce, które można wymienić
  bez naruszania logiki produktu.

### Co nie pasuje do zaakceptowanej strony głównej

1. **Dwa języki marki.** Home V7 używa ciepłego papieru, głębokiej zieleni,
   dużej typografii, wyraźnych powierzchni produktu i osi około `64–1608 px` w
   referencji 1672 px. Podstrony używają starszego kontenera maks. 1320 px,
   drobniejszej skali i niemal dokumentowego układu.
2. **Hero bez dominującego dowodu.** Prawie każda podstrona ma ten sam układ:
   breadcrumbs, tekst po lewej i mały blok granicy po prawej. Nie buduje to
   hierarchii ani nie wyjaśnia funkcji tak skutecznie jak code-native proofy na
   home.
3. **Powtarzalna płaskość.** Sekcje opierają się na hairline'ach i siatkach
   tekstowych. Brakuje rozróżnienia między procesem, produktem, przykładem,
   decyzją i zabezpieczeniem.
4. **Za mała skala desktopu.** Strony mają 2700–5500 px wysokości, ale ich
   główne treści są wizualnie małe i zostawiają duże, mało informacyjne pola.
5. **Za długie mobile.** Strony branżowe osiągają 7108–7208 px. Układ jest
   bezpieczny, ale kolejne podobne bloki nie dają użytkownikowi dobrych punktów
   orientacyjnych ani skrótu do decyzji.
6. **Niespójne CTA.** Wspólny `CtaBand` nadal ma historyczne warianty o bardzo
   małej typografii (`marketing-button--light`), podczas gdy home ma większe,
   równe i wyraźnie priorytetyzowane akcje.
7. **Generyczne huby.** `/branze` i `/funkcje` są listami wpisów, nie mapami
   zastosowań. Nie pokazują zależności zakres → proces → wynik → lead.
8. **Brak rytmu mobile znanego z M1–M3.** Home ma kontrolowane osie 12/16 px,
   zwarte sekwencje i porównywalne karty. Podstrony jedynie stackują desktopową
   treść.

## 3. Inwentaryzacja i priorytet

| Trasa                             | Archetyp   | Sekcje | Wysokość 1440 | Wysokość 390 | Priorytet |
| --------------------------------- | ---------- | -----: | ------------: | -----------: | --------- |
| `/produkt`                        | produkt    |      4 |          3602 |         5662 | P0        |
| `/jak-dziala`                     | proces     |      3 |          4082 |         5698 | P0        |
| `/cennik`                         | pilotaż    |      2 |          2702 |         4089 | P0        |
| `/dla-agencji`                    | partner    |      3 |          2900 |         4418 | P1        |
| `/wordpress`                      | integracja |      3 |          3268 |         4459 | P1        |
| `/branze`                         | hub        |      2 |          2894 |         4062 | P1        |
| `/branze/meble-na-wymiar`         | branża     |      8 |          5513 |         7208 | P1        |
| `/branze/ogrodzenia`              | branża     |      8 |          5461 |         7108 | P1        |
| `/branze/strony-internetowe`      | branża     |      8 |          5513 |         7157 | P1        |
| `/branze/klimatyzacja`            | branża     |      8 |          5461 |         7117 | P1        |
| `/branze/remonty`                 | branża     |      8 |          5513 |         7148 | P1        |
| `/funkcje`                        | hub        |      2 |          2776 |         3803 | P1        |
| `/funkcje/kalkulator-wyceny`      | funkcja    |      4 |          3558 |         4622 | P2        |
| `/funkcje/formularz-wieloetapowy` | funkcja    |      4 |          3558 |         4575 | P2        |
| `/funkcje/kwalifikacja-leadow`    | funkcja    |      4 |          3610 |         4661 | P2        |
| `/funkcje/lead-scoring`           | funkcja    |      4 |          3558 |         4652 | P2        |
| `/funkcje/widget-na-strone`       | funkcja    |      4 |          3558 |         4628 | P2        |
| `/polityka-prywatnosci`           | dokument   |      4 |          1727 |         2565 | P2        |
| `/regulamin`                      | dokument   |      4 |          1678 |         2533 | P2        |

Priorytet oznacza kolejność wpływu na ścieżkę sprzedażową, nie poziom błędu.

### Korekta IA z 2026-08-03

Audyt wykonywał crawl tras istniejących, dlatego nie wykazał braku osobnej
strony `/integracje`. Późniejsza kontrola nawigacji potwierdziła, że etykieta
„Integracje” prowadzi do `/wordpress`, łącząc niepoprawnie hub z jedną stroną
szczegółową. `/integracje` zostaje dodane do planu jako dwudziesta publiczna
podstrona, z osobnym baseline'em i gate'em w R4.I. Nie wolno wypełnić jej
fikcyjnymi kartami CRM, webhooków lub arkuszy.

## 4. Plan każdej strony i sekcji

### `/produkt`

1. **Hero:** zachować tezę i granicę MVP; dodać dominujący code-native obraz
   procesu „konfiguracja → publikacja → lead”, nie kopię dashboardu z home.
2. **Mapa produktu:** przekształcić `ProductWorkspace + 6 modułów` w jedną
   czytelną mapę zależności z realnym rekordem leada jako punktem końcowym.
3. **Granice:** trzy granice produktu pokazać jako wyraźny kontrakt „robi / nie
   robi”, bez negatywnego, ciężkiego pasa na całą szerokość.
4. **CTA:** prowadzić do `/jak-dziala` i `/branze`; dwie równe akcje, jeden
   priorytet.

### `/jak-dziala`

1. **Hero:** pokazać granice zaufania jako prosty przepływ przeglądarka →
   serwer → panel, bez sugerowania automatyzacji AI.
2. **Sześć kroków:** zastąpić bardzo długą pionową listę sekwencją 3 + 3 na
   desktopie oraz zwartym timeline'em na mobile. Każdy krok ma mieć artefakt,
   stan i rezultat.
3. **Bezpieczeństwo:** trzy warstwy ochrony umieścić przy etapach, których
   dotyczą; zachować osobne podsumowanie dla RLS, reguł i plików.
4. **CTA:** przejście do branż jako naturalny kolejny krok.

### `/cennik`

1. **Hero:** komunikat „najpierw pilotaż” połączyć z krótką mapą kwalifikacji
   wdrożenia; bez kwot, triala i karty płatniczej.
2. **Dwie ścieżki:** „wdrożenie z ustalonym zakresem” i „model w walidacji”
   zaprojektować jak karty z home V7-05, ale bez kopiowania fałszywych pakietów.
3. **Kryteria zakresu:** pokazać, od czego zależy indywidualna wycena i co
   klient otrzymuje po pilotażu.
4. **CTA:** jedna realna ścieżka do panelu/logowania i jedna do procesu; nie
   udawać formularza zgłoszeniowego.

### `/dla-agencji`

1. **Hero:** relacja agencja → organizacja klienta → widget jako proof.
2. **Metoda wdrożenia:** cztery etapy od warsztatu do publikacji; wspólna
   architektura, indywidualna treść.
3. **Granice tenantów:** osobna, mocna sekcja o tym, gdzie pozostają leady i
   jakie role istnieją naprawdę.
4. **Izolacja CSS:** mały code-native przykład host page/widget, bez
   technicznego przeciążenia.
5. **CTA:** kierować do branż i WordPressa.

### `/wordpress`

1. **Hero:** wizualny układ strona WordPress → cienki konektor → Kwotum.
2. **Wąskie połączenie:** trzy tryby osadzenia i rzeczywiste granice danych.
3. **Bezpieczeństwo:** token pokazywany raz, origin HTTPS, brak bazy leadów w
   WordPressie i kontrola połączenia.
4. **Gotowość:** jawnie oddzielić testy lokalne od publicznego release'u.
5. **CTA:** widget oraz model dla agencji.

### `/branze`

1. **Hero:** wyjaśnić, że silnik jest wspólny, lecz brief i pytania branżowe.
2. **Pięć zastosowań:** nie zwykła lista. Każdy wpis ma pokazać 2–3 unikalne
   dane wejściowe, rezultat i link do pełnego przykładu.
3. **Porównanie:** jedna matryca pokazująca stałe etapy oraz różne pytania.
4. **CTA:** przejście do produktu lub wyboru pierwszego procesu.

### `/branze/meble-na-wymiar`

1. Hero z zakresem zabudowy, materiałami i terminem.
2. Problem zwykłego pola „opisz zlecenie”.
3. Działające demo pytania o zakres zabudowy.
4. Pięć grup danych: zakres, wymiary, materiały/AGD, budżet, termin/pliki.
5. Przykładowy brief mebli z jednoznacznie demonstracyjnymi danymi.
6. Droga od szablonu do procesu firmy.
7. FAQ specyficzne dla mebli.
8. CTA do procesu/produktu.

### `/branze/ogrodzenia`

1. Hero z terenem, długością, bramą i montażem.
2. Problem niepełnego zapytania bez warunków terenu.
3. Demo pytania o rodzaj i długość ogrodzenia.
4. Pięć grup danych: teren, długość, system, bramy/furtki, montaż/termin.
5. Przykładowy brief ogrodzenia.
6. Konfiguracja procesu firmy.
7. FAQ specyficzne dla ogrodzeń.
8. CTA.

### `/branze/strony-internetowe`

1. Hero z zakresem, funkcjami, treścią i integracjami.
2. Problem wyceny bez zdefiniowanego zakresu.
3. Demo pytania o typ serwisu.
4. Pięć grup danych: typ, podstrony, treści, funkcje/integracje, termin/budżet.
5. Przykładowy brief strony.
6. Konfiguracja procesu firmy/agencji.
7. FAQ specyficzne dla stron.
8. CTA.

### `/branze/klimatyzacja`

1. Hero z typem budynku, pomieszczeniami i warunkami montażu.
2. Problem zapytania przed wizją lokalną.
3. Demo pytania o liczbę pomieszczeń/urządzeń.
4. Pięć grup danych: budynek, kubatura, urządzenia, montaż, termin/lokalizacja.
5. Przykładowy brief klimatyzacji.
6. Konfiguracja procesu instalatora.
7. FAQ specyficzne dla klimatyzacji.
8. CTA.

### `/branze/remonty`

1. Hero z zakresem, metrażem, stanem i instalacjami.
2. Problem mieszania zakresu z niewiadomymi.
3. Demo pytania o rodzaj remontu.
4. Pięć grup danych: pomieszczenia, metraż, stan, instalacje/materiały, termin.
5. Przykładowy brief remontu.
6. Konfiguracja procesu wykonawcy.
7. FAQ specyficzne dla remontów.
8. CTA.

### `/funkcje`

1. **Hero:** pokazać jeden łańcuch pięciu funkcji, nie katalog modułów.
2. **Mapa funkcji:** kalkulator → kroki → kwalifikacja → scoring → osadzenie;
   każda funkcja z jednym prawdziwym artefaktem i zależnością.
3. **Wspólne granice:** serwerowa kontrola wyniku, prywatne reguły, izolacja
   widgetu.
4. **CTA:** pełny proces i branże.

### `/funkcje/kalkulator-wyceny`

1. Hero z wynikiem orientacyjnym i serwerowym potwierdzeniem.
2. Korzyści: wynik, reguły, kontekst.
3. Trzy kroki obliczenia bez ujawniania reguł klientowi.
4. Zabezpieczenia i granica formalnej oferty.
5. CTA do procesu/branży.

### `/funkcje/formularz-wieloetapowy`

1. Hero z progresywnym ujawnianiem pytań.
2. Korzyści: krótszy kontekst, warunki, zapis sesji.
3. Trzy kroki przejścia przez wersjonowany proces.
4. Kontrola ścieżek i brak martwych przejść.
5. CTA.

### `/funkcje/kwalifikacja-leadow`

1. Hero pokazujący odpowiedzi → kompletność → kolejny krok.
2. Korzyści: lepszy brief, priorytet i powód decyzji.
3. Trzy kroki kwalifikacji bez „przesłuchania”.
4. Granice: brak automatycznej decyzji handlowej i wiążącej oferty.
5. CTA.

### `/funkcje/lead-scoring`

1. Hero z jawnymi powodami score zamiast samej liczby.
2. Korzyści: priorytet, wyjaśnienie, powtarzalność.
3. Trzy kroki od odpowiedzi do serwerowego wyniku.
4. Granice: bez AI, bez czarnej skrzynki, reguły prywatne.
5. CTA.

### `/funkcje/widget-na-strone`

1. Hero z host page i izolowanym widgetem.
2. Korzyści: inline/popup/fullscreen/hosted link.
3. Trzy kroki publikacji i ładowania manifestu.
4. Granice CSS, CSP/origin i danych.
5. CTA do WordPressa i procesu.

### `/polityka-prywatnosci`

1. Dokumentowy hero z wersją, krótkim streszczeniem i spisem treści.
2. Dane konta.
3. Cel i dostęp.
4. Google.
5. Prawa i retencja.
6. Stały panel „najważniejsze informacje”, bez marketingowych CTA.

### `/regulamin`

1. Dokumentowy hero z wersją, charakterem pilotażu i spisem treści.
2. Charakter usługi.
3. Konto i bezpieczeństwo.
4. Dozwolone użycie.
5. Wersja pilotażowa.
6. Czytelne kotwice i druk, bez sprzedażowych ozdobników.

## 5. Wniosek

Nie należy przebudowywać wszystkich stron jednym globalnym patchem CSS.
Wspólny shell może być współdzielony, ale hierarchia, proof i rytm sekcji muszą
być zatwierdzane strona po stronie. Pięć stron branżowych i pięć stron funkcji
może korzystać z jednego szablonu implementacyjnego, lecz każda wymaga osobnego
renderu, kontroli treści i wyniku visual QA.
