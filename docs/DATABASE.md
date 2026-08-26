# Model danych

## Konwencje

UUID/ULID jako identyfikatory, `organization_id` na każdym rekordzie biznesowym, `created_at`/`updated_at` w UTC, soft delete tylko tam, gdzie wymaga tego odzyskanie lub retencja. Kwoty jako integer w najmniejszej jednostce waluty, nigdy float.

## Tożsamość i tenancy

- `auth.users` — tożsamość zarządzana przez Supabase Auth;
- `profiles` — minimalny profil tworzony triggerem po rejestracji;
- `organizations` — tenant z unikalnym slugiem i twórcą;
- `organization_members` — role `owner`, `admin`, `sales` oraz status
  `invited`, `active`, `suspended`;
- `audit_logs` — bazowe zmiany organizacji i członkostw bez pełnego obrazu
  rekordów i bez kopiowania PII;
- `organization_settings`;
- `sites` — dozwolone domeny, ustawienia embed;
- `api_keys`, `integrations`, `subscriptions`, `usage_records`.

## Flow

- `flows` — stabilna tożsamość i bieżący draft JSONB z rewizją;
- `flow_versions` — immutable snapshot ze statusem published/archived i
  SHA-256;
- sekcje v2/v3, kroki, opcje, reguły, typowane ograniczenia odpowiedzi i wynik są
  ograniczonym agregatem wewnątrz draftu; snapshoty v1 pozostają obsługiwane;
- pricing, scoring i wariant wyniku Etapu 6 są małym, wersjonowanym agregatem
  `estimation` w draftcie/snapshotcie; motywy pozostają późniejszą domeną;
- `published_flows` — nieprzewidywalny publiczny identyfikator → jedna konkretna
  wersja;
- `flow_media_assets` — prywatny, tenantowy rejestr znormalizowanych i
  niezmiennych obrazów kart, ze stanem `pending`/`ready`/`rejected`;
- `email_templates`.

Draft może być znormalizowany dla edycji, ale publikacja tworzy walidowany, kanoniczny snapshot z hashem. Historycznego snapshotu nie edytujemy.

### Stan wdrożenia Etapu 4

Migracja `20260724000200_stage4_flow_domain.sql` wdraża tabele flow, RLS,
walidator PostgreSQL i funkcje `validate_flow`, `publish_flow` oraz
`archive_flow_version`. Publikacja blokuje draft, sprawdza oczekiwaną rewizję i
atomowo przełącza alias. Identyczny snapshot jest idempotentny, a zmieniony
otrzymuje kolejny numer. Szczegółowy kontrakt znajduje się w
`docs/FLOW_DOMAIN.md`.

### Stan wdrożenia Etapu 12U

Migracja `20260729000100_stage12u_flow_document_v2.sql` dodaje walidację sekcji
i typowanych ograniczeń bez zmiany tabel ani przepisywania snapshotów.
Walidator PostgreSQL deleguje dokument v1 do dotychczasowego łańcucha, a v2
waliduje po bezstratnej projekcji wspólnego kontraktu oraz sprawdza nowe pola.
Publiczny manifest v2 ujawnia tylko allowlistowane ograniczenie kroku; sekcje i
`sectionKey` pozostają prywatnymi metadanymi edytora. Serwer zapisujący
odpowiedź ponownie egzekwuje te same domknięte zakresy tekstu, liczby i daty.

Migracja jest forward-only. Rollback aplikacji musi zachować parser i runtime
v2, może jedynie wyłączyć zapis nowych pól. Funkcji nie wolno usuwać, dopóki w
bazie istnieje draft, wersja lub aktywna sesja przypięta do snapshotu v2.

### Stan wdrożenia Etapu 12ZN / PX2

