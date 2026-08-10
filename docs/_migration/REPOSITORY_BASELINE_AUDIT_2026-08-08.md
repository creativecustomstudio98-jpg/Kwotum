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
| format, lint, typecheck, unit, build | PASS; Turbo 32/32, unit 178/178, build 40 tras                       |
| SAST i working-tree secret scan      | PASS                                                                 |
| dependency audit                     | PASS; zero znanych podatności                                        |
| PostgreSQL/RLS                       | PASS na odizolowanej lokalnej bazie; baza testowa usunięta po teście |
| tenant/security negative cases       | PASS, w tym drugi tenant, Sales i zawieszony użytkownik              |
| WordPress                            | PASS dla 6.9.2 i 7.0.2 na PHP 8.5                                    |
| Playwright production standalone     | 257 PASS, 17 SKIP, 0 FAIL                                            |
| Uwierzytelniony panel standalone     | 17 PASS, cleanup organizacja/Auth/Storage `0/0/0`                    |
| diff whitespace                      | PASS                                                                 |

Szesnaście pominiętych scenariuszy panelu wymaga tymczasowych wartości
`PANEL_E2E_*`; jeden skip dotyczy warunkowego flow preview. To nie jest pełny
gate pilota. Test auth został oznaczony jako slow, ponieważ wykonuje osiem
przebiegów ekranów, screenshoty i axe, bez osłabiania asercji. Naprawiono też
regresję wysokości hero `/branze` w macierzy 320–1536 px bez obniżania CSP.

Ogólny zestaw nadal jawnie pomija testy wymagające lokalnego konta, ale
oddzielny `pnpm e2e:panel` odtwarza je na jednorazowym, losowym fixture i
potwierdza cleanup. Nie wymaga stałych `PANEL_E2E_*` ani sekretów CI.

## Otwarte blokery

1. Podzielić zastany kandydat na kompletne, odtwarzalne logiczne commity;
   końcowy `git status` musi być czysty.
2. Odtworzyć frozen install, migracje, build i testy z nowego clean checkoutu.
3. Wypchnąć dokładny SHA i uzyskać zielone CI, Semgrep CE oraz
   pełnohistoryczny Gitleaks na tym samym SHA.
4. Zatwierdzony zamiennik CodeQL uruchomić z przypiętym obrazem i regułami;
   nie obchodzić blokady przez wyłączenie uploadu SARIF.
5. Odtworzyć końcowy SHA z nowego clean checkoutu i potwierdzić ten sam gate.
6. Dopiero po 12ZD przejść do otwartych gate'ów 12ZE–13D i checklisty pilota.

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
produkcyjnego builda, włącznie z pełnym RLS. Ujawnił też niekompatybilność
`wp eval-file` ze `strict_types` na PHP 8.3/8.4; harness zostaje zmieniony na
normalny `require` bez usuwania strict types.

CodeQL przeanalizował 297/297 plików TypeScript, 32/32 JavaScript i oba
workflow, lecz GitHub odrzucił publikację SARIF: prywatne repozytorium konta
osobistego nie ma włączonego GitHub Code Security. Nie obchodzimy ograniczenia
licencyjnego przez wyłączenie uploadu. Właściciel 2026-08-09 zaakceptował
zgodny licencyjnie Semgrep CE zamiast zakupu Code Security. Odbiór nadal
wymaga zielonego ponownego przebiegu dostępnych kontroli na końcowym SHA.

## Semgrep CE i zaostrzenie supply chain — czwarty pass

Workflow CodeQL zastąpiono blokującym Semgrep CE opisanym w ADR-038. Obraz
1.164.0 jest przypięty digestem, oficjalne reguły OWASP są pobierane z
przypiętym SHA-256 i nie są redystrybuowane, a sama analiza działa offline z
kodem tylko do odczytu. Własne osiem reguł Kwotum przeszło 8/8 testów.
Końcowy lokalny skan wykonał 288 reguł na 662 plikach: 0 ustaleń, 100%
parsowania, kod wyjścia 0 w trybie strict.

Wszystkie zewnętrzne GitHub Actions przypięto do pełnych commit SHA. pnpm
blokuje wersje młodsze niż siedem dni, regresję pochodzenia i egzotyczne
zależności tranzytywne; cztery wyjątki wskazują wyłącznie dokładne, zreviewowane
wersje. Frozen install ponownie zweryfikował 543/543 wpisy lockfile. Dependabot
ma siedmiodniowy cooldown zwykłych aktualizacji, bez opóźniania security
updates. Zdalny gate pozostaje wymagany na końcowym SHA.

