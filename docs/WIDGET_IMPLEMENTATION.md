# Widget publiczny

## Zakres Etapów 5–7

Etap 5 dostarczył proces i sesję. Etap 6 dodał serwerowo liczony pricing i jego
bezpieczną prezentację. Etap 7 dodał kontakt, potwierdzenia, pliki i atomowe
utworzenie leada. Scoring pozostaje wyłącznie po stronie serwera.
Ten sam renderer obsługuje osadzenie i hosted link `/f/:publicId`.

## Artefakt i osadzenie

`@wyceno/widget` kompiluje natywne moduły ES bez frameworka runtime. Build
aplikacji kopiuje wersjonowany artefakt do `/widget/v1/` i zatrzymuje się po
przekroczeniu 90 KiB gzip JavaScriptu. Aktualny pomiar wynosi około 13,9 KiB
gzip.

Minimalne osadzenie:

```html
<script type="module" src="https://app.example/widget/v1/loader.js"></script>
<wyceno-widget
  public-id="LOSOWY_PUBLICZNY_UUID"
  api-base="https://app.example"
  mode="inline"
></wyceno-widget>
```

`mode` przyjmuje `inline`, `popup` albo `fullscreen`. Loader obserwuje dokument,
ładuje renderer dopiero po pojawieniu się elementu i jest idempotentny przy
powtórnym użyciu. Shadow DOM oraz osobny arkusz `widget.css` izolują kontrolki
od CSS strony gospodarza. Hosted link ma `noindex`.

## Manifest v1, v2 i v3

Manifest jest jawną projekcją immutable snapshotu, a nie zwróconym draftem.
Allowlista obejmuje:

- identyfikator i hash wersji, tytuł, intro i krok startowy;
- typ, etykietę, opis, wymaganie i obsługę „nie wiem” każdego kroku;
- opcje i wyłącznie reguły nawigacji potrzebne rendererowi;
- bezpieczny wynik konsultacyjny.
- bezpieczną konfigurację formularza kontaktowego: etykiety, wersje, hashe,
  opcjonalny URL polityki, informację o dostępności plików i politykę kontaktu.

Manifest v2 dodaje wyłącznie allowlistowane `validation` kroku:
`text_length`, `number_range` albo `date_range`. Brak ograniczenia jest
normalizowany do `null`. Sekcje, `sectionKey` i pozostałe metadane buildera nie
wchodzą do publicznej projekcji. Runtime nadal czyta manifest v1.

Manifest v3 dodaje `experienceMode`, jeden z czterech wariantów prezentacji
kroku oraz dla każdej opcji jawne `presentation` równe `null` albo obiektowi z
allowlistowanym opisem, ikoną lub referencją assetu UUID i tekstem
alternatywnym. Nie przyjmuje URL zasobu, HTML, SVG, CSS, data URI ani dowolnych
metadanych. PX3 wykorzystuje `quick_form`. Pierwsza faza PX4 uruchamia
`text_cards`, `icon_cards` i `image_cards` wyłącznie w `visual_configurator`.

### Karty tekstowe i ikonowe (PX4, faza pierwsza)

`text_cards` rozdziela zawsze widoczną etykietę od krótkiego opisu.
`icon_cards` dodaje semantycznie dekoracyjną ikonę z zamkniętego katalogu kodu;
SVG powstaje z kontrolowanych ścieżek i ma `aria-hidden`, nigdy nie pochodzi z
manifestu jako markup. Natywny radio/checkbox pozostaje widoczny, więc stan
wyboru nie opiera się wyłącznie na kolorze. Builder blokuje zapis niekompletnej
prezentacji i korzysta w preview z tego samego Web Componentu co hosted flow.
Po przejściu między krokami runtime przewija początek nowego pytania do
viewportu i przenosi fokus na jego `fieldset`.

`image_cards` nie otrzymuje URL z manifestu. Renderer buduje same-origin
`/api/v1/public/flows/{publicId}/assets/{assetId}`. Trasa zwraca wyłącznie
gotowy WebP użyty w immutable wersji danego publicznego procesu. Obraz ma
`loading=lazy`, jawne 800 × 600, kontener 4:3 i tekstowy fallback bez zmiany
wysokości. Preview buildera przekazuje krótkotrwałe podpisane URL wyłącznie
w pamięci elementu; nie zapisuje ich w dokumencie ani manifeście.

### Quick form (PX3)

Manifest `quick_form` pokazuje wszystkie pytania na jednej, zwartej
powierzchni bez paska kroków. Każde pole zachowuje tytuł, opis, wymaganie,
ograniczenie i opcję „nie wiem”. Submit waliduje pola w kolejności dokumentu,
zachowuje wpisane dane i przenosi fokus do pierwszego błędu. Prawidłowe
odpowiedzi są zamieniane na tę samą uporządkowaną kolejkę mutacji, której używa
prowadzony brief; serwer nadal waliduje każdy krok i sam liczy wynik.

