# Backlog etapowy

Statusy: `[x]` ukończone i zweryfikowane, `[ ]` nierozpoczęte, `[~]` w toku, `[!]` zablokowane. W danej sesji realizuj wyłącznie jeden etap.

## Etap 0 — Discovery

- [x] Zdefiniować problem, odbiorców, JTBD i ścieżki.
- [x] Ustalić scope MVP i non-goals.
- [x] Opisać architekturę, model danych, autoryzację, API i widget.
- [x] Opisać bezpieczeństwo, prywatność, obserwowalność, deployment i backup.
- [x] Ustalić zasady designu, IA, dostępności i content design.
- [x] Przygotować strategię marketingową, SEO, analitykę i CRO.
- [x] Przeprowadzić źródłowy desk research konkurencji na 2026-07-23.
- [x] Przygotować mapę słów kluczowych bez wymyślonych wolumenów i CSV do eksportu.
- [x] Udokumentować wstępną walidację nazwy oraz ostrzeżenie prawne.
- [x] Utworzyć roadmapę, ryzyka, QA, release i post-launch.

**Gate:** kompletność plików sprawdzona automatycznie; spójność wewnętrzna sprawdzona. Przed Etapem 1 wymagany review właściciela produktu: zatwierdzenie zakresu MVP, rynku PL, modularnego monolitu i roboczego użycia nazwy. Badanie prawne nazwy nie blokuje technicznego Etapu 1, ale blokuje publiczny launch i wydatki brandingowe.

## Etap 1 — Fundament repozytorium

- [x] Zainicjalizować pnpm workspace i Turborepo z `packageManager` przypiętym do stabilnej wersji.
- [x] Utworzyć minimalne katalogi `apps/*`, `packages/*`, `supabase/*` bez ekranów i funkcji Etapu 2+.
- [x] Dodać współdzielone konfiguracje TypeScript strict (`noUncheckedIndexedAccess`, bez nieuzasadnionego `any`).
- [x] Dodać ESLint bez wyłączeń projektu oraz Prettier z kontrolą formatowania.
- [x] Dodać Vitest i jeden rzeczywisty test smoke na pakiet, nie test atrapę.
- [x] Dodać minimalny build aplikacji/artefaktów, który nie implementuje UI produktu.
- [x] Dodać walidację env z rozdzieleniem server/client/test i bez sekretów publicznych.
- [x] Dodać skrypty root: `lint`, `format:check`, `typecheck`, `test`, `build`.
- [x] Dodać CI: frozen install, lint, format check, typecheck, test, build i cache.
- [x] Dodać `.gitignore`, politykę Node/pnpm, Dependabot/Renovate po decyzji oraz skan sekretów.
- [x] Udokumentować bootstrap, zależności, wersje, decyzje i troubleshooting.
- [x] Uruchomić baseline i zaktualizować `CHANGELOG.md` oraz ten backlog.

**Gate:** czysty checkout po instalacji przechodzi `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm build` lokalnie i w CI. Brak implementacji tokenów, komponentów, auth, bazy i ekranów.

**Status gate’u 2026-07-24:** lokalne komendy i frozen/offline install przechodzą na przypiętym Node 24.18.0. Produkcyjny artefakt standalone przeszedł smoke test `GET /health` (HTTP 200). Konfiguracja CI jest gotowa; formalne zamknięcie zdalnej części gate’u oczekuje na pierwszy zielony przebieg GitHub Actions po podłączeniu remote. Właściciel produktu polecił kontynuować kolejne etapy mimo tego zewnętrznego ograniczenia.

## Etap 2 — Design foundation

- [x] Zweryfikować kontrasty i zatwierdzić tokeny przez ADR.
- [x] Zbudować bazowe komponenty i layout panelu.
- [x] Dodać stany loading/empty/error i dokumentację komponentów.
- [x] Testy klawiatury, axe, visual regression i reduced motion.

**Gate:** visual review, brak domyślnego wyglądu biblioteki i pełna klawiatura.

**Status gate’u 2026-07-24:** lokalnie zielony. Visual review wykonany dla
desktopu 1440 px i mobile 390 px; Playwright potwierdza baseline’y, klawiaturę,
reduced motion i brak naruszeń axe WCAG A/AA. Automatyczne testy nie zastępują
ręcznego VoiceOver/NVDA przed release. Zdalny przebieg rozszerzonego CI jest
zablokowany przez billing konta GitHub przed startem runnera.

## Etap 3 — Baza i auth

- [x] Schemat, migracje, seed syntetyczny, Auth, organizacje i członkostwa.
- [x] Role Owner/Admin/Sales, tenant context i RLS.
- [x] Audit log bazowych operacji i testy IDOR.

**Gate:** automatyczny test separacji dwóch tenantów dla odczytu, zapisu i plików.

**Status gate’u 2026-07-24:** lokalnie zielony. `pnpm test:rls` uruchamia
jednorazowy PostgreSQL 17 i potwierdza separację dwóch tenantów dla tabel oraz
prywatnych plików, a także status suspended, brak samodzielnej eskalacji Admina,
ochronę ostatniego Ownera, audit log i logiczne usunięcie organizacji. Pełne
`format:check`, `lint`, `typecheck`, `test` i `build` przechodzą bez wyłączania
reguł. CI ma równoważny serwis PostgreSQL, ale jego zdalne wykonanie pozostaje
zablokowane przez billing konta GitHub przed startem runnera. Etap 4 pozostaje
ukończony lokalnie zgodnie z opisem poniżej.

## Etap 4 — Flow domain

- [x] Draft, kroki, opcje, reguły, wynik, wersjonowanie i publikacja.
- [x] Walidator martwych ścieżek/pętli.
- [x] Pięć realnych szablonów, trzy priorytetowe dopracowane.

**Gate:** możliwe utworzenie, walidacja i publikacja niezmiennej wersji.

**Status gate’u 2026-07-24:** lokalnie zielony. Test PostgreSQL tworzy draft,
waliduje go, publikuje immutable snapshot, sprawdza idempotencję, nową wersję,
konflikt rewizji, archiwizację, ponowną publikację, role Owner/Admin/Sales oraz
IDOR drugiego tenanta. Walidatory TypeScript i SQL wykrywają pętle, martwe kroki,
błędne cele i opcje reguł. Pięć szablonów przechodzi walidację; trzy
priorytetowe mają pełny wywiad. Ich treść pozostaje hipotezą do badań z firmami,
nie fikcyjnie zatwierdzonym wynikiem wywiadów. `format:check`, `lint`,
`typecheck`, `test` i `build` przechodzą bez wyłączeń. Zdalne CI nadal nie
startuje z powodu billing lock konta GitHub. Etap 5 został później ukończony
lokalnie zgodnie z osobnym statusem poniżej.

## Etap 5 — Widget

- [x] Loader/custom element, state machine, manifest i hosted link.
- [x] Sesje, autosave, wznowienie, odpowiedzi, warunki i walidacja.
- [x] Inline/popup/fullscreen, Shadow DOM, mobile i klawiatura.

**Gate:** pełny działający proces bez pricingu, odporny na CSS hosta i utratę sieci.

**Status gate’u 2026-07-25:** lokalnie zielony. Natywny custom element działa
jako inline, popup, fullscreen i hosted link; manifest jest allowlistowaną
projekcją immutable snapshotu. PostgreSQL przechowuje wyłącznie hash tokenu,
przypina sesję do wersji, waliduje odpowiedź i samodzielnie potwierdza przejście.
Autosave używa idempotentnych mutacji i rewizji, a kolejka lokalna przeżywa
utratę sieci. Testy Playwright potwierdzają mobile, klawiaturę, axe, focus return
i izolację od agresywnego CSS. Bundle ma około 10,6 KiB gzip przy budżecie
90 KiB. `format:check`, `lint`, `typecheck`, testy, E2E i build przechodzą bez
wyłączeń. Zdalne CI nadal oczekuje na usunięcie billing lock konta GitHub.
Etap 6 został później ukończony lokalnie zgodnie z osobnym statusem poniżej.

## Etap 6 — Pricing i scoring

- [x] Ograniczony model reguł, serwerowy pricing min/max i formatowanie.
- [x] Deterministyczny scoring, kategorie i lista uruchomionych reguł.
- [x] Testy granic, kolejności, walut, zaokrągleń i manipulacji klienta.

**Gate:** deterministyczne wyniki i explainability dla wszystkich fixture’ów.

**Status gate’u 2026-07-25:** lokalnie zielony. Wersjonowany kontrakt
estymacji obsługuje bazowy przedział, dodawanie, basis points i stawki
jednostkowe oraz tryby exact/range/from. Kwoty pozostają integerami w minor
units, a kolejność i round half-up są jawne. Scoring 0–100 zwraca prywatną
kategorię i uporządkowaną listę uruchomionych reguł. PostgreSQL waliduje
konfigurację podczas `validate_flow` i publikacji, po czym liczy wynik z
odpowiedzi przypiętej sesji; widget nie przesyła ceny ani score. Publiczne API
usuwa scoring i explainability, a manifest nadal nie ujawnia konfiguracji.
Testy obejmują granice, overflow, PLN/EUR/JPY, zaokrąglenia, kolejność,
niepełną sesję, błędną publikację i próbę anonimowego dostępu do kalkulatora.
`format:check`, `lint`, `typecheck`, testy PostgreSQL, 8/8 E2E i `build`
przechodzą bez wyłączeń; widget ma około 11,2 KiB gzip przy budżecie 90 KiB.
Zdalne CI nadal oczekuje na usunięcie billing lock konta GitHub. Etap 7 został
później ukończony lokalnie zgodnie z osobnym statusem poniżej.

## Etap 7 — Lead pipeline

- [x] Contact/consent, idempotentny submit, lead i odpowiedzi.
- [x] Bezpieczny upload, lista/szczegóły, status, historia i notatki.
- [x] Mobile i kontrola ról.

**Gate:** klient wysyła lead, firma widzi go i zmienia status bez tenant leakage.

**Status gate’u 2026-07-25:** lokalnie zielony. Widget pokazuje wynik przed
kontaktem, wymaga e-maila i wersjonowanego potwierdzenia informacji
prywatności, a zgodę marketingową utrzymuje osobno i domyślnie wyłączoną.
Atomowy submit zapisuje jeden lead na sesję, kopiuje odpowiedzi, ponownie liczy
serwerowy pricing/scoring i jest bezpieczny przy retry. Prywatny upload
allowlistuje JPEG/PNG/WebP/PDF, limituje 5 × 25 MiB oraz sprawdza rozszerzenie,
MIME i magic bytes. Owner/Admin/Sales widzą tenantową listę i szczegół, dodają
notatki oraz zmieniają status z historią i audytem. PostgreSQL potwierdza brak
odczytu i mutacji między tenantami oraz dla zawieszonego członka. Pełne
`format:check`, `lint`, `typecheck`, testy PostgreSQL, E2E i `build` przechodzą
bez wyłączeń. Automatyczna retencja, malware scanning i eksport pozostają
bramkami produkcyjnymi Etapu 12. Widget ma około 13,9 KiB gzip przy budżecie
90 KiB. Etap 8 został następnie ukończony zgodnie z gate’em poniżej.

## Etap 8 — Powiadomienia

- [x] Szablony HTML/text dla firmy i klienta.
- [x] Outbox, delivery status, retry i test mode.

**Gate:** render, accessibility i test dostawy bez PII w logach.

**Status gate’u 2026-07-25:** lokalnie zielony. Atomowy submit dopisuje
potwierdzenie klienta i alert dla firmy do tenantowego outboxu bez duplikacji
przy retry. Wersjonowane szablony HTML/text mają semantyczną strukturę,
escapowanie danych i nie ujawniają klientowi prywatnego score. Worker pobiera
rekordy przez minimalnie uprzywilejowane RPC, zapisuje każdą próbę, odzyskuje
stare blokady i stosuje ograniczony backoff do pięciu prób. Deterministyczny
test mode przechodzi bez ruchu sieciowego i bez PII w logach; opcjonalny adapter
Resend pozostaje produkcyjnie wyłączony do zatwierdzenia DPA, subprocesorów i
transferów. PostgreSQL potwierdza izolację tenantów oraz brak bezpośredniego
dostępu do kolejki dla klienta i zwykłego użytkownika. Pełne `format:check`,
`lint`, `typecheck`, testy PostgreSQL, E2E i `build` przechodzą bez wyłączeń.
Zdalne CI nadal oczekuje na usunięcie billing lock konta GitHub. Etap 9
został następnie ukończony zgodnie z gate’em poniżej.

## Etap 9 — Analityka

- [x] Wersjonowane eventy, consent, agregacje i retencja.
- [x] Dashboard, drop-off, źródła/urządzenia i progi małej próby.

**Gate:** metryki zgadzają się z kontrolnymi sesjami E2E.

**Status gate’u 2026-07-25:** lokalnie zielony. Analityka first-party zapisuje
wyłącznie allowlistowane zdarzenia v1 po aktywnej, niewymuszonej zgodzie i nie
przyjmuje dowolnych metadanych, PII, URL ani adresów IP. Wycofanie zgody usuwa
surowe zdarzenia sesji, a pozostałe dane mają 90-dniową retencję. Owner/Admin
widzą dane surowe i agregaty, Sales wyłącznie agregaty; RLS oraz RPC wymuszają
tenant scope. Dashboard prezentuje rozpoczęcia, wyniki, leady, medianę czasu,
drop-off, źródła, urządzenia, wersje i rozkład score, ukrywając całość lub grupę
poniżej pięciu sesji. Kontrolne sesje PostgreSQL potwierdzają dokładnie 100%
rozpoczęć, 60% wyników, 40% leadów i 20% drop-off na kroku; test E2E potwierdza
pojedyncze zdarzenia załadowania, rozpoczęcia, wyniku i leada w pełnej ścieżce.
`format:check`, `lint`, `typecheck`, 69 testów jednostkowych, pełne testy RLS,
8/8 E2E i `build` przechodzą bez wyłączeń. Widget ma około 15,5 KiB gzip przy
budżecie 90 KiB. Zdalne CI nadal oczekuje na usunięcie billing lock konta
GitHub. Etap 10 został następnie ukończony zgodnie z gate’em poniżej.

## Etap 10 — Landing i SEO

- [x] Strona główna, produkt, agencje, WordPress, cennik jako zatwierdzony model.
- [x] Pięć stron branżowych i główne strony funkcyjne.
- [x] Metadata, canonical, sitemap, robots, schema, 404/500 i link check.

**Gate:** crawl, noindex panelu, accessibility, performance budgets i content review.

**Status gate’u 2026-07-25:** lokalnie zielony. Code-first marketing dostarcza
18 indeksowalnych stron: landing, produkt, jak działa, cennik, agencje,
WordPress, dwa huby, pięć branż i pięć funkcji. Każda pozycja allowlisty ma
unikalne title/description, canonical, SSR/SSG i jeden `h1`; crawl potwierdza
HTTP 200 oraz brak uszkodzonych linków. Sitemap nie zawiera powierzchni
prywatnych, a panel, logowanie, API, design system i hosted flows mają właściwe
robots/noindex. Schema opisuje wyłącznie widoczne fakty, bez cen, ocen i opinii.
Cennik publikuje tylko zatwierdzony obecnym zakresem model pilotażowy z wyceną
indywidualną; kwoty, limity i self-service pozostają jawnie nieustalone.
WordPress nie pozoruje wtyczki Etapu 11. Axe, klawiatura, działające demo,
mobile bez overflow, budżet 250 KiB JavaScriptu oraz visual review 1440/390 px
przechodzą. `format:check`, `lint`, `typecheck`, 71 testów jednostkowych, pełne
testy RLS, 13/13 E2E i `build` są zielone bez wyłączeń. Zdalne CI nadal oczekuje
na usunięcie billing lock konta GitHub. Publiczny launch pozostaje zablokowany
clearance nazwy, treściami prawnymi, zatwierdzeniem docelowego pricingu i
Etapami 12–13. Etap 11 został następnie ukończony lokalnie zgodnie z gate’em
poniżej.

## Etap 11 — WordPress

- [x] Bezpieczne połączenie, lista flow, shortcode, Gutenberg, popup i diagnostyka.
- [x] Capability/nonce, escaping, odłączenie i compatibility matrix.

**Gate:** test na wspieranych WP/PHP, brak sekretu we froncie i brak globalnych konfliktów.

**Status gate’u 2026-07-25:** lokalnie zielony na dostępnej parze PHP 8.5.2 z
kontraktem WordPress 6.9.2/7.0.2. Harness obejmuje authenticated encryption,
TLS/pinned origin/zero redirectów, escaping, popup, brak credentialu w HTML,
czyszczenie przy odłączeniu i namespace/global scan. Test PostgreSQL potwierdza
jednorazowość tokenu, hash-only storage, allowlistę flow, revocation, role oraz
izolację tenantów. CI ma rzeczywistą instalację WordPress/MySQL dla ośmiu
wspieranych par WordPress 6.8.3–7.0.2 i PHP 8.3–8.5. Zdalne wykonanie tej
macierzy czeka na odblokowanie billingowe GitHub Actions; nie jest to zastępowane
fałszywym lokalnym wynikiem. Aktualny stan Etapu 12 opisano poniżej.

## Etap 12 — Security i compliance

- [x] Threat model review, SAST/DAST/dependency/secret scan i testy IDOR/XSS/upload/rate limit/replay.
- [~] Retencja, eksport, anonimizacja/usunięcie, DPA/subprocesorzy po review prawnym.
- [x] Naprawić wszystkie critical/high; zaakceptowane medium mają właściciela i termin.

**Gate:** udokumentowany audyt bez krytycznych ustaleń.

**Status gate’u 2026-07-25:** techniczna implementacja jest lokalnie zielona.
Owner-only eksport JSON, legal hold, ręczne usunięcie i opt-in retencja są
storage-first, odporne na wyścig oraz objęte forced RLS. Upload poza loopback
jest fail-closed bez prywatnego ClamAV. SAST, working-tree secret scan i
dependency audit bez znanych podatności, 82 testy jednostkowe, 9 zestawów
PostgreSQL/RLS, harness WordPress, 16/16 DAST/E2E, format, lint, typecheck i
build przechodzą. Self-review wykrył i naprawił wyścig legal hold z usuwaniem
Storage oraz niezgodność CommonJS bezpiecznego `brace-expansion@5.0.8`.

Formalne zamknięcie pozostaje zablokowane: CodeQL/Gitleaks nie uruchamiają się
przez billing lock GitHub Actions, a DPA/subprocesorzy/regiony/okresy wymagają
review administratora danych i prawnika. Ustalenia medium mają ownerów i termin
2026-08-01 w `docs/SECURITY_AUDIT_2026-07-25.md`. Etapu 13 nie rozpoczęto.

## Etap 12A — Premium minimalistyczny redesign

- [x] Audyt powierzchni, wzorców template/AI i baseline 1440/1024/390 px.
- [x] Wireframe’y, ryzyka i decyzja o zachowaniu tokenów oraz architektury.
- [x] Fundamenty UI i spójny redesign 18 stron marketingowych.
- [x] Logowanie, panel, leady, analityka, integracje, widget i stany systemowe.
- [x] Pełny odbiór funkcjonalny, wizualny, dostępnościowy, SEO i wydajnościowy.

**Gate:** zachowana logika, autoryzacja, tenant scope, routing i SEO; hero
pokazuje code-native przejście od kwalifikacji do uporządkowanego leada;
marketing nie powtarza generycznych siatek kart; panel ma wąski rail, tabela
leadów i dokumentowy szczegół; widget jest spójny we wszystkich trybach;
brak atrap oraz overflow 320/390 px; klawiatura, Escape, focus return, axe,
reduced motion, forced colors i zoom/reflow przechodzą; marketing pozostaje
poniżej 250 KiB JavaScriptu, widget poniżej 90 KiB gzip; crawl, metadata,
canonical, sitemap, robots i schema są poprawne; screenshoty przed/po oraz
raport zgodności obejmują wymagane powierzchnie; `format:check`, `lint`,
`typecheck`, pełne testy, E2E i `build` są zielone bez obniżania rygoru.

**Status gate’u 2026-07-25:** redesign wszystkich istniejących powierzchni jest
lokalnie zielony na zatwierdzonych tokenach ADR-011, bez zmiany architektury i
bez zgody na publikację. Landing prowadzi od kwalifikacji do code-native briefu,
18 tras zachowuje metadata i crawl, a panel, leady, analityka, WordPress,
prywatność, logowanie, hosted flow, widget i stany systemowe tworzą jeden
spójny system. Macierz 1440/1280/1024/768/390/320 px nie wykazuje overflow;
axe, klawiatura, menu z Escape/focus return, forced colors, reduced motion i
reflow 320 px przechodzą. Marketing ładuje 154 679 B JavaScriptu i 0 B obrazów,
a widget 15 888 B gzip.

Pełne testy jednostkowe, PostgreSQL/RLS i WordPress, security scan, 18/18 E2E,
format, lint, typecheck i build przechodzą. Zielony dependency audit Etapu 12
pozostaje aktualny, ponieważ redesign nie zmienił grafu zależności ani
lockfile. Artefakty, porównanie z referencją, wyniki oraz self-review znajdują się w
`docs/_archive/2026-07-28-pre-lorum-ui-v6/PREMIUM_MINIMAL_REDESIGN_AUDIT.md`.
Builder i onboarding nadal nie mają
tras UI; zgodnie z zakazem atrap nie zostały sfabrykowane. Ręczny VoiceOver/NVDA
na urządzeniach oraz dane terenowe Core Web Vitals pozostają bramkami
publicznego release, nie tego lokalnego etapu.

**Status historyczny 2026-07-27 — referencyjna rekonstrukcja panelu:** cztery
ówczesne obrazy zostały zablokowane rozmiarem i SHA-256, rozcięte na ekrany i
użyte do rekonstrukcji. Wspólny shell miał rail 78 px i topbar 85 px.
Dashboard, leady, pełny lead operacyjny, analityka, procesy, pięć szablonów,
builder, WordPress i prywatność korzystają z realnych tenantowych danych,
capabilities oraz istniejących server actions. Builder używa istniejącego
`FlowDocument`, kontroli rewizji, działającego resetu draftu i immutable
publish; nie implementuje wykluczonego node canvasu. Drugi pass porównawczy
wyrównał kolumny i kartę buildera, rytm dokumentu leada, zestaw akcji topbara,
pionowe wykresy dashboardu/analityki oraz zwartą szerokość ustawień.

Playwright przeszedł 2/2 scenariusze chronionego panelu z realnym logowaniem,
publikacją, axe, kontrolą konsoli/HTTP i brakiem overflow dla 1448 × 1086,
1536 × 1024, 768 × 1000, 390 × 844 i 430 × 932. Historyczne cropy, rendery i
porównania zostały wycofane przez ADR-058; pełny zapis pozostaje w Git. Nie
zmieniono API, migracji, polityk RLS ani równoległego zakresu Etapu 12K.
`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` i formatowanie plików
panelu przechodzą. Pełny `pnpm format:check` zatrzymują wyłącznie dwa
równolegle zmieniane pliki marketingowe regulaminu i polityki prywatności,
których nie modyfikowano w tym etapie.

**Dane demonstracyjne 2026-07-27:** loopback-only seed panelu jest
idempotentny i w lokalnej organizacji demonstracyjnej utrzymuje 5 procesów,
88 leadów we wszystkich statusach i dwóch sąsiadujących okresach 30-dniowych,
706 zdarzeń analitycznych, połączenie WordPress, zatwierdzoną retencję 365 dni
i prawdziwy przykładowy załącznik w prywatnym lokalnym Storage. Dashboard
wylicza procentowe zmiany KPI względem poprzednich 30 dni. Po zapisaniu
fixture’ów dane są odczytywane przez zwykłe tenantowe route’y z RLS; seed nie
jest używany przez route’y produkcyjne i nie zawiera danych prawdziwych osób.
Lint, typecheck, pełne testy z RLS/PostgreSQL i WordPress oraz build
przechodzą.

**Korekta listy leadów 2026-07-28:** najnowszy załącznik rozmowy nadpisuje
wyłącznie trasę listy leadów. Usunięto techniczny topbar i zbędne drugie linie,
a ekran składa się z jednej lekkiej powierzchni, pięciu filtrów, siedmiu
referencyjnych kolumn, ośmiu rekordów na stronę i zwartej paginacji. „Nowy
lead” prowadzi do rzeczywiście opublikowanego formularza. Termin jest
odczytywany tenantowo z odpowiedzi leada, a lokalny seed dostarcza zróżnicowane
usługi i terminy bez fixture’ów w route.

**Korekta szczegółów leada 2026-07-28:** najnowszy załącznik rozmowy
nadpisuje wyłącznie trasę pojedynczego leada. Duży dokument operacyjny
zastąpiono zwartym profilem, kartą score, czterema zakładkami i dwukolumnowym
podsumowaniem. Notatki, status, rozpoczęcie obsługi, odpowiedzi, pliki,
historia, zgody i retencja nadal korzystają z istniejących server actions,
tenant scope i RLS. Lokalny lead demonstracyjny ma trzy rzeczywiste pliki w
prywatnym Storage.

## Etap 12B — Lorum: brand i architektura prezentacji

- [x] Udokumentować audyt obecnej prezentacji, baseline, wireframe’y i granice rebrandingu.
- [x] Dodać ADR dla widocznej marki Lorum, tokenów i stabilności kontraktów integracyjnych.
- [x] Uporządkować fundamenty UI: typografię, paletę, powierzchnie, focus, cienie i geometrię.
- [x] Przebudować narrację landingu z „formularza wyceny” na proces: zbierz → uporządkuj → zakwalifikuj → działaj.
- [x] Zastosować Lorum konsekwentnie w marketingu, panelu, logowaniu, hosted flow, widgetcie,
      wiadomościach i widocznej warstwie konektora WordPress.
- [x] Zachować routing, SEO, Server Components, auth, tenant scope, RLS, API i istniejące
      identyfikatory techniczne integracji.
- [x] Zweryfikować stany, mobile, klawiaturę, kontrast, noindex, crawl, budżety i pełny pipeline.
- [x] Uzupełnić dokumentację, raport self-review i kryteria odbioru.

**Gate:** wszystkie istniejące powierzchnie prezentacyjne używają marki Lorum i
jednego spokojnego języka B2B; landing wyjaśnia konkretny przepływ od
chaotycznego zapytania do leada gotowego do działania; nie występują
glassmorphism, dekoracyjne gradienty, przypadkowe karty, nadmierne promienie ani
fikcyjne dowody; tokeny są współdzielone przez `packages/ui`; widoczna marka
zmienia się bez zerwania nazw pakietów, custom elementu, eventów, nagłówków API,
shortcode’u i namespace’u konektora; routing, metadata, canonical, sitemap,
robots, auth, RLS i tenant scope pozostają bez regresji; powierzchnie działają od
320 px, klawiaturą, z reduced motion i forced colors; `format:check`, `lint`,
`typecheck`, testy, E2E i `build` są zielone bez obniżania rygoru.

**Status gate’u 2026-07-26:** widoczne powierzchnie używają marki Lorum, a
wewnętrzne identyfikatory `@wyceno/*`, `<wyceno-widget>`, `wyceno:*`,
`X-Wyceno-Session`, shortcode i namespace WordPress pozostały stabilne zgodnie
z ADR-024. Landing prowadzi przez model zbierz–uporządkuj–zakwalifikuj–działaj i
pokazuje code-native brief jako główny dowód. Wspólne tokeny mają ciepłe tło,
jedną ciemną oraz jedną jasną zieleń; usunięto gradienty, blur, ciężkie cienie i
lokalne zielenie.

`format:check`, lint 8/8, typecheck 8/8, 82 testy jednostkowe, pełne testy
PostgreSQL/RLS i WordPress, security scan, build 37 tras oraz 18/18 E2E są
zielone. Widget ma 15 903 B gzip przy limicie 90 KiB. Crawl, metadata,
canonical, sitemap, robots, prywatne noindex, axe, klawiatura, reflow 320 px,
forced colors i reduced motion przechodzą. Przegląd landingu 1440/390 px nie
wykazał overflow ani elementów sprzecznych z briefem. Nie dodano zależności ani
nie zmieniono grafu lockfile. Nazwa Lorum nadal wymaga profesjonalnego
clearance; ręczny VoiceOver/NVDA i terenowe Core Web Vitals pozostają bramkami
Etapu 13, nie lokalnego redesignu.

## Etap 12C — Lorum: fundament systemu wizualnego

- [x] Zdefiniować jeden semantyczny kontrakt kolorów, powierzchni, tekstu,
      obramowań, statusów, cieni, promieni, spacingu i typografii w `packages/ui`.
- [x] Zachować kontrolowane aliasy kompatybilności bez dalszego używania nazw
      technicznych zależnych od dawnej palety.
- [x] Ustandaryzować prymitywy: hierarchię tekstu, CTA, badge, karty,
      powierzchnie danych, tabele, formularze, etykiety i ikony.
- [x] Przepiąć marketing i panel na te same role semantyczne oraz ograniczyć
      lokalne warianty, niestandardowe wagi i powielone style.
- [x] Rozszerzyć `/design-system` o kontrolną prezentację palety i hierarchii
      typograficznej oraz zaakceptować baseline desktop/mobile po przeglądzie.
- [x] Zweryfikować kontrast, klawiaturę, reflow, mobile, forced colors,
      reduced motion, pełne testy i build.

**Gate:** marketing, panel i biblioteka UI korzystają z jednego źródła prawdy;
role marki, sukcesu i błędu nie są zamienne; wszystkie bazowe powierzchnie i
stany mają semantyczne tokeny; typografia korzysta wyłącznie z czterech wag i
udokumentowanej skali; promienie i cienie pozostają dyskretne; nie występują
dekoracyjne gradienty, blur ani lokalne efekty; kontrast WCAG A/AA, mobile,
klawiatura i pipeline projektu są zielone.

**Status gate’u 2026-07-26:** `packages/ui` udostępnia kanoniczne role kolorów
Lorum, skale spacingu, typografii, promieni, cieni i ikon oraz wspólne klasy
kompozycyjne. Marketing i panel używają tych samych CTA, badge’y, powierzchni
danych, formularzy i hierarchii tekstu. `text-muted` zachowuje kontrast 4,81:1
również na `surface-muted`; test jednostkowy blokuje regresję tej pary.

Format, lint 8/8, typecheck 8/8, 87 testów jednostkowych, pełne testy
PostgreSQL/RLS i WordPress, security scan, build 37 tras oraz 18/18 E2E
przechodzą. Zaktualizowane snapshoty `/design-system` zostały sprawdzone na
desktopie i mobile. Widget ma 15 903 B gzip. Nie dodano zależności, nie
zmieniono modelu domenowego, kontraktów API, autoryzacji, tenant scope ani
architektury aplikacji.

## Etap 12D — Lorum: referencyjny reset kompozycji

- [x] Zastąpić jedenastoczęściowy landing pięcioma rozdziałami:
      problem → transformacja → proces → decyzja → wdrożenie.
- [x] Przebudować code-native dowody produktu tak, aby były czytelne przy
      12–14 px i pokazywały jedno zadanie zamiast pomniejszonego dashboardu.
- [x] Uprościć wspólne domyślne prymitywy: tracking, kicker, karta, cień,
      status i znak typograficzny zgodnie z ADR-025.
- [x] Zredukować marketingowy header, CTA i stopkę bez utraty routingu,
      klawiatury, focus trapu ani działających celów.
- [x] Zachować dedykowane trasy SEO, prawdziwe funkcje, auth, tenant scope, RLS,
      API i identyfikatory integracji bez zmian.
- [x] Wykonać odbiór 1440/390/320 px, axe, klawiaturę, reduced motion, forced
      colors, crawl, budżety, pełne testy i build.
- [x] Uzupełnić raport side-by-side, self-review, dokumentację i status gate’u.

**Gate:** landing ma pięć rozpoznawalnych rozdziałów i nie powtarza osobnych
sekcji fact strip/demo/benefit grid/feature grid/industry grid/trust/FAQ; jeden
viewport ma jeden punkt ciężkości; code-native proof pozostaje czytelny bez
tekstu poniżej 12 px; nie występują dekoracyjne karty, badge’e, ciemne pasy ani
numerowane siatki powtarzane jako szablon; header ma maksymalnie trzy główne
linki i jedną główną akcję; panel i widget zachowują funkcję oraz semantyczny
system; mobile nie ma overflow; klawiatura, Escape, focus return, axe, reduced
motion, forced colors, crawl, metadata, canonical, sitemap, robots i budżety
przechodzą; `format:check`, `lint`, `typecheck`, testy, E2E i `build` są zielone.

