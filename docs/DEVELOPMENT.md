# Środowisko deweloperskie

## Wymagania

- Node.js 24.18.0 LTS — wersja z `.node-version` i `.nvmrc`;
- pnpm 11.17.0 — dokładna wersja z `packageManager`;
- Git 2.x.
- Docker Desktop do lokalnego Supabase i izolowanego skanu Semgrep CE.
- PostgreSQL 17 (`initdb`, `pg_ctl`, `psql`) do lokalnego testu RLS albo pusta
  baza wskazana przez `RLS_TEST_DATABASE_URL`.

Node 26 Current może uruchomić narzędzia lokalnie w okresie przejściowym, ale CI i docelowy runtime używają Node 24.18.0 LTS. Nie aktualizuj runtime’u bez sprawdzenia Next.js, Vitest i natywnych zależności.

## Bootstrap

```bash
git clone <repository-url>
cd Wyceno
corepack enable
corepack prepare pnpm@11.17.0 --activate
pnpm install --frozen-lockfile
cp .env.example apps/web/.env.local
```

Nie uzupełniaj sekretów, których bieżący etap nie używa.
`apps/web/.env.local` jest ignorowany. Next.js ładuje pliki env względem
katalogu `apps/web`; plik `.env.local` utworzony wyłącznie w root repozytorium
nie zostanie wczytany.

Nie używaj `npm run dev`. npm wykonuje własną kontrolę `devEngines` na
systemowym Node i przy Node 26 zwróci `EBADDEVENGINES`, ponieważ projekt
przypina runtime 24.18.0. Poprawny start to:

```bash
pnpm exec node --version
pnpm dev
```

Pierwsza komenda powinna zwrócić `v24.18.0`. Alternatywnie, jeżeli używasz nvm:

```bash
nvm install 24.18.0
nvm use
pnpm dev
```

## Co można zobaczyć lokalnie

Po samym `pnpm dev` otwórz:

- `http://localhost:3000` — landing page i działający fragment demo;
- `http://localhost:3000/branze` — strony branżowe;
- `http://localhost:3000/funkcje` — strony funkcji;
- `http://localhost:3000/cennik` — cennik pilotażowy;
- `http://localhost:3000/design-system` — wewnętrzny showcase UI.

Te powierzchnie nie wymagają bazy. `/logowanie`, `/panel`, hosted flow,
rzeczywiste leady i analityka wymagają Supabase.

### Auth i panel z Supabase

Wybierz jeden wariant:

1. Lokalny Supabase: zainstaluj i uruchom Docker Desktop, następnie użyj
   Supabase CLI do inicjalizacji lokalnej konfiguracji, startu usług i
   załadowania migracji.
2. Hostowany projekt deweloperski Supabase: utwórz osobny projekt bez danych
   produkcyjnych, połącz CLI i wgraj migracje po ich sprawdzeniu.

Do `apps/web/.env.local` przepisz wartości środowiska deweloperskiego:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local-publishable-or-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<local-service-role-key>
DATABASE_URL=<local-postgres-url>
```

Nie commituj tych wartości. Bieżący interfejs udostępnia rejestrację hasłem
i Google OAuth, a kontrolowany bootstrap tworzy profil, pierwszą organizację
oraz aktywne członkostwo Ownera. Do lokalnego visual QA można zamiast tego
utworzyć jawnie syntetycznego użytkownika i organizację, której `created_by`
wskazuje UUID tego użytkownika. Trigger automatycznie doda go jako aktywnego
Ownera. Ręczny seed nie jest produkcyjnym onboardingiem i może działać
wyłącznie na loopback/local.

Po uruchomieniu Dockera pierwszy lokalny start wykonaj z katalogu repozytorium:

```bash
supabase init
supabase start
supabase db reset --local
supabase status -o env
```

`supabase init` jest potrzebne tylko raz i tworzy `supabase/config.toml`.
`db reset --local` usuwa wyłącznie lokalne dane oraz ponownie odtwarza schemat
z migracji; nie dodawaj flagi `--linked`. Z wyniku `supabase status -o env`
przepisz lokalny URL, anon/publishable key, service-role key i URL bazy do
odpowiednich nazw w `apps/web/.env.local`, po czym zrestartuj `pnpm dev`.

Adres Supabase Studio pokaże `supabase status`. W Studio, wyłącznie gdy
potrzebujesz ręcznego konta syntetycznego zamiast sprawdzenia rzeczywistej
rejestracji:

1. utwórz syntetycznego użytkownika e-mail/hasło w Auth;
2. skopiuj jego UUID;
3. wykonaj w SQL Editor:

```sql
insert into public.organizations (name, slug, created_by)
values ('Firma demonstracyjna', 'firma-demonstracyjna', '<UUID użytkownika>');
```

Następnie zaloguj się tym użytkownikiem pod
`http://localhost:3000/logowanie`. Nie używaj tych danych ani tego hasła poza
lokalnym środowiskiem.

