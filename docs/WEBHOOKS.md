# Webhook `lead.created` v1

**Status:** kontrakt Etapu 12ZF

**Wersja envelope:** `2026-08-09`

**Decyzja:** ADR-034

## Cel i granica danych

Webhook przekazuje firmie lub agencji uporządkowany lead do jej własnego
systemu. V1 obsługuje wyłącznie `lead.created`. Produkcyjny payload zawiera
kontakt, publiczny identyfikator leada, nazwę procesu, czas submitu i bezpieczną
projekcję estymacji. Nigdy nie zawiera odpowiedzi, plików, notatek, score,
kategorii ani uruchomionych reguł.

Kontakt jest PII i po skutecznej dostawie opuszcza środowisko Kwotum. Firma
pilotażowa musi zatwierdzić odbiorcę, podstawę przetwarzania, retencję oraz
dostęp po swojej stronie. Payload i response body nie są zapisywane w historii
technicznej ani logach workera.

## Zarządzanie tenantowe

Operacje są dostępne wyłącznie aktywnemu Ownerowi lub Adminowi:

- `GET /api/v1/organizations/:organizationId/webhooks` — konfiguracja i ostatnie
  100 dostaw;
- `POST /api/v1/organizations/:organizationId/webhooks` — utworzenie endpointu;
- `DELETE /api/v1/organizations/:organizationId/webhooks/:endpointId` — trwałe
  wyłączenie endpointu;
- `POST .../:endpointId/rotate` — rotacja sekretu;
- `POST .../:endpointId/test` — syntetyczny event bez PII.

Utworzenie, rotacja i test wymagają UUID w `Idempotency-Key`. Body utworzenia
jest ścisłym JSON-em `{ "url": "https://hooks.firma.pl/kwotum/leads" }` do
4 KiB i wymaga `Content-Type: application/json`; limit jest egzekwowany podczas
strumieniowego odczytu, a nie dopiero po zbuforowaniu body. Odpowiedzi mają
`private, no-store`, `nosniff` i `X-Request-Id`.
Nieuprawniony lub obcy zasób zwraca generyczne 404.

Jeden tenant może mieć maksymalnie 10 aktywnych endpointów i 100 rekordów
endpointów łącznie z wyłączonymi. Limit jest egzekwowany transakcyjnie po
zablokowaniu wiersza organizacji, więc równoległe requesty nie zwiększą fan-out.
Po osiągnięciu limitu historii operator musi ustalić retencję i wykonać osobną,
audytowaną procedurę porządkową — v1 celowo nie usuwa konfiguracji z panelu.

URL musi używać HTTPS i portu 443, publicznej nazwy DNS oraz nie może zawierać
credentiali, query ani fragmentu. Redirecty nie są śledzone. Przy konfiguracji,
teście i każdej dostawie wszystkie odpowiedzi DNS są sprawdzane, a połączenie
TLS jest przypinane do zweryfikowanego publicznego IP przy zachowaniu SNI i
weryfikacji certyfikatu dla oryginalnego hosta. Adresy prywatne, loopback,
link-local, metadata, multicast, documentation, przejściowe IPv6 oraz domeny
specjalne są odrzucane. Rozwiązanie DNS ma osobny limit dwóch sekund i mieści
się w pięciosekundowym budżecie pojedynczej próby dostawy.

## Sekret i rotacja

Sekret endpointu ma postać `whsec_...`. Jest deterministycznie wyprowadzany
przez HMAC-SHA256 z server-side `WEBHOOK_SIGNING_SECRET`, tenant UUID, endpoint
UUID i numeru wersji. PostgreSQL przechowuje tylko numer wersji. Sekret jest
zwracany wyłącznie po utworzeniu lub rotacji i nie pojawia się w późniejszych
odczytach.

Przy rotacji odbiorca powinien przez 15 minut akceptować poprzedni i nowy
sekret. Chroni to event, który opuścił worker tuż przed unieważnieniem locka.
Potem poprzedni sekret należy usunąć. Utrata master secretu wymaga kontrolowanej
rotacji wszystkich endpointów i decyzji incydentowej; nie wolno zmieniać go
bez planu przejścia.

## Envelope i nagłówki

Przykładowy produkcyjny payload:

```json
{
  "version": "2026-08-09",
  "event_id": "30000000-0000-4000-8000-000000000001",
  "delivery_id": "10000000-0000-4000-8000-000000000001",
  "type": "lead.created",
  "occurred_at": "2026-08-09T12:00:00.000Z",
  "organization_id": "60000000-0000-4000-8000-000000000001",
  "data": {
    "test": false,
    "lead": {
      "id": "40000000-0000-4000-8000-000000000001",
      "flow_title": "Remont mieszkania",
      "submitted_at": "2026-08-09T12:00:00.000Z",
      "contact": {
        "email": "klient@example.pl",
        "name": "Klient Testowy",
        "phone": "+48 500 600 700"
      },
      "estimate": {
        "currency": "PLN",
        "minimum_minor": 100000,
        "maximum_minor": 150000,
        "presentation": "range"
      }
    }
  }
}
```

