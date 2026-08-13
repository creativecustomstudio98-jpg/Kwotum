# Widget publiczny

## Zakres Etapów 5–7

Etap 5 dostarczył proces i sesję. Etap 6 dodał serwerowo liczony pricing i jego
bezpieczną prezentację. Etap 7 dodał kontakt, potwierdzenia, pliki i atomowe
utworzenie leada. Scoring pozostaje wyłącznie po stronie serwera.
Ten sam renderer obsługuje osadzenie i hosted link `/f/:publicId`.

## Artefakt i osadzenie

`@wyceno/widget` kompiluje natywne moduły ES bez frameworka runtime. Build
aplikacji kopiuje wersjonowany artefakt do `/widget/v1/` i zatrzymuje się po
przekroczeniu 90 KiB gzip JavaScriptu. Aktualny pomiar wynosi około 23,4 KiB
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

Tryb `inline` inicjalizuje sesję po podłączeniu elementu. Tryby `popup` i
`fullscreen` przed kliknięciem launchera renderują wyłącznie przycisk: nie
odczytują ani nie zapisują `localStorage` i nie wywołują publicznego API.
Kliknięcie otwiera natywny `dialog`, pokazuje stan „Uruchamiamy formularz…” i
dopiero wtedy tworzy albo wznawia sesję. `wyceno:ready` nadal oznacza gotowy
manifest, a `wyceno:closed` zachowuje zwrot fokusu do launchera.

Osadzenie inline może jawnie ustawić `inline-layout="compact"`. Tylko ten
wariant nie dziedziczy minimalnej wysokości pełnoekranowego procesu: karta i
formularz rosną wraz z treścią, a akcje pozostają bezpośrednio pod bieżącą
odpowiedzią. Hosted link i zwykły `mode="inline"` zachowują pełną powierzchnię.
Dla pytania wymaganego „Dalej” jest nieaktywne do chwili wybrania
lub wpisania odpowiedzi; wskazówka obok akcji wyjaśnia wymagany krok i po
uzupełnieniu potwierdza gotowość. Nie stosujemy automatycznego przejścia po
kliknięciu opcji, ponieważ użytkownik musi móc poprawić wybór przed zapisem,
a obsługa klawiaturą i czytnikiem ekranu pozostaje przewidywalna.

`api-base` powinien jawnie wskazywać origin Kwotum w kodzie instalacyjnym.
Renderer ma kompatybilny fallback do originu własnego modułu, dzięki czemu
starszy cross-origin embed nie próbuje wywoływać API domeny gospodarza.

### On-brand launcher popupu

Etykietę ustawia atrybut `button-label`. Kolory i geometria launchera mają
ograniczony publiczny kontrakt CSS custom properties dziedziczonych przez
Shadow DOM:

| Właściwość                                 | Domyślna wartość            |
| ------------------------------------------ | --------------------------- |
| `--wyceno-launcher-background-color`       | akcent Kwotum               |
| `--wyceno-launcher-border-color`           | akcent Kwotum               |
| `--wyceno-launcher-text-color`             | `#ffffff`                   |
| `--wyceno-launcher-border-radius`          | `5px`                       |
| `--wyceno-launcher-hover-background-color` | kolor tła launchera         |
| `--wyceno-launcher-hover-border-color`     | kolor obramowania launchera |
| `--wyceno-launcher-ring-color`             | jasny akcent Kwotum         |

Przykład kanciastego launchera w kolorze marki gospodarza:

```css
wyceno-widget.firma-cta {
  --wyceno-launcher-background-color: #b84000;
  --wyceno-launcher-border-color: #873000;
  --wyceno-launcher-hover-background-color: #9f3800;
  --wyceno-launcher-hover-border-color: #762900;
  --wyceno-launcher-ring-color: #f3a36e;
  --wyceno-launcher-border-radius: 0;
}
```

```html
<wyceno-widget
  class="firma-cta"
  public-id="LOSOWY_PUBLICZNY_UUID"
  api-base="https://app.example"
  mode="popup"
  button-label="Pomóż mi dobrać rozwiązanie"
></wyceno-widget>
```

Integrator odpowiada za kontrast własnych kolorów w stanach default, hover i
focus. Zmienne `--wyceno-launcher-*` dotyczą wyłącznie launchera.

### Ograniczony branding wnętrza embedu

Osadzony widget może otrzymać tekstową nazwę marki, podtytuł i logo z originu
strony gospodarza:

```html
<wyceno-widget
  public-id="LOSOWY_PUBLICZNY_UUID"
  api-base="https://app.example"
  mode="popup"
  brand-name="Firma"
  brand-subtitle="Autoryzowany partner"
  brand-logo-url="/img/logo-firmy.svg"
></wyceno-widget>
```

