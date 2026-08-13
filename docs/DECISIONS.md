# Rejestr decyzji

## ADR-001: Modularny monolit w monorepo

**Status:** accepted, wdrożone w Etapie 1
**Decyzja:** pnpm + Turborepo; Next.js jako web/API, wydzielony widget i pakiety domenowe.
**Dlaczego:** jedna mała ekipa potrzebuje szybkich zmian i transakcyjnej spójności; granice pakietów zachowują drogę do wydzielenia.
**Konsekwencje:** trzeba pilnować zależności i nie tworzyć „shared” bez właściciela.

## ADR-002: PostgreSQL/Supabase i RLS

**Status:** accepted, wdrożone w Etapie 3; ponownie zatwierdzone w audycie
produkcyjnym 2026-07-31
**Decyzja:** pozostajemy przy Supabase PostgreSQL, Auth i prywatnym Storage.
RLS jest niezależną warstwą tenant isolation. Staging i production używają
osobnych projektów w regionie UE; nie budujemy własnego Auth, Storage ani
zarządzanego samodzielnie PostgreSQL przed pierwszymi klientami.
**Dlaczego:** polityki PostgreSQL chronią dane także wtedy, gdy warstwa aplikacji
ma błąd scope’u. Test integracyjny uruchamia migrację na świeżej instancji
PostgreSQL i sprawdza dwa tenanty, role oraz prywatne pliki.
**Konsekwencje:** polityki RLS i testy stają się częścią każdej domeny; service
role jest ograniczony do jawnych zadań administracyjnych i nigdy nie obsługuje
zwykłych odczytów panelu.

Zalety dla pierwszych pięciu klientów to mały koszt operacyjny, jeden
transakcyjny model danych, gotowe Auth/Storage, europejski region i RLS blisko
danych. Ryzyka to zależność od API Auth/Storage, format polityk i operacyjne
limity dostawcy. Ograniczamy lock-in przez wersjonowane migracje SQL, standardowy
PostgreSQL, adaptery Supabase zamknięte w `apps/web/lib/supabase`, prywatny
eksport danych, logiczne backupy poza dostawcą i brak logiki biznesowej w
triggerach zależnych od nieprzenośnych rozszerzeń.

Migrację platformy rozważamy dopiero po potwierdzonym problemie, którego nie
rozwiązuje korekta RLS/grantów, ograniczenie service role, zmiana planu/regionu
albo adaptera. Przesłanką może być niespełnialne wymaganie regulacyjne,
powtarzalne naruszenie zatwierdzonego RPO/RTO, brak wymaganej izolacji lub
udokumentowany koszt/skala przekraczające możliwości platformy. Migracja wymaga
osobnego ADR, planu eksportu Auth/DB/Storage, testów tenant isolation i restore
drill; nie jest domyślną reakcją na błąd konfiguracji.

## ADR-003: Niezmienne wersje opublikowane

**Status:** accepted jako wymaganie produktu
**Decyzja:** publikacja tworzy immutable snapshot; lead wskazuje snapshot.
**Konsekwencje:** edycja draftu nie zmienia aktywnej sesji ani historii.

## ADR-004: Ograniczone reguły zamiast kodu

**Status:** accepted
**Decyzja:** pricing, scoring i warunki są deklaratywnym AST, nie dowolnym JavaScriptem.
**Konsekwencje:** bezpieczniejsza walidacja, explainability i deterministyczne testy kosztem mniejszej dowolności.

## ADR-005: Widget jako web component z izolacją

**Status:** accepted; wybór renderera doprecyzowany przez ADR-015
**Decyzja:** custom element + Shadow DOM, lazy loader, osobny bundle.
**Konsekwencje:** potrzebne testy host CSS/CSP, resize i accessibility.

## ADR-006: Paleta jest hipotezą

**Status:** proposed
**Decyzja:** użyć roboczej palety z master promptu dopiero po audycie kontrastu i skojarzeń w Etapie 2.
**Konsekwencje:** brak publicznego brandingu przed zatwierdzeniem.

## ADR-007: „Wyceno” pozostaje working title

**Status:** superseded przez ADR-024
**Decyzja:** nazwa może występować w dokumentacji i kodzie roboczym, ale nie jest uznana za prawnie bezpieczną.
**Konsekwencje:** launch, zakup kampanii i rejestracja kluczowych domen wymagają profesjonalnego clearance.

## ADR-008: Przypięty toolchain LTS

**Status:** accepted
**Decyzja:** produkcyjny i skryptowy runtime to Node 24.18.0 LTS; pnpm 11.17.0 pobiera go przez `devEngines.runtime`. Next.js 16.2.11 Active LTS, TypeScript 6.0.3 i ESLint 9.39.5 są przypięte dokładnie.
**Dlaczego:** najnowsze TypeScript 7 i ESLint 10 nie spełniają jeszcze peer dependencies toolingu Next.js. Node 26 pozostaje linią Current do października 2026.
**Konsekwencje:** aktualizacje głównych wersji wymagają osobnego compatibility review.

## ADR-009: Rygorystyczny supply chain pnpm

**Status:** accepted; zaostrzona w Etapie 12ZD 2026-08-09
**Decyzja:** exact versions, frozen lockfile, siedmiodniowy
`minimumReleaseAge`, `trustPolicy: no-downgrade`, blokada egzotycznych zależności
tranzytywnych, strict peers i jawna allowlista lifecycle scripts. Dopuszczone
są tylko `sharp` i `unrs-resolver`. Wyjątki od wieku wydania są ograniczone do
zweryfikowanych poprawek bezpieczeństwa `nanoid@3.3.17` i `postcss@8.5.26`.
Wyjątki od polityki pochodzenia są ograniczone do istniejących wersji
`eslint-import-resolver-typescript@3.10.1` i `semver@6.3.1`; nie obejmują
przyszłych wersji tych paczek.
**Konsekwencje:** nowy lifecycle script, młoda wersja, regresja pochodzenia albo
egzotyczna paczka tranzytywna celowo zatrzymuje instalację. Każdy wyjątek
wymaga dokładnej wersji, przeglądu i wpisu w `docs/DEPENDENCIES.md`. Dependabot
ma siedmiodniowy cooldown zwykłych aktualizacji; aktualizacje bezpieczeństwa
nie są przez niego opóźniane. Nie używamy `dangerouslyAllowAllBuilds` ani
`trustLockfile: true`.

## ADR-010: Typed Routes odroczone

**Status:** accepted
**Decyzja:** nie włączać `typedRoutes` w Etapie 1. Next.js 16.2.11 generuje `JSX.Element` niezgodne z aktualnymi typami React 19 podczas builda bez tras UI.
**Konsekwencje:** nie dodajemy globalnego shimowania JSX ani `skipLibCheck`. Funkcję ocenić ponownie w Etapie 2 po poprawce upstream lub przy pierwszych trasach.

## ADR-011: Własna dostępna warstwa UI i zatwierdzona paleta

**Status:** accepted, wdrożone w Etapie 2
**Decyzja:** utrzymywać małą, własną warstwę komponentów w `@wyceno/ui`,
opartą na semantycznym HTML i natywnym `<dialog>`. Zatwierdzić jasną paletę z
ciemną zielenią dla CTA, jasną zielenią wyłącznie jako wyróżnikiem oraz
ciemniejszymi kolorami komunikatów.
**Dlaczego:** pozwala zachować własny język wizualny, kontrolować bundle i
dostępność bez kopiowania domyślnego wyglądu biblioteki. Automatyczne testy
potwierdzają kontrast, klawiaturę, axe i reduced motion.
**Konsekwencje:** bardziej złożone prymitywy mogą wymagać przyszłej,
udokumentowanej zależności accessibility; tokeny nie mogą powstawać lokalnie,
a visual baseline jest częścią kontraktu.

## ADR-012: Supabase Auth SSR z cookies i PKCE

**Status:** accepted, wdrożone w Etapie 3
**Decyzja:** panel używa `@supabase/ssr`, publishable key, serwerowych cookies i
callbacku PKCE. `proxy.ts` odświeża sesję dla tras auth/panelu, a prywatne
odpowiedzi mają `Cache-Control: private, no-store`.
**Dlaczego:** sesja jest dostępna w Server Components i Route Handlers bez
udostępniania sekretu serwisowego. Weryfikacja `getUser()` nie ufa wyłącznie
niezweryfikowanej zawartości cookie.
**Konsekwencje:** zmienne `NEXT_PUBLIC_SUPABASE_URL` i publishable key są
wymagane w działającym środowisku. Trasy panelu pozostają dynamiczne i nie mogą
używać ISR ani publicznego cache.

## ADR-013: Wąski patch typów WebAuthn w Supabase Auth

**Status:** accepted tymczasowo
**Decyzja:** przypięty `@supabase/auth-js@2.110.8` otrzymuje wersjonowany patch,
który wyłącza odziedziczoną metodę `toJSON` z bazowego
`PublicKeyCredential`, zanim pakiet zadeklaruje jej precyzyjny typ generyczny.
**Dlaczego:** deklaracja upstream koliduje z DOM TypeScript 6.0.3.
Nie wyłączamy `skipLibCheck`, `exactOptionalPropertyTypes` ani innych kontroli.
**Konsekwencje:** przy każdej aktualizacji Supabase trzeba sprawdzić, czy patch
jest nadal potrzebny, i usunąć go natychmiast po wydaniu poprawki upstream.

## ADR-014: Draft jako agregat JSONB i podwójna walidacja publikacji

**Status:** accepted, wdrożone w Etapie 4
**Decyzja:** edytowalny flow v1 jest ograniczonym, wersjonowanym dokumentem
JSONB. Publikacja zapisuje niezmienny snapshot i hash SHA-256. Ten sam kontrakt
grafu jest walidowany w TypeScript oraz niezależnie w PostgreSQL przed zapisem
wersji.
**Dlaczego:** flow jest małym agregatem (maksymalnie 40 kroków), który podczas
edycji i publikacji musi być spójny jako całość. JSONB upraszcza atomowy zapis,
klonowanie szablonów i immutable snapshot. Walidacja wyłącznie w aplikacji
pozwoliłaby ominąć kontrolę przez bezpośrednie RPC.
**Konsekwencje:** zapytania analityczne nie czytają surowego draftu; dostaną
osobne eventy/agregaty. Zmiana schematu wymaga nowego `schemaVersion` i
migratora. Limity dokumentu są kontrolą bezpieczeństwa, a nie ustawieniem
planu. Publiczny manifest powstanie dopiero w Etapie 5.

## ADR-015: Natywny Web Component i jawny manifest widgetu v1

**Status:** accepted, wdrożone w Etapie 5
**Decyzja:** widget v1 jest natywnym custom elementem z Shadow DOM, bez
frameworka runtime. Mały loader rejestruje element idempotentnie, a renderer
jest ładowany jako osobny moduł tylko wtedy, gdy element występuje na stronie.
Hosted link używa tego samego custom elementu. Publiczny manifest jest nowym,
allowlistowanym kontraktem zbudowanym z immutable snapshotu: zawiera wyłącznie
treści prezentacyjne, typy pól i reguły nawigacji potrzebne do przejścia
procesu. Nie zawiera tenant ID, draftu, nazw wewnętrznych, pricingu, scoringu,
integracji ani danych innych sesji.

**Dlaczego:** natywna implementacja pokrywa obecny, ograniczony zestaw kontrolek
bez kosztu React/Preact w bundle i zachowuje izolację od strony gospodarza.
Jawna projekcja manifestu zapobiega przypadkowemu zwróceniu nowych prywatnych
pól po rozbudowie snapshotu. Nawigacja musi działać także po chwilowej utracie
sieci, dlatego bezpieczne reguły przejścia są częścią manifestu; określenie
„reguły wewnętrzne” w architekturze oznacza od Etapu 5 pricing, scoring i
operacyjne reguły backendu, a nie konieczne przejścia formularza.

**Konsekwencje:** każdy nowy typ pola wymaga implementacji i testu w rendererze
oraz aktualizacji allowlisty. Treści są renderowane przez `textContent`, bez
HTML użytkownika. Token sesji nie jest emitowany do hosta ani zapisywany w URL,
a baza przechowuje wyłącznie jego SHA-256. Framework można dodać dopiero po
pomiarze, który wykaże realną korzyść większą niż koszt i ryzyko bundle.

## ADR-016: Deterministyczna estymacja na przypiętym snapshotcie