**Ryzyka:** stare baseline’y utrwalają odrzucony kierunek i nie mogą być
aktualizowane bez review; worktree zawiera liczne istniejące zmiany, dlatego
etap nie resetuje ani nie formatuje niezwiązanych plików; brak sterowalnej
przeglądarki w bieżącym środowisku wymaga jawnego oznaczenia, jeśli końcowy
side-by-side nie będzie możliwy. Rollback jest aplikacyjny i nie dotyka danych.

**Status 2026-07-26:** gate spełniony lokalnie. Pełne zrzuty landing page
1440 × 5419 i 390 × 8980 oraz design systemu zostały przejrzane przed zapisaniem
baseline’ów; capture czterech widoków panelu nie wykazał overflow w 1440 ani
390 px. `format:check`, lint 8/8, typecheck 8/8, 87/87 testów jednostkowych,
pełne testy PostgreSQL/RLS i WordPress, security scan, build 37 tras oraz 21/21
E2E przechodzą. Widget ma 15 903 B gzip. Nie zmieniono modelu danych,
autoryzacji, tenant scope, RLS, API ani identyfikatorów integracji. Ręczny test
czytnikiem ekranu, Core Web Vitals na docelowym hostingu, clearance nazwy i
zgoda na publiczny start pozostają bramkami Etapu 13.

## Etap 12E — Lorum: rekonstrukcja strony głównej według referencji

- [x] Zamrozić wszystkie trasy poza `/`, panel, widget, auth, API oraz
      współdzielone tokeny i odtworzyć wyłącznie stronę główną.
- [x] Zastosować ówczesny asset `public/Logoicon.svg` jako ikonę witryny i znak
      marki obok nazwy Lorum. Asset został później wycofany przez brand V3.
- [x] Zrekonstruować proporcje desktopowej referencji: niski header, hero
      copy → odpowiedzi → dokument leada, sześciopunktowy pasek danych oraz
      dolne porównanie z czterostopniowym procesem.
- [x] Zachować na mobile poziomą transformację odpowiedzi w lead i przestawić
      pasek danych na układ 3 × 2, bez mechanicznego stackowania desktopu.
- [x] Dodać home-only wejścia tekstów, kart i hairline’ów bez nowych
      zależności, layout shiftu, scroll-jackingu i ruchu przy
      `prefers-reduced-motion`.
- [x] Wykonać iteracyjny odbiór 1440/390/320 px, axe, klawiaturę, no-JS,
      reduced motion, forced colors, crawl, budżety oraz pełny pipeline.
- [x] Zapisać nowe baseline’y dopiero po side-by-side review i uzupełnić
      dokumentację oraz changelog.

**Gate:** pierwsze 1024 px desktopu i odpowiadający im przepływ mobilny
zachowują hierarchię oraz gęstość przesłanej referencji; główny proof pozostaje
code-native i czytelny; żaden element strony głównej nie jest atrapą działania;
inne trasy nie zmieniają wyglądu ani zachowania; mobile nie ma overflow;
klawiatura, axe, no-JS, reduced motion, forced colors, metadata, canonical,
crawl i budżety przechodzą; `format:check`, `lint`, `typecheck`, testy, E2E i
`build` są zielone.

**Ryzyka:** wspólny header wymaga warunku po ścieżce, dlatego regresję innych
tras blokuje osobny test; bardzo gęsty mobile nie może obniżyć tekstu proofu
poniżej 12 px; animacje nie mogą ukrywać treści bez JavaScriptu. Worktree
zawiera liczne istniejące zmiany i nie będzie resetowany ani formatowany poza
zakresem etapu. Etap nie daje zgody na deployment ani publiczny launch.

**Status gate’u 2026-07-26:** lokalnie zielony. Pierwszy widok `/` odtwarza
referencyjną relację copy → odpowiedzi → dokument leada, początek
sześciopunktowego paska przy około 562 px na desktopie oraz osobny poziomy proof
i pasek 3 × 2 na mobile. Pełne baseline’y mają 1440 × 1433 i 390 × 3047 px, a
viewporty kontrolne 1440 × 1000 i 390 × 844 px. Animacje wejścia są home-only,
transform-only i zachowują pełny kontrast w każdej klatce; no-JS i reduced
motion pokazują całą treść. `format:check`, `lint`, `typecheck`, 87 testów
jednostkowych, pełne testy RLS i WordPress, lokalny security scan, 23/23 E2E
oraz `build` 37 tras przechodzą bez wyłączeń. Widget ma 15 903 B gzip. Nie
dodano zależności; zdalnego dependency audit nie powtórzono, ponieważ wymagałby
wysłania grafu zależności do npm, na co środowisko nie udzieliło zgody. Ostatni
zatwierdzony wynik audytu pozostaje zielony. Etap nie został wdrożony.

## Etap 12F — pełna ścieżka konwersji strony głównej

- [x] Ustanowić V6 Image-Locked jako kanoniczny kontrakt UI: lokalne
      referencje, indeks dokumentacji, manifest, screen spec, responsive,
      visual QA, ADR i rejestr luk — bez zmian TSX/CSS.
- [x] Poprawić geometrię referencyjnego folda: osie kontenera, proporcje
      odpowiedzi/łącznika/leada, dolną siatkę i jednolity zestaw ikon.
- [x] Zastąpić przedwczesny stack osobnymi kompozycjami 1440/1024/768/390/320
      oraz zachować poziomą relację odpowiedzi → lead w każdym widoku.
- [x] Rozwinąć `/` o dopasowanie procesu do branży, działające demo klienta,
      wyjaśnialne reguły wyniku, operacyjną obsługę leada, wersjonowaną
      publikację i kanały osadzenia.
  - [x] Landing board 2: działające demo klienta i przełączany aktywny szablon
        branżowy z przykładowym leadem.
  - [x] Landing board 3: sekwencja funkcji, WordPress, praca agencji i dowody.
- [x] Wyjaśnić odpowiedzialność firmy i agencji, tenant scope oraz zakończyć
      stronę uczciwą ścieżką do zakresu pilotażu bez fikcyjnego formularza.
- [x] Połączyć rozdziały jedną siatką, hairline’ami i transform-only motion;
      bez kart benefitów, testimonials, wymyślonych liczb, FAQ-sloopu,
      gradientów, blurów i atrap kontrolek.
- [x] Rozszerzyć testy o kolejność rozdziałów, działające demo, geometrię
      1024/768 px, minimalne rozmiary tekstu/celów, brak martwej przestrzeni
      oraz pełne baseline’y pięciu viewportów.
- [x] Wykonać side-by-side visual review, axe, klawiaturę, no-JS, reduced
      motion, forced colors, crawl, budżety i pełny pipeline.

**Zamknięcie historycznego statusu w Etapie 12ZD — 2026-07-29:** CLOSED BY
SUPERSESSION. Etapy 12G–12J, 12Q i 12ZB zastąpiły pierwotną kompozycję 12F
nowszymi, zaakceptowanymi decyzjami. Aktualny `HomeRedesign` ma sześć
testowanych regionów: hero, prowadzony proces, demo klienta, dokument decyzji,
branże/publikację oraz pilot. Zawiera działające demo, przykład leada, model
agencja/firma, WordPress i uczciwy zakres pilotażu. `marketing.spec.ts`
sprawdza kolejność, pięć viewportów, minimalny tekst, overflow, klawiaturę,
axe, no-JS, reduced motion, forced colors, SEO i budżet. Stara geometria 12F
nie jest już aktywnym gate'em, ale jej wymagania funkcjonalne mają następców
i nie pozostają otwartym pseudo-zadaniem.

**Gate:** pierwsze 1000 px zachowuje proporcje i rytm referencji, a dalsze
rozdziały kontynuują ten sam demonstracyjny lead oraz odpowiadają kolejno na
pytania „czy pasuje do mojej usługi?”, „co widzi klient?”, „skąd bierze się
wynik?”, „co robi handlowiec?”, „jak to opublikować?” i „jak zacząć?”.
Każdy rozdział ma jedną tezę, jeden code-native proof i działający cel.
1440/1024/768/390/320 nie mają overflow ani przypadkowego stackowania; mobile
nie pomniejsza desktopowego dashboardu. `format:check`, lint, typecheck, testy,
E2E i build są zielone.

**Ryzyka:** ADR-027 świadomie zastępuje ograniczenie ADR-026 do trzech beatów,
ale nadal zamraża wszystkie trasy poza `/`. Działające demo jest lokalną,
bezstanową demonstracją i nie może udawać zapisu danych. `/cennik` nie zawiera
formularza zgłoszenia, dlatego CTA może prowadzić wyłącznie do sprawdzenia
zakresu pilotażu. Etap nie daje zgody na deployment ani publiczny launch.

**Status folda 2026-07-26:** hero i pasek danych zostały zamknięte jako osobny
fragment Etapu 12F. Proof zachowuje relację odpowiedzi → łącznik → pełny dokument
leada, ma warianty 1440/1024/768/390/320, a pięć baseline’ów obejmuje wyłącznie
header, hero i pasek danych. `typecheck`, lint, build 37 tras oraz 15/15 testów
marketingowych przechodzą; axe, klawiatura, no-JS, reduced motion, forced colors,
minimalny tekst 12 px i brak poziomego overflow pozostają egzekwowane. Dalsze
rozdziały i pełny gate Etapu 12F nadal wymagają osobnego review.

**Status reference lock 2026-07-27:** dokumentacja V6 została skanonizowana bez
zmian aplikacji. `CODEX_MASTER_PROMPT.md`, `docs/INDEX.md`,
`docs/UI_SCREEN_SPEC.md`, `docs/RESPONSIVE_LAYOUT.md`, `docs/VISUAL_QA.md` i
`docs/ui/REFERENCE_MANIFEST.md` tworzą aktywny kontrakt. Pakiet źródłowy,
36 unikalnych obrazów, prototypy oraz macierze fidelity są lokalnie dostępne w
`docs/ui/`. ADR-028 zachowuje pierwszeństwo security/scope i zamrożenie tras
poza `/`. Nie usuwano historycznych dokumentów w istniejącym, rozległym
worktree. `format:check`, linki 127 plików Markdown, audyt nazw legacy, lint
8/8, typecheck 8/8, 87 testów jednostkowych, pełne RLS/PostgreSQL i WordPress,
security scan, build 8/8 z 37 trasami oraz 26/26 E2E przechodzą. Następny
fragment to landing board 2: działające demo i dopasowanie procesu do branży.

**Status landing board 2 2026-07-27:** zamknięto dwa kolejne regiony `/` bez
zmian pozostałych tras, API, danych ani tokenów. Demo zaczyna w referencyjnym
kroku wymiarów, ma sześć rzeczywistych kroków, walidowane pola, cofanie,
reset, wynik, live brief i jawny tryb bez zapisu. Pięć szablonów branżowych
przełącza aktywną treść, przebieg, code-native wizualizację, przykładowy lead
oraz działający link do istniejącej trasy; tablist obsługuje strzałki,
Home i End. Desktop zachowuje układ kroki → pytanie → live lead, a 768/390/320
przechodzą na logiczny stack z poziomymi selektorami bez overflow.
`artifacts/visual-qa/12f-board-2/` zawiera before, końcowe `after-final`,
`overlay-final` i raporty diff; kanoniczne referencje pozostają w `docs/ui/`.
Odrzucone passy przeniesiono do odzyskiwalnego Kosza w Etapie 12ZD. Po
odrzuceniu pierwszego passu usunięto elementy spoza referencji i odtworzono
natywne proporcje:
desktop ma 1536 × 1709 px wobec 1536 × 1710 px, a mobile dokładnie
390 × 3053 px. RMSE końcowego overlay wynosi 0,153535 desktop i 0,188534
mobile; brak poziomego overflow. Testy interakcji, axe, klawiatury, no-JS i
1440/1024/768/390/320 przechodzą. Pełny gate:
`format:check`, lint 8/8, typecheck 8/8, 87 testów jednostkowych, pełne
RLS/PostgreSQL i WordPress, security scan, build 8/8 z 37 trasami i widgetem
15 903 B gzip oraz 32/32 E2E — PASS. Następny zamknięty fragment to landing
board 3; panel i pozostałe trasy pozostają zamrożone.

**Status korekty hero 2026-07-27:** nowszy ekran Wyceno dołączony w rozmowie
zastąpił starszą interpretację pierwszego folda zgodnie z protokołem
historycznego pakietu V6, usuniętego po poprawnej ekstrakcji. Hero zachowuje
markę Lorum, ale odtwarza lekki układ
odpowiedzi → pojedynczy łącznik → kompaktowa karta leada oraz cztery korzyści
zamiast pełnego dokumentu z ciemnym railem i sześciu pozycji danych. Dodano
fotorealistyczny diptych kuchni bez osób i danych klienta, pięć baseline’ów
1440/1024/768/390/320 oraz artefakty side-by-side i overlay w
`artifacts/visual-qa/12g-reference-hero/`. Tekst proofu ma minimum 12 px,
mobile nie ma overflow, a axe, klawiatura, no-JS, reduced motion i forced
colors przechodzą. Pełny gate: `format:check`, lint 8/8, typecheck 8/8, testy
jednostkowe i integracyjne z RLS/PostgreSQL oraz WordPress, security scan,
build 8/8 z 37 trasami i widgetem 15 903 B gzip oraz 32/32 E2E — PASS. Zakres
nie obejmuje wdrożenia; następnym etapem pozostaje landing board 3.

**Status pełnego leada w hero 2026-07-27:** kolejny, jednoznaczny załącznik
zastąpił kompaktową interpretację Etapu 12G. Hero ponownie pokazuje pełny
dokument leada z ciemnym railem, wynikiem i uzasadnieniem, pięcioma polami,
materiałami, następnym krokiem oraz akcjami. Rail i centralny węzeł korzystały
z ówczesnego `Logoicon.svg`, później wycofanego przez brand V3; Anna Kowalska
ma fikcyjny, wygenerowany portret WebP, a sześć ikon pod hero odzyskało zielony
kolor i jasne zielone tło.
Warianty 1440/1024/768/390/320 zachowują pełną ścieżkę bez poziomego overflow.
Zakres pozostaje ograniczony do `/` i nie obejmuje deploymentu.

**Status osi navbaru 2026-07-27:** desktopowa grupa linków `/` została
przeniesiona do niezależnej środkowej kolumny, dzięki czemu jej środek pokrywa
się z osią viewportu niezależnie od szerokości logo i CTA. Test E2E mierzy
odchylenie osi z tolerancją 1 px dla 1440 i 1024 px; baseline’y obu desktopów
zaktualizowano, a warianty 768/390/320 pozostały bez zmian. Pełny gate:
formatowanie, lint 8/8, typecheck 8/8, testy jednostkowe i integracyjne
z RLS/PostgreSQL oraz WordPress, security scan, build 8/8 z 37 trasami
i 32/32 E2E — PASS.

**Status sekcji pod hero 2026-07-27 — korekta 12J:** nowszy załącznik H
zastąpił poziomy blok czterech kroków. Po pasku sześciu danych znajduje się
osobna sekcja pięciu fotograficznych szablonów, a następnie dwukolumnowy region:
porównanie zwykłego zapytania z kompletnym leadem po lewej oraz pionowy proces
01–04 i kompaktowy dokument leada po prawej. Hero, pasek danych, szablony
i porównanie mają identyczną oś kontenera (`x=79,9`, `width=1888,3` na
2048 px; `x=56,2`, `width=1327,7` na 1440 px). Ikony są zielone, liniowe
i osadzone w jasnych kołach. Viewporty 2048/1440/1024/768/390/320 nie mają
poziomego overflow ani przecięcia regionów. Artefakty są w
`artifacts/visual-qa/12j-icons-comparison-process/`, zakres pozostaje
ograniczony do `/` i nie obejmuje deploymentu. Pełny gate: `format:check`,
lint 8/8, typecheck 8/8, 87 testów jednostkowych, pełne RLS/PostgreSQL
i WordPress, security scan, build 8/8 z 37 trasami i widgetem 15 903 B gzip
oraz 32/32 E2E — PASS.

## Etap 12K — Lorum: referencyjne logowanie i rejestracja

- [x] Zablokować lokalną referencję `ekranylogowania.png`, markę Lorum i
      wyłącznie providera Google przez ADR-029.
- [x] Wygenerować dwie dedykowane ilustracje produktowe i zapisać finalne PNG
      z przezroczystością w `apps/web/public`.
- [x] Zbudować wspólny, pełnoekranowy trójstrefowy shell auth bez nagłówka
      planszy, z subtelną białą oprawą, oraz osobne strony logowania
      i rejestracji zgodne z referencją.
- [x] Podłączyć działające logowanie hasłem, Google OAuth, rejestrację,
      bootstrap organizacji, reset hasła i bezpieczny callback.
- [x] Obsłużyć default, hover, focus, filled, error, success, disabled i loading
      oraz brak ujawniania istnienia konta.
- [x] Zweryfikować 1536/1440/1024/768/390/320 px, klawiaturę, axe, reduced
      motion, forced colors, brak overflow i prywatne cache headers.
- [x] Wykonać cropy referencji, before/after, overlay, diff, pełny pipeline,
      self-review, dokumentację i changelog.

**Zamknięcie historycznego statusu w Etapie 12ZD — 2026-07-29:** CLOSED BY
SUPERSESSION. Etap 12S objął cztery powierzchnie auth produkcyjnym E2E,
renderami 1536 × 1024 i 390 × full, klawiaturą, axe, reduced motion, forced
colors, reflow i brakiem overflow. Referencje oraz porównania znajdują się w
`artifacts/visual-qa/12s-remaining-screens/`. Nie przypisuje się wstecz
pozornego score staremu passowi; obowiązującym dowodem jest późniejszy,
ostrzejszy gate 12S.

**Gate:** logowanie i rejestracja zachowują trzy regiony, proporcje, gęstość,
typografię, ikonografię i dwie odrębne ilustracje referencji przy widocznej
marce Lorum; Microsoft nie występuje; Google jest rzeczywistym flow Supabase;
rejestracja tworzy pierwszą organizację wyłącznie przez kontrolowane RPC;
reset i callback nie przyjmują zewnętrznego redirectu; auth pozostaje
`noindex` i `private, no-store`; 320–1536 px nie mają overflow; klawiatura,
axe, reduced motion i forced colors przechodzą; visual score wynosi minimum
18/20, a format, lint, typecheck, testy, E2E i build są zielone.

**Ryzyka:** lokalny i produkcyjny Google OAuth wymagają poprawnych danych
providera poza repozytorium; plansza nie zawiera osobnych obrazów mobile ani
resetu, więc ich transformacja korzysta z kontraktu responsive i tego samego
systemu powierzchni. Etap nie zmienia innych tras i nie daje zgody na
deployment.

## Etap 12L — higiena dokumentacji i referencji UI

- [x] Zweryfikować politykę KEEP/MERGE/REPLACE/ARCHIVE/DELETE i incoming links.
- [x] Przenieść pięć raportów historycznych do datowanego archiwum z jawnym
      komunikatem, że nie są źródłem prawdy.
- [x] Usunąć identyczną kopię master promptu oraz duplikaty obrazów, których
      kanoniczne odpowiedniki pozostają w aktywnych ścieżkach.
- [x] Usunąć rozpakowane źródłowe archiwum V6 po sprawdzeniu integralności ZIP
      i zapisaniu jego SHA-256 w raporcie blokady.
- [x] Zaktualizować indeks, manifest, raport migracji, changelog i wszystkie
      odwołania do przeniesionych plików.
- [x] Uruchomić kontrolę linków, formatowania, lint, typecheck, testy i build
      oraz wykonać self-review końcowego diffu.

**Gate:** `docs/INDEX.md` wskazuje pojedyncze aktywne źródła prawdy; archiwalne
raporty nie konkurują z kontraktem V6; żaden usunięty obraz nie jest używany
przez aplikację, testy ani aktywny manifest; cztery główne plansze pozostają w
`references/`, a pełne pakiety źródłowe pozostają odtwarzalne w `docs/ui/`;
brak broken links; pipeline projektu nie ma nowych błędów. Istniejące,
niezwiązane zmiany worktree pozostają zachowane.

**Ryzyka historyczne:** dwa lokalne archiwa zawierały starsze snapshoty
projektu i nie były dokładnymi duplikatami aktywnego drzewa. Nie usunięto ich
w tym etapie; późniejszy audyt repozytorium przeniósł wskazane archiwum do
Kosza. Unikalne artefakty visual QA i baseline'y Playwright pozostały
nienaruszone.

**Status gate’u 2026-07-28:** pięć historycznych raportów ma komunikat
`ARCHIVED` i znajduje się w datowanym katalogu. Usunięto 24 661 473 bajty
(23,52 MiB) identycznych kopii lub poprawnie rozpakowanego archiwum źródłowego.
Cztery główne plansze, dwa pełne pakiety referencyjne, unikalne obrazy panelu,
baseline’y Playwright i unikalne artefakty visual QA pozostały zachowane.
Kontrola 152 plików Markdown nie wykryła broken links; zmienione dokumenty
przechodzą Prettier. `pnpm lint`, `pnpm typecheck`, pełne `pnpm test` z
PostgreSQL/RLS i WordPress oraz `pnpm build` przechodzą. Repozytoryjne
`pnpm format:check` zatrzymują te same trzy niezwiązane pliki co w baseline:
`polityka-prywatnosci/page.tsx`, `regulamin/page.tsx` i
`panel/[organizationId]/page.tsx`. Ten etap ich nie modyfikował.

> **Zapis historyczny panelu 12M–12ZL:** nazwa Lorum, geometrie 208/78 i
> 240/78, stare obrazy, mikrotekst, topbary, sześć równorzędnych KPI oraz
> wszystkie wizualne gate'y poniższych ukończonych etapów zostały zastąpione
> przez ADR-058 i Etap 12ZM. Zachowane pozostają wyłącznie wyniki funkcjonalne,
> bezpieczeństwa i dostępności. Kolejnej pracy nie wolno opierać na tym bloku.

## Etap 12M — wspólny, zwijany sidebar panelu Lorum

- [x] Potwierdzić referencję 208 px i wskazać route-specific wyjątek
      dashboardu jako źródło dwóch różnych sidebarów.
- [x] Zachować aktualną markę Lorum i `Logoicon.svg` na każdej trasie panelu.
- [x] Zbudować jeden sidebar 208 px z ręcznym wariantem 78 px i zapamiętaniem
      preferencji bez danych wrażliwych.
- [x] Usunąć warunkowe logo dashboardu i wszystkie dashboard-only reguły
      geometrii nawigacji.
- [x] Zachować capability-gated linki, skróty, konto, focus, obsługę klawiatury,
      reduced motion i mobilną dolną nawigację.
- [x] Dodać izolowany test E2E przejścia 208 → 78 → 208, persystencji między
      trasami i braku overflow na 390 px.
- [x] Zapisać ówczesne reference, before, after, overlay, difference i raport;
      obrazy wycofano po przyjęciu ADR-058.

**Gate:** dashboard, leady i pozostałe chronione route’y renderują ten sam
komponent oraz tę samą geometrię; zmienia się wyłącznie aktywny link. Desktop
startuje z szerokością 208 px, użytkownik może zwinąć sidebar do 78 px, a wybór
utrzymuje się po przeładowaniu i zmianie trasy. Mobile nie pokazuje
desktopowego przełącznika i nie ma poziomego overflow. Lint, typecheck, testy
web, build i izolowany E2E sidebara przechodzą.

**Ryzyka:** pełny historyczny scenariusz panelu nadal raportuje dwa problemy
spoza zakresu 12M: CSP blokuje developmentowe `eval()` Reacta oraz podpisane
obrazy z lokalnego Supabase, ponieważ źródło nie występuje w `img-src`.
Nie poluzowano CSP ani asercji testowych. Historyczne opisy raila 78 px w
Etapie 12A dokumentują stan `before`; niniejszy etap je zastępuje dla wspólnego
shella.

**Status gate’u 2026-07-28:** wspólny komponent ma aktualne logo i nazwę Lorum,
208 px po rozwinięciu oraz 78 px po zwinięciu. Wbudowany podgląd potwierdził
dashboard, leady, persystencję, Enter, 1536 × 1024 i 390 × 844 bez overflow.
Visual QA sidebara uzyskało 18/20. Prettier zmienionych plików, lint, typecheck,
42/42 testy web i izolowany Playwright 1/1 przechodzą; pełny test mobilny
również przeszedł podczas kontroli. Pełny panelowy Playwright zatrzymują
wyłącznie wyżej opisane, istniejące błędy CSP.

### Korekta 12M-X — premium sidebar Kwotum

- [x] Zachować jeden wspólny komponent, capability-gated linki, persystencję,
      klawiaturę i dolną nawigację mobilną.
- [x] Zwiększyć wyłącznie rozwinięty wariant z 208 do 240 px; rail zwinięty
      pozostawić na 78 px.
- [x] Pokazać aktualną markę Kwotum bez płytki, tła i obramowania, zachowując
      oryginalny `Logoicon.svg`.
- [x] Dodać osobny, code-native zestaw ikon nawigacji bez zależności, kafelków
      pod ikonami i bez zmiany ikon formularzy lub akcji biznesowych.
- [x] Utrzymać reduced motion, forced colors, focus i brak overflow mobile.
- [x] Zastąpić skokową podmianę strzałki uchwytem krawędziowym, obrotem
      jednego SVG i wspólnym easingiem szerokości oraz etykiet.
- [x] Zaktualizować kontrakt geometrii buildera i test E2E sidebara.

**Status 2026-08-03:** korekta jest zamknięta. Sidebar ma 240/78 px,
warstwowe tło, czysty znak marki oraz autorskie ikony dla dashboardu, leadów,
procesów, szablonów, analityki, integracji, ustawień i skrótów. Ikony oraz znak
nie mają własnych kafelków, a uchwyt animuje wspólnie rail i treść. Live QA
potwierdziło 240 px, 78 px, ukrycie raila i dolną nawigację przy 425 px oraz
0 px overflow. Lint, typecheck, 85/85 testów web i build przechodzą. Izolowany
Playwright pozostaje poprawnie pominięty bez sekretów `PANEL_E2E_*`; nie
uruchomiono alternatywnego logowania ani atrap danych. Raport i obrazy tej
wersji zostały wycofane przez ADR-058; zachowano wynik historyczny.

### Korekta 12M-Y — referencyjny wybór organizacji Kwotum

- [x] Zablokować załącznik 2872 × 1608 px i odtworzyć jego desktopową
      geometrię na viewportcie kontrolnym 2048 × 1152.
- [x] Zbudować header około 102 px, kontener 1260 px, kartę około 232 px,
      avatar 78 px i akcje 60 px bez zmiany ich hrefów.
- [x] Dodać trzy prawdziwe metadane: opublikowane procesy, leady `new` oraz
      `in_progress` i ostatnią aktywność z leada albo procesu.
- [x] Zachować RLS, role i wariant akcji Procesy/Leady bez wpisywania danych
      referencyjnych na sztywno.
- [x] Dodać polską odmianę liczników i względny opis aktywności z testami.
- [x] Zachować pusty stan, wiele organizacji, klawiaturę i transformację mobile
      bez poziomego overflow.
- [x] Dodać kontrakt E2E 2048 × 1152 i 390 × 844 z axe oraz screenshotami.

**Status 2026-08-03:** implementacja i live QA są zamknięte. Aktualny tenant
pokazuje realnie 1 aktywny proces, 37 leadów do obsługi i aktywność dzisiaj.
Mobile przy aktywnym viewportcie 510 px ma 0 px overflow, trzy metadane oraz
dwa równe przyciski. Lint, typecheck, 88/88 testów web i produkcyjny build 39
tras przechodzą. Izolowany E2E pozostaje warunkowy na `PANEL_E2E_*`. Raport i
obrazy starego kierunku zostały wycofane przez ADR-058; zachowano wynik
funkcjonalny.

## Etap 12N — referencyjna lista Procesy / Formularze

- [x] Wyciąć dokładny crop ekranu procesów z ówczesnej planszy V6 i zapisać
      jego kontrakt. Plansza została później wycofana przez ADR-058.
- [x] Zamrozić pełny render `before` przy 1536 × 1024.
- [x] Zastąpić ciężką tabelę zwartą listą pięciu pełnowierszowych linków.
- [x] Zachować prawdziwe tenantowe nazwy, liczbę pytań, wersję, status, datę
      oraz działające przejście do buildera.
- [x] Usunąć z głównego widoku techniczne slugi, dokładną godzinę, nagłówek
      tabeli i powieloną akcję edycji.
- [x] Dopasować statusy Aktywny/Nieaktywny, obramowania, rytm oraz dolny oddech
      powierzchni do cropa.
- [x] Usunąć duży topbar i umieścić tytuł oraz małe działające CTA bezpośrednio
      w powierzchni referencyjnej.
- [x] Usunąć limit 78 rem i wykorzystać pełną szerokość obszaru roboczego.
- [x] Zachować wspólny, zwijany sidebar Lorum i mobilną dolną nawigację.
- [x] Sprawdzić 1536 × 1024 i 390 × 844, klawiaturę, WCAG oraz brak overflow.
- [x] Zapisać ówczesne reference, before, after, overlay, difference i raport;
      obrazy wycofano po przyjęciu ADR-058.

**Gate:** `/panel/[organizationId]/procesy` używa pięciu zwartych wierszy bez
klasycznego nagłówka tabeli; cały wiersz jest dostępnym linkiem do właściwego
buildera. Dane nadal pochodzą z tenant-scoped `listFlowDrafts`, a ekran
obsługuje loading, empty i error state. Desktop ma 66,4 px wysokości wiersza,
8 px odstępu, powierzchnię 1280 px w workspace 1328 px i referencyjny dolny
oddech; mobile nie ma poziomego overflow. Lint, typecheck, testy web, build
i izolowany E2E procesu przechodzą.

**Ryzyka:** plansza produktu jest mapą wielu ekranów w różnych skalach, więc
overlay normalizuje samą powierzchnię listy do 328 × 310. Tytuł, działające CTA
i wspólny sidebar są oceniane na pełnych renderach. Przykładowe nazwy, statusy
i daty z obrazu nie zastępują prawdziwych danych organizacji. Developmentowy
podgląd nadal raportuje znane ograniczenie React `eval()` przy ścisłym CSP;
polityka nie została osłabiona.

**Status gate’u 2026-07-29:** po korekcie właściciela visual QA uzyskało 19/20.
Desktop i mobile potwierdzają minimalistyczny tytuł 12,8 px, CTA 100 × 28 px,
pięć wierszy, focus, pełną szerokość i brak overflow. Izolowany Playwright
procesu przechodzi 1/1, axe nie raportuje naruszeń, a 42/42 testy web są
zielone. Końcowy build produkcyjny renderuje pięć wierszy bez developmentowego
portalu błędu.

## Etap 12O — responsywna szerokość szczegółów leada

- [x] Usunąć stały limit 1120 px dokumentu leada.
- [x] Wyrównać dokument do geometrii pełnej szerokości ekranu Procesy.
- [x] Skalować panel wyniku i prawą kolumnę wraz z dostępną szerokością.
- [x] Zwiększyć zbyt małą typografię operacyjną bez zmiany hierarchii.
- [x] Usunąć mobilny overflow powodowany przez stałą szerokość materiałów.
- [x] Zachować notatki, status, kontakt, odpowiedzi, pliki, historię i retencję.
- [x] Sprawdzić desktop, mobile, kontrast, axe i działanie formularzy.
- [x] Zapisać ówczesne before, reference, after, overlay, difference i raport;
      obrazy wycofano po przyjęciu ADR-058.

**Gate:** dokument leada ma 1280 px w workspace 1328 px, panel wyniku 916 px,
a prawa kolumna 419 px przy 1536 × 1024. Na 390 × 844 dokument, wynik, prawa
kolumna i materiały mieszczą się bez poziomego overflow. Tenant scope, dane
i wszystkie istniejące server actions pozostają bez zmian. Lint, typecheck,
42/42 testy web, build oraz izolowany Playwright z axe przechodzą.

**Ryzyka:** przykładowe treści i obrazy pozostają lokalnymi danymi QA, a nie
częścią implementacji. Developmentowy React nadal raportuje znany konflikt
`eval()` ze ścisłym CSP; końcowe rendery pochodzą z builda produkcyjnego.

**Status gate’u 2026-07-29:** PASS. Dokument oraz prawa kolumna rosną razem
z viewportem, typografia ma 11–13 px, mobile ma zero overflow, a trzy wykryte
problemy kontrastu zostały naprawione. Izolowany E2E i axe przechodzą 1/1.