Migracja `20260825000100_stage12zn_px2_flow_document_v3.sql` dodaje niezależną
walidację `experienceMode` i zamkniętej prezentacji kroku/opcji. Nie tworzy
drugiego modelu leada ani nie przepisuje snapshotów. Publiczny manifest v3
ujawnia tylko tryb, wariant, krótki opis, allowlistowany klucz ikony oraz
referencję assetu UUID z tekstem alternatywnym. Sekcje, tenant ID, pricing,
scoring i prywatne metadata pozostają poza projekcją.

Rollback aplikacji może wyłączyć zapis nowych v3, lecz zachowuje czytnik,
walidator i manifest v3. Magazyn assetów oraz weryfikację tenantowej własności
referencji wdraża PX4; sam kontrakt PX2 nadal nie rozwiązuje assetu do URL.

### Stan wdrożenia Etapu 12ZP / PX4

Migracja `20260825000300_stage12zp_px4_flow_media.sql` dodaje wymuszony RLS dla
`flow_media_assets` i triggery sprawdzające wszystkie referencje obrazów przed
zapisem draftu i immutable wersji. Asset musi istnieć, mieć stan `ready` i
należeć do organizacji flow. Publiczny resolver service-role zwraca prywatną
ścieżkę tylko wtedy, gdy dany UUID występuje w wersji wskazanego, aktualnie
opublikowanego flow. Ścieżka nie trafia do snapshotu ani manifestu.

Obiekt jest zapisywany w istniejącym bucketcie `tenant-private` po
normalizacji do WebP. Po przyjęciu ruchu nie usuwamy tabeli, rekordów ani
obiektów przywołanych przez historyczne snapshoty. Rollback aplikacji ukrywa
upload i `image_cards`, zachowując publiczny odczyt już opublikowanych wersji;
korekta schematu odbywa się nową migracją.

### Stan wdrożenia Etapu 12ZO / PX3

Migracja `20260825000200_stage12zo_px3_quick_form.sql` opakowuje istniejący
walidator publikacji bez zmiany tabel, grantów ani modelu leada. Dla v3 w trybie
`quick_form` niezależnie wymusza maksymalnie 8 pytań, pierwsze pytanie jako
wejście, pustą listę reguł, liniowe przejścia i brak override'ów opcji.

Test PostgreSQL publikuje poprawny quick form oraz odrzuca próbę walidacji i
publikacji wariantu rozgałęzionego. Rollback aplikacji może ukryć wybór trybu,
ale nie powinien usuwać walidatora, dopóki istnieje draft albo immutable
snapshot quick form.

### Stan wdrożenia Etapu 12V

Migracja `20260729000200_stage12v_flow_editor_revision.sql` rozszerza istniejący
trigger `prepare_flow_update`: `draft_revision` rośnie po zmianie `draft` albo
`name`. Nie dodaje tabel, kolumn ani grantów. Dzięki temu autosave używa jednego
znacznika optimistic concurrency dla całego agregatu edytowanego przez
builder.

Test PostgreSQL potwierdza osobny wzrost rewizji po zmianie nazwy, kolejny
wzrost po zmianie dokumentu oraz odrzucenie starej rewizji przez publikację.
Migracja jest forward-only; rollback UI zachowuje nowe zachowanie triggera,
ponieważ częściej rosnąca rewizja pozostaje zgodna ze starszym klientem
odczytującym wartość zwróconą po zapisie.

### Stan wdrożenia Etapu 6

Migracja `20260725000100_stage6_estimation.sql` rozszerza walidację publikacji
o konfigurację estymacji, dodaje prywatny kalkulator pricingu/scoringu i wąskie
RPC publicznego wyniku. Nie dodaje zmiennych tabel reguł: sesja wskazuje
immutable snapshot, więc komplet reguł historycznych pozostaje atomowo
przypięty do tej samej wersji. Szczegóły: `docs/ESTIMATION_ENGINE.md`.

## Sesje i leady

- `widget_sessions` — hash publicznego tokenu, przypięta flow version, public ID,
  rewizja, historia przejścia, expiry i ostatnia aktywność;
