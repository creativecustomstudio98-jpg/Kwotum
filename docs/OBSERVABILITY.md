# Obserwowalność

## Sygnały

- structured logs z `request_id`, route, status, latency, tenant ID w formie technicznej i bez treści odpowiedzi;
- error tracking z redakcją PII;
- metryki: request rate/error/latency, submit success, e-mail delivery, webhook queue, cron, storage i DB;
- tracing dla submit → lead → notification;
- health/liveness i osobna readiness zależności krytycznych.

## Kontrakt runtime

`GET /health` jest kontrolą liveness procesu i nie odpytuje zależności.
`GET /ready` sprawdza ograniczonym czasowo wywołaniem ścieżkę Supabase REST →
PostgreSQL. Odpowiedź publiczna zawiera wyłącznie `ready` albo `unavailable`;
nie zawiera hosta, wersji, latencji, klucza ani komunikatu błędu. Monitoring
może zapisywać status i czas zewnętrznego pomiaru, ale nie body błędu providera.

Lokalny smoke test nie zastępuje uptime checku ani alertu stagingowego.
Docelowy alert readiness wymaga progu, właściciela i runbooka wybranego w 13A.

## Alerty

Krytyczne: trwała niemożność submitu, podejrzenie tenant leakage, kolejka bez postępu, utrata bazy. Wysokie: skok 5xx, e-mail/webhook failure rate, błędy widgetu. Każdy alert ma właściciela, runbook i próg oparty na wpływie.

## Prywatność

Nie logujemy nazw, e-maili, telefonów, odpowiedzi, pełnych IP ani URL-i z parametrami. Sentry/PostHog wymagają allowlisty pól i testu redakcji.

## Powiadomienia

Worker może raportować wyłącznie liczby `claimed`, `sent`, `retrying`,
`failed`, czas batcha, techniczny identyfikator próby i zamknięty kod błędu.
Zabronione są odbiorca, nadawca, temat, HTML/text, nazwa klienta i odpowiedzi
leada. Alert produkcyjny ma objąć kolejkę bez postępu, wzrost `failed`,
przekroczenie wieku najstarszego `pending/retry` i brak wywołań schedulera.
Progi i dashboard należą do wdrożenia Etapu 13.

Analityka produktowa nie zastępuje logów operacyjnych. Monitoring może mierzyć
liczbę zaakceptowanych/odrzuconych eventów, błędy walidacji, czas agregacji,
wiek najstarszego wygasłego rekordu i wynik purge, ale nie treść, token ani
identyfikatory sesji. Alert braku purge i regresji czasu agregacji powstaje w
Etapie 13.

## Webhooki

Dozwolone sygnały to zagregowane `claimed`, `delivered`, `retrying`,
`deadLettered`, czas batcha, wiek najstarszego `pending/retry`, liczba prób i
zamknięty kod błędu. Zabronione są URL endpointu, payload, response body,
kontakt oraz dane estymacji. Przed pilotem wymagane są alerty braku schedulera,
kolejki starszej niż 10 minut i każdego nowego dead-letter, z właścicielem i
runbookiem z `WEBHOOKS.md`.
