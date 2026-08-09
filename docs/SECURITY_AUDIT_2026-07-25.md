# Audyt bezpieczeństwa — 2026-07-25

> To jest historyczny snapshot Etapu 12. Aktualny gate SAST i decyzję o
> zastąpieniu niedostępnego CodeQL przez Semgrep CE opisują ADR-038,
> `docs/SECURITY.md` i raport baseline'u z 2026-08-08. Liczby i wersje poniżej
> nie są bieżącym dowodem release.

## Status

Audyt techniczny Etapu 12 został wykonany na bieżącym working tree. Nie jest
certyfikatem zewnętrznym ani testem penetracyjnym. W wykonanym zakresie nie ma
znanych ustaleń critical ani high; wszystkie komendy końcowe i lokalny skan
zależności zostały wykonane.

## Metodyka i zakres

- ręczny review architektury, granic zaufania, RPC `security definer`, grantów,
  RLS, uploadu, workerów, logów i danych;
- lokalny SAST `pnpm security:sast` oraz skan working tree
  `pnpm security:secrets`;
- CodeQL i Gitleaks skonfigurowane dla pełnej historii w GitHub Actions;
- dependency audit `pnpm security:dependencies` skonfigurowany jako blokujący
  krok CI;
- DAST w produkcyjnym buildzie przez Playwright: CSP, nagłówki, XSS i CORS;
- testy negatywne PostgreSQL: IDOR, role, replay, rate limit, legal hold,
  retencja i minimalne granty;
- testy uploadu: rozszerzenie, MIME, magic bytes, niebezpieczne nazwy, SVG,
  malware i fail-closed;
- pełne `format:check`, `lint`, `typecheck`, `test`, `e2e`, `build`.

## Ustalenia

| ID        | Pierwotna ważność | Ustalenie                                                                                                         | Stan                                                                                                                   |
| --------- | ----------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| SEC-12-01 | high              | Upload sprawdzał format, lecz nie malware                                                                         | naprawione: ClamAV INSTREAM, timeout i fail-closed                                                                     |
| SEC-12-02 | high              | Brak wykonawczego eksportu, legal hold i trwałego usuwania                                                        | naprawione: owner-only RPC/UI, storage-first i testy IDOR                                                              |
| SEC-12-03 | high              | Brak wykonawczej retencji leadów i wygasłych sesji                                                                | naprawione: polityka opt-in, worker batchowy i ponowna walidacja przed delete                                          |
| SEC-12-08 | high              | Legal hold mógł wejść pomiędzy przygotowanie ścieżek a delete Storage                                             | naprawione w self-review: rekordowo blokowany `erasure pending`, retencja go pomija                                    |
| SEC-12-09 | medium            | Asercja eksportu używała trójwartościowej logiki SQL i mogła przejść dla brakującego klucza                       | naprawione w self-review: null-safe `IS DISTINCT FROM` i dokładna ścieżka kontraktu                                    |
| SEC-12-04 | medium            | Limit tworzenia sesji jest per flow, nie rozproszony per IP/origin; chroni bazę, ale pozwala na celowany DoS flow | zaakceptowane wyłącznie przedprodukcyjnie; Owner: Platform/Security; termin: gate Etapu 13, nie później niż 2026-08-01 |
| SEC-12-05 | medium            | Kontakty incydentowe i harmonogram schedulera nie mają jeszcze rzeczywistych osób/usługi                          | Owner: właściciel produktu; termin: przed stagingiem Etapu 13, nie później niż 2026-08-01                              |
| SEC-12-06 | medium            | DPA, transfer impact assessment, region Supabase, Resend i okresy retencji nie mają podpisanego review prawnego   | Owner: administrator danych; termin: przed włączeniem danych rzeczywistych, nie później niż 2026-08-01                 |
| SEC-12-07 | do weryfikacji    | Lokalny audit zależności wymagał ujawnienia grafu registry                                                        | zamknięte: właściciel wyraził zgodę; ponowny audit nie wykrył znanych podatności                                       |
| SEC-12-10 | high              | Audit wykrył podatne `sharp`, `postcss` i `brace-expansion`                                                       | naprawione: 0.35.3, 8.5.22 i 5.0.8; audit, lint i pełny gate są zielone                                                |

Nie zaakceptowano żadnego ustalenia critical ani high. Ustalenia high zostały
naprawione i przeszły pełny gate po implementacji. Medium mają jawnego owner’a,
termin oraz bramkę produkcyjną.

## Macierz wymaganych ataków

| Atak       | Pokrycie                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------- |
| IDOR       | forced RLS dwóch tenantów, generyczne błędy eksportu, role Owner/Admin/Sales                       |
| XSS        | React/output encoding, e-mail escaping, JSON-LD escaping, CSP, DAST payload                        |
| Upload     | limit strumienia, liczby i rozmiaru; MIME/magic bytes; basename; prywatny Storage; ClamAV          |
| Rate limit | limit sesji/flow, eventów/sesję, WordPress tokenów/użytkownika; test przekroczenia                 |
| Replay     | mutation UUID, expected revision, unikalny submit, single-use WordPress token, idempotentny e-mail |

## Ograniczenia

- Skan lokalny z tego historycznego przebiegu nie zastępował zdalnego gate'u,
  pełnohistorycznego Gitleaks ani zewnętrznego pentestu. Aktualny Semgrep CE
  również nie zastępuje review ani pentestu.
- Test DAST działa na lokalnym produkcyjnym buildzie, bez rzeczywistej warstwy
  CDN/WAF/TLS.
- Nie przeprowadzono review prawnego. Rejestr w
  `docs/DPA_AND_SUBPROCESSORS.md` jest materiałem wejściowym, nie akceptacją.
- Restore, backup expiry, WAF i rozproszony limit per IP należą do gate’u
  operacyjnego Etapu 13.

## Wyniki końcowe

Wyniki lokalne na 2026-07-25:

| Kontrola                           | Wynik                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------- |
| `pnpm format:check`                | passed                                                                     |
| `pnpm lint`                        | passed, zero warnings                                                      |
| `pnpm typecheck`                   | passed                                                                     |
| `pnpm test`                        | passed: 82 testy jednostkowe, 9 zestawów PostgreSQL/RLS, harness WordPress |
| `pnpm build`                       | passed: 37 stron, widget 15 888 B gzip przy budżecie 92 160 B              |
| `pnpm e2e`                         | 16/16 passed, w tym DAST CSP/XSS/CORS                                      |
| `pnpm security:scan`               | SAST i working-tree secret scan passed                                     |
| `git diff --check`                 | passed                                                                     |
| CodeQL + pełnohistoryczny Gitleaks | skonfigurowane; niewykonane z powodu billing lock GitHub Actions           |
| `pnpm security:dependencies`       | passed: `No known vulnerabilities found`                                   |

W wykonanym zakresie nie pozostało znane ustalenie critical/high. Formalny gate
Etapu 12 pozostaje zablokowany przez zdalne skany oraz review prawne. Nie wolno
interpretować tego stanu jako produkcyjnej akceptacji.