- `session_answers` — jedna aktualna, typowana odpowiedź na krok;
- `widget_session_mutations` — idempotency key i wynik rewizji odpowiedzi;
- `session_events` — first-party eventy v1 bez PII z 90-dniowym expiry;
- `analytics_consent_records` — wersjonowana historia decyzji sesji;
- `leads` — organizacja, wersja, status, score, przedział, kontakt;
- `lead_answers`, `lead_files`, `lead_status_history`, `lead_notes`;
- `lead_operations` — jeden stan właściciela i priorytetu na lead;
- `lead_tasks` — planowane kontakty i zadania z terminem, odpowiedzialnym,
  idempotencją i cyklem otwarte/wykonane/anulowane;
- `lead_activity_events` — techniczna historia operacji bez kopiowania treści
  zadania, notatki i kontaktu;
- `consent_records` — typ, treść/hash wersji, timestamp i źródło;
- `notifications` — tenantowy outbox ze snapshotem odbiorcy, wersją szablonu,
  statusem, blokadą i terminem retry;
- `organization_notification_settings` — prywatny adres dostawy alertów
  dostępny tylko Ownerowi/Adminowi;
- `notification_delivery_attempts` — historia prób bez treści wiadomości;
- `flow_invitations` — tenantowy outbox wysłania aktualnego hosted flow,
  przypięty do immutable wersji, autora i idempotency key;
- `flow_invitation_delivery_attempts` — historia prób zaproszenia bez treści
  wiadomości i bez PII w audit logu;
- `webhook_endpoints` — tenantowy URL, stan i wersja pochodnego sekretu bez
  plaintextu;
- `webhook_deliveries` — transakcyjny outbox `lead.created` i testów
  syntetycznych;
- `webhook_delivery_attempts` — historia techniczna bez payloadu, response body
  i PII.

## Kluczowe więzy

- unique membership `(organization_id, user_id)`;
- jeden aktywny publiczny alias na flow;
- lead wymaga `flow_version_id` oraz co najmniej jednego kanału: e-maila albo
  telefonu;
- `price_min <= price_max`, waluta ISO 4217;
- odpowiedź jest unikalna dla `(session_id, step_id)` z wersjonowaniem zapisu;
- eventy i submit przyjmują idempotency key;
- pliki wskazują prywatny bucket i tenant path.

### Stan wdrożenia Etapu 7

Migracja `20260725000200_stage7_lead_pipeline.sql` dodaje tenantowe `leads`,
`lead_answers`, `consent_records`, `lead_files`, `lead_notes` i
`lead_status_history`. Lead zachowuje snapshot nazw procesu, kontaktu i
serwerowego wyniku; odpowiedzi zachowują tytuły pytań z wersji, surową wartość
potrzebną logice oraz czytelną projekcję etykiet z przypiętego immutable
snapshotu. Jedna sesja ma co najwyżej jeden lead, a jej odpowiedzi stają się
niezmienne po submit. Zgodnie z ADR-043 role operacyjne czytają projekcję przez
RLS leada bez uzyskania dostępu do edytorskiego `flow_versions`.

Publiczne funkcje mają wyłącznie wąski zakres rezerwacji/potwierdzenia pliku i
atomowego submitu. Bezpośrednie tabele nie mają grantów anonimowych. Członkowie
czytają dane przez wymuszone RLS; bezpośredni update leada jest zabroniony, a
status zmienia kontrolowana funkcja z historią i audit logiem. Szczegóły:
`docs/LEAD_PIPELINE.md`.

### Stan wdrożenia Etapu 8

Migracja `20260725000300_stage8_notifications.sql` opakowuje RPC submitu tak,
aby w tej samej transakcji dopisać rekordy outboxu. Unikalność `(lead_id, kind)`
chroni retry przed duplikacją. Pierwotnym odbiorcą alertu v1 był najstarszy
aktywny Owner; ADR-039 i migracja Etapu 12ZK zastępują go tenantową
konfiguracją, zachowując fallback dla niezmigrowanych organizacji. Brak
odbiorcy tworzy jawny stan `failed`, zamiast gubić zdarzenie.

