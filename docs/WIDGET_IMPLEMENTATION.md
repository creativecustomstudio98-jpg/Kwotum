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

## Manifest v1 i v2

Manifest jest jawną projekcją immutable snapshotu, a nie zwróconym draftem.
Allowlista obejmuje:

- identyfikator i hash wersji, tytuł, intro i krok startowy;
- typ, etykietę, opis, wymaganie i obsługę „nie wiem” każdego kroku;
- opcje i wyłącznie reguły nawigacji potrzebne rendererowi;
- bezpieczny wynik konsultacyjny.
- bezpieczną konfigurację formularza kontaktowego: etykiety, wersje, hashe,
  opcjonalny URL polityki i informację o dostępności plików.

Manifest v2 dodaje wyłącznie allowlistowane `validation` kroku:
`text_length`, `number_range` albo `date_range`. Brak ograniczenia jest
normalizowany do `null`. Sekcje, `sectionKey` i pozostałe metadane buildera nie
wchodzą do publicznej projekcji. Runtime nadal czyta manifest v1.

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
`request_id`, CORS bez credentials i `no-store` dla sesji. Manifest może być
krótko cache’owany, ale rozpoczęcie sesji nie polega na cache’u manifestu.
Istnieje zgrubny limit 120 nowych sesji na wersję na minutę i limit mutacji.
Docelowe rozproszone limity per IP/origin oraz adaptacyjny Turnstile pozostają
kontrolą przed publiczną produkcją.

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
  blokada niepełnej sesji i brak wycieku scoringu;
- Playwright: hosted flow, mobile, utrata sieci, axe WCAG A/AA, popup, focus
  return, agresywny CSS hosta oraz kontakt/upload/submit.

Ręczny VoiceOver/NVDA, realne CSP kilku hostów i macierz starszych przeglądarek
pozostają obowiązkowe przed produkcją.