`brand-logo-url` może być względnym lub absolutnym adresem HTTP(S), ale po
rozwiązaniu musi wskazywać dokładnie origin hosta i nie może zawierać
credentiali. `javascript:`, `data:`, obcy origin, błędny URL i URL z
`user:password@` są odrzucane bez requestu. Obraz używa anonimowego CORS i
`referrerpolicy="no-referrer"`. Walidowany jest URL pierwszego requestu;
redirect HTTP jest późniejszą decyzją przeglądarki, dlatego integrator musi
wskazać statyczny, nieprzekierowujący asset i ograniczyć `img-src` CSP strony.
Obraz ma pusty `alt`, ponieważ w tym samym regionie zawsze pozostaje dostępna
tekstowa `brand-name`. Przy poprawnym wordmarku nazwa jest wizualnie ukryta, aby
jej nie dublować, a obok logo widoczny jest podtytuł. Po błędzie ładowania
renderer pokazuje inicjały i ponownie ujawnia nazwę. Nazwa i podtytuł trafiają
wyłącznie do `textContent`. Zmiana tych atrybutów podmienia tylko region marki —
nie tworzy ani nie wznawia ponownie sesji, nie zastępuje formularza i nie usuwa
niewysłanej odpowiedzi ani fokusu.

Wnętrze nadal jest izolowane przez Shadow DOM. Integrator może ustawić tylko
role z poniższej allowlisty; nie otrzymuje selektorów, `::part`, raw CSS, HTML
ani skryptu wewnętrznego procesu:

| Właściwość                               | Rola                                          |
| ---------------------------------------- | --------------------------------------------- |
| `--wyceno-widget-font-family`            | tekst i kontrolki                             |
| `--wyceno-widget-heading-font-family`    | nagłówki oraz legendy                         |
| `--wyceno-widget-heading-font-weight`    | waga nagłówków                                |
| `--wyceno-widget-heading-letter-spacing` | tracking nagłówków                            |
| `--wyceno-widget-primary`                | wypełnione CTA, progress i zaznaczenie        |
| `--wyceno-widget-primary-hover`          | hover wypełnionego CTA                        |
| `--wyceno-widget-primary-text`           | tekst na wypełnionym CTA                      |
| `--wyceno-widget-accent-text`            | kontrastowy akcent dla linków i małego tekstu |
| `--wyceno-widget-primary-soft`           | tło zaznaczenia i ring CTA                    |
| `--wyceno-widget-text`                   | tekst podstawowy                              |
| `--wyceno-widget-muted`                  | tekst pomocniczy i status                     |
| `--wyceno-widget-surface`                | powierzchnia formularza                       |
| `--wyceno-widget-soft`                   | neutralne tło drugiego poziomu                |
| `--wyceno-widget-border`                 | zwykłe obramowanie                            |
| `--wyceno-widget-border-strong`          | mocne obramowanie opcji                       |
| `--wyceno-widget-secondary-border`       | ramka secondary i zamknięcia                  |
| `--wyceno-widget-control-radius`         | pola, opcje i przyciski                       |
| `--wyceno-widget-panel-radius`           | karta procesu                                 |
| `--wyceno-widget-symbol-radius`          | znak wyniku                                   |
| `--wyceno-widget-panel-shadow`           | cień karty                                    |
| `--wyceno-widget-backdrop`               | tło modalne popupu/fullscreen                 |
| `--wyceno-widget-logo-width`             | szerokość logo desktop (domyślnie `160px`)    |
| `--wyceno-widget-logo-width-mobile`      | szerokość logo do 700 px (domyślnie `122px`)  |

Kolor wypełnienia i kolor małego tekstu są celowo rozdzielone: jaskrawy akcent
może mieć dobry kontrast z ciemnym tekstem na CTA, ale niewystarczający jako
mały tekst na bieli. Integrator odpowiada za WCAG AA całego przekazanego
zestawu. Wartości domyślne zachowują wygląd Kwotum i kompatybilność starszych
embedów. Role kolorystyczne są mapowane wyłącznie do właściwości CSS typu
`color`, `background-color` i `border-color`; wartość `url(...)` jest
odrzucana przez gramatykę właściwości i nie wykonuje requestu.

Ten kontrakt jest konfiguracją konkretnego embedu. Nie trafia do publicznego
manifestu i nie zmienia hosted linku. Automatyczny branding tenanta we
wszystkich powierzchniach wymaga osobnego modelu danych, kontrolowanego storage,
RLS oraz testu dwóch organizacji zgodnie z ADR-044.

## Manifest v1 i v2

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
jej odpowiedzi. Konflikt pojedynczej wspieranej karty pobiera nowszą rewizję
przez wznowienie i ponawia jej lokalną kolejkę.

Przeglądarka przechowuje ograniczony snapshot sesji i kolejkę w `localStorage`
originu strony gospodarza. Pozwala to zachować odpowiedź przy chwilowej utracie
sieci i wznowić proces. Shadow DOM nie jest granicą bezpieczeństwa JavaScript:
skrypty działające w tym samym originie hosta mogą odczytać jego storage.
Dlatego token ma zakres tylko jednej sesji, sesja wygasa, dane są walidowane
przy odczycie, a integrator musi kontrolować skrypty third-party i CSP.