Tabele mają wymuszone RLS. Aktywny członek widzi statusy wyłącznie swojego
tenanta, ale nie ma bezpośredniego zapisu. Rola workera może wywołać tylko
funkcje claim/complete/fail; claim stosuje `SKIP LOCKED`, lock token i odzyskuje
próby zawieszone dłużej niż 15 minut. Każda próba trafia do osobnego rekordu.
Szczegóły: `docs/NOTIFICATIONS.md`.

### Stan lokalny Etapu 13A — operacje outboxu

Migracja `20260811000100_stage13a_notification_operations.sql` dodaje
prywatny `app_private.worker_heartbeats` oraz trzy narrow RPC service role:
start runu, zakończenie runu i zagregowany probe. Singleton per
`notifications`/`cron|manual` zapisuje wyłącznie UUID technicznego runu, czasy,
wynik i cztery liczniki. Nie ma tenant ID, odbiorcy, tematu, treści ani danych
leada. Zwykłe role nie mają grantu do tabeli ani funkcji.

Probe liczy oczekujące, przetwarzane, zawieszone i terminalnie błędne rekordy
obu outboxów oraz wiek najstarszego `pending/retry`. Aplikacja mapuje agregaty
na zamknięte stany monitoringu. Migracja jest forward-only, a rollback
zatrzymuje scheduler i pozostawia heartbeat oraz kolejki w bazie. Szczegóły:
`docs/NOTIFICATION_OPERATIONS.md` i ADR-042.

### Stan wdrożenia Etapu 12ZK

Migracja `20260810000100_stage12zk_contact_delivery.sql` dodaje wersjonowaną
politykę `email_required` / `phone_required`, nullable `contact_email` z
więzem co najmniej jednego kanału oraz `organization_notification_settings`.
Polityka jest ponownie sprawdzana z immutable snapshotu w RPC submitu. Lead bez
e-maila nie tworzy potwierdzenia klienta, lecz alert firmy zachowuje jego
telefon. Owner/Admin zapisują odbiorcę przez audytowane RPC; Sales, zawieszone
konto i drugi tenant są blokowani przez capability oraz forced RLS.

### Stan wdrożenia Etapu 12ZH

Migracja `20260803000100_stage12zh_flow_invitations.sql` dodaje osobny outbox
zaproszeń procesu, ponieważ istniejące powiadomienia są nieusuwalnie przypięte
do leada. Złożone FK wymuszają zgodność organizacji, flow, immutable wersji i
aktywnego publicznego aliasu. Unikalność `(organization_id, request_id)` daje
idempotencję, a constraint stanu pilnuje locka, daty wysłania, providera i
wyniku próby.

Owner/Admin tworzą zaproszenie wyłącznie przez wąskie RPC; bezpośredni zapis
tabel nie jest przyznany klientowi. Worker claimuje rekordy przez
`FOR UPDATE SKIP LOCKED`, odzyskuje zawieszone próby i zapisuje outcome w
osobnej tabeli. Migracja jest forward-only: rollback aplikacji pozostawia
nieprzetworzone rekordy bezpiecznie w kolejce, której starszy worker nie zna.

### Stan wdrożenia Etapu 12ZI

Migracja `20260803000200_stage12zi_lead_operations.sql` dodaje osobny agregat
operacyjny, nie zmieniając immutable briefu klienta w `leads`. Trigger tworzy
domyślny `lead_operations` dla nowych leadów, a migracja uzupełnia istniejące.
Najbliższe otwarte zadanie jest źródłem „następnego kroku”, najbliższy otwarty
kontakt źródłem „zaplanowanego kontaktu”, a ostatnia aktywność jest projekcją
submitu, statusów, notatek i zdarzeń operacyjnych.

