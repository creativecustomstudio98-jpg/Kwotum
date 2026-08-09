# Model zagrożeń Kwotum

## Zakres i granice zaufania

Przegląd wykonano 2026-07-25 i zaktualizowano 2026-08-09 dla aplikacji Next.js,
widgetu, PostgreSQL/RLS, Storage, workera powiadomień, workera retencji,
workera webhooków i konektora WordPress. Chronione
aktywa to PII i pliki leadów, odpowiedzi, zgody, reguły ceny i score, sesje,
członkostwa, credentiale integracji oraz dowody audytowe.

Granice zaufania:

1. anonimowa przeglądarka lub WordPress → publiczne API;
2. przeglądarka panelu → Supabase Auth → tenant context i RLS;
3. aplikacja → prywatny Storage oraz wąskie RPC;
4. scheduler → endpointy workerów chronione osobnymi sekretami;
5. worker e-mail → opcjonalny Resend;
6. runtime uploadu → prywatny ClamAV;
7. operator → dostawcy infrastruktury i kopie zapasowe.
8. worker webhooków → niezaufany, tenantowo wskazany endpoint HTTPS.

Kod strony gospodarza widgetu nie jest zaufany. Shadow DOM izoluje prezentację,
ale nie tworzy granicy bezpieczeństwa originu.

## Przeciwnicy i scenariusze

| Kategoria              | Scenariusz                                                  | Główne kontrole                                                                                | Test lub dowód                                       |
| ---------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Spoofing               | Kradzież sesji panelu albo tokenu widgetu                   | Auth SSR z `getUser()`, cookies, token 256-bitowy przechowywany jako hash, expiry              | testy Auth i `widget_sessions.sql`                   |
| Tampering              | Klient zmienia cenę, score, routing lub status              | obliczenia i walidacja snapshotu w PostgreSQL, oczekiwana rewizja, kontrolowane RPC            | `estimation.sql`, `lead_pipeline.sql`                |
| Repudiation            | Użytkownik przeczy zmianie statusu, retencji lub legal hold | tenantowy audit log bez pełnego PII, immutable historia, zagregowany dowód usunięcia           | `data_governance.sql`                                |
| Information disclosure | IDOR między organizacjami lub publiczny odczyt PII          | jawny tenant context, forced RLS, generyczne 404, prywatny bucket i signed URL                 | `tenant_isolation.sql`, `data_governance.sql`        |
| Denial of service      | Spam sesji, eventów, uploadów i tokenów WordPress           | limity liczby/rozmiaru, limity w bazie, batch workery, limit czasu skanera                     | test limitu sesji, analityki i WordPress             |
| Elevation of privilege | Admin/Sales wykonuje operację Ownera lub workerową          | capabilities po stronie serwera, role w RPC, odebrane granty, osobne sekrety workerów          | negatywne testy ról i RPC                            |
| XSS                    | Odpowiedź lub nazwa procesu trafia do HTML/e-maila          | React escaping, jawne HTML escaping, JSON-LD z escapowaniem `<`, CSP, zakaz dynamicznego kodu  | test szablonów, E2E i SAST                           |
| Złośliwy upload        | polyglot, fałszywe MIME, SVG/script albo malware            | limit body, allowlista, basename, MIME + magic bytes, prywatny bucket, ClamAV fail-closed      | `file-validation.test.ts`, `malware-scanner.test.ts` |
| Replay                 | ponowienie submitu, zapisu, bootstrapu lub dostawy          | mutation UUID, unique constraints, single-use token, idempotency key dostawcy                  | testy widgetu, leadów, WordPress i e-mail            |
| Supply chain           | podatna paczka, złośliwa aktualizacja lub sekret w repo     | exact versions, 7 dni release age, provenance, Gitleaks, Semgrep CE, SAST i audit w CI         | workflowy, testy reguł i skrypty `security:*`        |
| SSRF/DNS rebinding     | endpoint webhooka wskazuje sieć prywatną lub zmienia DNS    | publiczny DNS, blokada zakresów IPv4/IPv6, all-answer check, pinned lookup, TLS, zero redirect | `security.test.ts`, `transport.test.ts`              |
| Webhook spoof/replay   | fałszywy albo powtórzony `lead.created`                     | per-endpoint HMAC, timestamp, replay window, stabilny delivery ID i idempotency                | `signing.test.ts`, `webhook_delivery.sql`            |
| Data exfiltration      | payload/log/history ujawnia nadmiar danych leada            | allowlista envelope, brak plików/odpowiedzi/score, historia bez payloadu i response body       | `worker.test.ts`, `webhook_delivery.sql`             |

## Najważniejsze decyzje

- Operacje DSAR są dostępne wyłącznie Ownerowi. Admin i Sales nie mogą
  eksportować ani usuwać danych.
- Eksport jest wersjonowaną, allowlistowaną strukturą JSON i nie obejmuje
  sekretów ani wewnętrznych ścieżek Storage.
- Usunięcie plików poprzedza usunięcie rekordów. Awaria Storage zatrzymuje
  operację; rekordowo blokowany stan `erasure pending` wyklucza wyścig z legal
  hold i retencją. Legal hold blokuje zarówno usunięcie ręczne, jak i retencję.
- Lead jest trwale usuwany zamiast pseudonimizowany w miejscu. Odpowiedzi
  tekstowe i pliki mogą ponownie identyfikować osobę, więc częściowa
  „anonimizacja” dawałaby fałszywą gwarancję. Pozostaje jedynie nieidentyfikujący
  licznik operacji i jej przyczyna.
- Produkcyjny upload jest blokowany, jeżeli ClamAV jest wyłączony lub
  niedostępny. Tryb bez skanera działa wyłącznie dla loopback development/test.

## Ryzyka pozostające

Ryzyka zaakceptowane warunkowo i terminy są prowadzone w
`docs/SECURITY_AUDIT_2026-07-25.md`. Żadne z nich nie może zostać automatycznie
przeniesione do produkcji; zamknięcie należy do gate’u Etapu 13.
