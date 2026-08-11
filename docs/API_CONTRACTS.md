# Kontrakty API

## Standard

JSON po HTTPS, jawna wersja `/api/v1`, limity payloadu, Zod po stronie serwera, stabilne kody błędów i `request_id`. Mutacje krytyczne przyjmują `Idempotency-Key`. Błąd nie ujawnia istnienia zasobu innego tenanta.

Przykład błędu:

```json
{
  "error": {
    "code": "FLOW_NOT_PUBLISHABLE",
    "message": "Proces zawiera błędy konfiguracji",
    "details": [],
    "request_id": "..."
  }
}
```

## Panel

- `POST /organizations`, `GET/PATCH /organizations/:id`;
- `GET/POST /flows`, `GET/PATCH /flows/:id`;
- `POST /flows/:id/validate`, `POST /flows/:id/publish`;
- `GET /leads`, `GET/PATCH /leads/:id`, `POST /leads/:id/notes`;
- `GET /analytics/overview`;
- `GET/POST /organizations/:organizationId/webhooks`;
- `DELETE /organizations/:organizationId/webhooks/:endpointId`;
- `POST /organizations/:organizationId/webhooks/:endpointId/rotate`;
- `POST /organizations/:organizationId/webhooks/:endpointId/test`.

## Publiczne

- `GET /public/flows/:publicId/manifest`;
- `POST /public/flows/:publicId/sessions`;
- `GET /public/sessions/current`;
- `PUT /public/sessions/current/answers/:stepKey`;
- `GET /public/sessions/current/result`;
- `POST /public/sessions/current/files`;
- `POST /public/sessions/current/submit`;
- `POST /public/events` z batchowaniem i limitami.

Odpowiedź submit zawiera wynik do pokazania, nigdy reguły wewnętrzne. Serwer przelicza wynik na snapshotcie wersji.

Publiczne endpointy formularza nie udostępniają wildcard CORS. Dla żądania z
`Origin` odpowiedź zawiera `Access-Control-Allow-Origin` wyłącznie po dokładnym
dopasowaniu do originu skonfigurowanego przy danym procesie albo do `APP_URL`
hosted linku, zawsze z `Vary: Origin`. Origin obcej witryny zwraca
`ORIGIN_NOT_ALLOWED`/403 bez nagłówka dopuszczającego CORS. Każde żądanie,
łącznie z preflightem, przechodzi przez rozproszony limiter PostgreSQL. Limit
zwraca `RATE_LIMITED`/429 oraz całkowitoliczbowy `Retry-After` w sekundach.
Adres klienta jest HMAC-owany na serwerze i nie trafia w surowej postaci do
bazy ani logów.

Operacyjne RPC manifestu, sesji, odpowiedzi, wyniku, submitu, plików i
analityki nie mają grantu `anon` ani `authenticated`. Wykonuje je wyłącznie
Route Handler po pozytywnym wyniku bramy origin/rate limit. Panel pobiera
manifest instalacyjny osobnym tenantowym RPC Owner/Admin. Szczegóły decyzji:
ADR-040.

## Webhook `lead.created` v1

Tenantowe operacje są dostępne tylko Ownerowi/Adminowi. Utworzenie, rotacja i
test wymagają UUID `Idempotency-Key`; body utworzenia to strict JSON z jednym
publicznym URL-em HTTPS. Sekret jest zwracany tylko po utworzeniu lub rotacji.

Envelope wersji `2026-08-09` zawiera `version`, `event_id`, `delivery_id`,
`type`, `occurred_at`, `organization_id` i allowlistowane `data`. Nagłówki
zawierają stabilny idempotency key, identyfikatory eventu/dostawy, timestamp i
HMAC-SHA256 dla `timestamp + "." + raw_body`. Odbiorca stosuje pięciominutowe
okno replay i deduplikuje `delivery_id`. Szczegółowy payload, retry, SSRF,
rotację, worker i rollback definiuje `docs/WEBHOOKS.md`.

`POST /api/v1/internal/webhooks/process` wymaga
`Authorization: Bearer <WEBHOOK_WORKER_SECRET>` i zwraca wyłącznie liczniki
`claimed`, `delivered`, `retrying`, `deadLettered`. Brak dostępu to 401, a błąd
batcha generyczne 503; odpowiedzi mają `private, no-store`.

## Wewnętrzny worker powiadomień

`GET /api/v1/internal/notifications/process` jest wyłącznie ścieżką Vercel
Cron i wymaga `Authorization: Bearer <CRON_SECRET>`. Nie zastępuje ręcznego
kontraktu poniżej i nie współdzieli z nim sekretu.

