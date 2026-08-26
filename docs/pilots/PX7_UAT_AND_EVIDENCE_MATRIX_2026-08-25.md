# PX7 — macierz UAT i dowodów

**Stan:** przygotowana; scenariusze środowiskowe i biznesowe nieuruchomione  
**Dane:** wyłącznie syntetyczne, bez prawdziwych danych kontaktowych

## Zasada zapisu dowodu

Każdy wynik musi mieć: ID, datę, environment, pełny SHA, wykonawcę, oczekiwany
wynik, wynik rzeczywisty, request ID lub artefakt bez PII oraz status
`PASS`/`FAIL`/`BLOCKED`. Sam screenshot bez kontekstu nie zamyka testu dostawy,
RLS ani kolejki.

## A. Preflight i bezpieczeństwo

| ID      | Scenariusz                                     | Oczekiwany wynik                                  | Stan lokalny |
| ------- | ---------------------------------------------- | ------------------------------------------------- | ------------ |
| PX7-P01 | trzy konfiguracje przechodzą parser i graf     | 3/3 valid, bez ceny i score                       | PASS         |
| PX7-P02 | konfiguracje mają zachowany fallback           | każdy proces ma telefon; Fortez także stary form  | PASS         |
| PX7-P03 | kontrola mediów                                | zero starych i wymyślonych assetów                | PASS         |
| PX7-S01 | tenant A próbuje odczytać/zapisać tenant B     | generyczna odmowa, brak skutku i wycieku          | LOCAL PASS   |
| PX7-S02 | obcy origin przed sesją i mutacją              | odmowa przed operacją domenową                    | LOCAL PASS   |
| PX7-S03 | limit IP/origin/flow/session/org               | 429 + `Retry-After`, brak obejścia przez restart  | LOCAL PASS   |
| PX7-S04 | Turnstile: brak/replay/expiry/provider failure | submit fail-closed, retry wymaga świeżego tokenu  | LOCAL PASS   |
| PX7-S05 | logi, analytics i custom events                | brak PII, tokenów, odpowiedzi i context values    | LOCAL PASS   |
| PX7-S06 | release SHA na stagingu                        | te same kontrole przechodzą na immutable buildzie | BLOCKED      |

`LOCAL PASS` odwołuje się do istniejących automatów projektu. Przed GO wymaga
świeżego przebiegu i artefaktów na finalnym SHA.

## B. Pilot A — Fortez „Znam model”

| ID       | Zadanie                                        | Oczekiwany wynik                                           | Stan    |
| -------- | ---------------------------------------------- | ---------------------------------------------------------- | ------- |
| PX7-AQ01 | host przekazuje `TEST-GN-001`                  | klient potwierdza model; proces nie pyta o niego drugi raz | NOT RUN |
| PX7-AQ02 | phone-only, bez e-maila                        | dokładnie jeden lead i alert firmy; brak maila klienta     | NOT RUN |
| PX7-AQ03 | retry tego samego submitu                      | ten sam wynik idempotencji, bez duplikatu                  | NOT RUN |
| PX7-AQ04 | błąd walidacji telefonu                        | fokus na polu, zachowane odpowiedzi                        | NOT RUN |
| PX7-AQ05 | niedostępność Kwotum                           | telefon, WhatsApp i `send.php` nadal działają              | BLOCKED |
| PX7-AQ06 | operator porównuje brief ze starym formularzem | ocena według zatwierdzonego klucza kompletności            | BLOCKED |

## C. Pilot A — Fortez „Pomóż mi dobrać”

| ID       | Zadanie                            | Oczekiwany wynik                                      | Stan    |
| -------- | ---------------------------------- | ----------------------------------------------------- | ------- |
| PX7-AG01 | klient zna potrzebę, ale nie model | kończy brief bez technicznego zgadywania              | NOT RUN |
| PX7-AG02 | wybiera „nie wiem” dla masy/cech   | ścieżka pozostaje kompletna i nie odrzuca zapytania   | NOT RUN |
| PX7-AG03 | wynik procesu                      | brak rekomendacji modelu, ceny, score i SLA           | NOT RUN |
| PX7-AG04 | operator ocenia syntetyczny brief  | może rozpocząć rozmowę bez powtórzenia całego wywiadu | BLOCKED |
| PX7-AG05 | porównanie quick/guided            | agregaty osobnych flow, bez łączenia PII              | BLOCKED |

