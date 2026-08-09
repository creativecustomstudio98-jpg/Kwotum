# Bezpieczeństwo

## Model zagrożeń

Chronione aktywa: PII leadów, pliki, konfiguracja ceny, tokeny integracji i dane organizacji. Główni przeciwnicy: anonimowy spammer, złośliwy respondent, użytkownik próbujący IDOR, przejęte konto i błędna integracja.

## Kontrole bazowe

- walidacja i autoryzacja server-side, RLS i least privilege;
- jawny tenant context i testy negatywne;
- bezpieczne cookies, rotacja sesji, MFA jako rekomendacja dla Ownera;
- CSP, HSTS, frame policy świadoma embedów, nosniff i referrer policy;
- output encoding, ograniczony rich text, brak `eval`;
- rate limits per IP/public flow/session oraz Turnstile adaptacyjnie przy submit;
- limity body, uploadu i liczby plików; MIME + magic bytes; prywatne obiekty i podpisane odczyty;
- HMAC webhooków, timestamp, replay window, retry i idempotencja;
- sekrety wyłącznie server-side, rotacja i skan repozytorium;
- dependency review, lockfile, automatyczne alerty i SBOM przed produkcją;
- logi bez pełnych PII, audit log operacji krytycznych.

## Szczególne przypadki

Manipulacja ceną: serwer odtwarza kalkulację na opublikowanej wersji. IDOR: zasób spoza tenant scope zwraca generyczne 404. Upload: nazwa klienta nie staje się ścieżką obiektu. Public ID nie ujawnia kolejnych identyfikatorów.

## Kontrole wdrożone w Etapie 3

- Auth SSR używa cookies i zweryfikowanego `getUser()`; redirect `next` akceptuje
  wyłącznie lokalną ścieżkę, więc nie tworzy open redirect;
- prywatne trasy mają `private, no-store` i są dynamiczne;
- RLS obejmuje profile, organizacje, członkostwa, audit log i prywatne obiekty;
- członkostwo zawieszone nie daje żadnego dostępu; roli nie można podnieść
  samodzielnie, a organizacja zachowuje aktywnego Ownera;
- ścieżkę Storage rozpoczyna UUID organizacji, a błędne i obce ścieżki są
  odrzucane przez bazę;
- integracyjny test IDOR uruchamia prawdziwe polityki PostgreSQL dla dwóch
  tenantów przy każdym `pnpm test`.

## Kontrole wdrożone w Etapie 4

- draft ma limity 40 kroków, 20 opcji na krok i 50 reguł;
- reguły są zamkniętym AST bez `eval`, HTML i dowolnych formuł;
- publikacja powtarza walidację grafu w bazie i nie ufa wynikowi klienta;
- blokada rekordu i oczekiwana rewizja chronią przed utraconą aktualizacją oraz
  wyścigiem numerów wersji;
- snapshot, hash i numer wersji są chronione triggerem immutable;
- Owner/Admin mają dostęp przez RLS i jawny tenant context, Sales oraz drugi
  tenant nie widzą flow;
- publiczny alias nie ma bezpośredniej polityki anonimowego odczytu; bezpieczny
  manifest udostępnia wyłącznie wąskie RPC Etapu 5.

## Kontrole wdrożone w Etapie 5

- publiczny manifest jest jawną allowlistą i nie zwraca draftu, tenant ID,
  pricingu, scoringu ani danych innych sesji;
- utworzenie sesji zwraca manifest z tej samej przypiętej wersji, usuwając race
  pomiędzy odczytem aliasu i startem;
- token ma 256 bitów entropii, jest przesyłany nagłówkiem i przechowywany
  wyłącznie jako SHA-256;
- RLS jest wymuszone, brak bezpośrednich grantów tabel, a publiczne operacje są
  wąskimi funkcjami z pustym `search_path`;
- UUID mutacji zapewnia idempotencję, oczekiwana rewizja wykrywa drugą kartę, a
  serwer ponownie waliduje odpowiedź i routing;
- tekst konfiguracji używa `textContent`, Shadow DOM izoluje CSS, a custom
  eventy nie emitują odpowiedzi ani tokenu;
- payload odpowiedzi ma limit 8 KiB transportowo i 4 KiB w bazie; sesja ma
  limity czasu, tempa utworzeń i liczby mutacji.

Pozostałe ryzyko: Web Component działa w originie strony gospodarza, więc
Shadow DOM nie chroni storage przed jej JavaScriptem. Integrator musi ograniczać
third-party scripts i CSP, a token pozostaje celowo wąski i krótkotrwały.
Rozproszone rate limits per IP/origin oraz adaptacyjny Turnstile są wymagane
przed publiczną produkcją.

## Kontrole wdrożone w Etapie 6

- klient przesyła wyłącznie odpowiedzi; nie przesyła ceny, score, kategorii ani
  listy reguł;
- kalkulator pobiera odpowiedzi z bazy i immutable snapshot przypięty do
  `flow_version_id` sesji;
- konfiguracja ma zamknięty AST, limity liczby reguł, bezpieczny zakres integer,
  basis points i jawne zaokrąglenie;