## Etap 12P — zwarta biblioteka szablonów

- [x] Usunąć stary topbar z eyebrow, dużym tytułem i opisem organizacji.
- [x] Umieścić kompaktowy tytuł oraz powrót do procesów we wspólnej powierzchni.
- [x] Ułożyć pięć realnych szablonów w jednym rzędzie przy 1536 × 1024.
- [x] Zmniejszyć karty i obrazy bez utraty nazwy, liczby pytań, reguł i akcji.
- [x] Zachować prawdziwe tworzenie niezależnego draftu przez server action.
- [x] Dopasować tablet i mobile bez maskowania overflow.
- [x] Ujednolicić loading oraz error state z właściwą powierzchnią.
- [x] Sprawdzić produkcyjny desktop, 390 px, 320 px i axe.
- [x] Zapisać ówczesne before, reference, after, overlay, difference i raport;
      obrazy wycofano po przyjęciu ADR-058.

**Gate:** przy 1536 × 1024 powierzchnia ma 1280 px w workspace 1328 px,
wszystkie pięć kart ma wspólne `y`, około 240 px szerokości i obrazy 92 px.
Nie istnieje `.panel-topbar`, a stary tekst „Biblioteka procesów” nie jest
renderowany. Przy 390 × 844 i 320 × 800 dokument nie ma poziomego overflow.
Pięć przycisków nadal uruchamia istniejący tenant-scoped server action.
Typecheck, 42/42 testy web, build i izolowany Playwright z axe przechodzą.

**Ryzyka:** plansza źródłowa pokazuje moduł w wąskim regionie jako siatkę 2 × 2
i tylko cztery widoczne przykłady. Nowsza decyzja właściciela wymaga pięciu
mniejszych kart w jednym rzędzie na pełnej trasie; overlay obrazuje więc
anatomię kart i gęstość, a nie identyczną liczbę kolumn.

**Status gate’u 2026-07-29:** PASS, 19/20. Piąta karta nie spada już do
drugiego rzędu, obrazy zmalały ze 120 do 92 px, a wysokość kart z około 289 do
253 px. Produkcyjny test desktop/mobile/320 px i axe przechodzi 1/1.

## Etap 12Q — autorski landing 3D

- [x] Zapisać pełny baseline desktop/mobile i przeanalizować jedenaście
      regionów strony głównej.
- [x] Zastąpić hero opartym na mini-panelu autorską sekwencją trzech
      code-native telefonów 3D.
- [x] Przebudować pięć wejść branżowych jako mobilne ekrany procesu bez
      martwych kontrolek.
- [x] Ujednolicić porównanie, demo, reguły, obsługę leada, publikację, agencję
      i pilotaż jednym językiem perspektywy, promieni i głębi.
- [x] Zachować rzeczywiste linki, demo, tablistę, no-JS, SEO, minimum 12 px,
      klawiaturę, reduced motion i forced colors.
- [x] Sprawdzić 1440/1024/768/390/320 px, brak overflow i zaktualizować
      baseline’y wizualne.
- [x] Zapisać before, after-v1/v2, overlay, difference, raport, changelog
      i manifest decyzji.

**Gate:** `/` nie wygląda jak generyczny template SaaS; hero ma jeden mocny
motyw zapytanie → proces → lead, telefony zachowują czytelność i proporcje na
desktopie i mobile, a kolejne regiony rozwijają ten sam język bez udawania
funkcji. Wszystkie CTA prowadzą do istniejących tras, demo i tablista działają
klawiaturą, tekst proofu ma minimum 12 px, 320 px nie ma overflow, a test
marketingowy, lint, typecheck, testy i build są zielone.

**Ryzyka:** nowa dyspozycja była tekstowa i nie zawiera obrazu źródłowego,
dlatego etap nie przypisuje sztucznego RMSE ani pixel-perfect PASS. Pełna
narracja zachowuje jedenaście regionów i pozostaje długa na mobile; jej
skrócenie wymaga osobnej decyzji contentowej. Etap nie daje zgody na deployment.

**Status gate’u 2026-07-29:** visual QA briefu uzyskało 19/20. Hero, telefony
branżowe, ciemny rozdział procesu i finał pilotażu tworzą spójny kierunek.
Viewporty 1440/1024/768/390/320 zachowują geometrię bez poziomego overflow, a
proofy nie schodzą poniżej 12 px. Test marketingowy przechodzi 21/21, 42/42
testy web oraz pełne testy RLS/WordPress są zielone. Repozytoryjne lint i
typecheck przechodzą dla wszystkich ośmiu pakietów, zmienione pliki przechodzą
formatowanie, a produkcyjny build landingu przeszedł.

## Etap 12R — rozwinięta analityka w stylu dashboardu

- [x] Przyjąć dashboard jako źródło geometrii, hierarchii i gęstości pełnej
      trasy analityki.
- [x] Ujednolicić topbar, cztery KPI, rytm kart, wykres liczby leadów oraz
      donut jakości z zaakceptowanym dashboardem.
- [x] Rozwinąć widok o prawdziwy lejek, rozkład score, źródła, urządzenia,
      drop-off kroków i wersje procesu.
- [x] Zastąpić powtarzalne poziome paski odrębnymi wizualizacjami: etapami
      lejka, bąblami score, wykresami kafelkowymi, kartami drop-off i
      pierścieniami wersji.
- [x] Dodać trendy względem poprzedniego okresu oraz działający wybór
      7/30/90 dni bez atrap filtrów.
- [x] Ograniczyć średnią wartość wyceny i score do wybranego okresu zamiast
      mieszać je ze wszystkimi historycznymi leadami.
- [x] Ujednolicić loading i error state z nowym nagłówkiem oraz powierzchniami.
- [x] Sprawdzić produkcyjny desktop, 390 px, 320 px, klawiaturę, axe i brak
      poziomego overflow.
- [x] Zapisać ówczesne reference, before, after, overlay, difference i raport;
      obrazy wycofano po przyjęciu ADR-058.

**Gate:** `/panel/[organizationId]/analityka` zachowuje wspólny sidebar Lorum,
topbar 78 px i cztery karty KPI po 118 px przy 1536 × 1024. Wykres ma 30
rzeczywistych dni dla okresu 30 dni, a stopki KPI pokazują zmianę względem
poprzedniego okresu. Dalsze sekcje wykorzystują pełną szerokość workspace;
drop-off jest szerszy od zestawienia wersji. Filtr okresu jest prawdziwą
nawigacją, dane pozostają tenant-scoped, a stany małej próby nie ujawniają
szczegółowych przekrojów RPC poniżej progu. Przy 390 × 844 i 320 × 800
dokument nie ma poziomego overflow. Lint, typecheck, build i izolowany
Playwright z axe przechodzą.

**Ryzyka:** crop źródłowy pokazuje wyłącznie kompaktowe KPI, wykres i donut.
Nowsza decyzja właściciela wymaga pełnej, rozwiniętej analityki w tym samym
stylu, dlatego overlay ocenia anatomię górnego regionu, a nie identyczną
wysokość całej strony. Źródła i urządzenia są przekrojami danych, nie
nieaktywnymi filtrami. Developmentowy React nadal raportuje znany konflikt
`eval()` ze ścisłym CSP; końcowe rendery pochodzą z builda produkcyjnego.

**Status gate’u 2026-07-29:** PASS. Desktop ma cztery równe KPI po 309 × 118
px, 30 słupków, szeroki lejek oraz dolny podział 884/374 px. Mobile układa
wszystkie sekcje w jedną kolumnę 361 px i ma zero overflow. Przełączenie na
7 dni renderuje siedem słupków. Izolowany E2E i axe przechodzą 1/1, a
produkcyjny build jest zielony. Pełne `pnpm lint`, `pnpm typecheck` i
`pnpm test` z 42/42 testami web, PostgreSQL/RLS oraz WordPress przechodzą.
Repozytoryjne `pnpm format:check` nadal zatrzymują trzy niezwiązane pliki
opisane w baseline Etapu 12L; wszystkie pliki Etapu 12R przechodzą Prettier.

**Korekta właściciela 2026-07-29:** dolna część nie używa już serii podobnych,
prostych pasków. Lejek jest czterostopniowym przepływem, rozkład score używa
bąbli, źródła i urządzenia dwóch 40-polowych wykresów kafelkowych, drop-off
osobnych kart diagnostycznych, a wersje małych pierścieni ukończenia. Duży
wykres oraz donut jakości pozostały bez redesignu. Na mobile etykiety
30-dniowego wykresu są próbkowane co pięć dni, aby nie nachodziły na siebie.
Produkcyjny E2E potwierdza brak elementów `progress`, zero overflow, axe i brak
błędów konsoli.

## Etap 12S — domknięcie pozostałych ekranów produktu

- [x] Zbudować historyczną macierz tras, stanów, referencji i świadomych
      wyłączeń. Unikalny zakres ekranów przeniesiono do aktywnych specyfikacji.
- [x] Zamrozić baseline integracji, prywatności, wyboru organizacji i widgetu
      przy 1536 px.
- [x] Dodać realne ekrany ustawień organizacji, powiadomień, instalacji i
      onboardingowego launchpadu bez nowych atrap.
- [x] Przebudować WordPress, prywatność oraz publiczny widget desktop/mobile
      zgodnie z odpowiednimi referencjami.
- [x] Dodać loading, empty, error i permission state dla nowych tras.
- [x] Zweryfikować 1536/1024/768/390/320 px, klawiaturę, axe, reduced motion,
      forced colors, zoom i brak overflow.
- [x] Zapisać after/overlay/difference, uruchomić pełny pipeline, self-review,
      zaktualizować dokumentację i changelog.

**Wynik 2026-07-29:** gate zamknięty. Produkcyjne E2E obejmuje sześć nowych
powierzchni panelu, cztery stany auth oraz widget question/result/contact,
offline i popup. Macierz 1536/1440/1024/768/390/320 px nie wykazała overflow;
768 px jest także efektywną szerokością kontroli przy 200% zoomie z 1536 px.
Axe, reduced motion, forced colors, klawiatura, lint, typecheck, unit/RLS/
WordPress, build, Prettier oraz lokalne skany SAST/sekretów przechodzą.
Historyczne dowody sześciu powierzchni panelu zostały usunięte przez ADR-058.
W `artifacts/visual-qa/12s-remaining-screens/` zachowano wyłącznie osobne dowody
auth i widgetu; wynik funkcjonalny panelu pozostaje zapisem tego etapu.

Odświeżenie zewnętrznego audytu advisories npm nie zostało wykonane: sandbox
zablokował DNS, a eskalacja została odrzucona, ponieważ wysłałaby metadane
pakietów do npm bez osobnej zgody właściciela. Nie wpływa to na wynik
`security:scan`; jest jawnym, zewnętrznym follow-upem.

**Gate:** wszystkie funkcjonalne powierzchnie z macierzy 12S używają wspólnego,
zwijanego sidebara Lorum; ustawienia i integracje wypełniają workspace, a
widget odtwarza pełną powierzchnię procesu na desktopie i osobny układ mobile.
Instalacja korzysta wyłącznie z publicznego ID, onboarding wyprowadza postęp z
realnych rekordów, a powiadomienia pokazują prawdziwe dostawy. Żaden przycisk
nie jest atrapą. Tenant scope, RLS, idempotencja i sekrety pozostają
nienaruszone. Nowe widoki przechodzą E2E, axe i pełny pipeline.

**Ryzyka:** część kategorii widocznych w referencji nie ma modelu danych i jest
świadomie wyłączona zamiast sfabrykowana. Publiczny widget jest bundlowany do
`apps/web/public/widget/v1`, dlatego build i test muszą potwierdzić zgodność
źródła z artefaktem. Etap nie dodaje migracji, nie wdraża agency/CRM/billingu i
nie daje zgody na produkcyjne wdrożenie.

## Etap 12T — pełny dashboard operacyjny Lorum

- [x] Zablokować załącznik 1964 × 1500 px jako nowsze źródło treści
      dashboardu.
- [x] Zmapować każdy region na istniejące dane albo jawnie go wyłączyć.
- [x] Dodać sześć zwartych KPI, realne wyszukiwanie oraz zakres dat.
- [x] Zastąpić ubogie wykresy trendem dwóch serii, donutem statusów i
      słupkami wartości wycen.
- [x] Dodać najnowsze leady, ranking procesów, prywatnościowe źródła,
      przedziały wartości, uwagę, dostawy oraz szybkie akcje.
- [x] Zachować capabilities, tenant scope, próg prywatności i brak atrap.
- [x] Dodać testy serii dziennej, przedziałów, statusów, procesów i kryterium
      uwagi.
- [x] Zamknąć visual QA desktop/mobile, axe i pełny pipeline.

**Gate:** dashboard zachowuje jeden zwijany sidebar Lorum i wykorzystuje pełną
szerokość workspace. Przy 1536 × 1024 renderuje sześć KPI oraz wszystkie
regiony operacyjne wskazane w kontrakcie bez poziomego overflow. Mobile
priorytetyzuje reakcję, KPI i ostatnie rekordy, a tabela nie traci pól.
Wyszukiwanie, rekordy i skróty prowadzą do istniejących tras; dane są
tenant-scoped, źródła respektują minimalną próbę, a moduły bez modelu danych
nie są udawane.

**Ryzyka:** załącznik używa danych i integracji, których MVP nie posiada.
„Aktywność zespołu”, Google Ads i osobne akcje przypomnienia są świadomie
wyłączone. Suma wycen korzysta z minimalnej wartości przedziału i jest jawnie
opisana słowem „od”; nie udaje księgowej wartości sprzedaży.

**Status gate’u 2026-07-29:** PASS, 19/20. Desktop ma sześć KPI po 203 px,
główne karty 457/331/453 px, workspace 1313 px i zero overflow. Mobile
priorytetyzuje uwagę, KPI 2 × 3 oraz najnowsze leady i mieści wszystkie pola
bez poziomego przewijania. Produkcyjny Playwright desktop/mobile oraz axe
przechodzą 1/1. Lint, typecheck, 103 testy unit, RLS, WordPress, format,
lokalne skany bezpieczeństwa i build są zielone. Historyczne obrazy odbiorowe
zostały wycofane przez ADR-058; wynik testów pozostaje zapisem etapu.

## Etap 12U — kontrakt profesjonalnego buildera v2

- [x] Zablokować referencję buildera 1448 × 1086 i potwierdzić jej zgodność z
      istniejącym oryginałem repozytorium.
- [x] Zapisać ADR-030: sekcje i typowana walidacja należą do wersjonowanego
      agregatu `FlowDocument v2`.
- [x] Dodać parser v1/v2, deterministyczny migrator oraz walidację sekcji i
      ograniczeń w `@wyceno/validation`.
- [x] Tworzyć nowe szablony jako v2 i podnosić istniejący draft dopiero przy
      zapisie bez przepisywania immutable snapshotów.
- [x] Rozszerzyć podwójną walidację PostgreSQL, publiczny manifest i walidację
      odpowiedzi przy zachowaniu kompatybilności v1.
- [x] Dodać testy migratora, błędnych sekcji/ograniczeń, ról, IDOR, publikacji
      v1/v2 oraz istniejących sesji widgetu.
- [x] Uruchomić pełny pipeline, self-review, rollback review i zaktualizować
      dokumentację domeny/danych.

**Gate:** draft v1 otwiera się jako deterministyczne v2, ale baza zmienia go
dopiero po zapisie. Nowe drafty i szablony używają v2. Publikacja obu wersji
przechodzi niezależną walidację TypeScript/PostgreSQL, a opublikowany snapshot
pozostaje niezmienny. Manifest v1 nadal działa; manifest v2 ujawnia wyłącznie
allowlistowane ograniczenia odpowiedzi. Owner/Admin zachowują zapis i
publikację, Sales oraz drugi tenant nie uzyskują dostępu. Unit, RLS, widget,
E2E, lint, typecheck, format i build są zielone.

**Ryzyka:** podniesienie draftu przy pierwszym zapisie zmienia jego hash i
utworzy nową wersję dopiero po późniejszej publikacji. Rollback produkcyjny musi
zachować parser v2; migracji nie cofamy destrukcyjnie. Etap nie implementuje
jeszcze autosave, undo/redo, drag-and-drop ani finalnej geometrii buildera.

**Status gate’u 2026-07-29:** PASS. Parser i migrator v1 → v2 są
deterministyczne, nowe drafty szablonów są v2, a immutable snapshoty v1 nie są
przepisywane. TypeScript i PostgreSQL odrzucają błędne sekcje oraz ograniczenia.
Manifesty i sesje v1/v2 przechodzą, sekcje nie wyciekają do publicznej
projekcji, a role i tenant isolation zachowują dotychczasowe testy negatywne.
Lint, typecheck, 110 testów unit, RLS, WordPress, format, skany bezpieczeństwa i
build są zielone. Playwright: 34/34 dostępnych testów przeszło; 9 panelowych
testów warunkowych pominięto z powodu braku `PANEL_E2E_*` w tej sesji.
Kontrola w zalogowanej przeglądarce potwierdziła podniesienie v1 do v2 w
pamięci, cztery realne sekcje, osiem przypisanych pytań, brak poziomego overflow
i brak błędów konsoli.

## Etap 12V — bezpieczny stan edytora i autosave

- [x] Zapisać ADR-031 dla historii, kolejki latest-only, konfliktu i rewizji
      całego edytowalnego agregatu.
- [x] Rozszerzyć `draft_revision` na zmianę nazwy bez zmiany tabel, grantów ani
      immutable snapshotów.
- [x] Dodać historię 50 snapshotów, grupowanie wpisywania oraz prawdziwe
      Cofnij/Ponów bez cofania rewizji bazy.
- [x] Dodać debounce 900 ms, jeden zapis w locie, redukcję oczekujących stanów
      oraz ręczne ponowienie po błędzie.
- [x] Zatrzymywać autosave po konflikcie, zachować lokalny stan i wymagać
      jawnego potwierdzenia wczytania nowszej wersji.
- [x] Opróżniać kolejkę przed publikacją i zapisywać poprawny stan przed
      wewnętrzną nawigacją.
- [x] Zmienić krzyżyk inspektora w działające zamknięcie oraz przenieść
      usunięcie pytania do osobnej opisanej akcji.
- [x] Dodać unit, RLS, warunkowy E2E dwóch kart i manualny test zalogowanej
      aplikacji.
- [x] Uruchomić pełny pipeline, self-review i zapisać końcowy status gate’u.

**Gate:** requesty autosave nigdy nie działają równolegle, a stany oczekujące
są redukowane do najnowszego. Zmiana nazwy lub dokumentu zwiększa jedną rewizję.
Undo/redo tworzy normalnie zapisywany stan. Druga karta otrzymuje konflikt i
nie nadpisuje serwera; odświeżenie wymaga jawnego potwierdzenia. Publikacja nie
może ominąć najnowszej zmiany, a server actions ponownie sprawdzają tenant,
capability i kontrakt wejścia.

**Ryzyka:** historia jest pamięciowa i nie zastępuje offline storage. Konflikt
nie wykonuje automatycznego merge; jawne wczytanie serwera odrzuca lokalny stan.
Finalne drag-and-drop, walidacja w inspektorze oraz geometria 1:1 pozostają
zakresem kolejnych, osobno bramkowanych etapów.

**Status gate’u 2026-07-29:** PASS. Historia ma limit i grupowanie, kolejka
latest-only wykonuje najwyżej jeden request, a nazwa i dokument współdzielą
rewizję optimistic concurrency. Publikacja blokuje mutacje do zakończenia
zapisu i publish, nawigacja opróżnia kolejkę, zaś konflikt dwóch kart zatrzymuje
autosave bez nadpisania serwera. Manualny test w zalogowanej aplikacji potwierdził
autosave, undo/redo, konflikt, jawne wczytanie serwera, zamknięcie inspektora i
brak poziomego overflow przy dostępnym viewportcie 1280 × 720; fixture został
przywrócony. Pełne `test`, RLS, WordPress, `lint`, `typecheck`, `format:check`,
lokalne skany bezpieczeństwa i `build` są zielone; 120 testów unit przeszło,
Playwright: 34 dostępne testy przeszły, 10 panelowych testów warunkowych
pominięto bez `PANEL_E2E_*`. Ponowienie zewnętrznego audytu zależności było
niedostępne przez DNS i brak zgody na egress do rejestru; lockfile i graf
zależności nie zmieniły się w Etapie 12V, a ostatni audyt z tego samego dnia
pozostaje zielony.

## Etap 12W — finalna geometria profesjonalnego buildera

### Podetap 12W-N — biała nawigacja mobilna panelu

- [x] Zablokować zaakceptowaną referencję rozmowy i stan przed zmianą.
- [x] Zachować wspólny sidebar na desktopie, ale zastąpić go osobną
      nawigacją dolną przy szerokości do 56 rem.
- [x] Utrzymać bez przewijania cztery główne kierunki: Start, Leady, Procesy
      i Analityka oraz piątą pozycję „Więcej”.
- [x] Przenieść capability-gated Szablony, Integracje, Ustawienia, prywatność,
      powiadomienia, konto i pomoc do dostępnego arkusza dolnego.
- [x] Ukrywać globalny pasek na szczególe leada i roboczych trasach procesu,
      które mają własne tryby zadaniowe.
- [x] Uwzględnić safe area, cele dotykowe, focus trap, Escape, focus return,
      blokadę tła, reduced motion i forced colors.
- [x] Sprawdzić 320 / 390 / 430 / 768 px, axe, brak overflow i pełny pipeline.
- [x] Zapisać ówczesne reference, before, after, overlay, difference i raport;
      obrazy wycofano po przyjęciu ADR-058.

**Gate podetapu:** mobilny panel nie pokazuje sidebara ani przewijanego paska.
Biała nawigacja ma maksymalnie pięć równych pozycji, zawsze mieści się przy
320 px i nie zasłania treści. „Więcej” zawiera wyłącznie istniejące,
uprawnione funkcje; działa dotykiem i klawiaturą. Widoki drill-down odzyskują
pełną wysokość. Desktopowy sidebar, tenant scope i server actions pozostają
bez zmian.

**Ryzyka:** dolny pasek świadomie pozostaje także na małych tabletach do
56 rem, aby nie przełączać użytkownika przedwcześnie na desktopowy sidebar.
Nie pokazuje licznika powiadomień, ponieważ produkt nie ma osobnego,
wiarygodnego modelu liczby nieprzeczytanych zdarzeń. Etykiety 10,4 px
odpowiadają zaakceptowanej gęstości; wymagają ponownej kontroli, jeśli produkt
wprowadzi własne skalowanie tekstu niezależne od zoomu przeglądarki.

**Status gate’u 2026-07-29:** PASS, visual QA 19/20. Pasek ma 64–65 px,
pięć nieprzewijanych celów oraz wycentrowany limit 576 px na tablecie.
Playwright potwierdza 320/390/430/768 px, focus trap, Escape, focus return,
ukrycie w drill-down, zero overflow i brak naruszeń axe. Format, lint,
typecheck, 123 testy unit, RLS, WordPress i build są zielone. Kanoniczny
Playwright przeszedł 34/34 dostępnych testów, pomijając 10 scenariuszy
wymagających `PANEL_E2E_*`; izolowany odbiór nowej nawigacji przeszedł 1/1.
Dodatkowy pełny przebieg z kontem QA przeszedł 41/44. Ujawnił trzy niezależne,
istniejące problemy poza zakresem podetapu: timeout testu dwóch kart buildera,
wynikający z niego konflikt późniejszej publikacji oraz naruszenia
kontrastu/semantyki w analityce. Test mobilnej nawigacji pozostał zielony
w obu przebiegach.

- [x] Zablokować referencję 1448 × 1086, aktualny stan `before` i mierzalne
      granice raila, topbara, trzech kolumn oraz centralnej karty.
- [x] Dopasować stan ze zwiniętym wspólnym sidebarem Lorum do geometrii
      78 / 360 / 581 / 429 px bez tworzenia route-specific nawigacji.
- [x] Zachować stan rozwiniętego sidebara bez poziomego overflow i bez
      zgniatania preview lub inspektora.
- [x] Wyrównać toolbar, listę sekcji, preview, dolne akcje i gęsty inspektor
      do referencyjnej typografii, spacingu i wysokości kontrolek.
- [x] Dopracować tablet oraz mobile jako jawne tryby Pytania / Podgląd /
      Ustawienia z bezpiecznym scrollem, touch targets i dolną nawigacją.
- [x] Dodać automatyczne asercje geometrii, overflow, klawiatury i axe dla
      1448 / 768 / 390 px oraz sprawdzić długie polskie treści i zoom 200%.
- [x] Zapisać ówczesne `reference`, `before`, `after`, overlay, difference i
      raport; obrazy wycofano po przyjęciu ADR-058.
- [x] Uruchomić pełny pipeline, wykonać self-review i zapisać końcowy status.

**Gate:** przy 1448 × 1086 i zwiniętym wspólnym sidebarze Lorum granice
workspace odpowiadają referencji: rail 78 px, toolbar 85 px, lista około
360 px, preview około 581 px i inspektor około 429 px; karta preview ma około
464 px szerokości. Odchylenia mieszczą się w tolerancjach
`RESPONSIVE_LAYOUT.md`. Rozwinięty sidebar nie powoduje overflow. Tablet i
mobile nie skalują desktopu, lecz używają dostępnych trybów zadaniowych.
Autosave, undo/redo, konflikt, publikacja i capability checks z Etapu 12V
pozostają działające.

**Ryzyka:** referencja pokazuje historyczną markę i wyłącznie wąski rail; Lorum
oraz jeden współdzielony, rozwijany sidebar są nowszą decyzją właściciela.
Oddzielnej referencji mobile nie dostarczono, więc transformację ocenia
kanoniczny kontrakt responsive, nie sztuczny pixel diff. Etap nie dodaje
drag-and-drop, nowych typów walidacji ani zmian modelu danych.

**Status gate’u 2026-07-29:** PASS, visual QA 19/20. Przy 1448 × 1086
zwinięty shell ma dokładnie 78 / 360 / 582 / 428 px, toolbar 85 px, a karta
preview 464 px przy Y 255,14 px. Rozwinięty sidebar dzieli pozostałe 1240 px
na 320 / 560 / 360 px i kończy inspektor na prawej krawędzi viewportu bez
maskowanego overflow. Przy 768 i 390 px builder używa trzech dostępnych
klawiaturą trybów, a mobile przenosi realne Cofnij/Ponów do menu publikacji.
Test obejmuje także 320/375/430/724/1024/1280/1536 px, długie polskie treści,
reflow odpowiadający 200% zoom, cele dotykowe, axe i zero poziomego overflow.

Izolowany Playwright geometrii przeszedł 1/1, a łączny odbiór buildera
geometria + autosave/undo/redo/konflikt przeszedł 2/2. Kanoniczny E2E ma
34/34 dostępnych testów i 11 warunkowych pominięć bez danych panelu. Pełny
zalogowany panel przeszedł funkcjonalnie 11/11 po zastosowaniu dwóch
oczekujących lokalnych migracji 12U/12V; końcowa asercja jednego zbiorczego
testu nadal wykrywa znany, niezależny CSP dla podpisanych obrazów lokalnego
Storage. `format:check`, `lint`, `typecheck`, 123 testy unit, RLS, WordPress,
lokalne skany bezpieczeństwa i produkcyjny build są zielone. Nie zmieniono
zależności, modelu danych ani server actions w ramach 12W.

## Etap 12X — porządkowanie pytań i walidacja buildera

- [x] Zablokować referencję buildera 1448 × 1086, stan `before` oraz geometrię
      zaakceptowaną w 12W; nie zmieniać współdzielonego sidebara ani proporcji
      kolumn.
- [x] Dodać desktopowe przeciąganie pytań między pozycjami i sekcjami bez
      zewnętrznej zależności, z jednoznacznym wskaźnikiem miejsca upuszczenia.
- [x] Zachować równoważne porządkowanie klawiaturą i przez istniejące akcje,
      przywracać fokus oraz ogłaszać wynik w regionie `aria-live`.
- [x] Udostępnić w inspektorze zgodne z domeną ograniczenia długości tekstu,
      zakresu liczbowego i dat, bez tworzenia nieobsługiwanych reguł.
- [x] Pokazać błędy przy właściwym pytaniu i polu, zatrzymać autosave dla
      dokumentu niespełniającego schematu oraz blokować publikację przy
      błędach grafu, pozostawiając możliwość zapisu poprawnego szkicu.
- [x] Dodać testy jednostkowe zmiany kolejności i walidacji oraz test E2E dla
      myszy, klawiatury, granic walidacji, fokusu i komunikatów.
- [x] Wykonać visual QA przy 1448 / 768 / 390 px, axe, overflow, pełny
      pipeline, self-review i zapisać artefakty odbioru.

**Gate:** przeciągnięcie i alternatywa klawiaturowa tworzą ten sam poprawny
`FlowDocument`, także przy przejściu między sekcjami i usuwaniu pustej sekcji.
Fokus nie znika, a czytnik ekranu otrzymuje wynik operacji. Inspektor zapisuje
wyłącznie walidacje dozwolone dla danego typu pytania, wiąże komunikaty z
kontrolkami i nie wysyła niepoprawnego szkicu. Poprawny strukturalnie szkic
można zapisać mimo błędu grafu, lecz nie można go opublikować. Geometria 12W,
autosave, undo/redo, konflikt, capability checks i tenant scope pozostają bez
regresji.

**Ryzyka:** natywny desktopowy drag-and-drop nie jest wiarygodnym gestem na
każdym ekranie dotykowym, dlatego mobile i tablet zachowują jawne akcje
„wyżej/niżej” oraz pełną obsługę klawiatury. Etap nie dodaje sortowania opcji
odpowiedzi, nowych typów walidacji, zależności, migracji ani zmian server
actions.

**Status gate’u 2026-07-29:** funkcjonalny PASS; finalny odbiór wizualny
przeniesiony do Etapu 12Y po wykryciu regresji przełącznika. Natywne przeciąganie
desktopowe i `Alt+ArrowUp/ArrowDown` korzystają z tej samej testowanej operacji
na `FlowDocument`; przejście między sekcjami aktualizuje `sectionKey`, zachowuje
jawnie widoczną pustą sekcję do osobnej decyzji użytkownika, utrzymuje fokus
i ogłasza wynik. Inspektor obsługuje istniejące
`text_length`, `number_range` i `date_range`, wiąże błędy z polami, zatrzymuje
autosave dla dokumentu niespełniającego schematu oraz niezależnie blokuje
publikację przy błędzie grafu.

Produkcyjny Playwright potwierdza 1448/768/390 px, mysz, klawiaturę, fokus,
status live, brak overflow i zero naruszeń axe; izolowany odbiór przeszedł
1/1, a łączny regresyjny autosave + geometria + interakcje 3/3. Kanoniczny E2E
ma 34/34 dostępnych testów i 12 warunkowych pominięć bez danych panelu.
`format:check`, lint, typecheck, 133 testy unit, RLS, WordPress, lokalne skany
bezpieczeństwa i produkcyjny build są zielone. Nie dodano zależności, migracji,
zmian server actions ani odstępstw od tenant scope.

## Etap 12Y — regresja przełącznika i audyt kompletności buildera

- [x] Zablokować najnowszy zgłoszony crop uszkodzonego przełącznika, pełny
      render `before` oraz zaakceptowaną referencję buildera 1448 × 1086.
- [x] Porównać aktualny builder z referencją, kontraktem produktu i modelem
      `FlowDocument`; oddzielić funkcje działające od świadomych odstępstw i
      braków wymagających osobnych etapów.
- [x] Usunąć konflikt kaskady między ogólnymi polami inspektora a natywnym
      checkboxem oraz zastosować jeden odporny kontrakt geometrii przełącznika
      także w ustawieniach prywatności.
- [x] Pokryć checked, unchecked, focus-visible, disabled, klawiaturę i
      forced-colors bez zmiany semantyki natywnego checkboxa.
- [x] Dodać regresję Playwright dla wyliczonej geometrii 42 × 24 px, kapsuły,
      centralnego położenia gałki i zachowania pól tekstowych 42 px.
- [x] Wykonać visual QA buildera 1448 / 768 / 390 px oraz ustawień prywatności,
      axe, overflow, pełny pipeline, self-review i raport odbioru.

**Gate:** przełącznik nie dziedziczy rozmiaru ani paddingu pól tekstowych,
pozostaje natywnym checkboxem i ma wyliczone 42 × 24 px, promień co najmniej
12 px oraz gałkę 18 × 18 px wycentrowaną w obu stanach. `Space` przełącza stan,
fokus jest widoczny, disabled czytelny, forced-colors zachowuje rozróżnienie,
a inspectorowe `input`, `select` i `textarea` nadal mają docelową geometrię.
Builder i prywatność nie mają overflow ani naruszeń axe.

