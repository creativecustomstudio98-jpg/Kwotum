# Release checklist

**Status:** blokująca checklista produkcyjna
**Ostatni przegląd:** 2026-08-09

Każde `[x]` wymaga dowodu przypiętego do tego samego immutable commit SHA
i artefaktu release. Wynik lokalny, deklaracja bez dowodu albo test na innym
commicie nie zamyka pozycji. Szczegóły kolejności wykonania znajdują się
w `PRODUCTION_READINESS_PLAN.md`.

## 1. Zakres produktu

- [ ] Etapy 12ZD–12ZG są ukończone i mają spełnione gate'y.
- [ ] Owner/Admin konfiguruje pricing, scoring i wynik z buildera bez dostępu
      do bazy.
- [ ] Pełna ścieżka konfiguracja → publikacja → widget → wynik → lead →
      powiadomienie działa na produkcyjnym kontrakcie.
- [ ] Konflikt webhooka jest zamknięty: funkcja działa produkcyjnie albo została
      formalnie usunięta ze wszystkich kontraktów MVP.
- [ ] Funkcje i przyciski nie są atrapami; świadome wyłączenia są opisane.
- [ ] Dane demonstracyjne są syntetyczne, oznaczone i nie znajdują się
      w produkcyjnej bazie.
- [ ] Wynik jest jawnie orientacyjny i nie jest prezentowany jako oferta,
      kosztorys, umowa ani automatyczna decyzja.

## 2. Kandydat release i supply chain

- [ ] `git status` jest czysty, a release wskazuje jeden commit SHA.
- [ ] Czysty checkout z frozen lockfile odtwarza testy i build.
- [ ] Node, pnpm, zależności bezpośrednie, lockfile i obrazy runtime są
      przypięte.
- [ ] `format:check`, lint, typecheck, unit, integration, PostgreSQL/RLS,
      WordPress, E2E i build są zielone na SHA.
- [ ] SAST, working-tree secret scan, pełnohistoryczny Gitleaks, Semgrep CE
      (OWASP + reguły Kwotum) i dependency audit są zielone na SHA.
- [ ] Nie ma commitowanych sekretów, dumpów, credentiali, danych klientów ani
      lokalnych plików środowiska.
- [ ] Artefakt jest immutable, identyfikowalny i możliwy do ponownego wdrożenia.

## 3. Dane i bezpieczeństwo

- [ ] RLS/IDOR/role testują co najmniej dwa tenanty oraz członka zawieszonego.
- [ ] Pricing/scoring jest liczony ponownie na serwerze i odporny na manipulację
      klienta.
- [ ] Upload przechodzi limit, allowlistę, MIME, magic bytes, prywatny Storage
      i produkcyjny ClamAV fail-closed.
- [ ] Rozproszony rate limit per IP/origin oraz adaptacyjny Turnstile działają
      dla publicznej ścieżki.
- [ ] Webhook przechodzi SSRF, HMAC, replay, retry, timeout, redirect, DNS/IP,
      idempotencję i test redakcji albo został formalnie wyłączony z MVP.
- [ ] CSP, CORS, cookies, callbacki OAuth, nagłówki i noindex zostały sprawdzone
      na docelowych domenach.
- [ ] Sekrety produkcyjne są odseparowane, rotowalne i nie są dostępne
      w kliencie ani zwykłych odczytach panelu.
- [ ] Logi i error tracking przechodzą test redakcji PII.
- [ ] Brak otwartych critical/high; każde medium ma ownera, termin i approval.

## 4. Migracje, retencja i odtwarzanie

- [ ] Migracje mają forward plan, kompatybilność, backup point i rollback plan.
- [ ] Migracja została przećwiczona na stagingu z pomiarem czasu.
- [ ] Backup obejmuje PostgreSQL, prywatny Storage i krytyczne konfiguracje.
- [ ] Restore do izolowanego środowiska został wykonany, a rekordy, relacje
      i pliki zweryfikowane.
- [ ] Rollback aplikacji oraz migracja naprawcza zostały przećwiczone.
- [ ] RPO/RTO zostały zatwierdzone przez biznes i odpowiadają planowi dostawcy.
- [ ] Retencja leadów, plików, sesji, consentu, audytu, logów i backupu jest
      zatwierdzona.
- [ ] Export, legal hold, erasure i schedulery purge działają oraz mają alerty.

## 5. Infrastruktura i środowiska

- [ ] Local, preview, staging i production mają osobne bazy, Storage, klucze
      i providery.
- [ ] Preview i staging nie łączą się z produkcją i używają danych syntetycznych.
- [ ] Hosting, region Supabase, e-mail, ClamAV, CDN/WAF, monitoring i domeny
      mają zaakceptowanych właścicieli.
