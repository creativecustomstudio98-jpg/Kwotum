# Bezpieczeństwo i dane Kwotum

**Status:** kanoniczna checklista wykonawcza  
**Ostatni przegląd:** 2026-08-09

Szczegóły modelu zagrożeń i kontraktów pozostają w `SECURITY.md`,
`AUTHORIZATION.md`, `DATABASE.md`, `PRIVACY.md` i `THREAT_MODEL.md`. Ten
dokument grupuje dowody i działania wymagane przed pierwszymi prawdziwymi
danymi.

## Tenant isolation

Wszystkie 25 tabel publicznych utworzonych przez migracje mają włączone i
wymuszone RLS:

- identity: `profiles`, `organizations`, `organization_members`, `audit_logs`;
- flow: `flows`, `flow_versions`, `published_flows`;
- widget/analityka: `widget_sessions`, `session_answers`,
  `widget_session_mutations`, `analytics_consent_records`, `session_events`;
- lead: `leads`, `lead_answers`, `consent_records`, `lead_status_history`,
  `lead_notes`, `lead_files`;
- delivery/integracje: `notifications`, `notification_delivery_attempts`,
  `wordpress_install_tokens`, `wordpress_connections`;
- governance: `organization_data_policies`, `lead_legal_holds`,
  `data_erasure_events`.

Bucket `tenant-private` jest niepubliczny. Ścieżka zaczyna się od UUID
organizacji, a polityki Storage sprawdzają aktywne członkostwo. Funkcje
`security definer` mają pusty `search_path`, kwalifikowane nazwy i jawne granty.

Automatyczny test dwóch tenantów musi pozostać blokujący. Minimalne rozszerzenie
przed pilotem:

1. bezpośredni signed URL pliku A jako użytkownik B — odmowa;
2. plik `pending`/przed skanem — odmowa pobrania;
3. eksport i admin action A jako B — generyczne 404/odmowa;
4. CRUD/RPC dla każdej nowej tabeli w tej samej migracji;
5. test na stagingowym Supabase, nie wyłącznie lokalnym PostgreSQL.

## Service role

Service role występuje wyłącznie w `apps/web/lib/supabase/service.ts` i jest
używany przez:

- transfer uprzednio zarezerwowanego uploadu;
- worker outboxu powiadomień;
- worker retencji i usuwania Storage.

Panel, tenantowe odczyty, zmiana statusu i eksport używają klienta
uwierzytelnionego oraz RLS. Id organizacji uploadu pochodzi z sesji i
kontrolowanego RPC, nie z zaufanego body. Modułu service role nie wolno
importować do komponentu `"use client"`, oznaczać `NEXT_PUBLIC_*` ani używać do
zwykłych odczytów panelu.

Przed każdą nową operacją service role wymagane są: niezależne uwierzytelnienie
lub osobny sekret workera, wąskie RPC, tenant scope ustalony po stronie serwera,
test drugiego tenanta i uzasadnienie, dlaczego RLS użytkownika nie wystarcza.

## Sekrety i rotacja

`.env.example` zawiera wyłącznie nazwy i placeholdery, a `.env*` poza przykładem
jest ignorowane. Jeżeli working-tree scan, Gitleaks lub review historii wskaże
potencjalny sekret:

1. nie wypisywać wartości w logu ani zgłoszeniu;
2. zablokować release i sklasyfikować incydent jako P0;
3. ustalić typ, dostawcę, środowisko, zakres i pierwszą ekspozycję;
4. unieważnić/obrócić klucz po stronie Supabase, e-maila, OAuth, monitoringu lub
   integracji;
5. sprawdzić logi użycia, sesje i możliwy dostęp do danych;
6. usunąć sekret z bieżącego drzewa i historii zgodnie z planem incydentu;
7. wydać nowe credentiale tylko do właściwego środowiska;
8. uruchomić pełnohistoryczny skan ponownie i zachować dowód rotacji;
9. sama zmiana pliku nigdy nie zamyka incydentu.

## Ustawienia Supabase przed pilotem

- osobne projekty staging i production w regionie UE;
- Auth: e-mail confirmation, bezpieczne Site URL/redirect allowlist, własny
  SMTP, limity logowania i credential stuffing;
- MFA wymagane co najmniej dla Ownera operatora i kont uprzywilejowanych;
- SSL Enforcement aktywne; Network Restrictions dla połączeń administracyjnych
  po sprawdzeniu kompatybilności hostingu;
- service role wyłącznie jako sekret serwera, regularna rotacja i brak preview;
- prywatny Storage, limity rozmiaru/MIME oraz brak publicznych bucketów;
- PITR/backup zgodny z planem, alert wykorzystania DB/Storage;
- logi Auth i DB z retencją oraz dostępem ograniczonym do wyznaczonych osób;
- test RLS, signed URL, eksportu i usunięcia na stagingu po każdej migracji.

## Upload i retencja

Stan kodu: 5 plików po 25 MiB, allowlista JPEG/PNG/WebP/PDF, kontrola nazwy,
rozszerzenia, MIME, magic bytes i SHA-256; prywatna losowa ścieżka; ClamAV
fail-closed poza loopback; signed URL 60 s.

Przed produkcją:

- prywatna kwarantanna i status niedostępny do czasu skanu;
- skaner ClamAV w prywatnej sieci, timeout, monitoring i test EICAR;
- brak wielokrotnego buforowania dużych requestów;
- alerty błędów skanu/uploadu i limity per IP/session/flow/org;
- scheduler retencji, legal hold, storage-first purge i dowód retry;
- zatwierdzone okresy leadów, plików, sesji, eventów, audytu i backupu.

## Backup i disaster recovery

Proponowane minimum pierwszych pięciu klientów, wymagające zatwierdzenia:

- RPO ≤ 24 h i RTO ≤ 8 h dla pełnej katastrofy;
- backup/PITR PostgreSQL u dostawcy;
- codzienny szyfrowany logiczny dump do oddzielnego dostawcy/tenant account;
- backup prywatnego Storage z manifestem hashy;
- monitoring powodzenia i wieku ostatniego backupu;
- kwartalny restore do izolowanego stagingu;
- walidacja liczby organizacji, leadów, relacji, wersji flow i plików;
- protokół czasu odtworzenia, problemów, osób zatwierdzających i cleanupu;
- eksport danych organizacji jako kontrolowana procedura Owner-only.

Backup bez zakończonego restore drill nie jest dowodem gotowości.

## Logi i incydenty

Dozwolone pola: request ID, route template, status, latency, techniczny tenant
ID, zamknięty kod błędu i zagregowane liczniki workerów. Zabronione: hasła,
tokeny, pełne e-maile/telefony, odpowiedzi, nazwy plików prywatnych, treść
załączników i pełne URL z query.

Przed pilotem trzeba wskazać Security Incident Ownera, Privacy Ownera i Support
Ownera oraz przećwiczyć: wyciek credentialu, podejrzenie tenant leakage, brak
submitu, awarię bazy, zatrzymaną kolejkę i niedostępny Storage.