**Audyt zakresu:** działają toolbar, preview, pytania, autosave, undo/redo,
konflikt rewizji, publikacja, walidacja, logika pojedynczych warunków,
sortowanie pytań oraz tryby responsive. Pełne zarządzanie sekcjami, sortowanie
opcji odpowiedzi, wielowarunkowe grupy IF/AND/OR, edytory pricingu/scoringu i
konfiguracja wyniku nie są ukończone przez sam Etap 12X i pozostają osobnymi
pozycjami produktu; niniejszy etap ich nie pozoruje.

**Ryzyka:** `appearance: none` wymaga jawnej geometrii i stanów systemowych.
Ogólne selektory formularza nie mogą ponownie obejmować checkboxów, a poprawka
nie może lokalnie zmieniać zatwierdzonych tokenów `packages/ui`.

**Status gate’u 2026-07-29:** PASS dla regresji przełącznika, visual QA 20/20.
Ogólny selektor inspektora wyklucza checkboxy, a wspólny wzorzec buildera i
prywatności wymusza pełną geometrię 42 × 24 px, gałkę 18 × 18 px, zerowy
padding oraz stany focus, disabled i forced-colors. Natywny checkbox zachowuje
obsługę `Space`. Produkcyjny Playwright potwierdził desktop 1448 × 1086,
tablet 768 × 1024, mobile 390 × 844 i prywatność 1536 × 1024, brak overflow
oraz zero naruszeń axe.

Izolowany test przełącznika przeszedł 1/1, łączna regresja geometrii,
interakcji i przełącznika buildera 3/3, a kanoniczny E2E 34 testy z 13
warunkowymi pominięciami bez danych panelu. `format:check`, lint, typecheck,
133 testy unit, PostgreSQL/RLS, WordPress, SAST, secret scan i build 39 tras są
zielone. PASS 12Y nie oznaczał ukończenia osobnych obszarów buildera; ich
aktualny zakres wynika z `UI_SCREEN_SPEC.md`, wymagań domenowych i etapu M7 w
`ui/panel-minimal-v1/README.md`.

## Etap 12Z — pełne zarządzanie sekcjami buildera

- [x] Zablokować referencję buildera 1448 × 1086, aktualny render `before`
      oraz zakres ograniczony do lewej kolumny sekcji i pytań.
- [x] Dodać testowane operacje domenowe: utworzenie sekcji z pierwszym
      pytaniem, zmiana nazwy, zmiana kolejności oraz usunięcie z bezpiecznym
      przeniesieniem pytań.
- [x] Zachować kanoniczną zgodność kolejności `sections` i grup `steps`,
      wszystkie klucze grafu, reguły, entry step, estimation i wynik.
- [x] Wdrożyć referencyjne `+ Sekcja`, zwijanie, liczniki, menu sekcji,
      edycję nazwy i dialog usuwania bez martwych kontrolek.
- [x] Zapewnić równoważne porządkowanie sekcji klawiaturą, widoczny fokus,
      `aria-expanded`, status `aria-live` i bezpieczny powrót fokusu.
- [x] Pokryć limity 20 sekcji / 40 pytań, jedyną sekcję, błędne klucze,
      anulowanie dialogu oraz undo/redo i autosave.
- [x] Wykonać visual QA 1448 / 768 / 390 px, axe, overflow, pełny pipeline,
      self-review i zapisać raport odbioru.

**Gate:** utworzenie sekcji tworzy od razu pierwszy poprawny krok i nie zapisuje
pustej atrapowej grupy. Zmiana kolejności przestawia tablicę sekcji oraz całe
grupy kroków bez zmiany grafu wykonania. Usunięcie ostatniej sekcji jest
niemożliwe; usunięcie innej wymaga jawnego potwierdzenia i przenosi pytania do
wybranej istniejącej sekcji, zachowując ich kolejność i referencje. Każda
operacja przechodzi przez istniejącą historię, autosave, kontrolę rewizji,
walidację, capability i tenant scope.

**Ryzyka:** `steps` jest jednocześnie kanoniczną kolejnością pytań, dlatego
reorder sekcji musi przenosić całe spójne grupy. UI nie może tworzyć więcej niż
20 sekcji ani 40 pytań. Stan zwinięcia jest wyłącznie lokalną preferencją
widoku i nie trafia do `FlowDocument`. Etap nie dodaje sortowania opcji,
grup IF/AND/OR ani edytorów pricingu/scoringu/wyniku.

**Status gate’u 2026-07-29:** PASS, visual QA 19/20. Nowa sekcja powstaje
bezpośrednio za sekcją aktywnego pytania razem z pierwszym, schematowo poprawnym
krokiem. Zmiana nazwy, `Alt+ArrowUp/Down`, menu i usunięcie korzystają
z testowanych czystych operacji na `FlowDocument`. Reorder zachowuje wszystkie
klucze grafu, a dialog usuwania nie pozwala utracić pytań i wymaga wskazania
sekcji docelowej. Puste sekcje pozostają jawne do czasu osobnej decyzji,
ostatniej sekcji nie można usunąć, a limity 20 / 40 blokują dalsze tworzenie.

Produkcyjny Playwright przeszedł 1/1 i potwierdził autosave, undo przywracające
fixture, anulowanie dialogu, fokus, `aria-live`, axe, brak overflow oraz widoki
1448 × 1086, 768 × 1024 i 390 × 844. Overlay zachowuje osie 78 / 438 / 1020 /
1448 px i geometrię 12W; różnice treści wynikają z innego syntetycznego flow.
Testy jednostkowe obejmują limity, błędne klucze, pustą i jedyną sekcję,
przeniesienie pierwszej i dalszej grupy oraz zachowanie grafu. Nie dodano
zależności, migracji ani zmian server actions i tenant scope. Końcowy gate:
`format:check`, lint 8/8, typecheck 8/8, 141 testów jednostkowych, pełne
PostgreSQL/RLS i WordPress, SAST, secret scan, build 8/8 z 39 trasami oraz
kanoniczny Playwright 34/34 z 14 warunkowymi pominięciami bez danych panelu —
PASS.

## Etap 12ZA — sortowanie opcji odpowiedzi buildera

- [x] Zablokować referencję buildera 1448 × 1086, aktualny render `before`
      oraz zakres ograniczony do listy opcji odpowiedzi w prawym inspektorze.
- [x] Dodać testowaną, czystą operację zmiany kolejności opcji jednego pytania,
      zachowując pełne obiekty opcji, ich klucze i wszystkie referencje grafu.
- [x] Wdrożyć działający uchwyt przeciągania, wskaźniki miejsca upuszczenia
      oraz wspólną operację zapisu przez historię i autosave.
- [x] Zapewnić równoważną obsługę `Alt+ArrowUp/Down`, jawne akcje dotykowe,
      powrót fokusu, instrukcję dla czytnika ekranu i komunikaty `aria-live`.
- [x] Pokryć brakujące i błędne klucze, ruch bez zmiany, granice listy,
      stabilność reguł, undo/redo oraz zachowanie limitów 2–20 opcji.
- [x] Wykonać visual QA 1448 / 768 / 390 px, axe, overflow, pełny pipeline,
      self-review i zapisać raport odbioru.

**Gate:** przeciąganie, klawiatura i akcje dotykowe wywołują tę samą testowaną
operację domenową. Zmienia się wyłącznie kolejność `options` aktywnego pytania;
klucze opcji, `nextStepKey`, reguły, graf, sekcje, scoring, pricing i wynik
pozostają niezmienione. Operacja przechodzi przez istniejącą historię, undo,
redo, autosave, kontrolę rewizji, walidację, capability i tenant scope.
Pytania bez opcji nie pokazują sortowania, a mobile nie zależy od HTML5 DnD.

**Ryzyka:** klucze opcji są używane w regułach, więc implementacja nie może ich
odtwarzać ani sortować po etykiecie. HTML5 DnD nie jest wiarygodnym mechanizmem
dotykowym i wymaga jawnych akcji alternatywnych. Etap nie dodaje grup
IF/AND/OR, edytorów pricingu/scoringu/wyniku ani nowych pól schematu.

**Status gate’u 2026-07-29:** PASS, visual QA 19/20. Uchwyt opcji wykonuje
prawdziwe DnD z markerem miejsca upuszczenia, `Alt+ArrowUp/Down` używa tej
samej czystej operacji, a tablet i mobile mają jawne menu wyżej/niżej/usuń.
Po każdej zmianie fokus wraca na przeniesioną opcję, `aria-live` podaje nową
pozycję, historia obsługuje undo/redo, a autosave zachowuje kontrolę rewizji.
Klucze, obiekty `nextStepKey`, reguły, pozostałe kroki i całe pozostałe
`FlowDocument` nie są odtwarzane ani modyfikowane.

Czysty Playwright produkcyjny przeszedł scenariusz opcji 1/1 dla
1448 × 1086, 768 × 1024 i 390 × 844, w tym DnD, klawiaturę, menu dotykowe,
fokus, autosave, undo/redo, axe i brak overflow. Overlay prawego inspektora
zachowuje oś x=1019 oraz szerokość 429 px; różnice tekstowe wynikają z 3 opcji
syntetycznego flow wobec 4 w referencji. Pełny sekwencyjny E2E przeszedł 49/49.
Gate końcowy: `format:check`, lint 8/8, typecheck 8/8, 146 testów
jednostkowych, pełne PostgreSQL/RLS i WordPress, SAST, secret scan i build 8/8
z 39 trasami — PASS. Nie dodano zależności, migracji ani zmian tenant scope.

## Etap 12ZB — landing z trzema szklanymi powierzchniami produktu

- [x] Odrzucić dekoracyjny render 3D i zastąpić trzy telefoniczne ramki
      rzeczywistymi ekranami Lorum z tekstem HTML.
- [x] Zbudować wspólną perspektywę dla procesu klienta, buildera z regułą
      oraz gotowego leada, z osobnym kadrem desktop i mobile.
- [x] Usunąć pięć telefonów branżowych oraz skondensować stronę do sześciu
      rozpoznawalnych rozdziałów bez powtarzalnego układu kart.
- [x] Zachować działające demo, prawdziwe linki branżowe, zasady wyniku,
      publikację, model agencji i uczciwy zakres pilotażu.
- [x] Wykonać visual QA 1440 / 1024 / 768 / 390 / 320 px, axe, klawiaturę,
      reduced motion, forced colors, brak overflow i build produkcyjny.

**Gate:** hero pokazuje dokładnie trzy code-native powierzchnie produktu,
a żadna informacja na ekranach nie jest częścią wygenerowanego rastra. Desktop
i mobile zachowują czytelną relację klient → reguły → lead. Landing ma sześć
regionów, jeden duży interaktywny canvas i nie wraca do pięciu telefonów ani
serii osobnych białych kart. Podstawowa ścieżka działa bez JavaScriptu,
klawiaturą i przy reduced motion.

**Ryzyka:** scena używa perspektywy i nakładania, dlatego zmiana copy ekranów
może wymagać ponownego kadrowania 390/320 px. Efekt szkła nie może obniżać
kontrastu tekstu ani być jedynym nośnikiem relacji między ekranami. Etap nie
zmienia danych produktu, API, tenant scope, pricingu, scoringu ani widgetu.

**Status gate’u 2026-07-29:** PASS. Hero 1440 px pokazuje trzy cienkie
powierzchnie w jednej scenie, a wariant 390 px zachowuje tę samą kolejność
warstw bez poziomego overflow. Prowadzony przepływ jest jednym ciągłym
storyboardem, a dalsza strona została skrócona z około 15 tys. do około
8,2 tys. px przy 390 px bez utraty interaktywnego demo, dokumentu decyzji,
branż, publikacji, modelu agencji i pilotażu.

Playwright marketingowy przeszedł 21/21: pięć viewportów visual regression,
interakcję demo, klawiaturę, brak JavaScriptu, reduced motion, forced colors,
SEO, budżet JavaScriptu, brak overflow i axe WCAG 2.2 AA. Produkcyjny build
wygenerował 39 tras, widget zachował 17 269 B gzip przy budżecie 92 160 B.
Raport i deterministyczne rendery znajdują się w
`LANDING_GLASS_PANELS_2026-07-29.md` oraz
`artifacts/visual-qa/landing-glass-panels/`.

## Etap 12ZB-U — transparentny telefon produktowy i powrót ikon w hero

- [x] Zastąpić code-native scenę zaakceptowanym fizycznym telefonem z
      rzeczywistym ekranem procesu i elementami wyniku wychodzącymi z ekranu.
- [x] Przygotować osobne assety desktop i mobile z kanałem alfa, bez
      prostokątnego tła studia.
- [x] Na mobile pokazać wyłącznie telefon, celowo ucięty prawą krawędzią.
- [x] Przywrócić sześć okrągłych ikon: zakres, budżet, termin, lokalizacja,
      materiały i następny krok.
- [x] Dodać oszczędne okręgi prowadzące i pole punktów bez zasłaniania copy.
- [~] Wykonać końcowy visual QA aktualnego wariantu 1440 / 1024 / 768 /
  390 / 320 px i odnowić snapshoty.

**Gate:** desktop pokazuje jeden fizyczny telefon z elementami UI
wychodzącymi z ekranu, ale sam obraz nie wnosi własnego prostokątnego tła.
Mobile pokazuje tylko telefon i zachowuje celowe ucięcie około połowy
szerokości. Pasek sześciu ikon wraca jako jeden spokojny region informacyjny,
a dekoracje pozostają tłem, nie kolejnymi kartami.

**Ryzyka:** wygenerowany ekran pozostaje demonstracyjnym rastrem i nie może
być źródłem logiki produktu ani danych klienta. Kanał alfa jest przygotowany
z zaakceptowanego renderu i wymaga ponownej kontroli krawędzi przy każdej
zmianie koloru tła. Etap nie zmienia API, danych, scoringu, tenant scope ani
pozostałych sekcji landingu.

**Status 2026-07-29:** implementacja i testy statyczne są gotowe, gate
wizualny pozostaje OPEN. Oba produkcyjne WebP mają kanał alfa; lint,
typecheck, 85/85 testów jednostkowych i build 39 tras przechodzą, a Playwright
poprawnie odkrywa 21 scenariuszy marketingowych. Końcowych screenshotów po
ostatniej korekcie nie zapisano i nie wolno traktować starszych renderów jako
akceptacji. Szczegóły: `LANDING_RENDERED_PHONE_HERO_2026-07-29.md`.

## Etap 12ZC — audyt i program domknięcia produktu

- [x] Zweryfikować kanoniczną obietnicę automatycznej, niewiążącej estymacji
      względem wymagań, silnika, widgetu i rzeczywistego buildera.
- [x] Oddzielić stan lokalny, staging, pilot z danymi rzeczywistymi, publiczną
      produkcję oraz płatny self-service.
- [x] Zapisać jako blokery brak edytora pricingu/scoringu/wyniku, konflikt
      wymagań webhooka, niezamrożony working tree, prawo, infrastrukturę
      i operacje.
- [x] Zdefiniować zamknięte etapy 12ZD–12ZG oraz podetapy produkcyjne
      13A–13D z zależnościami, dowodami i gate'ami.
- [x] Zapisać pakiet wdrożeniowy firmy, kalibrację, UAT, rollout, metryki
      i odpowiedzialności.
- [x] Zsynchronizować `INDEX.md`, `ROADMAP.md`, `RELEASE_CHECKLIST.md`,
      `DEVELOPMENT.md`, `CHANGELOG.md` i ten backlog.

**Gate:** `PRODUCTION_READINESS_PLAN.md` jest jednym planem wykonawczym od
bieżącego working tree do pilota i produkcji. Nie przypisuje gotowości
produkcyjnej testom lokalnym, każda luka ma kolejny etap, a użycie prawdziwych
danych ma osobną, ostrzejszą bramkę niż demonstracja syntetyczna.

**Status gate'u 2026-07-29:** PASS dokumentacyjny. Audyt potwierdził, że
deterministyczny silnik estymacji i serwerowa granica zaufania są gotowe, ale
self-service pozostaje niekompletny bez edytorów pricingu, scoringu i wyniku.
Webhook występuje w wymaganiach bez implementacji. Etap 13 pozostaje
nierozpoczęty, a bieżący produkt nie jest kandydatem release.
`format:check`, lint 8/8, typecheck 8/8, 146 testów jednostkowych, pełne
PostgreSQL/RLS i WordPress oraz build 8/8 z 39 trasami przechodzą. E2E nie
uruchamiano ponownie dla zmiany wyłącznie dokumentacyjnej; ostatni zapisany
pełny wynik 49/49 nie zastępuje przyszłego gate'u na immutable SHA.

## Podetap 12ZC-T — rozbudowana biblioteka szablonów

- [x] Zablokować najnowszą referencję 1448 × 1086 oraz stan `before`.
- [x] Odtworzyć nagłówek, filtry, trzy KPI, pięć kart i dolny podgląd procesu.
- [x] Zastąpić demonstracyjne `12`, `68%`, import i tworzenie własnego szablonu
      rzeczywistymi danymi oraz istniejącymi akcjami produktu.
- [x] Dodać wyszukiwanie, kategorię, złożoność, sortowanie, wybór podglądu,
      rozwijany spis pytań i stan bez wyników.
- [x] Zachować pięć kart w jednym rzędzie 1448 px oraz proporcję obrazów
      1,7:1 na desktopie i mobile bez rozciągania.
- [x] Sprawdzić 1448 × 1086, 390 × 844 i 320 × 800, klawiaturę, axe, overflow,
      pełny pipeline i artefakty overlay/difference.

**Gate:** ekran wykorzystuje wyłącznie pięć realnych `flowTemplates`, ich
rzeczywiste pytania, reguły, sekcje i działającą akcję utworzenia draftu.
Referencja nie rozszerza zakresu o import, własne szablony ani analitykę użycia.
Zdjęcia zachowują 1,65–1,75:1 w każdej mierzonej szerokości, a filtr nie
pozostawia wybranego podglądu spoza bieżących wyników.

**Ryzyka:** liczba, kolejność i `priority` szablonów pochodzą z pakietu
walidacji, więc zmiana fixture'ów zmieni ekran bez lokalnych duplikatów danych.
Podgląd branżowego zastosowania jest opisowym copy, nie rekomendacją wyceny.
Etap nie dodaje migracji, zależności ani nowych uprawnień.

**Status gate'u 2026-07-29:** PASS wizualny i funkcjonalny, 19/20. Izolowany
Playwright przechodzi 1/1 i mierzy pięć kart w jednym rzędzie, obraz 1,7:1,
działanie filtrów i podglądu, axe oraz brak overflow przy 1448 / 390 / 320 px.
Format, lint 8/8, typecheck 8/8, 146 testów jednostkowych, PostgreSQL/RLS,
WordPress, SAST, secret scan i build 8/8 z 39 trasami przechodzą. Etap 12ZD
zsynchronizował test granic z rzeczywistym polem liczbowym fixture'u, poprawił
semantykę i kontrast analityki oraz wymusił standalone zamiast zastanego
`next dev`; pełny panel przechodzi 15/15. Końcowe obrazy tego kierunku zostały
później wycofane przez ADR-058.

## Etap 12ZD — zamrożony baseline repozytorium

- [x] Wykonać inventory wszystkich zmodyfikowanych, usuniętych i nieśledzonych
      plików bez utraty cudzych zmian.
- [x] Oddzielić kod, dokumentację, testy i wymagane artefakty od archiwów,
      lokalnych danych, sekretów i plików niedozwolonych w repozytorium.
- [x] Zamknąć lub jawnie zastąpić historyczne, niedokończone statusy 12F/12K
      oraz zaktualizować dokumenty opisujące starszy stan funkcji.
- [x] Uruchomić pełny gate z czystego checkoutu na przypiętym Node/pnpm.
- [x] Utworzyć logiczne commity, wypchnąć branch i uzyskać zielone CI,
      Semgrep CE oraz pełnohistoryczny Gitleaks.

**Status lokalny 2026-07-29:** inventory i dwa passy retencji są zakończone.
Do odzyskiwalnego Kosza trafiło archiwum starego kodu, 116 obrazów
odtwarzalnego legacy outputu, 21 dokładnych kopii oraz 80 zastąpionych obrazów
iteracyjnych. Working tree zmalał o 59,44 MiB bez usunięcia aktywów runtime,
snapshotów Playwright, raportów ani kanonicznych referencji. Seed visual QA
działa na Node 24 dzięki przepisywaniu importu `.ts` → `.js`; E2E panelu jest
serialne dla współdzielonego draftu, ma odporny cleanup stale-tab i może
wymusić własny standalone przez `PLAYWRIGHT_REUSE_EXISTING_SERVER=false`.
Pełny panel przechodzi 15/15 na commicie produktu, ogólny zestaw Playwright
34/34, axe analityki ma 0 naruszeń, a po przebiegu liczba jednorazowych kont
`panel-e2e-*` / `baseline-*` wynosi 0. Pierwszy logiczny commit produktu to
`e75ff93`, a commit dokumentacji i QA to `731e978`. Odłączony clean worktree
na `731e978` przeszedł frozen install, format, SAST, secret scan, PostgreSQL/RLS,
WordPress, 32/32 wymuszonych bez cache zadań lint/typecheck/unit/build oraz
34/34 ogólnych testów Playwright. Do pełnego clean-checkout gate'u pozostaje
powtórzenie 15/15 panelu z jednorazowym kontem. Aktualny dependency audit
oczekuje na jawną zgodę właściciela, ponieważ wysyła graf zależności do
zewnętrznego rejestru. Równoległy, nadal aktywny render
`artifacts/promo/lorum-launch-v1/` pozostaje nietknięty i poza baseline'em.
Immutable SHA, czysty checkout oraz zdalne CI nadal oczekują.

**Status audytu produkcyjnego 2026-07-31:** Etap pozostaje OPEN, ale lokalny
gate został ponowiony na Node 24.18.0. Frozen/offline install, format, lint,
typecheck, 147 testów jednostkowych, PostgreSQL/RLS, WordPress, SAST,
working-tree secret scan, dependency audit bez znanych podatności, build 39
tras oraz 34/34 dostępnych testów Playwright przechodzą. Naprawiono start
standalone: opcjonalny, ignorowany `apps/web/.env.local` jest wczytywany bez
kopiowania do artefaktu, dzięki czemu auth przechodzi także w produkcyjnym
E2E. CI ma syntetyczne publiczne wartości testowe, a build oznaczony jako
production odrzuca loopback lub brak HTTPS w `APP_URL`.

Audyt i plan pierwszych pięciu klientów utrzymują trzy dokumenty wykonawcze:
`PRODUCTION_READINESS.md`, `SECURITY_AND_DATA.md` oraz
`LAUNCH_FIRST_5_CLIENTS.md`. Decyzja pozostaje NO-GO z powodu otwartych P0:
braku rozproszonego rate limit/Turnstile, produkcyjnego ClamAV, backup/restore
i monitoringu oraz zielonego CI/Semgrep CE/pełnohistorycznego Gitleaks na jednym
SHA. Piętnaście panelowych E2E wymaga ponowienia z jednorazowym kontem w clean
checkout. Równoległy `artifacts/promo/lorum-launch-v1/` pozostał nietknięty.
Odczyt GitHub potwierdził, że remote nadal wskazuje `3193262`, aktualnego
CodeQL nie ma na zdalnej gałęzi, a ostatnie joby CI kończyły się bez wykonania
jakiegokolwiek kroku; nie są zaliczane jako dowód gate'u.

**Status kontraktu desktopowego i D0 2026-08-01:** właściciel dostarczył osiem
nowych referencji V7: siedem kadrów 1672 × 941 oraz overview 941 × 1672.
Oryginały zablokowano rozmiarem i SHA-256 w
`docs/ui/landing-desktop-v7/reference/`. Audyt i pomiary ustalają dziewięć
regionów desktopu, jawne override'y wobec V6, luki referencyjne oraz
klasyfikację `KEEP/REWRITE/REMOVE/ARCHIVE`. Baseline obecnego `/` ma
1672 × 6298 px, a produkcyjny zestaw marketingowy przechodzi 21/21.

D0 nie zmienił TSX/CSS, nie zaktualizował snapshotów i nie usunął runtime.
Niepotwierdzone ceny, trial, logotypy klientów, CRM/Sheets, statystyki, SLA,
telefon i e-mail z obrazów nie rozszerzają scope; implementacja ma zachować ich
rolę kompozycyjną za pomocą prawdziwych funkcji i uczciwego copy. Kandydaci
legacy pozostają na dysku do bezpiecznego cleanupu po podmianie aktywnego
landingu. `artifacts/promo/lorum-launch-v1/` pozostał nietknięty. Następny
dozwolony fragment to D1 — home-only header, hero i pasek dowodu, po czym visual
QA 1672 × 941 i STOP. Program D1–D5 nie zastępuje otwartego gate'u 12ZD.

**Status D1 2026-08-02:** home-only header, hero i neutralny pasek zastosowań
odtworzono według V7-01. Krytyczne osie 64/1608 px, hero 96–807 px, dashboard
około 880–1608 × 126–731 px i formularz około 697–927 × 258–753 px przechodzą
overlay. Cała scena produktu jest code-native; nie skopiowano fikcyjnych
klientów, KPI ani nieistniejącego terminarza. Dodano nazwane tokeny marketingowe
z testem kontrastu. Lint, typecheck, build oraz marketingowe 21/21 Playwright
przechodzą, łącznie z axe, klawiaturą, no-JS, forced colors i overflow. Raport i
artefakty są w `docs/ui/landing-desktop-v7/D1_HERO_REPORT.md` oraz
`artifacts/visual-qa/landing-desktop-v7/d1/`. Etap zatrzymano przed D2.

**Status D2 2026-08-02:** sekcję `guided-flow` przebudowano do trzech kart
według V7-02. Karty trafiają w osie referencji z odchyleniem około 0–2 px,
łączniki mają 64 px, oprawy ikon 80 px, a dolna powierzchnia kończy się przy
y≈827. Znormalizowany RMSE wynosi 0,107663, a ocena visual QA 19/20; brak
osobnej referencji mobile ogranicza wynik transformacji do 3/4. Sekcja jest
semantyczną listą, SVG są code-native, a copy nie sugeruje tworzenia brakujących
danych. Lint, typecheck, build i marketingowe 21/21 Playwright przechodzą.
Raport: `docs/ui/landing-desktop-v7/D2_PROCESS_REPORT.md`. Etap zatrzymano przed
D3.

**Status D3 2026-08-02:** sekcję `client-demo` przebudowano do czterech kart
kluczowych danych według V7-03. Nagłówek, opis i siatka trafiają odpowiednio w
y≈197, y≈369 i y≈480; osie kart obejmują x≈109–1554 przy szerokościach
324/320/345/355 px. Znormalizowany RMSE spadł z 0,146148 do 0,137486, a ocena
visual QA wynosi 19/20. Wartości i score są jawnie demonstracyjne, UI jest
code-native z dwoma istniejącymi lokalnymi zdjęciami, a CTA prowadzi do
rzeczywistego przykładu leada. Format, lint, typecheck, unit, build i
marketingowe 21/21 Playwright przechodzą. Raport:
`docs/ui/landing-desktop-v7/D3_KEY_INFORMATION_REPORT.md`. Etap zatrzymano przed
następną sekcją desktopu; legacy demo pozostaje do audytowanego cleanupu D5.

**Status D4 lead 2026-08-02:** sekcję `decision-document` przebudowano według
fragmentu V7-08 do pełnego demonstracyjnego leada. Przy szerokości 1672 px
sekcja ma 576 px, karta x≈126–1546 i y≈123–520, galeria zaczyna się przy x≈481,
a separator wyniku przy x≈1093. Trzy rastry zawierają wyłącznie fotografie
wycięte z zaakceptowanej referencji; dane, ikony, score i CTA są code-native.
Nie dodano fikcyjnego przypisania handlowca. Pierwszy axe wykrył niepoprawne
opakowanie `dt/dd`; semantykę poprawiono i finalny zestaw Playwright przechodzi
21/21. Format, lint, typecheck, unit i build również przechodzą. Raport:
`docs/ui/landing-desktop-v7/D4_LEAD_EXAMPLE_REPORT.md`. Następna dozwolona
sekcja to wyłącznie integracje V7-04.

**Status integracji V7-04 2026-08-02:** aktywną sekcję
`industry-and-publishing` przebudowano do układu pięciu powierzchni według
natywnej referencji 1672 × 941. Finalna geometria trafia w kicker y≈58, H2
y≈139, stage x=139/y≈334 i rail x=139/y≈766; normalized RMSE wynosi 0,149777.
Niepotwierdzone CRM i Google Sheets zastąpiono istniejącymi kanałami WordPress
i hosted link, zachowując e-mail oraz warunkowo opisany webhook. UI jest
code-native, nie zawiera atrap kontrolek ani prawdziwych danych osobowych.
Etykietę 11,2 px wykrytą przez gate podniesiono do 12 px. Format, lint,
typecheck, unit, build i marketingowe Playwright 21/21 przechodzą. Raport:
`docs/ui/landing-desktop-v7/INTEGRATIONS_REPORT.md`. Następna dozwolona sekcja
to wyłącznie pricing V7-05 z uczciwym modelem pilotażowym; cleanup legacy nadal
czeka na osobny gate.

**Status pricingu V7-05 2026-08-02:** sekcję `pilot` przebudowano do dwóch
wariantów rozpoczęcia współpracy w natywnej geometrii 1672 × 941. Karty trafiają
w osie x≈314/831, y≈281, mają szerokości 494/504 px i wysokość 541 px; H2
zaczyna się przy x≈382/y≈122, a dolny pasek przy y≈852. Normalized RMSE wynosi
0,155654. Kwoty 249/549 zł, limity, trial, karta płatnicza i claim rezygnacji
zostały zastąpione rzeczywistym pilotażem, indywidualną wyceną i decyzją o
dalszym rozwoju. Oba CTA prowadzą do kanonicznego `/cennik`; test blokuje kwoty
w złotych, trial i kartę na home. Format plików etapu, lint, typecheck, unit,
build i marketingowe Playwright 21/21 przechodzą. Root `format:check` ma jeden
niezależny wyjątek w nietkniętym, nieśledzonym
`artifacts/promo/lorum-launch-v2/STORYBOARD.md`. Raport:
`docs/ui/landing-desktop-v7/PRICING_REPORT.md`. Następny dozwolony fragment to
wyłącznie FAQ/pomoc V7-06; cleanup legacy pozostaje osobnym gate'em.

**Status FAQ V7-06 2026-08-02:** dodano nową sekcję `faq` pomiędzy pricingiem a
footerem w natywnej geometrii 1672 × 941. Lewa oś trafia w x≈87, dwuliniowy H2
zaczyna się przy y≈158, pięć wierszy po 82,9 px przy y≈417, a panel pomocy ma
`x≈1079, y≈145, 506 × 716 px`. Normalized RMSE wynosi 0,146369. Natywny
`details/summary` działa klawiaturą i bez JavaScriptu. Fikcyjny telefon, e-mail,
chat, 98% satysfakcji i SLA zastąpiono istniejącymi trasami `/jak-dziala`,
`/produkt`, `/wordpress`, `/cennik` oraz prawdziwymi zasadami RLS/MVP. Pierwszy
gate wykrył mobilny kicker 11,52 px; po korekcie do 12 px marketingowe
Playwright przechodzi 22/22. Format plików etapu, lint, typecheck, unit i build
przechodzą. Root `format:check` ma dwa niezależne wyjątki w nietkniętych,
nieśledzonych `artifacts/promo/lorum-launch-v2/STORYBOARD.md` oraz
`artifacts/promo/lorum-launch-v3/STORYBOARD.md`. Raport:
`docs/ui/landing-desktop-v7/FAQ_REPORT.md`. Następny dozwolony fragment to
wyłącznie finalne CTA V7-07; cleanup legacy pozostaje osobnym gate'em.