Owner/Admin przypisują właściciela przez `set_lead_assignee`; wszystkie aktywne
role zmieniają priorytet i pracują na zadaniach przez kontrolowane RPC. Sales
zamyka tylko własne/przypisane zadania. Klient ma wyłącznie SELECT przez forced
RLS, a audit zapisuje identyfikatory, enumy i terminy bez tytułu, opisu,
notatki lub e-maila. Złożone tenantowe FK oraz `ON DELETE CASCADE` włączają
zadania do legal hold, retencji i usunięcia wraz z leadem; eksport DSAR zawiera
treść zadań. Migracja jest forward-only, a rollback UI nie usuwa danych.

### Agregat operacyjny dashboardu

Migracja `20260826000100_dashboard_operational_lead_overview.sql` dodaje
`get_operational_lead_overview(target_organization_id, period_start,
period_end)`.
Funkcja liczy bezpośrednio z tenantowej tabeli `leads`, bez limitu listy panelu
i bez mieszania tych danych z analityką sesji wymagającą zgody. Bieżący okres
ma granice `[period_start, period_end)`, może obejmować najwyżej 90 dni, a
poprzedni okres jest wyznaczany jako bezpośrednio sąsiadujący zakres tej samej
długości.

Wynik zawiera oba okresy, bieżące i poprzednie sumy leadów, leadów jakościowych
(`score >= 80`), wycen w PLN oraz minimalnych wartości wycen. Dodatkowo zwraca
pełną serię dzienną w UTC dla bieżącego okresu, podział statusów, pięć
najaktywniejszych procesów i zamknięte przedziały minimalnej wyceny. Odpowiedź
nie zawiera kontaktu, odpowiedzi klienta ani innych danych osobowych. Źródła
ruchu pozostają częścią consentowej analityki `get_analytics_overview` i nie są
przedstawiane jako źródła operacyjnych leadów.

RPC działa jako `SECURITY INVOKER`, ponownie sprawdza aktywne członkostwo i
zawsze filtruje `organization_id`; forced RLS tabeli `leads` pozostaje aktywne.
Grant `EXECUTE` ma wyłącznie `authenticated`, a warstwa aplikacji dodatkowo
wymaga capability `lead:read` i waliduje ścisły kontrakt odpowiedzi przez Zod.
Obcy tenant oraz członek zawieszony otrzymują `no_data_found`.

### Stan wdrożenia Etapu 9

Migracja `20260725000400_stage9_analytics.sql` dodaje consent i eventy
przypięte złożonymi FK do organizacji, sesji, flow i wersji. Event ID jest
idempotentny, step key musi istnieć w snapshotcie, a bezpośredni zapis tabel
jest zabroniony. Owner/Admin czytają surowe rekordy przez RLS; Sales otrzymuje
wyłącznie agregat.

`get_analytics_overview` liczy różne sesje, konwersję, medianę czasu, drop-off,
źródła, urządzenia, wersje i kategorie jakości. Próg 5 działa dla całego wyniku
i każdej grupy. `purge_expired_analytics` usuwa batchami rekordy po 90 dniach i
ma grant tylko dla service role. Szczegóły:
`docs/ANALYTICS_IMPLEMENTATION.md`.

## Stan wdrożenia Etapu 3

Migracja `supabase/migrations/20260724000100_stage3_identity_and_tenancy.sql`
tworzy profile, organizacje, członkostwa i audit log. Utworzenie organizacji
automatycznie dodaje jej twórcę jako aktywnego Ownera. Trigger blokuje usunięcie,
zawieszenie lub degradację ostatniego aktywnego Ownera.

Usunięcie organizacji jest logiczne przez `deleted_at`. Bezpośredni `DELETE` nie
jest przyznany klientowi, dzięki czemu audit log i relacje pozostają zachowane.
Po oznaczeniu `deleted_at` Admin i Sales tracą odczyt organizacji, a wszyscy
członkowie tracą dostęp do jej plików. Owner widzi rekord wyłącznie na potrzeby
kontrolowanego przywrócenia; aktywne listy zawsze filtrują `deleted_at is null`.

