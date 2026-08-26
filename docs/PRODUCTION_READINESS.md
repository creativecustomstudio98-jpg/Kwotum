# Gotowość produkcyjna Kwotum

**Status:** kanoniczny raport wykonawczy  
**Ostatni przegląd:** 2026-08-11

**Decyzja:** **NO-GO** dla prawdziwych danych i pierwszego płacącego klienta

Ten dokument jest krótką warstwą wykonawczą. Szczegółową kolejność etapów
utrzymuje `PRODUCTION_READINESS_PLAN.md`, a blokujące kryteria
`RELEASE_CHECKLIST.md`. Raport nie zastępuje dowodu z CI przypiętego do
immutable SHA.

## Zakres audytu

Sprawdzono monorepo pnpm/Turborepo, dziewięć projektów workspace, lockfile,
konfigurację środowiska, 24 Route Handlery, Auth SSR, Storage, wszystkie
migracje i testy PostgreSQL, użycia service role, nagłówki, SEO, testy,
pipeline GitHub Actions oraz dokumentację wdrożenia. Audyt opiera się na kodzie
i uruchomionych testach, nie na samych statusach historycznych.

## Stan lokalny

Na Node 24.18.0 i pnpm 11.17.0 przeszły:

- frozen/offline install;
- format, lint, typecheck, SAST i working-tree secret scan;
- Semgrep CE: 8/8 testów własnych reguł, 291 reguł na 692 plikach, zero
  ustaleń i 100% parsowania;
- 211 testów jednostkowych;
- pełny zestaw PostgreSQL/RLS dla dwóch tenantów;
- WordPress 6.9.2 i 7.0.2 na PHP 8.5;
- build 41 tras i widget 19 016 B gzip;
- Playwright 257 dostępnych scenariuszy, w tym auth, axe, klawiatura,
  responsive, SEO, CSP i widget.

Ogólny pakiet jawnie pomija 17 scenariuszy wymagających fixture'u. Oddzielny,
uwierzytelniony `pnpm e2e:panel` przeszedł 17/17 i potwierdził cleanup
organizacji, konta Auth oraz Storage `0/0/0`. Po dodaniu 12ZF ten sam harness
przeszedł 19/19 i potwierdził 0 pozostałości. Aktualny audyt zależności nie
znalazł znanych podatności.

## Ustalenia blokujące

