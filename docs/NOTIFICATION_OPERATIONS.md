# Operacje produkcyjne outboxu powiadomień

**Status:** implementacja lokalna FTZ-04; wdrożenie i alert zewnętrzny otwarte
**Ostatni przegląd:** 2026-08-11

Dokument obejmuje scheduler, heartbeat i monitoring dwóch aplikacyjnych
kolejek e-mail: `notifications` oraz `flow_invitations`. Nie obejmuje SMTP
Supabase Auth ani webhooków tenantowych.

## Kontrakt schedulera

Vercel ma katalog projektu ustawiony na `apps/web`. Plik `apps/web/vercel.json`
rejestruje produkcyjny cron co pięć minut:

```http
GET /api/v1/internal/notifications/process
Authorization: Bearer <CRON_SECRET>
```

Vercel wstrzykuje nagłówek automatycznie. `CRON_SECRET` jest losowym sekretem
Production-only o długości co najmniej 32 znaków. Nie jest równy
`NOTIFICATION_WORKER_SECRET`, który pozostaje ograniczony do ręcznego:

```http
POST /api/v1/internal/notifications/process
Authorization: Bearer <NOTIFICATION_WORKER_SECRET>
```

Obie ścieżki wykonują te same idempotentne workery z `FOR UPDATE SKIP LOCKED`,
stabilnymi idempotency keys i odzyskiwaniem locku po 15 minutach. Vercel może
wykonać cron więcej niż raz i nie ponawia nieudanego wywołania; bezpieczeństwo
nie może zależeć od dokładnie jednokrotnej dostawy.

## Heartbeat i probe

Migracja `20260811000100_stage13a_notification_operations.sql` tworzy wyłącznie
prywatny, zagregowany heartbeat dla źródeł `cron` i `manual`. Nie zapisuje
tenanta, odbiorcy, nadawcy, tematu, treści, odpowiedzi ani identyfikatora leada.
Zwykły użytkownik, `anon` i `authenticated` nie mają dostępu do tabeli ani RPC.

Niezależny monitor wywołuje:

```http
GET /api/v1/internal/notifications/health
Authorization: Bearer <MONITORING_PROBE_SECRET>
```

Sekret monitora jest odrębny od sekretu schedulera i workera. Sukces zwraca
HTTP 200, a wykryty incydent albo błąd probe HTTP 503. Body zawiera wyłącznie
stan, zamknięte kody problemów, czasy heartbeat oraz zagregowane liczniki i wiek
kolejek. Brak sekretu zawsze zwraca 401 bez stanu kolejki.

## Progi alertów

Probe przechodzi tylko wtedy, gdy wszystkie warunki są spełnione:

- ostatni cron rozpoczął się nie dawniej niż 12 minut temu;
- ostatni cron nie zakończył się błędem i nie pozostaje `running` dłużej niż
  90 sekund;
- najstarszy `pending/retry` w żadnej kolejce nie ma więcej niż 10 minut;
- nie istnieje `processing` z lockiem starszym niż 15 minut;
- nie istnieje nierozwiązany rekord `failed`.

12 minut oznacza dwa pominięte cykle pięciominutowego schedulera z dwuminutowym
buforem. Zmiana progu wymaga aktualizacji kodu, testów i tego dokumentu. Monitor
zewnętrzny musi sprawdzać probe co pięć minut, alarmować po pierwszym 503 i
wysłać recovery po 200. Właścicielem P0 jest Engineering/Ops, a backupem Product
Owner. Docelowy kanał i dostawca alertu pozostają częścią FTZ-05 i muszą zostać
zapisane przed zamknięciem FTZ-04.

## Wdrożenie

Kolejność jest obowiązkowa:

1. utworzyć backup point bazy i zastosować migrację;
2. dodać w Vercel Production osobne `CRON_SECRET` i
   `MONITORING_PROBE_SECRET`; istniejącego `NOTIFICATION_WORKER_SECRET` nie
   rotować bez potrzeby;
3. skonfigurować ograniczony klucz `RESEND_API_KEY`, poprawny `EMAIL_FROM` i
   dopiero po review prawnym ustawić `EMAIL_DELIVERY_MODE=resend`;
4. wdrożyć aplikację; potwierdzić cron w Vercel i pierwszy heartbeat;
5. podłączyć niezależny monitor z sekretem probe i przetestować alarm przez
   kontrolowane zatrzymanie cron albo obniżenie heartbeat w środowisku
   stagingowym;
6. utworzyć syntetyczny lead bez danych osoby i potwierdzić dokładnie jedną
   dostawę firmy, stan `sent`, SPF/DKIM/DMARC oraz brak PII w logach;
7. zachować dowód na immutable SHA. Dopiero wtedy można oznaczyć FTZ-04 jako
   zamknięte.

Konto Vercel ma obecnie Pro Trial. Harmonogram co pięć minut wymaga utrzymania
planu Pro/Enterprise. Przed końcem triala trzeba zatwierdzić płatny Pro albo
wdrożyć i przetestować niezależny scheduler; plan Hobby dopuszcza wyłącznie
cron dzienny i nie spełnia tego kontraktu.

## Runbook incydentu

1. Nie publikować procesu i nie tworzyć kolejnych rzeczywistych danych.
2. Sprawdzić zamknięty kod z probe oraz log wywołania cron bez kopiowania PII.
3. Dla `scheduler_missing/stale` sprawdzić aktywność Cron Jobs, deployment i
   zakres `CRON_SECRET`.
4. Dla `scheduler_failed/stuck` zatrzymać cron, sprawdzić zależności i uruchomić
   ręczny worker tylko po usunięciu przyczyny.
5. Dla starej kolejki lub `failed` zachować rekord, ustalić zamknięty kod próby
   i nie edytować odbiorcy ani treści w zgłoszeniu.
6. Wznowić scheduler, wykonać syntetyczny test i zamknąć incydent dopiero po
   dwóch kolejnych zdrowych probe.

## Rollback

Najpierw wyłączyć Cron Jobs w Vercel, potem przywrócić poprzedni artefakt.
Kolejki i prywatny heartbeat pozostają w bazie. Migracja jest forward-only;
funkcji ani danych nie usuwa się ręcznie. Ewentualna korekta schematu wymaga
nowej migracji. Po rollbacku `EMAIL_DELIVERY_MODE=test` zapobiega sieciowej
dostawie, ale nie zastępuje ponownego testu schedulera.
