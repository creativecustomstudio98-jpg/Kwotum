# Audyt baseline'u repozytorium — 2026-08-08

**Etap:** 12ZD
**Zakres:** lokalny kandydat release, bez wdrożenia i bez danych klientów
**Decyzja:** **NO-GO** do czasu czystego SHA, odtworzenia z clean checkoutu i
zielonego zdalnego CI na tym samym SHA

## Cel i metoda

Audyt porządkuje zastany, rozbudowany worktree przed pierwszym pilotem. Nie
uznaje historycznych statusów za dowód: klasyfikuje pliki, sprawdza sekrety i
zależności, uruchamia gate'y aplikacji, tenant isolation, WordPress oraz
produkcji standalone. Nie publikuje aplikacji, nie zmienia danych użytkownika i
nie zatwierdza zamrożonych etapów produktu.

## Inwentaryzacja

Początkowy stan obejmował 106 zmienionych plików śledzonych, 101 wpisów
untracked w `git status`, 1 204 rzeczywiste pliki untracked i około 710 MiB
lokalnych danych. Największą grupą był `artifacts/promo/`: 488 lokalnych
plików źródłowych i renderów promocyjnych, około 510 MiB podczas
inwentaryzacji. Katalog został dodany do `.gitignore`, bez kasowania danych.

Po tej klasyfikacji kandydat repozytorium ma 717 plików untracked:

| Klasa                  |              Liczba | Decyzja                                                         |
| ---------------------- | ------------------: | --------------------------------------------------------------- |
| `artifacts/visual-qa/` |                 571 | dowody odbioru; wersjonować z odpowiadającymi zmianami UI       |
| `docs/ui/`             |                  53 | kontrakty i raporty UI; wersjonować logicznymi etapami          |
| `apps/`                |                  32 | kod runtime; wymaga kompletnego logicznego commita              |
| `tests/`               |                  23 | testy regresji; wersjonować razem z funkcją                     |
| `supabase/`            |                   6 | trzy migracje i testy RLS; wersjonować atomowo z rollbackiem    |
| `scripts/`             |                  24 | narzędzia QA/release; wersjonować po weryfikacji                |
| pozostałe              |                   8 | pakiety, dokumentacja i patch zależności; klasyfikować z etapem |
| `artifacts/promo/`     | lokalne, ignorowane | nie jest artefaktem release; pozostaje poza Git                 |

Nie wykryto jawnych sekretów ani prawdziwych danych klientów w kandydacie.
Pełna historia Git nadal wymaga zdalnego Gitleaks przed GO.

## Bezpieczeństwo zależności

Pierwszy audyt wykrył dziewięć znanych podatności: cztery high i pięć
moderate, w tym w `undici`, `brace-expansion`, `js-yaml`, `nanoid` i
`postcss`. Wymuszone wersje zostały podniesione do:

- `undici@7.29.0`;
- `brace-expansion@5.0.9`;
- `js-yaml@4.3.1`;
- `nanoid@3.3.17`;
- `postcss@8.5.26`.

Patch `brace-expansion` zachowuje jednocześnie callable export wymagany przez
`minimatch@3` i nazwany export używany przez `minimatch@10`. Po aktualizacji
`pnpm audit` raportuje zero znanych podatności, a instalacja przechodzi polityki
supply-chain workspace'u.

Rollback tej zmiany polega na cofnięciu `pnpm-workspace.yaml`, lockfile'a oraz
patcha do jednego wcześniejszego commita i wykonaniu frozen install. Nie należy
cofać pojedynczej paczki bez zgodnego lockfile'a i patcha.

## Wyniki gate'ów lokalnych

| Gate                                 | Wynik                                                                |
| ------------------------------------ | -------------------------------------------------------------------- |
| format, lint, typecheck, unit, build | PASS; Turbo 32/32, unit 177/177, build 40 tras                       |
| SAST i working-tree secret scan      | PASS                                                                 |
| dependency audit                     | PASS; zero znanych podatności                                        |
| PostgreSQL/RLS                       | PASS na odizolowanej lokalnej bazie; baza testowa usunięta po teście |
| tenant/security negative cases       | PASS, w tym drugi tenant, Sales i zawieszony użytkownik              |
| WordPress                            | PASS dla 6.9.2 i 7.0.2 na PHP 8.5                                    |
| Playwright production standalone     | 257 PASS, 17 SKIP, 0 FAIL                                            |
| diff whitespace                      | PASS                                                                 |