`estimate` może być `null`. Test zachowuje ten sam schemat, ma `data.test=true`,
`estimate=null` i adres z zarezerwowanej domeny `.invalid`.

Worker wysyła:

- `Content-Type: application/json; charset=utf-8`;
- `Idempotency-Key: webhook/<delivery_id>`;
- `X-Kwotum-Delivery-Id`;
- `X-Kwotum-Event-Id`;
- `X-Kwotum-Timestamp` — Unix seconds;
- `X-Kwotum-Signature: v1=<64 lowercase hex>`.

Podpis to HMAC-SHA256 dla dokładnych bajtów
`timestamp + "." + raw_body`. Odbiorca musi użyć raw body przed parsowaniem
JSON, porównania stałoczasowego i maksymalnie pięciominutowego okna replay.
`delivery_id` należy zapisać w unikalnym indeksie przed wykonaniem efektu
biznesowego. Duplikat ma zwrócić 2xx bez ponownego utworzenia rekordu.

## Dostawa, retry i odpowiedź odbiorcy

Dostawa jest co najmniej jednokrotna. Worker pobiera do 25 rekordów przez
`FOR UPDATE SKIP LOCKED`, przetwarza maksymalnie pięć połączeń równolegle i ma
pięciosekundowy limit całkowity oraz bezczynności dla jednego requestu.

- dowolne 2xx kończy dostawę sukcesem;
- 408, 425, 429, 5xx, timeout, błąd sieci i przejściowy brak DNS podlegają
  ponowieniu;
- 3xx, pozostałe 4xx, błędny TLS i niebezpieczny target kończą dostawę;
- maksymalnie jest pięć prób z backoffem 1 min, 5 min, 30 min i 2 h;
- wyczerpanie prób daje `dead_letter`;
- zawieszony lock wraca do retry po 15 minutach.

Odbiorca powinien szybko zwrócić 2xx po trwałym i idempotentnym zapisie. Kwotum
nie interpretuje ani nie przechowuje response body.

## Worker i konfiguracja

Wymagane sekrety server-side:

```dotenv
WEBHOOK_SIGNING_SECRET=minimum-32-znaki-losowego-stabilnego-sekretu
WEBHOOK_WORKER_SECRET=minimum-32-znaki-osobnego-sekretu
```

Scheduler wywołuje co minutę:

```http
POST /api/v1/internal/webhooks/process
Authorization: Bearer <WEBHOOK_WORKER_SECRET>
```

Odpowiedź zawiera wyłącznie `claimed`, `delivered`, `retrying` i
`deadLettered`. Endpoint nie jest publicznym API integratora. Produkcyjny
scheduler, dashboard i alerty są bramką Etapu 13A; bez nich webhook nie jest
gotowy do prawdziwego pilota mimo kompletnej implementacji aplikacyjnej.

## Monitoring i runbook

Minimum przed pilotem:

- alert, gdy scheduler nie wywołał workera przez 5 minut;
- alert, gdy najstarszy `pending/retry` ma ponad 10 minut;
- alert wysokiego priorytetu dla każdego nowego `dead_letter`;
- wykres liczby prób i success rate bez URL-i, payloadu i PII;
- właściciel alertu oraz kanał eskalacji zapisany w protokole pilota.

Przy incydencie operator najpierw zatrzymuje scheduler, potem wyłącza wskazany
endpoint w tenant scope. Nie kopiuje payloadu ani response body do zgłoszenia.
Po korekcie odbiorcy uruchamia syntetyczny test; dead-letter nie jest
automatycznie odtwarzany w v1. Ponowne wysłanie prawdziwego leada wymaga jawnej,
audytowanej procedury operacyjnej.

## Migracja i rollback

Migracja `20260809000100_stage12zf_webhooks.sql` jest forward-only. Przed
stagingiem wymagany jest backup point i pomiar migracji. Bezpieczny rollback
aplikacji:

1. zatrzymać scheduler;
2. wyłączyć panel i route zarządzania webhookami;
3. pozostawić tabele i niedostarczone rekordy w bazie;
4. wdrożyć poprzedni artefakt aplikacji;
5. ewentualne usunięcie grantów, funkcji lub danych wykonać osobną migracją
   naprawczą po analizie retencji i aktywnych dostaw.

Nie edytujemy wdrożonego pliku migracji i nie usuwamy kolejki w ramach rollbacku
aplikacji.

## Dowody odbioru aplikacyjnego

- unit: podpis/replay, URL/IP/DNS, redirect i klasyfikacja HTTP, minimalizacja
  envelope, retry oraz dead-letter;
- route: walidacja UUID/body/idempotency, no-store i generyczne błędy;
- PostgreSQL: Owner/Admin/Sales, anon, drugi tenant, granty, idempotencja,
  trigger leada, rotacja, test, retry, sukces, dead-letter, audyt i redakcja;
- panel: desktop oraz mobile, klawiatura, loading/empty/error i sekret pokazany
  jednorazowo.

Pełna produkcyjna bramka pozostaje w `RELEASE_CHECKLIST.md`.