## Codzienna weryfikacja

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
pnpm start
```

W aplikacji Next.js `typecheck` najpierw uruchamia `next typegen`, a następnie
`tsc --noEmit`. Dzięki temu kontrola typów działa również po `pnpm clean`, gdy
katalog `.next` nie istnieje.

`pnpm start` uruchamia artefakt standalone wygenerowany przez `next build`.
Adres można zmienić przez zmienne środowiskowe `HOSTNAME` i `PORT`.
Lokalny start wczytuje opcjonalny, ignorowany `apps/web/.env.local`; środowiska
hostowane nadal przekazują konfigurację przez zmienne procesu. Ustaw
`DEPLOYMENT_ENV=production` na docelowym środowisku — build odrzuci wtedy
brakujący, nie-HTTPS lub loopbackowy `APP_URL`.
Build kopiuje statyczne zasoby do artefaktu standalone przez
`apps/web/scripts/prepare-standalone.mjs`. Po każdym buildzie
`apps/web/scripts/verify-runtime-artifact.mjs` sprawdza, czy upload zdjęć ma
w trace natywny binding `sharp` i właściwe `libvips` dla platformy runnera,
uruchamia realne przetworzenie obrazu z artefaktu standalone oraz potwierdza,
że strony edytora i ustawień nie ładują tej natywnej zależności. Brak któregokolwiek
elementu zatrzymuje build przed wdrożeniem. Wcześniej
`apps/web/scripts/copy-widget.mjs` kopiuje moduły `@wyceno/widget` i arkusz z
`packages/ui` do `/widget/v1/` oraz egzekwuje budżet 90 KiB gzip.

Pierwsze uruchomienie testów przeglądarkowych wymaga
`pnpm exec playwright install chromium`. `pnpm e2e` porównuje istniejące
baseline’y; `pnpm e2e:update` wolno wykonać dopiero po świadomym visual review.

Pełny, uwierzytelniony gate panelu uruchamiaj wyłącznie przeciw lokalnemu
Supabase:

```bash
pnpm e2e:panel
```

Komenda sprawdza, czy URL API i bazy są loopbackowe oraz zgodne z portami w
`supabase/config.toml`, buduje produkcyjny standalone, tworzy losowego
użytkownika i organizację, ładuje syntetyczny seed i uruchamia sekwencyjnie 16
scenariuszy panelu oraz bezstanowy podgląd procesu. E-mail i hasło istnieją
wyłącznie w pamięci procesu. Screenshoty trafiają do katalogu tymczasowego,
więc nie nadpisują zaakceptowanych artefaktów Visual QA. Blok `finally` usuwa
dane tenanta, obiekty Storage i konto Auth, a komenda kończy się sukcesem
wyłącznie po potwierdzeniu zera pozostałości. Nie kieruj tego harnessu do
stagingu ani produkcji.

`pnpm dev` uruchamia aktywne aplikacje workspace. `apps/web` udostępnia
`GET /health` oraz wewnętrzny, wyłączony z indeksowania showcase
`/design-system`. Etap 3 dodaje `/logowanie`, callback PKCE i chroniony
`/panel`.

`pnpm test` uruchamia testy jednostkowe oraz `pnpm test:rls`. Lokalny test RLS
tworzy klaster wyłącznie w katalogu tymczasowym, zatrzymuje go i usuwa po
zakończeniu. W CI wykorzystywany jest jednorazowy serwis PostgreSQL 17. Test
ładuje wszystkie migracje w kolejności nazw, następnie scenariusze tenancy,
domeny flow i sesji widgetu.

Kontrakt flow, walidator grafu i pięć szablonów znajdują się w
`@wyceno/validation`. Zmiana dokumentu wymaga testów TypeScript i PostgreSQL;
nie wolno aktualizować tylko jednego walidatora.

Renderer znajduje się w `@wyceno/widget`. Hosted link ma postać
`/f/:publicId`, a instrukcja embed i kontrakt API są w
`docs/WIDGET_IMPLEMENTATION.md`. Testy E2E interceptują wyłącznie publiczne API
syntetycznym fixture’em; kod produkcyjny nie ma trybu mock.

## Kontrole bezpieczeństwa

```bash
pnpm security:sast
pnpm security:secrets
pnpm security:dependencies
pnpm security:semgrep
```

Ostatnia komenda wymaga działającego Dockera, `git` i dostępu HTTPS wyłącznie do
pobrania dokładnego commita oficjalnych reguł. Skrypt sprawdza SHA commita,
kompletność 551 ścieżek w wersjonowanym manifeście, potem odcina sieć kontenera,
montuje repo tylko do odczytu, uruchamia 8 testów własnych reguł i pełny skan w
trybie strict. Kod nie jest wysyłany do Semgrep App. Zmiany commita, manifestu
lub digestu wymagają review licencji, changelogu, składu reguł i osobnego
commita; nie aktualizuj ich „do najnowszej” w celu uzyskania zielonego wyniku.

## Konfiguracja środowiska

`@wyceno/config` rozdziela kontrakty klienta i serwera. Do przeglądarki mogą trafić wyłącznie wartości jawnie wymienione w `clientEnvSchema`; klucz `SUPABASE_SERVICE_ROLE_KEY`, URL bazy, klucze Resend i sekrety podpisujące należą wyłącznie do serwera. Schematy są strict, dlatego przekazuj do parsera jawnie wybrany obiekt, a nie całe `process.env`.

Do Auth wymagane są `NEXT_PUBLIC_SUPABASE_URL` oraz
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Starszy anon key jest przejściowym
fallbackiem. Publishable key jest publiczny i bezpieczeństwo zapewnia RLS;
`SUPABASE_SERVICE_ROLE_KEY` nie może być importowany do klienta ani używany w
panelu.

Powiadomienia lokalne uruchamiaj z `EMAIL_DELIVERY_MODE=test`, poprawnym
`EMAIL_FROM` i losowym `NOTIFICATION_WORKER_SECRET` o długości co najmniej 32
znaków. Wywołanie `POST /api/v1/internal/notifications/process` z sekretem
przetwarza rzeczywisty outbox bez połączenia z dostawcą. Tryb `resend` wymaga
również `RESEND_API_KEY` i nie jest zatwierdzony do produkcji; pełny kontrakt
znajduje się w `docs/NOTIFICATIONS.md`.

## Polityka zależności

Wersje bezpośrednie są przypięte, lockfile jest obowiązkowy, peer dependencies
są rygorystyczne, a wydania młodsze niż siedem dni są blokowane. pnpm blokuje
też regresję pochodzenia publikacji oraz egzotyczne zależności tranzytywne.
Skrypty instalacyjne mogą wykonywać wyłącznie `sharp` i `unrs-resolver`, jawnie
wpisane w `allowBuilds`. Nowa zależność z lifecycle script zatrzyma instalację.
Dokładne, tymczasowe wyjątki i ich uzasadnienia są w
`docs/DEPENDENCIES.md`; nie rozszerzaj ich wildcardem.

## Troubleshooting

- `npm ERR! EBADDEVENGINES`: uruchom projekt przez `pnpm dev`; sprawdź
  `pnpm exec node --version`, które ma zwrócić `v24.18.0`.
- `ERR_PNPM_UNSUPPORTED_ENGINE`: użyj Node z `.node-version`.
- `/logowanie` lub `/panel` zwraca 500 z komunikatem o Supabase: uzupełnij
  `NEXT_PUBLIC_SUPABASE_URL` i publishable key w `apps/web/.env.local`, a
  następnie zrestartuj `pnpm dev`.
- `ERR_PNPM_IGNORED_BUILDS`: nie włączaj wszystkich skryptów; sprawdź pakiet, a decyzję dodaj do `pnpm-workspace.yaml` i `docs/DEPENDENCIES.md`.
- peer dependency error: dobierz wspierane wersje; nie wyłączaj `strictPeerDependencies`.
- błąd `minimumReleaseAge` albo `trustPolicy`: sprawdź pochodzenie i advisory;
  wyjątek może wskazywać tylko dokładnie zreviewowaną wersję i wymaga wpisu w
  `docs/DEPENDENCIES.md`.
- `Semgrep rules commit mismatch`, brak pliku albo niewłaściwa liczba wpisów:
  zatrzymaj gate; zaktualizuj commit i manifest tylko po porównaniu składu reguł
  oraz licencji.
- wynik Turbo wygląda na nieaktualny: konfiguracje root są w `globalDependencies`; diagnostycznie użyj `pnpm exec turbo run <task> --force`.
- błąd env: sprawdź nazwę, URL i czy sekret nie został omyłkowo oznaczony `NEXT_PUBLIC_*`.
- brak `initdb`: zainstaluj PostgreSQL 17 albo ustaw
  `RLS_TEST_DATABASE_URL` na pustą jednorazową bazę.
- konflikt typów Supabase WebAuthn: nie włączaj `skipLibCheck`; sprawdź
  `ADR-013` i czy wersjonowany patch nadal odpowiada przypiętej wersji.