**Status finalnego CTA V7-07 2026-08-02:** dodano nową sekcję `final-cta`
pomiędzy FAQ a istniejącym footerem. Panel trafia w
`x=64, y≈80, 1544 × 777 px`, proof w `x≈867, y≈188, 674 × 566 px`, opis w
`y≈509`, CTA w `y≈642`, a dolne fakty w `y≈771`. Normalized RMSE wynosi
0,146519. Liczby 128/+20%, 72/+15% i procenty 85/72/68/61 zastąpiono pięcioma
grupami danych przykładowego briefu, czterema istniejącymi kanałami oraz jawnie
demonstracyjnym score 87/100. CTA prowadzą do `#przykladowy-lead` i `/produkt`;
nie dodano formularza ani atrap akcji. Format plików etapu, lint, typecheck,
unit, build i marketingowe Playwright 23/23 przechodzą. Root `format:check` ma
niezależne wyjątki w nietkniętych storyboardach
`artifacts/promo/lorum-launch-v2/STORYBOARD.md` i
`artifacts/promo/lorum-launch-v3/STORYBOARD.md`. Raport:
`docs/ui/landing-desktop-v7/FINAL_CTA_REPORT.md`. Następny dozwolony mikroetap
to wyłącznie integracja footera i kompozycyjny audyt V7-08, bez cleanupu legacy.

**Status footera i overview V7-08 2026-08-02:** istniejącą stopkę przebudowano
do wspólnej osi `x=64–1608` z finalnym CTA. Pełny znak Lorum, status produktu,
trzy semantyczne nawigacje, linki prawne i dolny rail zastępują stary,
szablonowy układ; wszystkie 14 linków ma działające cele. Pełny render
1672 × 7603 px zachowuje kolejność hero, procesu, kluczowych danych,
przykładowego leada, integracji, pilotażu, FAQ, finalnego CTA i footera.
V7-08 ma inną skalę, dlatego zgodnie z kontraktem wykonano side-by-side i ocenę
kompozycyjną bez fikcyjnego RMSE. Marketingowe Playwright przechodzi 24/24,
w tym układy 1440/1024/768/390/320 px, no-JS, forced colors i brak overflow.
Raport: `docs/ui/landing-desktop-v7/FOOTER_OVERVIEW_REPORT.md`. D4 i budowa
sekcji desktopu są zamknięte. Następny dozwolony etap to wyłącznie D5 — pełna
kontrola integralności, konsolidacja i bezpieczny cleanup, bez nowej sekcji i
bez rozpoczęcia redesignu mobile.

**Status mobile M0/M1 2026-08-02:** po zaakceptowaniu desktopu właściciel
polecił rozpocząć osobny program mobile sekcja po sekcji. Kontrakt zapisano w
`docs/ui/landing-mobile-v1/MOBILE_MASTER_PROMPT.md`; treść pozostaje z V7, a
pełny V6 mobile służy wyłącznie do oceny transformacji. Audit wykrył realne,
maskowane przez `overflow: hidden` przekroczenie H1 i CTA: przy 390 px elementy
miały 397,1 px szerokości, a przy 320 px 346,7 px. M1 przebudował wyłącznie
header i hero. Finalne osie to `x=16–374` przy 390 px oraz `x=12–308` przy
320 px; CTA mają 56 px, menu 44 px, scena zaczyna się około y=670, a hero jest
krótszy o około 220 px. Test mierzy rzeczywiste bounding boxy na
320/375/390/430 px zamiast polegać na `scrollWidth`. Marketingowe Playwright
przechodzi 25/25, a desktop 1440 pozostaje bez zmiany. Raport:
`docs/ui/landing-mobile-v1/M1_HERO_REPORT.md`. Następny dozwolony etap to
wyłącznie M2 — trzy kroki procesu. D5 cleanup pozostaje odłożony i nie został
rozpoczęty.

**Status marki Kwotum i korekty finalnego CTA 2026-08-02:** właściciel
zatrzymał M2 i zatwierdził osobny, zamknięty mikroetap marki. ADR-033 zmienia
widoczną nazwę Lorum na Kwotum oraz wprowadza skalowalny znak Q, pozostawiając
`@wyceno/*`, widget, eventy, nagłówki i zapisane prefiksy preferencji bez
migracji. Baseline wykazał, że przy viewportcie 320 px dzieci panelu CTA miały
około 326,8 px szerokości wewnątrz panelu 288 px; korekta usuwa clipping,
zmniejsza zagnieżdżony inset i porządkuje rytm pionowy. Dowody znajdują się w
`docs/ui/kwotum-brand-v1/` i `artifacts/visual-qa/kwotum-brand-v1/`. Po
zamknięciu gate'u dozwolony następny etap wraca do M2. Gate lokalny jest
zamknięty: lint i typecheck 8/8, pełne unit/RLS/WordPress, build 8/8 oraz
marketingowe Playwright 25/25 przechodzą. Root `format:check` zgłasza wyłącznie
siedem istniejących, nietkniętych plików równoległego `artifacts/promo/`.
Nowsza mikro-korekta usuwa różne kolumny `9/14.5/max-content` z raila warunków
oraz sztywną szerokość 12 rem pierwszej akcji przykładowego leada. Rail jest
zwarty na desktopie i jednokolumnowy na mobile, a obie akcje mają tę samą
szerokość na każdym breakpointcie. Korekta właścicielska z 2026-08-03 zastępuje
wcześniejszy zielony łuk nowym znakiem Q z formularzem i potwierdzeniem;
dokładny artwork właściciela został wyjęty z maski eksportera bez przerysowania
i jest współdzielony przez faviconę, marketing, auth i panel. Lista leadów używa
od teraz jednej białej powierzchni całej prawej części, bez kremowego tła pod
osobną kartą, oraz wykorzystuje wysokość desktopu przez 18 rekordów na stronę.
Szczegół leada jest tym samym pojedynczym białym canvasem: wynik, zakładki i
kolumny nie tworzą drugiej warstwy tła ani zewnętrznej karty. Zaokrąglenie
zachowuje funkcjonalny blok wyniku oraz kontrolki notatki, statusu i głównej
akcji. Widok Odpowiedzi korzysta z numerowanych wierszy pytanie–wartość, a Pliki
mają płaską listę z typem, rozmiarem i osobną małą powierzchnią podglądu po
prawej; mobile układa podgląd pod listą. Notatki są renderowane od najnowszej z
tenantowo odczytaną nazwą autora i datą zapisu, a formularz resetuje textarea
wyłącznie po udanej akcji serwerowej. Ta sama korekta obejmuje listę Procesów i
bibliotekę Szablonów, aby trzy główne widoki operacyjne miały jeden wspólny
shell powierzchni. Ustawienia, Prywatność i Powiadomienia również używają
białego tła całej prawej części. Integracje WordPress zostały spłaszczone do
sekcji i list rozdzielonych linią; nie mają sztucznych minimalnych wysokości ani
okrągłych kafelków ikon, a mały promień pozostaje wyłącznie na kontrolkach i
statusach.

**Status mobile M2 2026-08-02:** trzy wysokie, mobilne karty procesu zostały
przekształcone w jedną zwartą sekwencję bez zmiany desktopu. Przy 390 px sekcja
ma 1146,4 px zamiast około 1618,3 px, karty po 243,8 px zamiast 377,3 px, a
łączniki 48 × 48 px zamiast 64 × 64 px. Przy 320 px bezpieczna oś wynosi
`x=12–308`, wysokość sekcji 1178,8 px, a całe copy zachowuje minimum 16 px.
Dedykowane testy mierzą 320/375/390/430 px: równe szerokości kart, maksymalną
wysokość, centralne łączniki, boczne marginesy i brak overflow. Snapshoty 768
i 1440 px pozostają bez zmiany. Raport i artefakty:
`docs/ui/landing-mobile-v1/M2_PROCESS_REPORT.md` oraz
`artifacts/visual-qa/landing-mobile-v1/m2/`. Następny dozwolony etap to
wyłącznie M3 — cztery karty kluczowych danych; M3 nie został rozpoczęty. Gate
M2: marketingowy Playwright 29/29, lint i typecheck po 8/8, pełne unit,
RLS/WordPress, build 8/8 i `git diff --check` przechodzą. Scope'owany format M2
przechodzi; root `format:check` zgłasza wyłącznie dziesięć nietkniętych plików
równoległego `artifacts/promo/`.

**Status mobile M3 2026-08-02:** cztery grupy kluczowych danych zostały
przekształcone z pionowej listy kart 335 px w porównywalną siatkę 2 × 2. Przy
320 px sekcja ma 1046,1 px zamiast 2034,1 px, a karty 142 × 279,4 px; przy
390/430 px sekcja ma około 965 px, a karty odpowiednio 173/193 × 260,7 px.
Budżet, termin, galeria 2 × 2 i score 87 pozostają kompletne, tytuły mają 16 px,
a bezpieczna oś wynosi 12 px przy 320 oraz 16 px powyżej. Przy odpowiedniku
zoomu 200% siatka przechodzi do jednej kolumny bez clippingu. Dedykowany gate
M3 i regresja przechodzą 10/10, pełny marketing 34/34, lint i typecheck po 8/8, pełne
unit/RLS/WordPress oraz build 8/8. Raport i artefakty:
`docs/ui/landing-mobile-v1/M3_KEY_INFORMATION_REPORT.md` i
`artifacts/visual-qa/landing-mobile-v1/m3/`. Scope'owany format i
`git diff --check` przechodzą; root `format:check` zgłasza wyłącznie dwanaście
nietkniętych plików równoległego `artifacts/promo/`. Następny dozwolony etap
to wyłącznie M4 — przykładowy lead; M4 nie został rozpoczęty.

## Etap 12ZB-P — rebranding publicznych podstron Kwotum V1

- [x] R0: zinwentaryzować wszystkie publiczne podstrony poza `/`.
- [x] R0: wykonać baseline desktop 1440 × 1000 i mobile 390 × 844 dla każdej
      trasy oraz zapisać metryki, screenshoty i błędy runtime.
- [x] R0: rozbić każdą stronę na sekcje i przypisać jeden z dziesięciu
      archetypów implementacyjnych bez łączenia odbioru osobnych tras.
- [x] R0: zapisać wspólną architekturę wizualną zgodną z home V7/M1–M3.
- [x] R0: zapisać master plan R1–R12 z osobnym gate'em każdej sekcji.
- [x] R1: zbudować wspólny shell podstron bez zmiany treści i kolejności
      sekcji.
- [x] R2.1: przebudować hero `/produkt` z własnym proofem procesu i jawną
      granicą MVP.
- [x] R2.2: przebudować mapę produktu wokół jednego rekordu leada.
- [x] R2.3: przebudować granice produktu jako kontrakt odpowiedzialności.
- [x] R2.4: przebudować finalne CTA i overview produktu.
- [x] R2.R: wycofać odrzucone proofy typu AI-template z całego `/produkt`
      i zastąpić je redakcyjną narracją opartą na rzeczywistych ekranach
      desktop/mobile.
- [x] R2.V7: dopasować cały `/produkt` do zaakceptowanego systemu home V7,
      zachowując rzeczywiste ekrany zamiast syntetycznych proofów.
- [x] R3.1: przebudować hero `/jak-dziala` z jawną mapą zaufania.
- [x] R3.2: przebudować kroki 1–3 `/jak-dziala` jako jawny kontrakt procesu.
- [x] R3.3: przebudować kroki 4–6 `/jak-dziala` jako jawny outcome flow.
- [x] R3.4: przebudować bezpieczeństwo `/jak-dziala` jako model warstw ochrony.
- [x] R3.5: przebudować finalne CTA i overview `/jak-dziala`.
- [x] R3.C: skrócić przekrojowo rytm `/jak-dziala` bez utraty informacji.
- [x] R4.1: przebudować hero `/cennik` jako mapę kwalifikacji pilotażu.
- [x] R4.2: przebudować dwie ścieżki współpracy `/cennik`.
- [x] R4.3: przebudować model self-service jako jawny rejestr walidacji.
- [x] R4.4: przebudować kryteria zakresu i finalne CTA `/cennik`.
- [x] Pricing recovery: uprościć cały `/cennik` do dwóch kart zgodnych z
      zaakceptowanym landingiem i referencją planów.
- [x] R4.I.1: utworzyć shell, metadata, breadcrumbs i hero `/integracje` oraz
      poprawić cel wspólnej nawigacji.
- [ ] R4.I.2–R4.I.4: domknąć mapę realnych kanałów, status WordPressa, granice,
      CTA, sitemap i visual QA `/integracje` bez fikcyjnych konektorów.
- [x] R5.1: przebudować hero `/dla-agencji` jako czytelną relację agencja →
      organizacja klienta → widget → lead pozostający w organizacji firmy.
- [x] R5.2: przebudować metodę wdrożenia `/dla-agencji` jako jeden spójny plan
      procesu zgodny wizualnie ze stroną główną i panelem.
- [x] R5.3: przebudować granice tenantów i własność leadów `/dla-agencji` na
      podstawie rzeczywistej macierzy Owner/Admin/Sales.
- [~] R5.4: przebudować izolację widgetu od CSS strony hosta jako mały,
  code-native proof zgodny z rzeczywistym Shadow DOM; implementacja i gate
  są zamknięte, etap oczekuje na odbiór właściciela.
- [x] R5.V7: dopasować całą trasę `/dla-agencji` do zaakceptowanego systemu
      home V7, zachowując rzeczywistą macierz ról, tenant scope i kontrakt
      izolacji widgetu bez pseudo-paneli.
- [x] R7.V7: przebudować całą trasę `/branze` w systemie home V7, usunąć
      odrzucony pseudo-dashboard i zachować pięć prawdziwych tras branżowych.
- [ ] R5.5–R11: przebudowywać jedną trasę i jedną sekcję naraz zgodnie z
      `docs/ui/marketing-subpages-v1/MASTER_REBRAND_PLAN.md`.
- [ ] R12: wykonać globalną kontrolę SEO, linków, dostępności, responsive,
      prawdziwości copy, wydajności i bezpieczny cleanup legacy.
- [x] R12.T: ujednolicić H1, H2, H3, opisy sekcji i tekst podstawowy na
      wszystkich publicznych trasach przez centralne tokeny `packages/ui`,
      zachowując osobną typografię wewnętrznych proofów produktu.

**Status R0 2026-08-02:** audyt objął 19 tras i 38 renderów. Wszystkie zwracają
HTTP 200, nie zgłaszają błędów konsoli/pageerror i nie mają poziomego overflow.
Baseline ujawnił dwa niespójne języki wizualne: zaakceptowany home V7 oraz
starszy, płaski system podstron. Najdłuższe strony branżowe mają około
5,5 tys. px na desktopie i 7,2 tys. px na mobile. Nie zmieniono runtime stron.
Kontrakt, audyt i plan znajdują się w `docs/ui/marketing-subpages-v1/`, a
artefakty w `artifacts/visual-qa/marketing-subpages-v1/audit/`. Następny
dozwolony etap to wyłącznie R1. M4 strony głównej pozostaje wstrzymany, nie
anulowany.

**Status R1 2026-08-02:** wszystkie podstrony otrzymały pełny znak Kwotum,
sześciopozycyjną nawigację, aktywną trasę `aria-current`, osie V7, bezpieczne
marginesy 16/12 px na mobile, równą geometrię CTA, poprawione breadcrumbs i
spokojny legal shell. Nie zmieniono treści ani kolejności sekcji. Dedykowany
gate przechodzi 8/8, wszystkie 19 podstron dziedziczy shell bez overflow przy
1536/390 px, a cztery archetypy przechodzą 1440/1024/768/390/320 px. Axe
wykrył i wymusił poprawę kontrastu etykiety breadcrumbs z 4,28:1; finalnie nie
ma naruszeń. Pełny marketing przeszedł 42/42, lint, typecheck i build 39 tras
są zielone. Raport i visual QA:
`docs/ui/marketing-subpages-v1/R1_SHARED_SHELL_REPORT.md` oraz
`artifacts/visual-qa/marketing-subpages-v1/r1/`. Następny dozwolony etap to
wyłącznie R2.1 — hero `/produkt`.

**Status R2.1 2026-08-02:** hero `/produkt` pokazuje teraz code-native przepływ
konfiguracja → publikacja → gotowy lead oraz jawny podział odpowiedzialności
przeglądarka → serwer → firma. Copy zachowuje realny zakres MVP i nie dodaje
cen, KPI, klientów, integracji ani pełnego CRM. Desktop ma dwukolumnową
kompozycję, a mobile osobny, zwarty rail procesu; przy 320–1440 px nie ma
overflow, CTA są równe, a najmniejszy tekst ma 12 px. Dedykowany gate przechodzi
8/8, pełny marketing 50/50, lint, typecheck, pełne unit/RLS/WordPress i build
39 tras są zielone. Raport i artefakty:
`docs/ui/marketing-subpages-v1/R2_1_PRODUCT_HERO_REPORT.md` oraz
`artifacts/visual-qa/marketing-subpages-v1/r2-1/`. Następny dozwolony etap to
wyłącznie R2.2 — mapa produktu.

**Status R2.2 2026-08-02:** płaską siatkę sześciu modułów zastąpiła code-native
mapa zależności builder → widget → pricing/scoring → jeden rekord leada →
powiadomienia i analityka. Rekord zachowuje pełny kontekst, wynik z powodami i
następny krok, a kontrakt decyzji nie przypisuje systemowi roli handlowca.
Sekcja jest krótsza o 198 px na desktopie i 287 px przy 390 px, nie ma overflow
na 320–1440 px, a najmniejszy tekst ma 12 px. Axe wymusił przyciemnienie małych
etykiet z kontrastu 3,47–4,43:1 do poziomu WCAG AA. Dedykowany gate przechodzi
16/16, pełny marketing 58/58, lint i typecheck po 8/8, pełne
unit/RLS/WordPress oraz build 39 tras są zielone. Raport i artefakty:
`docs/ui/marketing-subpages-v1/R2_2_PRODUCT_MAP_REPORT.md` oraz
`artifacts/visual-qa/marketing-subpages-v1/r2-2/`. Następny dozwolony etap to
wyłącznie R2.3 — granice produktu; R2.3 nie został rozpoczęty.

**Status R2.3 2026-08-02:** tekstową listę granic zastąpił ciemny, code-native
kontrakt odpowiedzialności. Trzy karty pokazują wynik orientacyjny,
uporządkowany lead oraz jawne reguły, a każda rozdziela rolę Kwotum i firmy.
Finalny rail przypomina, że niewiążący wynik zawsze wymaga weryfikacji firmy.
Sekcja ma 894,4 px na desktopie i 1254,5 px przy 390 px, nie ma overflow na
320–1440 px, a najmniejszy tekst ma 12 px. Axe wykrył nadpisanie ciemnego tła i
kolorów przez późniejszą kaskadę oraz wymusił właściwy scope także w forced
colors. Dedykowany gate przechodzi 16/16, pełny marketing 66/66, lint i
typecheck po 8/8, pełne unit/RLS/WordPress oraz build 39 tras są zielone.
Raport i artefakty:
`docs/ui/marketing-subpages-v1/R2_3_PRODUCT_BOUNDARIES_REPORT.md` oraz
`artifacts/visual-qa/marketing-subpages-v1/r2-3/`. Następny dozwolony etap to
wyłącznie R2.4 — finalne CTA i overview; R2.4 nie został rozpoczęty.

**Status R2.4 2026-08-02:** wspólny band zastąpił lokalny finał decyzji
`/produkt` z dwoma działającymi CTA, trzema regułami produktu oraz code-native
overview „Kwotum w jednym widoku”. Desktop zachowuje dwukolumnową kompozycję,
a przy 1088 px przechodzi w jedną kolumnę; CTA mają identyczne wymiary na
320–1440 px i nie ma poziomego overflow. Axe wykrył kontrast 4,32:1 małych
etykiet, a test geometrii nierówne wysokości CTA przy 1024 px; oba problemy są
zamknięte. Dedykowany gate R2.3 + R2.4 przechodzi 16/16, pełny marketing 74/74,
pełne testy, lint, typecheck i build 39 tras są zielone. Raport i artefakty:
`docs/ui/marketing-subpages-v1/R2_4_PRODUCT_FINAL_CTA_REPORT.md` oraz
`artifacts/visual-qa/marketing-subpages-v1/r2-4/`. Trasa `/produkt` ma
ukończone R2.1–R2.4. Następny dozwolony etap to wyłącznie R3.1 — hero i mapa
zaufania `/jak-dziala`; R3.1 nie został rozpoczęty.

**Korekta R2.R 2026-08-14:** właściciel produktu odrzucił wcześniejszy R2 oraz
pierwszą próbę korekty jako nadal generatywny szablon. Cały `/produkt`
został przebudowany na płaską, redakcyjną narrację z jednym rzeczywistym
ekranem aplikacji na rozdział: panel, builder, widok wyniku i rekord leada.
Desktop i mobile używają osobnych, mechanicznie przyciętych kadrów z danych
demonstracyjnych; nie użyto wygenerowanych ilustracji ani atrap interfejsu.
Usunięto numerowane mapy, pseudotabele, powtarzalne karty, gradienty i sztuczne
overview. CTA prowadzą wyłącznie do istniejących tras, forced-colors używa
`Canvas/CanvasText`, a wszystkie kolory strony pochodzą z tokenów
`packages/ui`. Dedykowane E2E przechodzą 30/30 na 1440/1024/768/430/390/320
px, axe i klawiatura są zielone, brak overflow, lint/typecheck przechodzą po
8/8, web ma 184/184 unit, RLS i WordPress przechodzą, a build monorepo 16/16
oraz finalny build web są zielone. ADR-047, raport i visual QA:
`docs/ui/marketing-subpages-v1/PRODUCT_EDITORIAL_RECOVERY_2026-08-14.md` oraz
`artifacts/visual-qa/marketing-subpages-v1/r2-recovery/`. Korekta nie
wdraża strony na produkcję i nie zmienia kolejności dalszych etapów.

**Korekta R2.V7 2026-08-15:** porównanie R2.R z zaakceptowaną stroną główną
wykazało, że płaska narracja nadal tworzyła osobny język wizualny. `/produkt`
został więc przebudowany na ten sam system V7: chłodny canvas, hero copy +
zintegrowana scena prawdziwego panelu, kontrolowany podział bold/regular,
sygnałowy rail, wycentrowane rozdziały oraz ograniczone powierzchnie zamiast
białych pasów i ciężkiej ciemnej sekcji. Zachowano osobne, rzeczywiste kadry
desktop/mobile i podpisy danych demonstracyjnych. Dedykowane E2E przechodzą
30/30 na 1440/1024/768/430/390/320 px, axe, forced-colors, klawiatura i brak
overflow są zielone. ADR-047 i raport zostały zaktualizowane; korekta nie
zmienia funkcji, API, tenant scope ani danych i nie wdraża strony.

**Status R3.1 2026-08-02:** tekstowy hero `/jak-dziala` zastąpiła code-native
mapa przeglądarka → serwer → panel. Centralna karta wskazuje serwer jako źródło
potwierdzonego wyniku i kontroli dostępu, przeglądarka wyłącznie prowadzi
klienta, a decyzja pozostaje po stronie firmy. Desktop zachowuje dwie kolumny,
mobile zwartą oś pionową, oba CTA są równe i działają, a późniejsze sześć
kroków pozostało bez redesignu. Axe wykrył kontrast 1,59:1 i 1,56:1 na karcie
serwera oraz scope forced colors; test geometrii ujawnił różnicę wysokości CTA
19,44 px przy 1024 px. Wszystkie problemy są zamknięte. Dedykowany gate
przechodzi 8/8, pełny marketing 82/82, pełne testy, lint, typecheck i build 39
tras są zielone. Raport i artefakty:
`docs/ui/marketing-subpages-v1/R3_1_HOW_HERO_TRUST_MAP_REPORT.md` oraz
`artifacts/visual-qa/marketing-subpages-v1/r3-1/`. Następny dozwolony etap to
wyłącznie R3.2 — kroki 1–3; R3.2 nie został rozpoczęty.

**Status R3.2 2026-08-02:** pierwsze trzy wiersze procesu zastąpiła
code-native sekwencja konfiguracja → walidacja i publikacja → sesja klienta.
Każda karta pokazuje właściciela, działanie, jawnie demonstracyjny artefakt i
rezultat, a granica zaufania przypomina, że przeglądarka nie otrzymuje
prywatnego pricingu ani scoringu. Desktop używa trzech równych kart, mobile
czytelnej osi pionowej; 320–1440 px zachowuje tekst minimum 12 px i zero
overflow. Kroki 4–6 pozostały bez redesignu w osobnej sekcji. Dedykowany gate
R3.1 + R3.2 przechodzi 16/16, pełny marketing 90/90, pełne testy, lint,
typecheck i build 39 tras są zielone. Raport i artefakty:
`docs/ui/marketing-subpages-v1/R3_2_HOW_STEPS_1_3_REPORT.md` oraz
`artifacts/visual-qa/marketing-subpages-v1/r3-2/`. Następny dozwolony etap to
wyłącznie R3.3 — kroki 4–6; R3.3 nie został rozpoczęty.

**Status R3.3 2026-08-02:** kroki 4–6 tworzą teraz nazwany, code-native outcome
flow: potwierdzenie wyniku → świadome przekazanie kontaktu → decyzja firmy.
Ciemny panel oddziela rezultat od przygotowania procesu, a trzy równe rekordy
pokazują właściciela, mechanizm, demonstracyjny artefakt i rezultat. Wynik jest
jawnie orientacyjny, prywatny score pozostaje w panelu, a ostatnia decyzja po
stronie firmy. Desktop ma 963,3 px wobec 949,7 px baseline'u; mobile zachowuje
pełne dane bez overflow i tekstu poniżej 12 px. Dedykowany gate R3.1–R3.3
przechodzi 27/27, pełny marketing 101/101, pełne testy, lint, typecheck i build
39 tras są zielone. Raport i artefakty:
`docs/ui/marketing-subpages-v1/R3_3_HOW_STEPS_4_6_REPORT.md` oraz
`artifacts/visual-qa/marketing-subpages-v1/r3-3/`. Następny dozwolony etap to
wyłącznie R3.4 — bezpieczeństwo procesu; R3.4 nie został rozpoczęty.

**Status R3.4 2026-08-02:** płaską listę bezpieczeństwa `/jak-dziala`
zastąpił nazwany model trzech barier: autoryzacja i tenant scope po stronie
serwera → wymuszone RLS w PostgreSQL → walidacja pliku i prywatny storage.
Każda warstwa pokazuje mechanizm oraz rezultat, a osobna publiczna granica
wyjaśnia allowlistę manifestu bez dodawania certyfikatów i gwarancji. Desktop
używa dwóch kolumn, mobile jednej kolejności DOM; dziewięć viewportów zachowuje
tekst minimum 12 px i zero overflow. Axe wykrył kontrast 4,41:1 dwóch małych
etykiet, który został podniesiony do WCAG AA. Dedykowany gate R3.1–R3.4
przechodzi 38/38, pełny marketing 112/112, pełne testy, lint, typecheck i build
39 tras są zielone. Raport i artefakty:
`docs/ui/marketing-subpages-v1/R3_4_HOW_SECURITY_REPORT.md` oraz
`artifacts/visual-qa/marketing-subpages-v1/r3-4/`. Następny dozwolony etap to
wyłącznie R3.5 — finalne CTA i overview; R3.5 nie został rozpoczęty.

**Status R3.5 2026-08-02:** historyczny wspólny band z self-linkiem zastąpił
lokalny finał `/jak-dziala`. Główne CTA prowadzi do `/branze`, drugie do
`/logowanie`, a code-native overview rozdziela stały sześciostopniowy mechanizm
od pytań, zakresu, materiałów i kolejnego kroku zależnych od usługi. Oba CTA są
równe na 320–1536 px, semantyka ma nazwany region i complementary, a capture
nie wykrywa błędów ani overflow. Dedykowany gate R3.1–R3.5 przechodzi 49/49,
pełny marketing 123/123, pełne testy, lint, typecheck i build 39 tras są
zielone. Raport i artefakty:
`docs/ui/marketing-subpages-v1/R3_5_HOW_FINAL_CTA_REPORT.md` oraz
`artifacts/visual-qa/marketing-subpages-v1/r3-5/`. Cała trasa ma jednak 8704 px
przy 390 px wobec 5698 px w audycie R0, dlatego ilościowy gate R3 pozostaje
otwarty. Następny dozwolony etap to wyłącznie R3.C — redukcja rytmu
R3.1–R3.4 bez utraty informacji; R4.1 nie został rozpoczęty.

**Status R3.C 2026-08-02:** cała trasa `/jak-dziala` otrzymała zwarty kontrakt
mobile oparty na progressive disclosure. Rezultat każdego etapu jest zawsze
widoczny, a pełne opisy i demonstracyjne artefakty otwierają się natywnym
`details`; desktop oraz tryb bez JavaScriptu renderują całą treść jako otwartą.
Przy 390 px dokument skrócił się z 8704 do 5573 px (−36,0%) i jest o 125 px
krótszy od R0, a przy 320 px z 9350 do 5883 px (−37,1%). Dziewięć viewportów
zachowuje tekst minimum 12 px, poprawną kolejność DOM i zero overflow.
Dedykowany gate R3.1–R3.C przechodzi 60/60, pełny marketing 134/134, kontrolny
pakiet regresji 22/22, pełne testy, lint, typecheck i build 39 tras są zielone.
Raport i artefakty:
`docs/ui/marketing-subpages-v1/R3_C_HOW_ROUTE_COMPACTION_REPORT.md` oraz
`artifacts/visual-qa/marketing-subpages-v1/r3-c/`. Etap R3 jest zamknięty.
Następny dozwolony etap to wyłącznie R4.1 — hero `/cennik`; nie został
rozpoczęty.

**Korekta R3.V7 2026-08-15:** po akceptacji `/produkt` właściciel wskazał
`/jak-dziala` jako następną podstronę do dopasowania do strony głównej. Trasa
została przebudowana na ten sam system V7: hero z rzeczywistym wynikiem klienta
i rekordem leada, rail sześciu etapów, trzy rozdziały po dwa kroki z globalną
numeracją 01–06 oraz jedna zintegrowana powierzchnia bezpieczeństwa. Usunięto
powtarzalny układ kart, ciężki ciemny blok i mobilne `details`; cała historia
pozostaje dostępna bez JavaScriptu. Desktop i mobile używają właściwych kadrów
tych samych demonstracyjnych ekranów co zaakceptowany `/produkt`. Dedykowany
gate przechodzi 42/42 na 1536/1440/1280/1024/768/430/390/320 px, axe,
forced-colors, minimalny tekst 12 px i brak overflow są zielone. ADR-048,
raport i visual QA: `docs/ui/marketing-subpages-v1/HOW_V7_RECOVERY_2026-08-15.md`
oraz `artifacts/visual-qa/marketing-subpages-v1/r3-home-aligned/`. Korekta nie
zmienia funkcji, API, tenant scope ani danych i nie wdraża strony.

**Status R4.1 2026-08-03:** tekstowe hero `/cennik` zastąpiła code-native mapa
kwalifikacji wdrożenia. Trzy rekordy oddzielają proces, sposób publikacji i
kryteria walidacji, a rezultat pokazuje ustalony zakres pilotażu przed
indywidualną wyceną. Status self-service nadal jawnie informuje o braku
zatwierdzonych kwot, limitów i rozliczeń. Oba CTA działają i są równe na
320–1536 px; 1024 px zachowuje układ poziomy, a 768 px przechodzi w jedną oś.
Pierwszy pass ujawnił realny overflow 69–308 px i nierówne CTA przy 1024 px;
oba problemy zamknięto bez maskowania. Dedykowany gate przechodzi 11/11, pełny
marketing 145/145, pełne testy, lint, typecheck i build 39 tras są zielone.
Raport i artefakty:
`docs/ui/marketing-subpages-v1/R4_1_PRICING_HERO_REPORT.md` oraz
`artifacts/visual-qa/marketing-subpages-v1/r4-1/`. Następny dozwolony etap to
wyłącznie R4.2 — dwie ścieżki współpracy; R4.2 nie został rozpoczęty.

**Status R4.2 2026-08-03:** dwie generyczne kolumny `/cennik` zastąpił nazwany
region aktywnego programu pilotażowego i przyszłego self-service. Statusy
„Dostępne teraz” oraz „W walidacji”, neutralna geometria drugiej karty i brak
kontrolki zakupu nie pozwalają pomylić walidacji z gotowym planem. Każda
ścieżka rozdziela opis, model, cztery fakty i rezultat; dolna nota, CTA oraz
finalny `CtaBand` pozostały bez redesignu. Wszystkie 9 viewportów mają HTTP
200, minimum 12 px tekstu, 0 błędów runtime i 0 px overflow. Dedykowany gate
R4.1–R4.2 przechodzi 22/22, pełny marketing 156/156, pełne testy, lint,
typecheck i build 39 tras są zielone. Raport i artefakty:
`docs/ui/marketing-subpages-v1/R4_2_PRICING_PATHS_REPORT.md` oraz
`artifacts/visual-qa/marketing-subpages-v1/r4-2/`. Następny dozwolony etap to
wyłącznie R4.3 — model w walidacji; R4.3 nie został rozpoczęty.

