# Analityka produktu

## Zakres Etapu 9

Lorum zapisuje first-party eventy widgetu w PostgreSQL i pokazuje tenantowy
dashboard dla okresu 7, 30 lub 90 dni. Nie używa zewnętrznego trackera,
fingerprintingu ani dowolnych metadanych.

Dashboard obejmuje:

- sesje ze zgodą oraz konwersję start → wynik → lead;
- medianę czasu od załadowania do wyniku;
- drop-off kroków;
- źródła i urządzenia w niskiej granularności;
- porównanie wersji flow;
- rozkład kategorii jakości leadów, gdy próba jest wystarczająca.

## Consent

Przed zapisem eventów widget pokazuje nieblokującą decyzję
`analytics-v1`. Odmowa nie ogranicza procesu. Użytkownik może w tym samym
interfejsie później włączyć analitykę albo wycofać zgodę. Wycofanie usuwa
wszystkie surowe eventy sesji i zatrzymuje kolejne; minimalny rekord decyzji
pozostaje bez PII.

Eventy powstałe przed decyzją są wyłącznie w pamięci bieżącej karty. Po zgodzie
zostają wysłane z pierwotnym timestampem, a po odmowie są odrzucane. Decyzja
jest związana z tokenem jednej sesji i zapisana razem z lokalnym stanem
wznowienia.

## Kontrakt eventu v1

Dozwolone nazwy:

`widget_loaded`, `widget_opened`, `flow_started`, `flow_abandoned`,
`step_viewed`, `step_answered`, `step_back`, `contact_started`,
`lead_submitted`, `result_viewed`, `cta_clicked`, `file_uploaded` i
`validation_error`.

Każdy event zawiera wyłącznie:

- `schemaVersion: 1`;
- losowy `eventId` do idempotencji;
- `occurredAt`;
- zamkniętą nazwę;
- opcjonalny `stepKey` tylko dla eventu kroku;
- urządzenie: mobile/tablet/desktop/other;
- źródło: direct/organic/paid/social/email/referral/other.

Nie wolno przesyłać treści odpowiedzi, e-maila, telefonu, imienia, URL,
referrera, IP, ceny, score ani dowolnego JSON. Serwer przypina organizację,
flow i immutable wersję z sesji zweryfikowanej hashowanym tokenem. Krok musi
istnieć w snapshotcie. Limit wynosi 120 eventów na minutę i 500 na sesję.

## API

- `POST /api/v1/public/sessions/current/analytics-consent` — zapisuje
  wersjonowaną decyzję;
- `POST /api/v1/public/events` — przyjmuje jeden event v1 po aktywnej zgodzie;
- tenantowy panel pobiera agregat przez kontrolowane
  `get_analytics_overview`.

Token sesji jest wyłącznie w `X-Wyceno-Session`. Odpowiedzi są `no-store`.
Event jest sygnałem produktowym z niezaufanego klienta, nie podstawą
rozliczenia, bezpieczeństwa ani wiążącej decyzji.

## Metryki i prywatność małej próby

Mianownik stanowią różne sesje z `widget_loaded` i aktywnymi eventami w
wybranym okresie. Start, wynik i lead liczymy jako różne sesje z odpowiednimi
eventami. Drop-off to `step_viewed - step_answered` dla różnych sesji.

Cały dashboard przechodzi w stan „Za mało danych”, gdy ma mniej niż 5 sesji.
Każda grupa źródła, urządzenia, kroku, wersji lub jakości również wymaga co
najmniej 5 sesji/leadów. Ukryte grupy nie są zwracane jako zera.

Sales widzi tylko bezpieczne agregaty. Owner i Admin mogą dodatkowo odczytać
surowe eventy własnej organizacji przez RLS. Żadna rola panelu nie może
bezpośrednio zapisywać ani zmieniać eventów.

## Retencja

Każdy event ma `expires_at = occurred_at + 90 days`. Funkcja
`purge_expired_analytics` usuwa maksymalnie 10 000 rekordów w batchu i jest
dostępna wyłącznie service role. Scheduler oraz alert braku purge należą do
Etapu 13. Rekordy decyzji consent mają oddzielną retencję do zatwierdzenia w
Etapie 12.

## Weryfikacja

- kontrakt odrzuca PII, nadmiarowe pola, niewłaściwą wersję i zły scope kroku;
- PostgreSQL odtwarza dokładne metryki kontrolnych sesji i testuje dwa tenanty;
- wycofanie usuwa eventy i wymusza próg małej próby;
- Playwright przechodzi pełną ścieżkę widgetu, sprawdza dokładnie jeden load,
  start, wynik i lead oraz pełną listę eventów;
- axe obejmuje decyzję consentu i całą ścieżkę mobilną.

## Ograniczenia

Wyniki opisują wyłącznie sesje ze zgodą i mogą mieć selection bias. Dane
klienckie mogą być zakłócone przez blokery, utratę sieci lub złośliwy klient.
Po wygaśnięciu technicznej sesji dalsza obsługa praw osoby odbywa się przez
procedurę DSAR Etapu 12. Produkcyjny harmonogram purge i monitoring są bramką
Etapu 13.