**Status:** accepted dla Etapu 6
**Decyzja:** konfiguracja estymacji jest opcjonalnym, wstecznie kompatybilnym
rozszerzeniem dokumentu flow v1 z własnym `estimationSchemaVersion: 1`. Pricing
i scoring używają wspólnego, ograniczonego AST warunków. Reguły są wykonywane
w kolejności dokumentu. Kwoty i wyniki pośrednie są liczbami całkowitymi w
minor units, mnożniki są zapisane w basis points, a każde mnożenie i końcowy
przedział stosują jawne zaokrąglenie half-up. PostgreSQL oblicza wynik wyłącznie
z odpowiedzi zapisanych dla sesji i jej immutable `flow_version_id`.

Publiczne API zwraca tylko tryb prezentacji, walutę, surowy przedział oraz
bezpieczne treści wyniku. Formatowanie waluty odbywa się w Route Handlerze
przez `Intl.NumberFormat`. Score, kategoria i lista uruchomionych reguł pozostają
w prywatnym wyniku domenowym i nie trafiają do manifestu ani widgetu.

**Dlaczego:** osobna wersja zagnieżdżonego kontraktu pozwala rozszerzać reguły
bez zmiany istniejącej nawigacji flow v1. Integer arithmetic i jawna kolejność
eliminują zależność od platformy. Ponowne obliczenie przy granicy zaufania
uniemożliwia klientowi podanie własnej ceny lub score.

**Konsekwencje:** każda nowa operacja estymacji wymaga podniesienia
`estimationSchemaVersion`, implementacji parytetowej w TypeScript i PostgreSQL
oraz wspólnych fixture'ów. Publikacja snapshotu z konfiguracją estymacji musi
przejść niezależną walidację PostgreSQL. Etap 7 może utrwalić prywatny wynik
przy tworzeniu leada, ale nie może przyjmować go od klienta.

## ADR-017: Minimalny lead, wersjonowane potwierdzenia i prywatne pliki

**Status:** accepted dla Etapu 7
**Decyzja:** wynik pozostaje widoczny przed formularzem kontaktowym. Minimalny
lead wymaga poprawnego adresu e-mail; imię i telefon są opcjonalne. Submit
wymaga jawnego, niezaznaczonego potwierdzenia skonfigurowanej informacji
prywatności. Zapisujemy jej typ, wersję, SHA-256 treści, czas i źródło. Zgoda
marketingowa e-mail jest zawsze osobna, opcjonalna i domyślnie wyłączona.
Konfiguracja treści jest opcjonalnym, własno-wersjonowanym rozszerzeniem
snapshotu `leadCaptureSchemaVersion: 1`; publiczny manifest otrzymuje tylko
bezpieczne etykiety, wersje, hashe i URL polityki.

Submit jest atomową funkcją PostgreSQL z idempotency key. Pobiera kontakt i
potwierdzenia, ale sam kopiuje odpowiedzi sesji i ponownie oblicza prywatny
pricing/scoring z przypiętego immutable snapshotu. Jedna sesja może utworzyć
tylko jeden lead. Po utworzeniu leada odpowiedzi sesji są niezmienne.

Pliki są opcjonalne: maksymalnie 5 na sesję, każdy do 25 MiB, tylko JPEG, PNG,
WebP albo PDF. Route Handler sprawdza deklarowany MIME, rozszerzenie i magic
bytes, oblicza SHA-256, rezerwuje losową prywatną ścieżkę tenantową, przesyła
plik przez wąski klient service-role i potwierdza rekord dopiero po obecności
obiektu. Publiczny klient nie otrzymuje tenant ID ani dowolnej ścieżki.

Statusy v1 to `new`, `in_progress`, `qualified`, `won`, `lost` i `spam`.
Owner, Admin i Sales mogą czytać leady, dodawać notatki i zmieniać status;
historia jest append-only. Eksport pozostaje niewdrożony do rozstrzygnięcia
uprawnienia Admina.

**Dlaczego:** jest to najmniejszy kontrakt pozwalający skontaktować się w
sprawie zapytania bez wymuszania telefonu i bez łączenia obsługi zapytania z
marketingiem. Serwerowy snapshot wyniku i kopia odpowiedzi chronią historię
przed późniejszą zmianą sesji. Weryfikacja pliku przed Storage ogranicza
polygloty deklarowanego typu i nie polega na nazwie klienta.

**Konsekwencje:** organizacja musi skonfigurować własną, prawnie sprawdzoną
informację prywatności przed włączeniem lead capture. Automatyczna retencja,
DSAR, eksport i antywirus produkcyjny pozostają bramkami przed publicznym
uruchomieniem; brak skanera malware musi być jawnie widoczny w ryzykach.
Service role służy wyłącznie adapterowi prywatnego uploadu i nigdy zwykłym
odczytom panelu. Etap 8 może reagować na zapisany lead, ale Etap 7 nie wysyła
e-maili.

## ADR-018: Transakcyjny outbox i wymienny adapter e-mail

**Status:** accepted dla Etapu 8; dostawca produkcyjny pozostaje warunkowy

**Decyzja:** utworzenie leada w tej samej transakcji dopisuje dwa rekordy
tenantowego outboxu: potwierdzenie dla klienta i alert dla firmy. Pierwszym
odbiorcą firmowym v1 jest najstarszy aktywny Owner organizacji; jego adres jest
utrwalany w rekordzie powiadomienia, aby późniejsza zmiana członkostwa nie
zmieniła adresata historycznego zdarzenia. Unikalność `(lead_id, kind)` chroni
retry submitu przed duplikacją.

Worker pobiera rekordy przez `FOR UPDATE SKIP LOCKED`, nadaje losowy lock token
i zapisuje każdą próbę. Dostawa jest co najmniej jednokrotna; adapter otrzymuje
stabilny klucz idempotencji równy UUID powiadomienia. Retry obejmuje błędy
sieciowe, HTTP 429 i 5xx z ograniczonym backoffem; trwałe 4xx kończą rekord bez
ponawiania. Po pięciu nieudanych próbach status to `failed`.

Szablony HTML/text są wersjonowanym kodem w `@wyceno/email`, renderowanym
wyłącznie z typowanych danych. HTML jest escapowany, nie wykonuje konfiguracji
użytkownika i ma semantyczną strukturę czytelną bez CSS. Test mode używa tego
samego renderera i workera, ale nie wykonuje ruchu sieciowego. Adapter Resend
korzysta bez SDK z `POST /emails` i nagłówka `Idempotency-Key`; jest aktywny
wyłącznie po jawnym `EMAIL_DELIVERY_MODE=resend`, poprawnym `EMAIL_FROM` i
sekrecie. Endpoint workera wymaga osobnego sekretu server-side i nie zwraca ani
nie loguje odbiorców, tematów lub treści.

**Dlaczego:** outbox usuwa lukę między zatwierdzeniem transakcji leada a
zleceniem wiadomości. Stabilny klucz ogranicza duplikaty w nieuniknionym oknie
awarii pomiędzy dostawcą a zapisem statusu. Szablon code-first pozwala
automatycznie testować wersję HTML i text bez dopuszczania dowolnego HTML.

**Konsekwencje:** adresy odbiorców są dodatkową kopią PII chronioną RLS i muszą
podlegać retencji/DSAR. Resend przechowuje metadane konta i API w USA nawet dla
regionu wysyłkowego UE, dlatego jego produkcyjne włączenie wymaga zatwierdzenia
dostawcy, DPA, subprocesorów i transferów. Do tego czasu gate Etapu 8 opiera się
na deterministycznym test mode. Webhooki dostawcy i obsługa bounce/complaint
nie należą do Etapu 8.

## ADR-019: First-party analytics po zgodzie i agregacja z progiem prywatności

**Status:** accepted dla Etapu 9

**Decyzja:** analityka widgetu jest first-party i pozostaje w tenantowym
PostgreSQL. Nie wysyłamy eventów do zewnętrznego trackera. Przed zapisem
jakiegokolwiek eventu sesja musi mieć najnowszy, jawny rekord zgody
`analytics-v1` ze stanem `granted`. Odmowa nie blokuje procesu. Wycofanie zgody
jest równie dostępne jak jej udzielenie, natychmiast usuwa surowe eventy sesji i
blokuje kolejne. Sam rekord decyzji pozostaje jako minimalny dowód techniczny,
bez PII.

Event v1 ma UUID, zamkniętą nazwę, timestamp, przypiętą sesję i wersję flow,
opcjonalny `step_key` oraz niską granularność źródła i urządzenia. Nie przyjmuje
dowolnego metadata JSON, URL, referrera, IP, treści odpowiedzi ani danych
kontaktu. Token sesji jest weryfikowany po SHA-256, event ID zapewnia
idempotencję, a krok musi istnieć w immutable snapshotcie sesji.

Dashboard liczy metryki po stronie PostgreSQL z surowych eventów w wybranym,
maksymalnie 90-dniowym okresie. Wyniki dla mniej niż pięciu różnych sesji są
zastępowane komunikatem „Za mało danych”; źródła, urządzenia i drop-off również
ukrywają grupy mniejsze niż pięć. Owner/Admin i Sales widzą bezpieczne agregaty,
ale surowe eventy mogą odczytać tylko Owner/Admin. Retencja surowych eventów
wynosi maksymalnie 90 dni; kontrolowana funkcja purge jest dostępna wyłącznie
roli serwisowej. Zgody techniczne mają osobną retencję do rozstrzygnięcia w
Etapie 12.

**Dlaczego:** własna, zamknięta tabela ogranicza transfery i ryzyko
przypadkowego zebrania PII. Jawny consent usuwa potrzebę przyjmowania
niezatwierdzonej podstawy prawnej jako założenia technicznego. Live aggregation
pozwala, aby wycofanie zgody lub purge wpływały również na dashboard, a próg
małej próby ogranicza identyfikację pojedynczych respondentów.

**Konsekwencje:** sesje bez zgody nie pojawiają się w analityce i mianownikach,
więc dashboard opisuje wyłącznie populację consented. Eventy klienckie są
sygnałem produktowym, nie źródłem rozliczeń ani bezpieczeństwa. Utrata surowych
danych po 90 dniach jest zamierzona; długoterminowe, formalnie zatwierdzone
agregaty mogą powstać dopiero wraz z polityką retencji. Etap 9 nie wdraża
zewnętrznego PostHog, fingerprintingu ani eksperymentów A/B.

## ADR-020: Marketing code-first, indeksowanie allowlistą i cennik bez fikcyjnych kwot

**Status:** accepted dla Etapu 10

**Decyzja:** publiczne strony marketingowe są statycznymi Server Components
Next.js, a powtarzalne dane branż i funkcji mają zamknięty, typowany kontrakt w
repozytorium. Nie dodajemy CMS-a ani runtime biblioteki marketingowej przed
realną potrzebą redakcyjną. Klientowy JavaScript obsługuje tylko jawnie
oznaczony, syntetyczny fragment demo, który nie zapisuje danych i nie udaje
produkcyjnego formularza.

Indeksowanie jest jawne: sitemap zawiera wyłącznie zaakceptowane strony
marketingowe. Panel, logowanie, API, design system i hosted flow mają zarówno
`noindex`, jak i wykluczenie w `robots.txt`. Każda indeksowana strona otrzymuje
unikalny title, description i canonical. Structured data obejmuje wyłącznie
widoczne fakty; bez ocen, opinii, cen i FAQ schema.

Ponieważ model subskrypcji i limity nie zostały zatwierdzone, `/cennik` opisuje
wyłącznie rzeczywisty stan: indywidualnie uzgadniany program pilotażowy oraz
niezatwierdzony jeszcze self-service. Nie publikujemy wymyślonych kwot,
przekreślonych cen ani obietnicy dostępności wtyczki WordPress. Nazwa „Wyceno”
pozostaje robocza, a lokalna implementacja nie oznacza zgody na publiczny
launch.

**Dlaczego:** code-first daje kontrolę typów, przeglądu i atomowego wdrożenia
przy obecnej małej liczbie stron. Allowlista ogranicza przypadkową indeksację
danych i thin pages. Jawny status pilotażu chroni przed przedstawieniem
hipotezy cenowej lub funkcji Etapu 11 jako istniejącego produktu.

**Konsekwencje:** zmiana struktury stron lub mechanizmu publikacji wymaga
aktualizacji mapy marketingowej, testu crawl i sitemap. Redakcja bez wdrożenia
kodu nie jest jeszcze dostępna. Publiczny launch nadal wymaga clearance nazwy,
zatwierdzonego modelu cenowego, treści prawnych oraz bramek Etapów 12–13.

## ADR-021: WordPress jako cienki konektor z jednorazowym bootstrapem

**Status:** accepted dla Etapu 11