`POST /api/v1/internal/notifications/process` wymaga server-side
`Authorization: Bearer <NOTIFICATION_WORKER_SECRET>`. Nie jest endpointem
panelu ani publicznego widgetu. Sukces zwraca wyłącznie:

```json
{ "claimed": 2, "sent": 2, "retrying": 0, "failed": 0 }
```

Brak dostępu zwraca `UNAUTHORIZED`/401, a błąd batcha
`NOTIFICATION_PROCESSING_FAILED`/503. Wszystkie warianty mają
`Cache-Control: private, no-store` i nie ujawniają PII, treści ani danych
dostawcy. Kontrakt retry i konfiguracji opisuje `docs/NOTIFICATIONS.md`.

`GET /api/v1/internal/notifications/health` wymaga
`Authorization: Bearer <MONITORING_PROBE_SECRET>`. Zwraca wyłącznie zamknięte
kody problemów, heartbeat, liczniki i wiek kolejek; 200 oznacza zdrowy outbox,
a 503 brak/starość/błąd schedulera, starą kolejkę, stale lock, rekord `failed`
albo błąd zależności. Szczegóły i progi: `docs/NOTIFICATION_OPERATIONS.md`.

## Prywatność i worker retencji

`GET /api/v1/organizations/:organizationId/leads/:leadId/export` jest dostępny
wyłącznie aktywnemu Ownerowi. Zwraca jako attachment wersjonowany JSON oraz
`private, no-store`; błąd uprawnienia/IDOR nie ujawnia istnienia leada.

Panel Ownera wywołuje tenantowe RPC ustawienia/zwolnienia legal hold i trwałego
usunięcia. Usunięcie wymaga dokładnego potwierdzenia `USUŃ`, kasuje Storage
przed bazą i jest blokowane przez legal hold.

`POST /api/v1/internal/retention/process` wymaga
`Authorization: Bearer <RETENTION_WORKER_SECRET>`. Zwraca tylko:

```json
{
  "filesRemoved": 2,
  "leadCandidates": 1,
  "leadsPurged": 1,
  "sessionCandidates": 1,
  "sessionsPurged": 1
}
```

Brak dostępu to `UNAUTHORIZED`/401, a błąd batcha
`RETENTION_PROCESSING_FAILED`/503. Wszystkie warianty mają
`Cache-Control: private, no-store`.

### Wdrożony kontrakt widgetu v1

Trasy są dostępne pod `/api/v1`. Token sesji trafia w nagłówku
`X-Wyceno-Session`, nigdy w URL. `POST .../sessions` zwraca token, expiry,
rewizję, krok startowy i manifest tej samej przypiętej wersji. Zapis odpowiedzi
przyjmuje `mutationId`, `expectedRevision`, `answer` oraz wyliczony przez klienta
`nextStepKey`; serwer niezależnie odtwarza routing i odrzuca rozbieżność.

Stabilne błędy: `FLOW_NOT_FOUND`, `SESSION_NOT_FOUND`, `SESSION_EXPIRED`,
`SESSION_CONFLICT`, `INVALID_REQUEST`, `INVALID_ANSWER`, `RATE_LIMITED` i
`UNAVAILABLE`; brama może dodatkowo zwrócić `ORIGIN_NOT_ALLOWED`,
`CHALLENGE_FAILED` albo `CHALLENGE_UNAVAILABLE`. Każda
odpowiedź ma `X-Request-Id`; sesje mają `no-store`.
Szczegóły: `docs/WIDGET_IMPLEMENTATION.md`.

`GET .../result` działa wyłącznie dla ukończonej, niewygasłej sesji. Zwraca
bezpieczne treści i opcjonalny pricing: walutę, presentation, min/max minor
units i serwerowo sformatowane wartości. Nie zwraca score, kategorii,
uruchomionych reguł ani konfiguracji. Błąd `RESULT_NOT_READY` oznacza 409 dla
nieukończonej sesji. Szczegóły: `docs/ESTIMATION_ENGINE.md`.

`POST .../files` przyjmuje `multipart/form-data` z jednym polem `file` oraz
token sesji w nagłówku. Zwraca wyłącznie `fileId`, nazwę, MIME i rozmiar; nie
ujawnia ścieżki Storage ani tenant ID. Stabilny błąd `INVALID_FILE` obejmuje
limit, typ, rozszerzenie i sygnaturę. Maksimum to 5 plików po 25 MiB.