- `validate_flow`, publikacja i sama kalkulacja niezależnie kontrolują
  konfigurację w PostgreSQL;
- publiczny manifest nie zawiera estymacji, a publiczny wynik usuwa scoring,
  kategorię i explainability;
- prywatne funkcje nie mają grantów dla `anon` ani `authenticated`; publiczne
  RPC przyjmuje tylko token weryfikowany przez hash po stronie bazy;
- niepełna i wygasła sesja nie może otrzymać wyniku.

## Reakcja

Klasyfikacja, ograniczenie skutków, zachowanie dowodów, rotacja, ocena obowiązków notyfikacyjnych przez uprawnioną osobę, komunikacja i post-mortem. Kontakty i czasy reakcji zostaną wpisane przed produkcją.

## Kontrole wdrożone w Etapie 12

- globalne odpowiedzi aplikacji mają CSP, HSTS, zakaz ramek i obiektów,
  `nosniff`, ograniczenie uprawnień przeglądarki i politykę referrera;
- CSP dopuszcza obrazy i połączenia wyłącznie z poprawnym originem
  `NEXT_PUBLIC_SUPABASE_URL`; adres jest parsowany jako URL, bez wildcardów,
  ścieżek i możliwości wstrzyknięcia dodatkowej dyrektywy;
- lokalny SAST blokuje dynamiczne wykonanie kodu, bezpośredni HTML injection,
  suppressions i nowe nieprzejrzane użycia `dangerouslySetInnerHTML`;
- working-tree secret scan nie wypisuje znalezionej treści, a CI utrzymuje
  pełnohistoryczny Gitleaks, blokujący dependency audit i Semgrep CE z
  oficjalnymi regułami OWASP oraz testowanymi regułami Kwotum;
- Semgrep działa offline po weryfikacji checksumy reguł, bez capabilities, z
  kodem tylko do odczytu i z przypiętym digestem obrazu; jest kontrolą
  intrafile i nie zastępuje review, RLS, DAST ani pentestu;
- upload poza loopback wymaga prywatnego ClamAV i przy błędzie, timeout albo
  nieznaną odpowiedź odrzuca plik przed rezerwacją Storage;
- eksport, legal hold, retencja i usunięcie są owner-only, audytowane i
  przetestowane negatywnie dla Admina oraz drugiego tenanta;
- workery mają osobne 32-znakowe sekrety porównywane stałoczasowo, zwracają
  tylko liczniki i nie logują PII;
- retencja i ręczne usunięcie są storage-first; worker przed ostatecznym delete
  ponownie sprawdza okres i legal hold.
- autosave buildera wysyła requesty szeregowo i używa oczekiwanej rewizji dla
  nazwy oraz draftu; konflikt nie wykonuje automatycznego merge ani force
  overwrite;
- zapis i publikacja nadal odtwarzają tenant context i capability po stronie
  serwera, a dane wejściowe bez poprawnego UUID, rewizji, nazwy i dokumentu są
  odrzucane przed wywołaniem usługi;

Pełna macierz ataków, ustalenia i zaakceptowane ryzyka znajdują się w
`docs/THREAT_MODEL.md` oraz `docs/SECURITY_AUDIT_2026-07-25.md`.

## Kontrole wdrożone w Etapie 7

- atomowy submit blokuje ukończoną sesję, kopiuje odpowiedzi z bazy i ponownie
  liczy prywatny pricing/scoring; klient nie może podać tych wartości;
- jeden `session_id` może utworzyć tylko jeden lead, a retry zwraca ten sam
  bezpieczny identyfikator bez duplikacji;
- wersja i hash potwierdzenia są porównywane z immutable snapshotem;
- tabele leadów mają `organization_id`, wymuszone RLS i negatywne testy IDOR
  dla drugiego tenanta oraz zawieszonego członka;
- bezpośredni update leada jest zabroniony; status przechodzi przez funkcję
  sprawdzającą rolę i dopisującą historię oraz audit log;
- upload ma limit 5 × 25 MiB, allowlistę, kontrolę rozszerzenia/MIME/magic bytes,
  losową prywatną ścieżkę i SHA-256; panel używa krótkiego signed URL;
- service role jest ograniczona do adaptera transferu na wcześniej
  zarezerwowaną ścieżkę i nie obsługuje odczytów panelu.

Pozostałe ryzyko: sygnatura nie jest skanerem malware. Przed produkcją wymagane
są skanowanie/kwarantanna, rozproszone limity submitu i uploadu, zatwierdzona
retencja oraz procedury usuwania plików.

## Kontrole wdrożone w Etapie 8

- outbox powstaje w transakcji submitu, a unikalność leada i rodzaju blokuje
  duplikaty po ponowieniu żądania;
- anonimowy klient i zwykły użytkownik nie mogą czytać ani mutować kolejki;
  aktywny członek widzi przez RLS tylko statusy swojego tenanta;
- service role workera ma wyłącznie granty do claim/complete/fail; lock token
  wiąże zakończenie z konkretną próbą;