Storage hosta jest pomocą w odtwarzaniu, a nie sygnałem dostępności API.
`QuotaExceededError`, tryb prywatny lub polityka hosta nie przerywają aktywnej
sesji: bieżąca instancja zachowuje snapshot w pamięci i kontynuuje formularz.
Zapis pomija zmianę obejmującą wyłącznie techniczne `savedAt`, aby nie wykonywać
zbędnych operacji host storage.

Pilotaż wspiera jedną aktywną kartę na sesję. Widget nie reaguje automatycznie
na cross-tab `storage` i nie scala równoległych snapshotów. Wiele aktywnych kart
dla tej samej sesji pozostaje niewspierane do czasu zaprojektowania osobnego,
wersjonowanego protokołu synchronizacji.

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

Udany serwerowy resume przy niezmienionej lokalnej generacji przywraca `synced`,
nawet gdy późniejszy zapis lokalny albo first-party analytics zawiedzie. Nowsza
oczekująca mutacja zachowuje jednak swój stan `saving` lub `offline` i nie jest
nadpisywana odpowiedzią starszego resume. Błąd żądania resume pozostawia
odtworzony lokalny formularz jako `active + offline`; nie pokazujemy w UI
surowych wyjątków transportu, storage ani providera.
Każdy resume zapamiętuje tożsamość sesji, rewizję i lokalną generację mutacji.
Odpowiedź, która wróci po nowszym answer, back albo rozpoczęciu submitu, nie
nadpisuje już bieżących odpowiedzi, kroku ani statusu. Sam udany resume może
potwierdzić `synced` po lokalnym back, jeśli rewizja i kolejka nie zmieniły się.
Po odzyskaniu sieci zdarzenie `online` najpierw ponawia pending flush, a jeśli
stan nadal jest offline albo pierwszy create był recoverable, ta sama instancja
kontrolera wykonuje jedno deduplikowane resume/create po zakończeniu trwającej
inicjalizacji. Retry create pokazuje loading i jest serializowane z restartem.
Ponawialny błąd sieci nie czyści snapshotu. Odpowiedź 404/410 z endpointu
głównej sesji (`resume`, `save`, `result`, `upload` lub `submit`) usuwa wygasły
token, snapshot, dane kontaktowe, pliki i zgody oraz przechodzi do jawnego
`expired`, bez kolejnego automatycznego retry. Równoległy submit i pokazany już
`submitted` mają pierwszeństwo, aby spóźnione resume nie ukryło wyniku wysłania;
jeśli submit zawiedzie, wygaśnięcie zostanie rozpoznane przy następnym żądaniu
głównej sesji albo przeładowaniu. Poboczna analityka pozostaje best-effort i
sama nie wygasza aktywnego formularza. Przeciwstawne zmiany zgody analytics są
wysyłane kolejno, z natychmiastowym lokalnym pierwszeństwem odmowy.
Flush jest deduplikowany wyłącznie dla konkretnego właściciela sesji. Po
restarcie nowa sesja uruchamia własny zapis bez czekania na stary request, a
stare zakończenie nie zmienia jej statusu ani storage. Best-effort analytics
również nie blokuje ścieżki save/result/reconnect. Po `submitted` widget zwalnia
pamięciowy draft danych kontaktowych, zgody i referencje do plików.

Przed szerszym rolloutem pozostają trzy jawne zadania: natychmiastowe uzgodnienie
odroczonego expiry po nieudanym równoległym submit oraz ograniczone czasowo
`AbortSignal` dla initialize/reconnect. Pilotaż pozostaje zależny od timeoutów
transportu przeglądarki i ponowienia po `online` lub przeładowaniu.
Nietypowy detach/reattach custom elementu wymaga ponadto osobnej generacji lub
anulowania lifecycle, aby stary request nie dotknął współdzielonego storage;
statyczny embed pilota Fortez nie wykonuje takiej operacji.

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

- unit: manifest v1/v2, typowane ograniczenia, routing, offline queue, resume,
  XSS jako tekst i uszkodzony storage;
- PostgreSQL: anonimowy manifest, hash tokenu, IDOR, expiry, idempotencja,
  rewizje, walidacja odpowiedzi, próba obejścia trasy, estymacja na snapshotcie,
  blokada niepełnej sesji, phone-first bez e-maila i brak wycieku scoringu;
- Playwright: hosted flow, mobile, utrata sieci, axe WCAG A/AA, popup, focus
  return, agresywny CSS hosta, kontakt/upload/submit oraz wygaśnięty token
  Turnstile, brak wywołania API przed tokenem i retry ze świeżym tokenem.

Callbacki `error`, `expired`, `timeout` i `unsupported` Turnstile mają testy
jednostkowe i zwalniają instancję challenge. Realny timeout lub niedostępność
ładowania zewnętrznego skryptu pozostają osobnym gate przed rolloutem szerszym
niż pilotaż.

Ręczny VoiceOver/NVDA, realne CSP kilku hostów i macierz starszych przeglądarek
pozostają obowiązkowe przed produkcją.