Tryb nie ma osobnego endpointu, tabeli leada, kalkulatora, zgód ani obsługi
Turnstile. Kontakt, privacy proof, origin allowlist, rate limit, upload i
idempotentny submit pozostają wspólne. Kontroler odrzuca drugi submit, gdy
pierwszy jest w toku, a unikalność sesji w bazie nadal stanowi drugą warstwę.
Podgląd kreatora uruchamia ten sam Web Component przez pamięciowy adapter
preview; nie tworzy sesji, analityki ani leada.

`leadCaptureSchemaVersion: 2` dodaje `contactPolicy`: `email_required` albo
`phone_required`. Snapshoty lead capture v1 są interpretowane jako
`email_required`. Widget pokazuje właściwe wymaganie, a API i PostgreSQL
niezależnie walidują co najmniej jeden kanał oraz politykę wersji. Zgoda
marketingowa e-mail wymaga podania e-maila.

Nie zawiera `organization_id`, nazw wewnętrznych, pricingu, scoringu,
integracji, danych sesji ani danych innego respondenta. Pola tekstowe są
renderowane przez `textContent`; HTML konfiguratora nie jest wykonywany.

Utworzenie sesji zwraca manifest i metadane atomowo z tej samej wersji. Dzięki
temu publikacja nowej wersji pomiędzy dwoma żądaniami nie może połączyć starego
manifestu z nową sesją. Wznowiona sesja zawsze używa wersji przypiętej w chwili
utworzenia, nawet po zmianie aktywnego aliasu.

## Sesja, zapis i wznowienie

Losowy token ma 256 bitów entropii. Do bazy trafia wyłącznie SHA-256 tokenu.
Token jest przekazywany w nagłówku `X-Wyceno-Session`, nie w URL, evencie ani
logu aplikacyjnym. Sesja wygasa technicznie po siedmiu dniach; polityka trwałego
usuwania rekordów zostanie zatwierdzona w etapie retencji.

Każdy zapis odpowiedzi ma:

- UUID mutacji, dzięki któremu retry jest idempotentne;
- oczekiwaną rewizję chroniącą dwie karty przed cichym nadpisaniem;
- limit 4 KiB odpowiedzi i maksymalnie 500 mutacji sesji;
- walidację typu, opcji, długości, ograniczenia v2 i dozwolonego kroku w
  PostgreSQL;
- przejście ponownie obliczone na immutable snapshotcie przez serwer.

Klient nie może przeskoczyć do dowolnego kroku. Baza odrzuca cel różny od
wyniku reguł. Powrót do wcześniejszej odpowiedzi przycina późniejszą gałąź i
jej odpowiedzi. Dwie karty uzgadniają nowszą rewizję przez wznowienie.

Przeglądarka przechowuje ograniczony snapshot sesji i kolejkę w `localStorage`
originu strony gospodarza. Pozwala to zachować odpowiedź przy chwilowej utracie
sieci i wznowić proces. Shadow DOM nie jest granicą bezpieczeństwa JavaScript:
skrypty działające w tym samym originie hosta mogą odczytać jego storage.
Dlatego token ma zakres tylko jednej sesji, sesja wygasa, dane są walidowane
przy odczycie, a integrator musi kontrolować skrypty third-party i CSP.

## State machine i błędy

Główne stany to `idle`, `loading_manifest`, `active`, `calculating_result`,
`result`, `submitting`, `submitted`, `recoverable_error`, `expired` i
`unavailable`. Zapis ma osobny stan
`synced`, `saving` lub `offline`, więc utrata sieci nie blokuje przechodzenia
procesu. Kolejka jest ponawiana po zdarzeniu `online`; konflikt pobiera stan
serwera i odtwarza oczekujące mutacje.

Po synchronizacji ostatniej odpowiedzi widget pobiera wynik z serwera. Przy
braku sieci pozostaje w `calculating_result`, zachowuje odpowiedzi i ponawia
żądanie po `online`; nie wylicza lokalnej ceny zastępczej.

Widget pokazuje jawny loading, komunikat niedostępności, możliwość rozpoczęcia
od nowa po wygaśnięciu oraz status zapisu przez `aria-live`.

## API