**Decyzja:** WordPress nie otrzymuje dostępu do tabel tenantowych i nie
przechowuje leadów, odpowiedzi, plików, reguł ani snapshotów flow. Owner lub
Admin generuje w panelu jednorazowy token instalacyjny przypięty do organizacji
i dokładnego originu HTTPS strony. Token wygasa po 10 minutach, jest zapisany w
bazie wyłącznie jako SHA-256 i może zostać wymieniony tylko raz, serwer-serwer,
na losowy credential konektora. Credential jest również hashowany w SaaS, a w
WordPressie szyfrowany authenticated encryption kluczem wyprowadzonym z
unikalnych salts instalacji. Brak sodium blokuje połączenie zamiast obniżać
ochronę.

Konektor wysyła credential wyłącznie w nagłówku `Authorization` do przypiętego
originu API, z weryfikacją TLS i bez redirectów. Zamknięte RPC zwraca tylko
nazwę opublikowanego flow, publiczny UUID i numer wersji. Shortcode oraz blok
Gutenberg renderują publiczny custom element i wspólny loader widgetu; w HTML,
atrybutach bloku, REST WordPressa, logach i JavaScripcie nie ma credentialu.
Mutacje administracyjne WordPress wymagają `manage_options` i nonce. Pełne
odłączenie najpierw unieważnia credential w SaaS, a następnie zawsze usuwa
lokalny sekret i cache.

Wtyczka ma własny prefiks `WYCENO_CONNECTOR_`/`wyceno_connector_`, nie eksportuje
ogólnych globali i deklaruje minimum WordPress 6.8 oraz PHP 8.3. Macierz obejmuje
stabilne WordPress 6.8–7.0 i zgodne PHP 8.3–8.5. Origin API jest stałą
środowiskową/build-time, nie polem konfiguracyjnym administratora.

**Dlaczego:** bootstrap jednorazowy ogranicza skutki przejęcia tokenu z panelu,
hashowanie ogranicza skutki odczytu bazy SaaS, a szyfrowanie lokalne utrudnia
wykorzystanie samego dumpa WordPressa. Publiczny embed nie potrzebuje sekretu.
Cienki zakres zmniejsza powierzchnię konfliktów, aktualizacji i naruszeń danych.

**Konsekwencje:** rotacja WordPress salts unieważnia lokalnie zaszyfrowany
credential i wymaga ponownego połączenia. Instalacja musi mieć sodium i
skonfigurowany `WYCENO_CONNECTOR_API_ORIGIN`; produkcyjne paczki muszą przypinać
zatwierdzony origin. WordPress 6.8 na PHP 8.5 nie należy do wspieranej macierzy
core. Multisite, WooCommerce, lokalna kopia danych i edycja flow nie należą do
Etapu 11.

## ADR-022: Owner-only DSAR, jawna retencja i fail-closed malware scanning

**Status:** accepted technicznie dla Etapu 12; okresy i dokumenty wymagają
akceptacji administratora danych oraz review prawnego przed produkcją

**Decyzja:** eksport danych leada, ręczne usunięcie i zarządzanie legal hold są
dostępne wyłącznie aktywnemu Ownerowi organizacji. Eksport jest typowanym,
wersjonowanym JSON-em budowanym po stronie PostgreSQL z jawnej allowlisty i nie
zawiera danych innego tenanta ani podpisanych URL-i. Usunięcie najpierw usuwa
prywatne obiekty Storage, następnie transakcyjnie usuwa lead, odpowiedzi,
zgody, notatki, historię, powiadomienia, analitykę i sesję. Pozostaje wyłącznie
nieidentyfikujący audit faktu, czasu, przyczyny i liczników operacji.

Automatyczna retencja leadów jest wyłączona, dopóki Owner jawnie nie zatwierdzi
okresu 30–3650 dni. Legal hold na konkretnym leadzie blokuje zarówno retencję,
jak i ręczne usunięcie. Job retencji działa przez osobny sekret i service role:
najpierw blokuje rekord i oznacza go jako `erasure pending`, pobiera ograniczony
batch oraz ścieżki Storage, usuwa obiekty, a potem
wywołuje funkcję, która ponownie sprawdza okres i hold przed transakcyjnym
usunięciem. Wygasłe sesje bez leada są czyszczone osobnym, ograniczonym batchem.
Audit i backupy nie otrzymują wymyślonego okresu — ich harmonogram wymaga
zatwierdzonej polityki i procedury wygaszania backupów.

Upload jest fail-closed poza lokalnym originem: przed rezerwacją i zapisem plik
przechodzi zdalny protokół ClamAV INSTREAM do przypiętego hosta z konfiguracji
serwerowej. Wynik infected jest odrzucany, timeout/błąd/nieznana odpowiedź
zwraca niedostępność i niczego nie zapisuje. Tryb bez skanera jest dozwolony
wyłącznie dla loopback development/test; nie istnieje produkcyjny bypass.

**Dlaczego:** nierozstrzygnięta decyzja biznesowa nie może zostać zastąpiona
fikcyjnym okresem, lecz brak decyzji nie może powodować przypadkowego purge.
Owner-only jest bezpiecznym rozstrzygnięciem przy braku zatwierdzenia uprawnień
Admina. Storage i PostgreSQL nie mają wspólnej transakcji, więc kolejność
storage-first preferuje trwałe usunięcie PII nad zachowanie referencji do
obiektu. Rekordowa blokada i stan `erasure pending` zamykają wyścig z legal
hold; nieudany worker może bezpiecznie wznowić oznaczony rekord.

**Konsekwencje:** po nieudanym kroku bazowym rekord może chwilowo wskazywać na
usunięty obiekt; kolejny przebieg dokończy purge, a prywatność nie jest
pogorszona. Eksport jest materiałem dla zweryfikowanej procedury DSAR, nie
automatyczną odpowiedzią dla dowolnego adresu e-mail. ClamAV musi działać w
prywatnej, kontrolowanej sieci, mieć aktualne sygnatury i monitoring. Review
prawny nadal musi zatwierdzić role stron, okresy, wyjątki, treść DPA,
subprocesorów, transfery i sposób weryfikacji osoby składającej żądanie.

## ADR-023: Pierwsza organizacja wyłącznie przez kontrolowane RPC

**Status:** accepted jako korekta bezpieczeństwa Etapu 12

**Decyzja:** uwierzytelniony klient nie otrzymuje bezpośredniego `INSERT` do
`organizations`. Pierwszą i kolejne organizacje tworzy minimalne RPC
`create_organization(name, slug)`. Funkcja działa jako `security definer` z
pustym `search_path` i jawnym `row_security=off`, ale nie przyjmuje
`created_by`: zawsze pobiera użytkownika z `auth.uid()` i odrzuca wywołanie
anonimowe. Istniejący trigger tworzy w tej samej transakcji aktywne członkostwo
Ownera. Ograniczenia nazwy i sluga, audit oraz pozostałe polityki RLS pozostają
aktywne.

**Dlaczego:** bezpośredni insert organizacji uruchamia trigger pierwszego
członkostwa wewnątrz zewnętrznego sprawdzenia RLS. W rzeczywistym
Supabase/PostgREST z wymuszonym RLS zagnieżdżona operacja jest odrzucana, mimo
że uproszczony harness PostgreSQL przechodził. Jawne RPC tworzy jedną granicę
autoryzacji, nie pozwala podać obcego `created_by` i nie wymaga obchodzenia RLS
przez klienta.

**Konsekwencje:** onboarding i narzędzia administracyjne muszą wywoływać RPC,
nie `.from("organizations").insert(...)`. Grant bezpośredniego inserta i jego
polityka są usunięte. Test integracyjny musi potwierdzać utworzenie organizacji
i Ownera oraz odmowę wywołania anonimowego. Rollback polega na wyłączeniu
onboardingu; nie przywracamy mniej bezpiecznego bezpośredniego inserta.

## ADR-024: Lorum jako widoczna marka przy stabilnych kontraktach technicznych

**Status:** accepted dla Etapu 12B; profesjonalny clearance nazwy nadal blokuje
publiczny launch

**Decyzja:** widoczna warstwa produktu używa marki „Lorum” w marketingu,
panelu, logowaniu, hosted flow, widgetcie, wiadomościach transakcyjnych i
interfejsie konektora WordPress. Marka opisuje produkt jako system, który
zbiera, porządkuje i kwalifikuje zapytanie oraz wskazuje następny krok
handlowy. Nie przedstawia automatyzacji jako AI ani wyniku jako wiążącej oferty.

Wartości tokenów wizualnych są aktualizowane przekrojowo w `packages/ui`:
dominują ciepłe neutralne powierzchnie, tekst i jedna głęboka zieleń, a jasna
zieleń jest spokojną powierzchnią pomocniczą. Dekoracyjne gradienty, blur
powierzchni i duże cienie zostają usunięte. Zmiana tokenów wymaga testu
kontrastu i aktualizacji visual baseline.

Stabilne identyfikatory techniczne pozostają bez zmian: nazwy pakietów
`@wyceno/*`, element `<wyceno-widget>`, eventy `wyceno:*`, storage prefix,
nagłówek `X-Wyceno-Session`, shortcode i namespace konektora WordPress. Ich
zmiana byłaby migracją kontraktów publicznych, nie rebrandingiem prezentacji,
i wymagałaby osobnego etapu z okresem kompatybilności.

**Dlaczego:** użytkownik powinien otrzymać spójną markę Lorum bez ryzyka
zerwania aktywnych osadzeń, sesji widgetu, integracji lub testów bezpieczeństwa.
Jedno źródło tokenów chroni przed lokalnymi wariantami, a spokojniejsza paleta i
typografia lepiej odpowiadają operacyjnemu produktowi B2B niż reklamowej
estetyce „AI SaaS”.

**Konsekwencje:** kod może nadal zawierać techniczne słowo `wyceno`, ale nie
może ono pojawiać się jako nazwa produktu w powierzchni użytkownika.
Dokumentacja musi odróżniać markę od identyfikatora kompatybilności. Nazwa
Lorum pozostaje kandydatem wymagającym profesjonalnego badania znaku, domen i
ryzyka pomyłki przed Etapem 13.

## ADR-025: Referencyjny reset kompozycji zamiast dalszego polerowania szablonu

**Status:** accepted dla Etapu 12D; zastępuje wizualną część kryteriów Etapów
12A–12C, ale nie zmienia decyzji o marce ani kontraktach z ADR-024

**Decyzja:** warstwa prezentacyjna Lorum ma zostać przebudowana na podstawie
architektury informacji i proporcji przesłanych referencji, a nie przez dalsze
lokalne poprawki istniejących sekcji. Landing jest pięciorozdziałową opowieścią:
problem → transformacja → proces → decyzja → wdrożenie. Każdy rozdział ma jeden
punkt ciężkości i jeden duży, czytelny dowód produktu. Powtarzające się pasy,
siatki równych modułów, katalogi kart, seryjne kickery i pomniejszone dashboardy
nie są już akceptowanym wzorcem.

Przekrojowe domyślne zasady UI:

- karta nie otrzymuje automatycznego cienia, a duża powierzchnia produktu może
  mieć tylko jeden subtelny cień wynikający z warstwy;
- pigułka służy wyłącznie rzeczywistemu statusowi, nie dekoracyjnej etykiecie;
- nagłówki nie korzystają z globalnie skrajnie ujemnego trackingu, a kicker nie
  jest obowiązkowym początkiem każdej sekcji;
- code-native proof ma tekst co najmniej 12–14 px i pokazuje jeden realny
  fragment zadania zamiast całego panelu pomniejszonego do ilustracji;
- głęboka zieleń służy akcji, aktywnemu stanowi i wąskiemu railowi; score i
  zwykłe dane pozostają neutralne;
- wordmark jest typograficzny; pojedyncza litera w kaflu nie jest znakiem marki;
- marketing może używać szerokiego oddechu, ale panel zachowuje kompaktową
  gęstość narzędzia pracy.

Snapshoty wizualne utrwalają implementację dopiero po porównaniu side-by-side z
referencją w 1440 i 390 px. Zgodność z poprzednim screenshotem nie jest dowodem
jakości i nie może blokować potrzebnej przebudowy.

**Dlaczego:** Etapy 12A–12C usunęły część efektów wizualnych, lecz zachowały
strukturę typowego szablonu SaaS. Landing nadal powtarzał ten sam komunikat w 11
beatach, miał około 9460 px wysokości na desktopie i 12 997 px na mobile, a
główny widok produktu używał tekstu około 8–11 px. Formalnie zielone testy
utrwalały ten kierunek zamiast oceniać czytelność i hierarchię. Nowa decyzja
pozwala odrzucić kompozycję, która nie spełnia oczekiwanego poziomu, bez
naruszania funkcji i bezpieczeństwa produktu.