- [ ] Health i readiness sprawdzają właściwe zależności.
- [ ] Schedulery powiadomień, retencji, analytics purge i webhooków działają.
- [ ] DNS, TLS, domena nadawcy, SPF/DKIM/DMARC i callbacki OAuth są poprawne.
- [ ] Limity DB, Storage, e-maila i hostingu mają monitoring oraz progi alertów.

## 6. Obserwowalność i operacje

- [ ] Metryki obejmują request rate/error/latency, submit, e-mail, webhook,
      schedulery, storage i DB.
- [ ] Krytyczne alerty mają progi, ownerów, kanały i przetestowane wywołanie.
- [ ] Istnieją runbooki dla submitu, 5xx, kolejki, tenant leakage, utraty bazy,
      credential leak i awarii dostawcy.
- [ ] Wskazano Support Ownera, Privacy Ownera i Security Incident Ownera.
- [ ] Firma pilotażowa zna kanał wsparcia, godziny reakcji i ścieżkę eskalacji.
- [ ] Istnieje procedura wyłączenia widgetu bez wdrażania nowej wersji strony.
- [ ] Smoke test staging i production ma checklistę oraz zapisany wynik.

## 7. E-mail, webhook i integracje

- [ ] Provider e-mail, DPA/TIA, domena nadawcy i retencja metadanych są
      zatwierdzone.
- [ ] Potwierdzenie klienta i alert firmy przechodzą HTML/text, escapowanie,
      retry, idempotencję i test w reprezentatywnych klientach pocztowych.
- [ ] Bounce/complaint i trwałe błędy mają ustaloną obsługę.
- [ ] Webhook delivery ma monitoring wieku kolejki i dead-letter state albo
      funkcja jest formalnie poza MVP.
- [ ] WordPress działa na wspieranych wersjach i reprezentatywnym hostingu
      pilota, bez credentialu we froncie.
- [ ] Hosted, inline, popup i fullscreen działają na docelowych domenach.

## 8. Dostępność, mobile i wydajność

- [ ] Axe, klawiatura, reduced motion, forced colors i brak overflow przechodzą
      dla krytycznej ścieżki.
- [ ] Ręczny VoiceOver/NVDA przeszedł logowanie, builder, widget, kontakt, lead
      i główne operacje panelu.
- [ ] Zoom 200/400% i reflow przeszły w docelowych przeglądarkach.
- [ ] Testy wykonano na reprezentatywnych urządzeniach i stronach hosta.
- [ ] Budżety JavaScriptu marketingu i widgetu są zachowane.
- [ ] Staging performance test nie przekracza zatwierdzonych progów, a plan
      zbierania danych terenowych jest aktywny.

## 9. Prawo, prywatność i marka

- [ ] Ustalono role administrator/procesor/podprocesor dla operatora, firmy
      i agencji.
- [ ] Podpisano DPA i zatwierdzono SCC/TIA, regiony oraz subprocesorów.
- [ ] Finalny regulamin, privacy, cookies, informacje widgetu i podstawy prawne
      zatwierdziła uprawniona osoba.
- [ ] Dane operatora, kontakty privacy/support i procedura DSAR są publiczne.
- [ ] Nazwa Kwotum oraz domeny są prawnie i operacyjnie zatwierdzone.
- [ ] Canonical, sitemap, robots, noindex, schema, 404/500 i link check
      przechodzą na produkcyjnej domenie.
- [ ] Nie ma fikcyjnych opinii, wyników, klientów, review schema ani
      nieoznaczonych danych demo.

## 10. Pilot i release approval

- [ ] Firma ma zatwierdzone pytania, pricing, scoring, disclaimer i przypadki
      regresyjne.
- [ ] UAT obejmuje role, widget, e-mail, webhook, upload, mobile i awarie.
- [ ] Istnieje możliwość natychmiastowego wyłączenia embedu oraz rollback.
- [ ] Ustalono baseline, metryki i progi go/no-go przed uruchomieniem.
- [ ] Product, Engineering, Security, Legal, Operations i firma podpisały
      protokół go/no-go.
- [ ] Pierwszy rollout obejmuje jedną organizację, ograniczony ruch, równoległy
      kanał kontaktu i hypercare.

## 11. Decyzja końcowa

- [ ] Każda powyższa pozycja ma dowód, datę i właściciela.
- [ ] Release candidate, migracje, konfiguracja i dokumenty odnoszą się do tej
      samej wersji.
- [ ] Decyzja `GO` została zapisana; brak decyzji oznacza `NO-GO`.
