# Wdrożenie

## Środowiska

Local, preview bez danych produkcyjnych, staging z syntetycznym seedem,
production. Osobne projekty bazy, storage, klucze i dostawcy. Preview nie łączy
się z produkcją. `APP_URL` dla staging i production musi używać HTTPS oraz
hosta niebędącego loopbackiem; build odrzuca błędny kontrakt.

## Pipeline

Install z frozen lockfile → lint → typecheck → unit/integration → build → security checks → artefakt immutable → migracja expand → deploy → smoke test → obserwacja → contract/cleanup w późniejszym release.

## Migracje

Każda ma forward plan, kompatybilność z poprzednią wersją aplikacji, backup/restore point i udokumentowany rollback. Destrukcyjne zmiany stosują expand/contract. Wdrożonego pliku migracji nie edytujemy.

## Rollback

Rollback aplikacji przez poprzedni artefakt; rollback danych preferuje migrację naprawczą. Feature flags nie mogą omijać autoryzacji. Produkcja wymaga checklisty z `RELEASE_CHECKLIST.md`.

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