RLS jest włączone i wymuszone dla wszystkich tabel publicznych Etapu 3.
Funkcje pomocnicze `security definer` mają pusty `search_path`, w pełni
kwalifikowane nazwy i minimalne granty. Zwykły klient `authenticated` nie może
zapisywać audit logu.

Bucket `tenant-private` jest niepubliczny, ma limit 25 MiB i allowlistę JPEG,
PNG, WebP oraz PDF. Pierwszy segment ścieżki obiektu musi być UUID organizacji:
`<organization_id>/<domena>/<losowa-nazwa>`. Nieprawidłowy lub obcy segment
kończy się odmową RLS. Właściciel obiektu Storage nie zastępuje członkostwa.

Typy tabel oraz jawny `TenantContext` znajdują się w `@wyceno/database`.
Każda kolejna tabela biznesowa musi mieć `organization_id`, indeks tenantowy i
test pozytywny oraz negatywny RLS w tej samej migracji.

## Test integracyjny

`pnpm test:rls` tworzy jednorazowy lokalny klaster PostgreSQL, ładuje minimalny
kontrakt `auth`/`storage`, migrację i syntetyczny seed dwóch tenantów. Jeżeli
ustawiono `RLS_TEST_DATABASE_URL`, używa wskazanej pustej bazy — tak działa
serwis PostgreSQL w CI. Test obejmuje obcy odczyt, obcy zapis, pliki, zawieszone
członkostwo, samodzielną eskalację Admina i ostatniego Ownera.

## Stan wdrożenia Etapu 5

Migracja `20260724000300_stage5_widget_sessions.sql` dodaje sesje, odpowiedzi i
rejestr idempotentnych mutacji. Publiczne RPC zwracają wyłącznie allowlistowany
manifest, tworzą sesję, wznawiają ją i zapisują odpowiedź. Tabele nie mają
anonimowych grantów ani polityk bezpośredniego dostępu; `security definer`
sprawdza token przez SHA-256. Odpowiedź, oczekiwana rewizja, aktualny krok i cel
przejścia są walidowane na przypiętym immutable snapshotcie. Test
`widget_sessions.sql` obejmuje token plaintext, bezpośredni odczyt, expiry,
retry, konflikt, błędną opcję, próbę przeskoczenia trasy oraz ograniczenia
odpowiedzi manifestu v2.

### Hotfix Etapu 13D — opcjonalne „Pomiń” przez publiczne API

Migracja `20260811000200_stage13d_optional_skip_json_null.sql` normalizuje SQL
`NULL`, które PostgREST przekazuje dla wartości `null` w wywołaniu RPC, do
JSONB `null` używanego przez domenę sesji. Normalizacja odbywa się przed
walidacją i rozwiązywaniem trasy: opcjonalny krok jest usuwany z odpowiedzi,
natomiast wymagany krok nadal kończy się `check_violation`. Nie zmienia tabel,
sygnatury RPC, grantów ani historycznych danych i zachowuje wyłączny grant
`service_role` wprowadzony przez bramę publicznego API.

Migracja jest forward-only i zgodna z rollbackiem aplikacji. Rollback
operacyjny zatrzymuje nowy release aplikacji, ale pozostawia normalizację w
bazie; jej cofnięcie wymagałoby osobnej migracji naprawczej i ponownie
otworzyłoby błąd 503 dla „Pomiń”. Test integracyjny wywołuje funkcję z
rzeczywistym SQL `NULL`, potwierdza bezpieczny skip pola opcjonalnego oraz
odrzucenie skipu pola wymaganego.

## Indeksy początkowe

`organization_members(user_id, organization_id)`, `flows(organization_id, updated_at)`, `leads(organization_id, submitted_at desc)`, `leads(organization_id, status, submitted_at desc)`, `notifications(status, available_at, created_at)`, `session_events(flow_version_id, occurred_at)`, `webhook_deliveries(status, available_at, created_at)`.

### Stan wdrożenia Etapu 12ZF