**Konsekwencje:** `packages/ui` pozostaje źródłem tokenów i prymitywów, lecz
ich domyślne użycie może zostać uproszczone. Landing i wspólne marketingowe
proofy wymagają przebudowy semantycznego HTML oraz aktualizacji adekwatnych
testów, bez zmniejszania pokrycia klawiatury, axe, SEO, mobile i budżetów.
Routing, Server Components, auth, tenant scope, RLS, pricing/scoring, API,
widgetowe identyfikatory i marka Lorum pozostają bez zmian. Etap nie daje zgody
na wdrożenie produkcyjne ani publiczny launch.

## ADR-026: Referencyjna rekonstrukcja wyłącznie strony głównej

**Status:** accepted dla Etapu 12E; doprecyzowuje ADR-025 wyłącznie dla `/`

**Decyzja:** strona główna odtwarza kompozycję, proporcje i kolejność przesłanej
referencji desktop/mobile: niski header, zwarty hero z liniową transformacją
trzech odpowiedzi w dokument leada, hairline-strip sześciu danych oraz dolne
porównanie typowego zapytania z procesem Lorum. Nie jest to kolejna iteracja
pięciu wysokich rozdziałów z Etapu 12D. Pozostałe strony marketingowe, panel,
widget, auth, API i współdzielone tokeny są poza zakresem.

Desktop pokazuje jeden gęsty widok produktu zamiast wielkich, rozdzielonych
sekcji. Mobile zachowuje poziomą relację odpowiedzi → lead, upraszczając dane,
ale nie zamieniając dowodu w przypadkowy pionowy stos. Tekst proofu pozostaje
co najmniej 12 px. Przyciski prowadzą do istniejących tras lub kotwic; nie
powstają atrapy kontrolek.

Ruch jest home-only i progresywnie wzbogaca Server Component: mały kontroler
`IntersectionObserver` ustawia atrybuty odsłonięcia, a CSS animuje wyłącznie
`transform`, w tym skalę poziomą highlightu. Treść zachowuje pełny kontrast w
każdej klatce animacji. Bez JavaScriptu pozostaje widoczna. Reduced motion
natychmiast ujawnia całość, bez przejść. Nie dodajemy biblioteki animacji,
parallaxu, scroll-jackingu, sprężyn ani ruchu ciągłego.

**Dlaczego:** najnowsza referencja określa dokładniejszą, bardziej produktową i
znacznie niższą architekturę widoku niż wcześniejsza interpretacja ADR-025.
Lokalne polerowanie pięciu rozdziałów utrwaliłoby odrzuconą kompozycję. Wąski
zakres pozwala osiągnąć zgodność wizualną bez ponownego rebrandingu całego
produktu.

**Konsekwencje:** marka Lorum i techniczne identyfikatory z ADR-024 pozostają
bez zmian. Home może mieć wariant nawigacji rozpoznawany po ścieżce, lecz
domyślny header innych tras musi renderować się identycznie. Baseline’y `/`
z Etapu 12D zostają zastąpione dopiero po review 1440/390/320 px. Decyzja nie
zmienia danych, bezpieczeństwa, autoryzacji, tenant scope, SEO allowlisty ani
bramek produkcyjnych.

## ADR-027: Referencyjny fold jako początek pełnej ścieżki konwersji `/`

**Status:** accepted dla Etapu 12F; zastępuje ograniczenie ADR-026 do trzech
części, ale nie rozszerza zakresu zmian poza stronę główną

**Decyzja:** strona główna zachowuje geometrię i język wizualny przesłanej
referencji w pierwszym foldzie, lecz nie kończy narracji po porównaniu zapytania
z gotowym leadem. Dalsza część odpowiada na kolejne pytania decyzyjne
użytkownika poprzez jeden ciąg tego samego demonstracyjnego leada:

1. odpowiedzi klienta → gotowy lead;
2. typowe zapytanie → uporządkowany brief i cztery kroki procesu;
3. dopasowanie pytań do usługi i branży;
4. rzeczywiste, bezstanowe demo doświadczenia klienta;
5. serwerowe reguły wyniku i wyjaśnialnego score;
6. operacyjna obsługa rekordu przez handlowca;
7. publikacja wersji oraz inline, popup, fullscreen, hosted link i WordPress;
8. granica odpowiedzialności firmy i agencji oraz tenant scope;
9. uczciwy zakres pilotażu i działające przejście do `/cennik`.

Każdy rozdział ma jedną tezę i jeden dominujący artefakt produktu. Nie
powstają powtarzalne gridy kart, testimonials, logotypy klientów, statystyki,
tabele cenowe, dekoracyjne FAQ ani obietnice AI. Demonstracyjne wartości są
jawnie opisane, a kontrolka wyglądająca jak interaktywna musi działać. CTA nie
może obiecywać zgłoszenia do pilotażu, dopóki istniejąca trasa nie dostarcza
rzeczywistego kanału zgłoszenia.

Pierwszy fold i kolejne proofy używają jednej osi kontenera, hairline’ów,
ciepłego tła, białych powierzchni danych i głębokiej zieleni. Desktop stosuje
asymetryczne układy 4/8, 5/7 i 7/5; 1024 px nie przechodzi do mobilnego stacku.
Przy 768 px copy może znaleźć się nad proofem, ale relacja odpowiedzi → lead
pozostaje pozioma. 390 i 320 px otrzymują osobne kompozycje proofów zamiast
pomniejszonych dashboardów.

Ruch pozostaje home-only, bez nowych zależności i używa wyłącznie `transform`,
w tym `translateX`, `translateY` i `scaleX`. Bez JavaScriptu treść jest
widoczna, reduced motion usuwa animacje i przejścia, a kontrast pozostaje
poprawny w każdej klatce.

**Dlaczego:** implementacja ADR-026 odtworzyła zarys referencyjnego pierwszego
ekranu, ale zatrzymała stronę przed odpowiedzią na obiekcje związane z
dopasowaniem, doświadczeniem klienta, źródłem wyniku, pracą handlowca,
wdrożeniem i rozpoczęciem pilotażu. Dodatkowo breakpointy 1120/768 px oraz
konflikt marginesów powodowały faktyczne rozjechanie geometrii. Najnowsza
dyspozycja użytkownika wymaga pełnej, przemyślanej strony sprzedażowej w języku
referencji, nie krótkiej reprodukcji jednego kadru.

**Konsekwencje:** `CONTENT_ARCHITECTURE.md`, test kontraktu home i baseline’y
muszą zostać zaktualizowane. Pełna strona będzie dłuższa, dlatego testy mają
kontrolować wysokość i martwą przestrzeń per sekcja zamiast blokować globalny
limit 1800/3600 px. Pozostałe strony marketingowe, panel, widget, auth, API,
model danych, RLS, tenant scope, scoring/pricing i identyfikatory integracyjne
pozostają bez zmian. Decyzja nie daje zgody na deployment.

## ADR-028: V6 Image-Locked jako kontrakt prezentacji z kontrolą zakresu

**Status:** accepted dla kanonizacji dokumentacji 2026-07-27; implementacja
pozostaje etapowa

**Decyzja:** pakiet `nowydesign.zip` o SHA-256
`f1e86da64f28788065d687e7c2b65e9199af162ca4ff1bec9e05266b838fc141`
zostaje przyjęty jako V6 Image-Locked — mierzalny kontrakt kompozycji,
typografii, gęstości, kontrolek i transformacji responsive. Jego aktywne źródła
są wersjonowane w `docs/ui/`, a hierarchię określa
`docs/ui/REFERENCE_MANIFEST.md`.

Najnowszy zaakceptowany załącznik rozmowy wygrywa nad starszym obrazem tylko w
regionie, który pokazuje. Obraz nie zatwierdza nowej funkcji, danych, roli,
uprawnienia ani integracji. `SECURITY.md`, `PRIVACY.md`, RLS i tenant scope,
niniejszy rejestr decyzji oraz `SCOPE.md` i `NON_GOALS.md` mają zawsze
pierwszeństwo. Widoczna marka pozostaje Lorum, a stabilne identyfikatory Wyceno
pozostają bez zmian zgodnie z ADR-024.

Każdy etap UI zaczyna się od dokładnej referencji i baseline'u, a kończy
renderami before/after, overlay, listą różnic, oceną minimum 18/20, testem
responsive, accessibility i pełnym gate'em właściwym dla etapu. Brak lokalnego
oryginału najnowszego obrazu blokuje pixel-perfect PASS danego ekranu, ale nie
blokuje niezależnych obszarów z kompletną referencją.

**Dlaczego:** paczka zawiera znacznie dokładniejszą specyfikację landingu,
panelu, buildera i mobile niż wcześniejsze raporty, lecz część starszych plansz
pokazuje elementy sprzeczne z MVP, takie jak graf node-based, billing albo
niezatwierdzone plany. Jawna hierarchia pozwala odwzorować design bez
przypadkowego rozszerzenia produktu lub osłabienia kontroli danych.

**Konsekwencje:** `docs/INDEX.md`, `docs/UI_SCREEN_SPEC.md`,
`docs/RESPONSIVE_LAYOUT.md`, `docs/VISUAL_QA.md` i manifest referencji są
aktywnymi źródłami. Pakiety v1/v2 pozostają materiałem źródłowym, nie
równoległym backlogiem. Bieżący Etap 12F nadal zamraża trasy poza `/`; pełna
przebudowa panelu wymaga kolejnych zamkniętych etapów. Decyzja nie zmienia API,
auth, danych, migracji, wyceny, score ani nie daje zgody na deployment.

## ADR-029: Referencyjny etap auth Lorum z jednym providerem Google

**Status:** accepted dla Etapu 12K na podstawie dyspozycji właściciela produktu
z 2026-07-27

**Decyzja:** lokalna referencja `apps/web/public/ekranylogowania.png` o rozmiarze
1536 × 1024 i SHA-256
`ba9927f454330835c6a7d1663cd294913ceafdf6f322aef44ea7e059eca630fd`
odblokowuje osobny, zamknięty etap auth poza trwającym zakresem landingu.
Widoczna marka pozostaje **Lorum**. Historyczna nazwa Wyceno na planszy jest
zastępowana wyłącznie w copy i znaku marki; geometria, hierarchia i język
powierzchni pozostają nadrzędną referencją.

Ekrany logowania i rejestracji korzystają ze wspólnego shella
`branding / formularz / korzyści` oraz dwóch dedykowanych ilustracji
produktowych wygenerowanych na podstawie referencji. Jedynym dostawcą OAuth
jest Google. Microsoft nie jest renderowany ani konfigurowany. Przycisk Google
wywołuje rzeczywisty Supabase OAuth z PKCE; nie jest atrapą.

Każda główna trasa auth wypełnia pierwsze `100svh` bez zewnętrznego nagłówka,
sloganu produktu, podpisu „Logowanie/Rejestracja” ani wyśrodkowanej karty.
Subtelna biała oprawa 0,75–1,5 rem jest częścią pełnego viewportu i nie
przywraca szerokich marginesów planszy. Logo występuje wyłącznie wewnątrz
zielonego panelu. Sekcja „Wszystko, czego potrzebujesz…” jest osobnym regionem
po pierwszym viewportcie.

Najnowsza korekta gęstości z 2026-07-27 ma pierwszeństwo przed mechanicznym
skalowaniem planszy do 2048 px. Kontrolki desktop mają 46–56 px, ikony około
20–23 px, nagłówki paneli 24–30 px, a wolna przestrzeń ma wynikać z odstępów
między grupami, nie z powiększania komponentów.

Końcowa część rejestracji — potwierdzenie hasła, zgoda, CTA, separator i Google
— zachowuje osobne odstępy 14–20 px. Nie może być renderowana jako jeden zbity
blok.

Rejestracja hasłem zapisuje jedynie minimalne metadane potrzebne do profilu i
utworzenia pierwszej organizacji przez istniejące, kontrolowane RPC
`create_organization`. Potwierdzenie e-maila i callback ponawiają bootstrap
idempotentnie. Rejestracja Google bez nazwy firmy kończy się rzeczywistym
krokiem uzupełnienia organizacji, zamiast tworzyć fikcyjną firmę. Logowanie,
callback, reset hasła i prywatne odpowiedzi zachowują cookies SSR, `no-store`,
bezpieczny redirect lokalny i serwerową weryfikację użytkownika.

Referencyjny testimonial, niepotwierdzony 14-dniowy trial i deklaracja
„enterprise encryption” nie są kopiowane jako fakty. Zastępuje je prawdziwe
copy o wersjonowaniu, RLS, tenant scope i kontrolowanym przetwarzaniu. Provider
Google wymaga konfiguracji client ID i secret poza repozytorium; w repo
pozostają wyłącznie puste nazwy zmiennych oraz konfiguracja Supabase.