## D. Pilot B — reprezentatywna firma meblowa

| ID      | Zadanie                                       | Oczekiwany wynik                                      | Stan    |
| ------- | --------------------------------------------- | ----------------------------------------------------- | ------- |
| PX7-B01 | klient opisuje zabudowę bez wymiarów          | „nie wiem” nie blokuje sensownego briefu              | NOT RUN |
| PX7-B02 | porównanie listy, kart tekstowych i ikon      | prostszy wariant wygrywa przy tej samej zrozumiałości | NOT RUN |
| PX7-B03 | prawdziwe zdjęcia firmy                       | wyłącznie nowe, zaakceptowane media z tenantowego DAM | BLOCKED |
| PX7-B04 | upload materiału klienta                      | prywatny, zeskanowany, bez publicznego URL            | BLOCKED |
| PX7-B05 | owner firmy akceptuje minimalny brief i wynik | podpisany zakres, bez marketingowego dopowiadania     | BLOCKED |

Nie wolno zamykać PX7-B03 przez użycie starych zdjęć, stocków lub obrazów z
wcześniejszych referencji. Brak nowych materiałów oznacza pozostawienie testu
`BLOCKED`, nie wygenerowanie zastępczego „ładnego” obrazu.

## E. Operacje, prawo i wyłączenie

| ID      | Scenariusz                                   | Oczekiwany wynik                                       | Stan    |
| ------- | -------------------------------------------- | ------------------------------------------------------ | ------- |
| PX7-O01 | scheduler outboxu działa i przestaje działać | dostawa albo jawny alert wieku; brak cichego utknięcia | BLOCKED |
| PX7-O02 | bounce/permanent failure                     | zdefiniowany owner i ścieżka reakcji                   | BLOCKED |
| PX7-O03 | syntetyczny submit end-to-end                | lead, alert HTML/text i request IDs                    | BLOCKED |
| PX7-O04 | backup i restore staging                     | podpisane RPO/RTO i zgodność liczników                 | BLOCKED |
| PX7-O05 | retencja i DSAR                              | zatwierdzona polityka i pełny eksport/usunięcie        | BLOCKED |
| PX7-L01 | role stron, DPA i podprocesorzy              | podpisane dokumenty przed prawdziwymi danymi           | BLOCKED |
| PX7-L02 | tekst privacy i wynik                        | finalna wersja + hash zaakceptowane przez firmę        | BLOCKED |
| PX7-R01 | usunięcie nowego CTA                         | stare kanały działają bez deployu Kwotum               | BLOCKED |
| PX7-R02 | unpublish i zamknięcie originu               | brak nowych sesji, istniejące dane pod retencją        | BLOCKED |

## F. Dostępność i urządzenia

Automatyczne scenariusze widgetu obejmują klawiaturę, axe, 320/390/768/1440,
offline, popup, focus return, forced colors i reduced motion. Przed GO należy
ponowić je na stagingowym hoście i uzupełnić ręczny VoiceOver/NVDA, zoom 200 i
400%, realne CSP oraz co najmniej jedno urządzenie iOS i Android. Te dowody są
obecnie `BLOCKED`.

Lokalny przebieg Chromium 2026-08-25 zakończył się wynikiem 8/8. Jest dowodem
regresyjnym scalonego renderera, nie UAT konkretnej domeny ani ręcznej
dostępności.

## Podsumowanie

- konfiguracja lokalna: PASS;
- istniejące kontrole techniczne: LOCAL PASS;
- staging, operacje, prawo, firmy i prawdziwe media: BLOCKED;
- wynik decyzji: NO-GO dla prawdziwego ruchu.