| ID    | Priorytet            | Ryzyko i wpływ biznesowy                                                                                                                                                                                 | Dowód                                                                                                | Naprawa / kryterium akceptacji                                                                                                                        |
| ----- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| PR-01 | P0 / częściowo       | FTZ-03A i FTZ-03B są lokalnie gotowe: exact allowlista, rozproszony limiter i obowiązkowe Siteverify z host/action/replay/fail-closed. Brak konfiguracji kluczy/hostów i produkcyjnego smoke.            | ADR-040/041, migracja `20260810000200`, testy request guard, Turnstile unit/route i Playwright retry | Skonfigurować managed widget Cloudflare, hosty i osobne sekrety Vercel; wdrożyć migrację, sprawdzić CSP, obcy origin, 429, replay i submit na Fortez. |
| PR-02 | P0                   | Produkcyjny ClamAV, backup DB/Storage, restore drill, monitoring i schedulery nie są aktywne. Utrata danych lub przyjęcie złośliwego pliku nie ma operacyjnej bariery.                                   | `apps/web/lib/security/malware-scanner.ts`, `docs/BACKUP_AND_RECOVERY.md`, `docs/OBSERVABILITY.md`   | Etapy 13A–13C: prywatny ClamAV fail-closed, backup poza głównym dostawcą, restore staging, alerty i podpisany protokół RPO/RTO.                       |
| PR-03 | zamknięte 2026-08-10 | Końcowy SHA ma zielone Quality Gate, Gitleaks, Semgrep CE, macierz WordPress i produkcyjny deployment Vercel. Prywatny plan nadal nie wymusza branch protection, więc obowiązuje ręczna procedura merge. | PR #19, SHA `525d263313afb4288afb53bd945b1f62c8a24f25`, GitHub Actions i Vercel status               | Zachować blokującą procedurę ręczną do czasu dostępności branch protection; każdy kolejny release wymaga nowych dowodów na własnym SHA.               |
| PR-04 | P1                   | Testy signed URL nie zawierają osobnego negatywnego przypadku bezpośredniej próby podpisania ścieżki drugiego tenanta. RLS Storage jest testowane, ale ten kontrakt wymaga jawnego dowodu.               | `apps/web/lib/leads/service.ts`, `supabase/tests/tenant_isolation.sql`                               | Dodać integracyjny test A/B: verified, pending scan, foreign tenant i expiry 60 s.                                                                    |
| PR-05 | P1                   | Upload buforuje multipart i plik w pamięci requestu, a produkcyjna kwarantanna nie jest wdrożona jako osobny stan Storage. Przy równoległych plikach rośnie ryzyko pamięci i awarii.                     | `apps/web/app/api/v1/public/sessions/current/files/route.ts`                                         | Etap 13B: kontrolowana sesja, prywatna kwarantanna, streaming/skan, finalizacja i testy limitów oraz awarii.                                          |
| PR-06 | P1                   | SMTP Auth jest skonfigurowany i potwierdzony syntetyczną dostawą, ale MFA Ownerów, limity logowania, SSL enforcement i network restrictions nadal wymagają dowodu z Supabase Dashboard.                  | `docs/AUTH_EMAILS.md`, `docs/SECURITY.md`, `docs/RELEASE_CHECKLIST.md`                               | Dokończyć checklistę z `SECURITY_AND_DATA.md`, zapisać dowody bez sekretów i wykonać test konta administracyjnego.                                    |
| PR-07 | P1                   | Resend, domena Auth i syntetyczna dostawa są skonfigurowane, lecz DPA, aplikacyjny outbox, scheduler, alerty kolejki i testy w realnych klientach pozostają otwarte.                                     | `docs/AUTH_EMAILS.md`, `apps/web/lib/notifications/worker.ts`, `docs/NOTIFICATIONS.md`               | Zatwierdzić DPA, skonfigurować osobny klucz outboxu, scheduler i alert wieku kolejki oraz wykonać test HTML/text w realnych klientach.                |
| PR-08 | P1                   | Webhook v1 jest gotowy aplikacyjnie, ale bez produkcyjnego schedulera, alertów i stagingowego UAT dostawa może nie ruszyć albo utknąć bez reakcji.                                                       | `docs/WEBHOOKS.md`, `docs/TASKS.md` 12ZF                                                             | Etap 13A: scheduler co minutę, alert wieku kolejki/dead-letter, syntetyczny probe i UAT odbiorcy przed prawdziwymi danymi.                            |
| PR-09 | P1                   | Nowa oferta pierwszych pięciu klientów (599/999 zł, miesiąc gratis) nie jest jeszcze wdrożona w landingu, CTA ani formularzu Founding Client.                                                            | `apps/web/app/(marketing)`, `tests/e2e/marketing.spec.ts`                                            | Osobny etap P1 po 12ZD: działające CTA, kwalifikacja, dostawa zgłoszenia i analityka bez PII.                                                         |
| PR-10 | P1                   | Brak aktywnego error trackingu, uptime i alertów submit/upload/integracji.                                                                                                                               | `docs/OBSERVABILITY.md`; brak zatwierdzonego adaptera runtime                                        | Etap 13A: provider, redakcja PII, request ID, syntetyczny submit i przetestowane alerty.                                                              |
| PR-11 | zamknięte lokalnie   | `/design-system` ma runtime 404 w staging/production i pozostaje dostępny wyłącznie w local/preview; docelowy hosting nadal wymaga powtórzenia smoke.                                                    | `apps/web/app/design-system/availability.ts`, `scripts/smoke-runtime.mjs`                            | Powtórzyć profil production na stagingu i przypiąć wynik do immutable SHA.                                                                            |
| PR-12 | P2                   | Brak ręcznego VoiceOver/NVDA oraz terenowych Core Web Vitals.                                                                                                                                            | `docs/RELEASE_CHECKLIST.md`                                                                          | Test na docelowym hostingu, urządzeniach i wspieranych przeglądarkach przed publicznym startem.                                                       |

PR #19 został scalony metodą squash do SHA
`525d263313afb4288afb53bd945b1f62c8a24f25`. Na tym samym SHA przeszły Quality
Gate, pełnohistoryczny secret scan, Semgrep CE, macierz WordPress oraz
produkcyjny deployment Vercel. Publiczne `/health` i `/ready` zwróciły HTTP 200
z generycznym stanem `ok`/`ready`. CodeQL pozostaje niedostępny dla prywatnego
repozytorium bez płatnego GitHub Code Security; bezpłatny Semgrep CE jest
blokującym zamiennikiem zgodnie z ADR-038.
GitHub API branch protection zwraca dla obecnego prywatnego planu HTTP 403 z
wymaganiem upgrade'u. Kontrole są więc dowodem i procedurą release, ale nie są
jeszcze serwerowo wymuszonym warunkiem merge.