**Dlaczego:** użytkownik jednoznacznie zatwierdził markę Lorum, ograniczył
providerów do Google i dostarczył natywny plik referencji. Osobny ADR jawnie
ogranicza wyjątek od zamrożenia tras w ADR-027/028 do auth oraz chroni przed
martwymi kontrolkami, fikcyjnym social proof i niekontrolowanym tworzeniem
organizacji.

**Konsekwencje:** Etap 12K może zmienić wyłącznie auth, jego wspólne komponenty,
konfigurację Google, niezbędne typy RPC, testy i dokumentację. Nie zmienia
pozostałego panelu, widgetu, landingu, modelu ról, RLS, API leadów, pricingu ani
scoringu. Nie daje zgody na deployment; produkcyjny Google OAuth wymaga
osobnego client ID, secretu, dozwolonych redirectów i smoke testu na stagingu.

## ADR-030: FlowDocument v2 dla sekcji i typowanej walidacji kroków

**Status:** accepted dla Etapu 12U na podstawie decyzji właściciela produktu z
2026-07-29

**Decyzja:** profesjonalny builder procesu otrzymuje `FlowDocument v2`.
Dokument pozostaje pojedynczym, tenantowym agregatem JSONB z limitem 256 KiB,
kontrolą rewizji oraz podwójną walidacją TypeScript/PostgreSQL. Wersja v2
dodaje:

- uporządkowaną tablicę sekcji z trwałym kluczem i nazwą;
- wymagany `sectionKey` każdego kroku, przy zachowaniu tablicy `steps` jako
  kanonicznej kolejności procesu;
- opcjonalne, typowane ograniczenie kroku: długość tekstu, zakres liczbowy albo
  zakres dat.

Sekcje organizują edytor i nie tworzą osobnego grafu wykonania. Nawigacja nadal
korzysta z jawnych `nextStepKey`, opcji i ograniczonego AST reguł. Walidacja v2
wymaga unikalnych sekcji, przypisania każdego kroku do istniejącej sekcji,
zgodnej kolejności grup oraz dopasowania rodzaju ograniczenia do typu kroku.

`FlowDocument v1` pozostaje obsługiwanym formatem odczytu i publikacji.
Deterministyczny migrator aplikacyjny tworzy v2 dopiero w pamięci edytora;
istniejący draft jest zapisany jako v2 dopiero po jawnej zmianie użytkownika lub
zapisie buildera. Istniejące `flow_versions.snapshot` nie są przepisywane.
Publiczny manifest v1 pozostaje obsługiwany, a snapshot v2 otrzymuje
allowlistowaną projekcję manifestu v2 wyłącznie z nowym polem walidacji kroku;
sekcje i pozostałe dane edytora nie są ujawniane widgetowi.

**Dlaczego:** sekcje widoczne w zaakceptowanej referencji buildera muszą być
trwałym stanem, a nie sztucznym podziałem listy. Ograniczenia odpowiedzi wpływają
na publiczny runtime i muszą być egzekwowane zarówno w widgetcie, jak i po
stronie PostgreSQL. Osobna tabela układu buildera dublowałaby kolejność kroków,
mogłaby odjechać od draftu i komplikowałaby atomowy zapis. Dodanie pól do
schematu v1 bez podniesienia wersji naruszałoby ADR-014.

**Konsekwencje:** `@wyceno/validation`, walidator PostgreSQL, projekcja
manifestu, walidacja odpowiedzi i testy kompatybilności obsługują oba formaty.
Nowe szablony są tworzone jako v2. Publikacja nadal wykonuje niezależną
walidację serwerową, immutable snapshot i tenant scope. Nie dodajemy
node-canvasu, dowolnego regexu, kodu użytkownika ani nowych operatorów logiki.

Migracja bazy jest forward-only. Rollback aplikacji nie może przywrócić buildu
rozumiejącego wyłącznie v1 po zapisaniu pierwszego draftu v2. Bezpieczny rollback
oznacza wdrożenie poprzedniego UI z zachowanym parserem v1/v2 i zablokowanym
tworzeniem nowych pól v2; migracja bazy pozostaje na miejscu. Przed wdrożeniem
produkcyjnym wymagany jest backup, restore drill oraz fixture publikacji v1 i
v2.

## ADR-031: serializowany autosave i lokalna historia buildera

**Status:** accepted dla Etapu 12V na podstawie decyzji właściciela produktu z
2026-07-29

**Decyzja:** edytowalnym agregatem buildera jest para `name + draft`.
`draft_revision` zwiększa się po zmianie dowolnej części tej pary. Zapis nadal
podaje oczekiwaną rewizję i wykonuje tenant scope oraz capability check po
stronie serwera.

Klient utrzymuje maksymalnie 50 lokalnych snapshotów historii. Kolejne wpisywanie
w to samo pole w oknie 800 ms stanowi jedną operację cofania; zmiana
strukturalna stanowi osobną operację. Undo/redo nie cofa rewizji bazy — tworzy
nowy stan roboczy, który podlega normalnemu autosave.

Autosave ma debounce 900 ms i jedną kolejkę requestów. W danej chwili działa
co najwyżej jeden zapis, a oczekujące stany są redukowane do najnowszego.
Publikacja blokuje mutacje edytora, opróżnia tę samą kolejkę, a następnie
publikuje zapisany snapshot pod oczekiwaną rewizją. Nawigacja wewnętrzna próbuje
zapisać najnowszy poprawny stan przed przejściem, a zewnętrzne zamknięcie karty
korzysta z przeglądarkowego ostrzeżenia.

Konflikt nie uruchamia automatycznego merge ani force overwrite. Kolejka
zatrzymuje się, lokalne zmiany pozostają widoczne, a użytkownik może jawnie
wczytać nowszy draft. To odświeżenie ma osobne potwierdzenie i omija dopiero
wtedy ogólne ostrzeżenie przed utratą zmian.

**Dlaczego:** równoległe requesty autosave mogłyby zamienić kolejność zmian, a
rewizja obejmująca wyłącznie JSONB nie chroniła nazwy procesu przed lost update.
Lokalna historia nie wymaga nowej tabeli ani modyfikowania immutable snapshotów,
natomiast optimistic concurrency pozostaje egzekwowana przez PostgreSQL.

**Konsekwencje:** nowa migracja zmienia wyłącznie trigger rewizji, bez zmiany
schematu tabel. Starszy klient może bezpiecznie działać z częściej rosnącą
rewizją, o ile zawsze używa wartości zwróconej przez zapis. Rollback UI nie
wymaga cofania migracji; przywrócony klient musi nadal obsługiwać konflikty i
aktualizować lokalną rewizję. Historia jest celowo pamięciowa — nie stanowi
offline storage ani współdzielonej edycji.

## ADR-032: trzy szklane powierzchnie produktu zamiast dekoracyjnego 3D

**Status:** accepted dla Etapu 12ZB na podstawie korekty właściciela produktu
z 2026-07-29

**Decyzja:** hero strony głównej `/` pokazuje trzy code-native powierzchnie
Lorum w jednej perspektywie 3D:

- pionowy proces klienta;
- konfigurację pytania i reguły wyniku;
- dokument gotowego leada z następnym krokiem.

Panele używają prawdziwego tekstu HTML, semantyki i danych demonstracyjnych
zgodnych z działającym produktem. Szkło, głębia, refleks i cienie są wyłącznie
warstwą prezentacji CSS. Hero nie używa wygenerowanego obrazu, tekstu
w rastrze, dekoracyjnej maszyny ani trzech atrap telefonów.

Strona główna zostaje skondensowana do sześciu rozdziałów: hero, prowadzony
przepływ, interaktywne demo, dokument decyzji, branże z publikacją oraz
pilotaż. Pojedynczy ciągły storyboard zastępuje pięć telefonów branżowych
i osobne sekcje powtarzające układ nagłówek + biała karta. Pełne demo pozostaje
jedyną dużą interaktywną powierzchnią na stronie.

**Dlaczego:** poprzednia interpretacja 3D była wizualnie zbyt literalna,
powtarzalna i odrywała hero od rzeczywistego produktu. Osobny wygenerowany
obiekt wyglądał jak urządzenie techniczne, nie SaaS. Trzy cienkie powierzchnie
pozwalają pokazać wartość Lorum jako relację klient → reguły → lead, zachowując
minimalizm i wiarygodność interfejsu.

**Konsekwencje:** zmiana dotyczy wyłącznie prezentacji `/`, wspólnej nawigacji
marketingowej i jej testów visual regression. Nie zmienia routingu, API,
pricingu, scoringu, RLS, tenant scope ani kontraktu widgetu. Mobile używa tej
samej sceny ze skorygowaną perspektywą i kolejnością warstw; nie zastępuje jej
osobnym uproszczonym obrazem. Reduced motion zachowuje statyczną kompozycję,
forced colors usuwa efekty szkła, a tekst 12 px spełnia WCAG 2.2 AA.

## ADR-033: Kwotum jako widoczna marka przy zachowaniu kontraktów technicznych

**Status:** accepted na podstawie decyzji właściciela z 2026-08-02; zastępuje
ADR-024 wyłącznie w zakresie widocznej nazwy i znaku. Profesjonalny clearance
nazwy, domen i znaku nadal blokuje publiczny launch.

**Decyzja:** warstwa widoczna dla użytkownika używa nazwy **Kwotum** w
marketingu, panelu, auth, hosted flow, wiadomościach i interfejsie konektora
WordPress. Wordmark jest zapisywany małymi literami jako `kwotum`, a zwykłe
zdania używają formy `Kwotum`.

Znak jest code-native SVG: litera Q ma jeden ciągły, ciemnozielony obwód i ogon
wychodzący ze światła znaku. Limonkowy akcent jest częścią prawego górnego łuku,
nie doklejoną kropką. Paleta znaku to `#06753A` i `#9AD672`, wordmark używa
istniejącego koloru tekstu `#0B1530`. Ten sam plik SVG zasila faviconę, auth i
panel, a marketingowy nagłówek używa równoważnej wersji inline.

Stabilne kontrakty techniczne pozostają bez zmian: pakiety `@wyceno/*`,
`<wyceno-widget>`, eventy `wyceno:*`, nagłówek `X-Wyceno-Session`, techniczne
prefiksy storage, shortcode, text-domain i namespace konektora WordPress oraz
istniejące identyfikatory `lorum:*` używane przez zapisane preferencje UI.

**Dlaczego:** nowa nazwa lepiej komunikuje przejście „od zakresu do konkretnej
kwoty”, a znak Q pozostaje czytelny w małej skali i pasuje do istniejącego
języka wizualnego. Rozdzielenie marki prezentacyjnej od kontraktów zapobiega
zerwaniu sesji, osadzeń, lokalnych preferencji i integracji.

**Konsekwencje:** nowe copy i testy muszą oczekiwać Kwotum. Historyczne raporty,
ścieżki plików i nazwy migracji mogą zachować Lorum jako zapis wcześniejszej
decyzji. Nie wolno przedstawiać dostępności domeny ani ochrony znaku jako
potwierdzonej bez profesjonalnego badania.

Korekta właścicielska z 2026-08-11 zastępuje geometrię wcześniejszego symbolu
dostarczonym gradientowym znakiem Q z trzema liniami i potwierdzeniem. Tło oraz
światło znaku są przezroczyste. Zakres obejmuje wszystkie powierzchnie marki
Kwotum, ale nie tenantowe logo firmy wyświetlane w jej formularzu.

## ADR-034: tenantowy webhook `lead.created` z osobnym outboxem i pochodnym sekretem

**Status:** accepted dla Etapu 12ZF na podstawie domyślnej decyzji programu
gotowości produkcyjnej z 2026-08-09

**Decyzja:** webhook pozostaje częścią MVP, lecz v1 udostępnia wyłącznie
wersjonowany event `lead.created`. Każdy endpoint należy do jednego tenanta i
jest zarządzany przez Ownera lub Admina. Sales nie odczytuje konfiguracji,
sekretu ani historii dostaw. Endpoint ma dokładny URL HTTPS, tylko port 443,
bez credentiali, fragmentu i redirectów. Zarówno konfiguracja/test, jak i
każda rzeczywista dostawa ponownie sprawdzają DNS oraz wszystkie rozstrzygnięte
adresy. Połączenie jest przypinane do publicznego adresu użytego do walidacji,
co zamyka okno DNS rebinding. Loopback, adresy prywatne, link-local, multicast,
unspecified, documentation ranges oraz metadata endpoints są zabronione dla
IPv4 i IPv6.