**Status R4.3 2026-08-03:** cztery ogólne braki w karcie self-service zastąpił
semantyczny rejestr `<dl>`. Kwota, limity, płatności i dalszy model mają jawny
status i krótkie uzasadnienie, ale nie tworzą planu cenowego ani roadmapy.
Karta pilotażu, dolna nota, przyciski i finalny `CtaBand` pozostały bez zmian.
Macierz 320–1536 px ma HTTP 200, minimum 12 px tekstu, 0 błędów runtime i 0 px
overflow. Dedykowany gate R4.1–R4.3 przechodzi 33/33, pełny marketing 167/167,
pełne testy, lint, typecheck i build 39 tras są zielone. Raport i artefakty:
`docs/ui/marketing-subpages-v1/R4_3_PRICING_VALIDATION_REPORT.md` oraz
`artifacts/visual-qa/marketing-subpages-v1/r4-3/`. Następny dozwolony etap to
wyłącznie R4.4 — kryteria zakresu i CTA; R4.4 nie został rozpoczęty.

**Status R4.4 2026-08-03:** ogólną dolną notę `/cennik` zastąpił nazwany
region trzech kryteriów indywidualnego zakresu: procesu, publikacji i
walidacji. Sekcja pokazuje rezultat przed i po pilotażu, a finalny blok prowadzi
dwiema równymi, działającymi akcjami do `/jak-dziala#proces` oraz `/logowanie`.
Nie dodano ceny, limitu, triala, karty, formularza ani obietnicy self-service.
Macierz 320–1536 px ma HTTP 200, minimum 12 px tekstu, 0 błędów runtime i 0 px
overflow. Dedykowany gate R4.1–R4.4 przechodzi 44/44, pełny marketing 178/178,
pełne testy, lint, typecheck i build 39 tras są zielone. Raport i artefakty:
`docs/ui/marketing-subpages-v1/R4_4_PRICING_SCOPE_CTA_REPORT.md` oraz
`artifacts/visual-qa/marketing-subpages-v1/r4-4/`. Etap R4 jest zamknięty.

**Status pricing recovery 2026-08-03:** wielowarstwową konstrukcję R4.1–R4.4
zastąpiły dwie spokojne karty zgodne z zaakceptowaną stroną główną: dostępny
program pilotażowy oraz jawnie niegotowy self-service. Przy 1440 px dokument
ma 2592 px zamiast 3580 px, a przy 390 px 4107 px zamiast 6206 px. Obie karty
i CTA zachowują równe szerokości; macierz 320–1536 px ma minimum 12 px tekstu,
0 błędów runtime i 0 px overflow. Dedykowany gate przechodzi 44/44, pełny
marketing na buildzie produkcyjnym 178/178, testy jednostkowe 155/155, lint i
typecheck po 8/8, a build 8/8 generuje 39 tras. Raport i artefakty:
`docs/ui/marketing-subpages-v1/PRICING_RECOVERY_REPORT.md` oraz
`artifacts/visual-qa/marketing-subpages-v1/pricing-recovery/`.

**Status R4.I.1 2026-08-03:** utworzono kanoniczną trasę `/integracje` z
metadata, breadcrumbs i hero zgodnym z dostarczoną referencją: centralny
demonstracyjny rekord leada, cztery realne kanały, przerywane połączenia i
dolny rail. Header prowadzi do `/integracje`, a `/wordpress` pozostaje trasą
szczegółową. Nie dodano fikcyjnych CRM, webhooków ani arkuszy. Macierz
320–1536 px ma HTTP 200, minimum 12 px tekstu, 0 błędów runtime i 0 px
overflow. Dedykowany gate przechodzi 11/11, pełny marketing 189/189, testy
jednostkowe 155/155, lint i typecheck po 8/8, a build 8/8 generuje 40 stron.
Raport i artefakty:
`docs/ui/marketing-subpages-v1/R4_I_1_INTEGRATIONS_HERO_REPORT.md` oraz
`artifacts/visual-qa/marketing-subpages-v1/r4-i-1/`.

**Zmiana priorytetu 2026-08-03:** właściciel produktu wstrzymał R4.I.2–R4.I.4
i uruchomił R5.1 po audycie niespójności `/dla-agencji`, `/branze` i pięciu
tras branżowych względem zaakceptowanego home V7. Jednostką pracy pozostaje
jedna sekcja jednej trasy. Aktywny etap to wyłącznie R5.1 — hero i relacja
tenantów `/dla-agencji`; R5.2, R7 i R8 pozostają zamrożone do zamknięcia jego
visual QA i gate'u.

**Status R5.1 po trzeciej korekcie 2026-08-03 — COMPLETE:** właściciel
odrzucił zarówno beżowy diagram, jak i drugą marketingową makietę z pływającym
telefonem oraz skróconym dokumentem leada. Aktualny proof jest jednym pełnym
ekranem listy leadów, wyprowadzonym z `panel-navigation.tsx`, właściwej trasy
`/leady`, `styles.css` i wspólnych ikon panelu. Desktop pokazuje pełny sidebar,
filtry, siedem kolumn, statusy i paginację; mobile przechodzi na listę oraz
dolną nawigację aplikacji. Dziewięć viewportów 320–1536 px ma 0 px overflow,
minimum 12 px tekstu i zero błędów runtime. R5.1 przechodzi 11/11, regresja
R5.1 + shell + home 53/53, unit 177/177, a lint/typecheck/build po 8/8. Wynik
wykonawczy visual QA wynosi 19/20. Właściciel zaakceptował finalny render
odpowiedzią „super dalej”. Aktywny jest wyłącznie R5.2; R5.3–R5.5 i R7
pozostają zamrożone. Raport:
`docs/ui/marketing-subpages-v1/R5_1_AGENCY_HERO_REPORT.md`.

**Status R5.2 2026-08-04 — COMPLETE:** legacy’ową listę czterech
kolumn zastąpił jeden semantyczny plan wdrożenia z etapami Warsztat,
Konfiguracja, Osadzenie i Przekazanie. Każdy etap wskazuje właściciela,
działanie oraz rezultat, używa ikon rzeczywistego panelu i kończy się rejestrem
wspólnej architektury, indywidualnej treści oraz danych w organizacji klienta.
Mobile przechodzi na pionową oś procesu, a nie stos kart. Produkcyjna macierz
320–1536 px ma HTTP 200, minimum 12 px tekstu, 0 px overflow i zero błędów
runtime. Dedykowany gate przechodzi 11/11; wszystkie 22 przypadki R5.1 + R5.2
są zielone. W szerokiej regresji dwa crawle shellu przekroczyły 30 s przy
równoległym obciążeniu 64 testami, po czym przeszły 2/2 w izolowanym rerunie
bez zmiany timeoutu. Unit 177/177, lint/typecheck/build po 8/8. R5.3–R5.5 i R7
pozostawały zamrożone do decyzji właściciela. Właściciel zaakceptował etap
poleceniem „kontynuuj”, wydanym bezpośrednio po pytaniu o przejście do R5.3.
Aktywny jest wyłącznie R5.3; R5.4–R5.5 i R7 pozostają zamrożone. Raport:
`docs/ui/marketing-subpages-v1/R5_2_AGENCY_METHOD_REPORT.md`.

**Status R5.3 2026-08-04 — COMPLETE:** legacy’owy artykuł o
własności danych zastąpiła oddzielna sekcja oparta na rzeczywistym modelu
autoryzacji. Pokazuje aktywną organizację klienta, macierz Owner/Admin/Sales,
domyślny brak dostępu agencji oraz trzy warstwy egzekwowania granicy:
organizację z adresu panelu, serwerowy `TenantContext` i RLS. Opis Shadow DOM
został strukturalnie oddzielony, ale nieprzebudowany, ponieważ należy do R5.4.
Macierz 320–1536 px ma HTTP 200, minimum 12 px tekstu, 0 px overflow i zero
błędów runtime. Dedykowany gate przechodzi 11/11, finalna regresja R5.1–R5.3 +
shell + home 75/75, unit 177/177, RLS i WordPress PASS, a
lint/typecheck/build po 8/8. R5.4–R5.5 i R7 pozostają zamrożone do decyzji
właściciela. Raport:
`docs/ui/marketing-subpages-v1/R5_3_AGENCY_OWNERSHIP_REPORT.md`.

**Decyzja właściciela R5.3 2026-08-04 — COMPLETE:** właściciel zaakceptował
finalny render poleceniem „dalej”. R5.1–R5.3 zostają zamrożone. Aktywny jest
wyłącznie R5.4 — izolacja widgetu od CSS strony hosta; R5.5 i R7 pozostają
zamrożone.

**Status R5.4 2026-08-04 — READY FOR OWNER REVIEW:** legacy’owy nagłówek i
akapit o Shadow DOM zastąpiła osobna, ciemnozielona powierzchnia techniczna.
Code-native proof zestawia agresywny CSS strony klienta z pełnym interfejsem
widgetu wewnątrz shadow root oraz pokazuje rzeczywisty `<wyceno-widget>`, mały
loader, własny arkusz i wąski kontrakt zdarzeń. Copy jawnie ogranicza Shadow
DOM do izolacji CSS, bez sugerowania granicy bezpieczeństwa JavaScriptu.
Macierz 320–1536 px ma HTTP 200, minimum 12 px tekstu, 0 px overflow i zero
błędów runtime. Dedykowany gate przechodzi 11/11, finalna regresja R5.1–R5.4 +
shell + home 86/86, rzeczywisty test agresywnego CSS widgetu 1/1, unit 177/177,
RLS i WordPress PASS, a lint/typecheck/build po 8/8. R5.5 i R7 pozostają
zamrożone do jawnej decyzji właściciela. Raport:
`docs/ui/marketing-subpages-v1/R5_4_AGENCY_ISOLATION_REPORT.md`.

**Korekta R5.V7 2026-08-15 — LOCAL COMPLETE, OWNER REVIEW OPEN:** cała trasa
`/dla-agencji` została połączona w jedną narrację zgodną z home V7. Cztery
wcześniejsze, niezależne pseudo-panele zastąpiły rzeczywiste kadry panelu,
edytora procesu, szczegółu leada i wyniku widgetu oraz redakcyjne opisy
odpowiedzialności. Zachowano prawdziwą macierz Owner/Admin/Sales, zasadę braku
domyślnego dostępu agencji, trzy warstwy tenant scope i jawne ograniczenie
Shadow DOM do izolacji CSS. Dedykowany gate przechodzi 15/15 na
1536/1440/1280/1024/768/430/390/320 px; klawiatura, axe, forced-colors,
minimum 12 px tekstu, brak overflow i kompletna wersja bez JavaScriptu są
zielone. ADR-050, raport i visual QA:
`docs/ui/marketing-subpages-v1/AGENCY_V7_RECOVERY_2026-08-15.md` oraz
`artifacts/visual-qa/marketing-subpages-v1/r5-home-aligned/`. Zmiana nie dotyka
API, auth, tenant scope, RLS, danych ani runtime widgetu i nie wdraża strony.
Pełne lint i typecheck przechodzą 8/8, unit 22/22 zadań (web 184/184), RLS,
WordPress i oba skany bezpieczeństwa są PASS, a build przechodzi 16/16 i
generuje 42 trasy.

**Korekta R7.V7 2026-08-15 — LOCAL COMPLETE, OWNER REVIEW OPEN:** cała trasa
`/branze` została dopasowana do zaakceptowanego systemu home V7. Hero pokazuje
pięć realnych kontekstów na jednej panoramie, a indeks prowadzi do istniejących
tras mebli, ogrodzeń, stron internetowych, klimatyzacji i remontów. Pierwszy
wariant porównania został odrzucony przez właściciela jako ciężki mini-dashboard
i usunięty. Finalny wariant używa jednej dużej fotografii, spokojnego ciemnego
opisu oraz dyskretnej nawigacji zakładkowej; nie ma score, pseudotabeli ani
syntetycznej makiety panelu. Cała treść pięciu branż pozostaje dostępna bez
JavaScriptu w redakcyjnym indeksie. Dedykowany gate przechodzi 13/13 na
1536/1440/1280/1024/768/430/390/320 px, klawiatura, axe, forced-colors,
minimalny tekst 12 px i brak overflow są zielone. ADR-049, raport i visual QA:
`docs/ui/marketing-subpages-v1/INDUSTRIES_V7_RECOVERY_2026-08-15.md` oraz
`artifacts/visual-qa/marketing-subpages-v1/r7-home-aligned/`. Zmiana nie dotyka
API, auth, tenant scope, RLS ani danych. Pełne lint i typecheck przechodzą 8/8,
unit 22/22 zadań (web 184/184), RLS, WordPress i skany bezpieczeństwa są PASS,
a build przechodzi 16/16 i generuje 42 trasy. Etap nie wdraża strony.

**Korekta R12.T 2026-08-15 — LOCAL COMPLETE, OWNER REVIEW OPEN:** wspólna
responsywna skala H1/H2/H3, opisów sekcji i tekstu podstawowego została
przeniesiona do `packages/ui` i podpięta do 21 publicznych tras. Desktop używa
60/48/20 px, tablet 48/40/20 px, a mobile 42/36/18 px dla H1/H2/H3; lead ma
18/17/16 px. Typografia demonstracyjnych ekranów panelu, widgetu i rekordów
leada pozostaje celowo odrębna. Dedykowany Playwright wykonuje 63 pomiary
route × viewport i potwierdza dokładne wartości, brak nieoznaczonych nagłówków
treści oraz brak poziomego overflow. Pełny pakiet marketingowy przechodzi
200/200, a pięć wzorców wizualnych przechodzi również w przypiętym obrazie
Linux Playwright. Format, lint i typecheck przechodzą 8/8, a build przechodzi
16/16 i generuje 42 trasy. ADR-051 i raport:
`docs/ui/marketing-subpages-v1/TYPOGRAPHY_SYSTEM_2026-08-15.md`. Etap nie
zmienia copy, API, auth, tenant scope, danych ani runtime widgetu i nie wdraża
strony.

- [x] Wskazać immutable commit SHA i wyniki jako bazę Etapu 12ZE.

**Gate:** `git status` jest czysty, checkout od zera odtwarza build i pełne
testy, nie ma sekretów ani danych klientów, a zdalne CI jest zielone dokładnie
na wskazanym SHA.

**Status pierwszego passu 2026-07-29:** inventory zapisano w
`_migration/REPOSITORY_BASELINE_INVENTORY_2026-07-29.md`. Początkowy worktree
ma 1 089 wpisów i 178,48 MiB, z czego 145,59 MiB stanowią artefakty wizualne.
Lokalny secret scan przechodzi, `.env.local` jest ignorowany, ale Node 26.0.0
nie odpowiadał przypiętemu 24.18.0, ale właściwy runtime jest lokalnie
dostępny. `apps/web/Archiwum.zip`, 116 odtwarzalnych obrazów legacy oraz 21
dokładnych kopii przeniesiono do Kosza; operacje pozostają odzyskiwalne.
Worktree ma po cleanupie 954 wpisy i 141,52 MiB. Trzy usunięte README pakietów
zostały zastąpione aktualnymi opisami, a 12F/12K jawnie zamknięto przez
późniejszych następców. Gate etapu pozostaje OPEN do czasu drugiego passu
retencji artefaktów, pełnego testu na Node 24.18.0, czystego checkoutu
i zdalnego CI na jednym SHA.

**Status drugiego passu 2026-08-08 — LOCAL GATES PASS, GATE OPEN:** zastany
kandydat został ponownie zinwentaryzowany i sklasyfikowany. Lokalne źródła i
rendery promocyjne (`artifacts/promo/`) pozostają na dysku, ale są wyłączone z
repozytorium; dowody product visual QA pozostają kandydatem do wersjonowania z
odpowiadającymi zmianami. Usunięto dziewięć znanych podatności zależności,
`pnpm audit` raportuje zero znanych podatności, Turbo przechodzi 32/32, unit
177/177, pełne RLS i WordPress PASS, a produkcyjny standalone E2E przechodzi
257 testów przy 17 jawnych skipach. Gate pozostaje OPEN: trzeba podzielić
worktree na logiczne commity, uruchomić 16 scenariuszy panelu z tymczasowym
kontem i uzyskać zielone CI/CodeQL/Gitleaks na tym samym SHA. Clean checkout
został odtworzony na `517d80a`: frozen install, Turbo 32/32, pełne RLS,
WordPress i audyt zależności PASS. Draft PR #10 uruchomił pierwszy zdalny
przebieg na `e5ed147`; wykryte braki dotyczyły konfiguracji runnera
(Gitleaks token, `ripgrep`, CodeQL `actions: read`) i zostały objęte
remediacją. Drugi przebieg potwierdził Gitleaks oraz Quality Gate od formatu
do builda, ale publikacja wyników CodeQL jest niedostępna dla prywatnego repo
konta osobistego bez płatnego GitHub Code Security. Wymagana jest decyzja:
włączyć Code Security albo zaakceptować zgodny licencyjnie zamiennik SAST.
Różnice visual regression zostały usunięte u źródła: aplikacja dostarcza Inter
4.1 lokalnie, CI używa przypiętego obrazu Playwright 1.61.0 Noble, a 12
aktywnych baseline'ów ma osobne warianty Darwin i Linux. Tolerancja testów nie
została zwiększona. Pełny macOS Playwright przechodzi 257 testów przy 17
jawnych skipach, a docelowy kontrakt branż przechodzi na macOS i Linuxie
11/11. Końcowy push nadal musi potwierdzić pełny Quality Gate Linux na tym
samym SHA.
Raport:
`docs/_migration/REPOSITORY_BASELINE_AUDIT_2026-08-08.md`. R7.1 pozostaje
nieodebrane; naprawa regresji E2E nie zatwierdza tego etapu produktu.

**Status trzeciego passu 2026-08-09 — AUTHENTICATED PANEL PASS, GATE OPEN:**
`pnpm e2e:panel` buduje produkcyjny standalone, tworzy losowe konto i
organizację wyłącznie na lokalnym Supabase, ładuje syntetyczny seed i uruchamia
pakiet jednym workerem. Końcowy przebieg przeszedł 17/17: szesnaście
scenariuszy panelu oraz bezstanowy podgląd procesu. Cleanup potwierdził
`0|0|0` pozostałości organizacji, użytkownika Auth i prywatnych obiektów
Storage, a screenshoty testu nie nadpisują wersjonowanych artefaktów QA.
Gate wykrył i zamknął drift progu responsive buildera po sidebarze 240 px,
przypadkowe objęcie Szablonów pełną powierzchnią Procesów, paginację leadów
18 zamiast udokumentowanych 8 oraz historyczne pomiary workspace'u instalacji.
Podgląd widgetu rejestruje teraz element utworzony przed definicją bez zapisu i
bez sieci. Etap nadal pozostaje OPEN do wskazania końcowego SHA, czystego
checkoutu i zielonych dostępnych kontroli CI/Gitleaks/Semgrep CE na tym SHA.
Właściciel jawnie zaakceptował zastąpienie niedostępnego uploadu CodeQL przez
Semgrep CE; decyzję i ograniczenia zapisuje ADR-038.

**Status czwartego passu 2026-08-09 — SEMGREP LOCAL PASS, GATE OPEN:** usunięto
workflow CodeQL, którego publikacja SARIF wymaga płatnego GitHub Code Security,
i dodano blokujący Semgrep CE. Obraz 1.164.0 oraz wszystkie zewnętrzne GitHub
Actions są przypięte do commitów/digestów. Oficjalny zestaw OWASP jest
pobierany z przypiętą checksumą, a analiza działa bez sieci, capabilities i
zapisu do repo. Osiem własnych reguł ma testy 8/8; pełny skan wykonał 288 reguł
na 662 śledzonych plikach z 0 ustaleń i 100% parsowania. Supply chain pnpm ma
teraz siedmiodniowy release age, no-downgrade provenance, blokadę egzotycznych
zależności tranzytywnych i wyłącznie cztery dokładnie wersjonowane wyjątki.
Lockfile przeszedł kontrolę 543/543 wpisów, a Dependabot ma siedmiodniowy
cooldown zwykłych aktualizacji. Gate pozostaje OPEN do pushu i zielonych
Quality/Gitleaks/Semgrep/WordPress na jednym końcowym SHA. Pełne lokalne
powtórzenie zakończyło się PASS: format, lint, typecheck, 178 testów
jednostkowych, build 40 tras, RLS, WordPress, secret scan,
SAST, dependency audit, Semgrep, Playwright 257 PASS / 17 SKIP oraz panel 17/17
z cleanupem 0. Gate oczekuje już na push i zdalne kontrole. Obecny prywatny
plan nie udostępnia branch protection (GitHub API
HTTP 403, wymagany GitHub Pro), dlatego do upgrade'u właściciel musi ręcznie
zablokować merge przy czerwonym albo niepełnym przebiegu.

**Status piątego passu 2026-08-09 — IMMUTABLE RULES LOCAL PASS, GATE OPEN:**
pierwszy zdalny Semgrep na SHA `3ef107f` wykrył, że endpoint registry zwraca na
runnerze inną serializację niż lokalnie i poprawnie zatrzymał gate na
checksumie. Dynamiczne źródło zastąpiono oficjalnym repozytorium reguł
przypiętym do commita `40b8c63f75dc7c22c8a77482d73bfb864b146f7e` oraz
wersjonowanym manifestem 551 plików odwzorowujących reviewowany pakiet OWASP.
Treść licencjonowanych reguł nie jest redystrybuowana. Kontener nadal analizuje
bez sieci, capabilities i zapisu do kodu. Lokalnie commit i wszystkie ścieżki
zostały zweryfikowane, własne reguły przeszły 8/8, a pełny skan uruchomił 291
reguł na 663 śledzonych plikach z 0 ustaleń i 100% parsowania. Gate pozostaje
OPEN do pushu poprawki i zielonych Quality/Gitleaks/Semgrep/WordPress na jednym
końcowym SHA.

**Status szóstego passu 2026-08-09 — COMPLETE:** immutable baza Etapu 12ZE to
`2bc7db8d2357d2e97fc93d6d06d49804f8a90813`. GitHub Actions potwierdził na tym
dokładnym head SHA: Quality Gate PASS w 8 min 36 s, pełnohistoryczny Secret
scan PASS w 17 s, przypięty Semgrep PASS w 2 min 35 s oraz osiem wariantów
WordPress 6.8.3/6.9.2/7.0.2 na PHP 8.3/8.4/8.5 PASS. Quality Gate wykonał na
świeżym checkoutcie frozen install, format, lint, SAST, audit zależności,
typecheck, testy, build i testy dostępności, klawiatury oraz visual QA.
Lokalny pełny gate i authenticated panel pozostają udokumentowane powyżej.
Etap 12ZD jest zamknięty; żadnego czerwonego ani pominiętego obowiązkowego
statusu nie uznano za dowód.

## Etap 12ZE — self-service pricing, scoring i wynik

- [x] Dodać tryby buildera `Wycena`, `Scoring` i `Wynik` bez równoległego
      modelu danych i bez zmiany opublikowanych snapshotów.
- [x] Udostępnić bazę min/max, walutę, exact/range/from, zaokrąglenie oraz
      uporządkowane reguły add/multiply/add_per_unit.
- [x] Udostępnić punkty początkowe, rosnące kategorie i prywatne reguły
      scoringu bez ujawnienia ich respondentowi.
- [x] Dodać headline, disclaimer, następny krok, consultation/no_price
      i live preview publicznego wyniku.
- [x] Zintegrować edytory z historią, undo/redo, autosave, konfliktem rewizji,
      walidacją i publikacją.
- [x] Bezpiecznie obsłużyć usuwanie lub zmianę pytania/opcji użytych w regułach.
- [x] Dodać unit, PostgreSQL/RLS, E2E pełnej ścieżki, manipulację klienta,
      mobile, klawiaturę, axe, forced colors i reflow.

**Gate:** Owner/Admin konfiguruje i publikuje działającą estymację bez dostępu
do bazy. Widget pokazuje wyłącznie bezpieczny wynik, submit liczy go ponownie,
Sales nie widzi draftu, a niepoprawna konfiguracja nie zapisuje się ani nie
publikuje.

**Status pierwszego slice'u 2026-08-09 — MODEL PASS, ETAP OPEN:** dodano
niemutujący model wykrywania zależności pytania lub opcji od warunków ceny,
źródła ilości `add_per_unit` i prywatnego scoringu. Atomowe operacje czyszczenia
zachowują niezależne reguły oraz zwracają pełną listę skutków do przyszłego,
jawnego potwierdzenia w UI. Sześć testów obejmuje wszystkie trzy typy referencji,
usuwanie pytania i opcji, brak konfiguracji oraz zgodność oczyszczonego dokumentu
ze schematem. Nie podłączono jeszcze destrukcyjnych operacji do buildera, więc
żadna reguła nie jest kasowana po cichu; checklist i gate 12ZE pozostają otwarte.

**Status końcowy 2026-08-09 — COMPLETE, visual QA 19/20:** builder udostępnia
cztery obszary `Formularz / Wycena / Scoring / Wynik` na jednym
`FlowDocument`. Włączenie estymacji wymaga jawnego zakresu zamiast fikcyjnych
stawek. Baza, waluta, prezentacja, zaokrąglenie, trzy typy operacji, warunki,
kolejność, scoring 0–100, rosnące kategorie i publiczne zakończenie zapisują się
przez istniejącą historię, autosave, rewizję oraz immutable publish. Live
preview używa referencyjnego kalkulatora, ale PostgreSQL nadal stanowi granicę
zaufania i usuwa prywatny scoring z wyniku respondenta.

Usunięcie pytania lub opcji oraz niezgodna zmiana typu pokazują nazwane
zależności ceny, ilości i scoringu. Operacja wymaga potwierdzenia, czyści tylko
konieczne referencje, jest atomowa i możliwa do cofnięcia. Pełny Playwright
przeszedł 18/18 na produkcyjnym standalone buildzie; obejmuje publikację,
anulowanie destrukcyjnej zmiany, desktop 1448 px, mobile 390 px, reflow 320 px,
klawiaturę, cele 44 px, axe, forced colors, brak błędów runtime i zero overflow.
Syntetyczny tenant został usunięty bez pozostałości. Historyczne obrazy
odbiorowe zostały później wycofane przez ADR-058.

Pełny gate ma zielone: format, lint 8/8, typecheck 8/8, 185 testów unit,
PostgreSQL/RLS z niezależnym przeliczeniem estymacji i negatywnymi przypadkami
ról/tenantów, lokalny WordPress, dependency audit, SAST, working-tree secret
scan oraz przypięty Semgrep — 291 reguł na 666 śledzonych plikach, 0 ustaleń i
100% parsowania. Build wygenerował 40 tras, a widget ma 19 016 B gzip przy
budżecie 90 KiB. Nie dodano zależności, migracji ani ADR, ponieważ model danych,
granice zaufania i architektura nie uległy zmianie.

**Korekta regresji Safari 2026-08-10:** edytowalny tytuł w centralnym
podglądzie formularza zawija pełne 240 znaków i dopasowuje wysokość po zmianie
szerokości kolumny. Zachowano autosave, historię i semantykę etykiety, a test
Playwright sprawdza brak pionowego oraz poziomego ucięcia długiego polskiego
tytułu. Zmiana nie dotyka modelu danych, tenant scope ani publikacji.

## Etap 12ZF — webhook v1 utrzymany w MVP

- [x] Zapisać ADR-034 utrzymujący webhook w MVP albo usuwający go spójnie
      z wymagań, scope, API, QA, marketingu i release.
- [x] Przy utrzymaniu: wdrożyć tenantowe endpointy, sekret, HMAC-SHA256,
      wersjonowany envelope i minimalny event `lead.created`.
- [x] Dodać SSRF protection, dokładny URL HTTPS, zakaz redirectów,
      prywatnych adresów, credentiali w URL i niebezpiecznych portów.
- [x] Dodać idempotencję, retry/backoff, historię bez PII, dead-letter state,
      rotację, wyłączenie i syntetyczny test.
- [x] Dodać worker z osobnym sekretem, chroniony route, role/RLS oraz testy
      podpisu, replay,
      timeoutu, DNS/IP, drugiego tenanta i redakcji.
- [ ] W Etapie 13A podłączyć produkcyjny scheduler, metryki wieku kolejki oraz
      alerty braku wywołań i dead-letter.

**Gate:** release checklist nie wskazuje nieistniejącej funkcji. Utrzymany
webhook jest bezpieczny, obserwowalny i odporny na retry; usunięty webhook jest
usunięty ze wszystkich kontraktów w tym samym etapie.

**Status implementacji 2026-08-09 — LOCAL COMPLETE, PRODUCTION GATE OPEN:**
ADR-034 utrzymuje wyłącznie `lead.created`. Tenantowe tabele, forced RLS,
kontrolowane RPC, transakcyjny trigger, lock recovery, retry i historia prób
nie przechowują sekretu, payloadu ani response body. Owner/Admin zarządza
endpointami w panelu; Sales, anon i drugi tenant są blokowani. Transport
sprawdza publiczny HTTPS/443, wszystkie odpowiedzi DNS oraz prywatne/specjalne
IPv4 i IPv6, przypina połączenie TLS do sprawdzonego IP i nie śledzi redirectów.
DNS ma osobny timeout 2 s, a transakcyjny limit 10 aktywnych endpointów blokuje
równoległe ominięcie limitu fan-out. Rotacja i wyłączenie mają jawne
potwierdzenie skutków.
Envelope jest minimalny i podpisany HMAC raw body z timestampem. Worker ma
osobny sekret, całkowity timeout i ograniczoną równoległość.

Lokalny gate obejmuje 139 testów web / 211 unit łącznie, pełny PostgreSQL/RLS,
WordPress 6.9.2/7.0.2 i produkcyjny standalone E2E 19/19 z axe, 1448/390/320
px, forced colors, cleanupem 0 oraz buildem 41 tras. SAST, secret scan,
dependency audit i przypięty Semgrep (291 reguł, 692 pliki, 0 ustaleń) są
zielone. Visual QA ma 19/20 i komplet overlay/difference. Szczegółowy kontrakt,
runbook oraz forward-only rollback są w `WEBHOOKS.md`. Prawdziwe dane pilota
pozostają zablokowane do schedulera, alertów i stagingowego UAT z Etapu 13A.

## Etap 12ZG — kalibracja i pakiet pilotażowy

- [ ] Wybrać 1–3 firmy, właścicieli biznesowych, ekspertów wyceny i osoby
      obsługujące leady.
- [ ] Ustalić role stron, DPA, kanał wsparcia i zakaz szczególnych kategorii
      danych.
- [ ] Przeprowadzić warsztat pytań, pricingu, scoringu, wyjątków,
      consultation/no_price, disclaimera i obsługi leada.
- [ ] Zbudować zaakceptowany zestaw przypadków regresyjnych i progi go/no-go
      dla odchylenia estymacji.
- [ ] Wykonać UAT ról, widgetu/hosted/WordPress, e-maila, webhooka, uploadu,
      mobile i awarii sieci.
- [ ] Przygotować instrukcję instalacji, wyłączenia embedu, obsługi,
      eskalacji, hypercare i review pilota.

**Gate:** każda firma ma osobny, zatwierdzony arkusz reguł, przypadki
regresyjne, UAT i protokół go/no-go. Żadne ceny fixture'ów ani reguły innego
tenanta nie stają się niejawnie rekomendacją produkcyjną.

**Stan częściowy 2026-08-10 — FORTEZ DISCOVERY COMPLETE, PILOT NO-GO:**
wybrano Fortez jako pierwszego kandydata i wykonano aktualny audyt publicznej
strony, mobile, kart produktów, formularza, analityki, CSP, sitemap oraz
lokalnego źródła. Kontrakt w
`pilots/FORTEZ_PILOT_DISCOVERY_2026-08-10.md` zachowuje obecny formularz,
telefon i WhatsApp jako równoległy fallback oraz ogranicza pierwszy embed do
osobnego popupu dla użytkowników, którzy nie znają modelu. Discovery wykryło
dwie blokujące luki domenowe: telefon przy opcjonalnym e-mailu oraz niezależny
od konta adres alertów. ADR-039 i lokalny Etap 12ZK zamykają obie luki w kodzie:
schema v2, phone-first, tenantowa konfiguracja, forced RLS, alert z telefonem i
testy negatywne. Pilot nadal pozostaje NO-GO do wdrożenia migracji, schedulera i
alertów, warsztatu, DPA, UAT oraz podpisanego GO.

## Etap 12ZK — polityka kontaktu i dostawa alertów pilota