## Naprawione lokalnie

1. Standalone start bezpiecznie wczytuje opcjonalny, ignorowany
   `apps/web/.env.local`. Naprawia to powtarzalny błąd ekranów auth w E2E bez
   kopiowania sekretów do artefaktu.
2. CI otrzymało jawne, syntetyczne publiczne wartości Supabase i originu,
   potrzebne wyłącznie do renderowania testów.
3. `DEPLOYMENT_ENV=production` blokuje build dla brakującego HTTPS lub
   loopbackowego `APP_URL`.
4. Aktualny dependency audit npm zakończył się bez znanych podatności.
5. Podetap 12ZJ rozdziela `/health` i `/ready`, dodaje ograniczony czasowo
   probe Supabase REST → PostgreSQL oraz generyczne 503 bez ujawniania
   infrastruktury.
6. Staging i production wymagają HTTPS i hosta nie-loopback, a wewnętrzny
   `/design-system` zwraca tam 404. Smoke profilu local i production sprawdza
   readiness, nagłówki, CORS, cache, cookies i robots.
7. Niedostępny CodeQL zastępuje Semgrep CE 1.164.0: przypięty obraz, oficjalne
   reguły z niezmiennego commita i wersjonowanego manifestu OWASP, osiem
   testowanych reguł projektu oraz skan offline z kodem tylko do odczytu.
   Wszystkie użycia GitHub Actions są przypięte do commit SHA, a pnpm egzekwuje
   siedem dni release age, no-downgrade provenance i blokadę egzotycznych
   zależności tranzytywnych.

Ryzyko regresji tych zmian jest niskie: istniejące zmienne procesu mają
pierwszeństwo nad `.env.local`, a walidacja produkcyjna nie zmienia local,
preview ani staging. Kryterium odbioru stanowią test konfiguracji, build oraz
pełny E2E auth.

## Macierz obszarów

| Obszar                | Ocena                     | Najważniejszy dowód / następny gate                                   |
| --------------------- | ------------------------- | --------------------------------------------------------------------- |
| Reprodukowalność      | lokalnie PASS             | clean checkout i zdalne CI na SHA nadal wymagane                      |
| Sekrety/env           | lokalnie PASS             | pełnohistoryczny Gitleaks i ewentualna rotacja                        |
| RLS/tenant scope      | PASS lokalny              | 30/30 tabel publicznych ma ENABLE + FORCE RLS; potrzebny staging      |
| Service role          | ograniczony               | public API po guardzie, upload i trzy kontrolowane workery            |
| Auth/sesje            | kod PASS                  | MFA, SMTP i provider rate limits ręcznie                              |
| Public API/widget     | częściowo                 | allowlista i limiter lokalnie PASS; Turnstile i smoke produkcji OPEN  |
| Upload/Storage        | częściowo                 | prywatny bucket i walidacja PASS; ClamAV/kwarantanna produkcyjna OPEN |
| Nagłówki/SEO          | lokalnie PASS             | test na docelowej domenie; design system ma runtime 404 poza local    |
| Migracje/integralność | lokalnie PASS             | rehearsal, backup point i rollback na stagingu                        |
| Backup/DR             | projekt istnieje          | brak aktywnego backupu i restore drill                                |
| Logi/observability    | health/readiness lokalnie | brak providera, uptime i alertów                                      |
| CI/CD                 | PASS na SHA `525d2633`    | każdy kolejny release wymaga nowego kompletu dowodów na własnym SHA   |
| Konwersja/sprzedaż    | niezgodna z nowym briefem | osobny etap Founding Client                                           |
| Dostępność/wydajność  | automaty lokalnie PASS    | ręczny AT i field CWV OPEN                                            |

## Decyzja

Kwotum nie jest obecnie gotowe do przyjęcia prawdziwych danych pierwszego
klienta. PR-03 jest zamknięte, ale PR-01, PR-02 i blokady P1 dotyczące
powiadomień, monitoringu, ustawień Auth oraz prawa pozostają otwarte. Dopiero po
ich zamknięciu, pełnym UAT i udokumentowanym smoke teście można rozważyć
kontrolowany pilot jednej organizacji. Brak jawnego, podpisanego GO oznacza
NO-GO.