Konfiguracja i dostawy mają osobne tabele od e-maili. Trigger dopisuje dostawy
aktywnych endpointów w tej samej transakcji, w której powstaje lead. Worker
pobiera ograniczony batch przez `FOR UPDATE SKIP LOCKED`, losowy lock token i
15-minutowe odzyskiwanie prób. Dostawa jest co najmniej jednokrotna, używa
stabilnego `delivery_id`, maksymalnie pięciu prób z backoffem 1 min, 5 min,
30 min i 2 h oraz jawnego stanu `dead_letter`. HTTP 408, 425, 429 i 5xx oraz
błędy sieciowe są retryable; redirect, niebezpieczny adres, niepoprawny TLS i
pozostałe 4xx kończą dostawę bez ponowienia. Historia zapisuje tylko status
HTTP, zamknięty kod techniczny i czasy — nigdy response body ani payload.

Sekret endpointu nie jest przechowywany w PostgreSQL. Aplikacja wyprowadza
32-bajtowy sekret z server-side `WEBHOOK_SIGNING_SECRET`, UUID organizacji,
UUID endpointu i numeru wersji przez HMAC-SHA256. Jest pokazywany tylko po
utworzeniu lub rotacji. Baza przechowuje wyłącznie numer wersji; kompromitacja
samego dumpa nie ujawnia sekretów. Rotacja podnosi wersję, unieważnia locki
oczekujących prób i jest audytowana. Osobny `WEBHOOK_WORKER_SECRET` chroni
wewnętrzny endpoint schedulera.

Envelope zawiera `version`, `event_id`, `delivery_id`, `type`, `occurred_at`,
`organization_id` i allowlistowane `data`. Produkcyjny event zawiera publiczny
identyfikator leada, nazwę procesu, czas submitu, kontakt oraz bezpieczną
projekcję estymacji. Nie zawiera plików, odpowiedzi, notatek, score, kategorii
ani uruchomionych reguł. Syntetyczny test jest jawnie oznaczony i nie używa PII.
Worker podpisuje `timestamp + "." + raw_body` przez HMAC-SHA256 i wysyła wersję
podpisu, timestamp, event ID oraz delivery ID w stałych nagłówkach. Odbiorca ma
sprawdzić podpis stałoczasowo, maksymalnie pięciominutowe okno replay i
deduplikować `delivery_id`.

**Dlaczego:** firmy i agencje pilotażowe potrzebują przenieść uporządkowany lead
do istniejącego systemu bez natywnej integracji CRM. Bez transakcyjnego outboxu
submit mógłby zatwierdzić lead i zgubić dostawę. Przechowywanie plaintextowego
sekretu lub zwykły `fetch` do URL użytkownika tworzyłyby odpowiednio ryzyko
wycieku całego dumpa oraz SSRF/DNS rebinding.

**Konsekwencje:** `WEBHOOK_SIGNING_SECRET` musi być stabilnym, losowym sekretem
co najmniej 32-znakowym i podlegać kontrolowanej rotacji całego środowiska;
utrata go wymaga rotacji wszystkich endpointów. Scheduler, alert wieku kolejki
i syntetyczny probe powstają w Etapie 13A, ale worker, endpoint wewnętrzny i
bezpieczny test tenantowy są częścią 12ZF. Migracja jest forward-only. Rollback
aplikacji wyłącza route workera i zarządzanie endpointami, pozostawiając kolejkę
bezpiecznie w bazie; usunięcie tabel lub danych wymaga osobnej migracji
naprawczej po sprawdzeniu retencji i aktywnych dostaw.

## ADR-035: pamięciowy preview runtime i osobny outbox zaproszeń procesu

**Status:** accepted dla Etapu 12ZH na podstawie decyzji właściciela produktu z
2026-08-03

**Decyzja:** pełny podgląd opublikowanego procesu korzysta z tego samego
`WycenoWidgetElement`, `WidgetSessionController`, parsera manifestu, walidacji
odpowiedzi i nawigacji co publiczny widget, ale podstawia jawny, pamięciowy
adapter `PreviewWidgetApi` oraz `MemoryWidgetStorage`. Adapter nie wykonuje
requestów sieciowych, nie zapisuje sesji, analityki ani plików i kończy submit
syntetycznym potwierdzeniem oznaczonym jako podgląd. Manifest jest pobierany po
stronie serwera z immutable opublikowanej wersji, bez prywatnych reguł
buildera. Preview draftu pozostaje poza tym etapem, ponieważ wymaga osobnego,
wersjonowanego snapshotu roboczego.

Wysyłka hosted linku przed powstaniem leada jest osobnym agregatem
`flow_invitations`, a nie nullable rozszerzeniem istniejącego powiadomienia
leada. Rekord wskazuje tenant, flow i immutable wersję, przechowuje snapshot
odbiorcy, opcjonalną wiadomość, autora, idempotency key oraz stan outboxu.
Osobna tabela prób używa tego samego adaptera dostawy i tej samej polityki
retry co powiadomienia leadów. Worker przetwarza oba outboxy w jednym
chronionym uruchomieniu, ale ich kontrakty, retencja i historia pozostają
rozdzielone.

Adres w wiadomości jest zwykłym publicznym `/f/{publicId}`. Nie dodajemy PII,
identyfikatora zaproszenia ani tokenu śledzącego do URL, nie używamy tracking
pixela i nie deklarujemy informacji o otwarciu. Owner i Admin otrzymują jawne
capability `flow:share`; Sales nie widzi draftów ani zaproszeń procesu.

**Dlaczego:** obecne „Otwórz test” tworzy prawdziwą sesję publiczną i może
zakończyć się produkcyjnym leadem. Sam iframe albo ukrycie submitu nie usuwa
skutków ubocznych. Z kolei obecny outbox ma nieusuwalny związek z istniejącym
leadem i dwa zamknięte typy wiadomości, więc zaproszenie wymaga własnego cyklu
życia, historii i kontroli dostępu.

**Konsekwencje:** preview opublikowanej wersji jest bezstanowy względem bazy i
nie zanieczyszcza analityki. Nie służy do testowania serwerowej dostawy ani
produkcyjnego wyliczenia; te pozostają częścią UAT hosted flow. Migracja
zaproszeń jest forward-only. Rollback aplikacji pozostawia nieprzetworzone
rekordy bezpiecznie w tabeli; worker starszej wersji ich nie claimuje.
Produkcja nadal wymaga zatwierdzonego providera, domeny nadawcy, schedulera,
alertów kolejki, DPA i testu realnej dostawy.

## ADR-036: osobny agregat Lead Operations zamiast rozszerzania leada o pola UI

**Status:** accepted dla Etapu 12ZI na podstawie decyzji właściciela produktu z
2026-08-03

**Decyzja:** przypisanie i priorytet są przechowywane w jednej tenantowej
relacji `lead_operations`, a zadania i planowane kontakty w `lead_tasks`.
Immutable dane przesłane przez klienta pozostają w istniejącym agregacie
`leads`; nie dokładamy do niego pól wynikających wyłącznie z pracy zespołu.
Zmiany przypisania, priorytetu i cyklu zadania zapisuje append-only
`lead_activity_events`, który zawiera techniczne referencje i enumy, ale nie
kopiuje treści zadania, notatki ani danych kontaktowych.

„Następny krok” i „Zaplanowany kontakt” są projekcjami najbliższych otwartych
zadań, a „Ostatnia aktywność” jest maksimum czasów z istniejących statusów i
notatek oraz nowych zdarzeń operacyjnych. Nie powstają ręcznie synchronizowane
kolumny zduplikowane względem źródeł. Rozpoczęcie obsługi atomowo ustawia status
`in_progress` i przypisuje aktora tylko wtedy, gdy lead pozostawał
nieprzypisany.

Owner/Admin otrzymują `lead:assign`, wszystkie aktywne role otrzymują
`lead:operate`. Tabele są bezpośrednio tylko do odczytu przez wymuszone RLS;
zapis wykonują wąskie RPC ponownie sprawdzające tenant, rolę, aktywne
członkostwo, stan zadania i idempotency key. Zadania podlegają temu samemu
eksportowi, retencji, legal hold i usunięciu co lead.

**Dlaczego:** pola właściciela, priorytetu i daty dodane bezpośrednio do
`leads` mieszałyby immutable brief klienta z operacyjnym stanem zespołu.
Osobny agregat pozwala rozwijać obsługę bez zmiany kontraktu submitu, a
projekcje eliminują niespójność pomiędzy CTA, zadaniem i ręcznie wpisanym
„następnym krokiem”.

**Konsekwencje:** migracja jest forward-only i tworzy stan domyślny dla
istniejących leadów oraz trigger dla nowych. Rollback UI pozostawia dane
operacyjne bezpiecznie w tabelach; starsza aplikacja ich nie modyfikuje.
Zewnętrzne kalendarze, przypomnienia i automatyczne SLA wymagają osobnych
decyzji oraz workerów i nie są deklarowane w tym etapie.

## ADR-037: rozdzielenie liveness i readiness runtime

**Status:** accepted dla lokalnego podetapu 12ZJ na podstawie polecenia
kontynuacji właściciela produktu z 2026-08-03

**Decyzja:** `GET /health` pozostaje tanią kontrolą liveness procesu i nie
wykonuje połączeń zewnętrznych. Nowy `GET /ready` wykonuje ograniczony czasowo,
anonimowy probe przez skonfigurowany Supabase REST do wąskiej funkcji
`runtime_readiness_probe()`. Funkcja nie czyta danych tenantów, nie przyjmuje
argumentów i zwraca wyłącznie `true`; jej obecność potwierdza jednocześnie
dostępność HTTP, PostgREST, PostgreSQL oraz zastosowanie migracji zawierającej
kontrakt readiness.

Endpoint nie zwraca URL-i, kluczy, czasu zapytania, wersji bazy ani komunikatu
błędu zależności. Sukces ma status 200 i `ready`, a brak konfiguracji, timeout,
błąd sieci, nieoczekiwany payload lub status zależności zwraca generyczne 503
i `unavailable`. Obie odpowiedzi są `no-store` i `noindex`.

Showcase `/design-system` pozostaje dostępny w local/preview, ale staging i
production zwracają 404. Staging i production wymagają HTTPS oraz hosta
niebędącego loopbackiem już na etapie walidacji konfiguracji.

**Dlaczego:** liveness nie może zależeć od bazy, bo awaria zależności
powodowałaby niepotrzebne restarty zdrowego procesu. Readiness musi natomiast
zatrzymać kierowanie ruchu do instancji, która nie może korzystać z krytycznej
ścieżki danych. Wąski probe ogranicza uprawnienia i nie tworzy publicznego
mechanizmu diagnostycznego ujawniającego infrastrukturę.

**Konsekwencje:** migracja jest forward-only. Starsza aplikacja ignoruje nową
funkcję, a rollback aplikacji nie wymaga cofania schematu. Readiness nie
potwierdza działania e-maila, ClamAV, schedulerów, backupu ani monitoringu;
pozostają osobnymi bramkami Etapów 13A–13C.

## ADR-038: Semgrep CE jako dostępny SAST prywatnego repozytorium

**Status:** accepted dla Etapu 12ZD na podstawie jawnej decyzji właściciela
produktu z 2026-08-09

**Decyzja:** niedostępny upload CodeQL dla prywatnego repozytorium konta
osobistego zastępujemy blokującym Semgrep CE. CI i komenda
`pnpm security:semgrep` używają obrazu Semgrep 1.164.0 przypiętego do
niezmiennego digestu. Oficjalny zestaw OWASP jest pobierany po HTTPS, sprawdzany
przez dokładny commit oficjalnego repozytorium oraz wersjonowany manifest 551
plików i dopiero potem uruchamiany offline. Manifest odwzorowuje reviewowany
snapshot pakietu OWASP, ale nie kopiuje treści reguł do repozytorium; obowiązuje
Semgrep Rules License 1.0 i wyłącznie wewnętrzne użycie biznesowe. Własne
reguły Kwotum są wersjonowane w repo,
mają fixture'y pozytywne i negatywne oraz blokują między innymi dynamiczny kod,
raw HTML, shell, słabe hashe, nieuprawnione użycie service role, wyciek błędu
API, wyłączenie TLS i serwerowe `Math.random()`.

Kontener nie ma sieci, capabilities ani zapisywalnego root filesystemu. Kod
jest montowany tylko do odczytu, metryki i sprawdzanie wersji są wyłączone, a
wynik w trybie `--strict --error` blokuje PR. Wszystkie zewnętrzne GitHub
Actions są przypięte do pełnych commit SHA. Gitleaks pełnej historii,
dependency audit, lokalny SAST, testy RLS i review nadal pozostają osobnymi,
obowiązkowymi kontrolami.