- [x] Zapisać ADR-039 z kompatybilnością snapshotów v1.
- [x] Dodać `email_required` / `phone_required` i serwerową walidację
      immutable snapshotu.
- [x] Pozwolić na lead bez e-maila przy wymaganym telefonie, bez tworzenia
      marketing consent ani potwierdzenia klienta.
- [x] Dodać tenantowy adres alertów, audit bez PII, capability Owner/Admin i
      forced RLS blokujące Sales, suspended i drugi tenant.
- [x] Dodać telefon do e-maila firmy, webhooka, panelu i bezpiecznych fallbacków
      prezentacyjnych.
- [x] Uruchomić unit, typecheck oraz pełny `pnpm test:rls` na czystej bazie.
- [ ] Zastosować migrację na staging/produkcji i wykonać syntetyczny UAT
      rzeczywistej dostawy przed pierwszym prawdziwym leadem.
- [x] Udostępnić w builderze konfigurację `email_required` / `phone_required`,
      wersjonowaną informację prywatności i jawne wyłączenie plików bez ręcznej
      edycji bazy.
- [x] Przeliczać po stronie serwera hash treści informacji prywatności i zgody
      marketingowej przy zapisie oraz publikacji draftu.
- [x] Uruchomić unit, typecheck oraz pełny `pnpm test:rls` na czystej bazie.
- [x] Zastosować migrację produkcyjną i skonfigurować tenantowy adres alertów
      Fortez poza repozytorium.
- [ ] Wdrożyć kontrolkę buildera i wykonać syntetyczny UAT rzeczywistej dostawy
      przed pierwszym prawdziwym leadem.

**Gate lokalny 2026-08-10:** pełna historia migracji i RLS przechodzi, w tym
phone-only submit, brak potwierdzenia klienta bez e-maila, adres snapshotowany w
outboxie oraz odmowy Sales/suspended/drugiego tenanta. Format, lint, typecheck,
unit/RLS/WordPress, build i izolowany E2E ustawień 1536/390 px są zielone;
historyczny odbiór wyniósł 19/20, a obrazy wycofano przez ADR-058.
Gate produkcyjny jest otwarty do wdrożenia, schedulera, monitoringu i
syntetycznej dostawy.

## Etap 12ZL — wdrożenie zaakceptowanego logo Kwotum V2

- [x] Zablokować dostarczoną referencję i jej SHA-256 w manifeście UI.
- [x] Zachować przezroczyste tło i światło litery Q oraz geometrię dokładnie
      dostarczonego znaku.
- [x] Przygotować transparentny master, faviconę i Apple touch icon.
- [x] Podmienić znak w marketingu, demonstracjach produktu, auth, panelu i
      metadanych bez zmiany tenantowego brandingu widgetu.
- [x] Uprościć wybór organizacji do jednej jasnej płaszczyzny, centralnego
      nagłówka, pojedynczych kart i jednej akcji bez fikcyjnych danych.
- [x] Dodać logo do szablonów Supabase Auth oraz transakcyjnych e-maili HTML z
      tekstowym fallbackiem nazwy.
- [ ] Wykonać finalny visual QA 1536/390 px, e-mail render, lint, typecheck,
      testy i build.

**Gate:** runtime nie odwołuje się do poprzedniego `Logoicon.svg`, wszystkie
produkcyjne warianty mają przezroczyste narożniki, a małe użycia zachowują
czytelność bez overflow i regresji dostępności.

**Status lokalny 2026-08-10:** web 142/142 i e-mail 18/18 przechodzą; lint,
typecheck, build 16/16 oraz `git diff --check` są zielone. Zalogowany build
potwierdził jedną warstwę kart, jedną akcję na organizację, brak błędów konsoli
i brak poziomego overflow przy 390 px. Retencyjny E2E 1536/390 px pozostaje
otwarty, ponieważ wymaga osobnej zgody na utworzenie i usunięcie lokalnego,
syntetycznego użytkownika oraz organizacji przez service role.

**Korekta znaku 2026-08-11:** właściciel wskazał dostarczony znak jako jedyny
wariant dla favicony, marketingu, auth, panelu i wiadomości. Runtime zachowuje
dotychczasowe wymiary komponentów, a sufiks `-v3` odcina cache wcześniejszego assetu;
tenantowy branding formularza pozostaje bez zmian.
artefakty 19/20 zapisano w `artifacts/visual-qa/12zk-contact-delivery-settings/`.
Gate produkcyjny jest otwarty do wdrożenia, schedulera, monitoringu i
syntetycznej dostawy.

**Stan 2026-08-11 — BUILDER CONTACT POLICY LOCAL PASS:** podczas konfiguracji
produkcyjnego draftu wykryto, że schema i widget wspierają phone-first, lecz
Owner nie miał kontrolki buildera do ustawienia tej polityki. Dodano osobny
obszar Kontakt z kompatybilnym domyślnym `email_required`, phone-first,
wersjonowaną informacją prywatności i plikami domyślnie wyłączonymi. Serwer
normalizuje hash treści przed zapisem. Web 163/163, lint, typecheck, build oraz
izolowany E2E buildera 1/1 są zielone; fixture Auth/DB/Storage został usunięty
bez pozostałości. Zmiana nadal wymaga review, CI i wdrożenia przed konfiguracją
draftu Fortez.

## Etap 12ZH — bezpieczny podgląd i wysłanie procesu

- [x] Zapisać prompt wykonawczy i ADR-035 oddzielający bezstanowy preview od
      publicznej sesji oraz zaproszenie od powiadomień leada.
- [x] Użyć prawdziwego runtime widgetu z pamięciowym API i storage bez requestów,
      sesji, analityki, uploadu, leada i powiadomienia.
- [x] Zmienić Instalację w ekran Podgląd i udostępnianie z desktop/mobile,
      resetem, hosted linkiem, zachowanymi trybami embed, WordPressem i
      diagnostyką.
- [x] Dodać capability `flow:share`, tenantowy outbox, idempotencję, retry,
      historię prób, RLS i audit log bez PII.
- [x] Dodać formularz wysyłki, historię z odbiorcą/autorem/datą/wersją/statusami
      oraz wersjonowany e-mail HTML + text bez trackingu.
- [x] Dodać testy jednostkowe widgetu, szablonu, workera i ról oraz testy
      PostgreSQL/RLS, drugiego tenanta, Sales, idempotencji i dostawy.

**Gate zamknięty 2026-08-03:** widget 17/17, e-mail 9/9, database 3/3 i web
90/90 przechodzą; lint i typecheck są zielone, `pnpm test:rls` przechodzi na
świeżej bazie z testem `flow_invitations.sql`, a build 8/8 generuje 40 tras.
Produkcja pozostaje zablokowana przez realnego providera, DPA, domenę nadawcy,
SPF/DKIM/DMARC, scheduler, alerty oraz ręczny UAT dostawy.

## Etap 12ZI — operacyjna obsługa leada

- [x] Zapisać prompt wykonawczy i ADR-036 oddzielający immutable brief klienta
      od tenantowego stanu obsługi.
- [x] Dodać `lead_operations`, `lead_tasks`, append-only activity, złożone FK,
      idempotencję, eksport DSAR, retencję i cascade usunięcia.
- [x] Dodać `lead:assign` i `lead:operate`, wąskie RPC, forced RLS oraz zakres
      zamykania zadań Owner/Admin/Sales.
- [x] Przebudować prawą kolumnę bez warstwowania: status, właściciel,
      priorytet, następny krok, kontakt, aktywność, notatki i otwarte zadania.
- [x] Podłączyć działające rozpoczęcie obsługi, planowanie kontaktu, tworzenie,
      wykonanie i anulowanie zadania oraz pełną historię.
- [x] Dodać unit projekcji i PostgreSQL/RLS dla ról, drugiego tenanta,
      zawieszonego konta, idempotencji, grantów i redakcji audytu.
- [x] Zastosować migrację do lokalnej bazy po naprawieniu rozbieżnej historii
      już zastosowanego Etapu 12ZH, wykonać desktop/mobile visual QA i axe.

**Gate zamknięty 2026-08-03:** historia lokalnych migracji została uzgodniona
bez resetu danych, a migracja `20260803000200_stage12zi_lead_operations.sql`
jest zastosowana. Unit web 92/92, database 3/3, `pnpm test:rls`, lint,
typecheck i build są zielone. Produkcyjny E2E Chromium przechodzi razem z
axe, trwałością statusu/właściciela/priorytetu, notatką z autorem i datą,
utworzeniem oraz zamknięciem zadania, historią i kontrolą reflow bez overflow
dla 1536 × 1024 oraz 390 × 844. Historyczne obrazy dowodowe zostały później
wycofane przez ADR-058.

## Podetap 12ZJ — lokalny kontrakt runtime readiness

- [x] Zapisać ADR-037 rozdzielający bezstanowy liveness od readiness
      krytycznej zależności danych.
- [x] Dodać ograniczony czasowo `GET /ready` przez anonimowy Supabase REST i
      wąski probe PostgreSQL bez dostępu do danych tenantów.
- [x] Dodać generyczne 503, `no-store`, `noindex`, testy timeoutu, błędu,
      payloadu i grantów anon/auth.
- [x] Wymusić HTTPS i host nie-loopback dla staging/production oraz ukryć
      `/design-system` przez 404 poza local/preview.
- [x] Dodać runtime smoke dla health, readiness, CSP, CORS, cookies, robots i
      środowiskowej dostępności showcase.
- [x] Zastosować migrację lokalnie bez resetu danych i wykonać pełny gate.

**Gate zamknięty lokalnie 2026-08-03:** migracja
`20260803000300_stage13a_runtime_readiness.sql` jest zastosowana. Unit w ośmiu
pakietach, w tym web 106/106, PostgreSQL/RLS, lint 8/8, typecheck 8/8 i build
8/8 przechodzą. Smoke profilu local i production przechodzi dla `health`,
`ready`, nagłówków, CORS, robots i środowiskowego 404. Podetap nie oznacza
utworzenia stagingu ani nie zamyka żadnej zewnętrznej pozycji 13A; wejście do
13A nadal wymaga ukończenia 12ZE–12ZG oraz decyzji infrastrukturalnych.

## Etap 12ZM — minimalistyczny panel Kwotum V1

Kanoniczny kontrakt i dokładne gate'y znajdują się w
`ui/panel-minimal-v1/README.md`. Etapy są sekwencyjne; kolejny nie rozpoczyna
się przed zamknięciem poprzedniego.

- [x] M0: przeanalizować dwie nowe referencje, oddzielić instrukcję wizualną
      od treści demonstracyjnej i zablokować rozmiary oraz SHA-256.
- [x] M0: zinwentaryzować panel, fonty, tokeny, routing, capabilities, stany,
      responsive oraz zachowania bezpieczeństwa bez zmiany runtime.
- [x] M0: usunąć poprzednie referencje panelu, zastąpione raporty i historyczne
      artefakty po utworzeniu odzyskiwalnej kopii.
- [x] M0: przyjąć ADR-058, skonsolidować aktywną dokumentację i przygotować
      bezpieczny plan M1–M10.
- [x] M1: wdrożyć Instrument Sans w tenantowym `.wy-panel-theme` oraz jasny,
      neutralny shell na centralnych tokenach, zachowując geometrię 256/72 i
      zachowania P1.
- [x] M2: ujednolicić pasek kontekstu, page intro, breadcrumbs i route-based
      menu wewnętrzne ustawień oraz integracji.
- [x] M3: przebudować wyłącznie dashboard przy zachowaniu zapytań, helperów,
      progów prywatności i wszystkich realnych wartości.
- [x] M4: ujednolicić współdzielone kontrolki i ich pełne stany.
- [x] M5: przebudować tabele i listy leadów, procesów oraz szablonów.
- [ ] M6: uporządkować workspace szczegółów leada.
- [ ] M7: odświeżyć builder i instalację bez zmiany kontraktu domenowego.
- [ ] M8: przenieść analitykę do nowego języka wizualnego.
- [ ] M9: uporządkować ustawienia, integracje, onboarding i wybór organizacji.
- [ ] M10: skonsolidować stany, usunąć zastąpiony CSS i zamknąć pełny gate.

**Gate M0 2026-08-26:** referencja główna 1199 × 842 px ma SHA-256
`824df7d47e16d9114ae66990a0d02e91f4954ce1ba7b5d1c4d180fea84aed6e1`, a
pomocnicza 404 × 316 px ma SHA-256
`2cd7db369c2233f08f77b497a2b2e54e5458bf840548c5ba6e791b48518e3b64`.
Poprzednie materiały panelu nie są już aktywnym źródłem decyzji. Runtime nie
został zmieniony; etap obejmuje wyłącznie reset referencji, dokumentację oraz
nazwy przyszłych artefaktów testowych. M1 pozostaje osobnym, nierozpoczętym
etapem.

**Review M1 2026-08-26:** właściciel odrzucił pierwszy render. Sam jasny
sidebar nie wystarcza: dashboard nadal ma konkurujące tła, nierówne osie,
nadmiar kart i generyczne wykresy. M1 pozostaje otwarty do czasu wspólnej
korekty widocznej powierzchni i nowego odbioru; M2 nie został rozpoczęty.

**Korekta M1/M3 2026-08-26:** przygotowano nowego kandydata bez podwójnych teł,
cieni, donutów, sparkline'ów i dekoracyjnych kart. Jeden biały canvas, wspólne
osie, Instrument Sans, cztery KPI, grupowany trend, rail uwagi, tabela i
płaskie przekroje korzystają z realnych danych. Dodano dokładny tenantowy
agregat operacyjny z forced RLS zamiast limitowanej listy, poprawiono loader,
empty states i realny overflow 320 px. Build 16/16, web unit 174/174, pełny
panel E2E 20/20 i RLS przechodzą; fixture testowy pozostawia 0 rekordów.
Odrzucone obrazy usunięto. M1 i M3 pozostają niezaznaczone do odbioru
właściciela; M2 ani M4 nie zostały rozpoczęte.

**Odbiór właściciela M1/M3 2026-08-26:** skorygowany kierunek został jawnie
zaakceptowany jako właściwa baza dalszej pracy. Zamknięto bramki wizualne M1 i
M3; odrzucony pierwszy render pozostaje wyłącznie historycznym wpisem, bez
aktywnych artefaktów. Dozwolony następny etap to wyłącznie M2 — pasek
kontekstu, page intro i nawigacja kontekstowa. M4 nie został rozpoczęty.

**Gate M2 2026-08-26 — PASS techniczny, kandydat do odbioru:** ujednolicono
54-pikselowy pasek kontekstu, tenantowe breadcrumbs, page intro oraz
route-based menu Ustawień i Integracji. Zakładki powstają serwerowo według
capabilities; ready/loading/error zachowują wspólny chrome, builder i lead
detail pozostają izolowane. Mobile 320 px ma 0 overflow dokumentu, jeden
przewijany rząd, cele 44 px i dokładnie jedną aktywną pozycję w arkuszu
„Więcej”. Visual QA wynosi 19/20; axe i forced colors mają 0 naruszeń. Bazowy
pełny panel E2E przeszedł 21/21, końcowy test M2 1/1, dwa dotknięte długie
scenariusze 2/2, build 16/16 i web unit 178/178. Dodatkowy pełny rerun utracił
jednorazowy fixture przy seryjnym retry; osobny cleanup potwierdził 0
pozostałości. Raport:
`artifacts/visual-qa/panel-minimal-v1/m2-context-navigation/diff.md`. M4 nie
został rozpoczęty i pozostaje zablokowany do wizualnego odbioru M2.

**Gate M4 2026-08-26 — PASS:** biblioteka `@wyceno/ui` ma jeden kontrakt
Button/LinkButton, pól tekstowych, selecta, textarea, checkbox/radio, switcha,
segmented control, tabs, menu i komunikatów. Stan ładowania przycisku zachowuje
geometrię i poprawną nazwę dostępną; formularze Ustawień, Prywatności,
WordPressa i webhooków używają wspólnych pól, komunikatów oraz 8-pikselowej
geometrii zamiast lokalnych konkurencyjnych reguł. Builder pozostał poza
zakresem. Testy UI przechodzą 38/38, końcowy E2E M4 1/1, axe i forced colors
mają 0 naruszeń, a macierz 320/375/390/430/720/768/1024/1280/1440/1536 px ma
0 overflow. Produkcyjny build przeszedł 16/16, a każdy fixture został usunięty
bez pozostałości. Raport:
`artifacts/visual-qa/panel-minimal-v1/m4-controls/diff.md`. Następny dozwolony
etap to M5; listy, szczegół leada, builder i analityka nie zostały zmienione.

**Gate M5 2026-08-26 — PASS:** Leady, Procesy i Szablony są trzema płaskimi,
profesjonalnymi powierzchniami bez dekoracyjnych kart, mediów i podwójnych
teł. Lista leadów używa dokładnego tenantowego countu, serwerowego zakresu
strony i fixture'u 102 rekordów; produkcyjny serwis pokrywa 0/1/102, filtry
oraz wyszukiwanie zachowują query params, a mobile jest osobnym `ul`. Lista
procesów pobiera tylko stronę oraz przypisane do niej wersje, używa pełnych
linków wiersza i przechodzi 0/1/109, ostatnią stronę oraz nazwy 160 znaków.
Szablony mają allowlistowany stan URL odporny na Back/Forward/reload, jawne
`flow:read`, fokusowany podgląd, negatywny test Sales oraz serwerowo kanoniczną
nazwę i dokument nowego procesu; ich model pokrywa 0/1/101. Celowany E2E M5
przeszedł 3/3, a pełna bramka panelu 23/23; axe ma 0 naruszeń, fokus forced
colors 3 px, a macierz
320/375/390/430/720/768/1024/1280/1440/1536 px ma 0 overflow. Każdy ekran
uzyskał 19/20. Web unit przechodzi 192/192, UI 38/38, lint i
typecheck 8/8, PostgreSQL/RLS, WordPress oraz build 16/16 są zielone; cleanup
fixture'u pozostawił 0 rekordów. Raporty:
`artifacts/visual-qa/panel-minimal-v1/m5-lists/`. Następny dozwolony etap to
M6; workspace szczegółu leada nie został rozpoczęty.

**Hotfix wyboru organizacji 2026-08-28 — PASS:** naprawiono regresję po
częściowym połączeniu dwóch wersji `/panel`. Ready, loading i error korzystają
z jednego współdzielonego frame'u; logo nie przejmuje globalnego podkreślenia,
a streaming skeleton rezerwuje identyczną geometrię karty i akcji. Pomiar
2048 × 1216 wykazał 0 px różnicy dla logo, intro, karty i akcji oraz CLS równy 0. Pełne unit 418/418, PostgreSQL/RLS i WordPress przeszły; target E2E przeszedł
1/1, axe ma 0 naruszeń, macierz 320–1536 px nie ma overflow, build przeszedł
16/16, a cleanup syntetycznego fixture'u pozostawił `0|0|0`. Raport i artefakty:
`artifacts/visual-qa/panel-minimal-v1/hotfix-organization-picker-stability/`.
Zakres nie rozpoczyna M9 i nie zmienia kolejności dalszych etapów.

## Etap 12ZN — Adaptive Intake: szybki formularz, prowadzony brief i konfigurator

Program jest prowadzony przez kanoniczny pakiet
`docs/product-experience-v1/`. Nie zastępuje bramek produkcyjnych Etapu 13 i
nie pozwala wdrażać nieskalibrowanych cen, scoringu ani rekomendacji produktu.

### PX1 — discovery i kontrakt

- [x] Wykonać audyt dokumentacji, kodu, widgetu, buildera, publicznej strony i
      artefaktów visual QA.
- [x] Przyjąć ADR-052: jeden bezpieczny silnik i trzy tryby doświadczenia:
      `quick_form`, `guided_brief`, `visual_configurator`.
- [x] Zdefiniować zasady list, kart tekstowych, ikon, zdjęć i fallbacków.
- [x] Zdefiniować granice context/prefill, kontaktu, outcome, brandingu i
      statusów walidacji szablonów.
- [x] Utworzyć macierz odbioru, sekwencyjny runbook worktree, manifest każdego
      etapu oraz profesjonalne prompty PX1–PX7.
- [ ] Przeprowadzić minimum pięć wywiadów z firmami, w tym dwa z operatorami
      leadów, oraz pięć testów klientów końcowych w trzech usługach.
- [ ] Przeprowadzić warsztat Fortez i zatwierdzić osobne ścieżki „znam model”
      oraz „potrzebuję doboru”.
- [ ] Zmienić publiczne określenie pięciu szablonów ze „zweryfikowanych” na
      uczciwy status `hypothesis`, dopóki nie istnieje dowód badań.

**Stan 2026-08-25:** część dokumentacyjna PX1 jest ukończona, research pozostaje
otwarty. Właściciel polecił kontynuację wyłącznie lokalną, dlatego model PX2
został wdrożony ostrożnie w istniejącym worktree bez deployu. Właściciel
następnie polecił przejść do kolejnego etapu; zgodnie z ADR-053 zaakceptowano
przeniesienie rejestru assetów jako twardej bramy wejścia do PX4, bez uznawania
brakującego kryterium za spełnione. Szczegóły zawiera
`docs/product-experience-v1/PX2_IMPLEMENTATION_REPORT.md`.

### PX2–PX7

- [x] PX2: wersjonowany FlowDocument v3 i publiczny schema prezentacji bez
      zmiany runtime.
  - [x] FlowDocument v3, migrator v1/v2 → v3 i round-trip.
  - [x] Zamknięte tryby, warianty, katalog ikon i referencja assetu UUID.
  - [x] Niezależna walidacja PostgreSQL, publikacja historyczna i tenant scope.
  - [x] Publiczny manifest v3 oraz parser runtime bez zmiany renderera.
  - [x] Prywatny tenantowy rejestr assetów i kontrola własności przed
        uruchomieniem `image_cards`.
- [~] PX3: `quick_form` na istniejącym silniku sesji, zgód i submitu.
  - [x] Maksymalnie 8 pytań, pierwsze pytanie jako wejście i wyłącznie liniowa
        trasa bez reguł ani override'ów opcji.
  - [x] Wybór trybu Owner/Admin, jasny konflikt i jawna, odwracalna akcja
        linearyzacji bez automatycznego usuwania pytań.
  - [x] Podgląd buildera korzysta z tego samego Web Componentu co hosted link.
  - [x] Jednostronicowy renderer zachowuje odpowiedzi, fokusuje pierwszy błąd
        i wysyła uporządkowaną kolejkę do istniejącego serwera wyceny.
  - [x] PostgreSQL niezależnie blokuje błędny quick form; E2E obejmuje
        1440/768/390/320, axe, klawiaturę, offline i retry.

**Gate PX3 2026-08-25:** technicznie lokalnie zielony; odbiór wizualny
właściciela pozostaje otwarty. Lint i typecheck przechodzą dla 8/8
pakietów, 264/264 testy jednostkowe oraz pełny PostgreSQL/RLS są zielone,
build kończy 16/16 z 41 trasami, a widget ma 23 014 B gzip przy budżecie
92 160 B. Izolowany E2E quick form przechodzi na czterech viewportach bez
overflow i naruszeń axe. Wcześniejszy generyczny render nie jest referencją;
został nadpisany autorskim „żywym arkuszem briefu”: numerowanym rejestrem pytań,
rytmem dokumentu, jedną osią i zgodą analityczną wyjętą z głównej ścieżki. Nie
używa kart, cieni, badge'y, hero-layoutu ani starych zdjęć. Audyt i reguły są w
`docs/product-experience-v1/PX3_VISUAL_AUDIT_AND_DIRECTION.md`. Kadry znajdują się w
`artifacts/visual-qa/px3-quick-form/`; raport w
`docs/product-experience-v1/PX3_IMPLEMENTATION_REPORT.md`. Bez deployu.

- [x] PX4: karty tekstowe, ikony i kontrolowane media z pełnym visual QA.
  - [x] Runtime `text_cards` rozdziela etykietę i opis oraz zachowuje natywną
        semantykę wyboru bez obrazu i SVG.
  - [x] Builder prezentacji i kompletność opisów każdej opcji.
  - [x] Autorski, zamknięty katalog `icon_cards` bez dowolnego SVG.
  - [x] Autorska, płaska kompozycja `visual_configurator` oraz visual QA
        1440/390 z axe i regresją przewijania po zmianie kroku.
  - [x] Tenantowy rejestr assetów, kontrola własności i publiczna projekcja.
  - [x] `image_cards`, stabilny fallback, lazy-loading, CLS i visual QA.

**Gate PX4 2026-08-25:** ukończony lokalnie. Nie korzysta ze starych zdjęć ani
z wygenerowanych dekoracji produktu. Owner/Admin dodaje własny JPEG/PNG/WebP,
który przechodzi sygnaturę, malware policy, limit pikseli, usunięcie metadanych
i niezmienną normalizację WebP. RLS i triggery blokują drugi tenant oraz obcy
UUID; publiczny widget nie poznaje ścieżki Storage. `image_cards` mają tekst,
lazy loading, stałe 4:3, niekolorowy wybór i fallback bez CLS. Raport:
`docs/product-experience-v1/PX4_IMPLEMENTATION_REPORT.md`. Bez deployu.

- [x] PX5: tenantowy, typowany context/prefill host → sesja → lead.

**Gate PX5 2026-08-25:** ukończony lokalnie. FlowDocument v3 zawiera
wersjonowany, zamknięty `contextSchema`; serwer tworzy kanoniczny snapshot,
blokuje zastrzeżone klucze i PII-like wartości oraz wymaga jednorazowego
potwierdzenia przed odpowiedzią. Panel rozdziela kontekst od odpowiedzi, a
WordPress przekazuje opcjonalny, bezpiecznie escapowany JSON. Lint i typecheck
przechodzą dla 8/8 pakietów, 274/274 testy jednostkowe, pełny PostgreSQL/RLS,
WordPress, security scan i build 16/16 są zielone. Osiem E2E widżetu, w tym PX5
na 1440/390 z axe i kontrolą overflow, przechodzi. Widget ma 27 072 B gzip przy
budżecie 92 160 B. Raport:
`docs/product-experience-v1/PX5_IMPLEMENTATION_REPORT.md`. Bez deployu.

- [x] PX6: wersjonowany kontakt, outcome i minimalny branding widgetu.

**Gate PX6 2026-08-25:** ukończony lokalnie. FlowDocument v3 zapisuje jawną
kolejność wynik → kontakt albo kontakt → wynik oraz zamknięte stany pięciu pól
kontaktu. Result v2 rozróżnia zebranie leada i zakończenie bez formularza;
serwer ponownie sprawdza outcome i nigdy nie publikuje score ani śladu reguł.
Branding organizacji obejmuje wyłącznie nazwę, bezpieczny kolor z automatycznym
kontrastem i opcjonalne tenantowe logo WebP pod same-origin URL. Lint,
typecheck, 278 testów jednostkowych, pełny PostgreSQL/RLS i build 16/16 są
zielone. Visual QA obejmuje poprawny branding, błędny manifest z fallbackiem
oraz brak konfiguracji — bez starych zdjęć i dekoracyjnych assetów. Raport:
`docs/product-experience-v1/PX6_IMPLEMENTATION_REPORT.md`. Bez deployu.

- [ ] PX7: kontrolowany pilot Fortez i reprezentatywnej firmy usługowej z
      fallbackiem oraz decyzją GO/ITERATE/NO-GO.

**Readiness PX7 2026-08-25:** pakiet lokalny jest gotowy, lecz etap nie jest
ukończony. Trzy konfiguracje `hypothesis` przechodzą kontrakt i nie zawierają
starych zdjęć, ceny, scoringu ani rekomendacji produktu. Przygotowano macierz
UAT, metryki bez PII, fallback i rollback. Decyzja dla prawdziwego ruchu:
**NO-GO** z powodu braku immutable release SHA, stagingowego UAT, schedulerów i
monitoringu, restore drill, DPA, finalnych treści, właścicieli obu firm i
podpisanych akceptacji. Raport:
`docs/pilots/PX7_PILOT_READINESS_AND_DECISION_2026-08-25.md`.

**Gate programu:** każdy etap spełnia `ACCEPTANCE_MATRIX.md`, powstaje w osobnym
worktree z zaakceptowanego commita poprzednika i kończy się raportem oraz STOP.
Żaden wariant prezentacji nie może osłabić RLS, immutable versions, serwerowej
kalkulacji, origin allowlist, rate limitu, Turnstile ani privacy proof.

## Podetap 12ZL — zaakceptowany znak Kwotum V3

- [x] Zablokować dostarczony znak i SHA-256 wariantów runtime.
- [x] Podmienić faviconę, Apple touch icon, publiczną nawigację, auth i panel.
- [x] Podmienić znak w demonstracjach produktu i wiadomościach.
- [x] Zachować tenantowy branding formularza klienta.
- [x] Wykonać format, lint, typecheck, unit, build i responsywny E2E.

**Gate:** runtime nie odwołuje się do poprzedniego `Logoicon.svg`; wszystkie
warianty zachowują przezroczyste tło, a desktop i mobile nie mają overflow ani
regresji dostępności.

**Gate zamknięty lokalnie 2026-08-11:** format i `git diff --check` przechodzą;
web ma zielone lint, typecheck i unit 161/161, email ma zielone lint, typecheck,
unit 18/18 i build, pełny build monorepo przechodzi 16/16, a responsywny Chromium
E2E przechodzi 34/34 dla marketingu oraz 8/8 dla wspólnego shellu na viewportach
od 320 px do 1536 px. W runtime nie pozostały odwołania do poprzedniego
`Logoicon.svg`.

## Etap 12ZM — finalny sidebar Kwotum

- [x] Zablokować zaakceptowaną referencję 863 × 1822 px i jej SHA-256.
- [x] Przebudować istniejący desktopowy sidebar do dokładnych 256/72 px.
- [x] Zastosować płaskie tło, Instrument Sans i centralne tokeny bez efektów
      glass, gradientów, blur oraz cieni.
- [x] Zachować routing, capabilities, tenant scope, mobilną nawigację i klucz
      `lorum:panel-sidebar-collapsed`.
- [x] Sprawdzić klawiaturę, tooltipy, reduced motion, axe, app shell i geometrię
      buildera.
- [x] Uzyskać co najmniej 18/20 w Visual QA i zachować artefakty odbiorowe.
- [x] Skorygować aktywną powierzchnię po review produkcji: zachować prawy
      odstęp 16 px w wariancie rozwiniętym; w zwiniętym zacząć równo z lewym
      brzegiem bez zaokrąglenia i zakończyć prawy skos 10 px przed krawędzią.

**Gate P1 2026-08-13:** sidebar ma 256/72 px i 100dvh, a app shell korzysta z
jednego `--kw-sidebar-width`. Visual QA osiągnęło 19/20; desktop 1440/1280/1024
oraz mobile 390 nie mają poziomego overflow. Izolowany scenariusz Playwright
potwierdza axe, klawiaturę, focus return, persistence i reduced motion.
P2 rebrandingu panelu nie należy do tego release'u.

**Hotfix P1 2026-08-13:** zaakceptowany zrzut produkcji nadpisał wyłącznie
zakończenie aktywnej pozycji. Pseudo-element nie jest już wydłużany do prawej
krawędzi w expanded; osobny crop collapsed zachowuje pełną lewą krawędź i
prawy skos wewnątrz raila. Test E2E mierzy oba kontrakty osobno.

## Etap 12ZN — finalny wybór organizacji Kwotum

- [x] Zablokować zaakceptowaną referencję 1536 × 1024 px i jej SHA-256.
- [x] Odtworzyć header 80 px, lewą kolumnę 484 px, oś listy 934 px,
      wyszukiwarkę 376 × 50 px oraz wiersz 111 px.
- [x] Użyć aktualnego logo i zielonej palety Kwotum bez kopiowania
      przykładowych firm, domen, ról i aktywności z obrazu.
- [x] Zachować auth, RLS, tenant scope, role `owner/admin/sales`, redirect
      onboardingu i działający logout.
- [x] Dodać działające wyszukiwanie po nazwie/slugu oraz osobne stany braku
      członkostwa i braku wyników.
- [x] Przekształcić tabelaryczny desktop w dostępne karty mobile bez zmiany
      kolejności DOM i bez poziomego overflow.
- [x] Dodać unit, E2E geometrii, klawiaturę, axe, before/after, overlay i diff.

**Gate 2026-08-13:** dokładny E2E 1536 × 1024 potwierdza header 80 px, panel
484 px, wyszukiwarkę 376 × 50 px, listę 934 px, header listy 62 px i wiersz
111 px. Mobile 390 × 844 ma 0 px overflow i zerową liczbę naruszeń axe.
Visual QA osiągnęło 19/20. Pierwszy test wykrył zbyt niski kontrast trzech
etykiet mobile; poprawiono go i powtórzono test bez wyłączeń. Raport:
`docs/PANEL_ORGANIZATION_PICKER_FINAL_2026-08-13.md`.