- dynamiczna treść i temat są oczyszczane/escapowane, bez dowolnego HTML i bez
  wykonywania konfiguracji użytkownika;
- sekret workera jest server-side, ma minimum 32 znaki i jest porównywany po
  SHA-256 stałoczasowo; wszystkie odpowiedzi endpointu mają `private, no-store`;
- logika workera nie loguje odbiorców, tematów, treści ani danych leada, a API
  zwraca wyłącznie zagregowane liczniki;
- błędy providerów są mapowane do zamkniętej listy kodów bez przechowywania
  treści odpowiedzi zewnętrznej.

Pozostałe ryzyko: dostawa jest co najmniej jednokrotna, a skuteczność
idempotency zależy także od dostawcy. Produkcyjne włączenie wymaga rotowalnego
sekretu workera, scheduler alertów, zatwierdzonego providera/DPA/transferów i
zweryfikowanej domeny nadawcy.

## Kontrole wdrożone w Etapie 9

- event jest zapisywany dopiero po najnowszej zgodzie `analytics-v1`, a odmowa
  i wycofanie nie blokują ścieżki widgetu;
- kontrakt jest strict i nie przyjmuje odpowiedzi, PII, URL, IP ani dowolnych
  metadanych; source/device mają zamkniętą, niską granularność;
- token sesji jest hashowany po stronie bazy, event przypina serwer, a krok
  musi istnieć w immutable snapshotcie;
- UUID zapewnia retry bez duplikacji; limity 120/min i 500/sesję ograniczają
  spam i wzrost storage;
- tabele mają złożone tenantowe FK, wymuszone RLS i brak bezpośrednich zapisów;
  drugi tenant oraz Sales nie odczytują surowych eventów;
- agregaty ukrywają całość i grupy poniżej 5 sesji, ograniczając identyfikację
  małej próby;
- eventy wygasają po 90 dniach, a purge jest dostępny tylko service role.

Pozostałe ryzyko: klient może fałszować eventy, dlatego analityka nie służy do
rozliczeń ani decyzji bezpieczeństwa. Produkcja wymaga schedulera purge,
monitoringu wieku danych i procedury DSAR.

## Kontrole wdrożone w Etapie 10

- sitemap powstaje z jawnej allowlisty i nie zawiera panelu, logowania, API,
  design systemu ani hosted flows;
- każda powierzchnia prywatna ma `noindex, nofollow`, a robots dodatkowo ją
  wyklucza; żadna z tych kontroli nie zastępuje Auth, tokenu ani RLS;
- structured data jest generowane wyłącznie z kontrolowanych stałych i
  escapowane przed osadzeniem; nie przyjmuje treści użytkownika;
- marketing nie zbiera kontaktu, nie zapisuje danych demo i nie dodaje
  zewnętrznego trackera;
- link do dynamicznego logowania ma wyłączony prefetch, więc publiczny crawl nie
  inicjuje niepotrzebnej sesji Auth;
- 404 nie ujawnia istnienia prywatnego zasobu, a 500 nie wyświetla treści błędu
  ani digestu.

Pozostałe ryzyko: publiczny launch pod nazwą roboczą, bez treści prawnych i
zatwierdzonego modelu cenowego byłby niezgodny z bramkami projektu. Etap 10 jest
gotowy lokalnie, nie do publicznego wdrożenia.

## Kontrole konektora WordPress

- bootstrap ma 256 bitów entropii, SHA-256 at rest, TTL 10 minut, exact origin i
  single-use z blokadą transakcyjną;
- credential ma 256 bitów entropii, jest hashowany w SaaS i szyfrowany
  `sodium_crypto_secretbox` w WordPressie kluczem salts instalacji;
- brak sodium, HTTPS lub przypiętego originu blokuje połączenie;
- żądania WordPress mają TLS verification, unsafe URL rejection, timeout i zero
  redirectów; credential występuje tylko w nagłówku Authorization;
- admin mutations wymagają `manage_options` i nonce, wejścia są sanityzowane, a
  HTML/atrybuty/URL escapowane kontekstowo;
- frontend oraz WordPress REST dostają wyłącznie publiczne identyfikatory flow;
  widget nadal wykonuje walidację, cenę i score po stronie SaaS;
- reconnect revokuje poprzednie połączenie originu, disconnect unieważnia je po
  stronie SaaS i usuwa lokalny credential nawet przy błędzie sieci; Owner/Admin
  może również wykonać audytowaną revocation z panelu po utracie CMS;
- namespace `Wyceno\Connector`, prefiksy opcji/hooków/handle oraz Shadow DOM
  widgetu ograniczają konflikty globalne.

Pozostałe ryzyko: administrator WordPress i kod z prawem wykonania PHP mogą
odczytać plaintext po odszyfrowaniu; model nie chroni przed pełnym przejęciem
runtime’u CMS. Credential ma zatem minimalny zakres read-public-flows,
diagnostics i self-revocation, bez dostępu do leadów czy konfiguracji. Rotacja
salts wymaga reconnectu. Etap 12 musi ponownie ocenić rate limiting endpointów,
log redaction, dependency/secret scan i DAST.
