# Migracje

Migracja `20260724000100_stage3_identity_and_tenancy.sql` tworzy tożsamość,
organizacje, członkostwa, audit log, prywatny bucket i polityki RLS Etapu 3.
Migracja `20260724000200_stage4_flow_domain.sql` dodaje drafty flow, niezmienne
wersje, aliasy publikacji, walidator grafu i funkcje atomowej publikacji oraz
archiwizacji.
Migracja `20260724000300_stage5_widget_sessions.sql` dodaje sesje widgetu,
odpowiedzi, idempotentne mutacje, allowlistowany manifest i publiczne RPC z
hashowanym tokenem.
Migracja `20260725000100_stage6_estimation.sql` dodaje niezależną walidację
estymacji, prywatny kalkulator pricingu/scoringu, kontrolę publikacji oraz
publiczne RPC wyniku bez ujawniania scoringu.
Migracja `20260725000200_stage7_lead_pipeline.sql` dodaje leady, kopie
odpowiedzi, wersjonowane potwierdzenia, prywatne pliki, statusy, historię,
notatki oraz atomowe RPC uploadu, submitu i zmiany statusu.
Migracja `20260725000300_stage8_notifications.sql` dodaje tenantowy outbox,
historię prób i minimalnie uprzywilejowane RPC workera oraz atomowo rozszerza
submit o potwierdzenie klienta i alert dla firmy.
Migracja `20260725000400_stage9_analytics.sql` dodaje wersjonowane decyzje
zgody analitycznej, ściśle typowane zdarzenia sesji, tenantowe agregaty z
progiem małej próby oraz ograniczony mechanizm retencji.
Migracja `20260725000500_stage11_wordpress.sql` dodaje jednorazowe tokeny
instalacyjne, hashowane credentiale konektora, audit/RLS i minimalne RPC
connect/list/diagnostics/disconnect/revoke dla WordPressa.
Migracja `20260729000100_stage12u_flow_document_v2.sql` rozszerza walidację
flow i publiczny manifest o kompatybilny kontrakt v2 z sekcjami i typowanymi
ograniczeniami odpowiedzi.
Migracja `20260729000200_stage12v_flow_editor_revision.sql` rozszerza trigger
rewizji draftu na edytowalną nazwę procesu, bez zmiany tabel lub grantów.
Migracja `20260803000100_stage12zh_flow_invitations.sql` dodaje tenantowe,
idempotentne zaproszenia do podglądu opublikowanego procesu, outbox oraz
wąskie RPC dla panelu i workera.
Migracja `20260803000200_stage12zi_lead_operations.sql` dodaje tenantowe
przypisanie, priorytet, kontakty, notatki i zadania leada wraz z audytem oraz
kontrolą uprawnień Owner/Admin/Sales.
Migracja `20260803000300_stage13a_runtime_readiness.sql` dodaje bezpieczny,
anonimowy probe PostgreSQL używany wyłącznie przez ograniczony czasowo
endpoint readiness.
Migracja `20260810000200_stage13b_public_request_guard.sql` dodaje tenantową
allowlistę originów, prywatne rozproszone kubełki limitera, audytowany zapis
Owner/Admin oraz serwerowy guard. Odbiera `anon` i `authenticated` bezpośrednie
wykonywanie RPC formularza; Route Handlery wykonują je jako service role
wyłącznie po pozytywnym guardzie.
Migracja `20260811000200_stage13d_optional_skip_json_null.sql` normalizuje SQL
`NULL` przekazywany przez PostgREST do JSONB `null` przed walidacją odpowiedzi.
Pozwala to pominąć wyłącznie krok opcjonalny, bez zmiany danych, sygnatury RPC
ani minimalnych grantów `service_role`.

Pliki wdrożonych migracji są niezmienne. Korekty wykonujemy nową migracją.
Rollback aplikacji nie cofa automatycznie schematu; przed produkcyjnym
wdrożeniem wymagany jest backup/restore point. Awaryjne wycofanie tej pierwszej
migracji w pustym środowisku polega na usunięciu polityk, triggerów, tabel,
funkcji i typów w odwrotnej kolejności. W środowisku z danymi stosujemy migrację
naprawczą, nigdy destrukcyjny rollback.

Rollback Etapu 5 polega najpierw na wyłączeniu publicznych Route Handlers i
usunięciu loadera z deploymentu. Tabele pozostają, aby nie utracić odpowiedzi.
Jeżeli migracja nie przyjęła jeszcze ruchu, można w kontrolowanym środowisku
usunąć granty/funkcje, następnie tabele i enum w odwrotnej kolejności. Po
przyjęciu danych stosujemy wyłącznie migrację naprawczą albo kontrolowany eksport
i retencję.

Rollback Etapu 6 zaczyna się od wycofania Route Handlera wyniku i renderowania
pricingu. Snapshoty z opcjonalnym `estimation` pozostają poprawnym JSONB i nie
mogą być modyfikowane. Przed przyjęciem ruchu można nową migracją cofnąć grant
publicznego RPC, usunąć funkcję, trigger i prywatne funkcje, a następnie
przywrócić nazwę `flow_graph_validation_issues` na
`flow_validation_issues`. Po publikacji wersji z estymacją stosujemy wyłącznie
migrację naprawczą; nie usuwamy danych ani historycznych snapshotów.