## Powtarzalny visual regression w CI

Pierwszy pełny Quality Gate na Linuxie potwierdził format, lint, SAST, audyt
zależności, typecheck, 177 testów jednostkowych, pełne RLS i build, ale ujawnił
14 różnic snapshotów oraz kontraktów geometrii. Przyczyną nie była zmiana
funkcjonalna: stare obrazy powstały na macOS z fontem systemowym, podczas gdy
runner używał Linuxa i innego zestawu fontów.

Remediacja nie zwiększa tolerancji `maxDiffPixelRatio` i nie usuwa asercji:

- Inter 4.1 jest dostarczany lokalnie jako variable WOFF2 wraz z licencją SIL
  Open Font License 1.1, więc render nie zależy od sieci ani fontów runnera;
  SHA-256 fontu to
  `693b77d4f32ee9b8bfc995589b5fad5e99adf2832738661f5402f9978429a8e3`;
- Quality Gate działa w przypiętym obrazie
  `mcr.microsoft.com/playwright:v1.61.0-noble`, zgodnym z wersją Playwright w
  lockfile, oraz wieloplatformowym digestem
  `sha256:57b65fdc9ceabe0ef613124c7bbe2babcf9362c4d85e382fe3b03604e84b428a`;
- job jawnie instaluje `ripgrep`, klienta PostgreSQL i PHP CLI; obraz
  przeglądarkowy nie jest traktowany jako nieudokumentowane źródło narzędzi
  SAST, RLS ani harnessu WordPress;
- `snapshotPathTemplate` rozdziela zaakceptowane baseline'y `darwin` i
  `linux`; oba katalogi zawierają po 12 aktywnych obrazów używanych przez
  testy;
- 14 nieużywanych, historycznych snapshotów usunięto po sprawdzeniu wszystkich
  wywołań `toHaveScreenshot`;
- błędy geometrii naprawiono w CSS dla agency method, sekcji integracji,
  product map, home key information oraz hero branż, bez osłabiania limitów;
- raport i trace Playwright są przechowywane przez 14 dni wyłącznie przy
  niepowodzeniu joba.

Pełny produkcyjny Playwright na macOS przechodzi 257 testów przy 17 jawnych
skipach. Przypięty Linux potwierdza build oraz docelowy zestaw branż 11/11;
pełny dowód Linux pozostaje wynikiem końcowego Quality Gate na GitHubie.
Reprezentatywne baseline'y hero, guided flow, design systemu, auth i widgetu
zostały sprawdzone wizualnie po osadzeniu fontu.

## Uwierzytelniony panel — trzeci pass

Komenda `pnpm e2e:panel` buduje standalone i sama tworzy na lokalnym Supabase
losowego użytkownika, organizację Ownera oraz wyłącznie syntetyczne dane.
Końcowy przebieg 2026-08-09 przeszedł **17/17**: 16 scenariuszy panelu i
bezstanowy podgląd opublikowanego procesu. Po teście zapytanie kontrolne
potwierdziło `0|0|0` dla organizacji, użytkownika Auth i obiektów Storage.

Przebieg ujawnił i zamknął drift między zaakceptowanymi kontraktami a kodem:

- loader widgetu obsługuje element podglądu utworzony przed rejestracją custom
  elementu, bez publicznego API, localStorage i wywołań sieciowych;
- builder zachowuje trzy kolumny przy 1448 px także po rozwinięciu sidebara
  240 px;
- reguła pełnej powierzchni Procesów nie obejmuje przypadkowo biblioteki
  Szablonów, która zachowuje zatwierdzony kontener i geometrię 19/20;
- lista leadów wraca do udokumentowanej paginacji po osiem rekordów;
- testy instalacji i Integracji mierzą wypełnienie realnego workspace'u po
  odjęciu kontrolowanego paddingu, zamiast historycznej liczby sprzed zmiany
  sidebara.

Harness odrzuca hostowane endpointy i zapisuje screenshoty w katalogu
tymczasowym. Cleanup działa również po nieudanym teście i jest częścią wyniku,
nie ręcznym krokiem po fakcie.

## Kryterium odbioru

Ten raport dokumentuje lokalny postęp, ale nie zamyka Etapu 12ZD. Jedynym
dowodem ukończenia będzie immutable SHA spełniający gate z `docs/TASKS.md`.
Do tego momentu obowiązuje **NO-GO** dla domeny produkcyjnej, prawdziwych danych
i pierwszego płacącego klienta.
