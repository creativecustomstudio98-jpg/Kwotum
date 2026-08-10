# Wdrożenie

## Środowiska

Local, preview bez danych produkcyjnych, staging z syntetycznym seedem,
production. Osobne projekty bazy, storage, klucze i dostawcy. Preview nie łączy
się z produkcją. `APP_URL` dla staging i production musi używać HTTPS oraz
hosta niebędącego loopbackiem; build odrzuca błędny kontrakt.

Turborepo działa z jawną allowlistą zmiennych potrzebnych w czasie builda.
`APP_URL`, `DEPLOYMENT_ENV`, `VERCEL_ENV` i publiczne `NEXT_PUBLIC_*` muszą być
przekazane przez `globalEnv`, ponieważ konfiguracja Next.js oraz bundle klienta
korzystają z nich podczas kompilacji. Sekrety runtime, w tym klucz serwisowy i
sekrety workerów, nie należą do allowlisty builda i są wstrzykiwane dopiero do
funkcji środowiska docelowego.

## Aktualna produkcja pilotowa

Stan na 2026-08-10:

- aplikacja `kwotum-web` działa w Vercel Production, a produkcyjna baza Supabase
  znajduje się w regionie `eu-north-1`;
- publicznym hostem aplikacji jest `https://app.kwotum.pl`;
- home.pl utrzymuje `app.kwotum.pl` jako osobną strefę z istniejącymi rekordami
  pocztowymi. Dodanie zalecanego CNAME Vercela wymagałoby usunięcia kolidujących
  rekordów strefy, dlatego bezpieczny wariant pilota zachowuje te rekordy i
  kieruje istniejący rekord A na wspierany przez Vercel adres `76.76.21.21`;
- przez użycie kompatybilnego rekordu A Vercel może pokazywać status
  `DNS Change Recommended`, mimo że DNS, TLS i routing są aktywne;
- `GET /health` i `GET /ready` zwracają `200` przez docelową domenę, a readiness
  potwierdza połączenie z produkcyjnym Supabase.

Ten stan nie jest zgodą na przyjmowanie prawdziwych leadów. Wysyłka e-mail
pozostaje w trybie testowym, a uploady są zablokowane fail-closed do czasu
podłączenia skanera malware. Przed otwarciem pilota trzeba również zamknąć
pozycje bezpieczeństwa i operacji z Etapu 13.

## Pipeline

Install z frozen lockfile → lint → typecheck → unit/integration → build → security checks → artefakt immutable → migracja expand → deploy → smoke test → obserwacja → contract/cleanup w późniejszym release.

## Migracje

Każda ma forward plan, kompatybilność z poprzednią wersją aplikacji, backup/restore point i udokumentowany rollback. Destrukcyjne zmiany stosują expand/contract. Wdrożonego pliku migracji nie edytujemy.

## Rollback

Rollback aplikacji przez poprzedni artefakt; rollback danych preferuje migrację naprawczą. Feature flags nie mogą omijać autoryzacji. Produkcja wymaga checklisty z `RELEASE_CHECKLIST.md`.

Webhook wymaga osobnych `WEBHOOK_SIGNING_SECRET` i `WEBHOOK_WORKER_SECRET`.
Scheduler ma wywoływać chroniony route co minutę, bez umieszczania sekretu w
URL. Najpierw wdrażamy migrację, potem aplikację, konfigurację endpointu i test
syntetyczny, a dopiero na końcu scheduler. Rollback zatrzymuje scheduler przed
cofnięciem aplikacji i zachowuje kolejkę; pełna procedura jest w `WEBHOOKS.md`.

## Liveness, readiness i smoke

- `GET /health` sprawdza wyłącznie żywotność procesu; nie zależy od bazy i
  zwraca `200`, `no-store` oraz `noindex`.
- `GET /ready` wykonuje maksymalnie dwusekundowy probe przez Supabase REST do
  PostgreSQL. Tylko dokładne `true` zwraca `200`; brak konfiguracji, timeout,
  błąd lub nieoczekiwany payload zwraca generyczne `503` bez szczegółów.
- Load balancer używa `/health` do liveness i `/ready` do kierowania ruchu.
- `pnpm smoke:runtime` sprawdza oba endpointy, CSP, brak otwartego CORS,
  cookies, cache, robots i `/design-system`.
- `/design-system` działa tylko w local/preview. Staging i production muszą
  zwracać `404`, niezależnie od blokady w `robots.txt`.

Przykład lokalny:

```bash
SMOKE_BASE_URL=http://127.0.0.1:3100 \
SMOKE_DEPLOYMENT_ENV=local \
pnpm smoke:runtime
```