## Etap 12ZO — pojedyncza powierzchnia biblioteki szablonów

- [x] Zablokować zaakceptowany zrzut produkcji 3338 × 1962 px jako korektę
      wyłącznie zewnętrznej powierzchni trasy szablonów.
- [x] Usunąć klasę karty z kontenera całej biblioteki bez naruszania nagłówka,
      filtrów, KPI, kart szablonów i podglądu.
- [x] Zastosować ten sam kontrakt do stanów loading i error.
- [x] Dodać regresję E2E dla przezroczystego tła, zerowego obramowania i braku
      cienia zewnętrznej powierzchni.
- [x] Potwierdzić desktop 2048 × 1220, mobile 390 × 844, axe, overflow i pełne
      bramki jakości.

**Gate:** ekran ma jedną powierzchnię workspace; `.template-library-surface`
nie może tworzyć własnego tła, obramowania ani cienia. Wewnętrzne karty
pozostają rozdzielone zgodnie z biblioteką 12ZC-T. Zakres nie zmienia danych,
akcji, tenant scope, sidebara ani geometrii pozostałych ekranów.

## Etap 12ZP — spokojniejsza typografia panelu

- [x] Zablokować zaakceptowany crop produkcyjnego stanu „Brak danych”
      1136 × 456 px i jego SHA-256.
- [x] Zastąpić arbitralne wagi 520/550/620/640/650 w sidebarze centralnymi
      tokenami 400/500/600 bez zmiany jego geometrii, ikon ani aktywnego skosu.
- [x] Nadać stanowi małej próby analityki rzeczywisty inset 32 px na desktopie
      i 24 px na mobile oraz uporządkować hierarchię 16/14 px.
- [x] Usunąć z tego stanu zbędne wewnętrzne linie, nadmierną minimalną wysokość
      i przypadkowe zawężenie opisu, zachowując komunikat oraz próg prywatności.
- [x] Dodać regresję computed-style i visual QA dla sidebara oraz stanu pustego
      w desktopowym i mobilnym buildzie produkcyjnym.

**Gate 2026-08-13:** izolowany Playwright przeszedł 2/2, potwierdzając sidebar
256 px z wagami 400/500/600, stan desktop 32 px / 16 px / 14 px oraz stan mobile
24 px bez poziomego overflow. Zakres nie zmienia danych, logiki analityki,
tenant scope, treści komunikatów, mobilnej nawigacji ani geometrii sidebara.
Artefakty: `artifacts/visual-qa/12zp-panel-typography/`.

## Etap 12ZR — tenantowe centrum pomocy i geometria akcji leada

- [x] Zinwentaryzować rzeczywiste trasy, operacje, role i non-goals panelu.
- [x] Zastąpić link do marketingowego `/jak-dziala` wewnętrzną trasą
      `/panel/[organizationId]/pomoc` na desktopie i mobile.
- [x] Przygotować 19 instrukcji obejmujących start, leady, procesy, analitykę,
      powiadomienia, WordPress, webhooki, administrację i diagnostykę.
- [x] Filtrować poradnik tymi samymi capabilities co moduły panelu, bez
      ujawniania Sprzedaży instrukcji do buildera, integracji i prywatności.
- [x] Dodać działające wyszukiwanie z normalizacją polskich znaków, szybkie
      ścieżki, spis treści oraz natywne sekcje `details/summary`.
- [x] Zachować SSR pełnej dostępnej treści, tenant scope, noindex oraz stany
      loading, error i pusty wynik bez fikcyjnego formularza wsparcia.
- [x] Wycentrować ikonę i tekst wewnątrz obu drugorzędnych akcji szczegółów
      leada bez zmiany działania dialogów i serwerowego zapisu zadań.
- [x] Dodać unit ról/wyszukiwania oraz E2E wyszukiwarki, klawiatury, nawigacji,
      geometrii ikon, desktop/mobile, overflow i axe WCAG A/AA.

**Gate lokalny 2026-08-13:** 187 testów web przechodzi, lint i typecheck są
zielone, a build monorepo kończy 16/16 z dynamiczną trasą pomocy. Izolowane
scenariusze produkcyjnego standalone przechodzą 1/1 dla Pomocy i 1/1 dla
szczegółów leada, wraz z cleanupem tenanta bez pozostałości. Audyt axe wykrył
za jasne numery szybkich ścieżek i etykietę spisu treści; kontrast poprawiono i
powtórzony test ma zero naruszeń. Desktop 1536 × 1024 i mobile 390 × 844 nie
mają poziomego overflow. Środki ikon i tekstu obu akcji leada różnią się o nie
więcej niż 1 px. Raport: `PANEL_HELP_CENTER_FINAL_2026-08-13.md`; artefakty:
`artifacts/visual-qa/12zr-help-center/` i istniejący etap
`artifacts/visual-qa/12o-lead-detail-responsive/`. Etap nie zmienia API, bazy,
RLS, modelu ról ani nie stanowi samodzielnej zgody na deployment.

## Etap 13 — Produkcja

### Etap 13A — staging i infrastruktura

**Stan częściowy 2026-08-10:** wybrano Vercel Production i Supabase
`eu-north-1`, zastosowano komplet migracji, uruchomiono wdrożenie z immutable
SHA oraz podłączono `app.kwotum.pl`. Publiczne `health`, `ready`, DNS i TLS są
zielone. Wybrano także Resend, zweryfikowano `mail.kwotum.pl`, podłączono custom
SMTP do Supabase oraz wdrożono sześć wersjonowanych, polskich szablonów Auth.
Syntetyczne potwierdzenie rejestracji zostało dostarczone z poprawnym nadawcą i
bez domyślnej treści Supabase; dowód i rollback opisuje `AUTH_EMAILS.md`.
Prawne zatwierdzenie dostawcy, testy w rzeczywistych klientach pocztowych oraz
niezależny alert probe nadal pozostają otwarte. Aplikacyjny outbox, scheduler,
heartbeat i syntetyczna dostawa firmy działają produkcyjnie. Pozycje poniżej
pozostają otwarte, ponieważ nie wdrożono jeszcze prywatnego skanera malware,
pełnego monitoringu ani pozostałych schedulerów; nie wykonano też restore ani
rollback drill.

**Korekta lokalna 2026-08-25:** akcja „Użyj innego adresu” na ekranie po
rejestracji zeruje stan formularza przez ponowne załadowanie trasy; nie jest już
linkiem klientowym do tej samej trasy, który pozostawiał ekran potwierdzenia.

- [ ] Wybrać hosting, region Supabase, provider e-mail, domeny, prywatny ClamAV,
      CDN/WAF, Turnstile i monitoring.
- [ ] Utworzyć odseparowane local/preview/staging/production z osobnymi
      sekretami, bazą, Storage i providerami.
- [ ] Zbudować immutable pipeline migracja → deploy → smoke → obserwacja.
- [ ] Uruchomić schedulery powiadomień, retencji, analytics purge i webhooków.
- [ ] Zweryfikować health, readiness, CSP, CORS, cookies, OAuth i noindex.

#### Podetap FTZ-04 — scheduler i alarmy aplikacyjnego outboxu

**Stan produkcyjny 2026-08-11:** ADR-042, pięciominutowy Vercel Cron,
odseparowane uwierzytelnienie GET/POST, prywatny heartbeat, agregowany probe i
testy są wdrożone. Sekrety Production są rozdzielone, dwa cykle heartbeat
zostały potwierdzone, a syntetyczny alert firmy został dostarczony dokładnie
raz. FTZ-04 pozostaje otwarte wyłącznie przez brak niezależnego monitora z
ustalonym ownerem i przećwiczonym alarmem 503 → recovery. Konto działa jako Pro
Trial; utrzymanie cyklu wymaga Pro/Enterprise albo zatwierdzonego schedulera
zastępczego.

- [x] Zapisać ADR-042 i rollback bez usuwania kolejek.
- [x] Dodać GET dla Vercel Cron z osobnym sekretem i zachować ręczny POST.
- [x] Zapisać heartbeat bez PII i narrow RPC wyłącznie dla service role.
- [x] Dodać chroniony probe schedulera, wieku kolejki, stale lock i `failed`.
- [x] Pokryć unit, route, granty i RLS przypadkami negatywnymi.
- [x] Wdrożyć migrację i release na jednym immutable SHA.
- [x] Ustawić odrębne sekrety Production i potwierdzić dwa cykle heartbeat.
- [ ] Podłączyć niezależny alert, ownera/kanał i przećwiczyć 503 → recovery.
- [x] Skonfigurować ograniczony klucz Resend i wykonać syntetyczną dostawę.

### Etap 13B — bezpieczeństwo, prawo i operacje

- [ ] Wdrożyć rozproszony rate limit per IP/origin, adaptacyjny Turnstile
      i produkcyjny ClamAV fail-closed.
- [ ] Zatwierdzić DPA, SCC/TIA, regiony, subprocesorów, okresy retencji,
      regulamin, privacy, cookies i kanał DSAR.
- [ ] Wskazać support, privacy i security incident ownerów oraz przećwiczyć
      runbooki.
- [ ] Wykonać log-redaction, zdalne skany, staging DAST, ręczny VoiceOver/NVDA,
      realne klienty e-mail i reprezentatywne hosty WordPress.

#### Podetap FTZ-03A — origin allowlist i rozproszony limiter

**Stan lokalny 2026-08-10:** podetap ukończony w kodzie i testach. Nie zamyka
łącznej pozycji 13B; FTZ-03B jest już lokalnie zamknięte, lecz produkcyjny
ClamAV pozostaje otwarty. Przed ruchem rzeczywistym migracja, sekret limitera,
Turnstile i smoke nadal wymagają wdrożenia na docelowym środowisku.
release aplikacji i smoke nadal wymagają wdrożenia na docelowym środowisku.

- [x] Zapisać ADR-040 i rollback dla serwerowej bramy publicznego API.
- [x] Zastąpić wildcard dokładnym tenantowym CORS z `Vary: Origin`.
- [x] Dodać atomowy limiter PostgreSQL per IP/origin/flow/session/org oraz
      operację, bez surowego IP i z `Retry-After`.
- [x] Odebrać `anon`/`authenticated` bezpośrednie RPC formularza i dopuścić
      wyłącznie serwerową ścieżkę po pozytywnym guardzie.
- [x] Dodać panel Owner/Admin do konfiguracji maksymalnie 10 originów procesu,
      tenant scope, RLS i audyt.
- [x] Pokryć SQL/TypeScript testami obcy origin, role, bypass RPC, 429,
      niezależny fingerprint, fail-closed IP i brak wildcardu.
- [x] FTZ-03B: wdrożyć adaptacyjny Turnstile i test retry/bypass.

#### Podetap FTZ-03B — adaptacyjny Turnstile

**Stan lokalny 2026-08-10:** implementacja i gate lokalny ukończone. Nie oznacza
produkcyjnego GO: brakuje utworzenia managed widgetu Cloudflare, hostów
`app.kwotum.pl` i Fortez, osobnych sekretów środowisk, prawnego zatwierdzenia
dostawcy oraz smoke na rzeczywistym embedzie.
**Stan 2026-08-10:** implementacja i gate lokalny ukończone. Managed widget
Cloudflare obejmuje dokładne hosty `app.kwotum.pl`, `fortez-przyczepy.pl` i
`www.fortez-przyczepy.pl`, a site key i sekret mają w Vercel zakres wyłącznie
Production. Nie oznacza to produkcyjnego GO: nadal brakuje wdrożenia release'u,
CSP Fortez, prawnego zatwierdzenia dostawcy i smoke na rzeczywistym embedzie.

- [x] Zapisać ADR-041 z fail-closed, rollbackiem i fallbackiem starego kanału.
- [x] Dodać publiczny runtime config bez zapisu site key w snapshotcie procesu.
- [x] Wykonać explicit/adaptive challenge dopiero przy finalnym submit po uploadzie.
- [x] Wymusić Siteverify przed RPC oraz sprawdzić action, hostname i świeżość.
- [x] Dodać timeout, bounded retry, idempotency key i brak logowania tokenu/IP.
- [x] Pokryć brak tokenu, replay, host/action mismatch, expiry, outage i retry.
- [x] Przejść Playwright mobile/desktop, axe, overflow i świeży token po retry.
- [ ] Skonfigurować Cloudflare/Vercel, CSP Fortez i wykonać produkcyjny smoke.
- [x] Skonfigurować managed widget Cloudflare i klucze Vercel Production only.
- [ ] Wdrożyć release, zaktualizować CSP Fortez i wykonać produkcyjny smoke.

### Etap 13C — rehearsal i release candidate

- [ ] Zamrozić release candidate na SHA i uruchomić pełny release gate.
- [ ] Przeprowadzić migrację stagingową, backup restore drill i walidację
      rekordów oraz plików.
- [ ] Przećwiczyć rollback aplikacji i migrację naprawczą.
- [ ] Sprawdzić alerty, e-mail, webhook, purge, upload, Google OAuth, DNS/TLS,
      canonical, sitemap, robots i noindex.
- [ ] Zebrać udokumentowane approval Product/Engineering/Security/Legal/Ops.

### Etap 13D — kontrolowany pilot produkcyjny

#### Podetap FTZ-05 — publiczna treść procesu Fortez

**Stan 2026-08-11:** wersja 2 procesu „Dobór przyczepy Neptun” jest opublikowana
z poprawnym tytułem i wprowadzeniem. Hotfix granicy PostgREST/RPC normalizujący
`null` z przycisku „Pomiń” został wdrożony i potwierdzony syntetycznym submitem.
Lead powstał, a dokładnie jeden alert firmy został dostarczony przez Resend.
UAT ujawnił następnie błąd prezentacji: brief i panel pokazywały techniczne
klucze opcji. Etap 13E zachowuje te klucze dla logiki, dodaje historyczną
projekcję etykiet oraz wersjonowany biały renderer e-mail v2. Migracja
`20260811000300` i release `c74f38e28d20775c7dfa5b6730eb0d5336d48aef`
zostały wdrożone 2026-08-11. Istniejący lead pokazuje komplet dziewięciu
czytelnych odpowiedzi bez `opcja_`, produkcyjne `/health` i `/ready` zwracają
HTTP 200, a pierwszy wznowiony cykl cron zakończył się powodzeniem przy pustych
kolejkach. Zakończonego alertu UAT nie wysłano ponownie.

##### Korekta FTZ-05R — wiarygodny status resume i odporność storage

- [x] Oddzielić wynik API resume/create od lokalnego storage i analityki.
- [x] Przywracać `active + synced` po poprawnym resume aktualnego snapshotu,
      także gdy zapis hosta albo wysłanie eventu analytics zawiedzie.
- [x] Zachować `active + offline` i lokalne odpowiedzi przy rzeczywistym
      błędzie sieci podczas resume.
- [x] Dodać best-effort `localStorage` z pamięciowym fallbackiem bieżącej karty
      oraz bezpiecznym `clear/load/save` bez surowych wyjątków.
- [x] Zapisywać idempotentnie, pomijając zmianę obejmującą wyłącznie `savedAt`.
- [x] Wyłączyć automatyczną reakcję na cross-tab `storage`; pilotaż wspiera
      jedną aktywną kartę na sesję, a synchronizacja wielu kart wymaga osobnego
      protokołu i pozostaje poza tym etapem.
- [x] Po zdarzeniu `online` ponowić deduplikowane resume albo pierwszy create w
      tej samej instancji kontrolera, po zakończeniu trwającej inicjalizacji;
      ponawialny błąd sieci zachowuje snapshot, a 404/410 z endpointu głównej
      sesji (`resume`, `save`, `result`, `upload` lub `submit`) usuwa wygasły
      token, dane kontaktowe i zgody.
- [x] Zapamiętać wejściowy `publicId`, aby retry działał także po pierwszym
      nieudanym utworzeniu sesji.
- [x] Chronić initial resume i reconnect przed przestarzałą odpowiedzią po
      nowszym answer/back/submit oraz serializować retry create z restartem.
- [x] Przypisać flush do właściciela sesji, aby wiszący zapis wygasłej sesji nie
      blokował zapisu nowej ani nie zmieniał jej statusu; po submit zwalniać
      pamięciowy draft kontaktu i referencje do plików.
- [x] Serializować przeciwstawne decyzje analytics i nie pozwalać staremu
      eventowi usunąć pierwszego eventu ponownie uruchomionej sesji.
- [x] Dodać unit dla quota, analytics, resume 200, prawdziwej awarii sieci,
      serialnego online retry podczas initial resume/create, 404/410, braku
      reakcji na `storage` podczas submitu, wyścigów stale resume/create/submit
      oraz E2E produkcyjnego buildu dla reload/resume.
- [ ] Przed szerszym rolloutem dodać jawne uzgodnienie odroczonego 404/410,
      które wróciło równolegle z submit, jeśli sam submit następnie zawiedzie.
- [ ] Przed szerszym rolloutem dodać ograniczone czasowo `AbortSignal` dla
      requestów initialize/reconnect, aby uszkodzony transport nie wisiał bez
      końca.
- [ ] Przed szerszym rolloutem dodać anulowanie/generację lifecycle dla
      nietypowego detach/reattach custom elementu; nie blokuje to statycznego
      embedu pilota Fortez.

**Stan lokalny 2026-08-11 — CODE COMPLETE, RELEASE OPEN:** logi produkcyjne
potwierdziły `OPTIONS 204` i `GET 200 /sessions/current`, gdy Safari pokazało
status offline. Potwierdzoną przyczyną w kodzie było odziedziczenie `offline`
ustawionego przed resume; przy pustej kolejce nic nie przełączało go później na
`synced`. Osobna seria kilkudziesięciu `GET 200` co około 0,5–0,9 s jest
wyłącznie dowodem obserwacyjnym i nie potwierdzono, że źródłem był widget.
Korekta nie próbuje scalać stanu wielu kart: widget nie nasłuchuje `storage`, a
kontrakt pilota wymaga jednej aktywnej karty na sesję. Nie zmieniono API, modelu
danych, tenant scope ani schematu lub zakresu danych telemetrii. Lokalnie
przeszły format, lint i typecheck całego monorepo, 22 zadania unit (w tym 66 testów
widgetu), build 16/16, SAST, secret scan oraz 5/5 testów Chromium widgetu.
Jednorazowy adekwatny przebieg WebKit również zakończył się wynikiem 5/5;
tymczasowa konfiguracja i wygenerowane screenshoty nie należą do zmiany.
Callbacki `error`, `expired`, `timeout` i `unsupported` Turnstile mają testy
jednostkowe; realny timeout lub niedostępność ładowania zewnętrznego skryptu
pozostają osobnym gate przed szerszym rolloutem.
Wdrożenie wymaga review, zielonego CI i osobnego release'u; ten lokalny etap nie
zmienia produkcji.

##### Korekta FTZ-05B — branding wnętrza embedu Fortez

**Stan lokalny 2026-08-11 — CODE COMPLETE, RELEASE OPEN:** produkcyjny UAT
ujawnił, że dotychczasowy kontrakt obejmował tylko launcher. Wnętrze pokazywało
inicjały tytułu procesu, domyślny zielony motyw Kwotum i tekstowy przycisk
zamknięcia nachodzący na status. ADR-044 wprowadza ograniczony kontrakt
atrybutów marki i ról `--wyceno-widget-*` bez zmiany API, manifestu, bazy, RLS
ani sesji. Lokalny preset Fortez używa własnego logo z tego samego originu,
lżejsze nagłówki Arial/Helvetica o wadze 500, aktualny pomarańcz z kontrastowym
ciemnym tekstem, kanciaste kontrolki i grafitowy backdrop.

- [x] Zapisać ADR-044 i granicę między konfiguracją embedu a przyszłym
      brandingiem przechowywanym w panelu.
- [x] Dodać bezpieczne `brand-name`, `brand-subtitle` i `brand-logo-url` z
      same-origin HTTP(S), fallbackiem inicjałów i bez restartu sesji.
- [x] Udostępnić wyłącznie allowlistowane role wnętrza, zachowując izolację
      Shadow DOM oraz domyślne wartości Kwotum.
- [x] Umieścić kwadratowe zamknięcie `×` strukturalnie w nagłówku obok statusu.
- [x] Dodać negatywne testy URL/XSS, hostile-host CSS, computed styles,
      odrzucenie `url(...)` w rolach kolorów, zachowanie niewysłanej odpowiedzi
      i fokusu po zmianie marki, geometrię nagłówka, Escape i zwrot fokusu.
- [x] Przygotować lokalny preset Fortez i artefakt Chromium desktop bez danych
      osobowych ani wysłania leada.
- [x] Przejść automatyczny Chromium i WebKit/Safari, mobile 390/320,
      forced-colors, pełne gate'y i niezależny review bez P0/P1.
- [ ] Potwierdzić ręczny zoom przeglądarki 200% na produkcyjnym embedzie; test
      320 px i powiększenie bazowego tekstu są zielone, ale nie zastępują
      rzeczywistego zoomu Safari.
- [ ] Wdrożyć wersję Kwotum, następnie minimalną zmianę `index.html` Fortez,
      wykonać produkcyjny UAT i zachować natychmiastowy rollback.

##### Korekta FTZ-05C — czytelna ścieżka inline Fortez

**Stan lokalny 2026-08-13 — GOTOWE DO WDROŻENIA:** feedback z produkcyjnego
embedu pokazał, że użytkownik nie widzi związku między wyborem odpowiedzi a
odległą akcją „Dalej”. Wysokość pełnoekranowej karty zostawiała dużą pustą
przestrzeń, a pasek porównania zasłaniał dół aktywnego formularza. Zakres nie
zmienia procesu, API, sesji, tenant scope ani danych leada.

- [x] Zablokować załącznik 3338 × 1962 i SHA-256
      `237a48fd339ae123fae6677348b84bf3362a4a727fe530951290a777c3401266`
      jako referencję problemu.
- [x] Nadać jawnemu `inline-layout="compact"` naturalną wysokość i przenieść
      akcję bezpośrednio pod odpowiedzi bez zmiany popupu/fullscreen/hosted.
- [x] Dodać jawne prowadzenie: liczba pytań, stan wymaganej odpowiedzi,
      potwierdzenie gotowości oraz wizualna zapowiedź następnego kroku.
- [x] Zachować ręczne zatwierdzenie zamiast ryzykownego auto-advance.
- [x] Przejść E2E desktop/mobile, axe, overflow, pełny gate i visual QA:
      68 testów widgetu, 183 testy web, Chromium 1440/390, axe, build,
      format, lint, typecheck oraz skany SAST/secrets są zielone.
- [x] Wdrożyć widget przed zmianą strony Fortez, sprawdzić produkcję i rollback.

##### Korekta FTZ-05D — zintegrowana ciemna powierzchnia Fortez

**Stan lokalny 2026-08-13 — CODE COMPLETE, RELEASE OPEN:** kolejny feedback z
produkcyjnej sekcji pokazał, że mimo poprawnej ścieżki biały panel nadal
wyglądał jak obca aplikacja wklejona na grafitowe tło. Zakres dotyczy wyłącznie
prezentacji inline; nie zmienia procesu, API, sesji, danych leada ani hosted
linku.

- [x] Zablokować produkcyjny załącznik 3338 × 1962 i SHA-256
      `237a48fd339ae123fae6677348b84bf3362a4a727fe530951290a777c3401266`
      jako stan `before`.
- [x] Dodać jawny `inline-layout="integrated"` bez karty, powtórzonego logo i
      drugiego wprowadzenia, zachowując status zapisu oraz progress.
- [x] Przenieść opcjonalną zgodę analityczną za aktywne pytanie w DOM i
      wizualnie, bez zmiany jej znaczenia lub endpointu.
- [x] Dodać ciemny, kontrastowy preset Fortez z kanciastymi kontrolkami,
      pomarańczowym stanem wyboru i pełnym widokiem mobile.
- [x] Pokryć wariant testem unit, Chromium 1440/390, axe i overflow; domyślny
      inline, compact, popup, fullscreen i hosted pozostają bez zmian.
- [ ] Przejść pełny gate, wdrożyć Kwotum przed minimalnym `index.html` Fortez,
      wykonać produkcyjny UAT i zachować rollback.

- [x] Ujawnić publiczny tytuł i wprowadzenie w builderze z limitami schematu.
- [x] Rozdzielić walidację treści formularza od walidacji aktywnego pytania.
- [x] Dodać regresję autosave/reload, klawiatury, axe, mobile i overflow.
- [x] Wdrożyć hotfix treści, ustawić poprawne dane Fortez i opublikować wersję 2.
- [x] Wdrożyć i zweryfikować hotfix „Pomiń” dla pól opcjonalnych.
- [x] Wykonać syntetyczny submit, potwierdzić lead i dostawę alertu firmy.
- [x] Wdrożyć Etap 13E, potwierdzić czytelne etykiety w istniejącym leadzie i
      renderer e-mail v2 bez ponownej wysyłki zakończonego alertu UAT.
- [x] Dodać jawne `api-base` do generowanego embedu i konektora WordPress oraz
      pokryć inline, popup, fullscreen, hosted link, shortcode i blok Gutenberg
      testami regresji bez ujawnienia credentialu.
- [x] Przygotować i lokalnie zweryfikować lazy initialization popup/fullscreen,
      kompatybilny fallback `api-base` oraz ograniczony on-brand kontrakt
      launchera bez zmiany wnętrza procesu; wdrożenie release'u nadal
      poprzedza embed Fortez.
- [x] Osadzić popup na stronie Fortez po technicznym i prawnym GO; stary kanał
      kontaktu pozostaje dostępny.

- [ ] Uruchomić jedną organizację z ograniczonym ruchem i możliwością
      natychmiastowego wyłączenia embedu.
- [ ] Zachować równoległy dotychczasowy kanał kontaktu i zapewnić hypercare.
- [ ] Monitorować submit, błędy, kolejki, odchylenie estymacji, jakość leadów
      i reklamacje dotyczące wyniku.
- [ ] Wykonać review pilota i jawny go/no-go przed kolejnym tenantem.

**Gate:** wszystkie pozycje `RELEASE_CHECKLIST.md` mają dowód, ownera, datę
i approval; nazwa i domeny są zatwierdzone, restore i rollback przećwiczone,
a gotowość operacyjna została potwierdzona na immutable release candidate.

### Incydent produkcyjny 2026-08-27 — drift aplikacja/baza

**Stan:** diagnoza ukończona, dostęp do Vercela i Supabase potwierdzony, trwała
poprawka pakowania `sharp` jest wdrożona na produkcji w deploymentcie
`CzdRVPxUhMLtS1e8MtjZe2X11R3K` z commita `2e19fcc`. Produkcyjny gate potwierdził
binding i `libvips` dla Linux x64, rzeczywistą konwersję WebP oraz poprawne
zakończenie `Deploying outputs`. Produkcyjna aplikacja i baza używają teraz
tego samego kontraktu PX2–PX6 oraz dashboard RPC: sześć migracji
`20260825000100`–`20260826000100` wdrożono w kolejności, a zdalna historia
kończy się na `20260826000100`.

Przed migracją utworzono darmowy logiczny backup Supabase CLI poza
repozytorium. Role, schemat, dane, historię migracji i osobny dump
`public`/`app_private` zaszyfrowano AES-256, klucz zapisano w pęku kluczy macOS,
a integralność plików potwierdzono SHA-256. Odtworzenie zakresu aplikacyjnego
na izolowanym lokalnym Supabase przeszło: 37 tabel, 91 relacji aplikacyjnych,
123 ograniczenia `CHECK`, 3 organizacje, 3 procesy i 4 leady. Pełny dump
platformowy pozostaje zachowany, ale restore zarządzanego Auth nie przeszedł
na starszym lokalnym obrazie z powodu różnicy wewnętrznego schematu Supabase;
Storage object bytes nie są częścią logicznego `db dump`.

- [x] Sprawdzić publiczne health/readiness, marketing i runtime smoke.
- [x] Porównać produkcyjny schemat i historię migracji z repozytorium.
- [x] Powiązać brakujące tabele, kolumny i RPC z błędami panelu oraz widgetu.
- [x] Usunąć zdublowany scenariusz phone-first bez zmiany logiki produktu.
- [x] Przejść format, lint, typecheck, unit, build i pełny PostgreSQL/RLS.
- [x] Przećwiczyć lokalny upgrade z bazowego schematu produkcji przez wszystkie
      sześć migracji; wszystkie zastosowały się bez błędu i utworzyły wymagane
      obiekty.
- [x] Zweryfikować w Vercelu bieżący deployment oraz zgodny ze schematem
      artefakt rollbacku `FkegdvQ9fFfJyJsR9oUQiSg944Vs` (`20bed40`). Rollback
      przygotowano, ale anulowano zgodnie z decyzją o naprawie bieżącej wersji.
- [x] Usunąć top-level import `sharp` z tras panelu i rozdzielić odczyt
      biblioteki mediów od ścieżki uploadu.
- [x] Dodać zawężone `outputFileTracingIncludes` dla natywnych pakietów
      `sharp`/`libvips` oraz gate wykonujący realną konwersję z artefaktu
      standalone. Edytor i ustawienia mają w trace zero plików `sharp`.
- [x] Utworzyć darmowy, szyfrowany logiczny backup zakresu aplikacyjnego i
      wykonać izolowany restore drill oraz rehearsal sześciu migracji na
      odtworzonych danych produkcyjnych.
- [!] Supabase Free nadal nie zapewnia PITR, a pełny disaster-recovery drill
  zarządzanego Auth i obiektów Storage pozostaje otwarty; logiczny backup
  chroni zakres dotknięty tymi expand-only migracjami, nie całą platformę.
- [x] Wdrożyć poprawkę artefaktu na Linux/Vercel. Po promocji health/readiness,
      15 stałych stron publicznych i wszystkie stałe trasy panelu bez sesji
      przeszły smoke bez 500/503; świeże logi nie zawierają `libvips` ani
      `ERR_DLOPEN_FAILED`.
- [ ] Po uzyskaniu uwierzytelnionej sesji wykonać niedestrukcyjny smoke edytora,
      ustawień i uploadu syntetycznego obrazu; buildowy test artefaktu pokrywa
      natywną konwersję, ale nie zastępuje produkcyjnej autoryzacji i Storage.
- [x] Zastosować sześć migracji na produkcji i potwierdzić historię, nowe
      tabele, kolumny i dashboard RPC oraz health/readiness bez nowych 500/503.
- [ ] Wykonać uwierzytelniony smoke panelu oraz syntetyczną pełną ścieżkę
      widgetu; nie jest to zastępowane przez testy tras bez sesji.

### Korekta UI-A1 2026-08-27 — wyróżniająca główna akcja Kwotum

**Stan:** IMPLEMENTED LOCALLY, RELEASE OPEN. Wspólny system przycisków otrzymał
osobne tokeny akcji: szmaragd `#0B684A`, hover `#07543C`, granicę `#075139` i
promień 14 px. Zmiana obejmuje panel, publiczny header, wspólne CTA marketingu
oraz aktywne hero pięciu głównych tras; nie rozszerza geometrii na pola, karty,
statusy, ikony, destrukcyjne akcje ani tenantowy widget. Test tokenów potwierdza
WCAG AA, a rzeczywisty landing i `/design-system` potwierdzają finalną kaskadę,
44–64 px wysokości oraz 0 px overflow na desktopie i mobile. Analiza, rollback
i dowody: `docs/ui/KWOTUM_ACTION_SYSTEM_2026-08-27.md` oraz
`artifacts/visual-qa/kwotum-action-v1/`.

- [x] Porównać aktywne style panelu i marketingu oraz wskazać nadpisania CSS.
- [x] Wybrać osobny kolor akcji z kontrastem co najmniej 4,5:1.
- [x] Dodać `action`, `action-hover`, `action-border` i `radius-action` w
      `packages/ui` bez zmiany tokenów pól i kart.
- [x] Podłączyć wspólny komponent, header, wspólne CTA i aktywne hero.
- [x] Zachować hover, focus, forced colors, reduced motion i cele dotykowe.
- [x] Wykonać porównanie 1440 × 900, mobile 390 × 844 i showcase komponentu.
- [x] Przejść pełny format, lint, typecheck, unit i build; RLS, WordPress i
      secret scan także są zielone. Globalny SAST pozostaje czerwony przez
      wcześniejszą supresję ESLint poza zakresem tej korekty.
- [ ] Wdrożyć immutable release i wykonać produkcyjny smoke CTA.