`POST .../submit` przyjmuje `mutationId`, jednorazowy `challengeToken` do 2048
znaków, kontakt, wymagany dowód potwierdzenia informacji prywatności, opcjonalną
zgodę marketingową i maksymalnie 5 `fileIds`. Po bramie origin/rate i walidacji
payloadu serwer obowiązkowo wykonuje Cloudflare Siteverify oraz sprawdza
`success`, akcję `kwotum_lead_submit`, host i świeżość. Nieprawidłowy, wygasły
albo powtórzony token nie uruchamia RPC leada; retry użytkownika wymaga nowego
tokenu. Serwer nie przyjmuje ceny, score ani odpowiedzi — kopiuje je z
ukończonej sesji i ponownie liczy estymację. Odpowiedź
`{leadPublicId, submittedAt}` nie zawiera PII ani prywatnego wyniku. Szczegóły:
`docs/LEAD_PIPELINE.md` i ADR-041.

`POST .../sessions/current/analytics-consent` przyjmuje `mutationId`,
`consentVersion: "analytics-v1"` i `granted`. Odmowa/wycofanie usuwa eventy
sesji. `POST /public/events` przyjmuje pojedynczy strict event v1 z UUID,
timestampem, nazwą, opcjonalnym step key oraz coarse source/device. Obie trasy
używają `X-Wyceno-Session`, `no-store` i nie przyjmują PII ani dowolnego
metadata. Brak zgody zwraca `ANALYTICS_CONSENT_REQUIRED`/403, zły kontrakt
`INVALID_REQUEST`/422, limit `RATE_LIMITED`/429. Szczegóły:
`docs/ANALYTICS_IMPLEMENTATION.md`.

## Kontrakt domeny flow v1/v2

Warstwa serwerowa Etapu 4 udostępnia typowane operacje:

- `createFlowDraft(context, {name, slug, document})`;
- `createFlowFromTemplate(context, {templateSlug, name, slug})`;
- `saveFlowDraft(context, {flowId, expectedDraftRevision, ...})`;
- `validateFlowDraft(context, flowId)`;
- `publishFlowDraft(context, {flowId, expectedDraftRevision})`;
- `archiveFlowVersion(context, versionId)`.

Walidacja zwraca `valid`, `issues[]` i `draftRevision`. Publikacja zwraca
`flowId`, `flowVersionId`, `versionNumber`, `snapshotHash` i stabilny
`publicId`. Konflikt rewizji mapuje się docelowo na HTTP 409, niepublikowalny
graf na 422, brak tenant scope na generyczne 404. Route Handlers HTTP zostaną
podłączone razem z ekranem buildera; nie powstają atrapy endpointów.

Odczyt draftu przyjmuje immutable format v1 i bieżący v2. Serwis podnosi v1 do
v2 w pamięci, ale zapisuje migrację dopiero razem z jawnym zapisem buildera.
Nowe drafty i szablony są v2. Publiczny manifest zachowuje numer odpowiadający
snapshotowi i w v2 dodaje wyłącznie allowlistowane `validation` kroku.

## WordPress connector v1

Wszystkie odpowiedzi mają `Cache-Control: private, no-store`,
`X-Content-Type-Options: nosniff` i request ID. Endpointy konektora są wyłącznie
server-to-server i nie wystawiają CORS.

### `POST /api/v1/integrations/wordpress/connect`

Body do 4 KiB: `installToken`, dokładny `siteOrigin` HTTPS oraz wersje
`pluginVersion`, `wordpressVersion`, `phpVersion`. Jednorazowy token 256-bitowy
jest wymieniany na credential zwracany tylko w tej odpowiedzi. Odpowiedź 201:
`credential`, `connectionId`, `organizationName`, `siteOrigin`.

### Autoryzowane operacje konektora

`GET /api/v1/integrations/wordpress/flows`,
`GET /api/v1/integrations/wordpress/diagnostics` i
`DELETE /api/v1/integrations/wordpress/connection` przyjmują dokładnie
`Authorization: Bearer <64 lowercase hex>`. Credential w query/body jest
ignorowany. Lista flow zawiera wyłącznie `publicId`, `name`, `version`; nie
zawiera tenant ID, draftu, snapshotu, reguł, pricingu, leadów ani credentialu.
Odłączenie zwraca 204 i natychmiast unieważnia dalsze wywołania.
Panel Owner/Admin może w sposób audytowany wywołać tenantowe
`revoke_wordpress_connection` dla konkretnego connection UUID bez znajomości
credentialu.