Rollback Etapu 7 zaczyna się od wyłączenia publicznego submitu i uploadu oraz
formularza kontaktowego w aktualnym deploymencie. Po przyjęciu leadów tabele,
pliki, potwierdzenia i historia pozostają nienaruszone; wdrażamy wyłącznie
migrację naprawczą i kompatybilny rollback aplikacji. W pustym środowisku nowa
migracja może najpierw cofnąć granty i polityki, następnie triggery/funkcje,
tabele zależne, `leads` i enumy w odwrotnej kolejności. Obiekty Storage usuwa
się dopiero po zweryfikowanym eksporcie lub zgodnie z zatwierdzoną retencją.

Rollback Etapu 8 zaczyna się od wyłączenia schedulera i transportu e-mail w
deploymencie. Nie cofamy wrappera submitu przed upewnieniem się, że kompatybilna
wersja aplikacji nie oczekuje outboxu. Po przyjęciu ruchu rekordy powiadomień i
prób pozostają dla historii, retencji i DSAR; stosujemy nową migrację naprawczą.
Wyłącznie w pustym środowisku nowa migracja może cofnąć granty i wrapper,
przywrócić poprzednią funkcję submitu, a następnie usunąć polityki, triggery,
tabele i enumy w odwrotnej kolejności.

Migracja `20260811000100_stage13a_notification_operations.sql` jest
forward-only i nie zmienia danych leadów ani treści outboxu. Rollback zaczyna
się od wyłączenia Vercel Cron, następnie przywraca poprzedni artefakt aplikacji.
Prywatny heartbeat pozostaje w bazie; funkcji i tabeli nie usuwamy ręcznie.
Korekta grantów, progów lub schematu wymaga nowej migracji. Szczegóły operacyjne
są w `docs/NOTIFICATION_OPERATIONS.md`.

Rollback Etapu 9 zaczyna się od wyłączenia wysyłania zdarzeń w widżecie oraz
ukrycia dashboardu, przy zachowaniu obsługi decyzji odmowy i wycofania zgody.
Po przyjęciu ruchu nie usuwamy historii decyzji ani zdarzeń poza zatwierdzoną
retencją; wdrażamy kompatybilną migrację naprawczą. Wyłącznie w pustym
środowisku nowa migracja może cofnąć granty funkcji publicznych i agregujących,
usunąć polityki, funkcje, tabele analityczne oraz enumy w odwrotnej kolejności.

Rollback Etapu 11 zaczyna się od wyłączenia tras konektora i generowania tokenów
w panelu oraz unieważnienia aktywnych credentiali. Po przyjęciu ruchu metadane
połączeń pozostają jako audit i wdrażamy kompatybilną migrację naprawczą.
Wyłącznie w pustym środowisku nowa migracja może cofnąć granty, usunąć funkcje
i polityki, a następnie tabele `wordpress_connections` i
`wordpress_install_tokens`.

Rollback Etapu 12V pozostawia rozszerzony trigger rewizji. Starszy klient
pozostaje zgodny, jeśli po każdym zapisie używa zwróconej rewizji. Ewentualna
korekta zachowania wymaga nowej migracji zastępującej funkcję triggera; nie
edytujemy ani nie usuwamy wdrożonego pliku.

Rollback Etapu 12ZH zaczyna się od wyłączenia wysyłki zaproszeń i workera.
Po przyjęciu ruchu rekordy zaproszeń, outboxu i prób pozostają audytem;
stosujemy wyłącznie kompatybilną migrację naprawczą. W pustym środowisku nowa
migracja może cofnąć granty i funkcje, a następnie polityki oraz tabele w
odwrotnej kolejności zależności.

Rollback Etapu 12ZI zaczyna się od wyłączenia operacji leada w aktualnym
deploymencie. Po zapisaniu aktywności nie usuwamy historii, notatek ani zadań;
wdrażamy kompatybilny rollback aplikacji i nową migrację naprawczą. Tylko w
pustym środowisku można nową migracją cofnąć granty, funkcje, triggery,
polityki, tabele i typy w odwrotnej kolejności.

Rollback Etapu 13A polega najpierw na przywróceniu readiness do bezpiecznej
odpowiedzi 503 lub wyłączeniu probe'u w aplikacji. Funkcja nie przechowuje
danych. Nowa migracja może następnie cofnąć jej grant dla `anon` i usunąć ją;
nie edytujemy wdrożonego pliku migracji.

Rollback FTZ-03A zaczyna się od wyłączenia embedu albo zwracania bezpiecznego
503 z publicznych Route Handlerów. Nie wolno wdrożyć starszej aplikacji, gdy
operacyjne RPC nadal nie mają grantów `anon`. Jeżeli rollback aplikacji jest
konieczny, nowa migracja naprawcza czasowo przywraca dokładne granty starego
kontraktu; preferowany jest jednak rollback do wersji obsługującej guard.
Konfiguracja `public_flow_origins` pozostaje jako audyt, a wygasłe rekordy
`app_private.public_request_buckets` mogą zostać usunięte bez utraty danych
biznesowych. Wdrożonego pliku migracji nie edytujemy ani nie cofamy.

Rollback hotfixu Etapu 13D pozostawia znormalizowane zachowanie funkcji w
bazie, ponieważ jest kompatybilne ze starszą aplikacją i nie zmienia danych.
Ewentualna korekta wymaga nowej migracji `create or replace function`; ręczne
przywrócenie poprzedniego body ponownie otworzyłoby błąd 503 dla „Pomiń”.