**Dlaczego:** CodeQL wykonał analizę, ale GitHub odrzuca publikację SARIF bez
płatnego GitHub Code Security dla tego prywatnego repozytorium. Wyłączenie
uploadu nie dawałoby egzekwowalnego gate'u, a komercyjne użycie samego CodeQL
CLI nie jest przyjmowane jako obejście licencji. Semgrep CE jest dostępny bez
zakupu planu i pozwala utrzymać powtarzalny, blokujący SAST bez wysyłania kodu
do usługi zewnętrznej.

**Konsekwencje:** Semgrep CE analizuje głównie pojedynczy plik i procedurę; nie
zastępuje międzyplikowego dataflow CodeQL, pentestu ani review człowieka.
Zmiana upstreamowych reguł wymaga jawnej aktualizacji commita i manifestu,
porównania składu, licencji oraz osobnego commita; brak pliku, inna liczba albo
inny commit powodują fail-closed. Powrót do CodeQL jest możliwy po zakupie
odpowiedniego planu, ale nie usuwa Semgrep bez osobnej decyzji i porównania
pokrycia.

Obecny plan prywatnego repozytorium nie udostępnia branch protection, więc
GitHub nie wymusza statusów przed merge. Do czasu GitHub Pro zielone Quality
Gate, Gitleaks, Semgrep i WordPress na jednym SHA są ręczną, obowiązkową bramką
właściciela; nie wolno merge'ować czerwonego lub niepełnego przebiegu.

## ADR-039: wersjonowana polityka kontaktu i tenantowy adres alertów o leadach

**Status:** accepted dla przygotowania pilotażu Fortez na podstawie decyzji
właściciela produktu z 2026-08-10

**Decyzja:** immutable snapshot opublikowanej wersji procesu otrzymuje
`leadCaptureSchemaVersion: 2` oraz jawną `contactPolicy`. W pierwszej wersji
obsługujemy dwie polityki: `email_required` i `phone_required`. Istniejące
snapshoty v1 zachowują dotychczasową semantykę `email_required`; nie są
przepisywane ani unieważniane. Publiczny manifest ujawnia wyłącznie wybraną
politykę, aby widget mógł pokazać właściwe pola i oznaczenia wymagania. Serwer
ponownie waliduje ją z immutable snapshotu i nie ufa samemu payloadowi klienta.
Każdy lead musi mieć co najmniej e-mail albo telefon. Zgoda marketingowa e-mail
bez adresu e-mail jest odrzucana. Potwierdzenie dla klienta powstaje tylko, gdy
lead podał e-mail.

Adres powiadomień firmy jest osobną tenantową konfiguracją, niezależną od konta
użytkownika i adresu właściciela organizacji. Owner albo Admin ustawia jeden
znormalizowany adres `lead_alert_email` przez kontrolowany zapis po stronie
serwera. Sales nie odczytuje ani nie zmienia konfiguracji. Outbox utrwala
snapshot odbiorcy w chwili utworzenia leada. Dla organizacji bez konfiguracji
pozostaje kompatybilny fallback do najstarszego aktywnego Ownera; jego użycie
jest stanem przejściowym, a nie docelową konfiguracją pilota. Publicznego adresu
Fortez ani innych rzeczywistych danych klienta nie zapisujemy w repozytorium —
wartość zostanie ustawiona dopiero w tenantowej konfiguracji środowiska.

**Dlaczego:** w branżach wymagających szybkiego oddzwonienia, w tym w pilotażu
Fortez, telefon jest podstawowym kanałem, a e-mail klienta nie zawsze jest
dostępny. Jednocześnie firma może nie obsługiwać panelu, zaś firmowy adres
kontaktowy może przekazywać wiadomości do istniejącej skrzynki. Wiązanie alertu
z kontem Ownera wymuszałoby sztuczne konto albo wysyłkę do niewłaściwej osoby.
Jawna polityka w wersji procesu i niezależny adres odbiorczy rozwiązują oba
problemy bez osłabiania tenant isolation.

**Konsekwencje:** `leads.contact_email` staje się nullable, a aplikacja, eksport,
webhook i panel muszą bezpiecznie obsłużyć lead telefoniczny. Migracja jest
forward-only i dodaje ograniczenie wymagające co najmniej jednego kanału
kontaktu. Rollback aplikacji nie cofa schematu: snapshoty v2 pozostają poprawne,
więc starszej wersji aplikacji nie wolno wdrożyć bez feature gate blokującego
procesy `phone_required`. Wyłączenie nowej konfiguracji pozostawia historyczne
snapshoty odbiorców w outboxie, a organizacje bez wpisu nadal korzystają z
fallbacku Ownera. Przed dopuszczeniem prawdziwych leadów wymagane są negatywne
testy RLS, UAT leada bez e-maila i kontrola rzeczywistej dostawy na skonfigurowany
adres firmy.

## ADR-040: serwerowa brama publicznego formularza z tenantową allowlistą originów

**Status:** accepted dla podetapu FTZ-03A przygotowania pilotażu Fortez na
podstawie polecenia kontynuacji właściciela produktu z 2026-08-10

**Decyzja:** wszystkie przeglądarkowe endpointy formularza przechodzą przez
jedną serwerową bramę przed wykonaniem operacji domenowej. Brama rozpoznaje
opublikowany proces po `public_id` albo sesję wyłącznie po hashu tokenu,
sprawdza dokładny znormalizowany origin oraz atomowo zużywa limity zapisane w
PostgreSQL. Dozwolone originy są konfiguracją konkretnego procesu i
organizacji, zarządzaną wyłącznie przez Ownera albo Admina. Zastąpienie listy
blokuje wiersz procesu, aby dwa równoczesne zapisy nie złożyły konfiguracji.
Hosted link z originu `APP_URL` pozostaje dozwolony. Żądanie przeglądarkowe z innym originem
jest odrzucane przed odczytem manifestu i przed każdą mutacją. Odpowiedź CORS
odzwierciedla wyłącznie zatwierdzony origin, dodaje `Vary: Origin` i nigdy nie
używa wildcardu.

Limiter jest rozproszony, ponieważ jego liczniki i stałe okna znajdują się w
PostgreSQL, a nie w pamięci bezstanowej instancji aplikacji. Stosuje osobne
budżety zależne od rodzaju operacji dla zahashowanego adresu klienta, originu,
procesu, sesji i organizacji. Baza przechowuje wyłącznie HMAC-SHA-256 adresu IP
oraz nieodwracalne hashe kluczy kubełków; surowy IP nie jest zapisywany ani
logowany. Na Vercel źródłem adresu jest nadpisywany przez platformę
`x-vercel-forwarded-for`. Poza środowiskiem lokalnym brak zaufanego nagłówka
powoduje odrzucenie żądania. Odpowiedź 429 zawiera `Retry-After`.

Publiczne RPC wykonujące operacje formularza tracą grant `anon`. Route
Handlery po pozytywnym przejściu bramy używają serwerowego klienta wyłącznie do
wąskich, `security definer` RPC. Dzięki temu bezpośrednie wywołanie Supabase nie
omija origin allowlisty ani limitera. Service role nie trafia do klienta i nie
jest używana w zwykłym ruchu panelu. Preflight bez tokenu może potwierdzić
jedynie, czy origin występuje przy dowolnym aktywnym procesie; właściwe żądanie
zawsze ponownie sprawdza origin dla konkretnego procesu lub sesji.

**Dlaczego:** CORS jest kontrolą przeglądarki, a nie uwierzytelnieniem. Samo
zastąpienie `*` allowlistą w Next.js pozostawiłoby anonimowe RPC Supabase jako
pełne obejście. Limiter w pamięci pojedynczej funkcji również nie zapewnia
globalnego budżetu po skalowaniu lub restarcie. Tenantowa konfiguracja pozwala
uruchomić ten sam SaaS na domenach różnych klientów bez globalnego rozszerzania
zaufania.

**Konsekwencje:** przed osadzeniem procesu operator musi zapisać dokładny origin
witryny, na przykład `https://example.pl`; ścieżki i wildcardy nie są
akceptowane. Brak konfiguracji blokuje osadzenie cross-origin, ale nie hosted
link. Brak nagłówka `Origin` nie jest traktowany jako uwierzytelnienie i dlatego
nadal podlega limitom. Migracja jest expand-and-restrict: nowa tabela originów i
prywatne kubełki są zgodne ze starszą aplikacją, lecz po odebraniu grantu `anon`
rollback wymaga najpierw ponownego wdrożenia wersji korzystającej z bramy albo
czasowego przywrócenia grantów według runbooka. Kubełki wygasają i mogą zostać
usunięte bez wpływu na dane biznesowe. Adaptacyjny Turnstile jest osobnym
podetapem FTZ-03B; ADR-041 zamyka jego implementację lokalną, ale konfiguracja i
smoke środowiska nadal blokują produkcyjny GO.

## ADR-041: adaptacyjny Turnstile na finalnym zapisie leada

**Status:** accepted dla podetapu FTZ-03B przygotowania pilotażu Fortez na
podstawie polecenia kontynuacji właściciela produktu z 2026-08-10

**Decyzja:** każde produkcyjne wysłanie leada wymaga świeżego tokenu Cloudflare
Turnstile. Widget używa jawnego renderowania z `appearance: interaction-only`
oraz `execution: execute`: element weryfikacyjny pozostaje niewidoczny, gdy
Cloudflare nie wymaga interakcji, ale nie tworzymy własnego, nieaudytowalnego
scoringu ryzyka. Token jest dołączany wyłącznie do finalnego żądania submit i
nie jest zapisywany w bazie, analytics ani logach. Tryb podglądu procesu nie
tworzy leada i dlatego korzysta z lokalnego adaptera bez providera.

Route Handler po pozytywnym origin/rate guardzie, walidacji tokenu sesji i
payloadu, lecz przed RPC tworzącym lead, wywołuje serwerowe Siteverify. Wymaga
`success`, zgodnej akcji `kwotum_lead_submit`, dozwolonego hosta oraz świeżego
wyniku. Zaufany adres klienta jest przekazywany jako opcjonalny `remoteip`, ale
nie jest utrwalany. `mutationId` jest `idempotency_key` walidacji, dzięki czemu
jedno automatyczne ponowienie Siteverify po błędzie sieci używa tej samej
operacji. Timeout, błąd providera, brak konfiguracji poza local, niezgodny host
lub akcja oraz token zużyty, nieważny lub wygasły kończą się fail-closed przed
zapisem leada. Ponowienie przez użytkownika zawsze pobiera nowy token, ponieważ
token Turnstile jest jednorazowy.

Publiczny site key i stała akcja są dokładane przez warstwę HTTP do manifestu
runtime; immutable snapshot procesu i baza nie przechowują klucza providera.
Sekret pozostaje wyłącznie po stronie serwera. Local może działać bez Turnstile
tylko wtedy, gdy oba klucze są nieobecne; preview, staging i production
wymagają kompletnej pary i blokują publiczną ścieżkę przy błędnej konfiguracji.
Testy integracyjne używają wyłącznie oficjalnych kluczy testowych Cloudflare.

Host aplikacji i wszystkie hosty osadzenia muszą być jawnie wpisane w ustawienia
widgetu Cloudflare. CSP aplikacji i hosta klienta dopuszcza wyłącznie oficjalny
origin challenge w `script-src` i `frame-src`; skrypt nie jest proxy'owany ani
cache'owany przez Kwotum. Nie włączamy pre-clearance, nie uzależniamy działania
od cookies Cloudflare i nie traktujemy Turnstile jako zamiennika walidacji,
origin allowlisty, limitera ani kontroli uprawnień.

**Dlaczego:** sprawdzanie wyłącznie po stronie klienta jest możliwe do ominięcia,
a własny próg „podejrzanego” ruchu byłby trudny do wyjaśnienia, strojenia i
testowania przed pierwszym pilotem. Managed challenge pozwala providerowi
adaptować poziom tarcia, a obowiązkowe Siteverify utrzymuje jedną jednoznaczną
bramę bezpieczeństwa przed utworzeniem danych biznesowych.

**Konsekwencje:** awaria Turnstile może czasowo zablokować nowe leady Kwotum;
pilot zachowuje więc dotychczasowy formularz lub kanał kontaktu jako jawny
fallback operacyjny. Rollback aplikacji nie może po cichu wyłączyć weryfikacji:
należy najpierw odłączyć embed albo przywrócić poprzedni kanał, a dopiero potem
wycofać aplikację. Rotacja kluczy wymaga skoordynowanej zmiany Cloudflare i
sekretów środowiska. Turnstile staje się kolejnym subprocessorem wymagającym
zatwierdzenia prawnego i pozostaje pozycją produkcyjnego GO mimo ukończenia
implementacji lokalnej.

