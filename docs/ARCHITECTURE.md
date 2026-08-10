# Architektura

## Decyzja

Modularny monolit w monorepo pnpm + Turborepo. `apps/web` udostępnia marketing, panel i API w Next.js App Router. Domeny są rozdzielone modułowo, ale wdrażane razem na początku. Publiczny widget jest osobnym, lekkim artefaktem. PostgreSQL/Supabase zapewnia Auth, Storage i RLS.

## Granice

- `apps/web`: kompozycja UI, server actions/route handlers, marketing i panel;
- `packages/types`: stabilne typy bez runtime;
- `packages/validation`: schematy wejścia współdzielone przez klientów i serwer;
- `packages/database`: repozytoria i jawny kontekst organizacji;
- `packages/widget`: state machine renderera, bez dostępu do panelu;
- `packages/ui`: tokeny i komponenty, bez logiki domenowej;
- `packages/email`, `analytics`, `testing`, `config`: wyspecjalizowane adaptery.

## Przepływ żądania

Klient → walidacja transportowa → uwierzytelnienie/rate limit → autoryzacja i tenant context → usługa domenowa → repozytorium/RLS → event/audit → bezpieczna odpowiedź. Panel i widget używają tych samych wersjonowanych kontraktów API, lecz innych zakresów uprawnień.

## Publiczny widget

Natywny web component + Shadow DOM bez frameworka runtime, zgodnie z pomiarem i
ADR-015. Loader jest idempotentny i lazy. Widget otrzymuje wyłącznie publiczną,
allowlistowaną projekcję opublikowanej wersji. Zawiera ona bezpieczne reguły
nawigacji potrzebne offline; pricing, scoring, reguły operacyjne i dane innych
sesji nie są zwracane. Nowa sesja dostaje manifest atomowo z przypiętej wersji.
Po ukończeniu procesu oddzielne RPC oblicza pricing i prywatny scoring z
zapisanych odpowiedzi. Widget otrzymuje tylko bezpieczną projekcję pricingu;
konfiguracja, scoring i explainability pozostają po stronie serwera.

Etap 7 rozszerza bezpieczny manifest o wersjonowaną konfigurację kontaktu i
potwierdzeń. Po ukończeniu sesji atomowe RPC ponownie liczy wynik, kopiuje
odpowiedzi i tworzy jeden tenantowy lead. Pliki przechodzą przez wąski Route
Handler service-role na uprzednio zarezerwowaną prywatną ścieżkę. Panel
odczytuje leady normalnym klientem użytkownika przez `TenantContext` i RLS;
service role nie uczestniczy w odczytach ani zmianie statusu.

Etap 12U wprowadza `FlowDocument v2` bez nowej tabeli i bez drugiego modelu
kolejności. Sekcje oraz typowane ograniczenia należą do tego samego agregatu
JSONB co kroki. Czytnik przyjmuje v1/v2, zapis buildera emituje v2, a immutable
wersje v1 nie są przepisywane. Manifest v2 pomija sekcje i udostępnia jedynie
allowlistowane ograniczenie potrzebne rendererowi; PostgreSQL ponownie je
egzekwuje przy zapisie odpowiedzi.

Etap 8 rozszerza transakcję submitu o tenantowy outbox. Worker poza ścieżką
żądania pobiera gotowe rekordy przez wąskie RPC z blokadą
`FOR UPDATE SKIP LOCKED`, renderuje wersjonowany HTML/text i zapisuje historię
prób. Tryb testowy i adapter dostawcy używają tego samego kontraktu; różnią się
wyłącznie transportem. Wewnętrzny Route Handler jest chroniony osobnym sekretem
i zwraca tylko zagregowane liczniki.

Etap 9 dodaje first-party analytics. Widget buforuje zamknięte eventy wyłącznie
w pamięci do jawnej decyzji consentu; odmowa nie blokuje procesu. PostgreSQL
przypina event do tenantowej sesji i immutable wersji flow, a panel pobiera
wyłącznie serwerowy agregat z progiem małej próby. Nie ma zewnętrznego SDK ani
zapytania dashboardu do surowego draftu.

Etap 10 dodaje statyczną warstwę marketingową code-first w route group
`(marketing)`. Typowana allowlista jest wspólnym źródłem dla stron branżowych,
funkcyjnych i sitemap. Strony są Server Components; wyjątkiem jest mały,
bezsieciowy fragment demo bez persystencji. Origin canonical i schema pochodzi
z `APP_URL`. Powierzchnie prywatne mają osobne `noindex` i nie występują w
sitemap, ale kontrola indeksacji nie zastępuje Auth, tokenów ani RLS.

## Zasady

- opublikowane wersje są niezmienne;
- logika domenowa nie trafia do komponentów;
- brak zapytań do bazy z losowych komponentów;
- brak dowolnego `eval`; pricing/scoring używają ograniczonego AST reguł;
- asynchroniczne e-maile i webhooki używają outbox/retry, a submit ma idempotency key;
- przejście na mikroserwisy tylko po danych o skalowaniu, nie przed MVP.

## Docelowe budżety

Marketing: minimalny JS, hero bez ciężkiego demo. Widget ma twardy build budget
≤ 90 KB gzip kodu własnego; Etap 5 osiąga około 10,6 KiB. Manifest ma limit
100 KB gzip, a źródłowy snapshot 256 KiB. Brak długiego zadania > 50 ms na
typowym telefonie średniej klasy i API p95 < 500 ms pozostają do pomiaru
terenowego, ponieważ lokalny test nie zastępuje danych produkcyjnych.

Po Etapie 9 bundle widgetu ma około 15,5 KiB gzip. Silnik referencyjny,
formatowanie i zapis domenowy pozostają po stronie serwera; publiczny artefakt
nie zawiera prywatnej logiki reguł ani kodu dostawy e-mail. Analityka nie dodaje
zewnętrznego runtime.

Marketing Etapu 10 ma lokalny budżet maksymalnie 250 KiB transferu JavaScriptu
na stronie głównej, sprawdzany w produkcyjnym buildzie Playwrightem. Strony
branżowe i funkcyjne są prerenderowane. Field CWV pozostają do pomiaru po
uruchomieniu na docelowym CDN i urządzeniach użytkowników.
