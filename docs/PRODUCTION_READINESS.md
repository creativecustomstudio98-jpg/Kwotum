# Gotowość produkcyjna Kwotum

**Status:** kanoniczny raport wykonawczy  
**Ostatni przegląd:** 2026-08-09

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

| ID    | Priorytet          | Ryzyko i wpływ biznesowy                                                                                                                                                                   | Dowód                                                                                              | Naprawa / kryterium akceptacji                                                                                                   |
| ----- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| PR-01 | P0                 | Publiczny widget nie ma rozproszonego limitu per IP/origin ani adaptacyjnego Turnstile. Spammer może zużyć zasoby i zablokować prawdziwe leady.                                            | `docs/SECURITY.md`, sekcja ryzyka Etapu 5; brak adaptera w `apps/web/app/api/v1/public/`           | Etap 13B: wspólny store limitów, limity IP/origin/flow/session/org, Turnstile przy podwyższonym ryzyku i testy retry/bypass.     |
| PR-02 | P0                 | Produkcyjny ClamAV, backup DB/Storage, restore drill, monitoring i schedulery nie są aktywne. Utrata danych lub przyjęcie złośliwego pliku nie ma operacyjnej bariery.                     | `apps/web/lib/security/malware-scanner.ts`, `docs/BACKUP_AND_RECOVERY.md`, `docs/OBSERVABILITY.md` | Etapy 13A–13C: prywatny ClamAV fail-closed, backup poza głównym dostawcą, restore staging, alerty i podpisany protokół RPO/RTO.  |
| PR-03 | P0                 | Nie ma jeszcze zielonego CI, Semgrep CE i pełnohistorycznego Gitleaks na jednym końcowym SHA zawierającym nowy gate. Obecny plan prywatnego repo nie udostępnia branch protection.         | `.github/workflows/ci.yml`, `.github/workflows/semgrep.yml`, `docs/TASKS.md` 12ZD                  | Wypchnąć kandydat, uzyskać zielone wszystkie joby i wskazać SHA. Do GitHub Pro właściciel nie merge'uje bez ręcznej weryfikacji. |
| PR-04 | P1                 | Testy signed URL nie zawierają osobnego negatywnego przypadku bezpośredniej próby podpisania ścieżki drugiego tenanta. RLS Storage jest testowane, ale ten kontrakt wymaga jawnego dowodu. | `apps/web/lib/leads/service.ts`, `supabase/tests/tenant_isolation.sql`                             | Dodać integracyjny test A/B: verified, pending scan, foreign tenant i expiry 60 s.                                               |
| PR-05 | P1                 | Upload buforuje multipart i plik w pamięci requestu, a produkcyjna kwarantanna nie jest wdrożona jako osobny stan Storage. Przy równoległych plikach rośnie ryzyko pamięci i awarii.       | `apps/web/app/api/v1/public/sessions/current/files/route.ts`                                       | Etap 13B: kontrolowana sesja, prywatna kwarantanna, streaming/skan, finalizacja i testy limitów oraz awarii.                     |
| PR-06 | P1                 | MFA Ownerów, SMTP Auth, limity logowania, SSL enforcement i network restrictions wymagają konfiguracji i dowodu z Supabase Dashboard.                                                      | `docs/SECURITY.md`, `docs/RELEASE_CHECKLIST.md`                                                    | Wykonać checklistę z `SECURITY_AND_DATA.md`, zapisać screenshot/eksport ustawień bez sekretów i test konta administracyjnego.    |
| PR-07 | P1                 | Provider e-mail, domena nadawcy, alerty kolejki i realny test dostawy nie są zatwierdzone. Submit może działać, ale firma nie dostać leada.                                                | `apps/web/lib/notifications/worker.ts`, `docs/NOTIFICATIONS.md`                                    | Wybrać provider, DPA, SPF/DKIM/DMARC, scheduler, alert wieku kolejki i test HTML/text w realnych klientach.                      |
| PR-08 | P1                 | Webhook v1 jest gotowy aplikacyjnie, ale bez produkcyjnego schedulera, alertów i stagingowego UAT dostawa może nie ruszyć albo utknąć bez reakcji.                                         | `docs/WEBHOOKS.md`, `docs/TASKS.md` 12ZF                                                           | Etap 13A: scheduler co minutę, alert wieku kolejki/dead-letter, syntetyczny probe i UAT odbiorcy przed prawdziwymi danymi.       |
| PR-09 | P1                 | Nowa oferta pierwszych pięciu klientów (599/999 zł, miesiąc gratis) nie jest jeszcze wdrożona w landingu, CTA ani formularzu Founding Client.                                              | `apps/web/app/(marketing)`, `tests/e2e/marketing.spec.ts`                                          | Osobny etap P1 po 12ZD: działające CTA, kwalifikacja, dostawa zgłoszenia i analityka bez PII.                                    |
| PR-10 | P1                 | Brak aktywnego error trackingu, uptime i alertów submit/upload/integracji.                                                                                                                 | `docs/OBSERVABILITY.md`; brak zatwierdzonego adaptera runtime                                      | Etap 13A: provider, redakcja PII, request ID, syntetyczny submit i przetestowane alerty.                                         |
| PR-11 | zamknięte lokalnie | `/design-system` ma runtime 404 w staging/production i pozostaje dostępny wyłącznie w local/preview; docelowy hosting nadal wymaga powtórzenia smoke.                                      | `apps/web/app/design-system/availability.ts`, `scripts/smoke-runtime.mjs`                          | Powtórzyć profil production na stagingu i przypiąć wynik do immutable SHA.                                                       |
| PR-12 | P2                 | Brak ręcznego VoiceOver/NVDA oraz terenowych Core Web Vitals.                                                                                                                              | `docs/RELEASE_CHECKLIST.md`                                                                        | Test na docelowym hostingu, urządzeniach i wspieranych przeglądarkach przed publicznym startem.                                  |

