# Prompt wykonawczy — Runtime readiness 12ZJ

## Cel

Zbuduj lokalny, produkcyjny kontrakt liveness/readiness przed wyborem hostingu
i providerów. Nie deklaruj aktywnego stagingu ani gotowości produkcyjnej.

## Zakres

1. Zachowaj `GET /health` jako bezstanową kontrolę procesu.
2. Dodaj `GET /ready`, który przez anonimowy Supabase REST wywołuje wąską
   funkcję PostgreSQL bez dostępu do danych tenantów.
3. Ogranicz probe twardym timeoutem i zwracaj wyłącznie `ready` albo
   `unavailable`, bez szczegółów zależności.
4. Dodaj testy sukcesu, błędu, timeoutu, nieoczekiwanego payloadu, cache i
   indeksacji oraz test grantów PostgreSQL.
5. Odrzuć staging/production z loopbackowym lub nie-HTTPS `APP_URL`.
6. Ukryj `/design-system` przez 404 w staging/production, zachowując go w
   local/preview.
7. Dodaj odtwarzalny smoke test `health`, `ready`, nagłówków bezpieczeństwa,
   robots i dostępności showcase zależnej od środowiska.

## Granice

- brak service-role w readiness;
- brak odczytu tabel aplikacyjnych i danych tenantów;
- brak logowania sekretów albo pełnych błędów providera;
- brak atrap schedulerów, backupu, ClamAV, e-maila i monitoringu;
- brak oznaczania zewnętrznych pozycji Etapu 13A jako ukończone.

## Kryteria odbioru

- liveness pozostaje 200 również wtedy, gdy probe zależności zwraca błąd;
- readiness ma 200 tylko dla dokładnego `true`, a w pozostałych przypadkach
  503;
- request zależności używa publicznego klucza, `no-store` i limitu czasu;
- endpointy nie ujawniają konfiguracji ani treści błędu;
- anonimowy i uwierzytelniony klient może wykonać wyłącznie bezpieczny probe;
- production/staging nie udostępnia `/design-system`;
- unit, PostgreSQL/RLS, lint, typecheck, build i runtime smoke przechodzą.

## Poza podetapem

- wybór hostingu, regionów, providera e-mail i monitoringu;
- rzeczywiste projekty staging/production oraz ich sekrety;
- schedulery, backup, restore drill, WAF, Turnstile i prywatny ClamAV;
- approval prawny, bezpieczeństwa i operacji.

## Wynik implementacji 2026-08-03

- migracja `20260803000300_stage13a_runtime_readiness.sql` jest zastosowana do
  lokalnego Supabase bez resetu danych;
- pełny PostgreSQL/RLS potwierdza grant anon/auth oraz brak odczytu danych;
- unit przechodzi w 8 pakietach, w tym 106/106 testów web; lint, typecheck i
  build przechodzą po 8/8;
- runtime smoke przechodzi dla local i profilu production: health, readiness,
  CSP, CORS, cache, cookies, robots oraz środowiskowe 404 design systemu;
- praca jest przygotowaniem lokalnym i nie otwiera Etapu 13A przed zamknięciem
  12ZE–12ZG oraz wyborem infrastruktury.