Migracja `20260809000100_stage12zf_webhooks.sql` dodaje trzy tenantowe tabele,
wymuszone RLS Owner/Admin i brak bezpośrednich zapisów użytkownika. Trigger
leada tworzy rekord dla każdego aktywnego endpointu w tej samej transakcji.
Service role ma wyłącznie wąskie RPC claim/complete/fail; claim używa
`FOR UPDATE SKIP LOCKED`, lock tokenu i odzyskuje zawieszone próby po 15
minutach. Stan końcowy to `delivered` albo `dead_letter`, a retry używa
`available_at` i maksymalnie pięciu prób.

Utworzenie, rotacja, test i wyłączenie są kontrolowanymi RPC z capability oraz
audytowane bez URL-u i PII. Sekret nie ma kolumny — aplikacja wyprowadza go z
master secretu, tenant UUID, endpoint UUID i `secret_version`. Migracja jest
forward-only; rollback pozostawia kolejkę w bazie zgodnie z `WEBHOOKS.md`.

## Retencja

Migracja `20260725000600_stage12_data_governance.sql` dodaje owner-only
`organization_data_policies`, `lead_legal_holds` i
`data_erasure_events`. Okres leadów jest domyślnie wyłączony i po zatwierdzeniu
może wynosić 30–3650 dni. Legal hold blokuje ręczne i automatyczne usunięcie.
Eksport jest allowlistowanym JSON v1.

Przy ręcznym usunięciu RPC przygotowujące ścieżki ustawia na zablokowanym
rekordzie `erasure_pending_at/by`. Od tej chwili nie można dodać legal hold, a
retencja pomija rekord. Eliminuje to wyścig pomiędzy usunięciem Storage i
finalizacją transakcji w bazie; retry Ownera może bezpiecznie dokończyć purge.

Service role może tylko pobrać ograniczony batch kandydatów i wywołać purge.
Purge ponownie sprawdza termin i blokadę. Worker usuwa pliki przed rekordami;
awaria Storage pozostawia bazę jako odzyskiwalne źródło prawdy. Niedokończone
sesje kwalifikują się dzień po `expires_at`. Surowe eventy nadal mają odrębną
90-dniową politykę.

Usunięcie kasuje lead, odpowiedzi, zgody, pliki, notatki, historię, outbox,
próby dostawy, eventy i sesję. Pozostaje wyłącznie tenantowy
`data_erasure_event` z przyczyną i licznikami bez identyfikatora leada. Audit i
backup mają osobne okresy do zatwierdzenia.

Rollback przed wdrożeniem: wyłączyć route workera i UI DSAR, odwołać scheduler,
usunąć granty/policies/funkcje od zewnętrznych do prywatnych, trigger, a potem
tabele `data_erasure_events`, `lead_legal_holds`,
`organization_data_policies` i enum. Po wdrożeniu migracja jest niezmienna;
rollback danych odbywa się nową migracją, a usuniętych danych osobowych nie
odtwarza się bez jawnej podstawy i decyzji administratora.

## WordPress connector

`wordpress_install_tokens` przechowuje organizację, dokładny origin HTTPS,
SHA-256 tokenu, twórcę, 10-minutowe expiry i `used_at`. Token plaintext istnieje
wyłącznie w wyniku kontrolowanego RPC Owner/Admin. Maksymalnie pięć aktywnych
tokenów użytkownika ogranicza nadużycia panelu.

`wordpress_connections` przechowuje origin, SHA-256 credentialu, wersje
wtyczki/WP/PHP, `connected_at`, `last_seen_at` i `revoked_at`. Aktywne
połączenie jest unikalne dla pary organizacja/origin. Tabele mają forced RLS;
Owner/Admin widzi metadane, Sales i inne tenanty nie widzą rekordów, a anon nie
ma bezpośrednich grantów.