## ADR-042: odseparowany Vercel Cron, prywatny heartbeat i probe outboxu

**Status:** accepted dla lokalnej implementacji FTZ-04 na podstawie polecenia
kontynuacji właściciela produktu z 2026-08-11

**Decyzja:** produkcyjny outbox `notifications` i `flow_invitations` jest
przetwarzany co pięć minut przez Vercel Cron. Ponieważ Vercel wykonuje cron jako
HTTP GET i automatycznie przekazuje tylko `CRON_SECRET`, istniejący ręczny POST
z `NOTIFICATION_WORKER_SECRET` pozostaje bez zmian, a GET otrzymuje odrębne
uwierzytelnienie. Oba wywołania korzystają z tej samej idempotentnej logiki
claim/retry i nie ufają nagłówkowi User-Agent jako kontroli dostępu.

Baza utrzymuje jeden prywatny heartbeat na źródło `cron`/`manual`, z UUID
bieżącego runu, czasami, wynikiem i wyłącznie zagregowanymi licznikami. Start
nowego runu zastępuje bieżący token; późne zakończenie starszego, nakładającego
się runu nie może nadpisać nowszego stanu. Narrow RPC są dostępne wyłącznie dla
service role. Osobny `MONITORING_PROBE_SECRET` chroni zagregowany probe kolejki;
nie współdzieli uprawnień z cronem ani ręcznym workerem.

Probe zwraca 503 dla brakującego/starego/nieudanego/zawieszonego schedulera,
wieku `pending/retry` ponad 10 minut, locku ponad 15 minut i nierozwiązanego
`failed`. Nie zwraca tenantów, odbiorców, treści, payloadów ani danych
dostawcy. Readiness aplikacji nie zależy od outboxu, aby awaria dostawy e-mail
nie wycofywała zdrowych instancji obsługujących formularz.

**Dlaczego:** sam fakt regularnego wejścia na route nie dowodzi, że worker
kończy się sukcesem, a Vercel nie ponawia nieudanego cron joba. Wspólny sekret
rozszerzałby skutki kompromitacji, a publiczny szczegółowy probe ujawniałby stan
biznesowy kolejki. Heartbeat w bazie działa niezależnie od bezstanowej instancji
i pozwala zewnętrznemu monitorowi wykryć zarówno ciszę schedulera, jak i
narastanie kolejki.

**Konsekwencje:** `CRON_SECRET`, `MONITORING_PROBE_SECRET` i
`NOTIFICATION_WORKER_SECRET` muszą być różnymi, Production-only sekretami.
Vercel Pro Trial pozwala na cykl pięciominutowy, ale downgrade do Hobby łamie
kontrakt; przed końcem triala wymagany jest plan Pro/Enterprise lub zatwierdzony
zastępczy scheduler. Migracja jest forward-only. Rollback zatrzymuje cron przed
cofnięciem aplikacji i pozostawia kolejki oraz heartbeat w bazie. FTZ-04 nie
jest zamknięte, dopóki migracja, sekrety, niezależny alert i syntetyczna dostawa
nie zostaną potwierdzone na jednym immutable SHA.

## ADR-043: historyczna projekcja odpowiedzi leada do prezentacji

**Status:** accepted dla korekty jakości briefu pierwszego pilotażu Fortez na
podstawie produkcyjnego UAT z 2026-08-11

**Decyzja:** `lead_answers.answer` pozostaje niezmienioną, surową odpowiedzią
sesji. Klucze opcji są nadal źródłem dla routingu, pricingu, scoringu, audytu i
integracji. Osobne `lead_answers.display_answer` przechowuje tenantową projekcję
przeznaczoną wyłącznie do prezentacji w panelu i powiadomieniach. Projekcja
powstaje przy zapisie odpowiedzi leada z etykiet
opcji w dokładnie tym immutable `flow_versions.snapshot`, na który wskazuje
lead. Nie korzysta z bieżącego draftu ani późniejszej publikacji procesu.

Wybór pojedynczy i wielokrotny zachowują odpowiednio etykietę oraz kolejność
etykiet, a techniczny sentinel `__unknown__` jest prezentowany jako „Do
ustalenia”. Tekst, liczba i wartość logiczna zachowują swój typ. Brak pasującej
etykiety nie usuwa odpowiedzi: kontrolowany fallback zachowuje surową wartość.
Migracja backfilluje istniejące leady przez złożony tenantowy join i ustawia
projekcję triggerem dla nowych insertów, także gdy przez krótki czas działa
poprzednia wersja aplikacji. Panel czyta pole przez dotychczasowe RLS
`lead_answers`; nie rozszerzamy Sales dostępu do edytorskich `flow_versions`.

**Dlaczego:** techniczne klucze są stabilnym kontraktem logiki, ale nie są
czytelną odpowiedzią dla firmy. Nadpisanie surowego pola zniszczyłoby
wyjaśnialność obliczeń, a rozwiązywanie etykiet z aktualnego draftu mogłoby
zmieniać historyczny brief. Odczyt snapshotu bezpośrednio przez panel
rozszerzałby uprawnienia ról operacyjnych i powielał logikę w wielu
powierzchniach.

**Konsekwencje:** migracja jest forward-only. Rollback aplikacji może
ignorować nowe pole, podczas gdy trigger nadal utrzymuje spójną projekcję;
kolumny ani backfillu nie usuwamy. Każdy nowy typ odpowiedzi lub zmiana
kontraktu opcji wymaga parytetowego testu surowej wartości i prezentacji.
Historycznej wiadomości już dostarczonej przez providera nie da się zmienić;
poprawka obejmuje panel istniejącego leada oraz kolejne claimy outboxu bez
automatycznego ponawiania zakończonej dostawy. Nowy biały renderer jest
utrwalony jako `lead-customer-v2`, `lead-company-v2` i `flow-invitation-v2`.
Rekordy v1 pozostają legalne i zawsze korzystają z zamrożonych rendererów v1,
aby retry z tym samym kluczem idempotencji nie zmieniało treści. Rollout wymaga
krótkiej pauzy workerów pomiędzy migracją włączającą nowe wersje a wdrożeniem
aplikacji obsługującej oba kontrakty.

## ADR-044: ograniczony branding wnętrza osadzonego widgetu

**Status:** accepted dla poprawki wizualnej pierwszego pilotażu Fortez na
podstawie produkcyjnego UAT z 2026-08-11

**Decyzja:** osadzony `<wyceno-widget>` otrzymuje opcjonalne, prezentacyjne
atrybuty `brand-name`, `brand-subtitle` i `brand-logo-url` oraz jawny zestaw
zmiennych CSS `--wyceno-widget-*` opisujących role kolorów, typografii,
geometrii, cienia, tła dialogu i szerokości logo. Renderer mapuje wyłącznie te
role na prywatne tokeny wewnątrz Shadow DOM; nie udostępnia `::part`, surowego
arkusza CSS, HTML ani skryptu klienta.

Logo może być względnym lub absolutnym adresem HTTP(S) bez danych logowania,
ale po rozwiązaniu musi mieć ten sam origin co strona gospodarza. Jest
renderowane jako dekoracyjny obraz obok tekstowej nazwy marki, z inicjałami
nazwy jako kontrolowanym fallbackiem. Nieudany, niedozwolony lub brakujący URL
nie wykonuje kodu, a obraz nie przekazuje nagłówka `Referer` i jest ładowany w
trybie anonimowego CORS. Walidacja obejmuje URL pierwszego requestu; redirecty
HTTP pozostają odpowiedzialnością serwera gospodarza i jego `img-src` CSP.
Integrator musi wskazać statyczny, nieprzekierowujący asset. Nazwa i podtytuł
są zawsze wstawiane przez `textContent`.

Kontrakt dotyczy instalacji na stronie gospodarza. Nie zmienia publicznego
manifestu, wersji procesu, bazy, RLS, hosted linku ani podglądu w panelu.
Automatyczne przechowywanie brandingu tenanta i jego publikacja na wszystkich
powierzchniach pozostają osobnym etapem wymagającym kontrolowanego storage,
walidacji Owner/Admin, publicznej projekcji bez `organization_id` i testów
izolacji dwóch tenantów.

**Dlaczego:** Shadow DOM prawidłowo chroni formularz przed agresywnym CSS
gospodarza, ale dotychczas pozwalał dopasować wyłącznie launcher. Wnętrze
pozostawało zielone, używało zastępczych inicjałów tytułu procesu i nie mogło
pokazać logo klienta. Próba przebicia izolacji selektorami strony byłaby krucha,
a dodanie Fortez do kodu SaaS złamałoby wielodostępność. Ograniczone role dają
powtarzalny kontrakt dla kolejnych instalacji bez rozszerzania dostępu do danych
ani uruchamiania dowolnego kodu.

**Konsekwencje:** integrator odpowiada za kontrast przekazanych wartości, a
testy referencyjnych presetów muszą potwierdzać WCAG AA. Domyślne wartości
Kwotum zachowują kompatybilność istniejących embedów. Zmiana atrybutów marki nie
może restartować sesji ani zastępować DOM aktywnego formularza. Role kolorów są
używane wyłącznie w właściwościach akceptujących kolor, więc wartość `url(...)`
jest nieważna i nie uruchamia pobrania. Popup ma strukturalny slot nagłówka dla
statusu i przycisku zamknięcia, dzięki czemu kontrolki nie nachodzą na siebie.
Migracja nie jest potrzebna; rollback polega na usunięciu nowych atrybutów i
zmiennych z embedu oraz cofnięciu wersji widgetu.

## ADR-045: finalny sidebar Kwotum 256/72 i lokalny Instrument Sans

**Status:** accepted dla etapu P1 rebrandingu panelu na podstawie
zaakceptowanej referencji i specyfikacji właściciela z 2026-08-13

**Decyzja:** wspólny desktopowy sidebar `/panel/[organizationId]` pozostaje
jednym komponentem z capability-gated konfiguracją, ale przyjmuje płaski język
Kwotum: 256 px w stanie rozwiniętym, 72 px w stanie zwiniętym, tło `#0d2b24`,
trzy nazwane grupy oraz jasną aktywną zakładkę dochodzącą do prawej krawędzi i
zakończoną dwoma ścięciami. Nie używa gradientu, poświaty, blur, tekstury,
cienia ani powierzchni glass. App shell ma jedno źródło szerokości
`--kw-sidebar-width`; trasy i ekrany nie otrzymują lokalnych `margin-left`.

Tokeny `--kw-sidebar-*` są ograniczonym, semantycznym kontraktem komponentu
zdefiniowanym centralnie w `packages/ui`. Istniejące role `--wy-*` nadal sterują
pozostałymi powierzchniami. Aktywna pozycja zachowuje fokus na nieprzyciętym
linku, a kształt tworzy pseudo-element. Collapse zachowuje techniczny klucz
`lorum:panel-sidebar-collapsed` wymagany przez ADR-033. Poniżej 56 rem nadal
działa dotychczasowa mobilna dolna nawigacja i dialog „Więcej”.

Sidebar używa lokalnego Instrument Sans Variable przez `next/font/local` bez
CDN. Plik pochodzi z repozytorium `Instrument/instrument-sans`, commit
`7fa22308a3d0c94ee2b3cd537a1196b65db34a3e`, jest objęty SIL OFL 1.1 i ma
SHA-256 `aa72922aafcc0dc18f36ec1d805b0212057dabe8b9d5b8b57f67035aea1b826d`.
Font jest aktywowany wyłącznie w sidebarze; pozostały interfejs pozostaje poza
zakresem P1.

**Dlaczego:** wcześniejszy wariant 240/78 używał radialnych świateł,
dekoracyjnych gradientów, półprzezroczystych powierzchni i cieni, przez co był
sprzeczny z zaakceptowanym kierunkiem Kwotum. Nowa referencja rozstrzyga
charakter marki i dokładną geometrię obu stanów bez rozszerzania funkcji.

**Konsekwencje:** testy shellu i buildera przyjmują 256/72 px oraz ponownie
mierzą dostępny workspace. Nazwa `Dashboard` zmienia się na `Przegląd`
wyłącznie w nawigacji; istniejąca trasa organizacji pozostaje bez zmian.
Serwerowe źródła organizacji, profilu, capabilities, auth i tenant scope nie są
modyfikowane. Rollback usuwa font i tokeny P1, przywraca 240/78 oraz poprzedni
CSS, nie dotykając danych ani preferencji użytkownika.