Szesnaście pominiętych scenariuszy panelu wymaga tymczasowych wartości
`PANEL_E2E_*`; jeden skip dotyczy warunkowego flow preview. To nie jest pełny
gate pilota. Test auth został oznaczony jako slow, ponieważ wykonuje osiem
przebiegów ekranów, screenshoty i axe, bez osłabiania asercji. Naprawiono też
regresję wysokości hero `/branze` w macierzy 320–1536 px bez obniżania CSP.

## Otwarte blokery

1. Podzielić zastany kandydat na kompletne, odtwarzalne logiczne commity;
   końcowy `git status` musi być czysty.
2. Odtworzyć frozen install, migracje, build i testy z nowego clean checkoutu.
3. Uruchomić wszystkie scenariusze panelu na tymczasowej organizacji i danych
   syntetycznych; po teście usunąć konto i dane.
4. Wypchnąć dokładny SHA i uzyskać zielone CI, CodeQL oraz pełnohistoryczny
   Gitleaks na tym samym SHA.
5. Dopiero po 12ZD przejść do otwartych gate'ów 12ZE–13D i checklisty pilota.

## Clean checkout

Pierwszy przebieg z detached worktree dokładnego SHA ujawnił wyścig między
`next typegen` i `next build`: oba procesy równolegle modyfikowały
`.next/types/routes.d.ts`, a Turbo zwróciło kod 0 mimo zalogowanego `ENOENT`.
Graf zadań został zaostrzony tak, aby każdy `build` czekał na własny
`typecheck`. Ponowny zimny przebieg z detached checkoutu SHA `517d80a`
przeszedł bez `ENOENT`: frozen install, 32/32 zadań Turbo, build 40 tras,
177 testów jednostkowych, pełne RLS na świeżej tymczasowej bazie, WordPress,
SAST, secret scan i dependency audit. Tymczasowa baza została usunięta po
teście. Sam pozornie zielony kod wyjścia nie jest uznawany za dowód; log został
sprawdzony pod kątem poprawnej kolejności typegen → build.

## Zdalne CI — pierwsza próba

Draft PR [#10](https://github.com/creativecustomstudio98-jpg/Kwotum/pull/10)
uruchomił CI, CodeQL i Gitleaks na SHA `e5ed147`. Pierwsza próba ujawniła
wyłącznie luki konfiguracji runnera: brak jawnego `GITHUB_TOKEN` dla Gitleaks,
brak deklarowanej zależności `ripgrep` w jobach Quality Gate i WordPress oraz
brak uprawnienia `actions: read` dla CodeQL. Testy PHP WordPress przechodziły
przed fałszywym alarmem wywołanym brakiem `rg`, a CodeQL przeanalizował 297/297
plików TypeScript przed odrzuceniem zapisu wyniku.

Remediacja deklaruje zależność runnera, dodaje fail-fast do skryptów lokalnych,
przekazuje token przy minimalnych uprawnieniach oraz migruje Gitleaks z v2 na
v3 (Node 24), aby uniknąć zapowiedzianego wyłączenia v2 we wrześniu 2026.
Drugi przebieg potwierdził Gitleaks PASS oraz Quality Gate PASS od formatu do
produkcjnego builda, włącznie z pełnym RLS. Ujawnił też niekompatybilność
`wp eval-file` ze `strict_types` na PHP 8.3/8.4; harness zostaje zmieniony na
normalny `require` bez usuwania strict types.

CodeQL przeanalizował 297/297 plików TypeScript, 32/32 JavaScript i oba
workflow, lecz GitHub odrzucił publikację SARIF: prywatne repozytorium konta
osobistego nie ma włączonego GitHub Code Security. Nie obchodzimy ograniczenia
licencyjnego przez wyłączenie uploadu. Gate wymaga włączenia płatnego Code
Security lub osobno zaakceptowanego, zgodnego licencyjnie zamiennika SAST.
Odbiór nadal wymaga zielonego ponownego przebiegu dostępnych kontroli na
końcowym SHA oraz jawnej decyzji dla CodeQL.

## Kryterium odbioru

Ten raport dokumentuje lokalny postęp, ale nie zamyka Etapu 12ZD. Jedynym
dowodem ukończenia będzie immutable SHA spełniający gate z `docs/TASKS.md`.
Do tego momentu obowiązuje **NO-GO** dla domeny produkcyjnej, prawdziwych danych
i pierwszego płacącego klienta.