Draft PR #10 potwierdził na SHA
`1d99695fd5be53fc33b1bbaf8f63b69da0c3f68a` zielone Quality Gate, Gitleaks i
macierz WordPress. CodeQL wykonał analizę, lecz GitHub odrzucił publikację SARIF
dla prywatnego repozytorium bez płatnego GitHub Code Security. Właściciel
zaakceptował bezpłatny Semgrep CE jako blokujący zamiennik zgodnie z ADR-038.
Nowy workflow i finalny zestaw zmian nadal wymagają zielonego przebiegu na
jednym końcowym SHA; wcześniejszy SHA nie zamyka PR-03.
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
| Service role          | ograniczony               | cztery przepływy: upload, notifications, retention, webhook worker    |
| Auth/sesje            | kod PASS                  | MFA, SMTP i provider rate limits ręcznie                              |
| Public API/widget     | częściowo                 | brak rozproszonego rate limit/Turnstile                               |
| Upload/Storage        | częściowo                 | prywatny bucket i walidacja PASS; ClamAV/kwarantanna produkcyjna OPEN |
| Nagłówki/SEO          | lokalnie PASS             | test na docelowej domenie; design system ma runtime 404 poza local    |
| Migracje/integralność | lokalnie PASS             | rehearsal, backup point i rollback na stagingu                        |
| Backup/DR             | projekt istnieje          | brak aktywnego backupu i restore drill                                |
| Logi/observability    | health/readiness lokalnie | brak providera, uptime i alertów                                      |
| CI/CD                 | kandydat lokalnie PASS    | Semgrep/Gitleaks/Quality/WordPress muszą być zielone na końcowym SHA  |
| Konwersja/sprzedaż    | niezgodna z nowym briefem | osobny etap Founding Client                                           |
| Dostępność/wydajność  | automaty lokalnie PASS    | ręczny AT i field CWV OPEN                                            |

## Decyzja

Kwotum nie jest obecnie gotowe do przyjęcia prawdziwych danych pierwszego
klienta. Po zamknięciu PR-01–PR-03, uruchomieniu infrastruktury z PR-02 i
udokumentowanym smoke teście można rozważyć kontrolowany pilot jednej
organizacji. Brak jawnego, podpisanego GO oznacza NO-GO.