- `GET /api/v1/public/flows/:publicId/manifest` — allowlistowany manifest;
- `POST /api/v1/public/flows/:publicId/sessions` — sesja i atomowy manifest;
- `GET /api/v1/public/sessions/current` — wznowienie z nagłówkiem sesji;
- `PUT /api/v1/public/sessions/current/answers/:stepKey` — idempotentny zapis.
- `GET /api/v1/public/sessions/current/result` — serwerowo obliczony, publiczny
  wynik bez scoringu i reguł wewnętrznych.
- `POST /api/v1/public/sessions/current/files` — zweryfikowany, prywatny upload.
- `POST /api/v1/public/sessions/current/submit` — atomowe utworzenie leada.

Endpointy mają walidację Zod, limit 8 KiB mutacji, stabilne kody błędów,
`request_id`, exact CORS bez credentials i `no-store` dla sesji. Manifest może
być krótko cache’owany z `Vary: Origin`, ale rozpoczęcie sesji nie polega na
cache’u manifestu. FTZ-03A dodaje wspólny limiter PostgreSQL per
HMAC(IP)/origin/flow/session/organizacja i operacja, `Retry-After`, tenantową
konfigurację maksymalnie 10 originów oraz odbiera anonimowy dostęp do RPC
domenowych. FTZ-03B dodaje do runtime manifestu wyłącznie publiczny site key,
akcję `kwotum_lead_submit` i `appearance: interaction-only`. Dynamiczny widget
ładuje oficjalny skrypt i renderuje challenge dopiero po kliknięciu finalnego
submitu oraz po uploadzie. Serwer wykonuje obowiązkowe
Siteverify przed RPC leada, sprawdza host/akcję/świeżość i fail-closed odrzuca
replay, timeout, błąd providera albo brak konfiguracji poza local. Podgląd
panelu pozostaje bezsieciowy i nie tworzy leada.

## Komunikacja z hostem

Custom events: `wyceno:ready`, `wyceno:resize`, `wyceno:started`,
`wyceno:closed` i `wyceno:submitted`. Eventy nie zawierają tokenu, odpowiedzi
ani danych kontaktowych. `submitted` powstaje dopiero po potwierdzonym
submitcie i zawiera tylko losowy `leadPublicId`.

## Dostępność i testy

Renderer używa natywnych `fieldset`, `legend`, kontrolek formularza i
`dialog`. Obsługuje klawiaturę, powrót fokusu, mobile 390 px, forced colors i
`prefers-reduced-motion`.

Pokrycie:

- unit: manifest v1/v2/v3, prezentacje, typowane ograniczenia, routing, offline queue, resume,
  XSS jako tekst i uszkodzony storage;
- PostgreSQL: anonimowy manifest, hash tokenu, IDOR, expiry, idempotencja,
  rewizje, walidacja odpowiedzi, próba obejścia trasy, estymacja na snapshotcie,
  blokada niepełnej sesji, phone-first bez e-maila i brak wycieku scoringu;
- Playwright: hosted flow, mobile, utrata sieci, axe WCAG A/AA, popup, focus
  return, agresywny CSS hosta, kontakt/upload/submit oraz wygaśnięty token
  Turnstile, brak wywołania API przed tokenem i retry ze świeżym tokenem.

Ręczny VoiceOver/NVDA, realne CSP kilku hostów i macierz starszych przeglądarek
pozostają obowiązkowe przed produkcją.

# Kontekst strony

Element `wyceno-widget` udostępnia właściwość `contextValues` i opcjonalny
atrybut JSON `context-values`. Kontekst należy ustawić przed dołączeniem
elementu do DOM. Pola wymagające potwierdzenia są pokazane w płaskiej sekcji
przed pytaniami; do tego czasu kontroler nie zapisze odpowiedzi. Wartości nie
są umieszczane w URL, analytics ani custom events.

# Zakończenie, kontakt i branding PX6

Runtime ma osobny stan `contact`. Dla `result_then_contact` zachowuje historyczny
przebieg: najpierw wynik, potem formularz. Dla `contact_then_result` kończy
synchronizację odpowiedzi, pokazuje formularz bez ujawnienia pełnego wyniku,
tworzy lead i dopiero wtedy pobiera wynik potwierdzony przez serwer. Outcome
`no_lead` nie renderuje formularza; opcjonalny fallback jest wyłącznie linkiem
HTTPS z kontraktu.

Pola kontaktowe są renderowane tylko wtedy, gdy ich stan nie jest `hidden`.
Wymagania, kanał i pora są walidowane w kontrolerze, API i bazie. Nazwa firmy
jest oddzielona od nazwy procesu. Renderer przyjmuje tylko zaakceptowany akcent,
czarny lub biały tekst oraz opcjonalne logo same-origin; brak lub uszkodzona
projekcja uruchamia stały bezpieczny fallback. Nie istnieje API do dowolnego CSS.