Security-definer RPC mają pusty `search_path` i jawne granty:
`create_wordpress_install_token` dla authenticated Owner/Admin oraz
`exchange_wordpress_install_token`, `get_wordpress_flows`,
`get_wordpress_diagnostics`, `disconnect_wordpress` dla anonowego klienta API.
Te ostatnie autoryzują wyłącznie przez hashowany, aktywny credential.
`revoke_wordpress_connection` jest tenantowym RPC Owner/Admin do awaryjnej
revocation bez dostępu do sekretu. Migracja Etapu 11 ma rollback przed
wdrożeniem: wyłączyć trasy konektora, unieważnić aktywne credentiale, usunąć
funkcje/policies, a następnie tabele w kolejności connections → install_tokens.
Po wdrożeniu plik migracji jest niezmienny.

## Publiczna brama formularza

`public_flow_origins` przechowuje maksymalnie 10 dokładnych originów na proces,
organizację i aktora zapisu. Tabela ma forced RLS: odczyt wyłącznie Owner/Admin,
zapis wyłącznie przez `set_public_flow_origins`, z tenant scope i audit logiem.
Nie przechowuje wildcardów, ścieżek, query ani credentiali; HTTP jest
dopuszczony tylko dla loopbacku lokalnego.

`app_private.public_request_buckets` przechowuje wyłącznie SHA-256 materiału
kubełka, początek/expiry stałego okna i licznik. Surowy IP, origin, token sesji,
flow ID i organization ID nie są kolumnami tej tabeli. Adres klienta trafia do
funkcji już jako HMAC-SHA-256 obliczony server-side osobnym sekretem.
`enforce_public_request_guard` rozpoznaje proces albo hash sesji, sprawdza exact
origin i atomowo zużywa budżety IP/origin/flow/session/org. Funkcja oraz
operacyjne RPC formularza są wykonywalne tylko dla `service_role`; `anon` i
`authenticated` nie mogą ominąć Route Handlera. Panelowy podgląd manifestu ma
osobne RPC Owner/Admin z tenant scope.

Rollback FTZ-03A najpierw wycofuje ruch publiczny do bezpiecznej odpowiedzi 503
albo usuwa embed. Nie wdrażamy starej aplikacji po odebraniu grantów `anon`.
Awaryjna kompatybilność wymaga jawnej migracji naprawczej przywracającej granty
na czas rollbacku aplikacji. Tabela originów zostaje konfiguracją audytową, a
wygasłe kubełki można bezpiecznie usunąć; nie usuwa się danych biznesowych.

# Snapshot kontekstu PX5

`widget_sessions.context_snapshot` przechowuje kanoniczny, wersjonowany obiekt
źródła i wartości; `context_confirmed_at` oraz pojedynczy mutation ID zamykają
zmianę przed pierwszą odpowiedzią. `leads.context_snapshot` jest kopiowany
triggerem z potwierdzonej sesji. Oba pola mają limit 8192 B i nie są publicznie
czytelne. Funkcje tworzenia i potwierdzenia sesji są wykonywalne wyłącznie przez
`service_role`; aplikacja nadal przechodzi przez origin guard i rate limit.

# Kontakt i branding PX6

`leads.preferred_contact_channel` oraz `preferred_contact_window` są zamkniętymi
enumami logicznymi przechowywanymi obok danych kontaktowych. Funkcja submit
sprawdza wymagania immutable `leadCapture` v3, zgodność kanału z faktycznie
podanym e-mailem lub telefonem oraz outcome pozwalający utworzyć lead. Eksport
v2 obejmuje obie preferencje, a usunięcie leada usuwa je razem z rekordem.

`organizations` przechowuje opcjonalną nazwę publiczną, kolor akcentu, wyliczony
kolor tekstu i FK do gotowego tenantowego assetu logo. Constraint ponownie
wylicza kontrast deterministycznie. Zapis odbywa się przez audytowane RPC
Ownera; RLS i sprawdzenie tenant scope blokują obcy asset. Publiczny resolver
zwraca wyłącznie logo związane z aktywnym procesem, bez ścieżki Storage i bez
możliwości podania dowolnego URL.
