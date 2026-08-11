# Changelog

Wszystkie istotne zmiany projektu będą dokumentowane w tym pliku.

## [Unreleased]

### Changed

- Builder udostępnia teraz osobne pola „Tytuł formularza” i „Wprowadzenie” dla
  publicznego hosted linku oraz embedu. Walidacja rozróżnia treść otwarcia od
  tytułu aktywnego pytania, prowadzi fokus do właściwego pola i zachowuje
  autosave, undo/redo oraz istniejącą geometrię trzech kolumn. Zmiana zamyka
  regresję UAT pierwszego pilota, w której proces Fortez zachował treść
  „Meble na wymiar” z bazowego szablonu.

- FTZ-04 dodaje pięciominutowy Vercel Cron dla aplikacyjnego outboxu z osobnym
  `CRON_SECRET`, zachowuje ręczny worker z niezależnym sekretem oraz zapisuje
  prywatny heartbeat bez PII. Chroniony probe wykrywa brak, błąd i zawieszenie
  schedulera, kolejkę starszą niż 10 minut, stale lock i terminalne `failed`.
  Migracja, sekrety Production, niezależny alert i syntetyczna dostawa nadal
  muszą zostać wdrożone przed zamknięciem bramki pilota.

- Status w inspektorze zakładki `Kontakt` odzwierciedla teraz zapisany stan
  konfiguracji kontaktu zamiast niezależnego stanu modułu wyceny; E2E chroni
  oba stany przed regresją.
- Builder procesu udostępnia teraz Ownerowi/Adminowi osobną zakładkę
  `Kontakt`: wybór `email_required` / `phone_required`, wersjonowaną informację
  prywatności, bezpieczny URL polityki i jawny przełącznik załączników.
  Domyślnie zachowuje zgodność `email_required`, nie dodaje zgody marketingowej
  i ostrzega przed plikami bez produkcyjnego skanera malware. Serwer przelicza
  SHA-256 treści informacji i zgody przy każdym zapisie/publikacji, więc klient
  panelu nie może utrwalić niespójnego dowodu consentu. E2E potwierdza
  phone-first, zapis, publikację, axe i cleanup syntetycznego tenanta.
- Zastąpiono poprzedni symbol dokładnym znakiem Kwotum V3 dostarczonym przez
  właściciela. Wersjonowane assety zasilają faviconę, Apple touch icon,
  marketing, auth, panel, demonstracje oraz wiadomości, bez zmiany tenantowego
  brandingu formularzy klientów.
- Etap 12ZK dodaje wersjonowaną politykę kontaktu `email_required` /
  `phone_required`, tenantowy adres alertów zarządzany przez Ownera/Admina,
  phone-first submit bez fałszywego potwierdzenia e-mail oraz kompletny brief z
  telefonem i odpowiedziami w alercie firmy. Migracja zachowuje kompatybilność
  snapshotów v1, forced RLS i audit bez kopiowania adresu odbiorcy.
- FTZ-03B dodaje adaptacyjny Cloudflare Turnstile do finalnego submitu leada:
  explicit render z `interaction-only`, token pobierany po uploadzie,
  obowiązkowe serwerowe Siteverify z action/hostname/freshness oraz fail-closed
  dla replay, timeoutu, awarii providera i brakującej konfiguracji poza local.
  Site key trafia tylko do runtime manifestu, sekret pozostaje na serwerze, a
  token i surowy IP nie są utrwalane. Unit/route/Playwright potwierdzają brak
  zapisu przed weryfikacją i świeży token po retry. Managed widget i klucze
  Vercel Production only są skonfigurowane; wdrożenie, CSP Fortez, legal review
  i produkcyjny smoke nadal blokują pilot.
- FTZ-03A zastępuje wildcard CORS dokładną tenantową allowlistą originów,
  odcina bezpośredni dostęp `anon` i `authenticated` do RPC publicznego
  formularza oraz dodaje serwerową bramę z atomowym limiterem PostgreSQL per
  IP/origin/proces/sesję/organizację i operację. Surowe IP nie jest utrwalane,
  odpowiedź `429` zawiera `Retry-After`, a panel Owner/Admin pozwala zapisać
  maksymalnie 10 originów procesu. Migracja, rollback, RLS i testy negatywne
  są gotowe lokalnie; wdrożenie sekretu, produkcyjny smoke i adaptacyjny
  Turnstile pozostają blokadami rzeczywistego ruchu pilota.
- Dodano wersjonowane, polskie szablony wszystkich sześciu przepływów
  Supabase Auth oraz testy pilnujące wymaganych zmiennych, braku aktywnej
  treści i domyślnego brandingu Supabase. Kontrakt produkcyjny wybiera osobną
  domenę `mail.kwotum.pl`, niezależne credentiale Auth/outboxu i dokumentuje
  DNS, testy klientów pocztowych oraz rollback. `EMAIL_FROM` akceptuje teraz
  bezpieczny format `Kwotum <adres>`, nadal blokując iniekcję nagłówków.
  Domena została zweryfikowana w Resend, custom SMTP podłączono do Supabase, a
  syntetyczny test potwierdził dostawę wyłącznie nowego szablonu Kwotum.
- Udokumentowano działające wdrożenie produkcyjne Vercel/Supabase,
  `app.kwotum.pl`, świadome użycie kompatybilnego rekordu A w home.pl oraz
  blokady, które nadal chronią pilota przed przyjmowaniem prawdziwych danych.
- Produkcyjny build Vercela w monorepo otrzymuje teraz przez jawną allowlistę
  Turborepo wyłącznie kontrakt deploymentu i publiczne zmienne kompilacji.
  Usuwa to fałszywy fallback `APP_URL` do localhosta, zachowując klucz
  serwisowy Supabase i sekrety workerów poza środowiskiem builda.
- Podgląd pytania w builderze zawija teraz pełny tytuł i automatycznie dopasowuje
  wysokość także po zmianie szerokości kolumny. Jednoliniowy edytor zastąpiła
  dostępna klawiaturowo kontrolka wielowierszowa, która nie zapisuje znaków
  nowej linii; test regresji pilnuje braku pionowego i poziomego ucięcia.
- Etap 12ZF utrzymuje webhook w MVP przez ADR-034 i dodaje tenantowy
  `lead.created` v1: Owner/Admin zarządza publicznymi endpointami HTTPS,
  jednorazowo widocznym pochodnym sekretem, rotacją, testem i wyłączeniem.
  Osobny outbox ma HMAC raw body, replay window, idempotency, pięć prób,
  dead-letter i historię bez payloadu/response body. Transport blokuje SSRF,
  prywatne IPv4/IPv6, DNS rebinding, redirecty i błędny TLS przez all-answer
  validation oraz pinned connection. Worker ma oddzielny sekret i zwraca tylko
  liczniki. Limit 10 aktywnych endpointów jest serializowany per tenant, DNS ma
  osobny timeout, a rotacja i wyłączenie wymagają potwierdzenia. Produkcyjny
  standalone przechodzi 19/19 z axe i cleanupem 0; scheduler i alerty pozostają
  bramką Etapu 13A.
- Etap 12ZD zastępuje niedostępny dla prywatnego repozytorium upload CodeQL
  blokującym Semgrep CE 1.164.0. Obraz i GitHub Actions są przypięte do
  digestów/commit SHA, oficjalny zestaw OWASP jest weryfikowany checksumą i
  uruchamiany offline, a 8 własnych reguł ma 8/8 testów. Lokalny skan wykonał
  288 reguł na 662 plikach z 0 ustaleń i 100% parsowania. Supply chain pnpm ma
  siedmiodniowy release age, no-downgrade provenance, blokadę egzotycznych
  zależności tranzytywnych i tylko cztery dokładnie wersjonowane wyjątki;
  Dependabot stosuje siedmiodniowy cooldown zwykłych aktualizacji. Legacy SAST
  zachowuje wyłączenia po globie języków i pomija tylko celowo niebezpieczny
  fixture testów Semgrep.
- Etap 12ZD ma powtarzalny, uwierzytelniony gate `pnpm e2e:panel`: lokalny-only
  harness buduje standalone, tworzy jednorazowe konto i tenant, uruchamia 17
  sekwencyjnych scenariuszy oraz potwierdza zero pozostałości w bazie, Auth i
  Storage. Naprawiono bezstanowy podgląd widgetu, próg buildera po rozwinięciu
  sidebara 240 px oraz drift Szablonów, paginacji leadów i pomiarów workspace'u
  względem zaakceptowanej dokumentacji. Screenshoty bieżącego testu trafiają
  do katalogu tymczasowego i nie nadpisują dowodów Visual QA.
- Visual regression Etapu 12ZD jest powtarzalny między lokalnym macOS i CI:
  aplikacja osadza Inter 4.1 na licencji OFL 1.1, Playwright rozdziela 12
  aktywnych baseline'ów na Darwin i Linux, a Quality Gate działa w przypiętym
  obrazie `mcr.microsoft.com/playwright:v1.61.0-noble`. Usunięto 14
  nieużywanych snapshotów i skorygowano rzeczywistą geometrię kilku sekcji bez
  zwiększania tolerancji testów. Raport oraz trace z błędnego przebiegu są
  zachowywane przez 14 dni.
- Build każdego workspace'u czeka teraz na jego własny typecheck. Usuwa to
  wyścig czystego checkoutu, w którym równoległe `next typegen` i `next build`
  modyfikowały `.next/types` oraz mogły zalogować `ENOENT` mimo kodu wyjścia 0
  z całego przebiegu Turbo.
- Drugi pass Etapu 12ZD usuwa dziewięć znanych podatności zależności przez
  bezpieczne wymuszenie wersji `undici`, `brace-expansion`, `js-yaml`, `nanoid`
  i `postcss`; finalny audyt raportuje zero znanych podatności. Lokalny katalog
  źródeł i renderów promocyjnych pozostaje poza Git bez kasowania danych.
  Produkcyjna regresja standalone przechodzi 257 testów przy 17 jawnych
  skipach; pełny gate pozostaje otwarty do clean SHA oraz zdalnego
  CI/Semgrep/Gitleaks po zaliczonych testach panelu.
- R5.4 zastępuje pusty legacy’owy akapit o Shadow DOM na `/dla-agencji`
  osobnym, ciemnozielonym proofem technicznym. Widok zestawia agresywny CSS
  strony hosta z pełnym interfejsem widgetu wewnątrz rzeczywistej granicy
  shadow root, pokazuje `<wyceno-widget>`, mały loader, własny arkusz i wąski
  kontrakt zdarzeń. Copy nie przedstawia Shadow DOM jako zabezpieczenia przed
  JavaScriptem, a proof nie zawiera atrap kontrolek. Produkcyjna macierz
  320–1536 px ma minimum 12 px tekstu, zero overflow i błędów runtime;
  dedykowany gate przechodzi 11/11, finalna regresja 86/86, realny test
  agresywnego CSS widgetu 1/1, unit 177/177, RLS i WordPress PASS, a
  lint/typecheck/build po 8/8. Etap oczekuje na odbiór właściciela; R5.5
  pozostaje zamrożone.
- R5.3 przebudowuje granicę danych na `/dla-agencji` w oddzielną powierzchnię
  zgodną z panelem. Sekcja pokazuje aktywną organizację klienta, rzeczywistą
  macierz Owner/Admin/Sales, domyślny brak dostępu agencji oraz trzy warstwy
  izolacji: organizację z adresu panelu, serwerowy `TenantContext` i RLS.
  Legacy’owy opis Shadow DOM został odłączony strukturalnie i pozostawiony do
  R5.4. Produkcyjna macierz 320–1536 px ma minimum 12 px tekstu, zero overflow
  i błędów runtime; R5.3 przechodzi 11/11, pełna regresja 75/75, unit 177/177,
  RLS i WordPress PASS, a lint/typecheck/build po 8/8. Właściciel zaakceptował
  etap poleceniem „dalej”; aktywny jest wyłącznie R5.4.
- R5.2 przebudowuje `#model-wdrozenia` na `/dla-agencji` z czterech luźnych
  kolumn w jeden produktowy plan wdrożenia. Każdy z czterech etapów ma ikonę
  panelu, właściciela, działanie i rezultat, a dolny rejestr rozdziela wspólną
  architekturę, indywidualną treść i logikę oraz dane w organizacji klienta.
  Mobile używa pionowej osi procesu; sekcja nie zawiera atrap kontrolek ani
  nowych obietnic produktu. Produkcyjna macierz 320–1536 px ma minimum 12 px
  tekstu, zero overflow i błędów runtime. R5.2 przechodzi 11/11, unit 177/177,
  a lint/typecheck/build po 8/8. Właściciel zaakceptował etap poleceniem
  „kontynuuj”, dlatego R5.2 jest COMPLETE i może rozpocząć się R5.3.
- Podetap 12ZJ rozdziela liveness `/health` od prawdziwego `/ready`, który z
  limitem czasu sprawdza ścieżkę anonimowy Supabase REST → PostgreSQL bez
  odczytu danych tenantów. Błędy są zamknięte do generycznego 503, odpowiedzi
  mają `no-store` i `noindex`, staging/production wymagają HTTPS i ukrywają
  `/design-system` przez 404. Nowy runtime smoke przechodzi dla profilu local
  i production, a pełny gate obejmuje web 106/106, RLS oraz lint/typecheck/build
  po 8/8. Nie deklaruje to aktywnego stagingu ani wybranych providerów.
- Trzecia korekta R5.1 zastępuje dwa odrzucone proofy hero `/dla-agencji`
  jednym pełnym ekranem listy leadów, wyprowadzonym bezpośrednio z panelu
  Kwotum. Usunięto diagram, pływający telefon, kartę roli agencji, rail i
  `CompactLeadDocument`. Desktop odtwarza sidebar, nawigację, konto, filtry,
  siedem kolumn, statusy i paginację; mobile przechodzi na listę oraz dolną
  nawigację panelu. Właściciel zaakceptował finalny render odpowiedzią „super
  dalej”, dlatego etap jest COMPLETE. Macierz 320–1536 px
  ma minimum 12 px tekstu, zero overflow i błędów runtime; R5.1 przechodzi
  11/11, regresja R5.1 + shell + home 53/53, unit 177/177, a
  lint/typecheck/build po 8/8.
- Szczegół leada otrzymał produkcyjny panel „Obsługa leada”: status,
  tenantowego właściciela, priorytet, deterministyczny następny krok,
  zaplanowany kontakt, ostatnią aktywność, notatki z autorem i datą oraz
  otwarte zadania. Kontakty i zadania mają prawdziwy zapis serwerowy,
  idempotencję, wykonanie/anulowanie i pełną historię. Nowe `lead:assign` oraz
  `lead:operate`, wąskie RPC, forced RLS i złożone FK egzekwują tenant scope;
  Sales nie przypisuje leada ani nie zamyka cudzego zadania. Eksport DSAR,
  retencja, legal hold i usunięcie obejmują nowy agregat, a audit nie kopiuje
  treści ani danych kontaktowych. Potwierdzone akcje aktualizują panel bez
  wyścigu z odświeżeniem RSC, a końcowy Chromium E2E z axe przechodzi na
  desktopie 1536 × 1024 i mobile 390 × 844 bez overflow.
- Ekran instalacji opublikowanego procesu stał się kompletnym miejscem
  „Podgląd i udostępnianie”. Pełny formularz działa na wspólnym runtime widgetu,
  ale używa pamięciowego API bez requestów, sesji, analityki, plików i leadów.
  Owner/Admin mogą wysłać klientowi aktualny hosted link przez osobny tenantowy
  outbox z idempotencją, retry, historią prób i statusem; wiadomość HTML/text nie
  zawiera PII w URL ani trackingu. Dodano `flow:share`, RLS, negatywne testy
  Sales/drugiego tenanta oraz worker współdzielący chroniony endpoint kolejek.
- R4.I.1 tworzy kanoniczną trasę `/integracje` i naprawia cel pozycji
  „Integracje” we wspólnym headerze, pozostawiając `/wordpress` jako stronę
  szczegółową. Hero odtwarza geometrię dostarczonej referencji: centralny
  demonstracyjny rekord leada, cztery realne kanały, przerywane połączenia i
  dolny rail. Fikcyjne CRM, webhooki oraz arkusze zastąpiono widgetem, hosted
  linkiem, WordPressem i powiadomieniem e-mail. Macierz 320–1536 px ma minimum
  12 px tekstu, zero błędów i zero overflow; dedykowany gate przechodzi 11/11,
  pełny marketing 189/189, testy jednostkowe 155/155, lint i typecheck 8/8,
  a build 8/8 generuje 40 stron.
- Wspólny znak Kwotum używa dokładnego artworku z dostarczonej ikony Q z
  formularzem i zielonym potwierdzeniem, bez przerysowania symbolu. Eksport
  został przycięty i znormalizowany do lekkiego zasobu ekranowego; ten sam plik
  zasila header, sidebar, auth i faviconę.
- Listy Leadów, Procesów i Szablonów nie używają już kremowego tła pod osobną
  białą kartą. Cała prawa część tych ekranów jest jedną białą powierzchnią bez
  zewnętrznego paddingu, obramowania, promienia i cienia. Lista pokazuje do 18
  leadów na stronę, aby wykorzystać wysokość desktopu. Szczegół leada również
  jest jednym białym canvasem bez drugiej warstwy tła; zaokrąglenia zachowuje
  funkcjonalny blok wyniku oraz kontrolki, a zakładki i kolumny rozdzielają
  hairline'y. Odpowiedzi mają numerowany układ pytanie–wartość, natomiast Pliki
  łączą płaską listę metadanych z małym podglądem pierwszego materiału po
  prawej. Zapisana notatka pojawia się pod formularzem w historii z nazwą
  autora i datą dodania; formularz czyści treść po poprawnym zapisie. Ten sam
  biały shell obejmuje Ustawienia, Prywatność i Powiadomienia. Integracje
  WordPress mają płaskie sekcje bez sztucznych minimalnych wysokości, a promień
  zachowują tylko kontrolki i statusy.
- Trasa `/panel` odtwarza zaakceptowany wybór organizacji Kwotum: header około
  102 px, oś treści 1260 px, duży nagłówek oraz pozioma karta z avatarem,
  nazwą, slugiem i dwiema działającymi akcjami. Trzy metadane korzystają z
  prawdziwych opublikowanych procesów, leadów wymagających obsługi i ostatniej
  aktywności pod ochroną istniejącego RLS. Mobile składa kartę do jednej
  kolumny bez overflow; polska odmiana i daty mają testy jednostkowe.
- Wspólny sidebar panelu Kwotum ma teraz 240 px w stanie rozwiniętym i
  zachowuje 78 px po zwinięciu. Logo jest czyste, bez płytki i obramowania,
  tło sidebara ma warstwowe światło, a nawigacja osobny code-native zestaw ikon bez teł i
  obramowań; capability gates, persystencja, breakpoint 56 rem i mobilny pasek
  nie zmieniły zachowania. Okrągły przełącznik zastąpił smukły uchwyt z
  płynnym obrotem strzałki i wspólnym easingiem raila oraz etykiet. Lint,
  typecheck, 85/85 testów web i build przechodzą.
- Pricing recovery upraszcza cały `/cennik` do dwóch dużych, spokojnych kart
  zgodnych z zaakceptowanym landingiem: dostępnego programu pilotażowego i
  jawnie niegotowego self-service. Usunięto wizualny nadmiar R4.1–R4.4 bez
  dodawania ceny, triala, limitu, karty ani zakupu. Dokument skrócił się z
  3580 do 2592 px przy 1440 px oraz z 6206 do 4107 px przy 390 px; dziewięć
  viewportów zachowuje równe karty i CTA, minimum 12 px tekstu, zero błędów i
  zero overflow. Gate pricing przechodzi 44/44, pełny marketing 178/178,
  testy jednostkowe 155/155, lint i typecheck 8/8 oraz build 8/8 z 39 trasami.
  Audyt ujawnił także brak publicznej trasy `/integracje`; otrzymała osobny
  następny etap R4.I, ponieważ etykieta headera prowadzi obecnie błędnie do
  `/wordpress`.
- R4.4 domyka `/cennik`: dolna nota stała się kontraktem trzech kryteriów
  indywidualnego zakresu i dwóch rezultatów pilotażu, a finalny blok ma dwie
  równe, realne ścieżki do procesu i logowania. Nie dodano ceny, limitu,
  triala, karty, formularza ani obietnicy self-service. Macierz 320–1536 px ma
  minimum 12 px tekstu i zero overflow; dedykowany gate R4.1–R4.4 przechodzi
  44/44, pełny marketing 178/178, pełne testy, lint, typecheck i build 39 tras
  są zielone.
- R4.3 zastępuje listę braków self-service na `/cennik` semantycznym rejestrem
  decyzji. Kwota, limity, płatności i dalszy model mają jawny status i
  uzasadnienie, bez kwot, terminu, planu zakupu ani obietnicy wdrożenia.
  Desktop używa zwartego układu, mobile pionowych rekordów; macierz 320–1536 px
  ma tekst minimum 12 px i zero overflow. Dedykowany gate R4.1–R4.3 przechodzi
  33/33, pełny marketing 167/167, pełne testy, lint, typecheck i build są
  zielone.
- R4.2 przebudowuje dwie ścieżki `/cennik`: aktywny program pilotażowy i
  przyszły self-service mają osobne statusy, opis, model, cztery fakty oraz
  rezultat. Neutralna karta walidacji nie wygląda jak gotowy plan i nie ma
  kontrolki zakupu. Desktop utrzymuje dwie równe karty, mobile jedną oś, a
  pełna macierz 320–1536 px ma tekst minimum 12 px i zero overflow. Dedykowany
  gate R4.1–R4.2 przechodzi 22/22, pełny marketing 156/156, pełne testy, lint,
  typecheck i build 39 tras są zielone.
- Zamknięto R0 programu rebrandingu 19 publicznych podstron Kwotum poza `/`.
  Powtarzalny audyt Playwright zapisał 38 renderów desktop/mobile, metryki
  wysokości, sekcji, overflow i błędów; wszystkie trasy zwracają HTTP 200 bez
  błędów runtime i poziomego overflow. Audyt wykazał, że stabilny, lecz starszy
  i płaski system podstron wymaga osobnej architektury zgodnej z home V7.
  `docs/ui/marketing-subpages-v1/` zawiera plan każdej trasy i sekcji,
  współdzielony kontrakt projektowy oraz etapy R1–R12. Runtime stron nie został
  zmieniony, a M4 strony głównej pozostaje wstrzymany.
- R1 ujednolica wspólny shell wszystkich podstron z home V7: pełny znak
  Kwotum, sześć tras nawigacji, `aria-current`, szerokie osie desktopu,
  marginesy 16/12 px na mobile, równe CTA, poprawione breadcrumbs oraz legal
  shell. Dedykowany axe wykrył kontrast 4,28:1 bieżącej etykiety; przyciemnienie
  koloru zamyka naruszenie. Wszystkie 19 podstron przechodzi kontrolę shellu i
  overflow na desktop/mobile, bez zmiany treści i kolejności sekcji.
- R2.1 przebudowuje wyłącznie hero `/produkt`: teza prowadzi od konfiguracji
  przez niezmienną publikację do gotowego leada, a trzy code-native karty i
  rail odpowiedzialności zastępują generyczny tekstowy intro. Desktop ma
  dwukolumnowy proof, mobile osobną zwartą oś procesu, oba CTA są równe, tekst
  nie schodzi poniżej 12 px, a zakres MVP jawnie wyklucza płatności i pełny
  CRM. Dedykowany gate przechodzi 8/8, pełny marketing 50/50, pełne testy,
  lint, typecheck i build 39 tras są zielone. Regresja ujawniła i usunęła także
  blokujące ładowanie leniwej miniatury w trybie bez JavaScriptu.
- R2.2 zastępuje płaską listę modułów `/produkt` jedną mapą zależności:
  builder, publikacja i server-confirmed pricing/scoring prowadzą do pełnego
  rekordu leada, a powiadomienia i analityka są działaniami następczymi.
  Desktop używa poziomego przepływu, mobile zwartej sekwencji pionowej, a
  sekcja jest krótsza od baseline'u bez utraty danych. Axe wykrył i wymusił
  poprawę kontrastu małych etykiet rekordu do WCAG AA. Dedykowany gate
  przechodzi 16/16, pełny marketing 58/58, pełne testy, lint, typecheck oraz
  build 39 tras są zielone.
- R2.3 przebudowuje granice `/produkt` w kontrastowy kontrakt odpowiedzialności.
  Trzy code-native karty rozdzielają role Kwotum i firmy dla orientacyjnego
  wyniku, uporządkowanego leada oraz jawnych reguł, a końcowy rail przypomina o
  obowiązkowej weryfikacji niewiążącego wyniku. Desktop używa trzech równych
  kolumn, mobile zwartej sekwencji. Axe wykrył i wymusił poprawny scope ciemnego
  tła, małych etykiet oraz forced colors. Dedykowany gate przechodzi 16/16,
  pełny marketing 66/66, pełne testy, lint, typecheck i build 39 tras są zielone.
- R2.4 domyka `/produkt` lokalnym finałem decyzji i overview „Kwotum w jednym
  widoku”. Dwa działające CTA mają równą geometrię na 320–1440 px, a trzy
  reguły i trzy etapy podsumowania nie rozszerzają zakresu MVP. Axe wykrył i
  zamknął kontrast 4,32:1 małych etykiet, a test geometrii wymusił wcześniejsze
  przejście do jednej kolumny przy 1024 px. Dedykowany gate R2.3 + R2.4
  przechodzi 16/16, pełny marketing 74/74, pełne testy, lint, typecheck i build
  39 tras są zielone.
- R3.1 zastępuje tekstowy hero `/jak-dziala` code-native mapą zaufania
  przeglądarka → serwer → panel. Serwer jest jednoznacznie źródłem
  potwierdzonego wyniku i kontroli dostępu, przeglądarka tylko prowadzi klienta,
  a decyzja pozostaje po stronie firmy. Desktop używa dwóch kolumn, mobile
  zwartej osi pionowej, CTA są równe i działają. Axe wymusił poprawę kontrastu
  centralnej karty i scope forced colors, a test 1024 px usunął zawijanie
  pierwszej akcji. Dedykowany gate przechodzi 8/8, pełny marketing 82/82, pełne
  testy, lint, typecheck i build 39 tras są zielone.
- R3.2 zastępuje pierwsze trzy płaskie wiersze `/jak-dziala` code-native
  sekwencją konfiguracja → walidacja i publikacja → sesja klienta. Każda karta
  pokazuje właściciela, działanie, demonstracyjny artefakt i rezultat, a dolna
  granica zaufania wyklucza prywatny pricing i scoring z przeglądarki. Desktop
  używa trzech równych kolumn, mobile osi pionowej bez overflow na 320–430 px.
  Kroki 4–6 pozostają bez redesignu do R3.3. Dedykowany gate R3.1 + R3.2
  przechodzi 16/16, pełny marketing 90/90, pełne testy, lint, typecheck i build
  39 tras są zielone.
- R3.3 zamienia kroki 4–6 `/jak-dziala` w ciemny outcome flow: potwierdzony
  wynik → świadome przekazanie kontaktu → decyzja firmy. Jeden nazwany region
  i trzy H3 zastępują anonimową listę trzech H2, a code-native artefakty
  pokazują bezpieczny wynik, zapis leada oraz dalszą obsługę bez wymyślonych
  KPI. Wynik pozostaje orientacyjny, prywatny score jest w panelu, a wszystkie
  dane przykładowe są oznaczone. Dziewięć viewportów zachowuje tekst minimum
  12 px i zero overflow. Dedykowany gate R3.1–R3.3 przechodzi 27/27, pełny
  marketing 101/101, pełne testy, lint, typecheck i build 39 tras są zielone.
- R3.4 zastępuje płaską listę bezpieczeństwa `/jak-dziala` modelem trzech
  niezależnych barier: serwerowej autoryzacji z tenant scope, wymuszonego RLS
  w PostgreSQL oraz walidacji pliku przed prywatnym storage. Każda warstwa
  pokazuje mechanizm i rezultat, a publiczna granica wyjaśnia bezpieczny
  manifest bez obietnic certyfikatów lub absolutnego bezpieczeństwa. Axe
  wykrył kontrast 4,41:1 dwóch etykiet i wymusił korektę do WCAG AA. Gate
  R3.1–R3.4 przechodzi 38/38, pełny marketing 112/112, pełne testy, lint,
  typecheck i build 39 tras są zielone.
- R3.5 zastępuje wspólny finalny band `/jak-dziala` lokalnym CTA bez self-linku
  i overview rozdzielającym stały mechanizm od branżowego kontekstu. Akcje
  prowadzą do istniejących `/branze` i `/logowanie`, zachowują równą geometrię
  na 320–1536 px, a nazwany region i complementary przechodzą axe oraz forced
  colors. Gate R3.1–R3.5 przechodzi 49/49, pełny marketing 123/123, pełne testy,
  lint, typecheck i build 39 tras są zielone. Historyczny warunek krótszej
  trasy mobile pozostaje otwarty: 8704 px przy 390 px wobec 5698 px w R0, więc
  przed R4.1 wymagany jest osobny pass redukcji rytmu R3.1–R3.4.
- R3.C zamyka ilościowy gate `/jak-dziala`: mobile wykorzystuje natywne
  progressive disclosure z zawsze widocznym rezultatem każdego etapu, podczas
  gdy desktop i tryb bez JavaScriptu zachowują pełną, otwartą treść. Dokument
  przy 390 px skrócił się z 8704 do 5573 px (−36,0%), a przy 320 px z 9350 do
  5883 px (−37,1%), bez usunięcia copy, zmiany kolejności procesu lub poziomego
  overflow. Gate R3.1–R3.C przechodzi 60/60, pełny marketing 134/134, pełne
  testy, lint, typecheck i build 39 tras są zielone. Następny etap to wyłącznie
  R4.1 — hero `/cennik`.
- R4.1 zastępuje płaski hero `/cennik` code-native mapą kwalifikacji
  wdrożenia: proces → publikacja → walidacja → ustalony zakres pilotażu.
  Status self-service zachowuje jawny brak zatwierdzonych kwot, limitów i
  rozliczeń, a dwa równe CTA prowadzą do istniejącego modelu współpracy oraz
  procesu Kwotum. Dziewięć viewportów ma tekst minimum 12 px i zero overflow;
  dedykowany gate przechodzi 11/11, pełny marketing 145/145, pełne testy, lint,
  typecheck i build 39 tras są zielone. Następny etap to wyłącznie R4.2.
- Widoczna marka produktu zmienia się z Lorum na **Kwotum** bez naruszania
  stabilnych identyfikatorów `@wyceno/*`, widgetu, eventów, nagłówków i storage.
  Nowy code-native znak Q ma wspólny SVG dla favicony, auth i panelu oraz
  równoważną wersję inline w marketingu. Finalne CTA na mobile otrzymuje
  poprawne insets i szerokości dzieci: usunięto realne przekroczenie 326,8 px
  wewnątrz panelu 288 px przy viewportcie 320 px oraz skrócono nadmierny rytm
  między blokami. Decyzję, referencje i visual QA zapisują ADR-033 oraz
  `docs/ui/kwotum-brand-v1/`. Dalsza korekta zastępuje trzy arbitralne kolumny
  warunków zwartym railem i usuwa sztywną, krótszą szerokość pierwszego CTA
  przykładowego leada; oba przyciski są teraz równe na desktopie i mobile.
- Rozpoczęto sekcyjną rekonstrukcję desktopowego landingu V7. Etap D1 zamyka
  home-only header, hero i pasek zastosowań według kadru 1672 × 941: wspólne
  osie 64/1608 px, trzywierszowy headline oraz nakładające się code-native
  formularz i dashboard leada. Dodano osobne role kolorystyczne marketingu z
  testem WCAG; fałszywe logo klientów, KPI i nieistniejący terminarz zastąpiono
  działającymi trasami, realnymi kanałami i jawnym fixture'em demonstracyjnym.
  Visual QA zawiera trzy passy, overlay i difference, a marketingowy Playwright
  przechodzi 21/21 na desktopie, reflow i breakpointach smoke.
- Etap D2 przebudowuje sekcję procesu do trzech dużych kart według natywnej
  referencji 1672 × 941. Numery, liniowe SVG i 64-pikselowe łączniki są
  code-native, a karty i dolna powierzchnia trafiają w osie wzorca z różnicą
  około 0–2 px. Tekst kwalifikacji opisuje sprawdzanie kompletności zamiast
  tworzenia brakujących danych. Overlay daje normalized RMSE 0,107663, visual
  QA 19/20, a zestaw marketingowy przechodzi 21/21 wraz z no-JS, reflow,
  forced colors i breakpointami smoke.
- Etap D3 odtwarza cztery kluczowe grupy informacji według V7-03: budżet,
  termin, pliki i zdjęcia oraz demonstracyjny wynik kwalifikacji. Siatka
  1672 × 941 pokrywa osie referencji przy RMSE 0,137486; ikony, plan i score są
  code-native, a fotografie pochodzą z istniejących assetów runtime. CTA demo
  prowadzi do rzeczywistego przykładu leada. Format, lint, typecheck, unit,
  build i marketingowy Playwright 21/21 przechodzą.
- Mikroetap D4 przebudowuje przykład kompletnego leada według fragmentu V7-08:
  pięć parametrów, galeria 2+1, wynik 87/100, następny krok i dwa działające
  CTA. UI jest code-native, a trzy nowe rastry zawierają wyłącznie fotografie
  z zaakceptowanej planszy. Kompozycja 1672 px trafia w osie karty, galerii i
  wyniku z odchyleniem około 0–3 px po skalowaniu overview. Axe wymusił poprawną
  strukturę `dl/dt/dd`; finalnie format, lint, typecheck, unit, build i
  Playwright 21/21 przechodzą.
- Sekcja integracji odtwarza natywną kompozycję V7-04 w 1672 × 941: cztery
  kanały otaczają centralny rekord leada, prowadzą do niego łamane połączenia,
  a dolny rail zachowuje trzy kolumny dowodu. Niepotwierdzone CRM i Google
  Sheets zastąpiono realnymi WordPress i hosted link; e-mail oraz webhook są
  opisane bez fikcyjnych gwarancji. Finalne osie odbiegają od referencji o
  około 0–1 px, normalized RMSE wynosi 0,149777, a gate marketingowy przechodzi
  21/21 po podniesieniu najmniejszej etykiety z 11,2 do 12 px.
- Sekcja pricingu zachowuje dwukolumnową geometrię V7-05 bez kopiowania
  niezatwierdzonych kwot 249/549 zł, limitów, trialu i płatności. Karty opisują
  prawdziwy pilotaż oraz decyzję o dalszym rozwoju, a oba CTA prowadzą do
  kanonicznego `/cennik`. Finalne osie kart `x≈314/831, y≈281` odbiegają od
  referencji o około 0–2 px; normalized RMSE wynosi 0,155654. Test marketingowy
  blokuje kwoty, „14 dni” i kartę płatniczą na home, a pełny zestaw przechodzi
  21/21.
- Sekcja FAQ odtwarza dwukolumnową kompozycję V7-06 w 1672 × 941: pięć
  natywnych pytań `details/summary` po lewej i panel źródeł pomocy po prawej.
  Fikcyjny telefon, e-mail, chat, 98% satysfakcji i SLA zastąpiono działającymi
  trasami produktu oraz prawdziwymi zasadami RLS/MVP. Panel trafia w
  `x≈1079, y≈145, 506 × 716`, a pierwszy wiersz FAQ w `y≈417`; normalized RMSE
  wynosi 0,146369. Akordeon działa klawiaturą i bez JavaScriptu, a pełny zestaw
  marketingowy przechodzi 22/22 po podniesieniu mobilnego kickera do 12 px.
- Finalne CTA odtwarza duży panel V7-07 w 1672 × 941. Panel ma pozycję
  `x=64, y≈80` i rozmiar `1544 × 777`; copy znajduje się po lewej, a trzy
  powierzchnie proof po prawej. Fikcyjne
  128/+20%, 72/+15% i procenty skuteczności zastąpiono pięcioma grupami danych,
  czterema istniejącymi kanałami i demonstracyjnym score 87/100. Działające CTA
  prowadzą do przykładu leada i `/produkt`; normalized RMSE wynosi 0,146519, a
  marketingowy Playwright przechodzi 23/23.
- Stopka kończy sekcyjną budowę desktopu V7 na wspólnej osi `x=64–1608` z
  finalnym CTA. Pełny znak Lorum, status walidacji, trzy semantyczne nawigacje,
  działające linki prawne i dolny rail zastępują stary układ szablonowy.
  Kompozycyjny side-by-side V7-08 potwierdza kolejność całej strony bez
  niewłaściwego RMSE obrazów o innych skalach. Pięć breakpointów zachowuje
  układ 4/2/1 kolumny bez overflow, a marketingowy Playwright przechodzi 24/24.
- Program mobile V1 zaczyna od osobnej transformacji headera i hero zamiast
  skalowania desktopu. M1 usuwa maskowane rozszerzenie min-content: H1 i CTA
  mieszczą się teraz w osiach `16–374 px` przy 390 px oraz `12–308 px` przy
  320 px. CTA mają 56 px, menu 44 px z poprawnym focusem i znakiem zamknięcia,
  fakty tworzą zwartą siatkę, a scena produktu zaczyna się około 124 px wyżej.
  Nowy test sprawdza bounding boxy 320/375/390/430 px, ponieważ samo
  `scrollWidth` nie wykrywało clippingu. Marketingowy Playwright przechodzi
  25/25 bez zmiany desktopowego snapshotu 1440 px.
- M2 mobile przekształca trzy kroki procesu w jedną zwartą, pionową sekwencję.
  Numer i ikona współdzielą górny wiersz, karty mają wysokość wynikającą z
  treści, a centralne łączniki 48 × 48 px zachowują kierunek i dostępny rozmiar.
  Sekcja ma 1146–1179 px zamiast około 1618 px, tekst pozostaje co najmniej
  16 px, a osie `12–308` i `16–374` eliminują clipping na 320–430 px. Nowe
  testy mierzą wysokość, równość kart, marginesy i overflow; tablet 768 px oraz
  desktop 1440 px pozostają bez zmiany.
- M3 mobile zmienia cztery kluczowe grupy danych z czterech wysokich ekranów w
  porównywalną siatkę 2 × 2. Sekcja ma teraz 965–1046 px zamiast 1910–2034 px,
  karty zachowują równe wymiary, tytuły 16 px, pełny budżet i termin, galerię
  2 × 2 oraz code-native score 87. Dedykowane testy blokują zmianę osi,
  wysokości, kolejności i overflow na 320/375/390/430 px. Przy odpowiedniku
  zoomu 200% siatka przechodzi do jednej kolumny; 768 i 1440 px pozostają bez
  zmiany.
- Audyt gotowości dla pierwszych pięciu klientów dodał trzy wykonawcze źródła:
  raport `NO-GO`, checklistę bezpieczeństwa/danych oraz plan sprzedaży i
  onboardingu oferty 599/999 zł. ADR-002 ponownie zatwierdza Supabase z
  warunkami ograniczania lock-in i migracji. Naprawiono reprodukowalny start
  standalone z ignorowanym `.env.local`, dodano syntetyczne publiczne env CI
  oraz blokadę produkcyjnego buildu dla nie-HTTPS/loopbackowego `APP_URL`.
  Aktualny audit zależności nie wykrył znanych podatności; otwarte P0 dotyczą
  rate limit/Turnstile, ClamAV, backup/restore, obserwowalności i zdalnego gate’u
  na immutable SHA.
- Etap 12ZD porządkuje 178,48 MiB niezapisanej historii do audytowalnego
  baseline'u. Stare archiwum kodu, odtwarzalny legacy output oraz 101
  dokładnych lub zastąpionych obrazów QA przeniesiono do odzyskiwalnego Kosza;
  zachowano aktywa runtime, kanoniczne referencje, snapshoty Playwright i
  finalne dowody. Naprawiono uruchamianie seeda visual QA na Node 24,
  serializację współdzielonego fixture'u panelu, cleanup konfliktu dwóch kart,
  selektor granic liczbowych, semantykę metryk i kontrast analityki. Playwright
  potrafi wymusić własny standalone zamiast używać przypadkowego `next dev`;
  pełny panel przechodzi 15/15 bez pozostawiania kont E2E, a ogólny zestaw
  Playwright 34/34. Snapshoty hero zaktualizowano po side-by-side review.
  Clean worktree przechodzi frozen install oraz pełny core gate bez cache.
  Aktywny, równoległy render promo pozostawiono poza baseline'em.
- Dodano kanoniczny program domknięcia produktu i gotowości produkcyjnej.
  Rozdziela on lokalną demonstrację, staging, pilot z prawdziwymi danymi,
  publiczną produkcję i płatny self-service; dokumentuje brak edytorów
  pricingu/scoringu/wyniku oraz konflikt wymagania webhooka, a następnie
  wyznacza sekwencję 12ZD–12ZG i 13A–13D. Rozszerzono roadmapę, blokującą
  checklistę release, pakiet wdrożeniowy firmy, kalibrację reguł, UAT,
  bezpieczeństwo, prawo, restore/rollback, metryki i kontrolowany rollout.
  Zaktualizowano również instrukcję developmentu do istniejącej rejestracji
  i bootstrapu pierwszej organizacji.
- Strona główna została przebudowana do sześciu rozdziałów. Hero pokazuje
  proces klienta, konfigurację reguł oraz gotowy lead jako trzy code-native
  szklane powierzchnie w jednej perspektywie 3D, bez wygenerowanego obrazu
  i bez atrap telefonów. Pięć telefonów branżowych zastąpił jeden ciągły
  storyboard, a dalsze proofy połączono w demo, dokument decyzji, branże
  z publikacją i pilotaż. Visual QA obejmuje 1440/1024/768/390/320 px,
  axe WCAG 2.2 AA, klawiaturę, brak JavaScriptu, reduced motion, forced colors
  i brak poziomego overflow.
- Najnowsza korekta hero zastępuje trzy płaskie powierzchnie jednym fizycznym
  telefonem produktowym. Desktop pokazuje elementy wyniku wychodzące z ekranu,
  mobile używa osobnego kadru z samym telefonem uciętym prawą krawędzią, a oba
  WebP mają kanał alfa bez prostokątnego tła. Przywrócono także pasek sześciu
  okrągłych ikon oraz dodano oszczędne okręgi i pole punktów w tle. Pozostałe
  sekcje i logika produktu nie zostały zmienione.
- Builder pozwala zmieniać kolejność opcji odpowiedzi przez prawdziwe DnD,
  `Alt+ArrowUp/Down` i jawne menu dotykowe. Wszystkie mechanizmy używają jednej
  testowanej operacji, zachowują klucze opcji, przejścia, reguły oraz pozostały
  dokument, przechodzą przez undo/redo i autosave, przywracają fokus i ogłaszają
  wynik w `aria-live`. Visual QA obejmuje 1448/768/390 px, axe i overflow.
  CSP dopuszcza podpisane obrazy wyłącznie z poprawnego, skonfigurowanego originu
  Supabase, bez wildcardów.
- Builder procesu obsługuje pełne zarządzanie sekcjami: utworzenie razem
  z pierwszym poprawnym pytaniem, zmianę nazwy, zwijanie, zmianę kolejności
  całych grup i bezpieczne usunięcie z obowiązkowym przeniesieniem pytań.
  Ostatniej sekcji nie można usunąć, limity domeny są widoczne w UI, pusta
  sekcja ma jawny stan błędu, a wszystkie zmiany przechodzą przez istniejące
  undo/redo, autosave i kontrolę rewizji. Menu, `Alt+strzałka`, `aria-expanded`,
  `aria-live`, przywracanie fokusu oraz testy desktop/tablet/mobile nie zmieniają
  tenant scope ani akcji serwerowych.
- Naprawiono kwadratowy przełącznik „Wymagane” w builderze i ten sam wzorzec
  w ustawieniach prywatności. Checkbox nie dziedziczy już `min-height` ani
  paddingu pól tekstowych; zachowuje natywną semantykę i ma stabilne
  42 × 24 px, gałkę 18 px oraz jawne stany focus, disabled i forced-colors.
  Playwright blokuje regresję geometrii, klawiatury, axe i overflow na
  desktopie, tablecie oraz mobile. Osobny audyt dokumentuje, że grupy logiki
  oraz UI pricingu/scoringu/wyniku nadal wymagają kolejnych etapów.
- Builder pytań obsługuje teraz rzeczywiste przeciąganie między pozycjami
  i sekcjami, równoważne `Alt+strzałka` oraz dotychczasowe akcje
  „wyżej/niżej”. Po operacji zachowuje fokus i ogłasza wynik w `aria-live`.
  Inspektor udostępnia domenowe ograniczenia tekstu, liczby/budżetu i daty,
  pokazuje błędy przy pytaniu oraz polu, zatrzymuje autosave niepoprawnego
  dokumentu i blokuje publikację błędnego grafu bez blokowania poprawnego
  szkicu. Geometria 12W pozostała bez zmian; dodano testy jednostkowe i E2E
  dla drag-and-drop, klawiatury, walidacji, axe i responsywności.
- Builder procesu domyka geometrię zaakceptowanej referencji przy 1448 × 1086:
  zwinięty shell ma rail 78 px, toolbar 85 px, kolumny 360 / 582 / 428 px
  i kartę preview 464 px. Rozwinięty wspólny sidebar Lorum zachowuje trzy
  czytelne panele bez ucięcia inspektora, a toolbar nie nakłada nazwy, statusu
  i akcji. Poniżej dostępnego workspace 77 rem edytor używa jawnych widoków
  Pytania / Podgląd / Ustawienia; mobile skraca CTA oraz udostępnia prawdziwe
  Cofnij/Ponów z klawiatury w menu publikacji. Playwright mierzy desktop,
  tablet, mobile, reflow 200%, długie polskie treści, axe i brak overflow.
- Builder zapisuje zmiany automatycznie po 900 ms przez serializowaną kolejkę,
  redukując oczekujące requesty do najnowszego stanu. Otrzymał prawdziwe
  undo/redo z historią 50 snapshotów, ręczny retry, bezpieczny zapis przed
  nawigacją oraz jawny konflikt dwóch kart bez force overwrite. Rewizja obejmuje
  teraz nazwę i dokument, publikacja opróżnia kolejkę, a krzyżyk inspektora
  rzeczywiście go zamyka; usunięcie pytania jest osobną opisaną akcją.
- Builder otrzymał wersjonowany kontrakt `FlowDocument v2`: prawdziwe,
  uporządkowane sekcje i typowane ograniczenia długości tekstu, zakresu liczby
  oraz daty. Czytnik nadal obsługuje v1 i podnosi stary draft wyłącznie w
  pamięci do chwili jawnego zapisu; historyczne snapshoty nie są przepisywane.
  PostgreSQL niezależnie waliduje publikację v1/v2 i odpowiedzi, a manifest v2
  ujawnia tylko allowlistowane ograniczenia bez sekcji edytora. Nowe szablony
  tworzą draft v2; dodano testy migratora, błędnych sekcji i zakresów,
  publikacji, uprawnień oraz pełnej sesji widgetu.
- Dashboard organizacji został przebudowany według pełnej referencji
  operacyjnej: ma sześć zwartych KPI, działające wyszukiwanie i zakres dat,
  trend wszystkich i jakościowych leadów, statusy, wartość wycen, tabelę
  najnowszych rekordów, ranking procesów, prywatnościowe źródła, przedziały
  wartości, rekordy wymagające reakcji, prawdziwe dostawy powiadomień, szybkie
  akcje oraz stan publikacji i WordPress. Wszystkie agregaty pozostają
  tenant-scoped, moduły bez modelu danych zostały świadomie wyłączone, a mobile
  priorytetyzuje reakcję, KPI i ostatnie leady bez poziomego overflow.
- Domknięto pozostałe funkcjonalne ekrany Lorum: ustawienia organizacji,
  centrum realnych dostaw powiadomień, pełnoszeroką integrację WordPress,
  instalację opublikowanego procesu, onboarding wyprowadzany z danych oraz
  publiczny widget question/result/contact na desktopie i mobile. Ustawienia
  respektują capability `organization:update`, prywatność jest widoczna tylko
  dla ról z `privacy:manage`, embed zawiera wyłącznie publiczne ID, a wszystkie
  akcje są działające. Dodano loading/empty/error/permission states, odbiór
  auth bez redesignu oraz macierz E2E 1536–320 px z axe, klawiaturą, offline,
  forced colors, reduced motion, overlay i difference.
- Analityka organizacji została rozwinięta w spójnym stylu dashboardu:
  zachowuje topbar 78 px, cztery KPI, jasny 30-dniowy wykres i donut jakości,
  a niżej dodaje czterostopniowy lejek, bąble score, 40-polowe wykresy
  kafelkowe źródeł i urządzeń, karty drop-off oraz pierścienie wersji bez
  powtarzalnych pasków `progress`. Stopki KPI porównują bieżący okres
  z poprzednim, filtr 7/30/90 dni jest działającą nawigacją, a średnia wartość
  wyceny oraz score są liczone wyłącznie dla wybranego okresu. Loading i error
  state używają tej samej hierarchii; desktop, 390 px i 320 px nie mają
  poziomego overflow.
- Strona główna otrzymała autorski, minimalistyczny kierunek 3D bez zmiany
  logiki produktu. Hero pokazuje trzy responsywne telefony w sekwencji
  zapytanie → prowadzony proces → gotowy lead, pięć branż jest prezentowanych
  jako mobilne ekrany, a dalsze proofy korzystają ze wspólnej perspektywy,
  promieni i spokojnego rytmu. Interaktywne demo, linki, SEO, no-JS,
  klawiatura, reduced motion, forced colors i tekst minimum 12 px pozostają
  zachowane przy 1440/1024/768/390/320 px.
- Biblioteka `Szablony branżowe` odtwarza najnowszą zaakceptowaną referencję:
  ma breadcrumb i akcje, cztery działające filtry, trzy podsumowania, pięć
  bogatych kart w jednym rzędzie oraz szczegół z etapami i rozwijanym spisem
  pytań. Demonstracyjne `12`, `68%`, import i własny szablon zastąpiły realne
  dane pięciu `flowTemplates` oraz istniejąca akcja utworzenia draftu.
  Zdjęcia zachowują proporcję 1,7:1 na desktopie i mobile, a widoki 1448,
  390 i 320 px przechodzą axe i kontrolę overflow.
- Ekran `Procesy / Formularze` odtwarza teraz zwartą anatomię planszy produktu:
  pięć pełnowierszowych linków z nazwą, realną liczbą pytań i wersją, statusem
  oraz datą. Usunięto szeroki nagłówek tabeli, techniczne slugi, dokładną
  godzinę i powieloną akcję edycji; loading, empty i error state używają tej
  samej lekkiej powierzchni. Duży topbar zastąpił tytuł 12,8 px z małym,
  działającym CTA, a usunięcie limitu 78 rem pozwala karcie wykorzystywać pełną
  szerokość. Mobile mieści dane bez poziomego scrolla, a tenant scope
  i przejście do buildera pozostają bez zmian.
- Szczegóły leada wykorzystują pełne 1280 px obszaru roboczego; panel wyniku
  i prawa kolumna skalują się wraz z viewportem, a typografia operacyjna nie
  jest już kopiowana w miniaturowej skali planszy. Mobilna siatka materiałów
  nie powoduje overflow. Przy okazji poprawiono trzy kontrasty wskazane przez
  axe, bez zmiany tenant scope, danych ani server actions.
- Panel organizacji używa teraz jednego sidebara Lorum na wszystkich trasach:
  208 px domyślnie i 78 px po ręcznym zwinięciu. Przełącznik działa myszą
  i klawiaturą, ma widoczny focus, respektuje reduced motion oraz zapamiętuje
  wyłącznie lokalną preferencję UI. Usunięto warunkowe logo i osobną geometrię
  dashboardu; aktualny `Logoicon.svg`, nazwa Lorum, capability-gated linki,
  skróty i konto pozostają wspólne. Mobile używa osobnej, białej nawigacji
  bez przewijania: Start, Leady, Procesy, Analityka i „Więcej”. Rzadsze,
  capability-gated narzędzia, konto, powiadomienia i pomoc znajdują się
  w dostępnym arkuszu dolnym; szczegół leada oraz robocze trasy procesu
  odzyskują pełną wysokość bez globalnego paska.
- Uporządkowano dokumentację i referencje UI: pięć historycznych raportów
  przeniesiono do `docs/_archive/2026-07-28-pre-lorum-ui-v6/`, usunięto
  identyczną kopię master promptu, zbędny skrócony indeks czterech plansz oraz
  nieużywane duplikaty obrazów. Aktywne referencje pozostają w `references/`,
  a pełne pakiety źródłowe w `docs/ui/lorum-*-reference-*`.
- Panel Lorum został precyzyjnie zrekonstruowany z czterech zaakceptowanych
  referencji: historyczny rail 78 px i topbar 85 px, gęsty dashboard, tabela
  leadów, pełny dokument operacyjny z prawym panelem, analityka oraz wspólny
  settings shell. Wszystkie wartości i akcje nadal pochodzą z tenantowych
  usług, RLS i server actions; nie dodano fikcyjnego opiekuna, kalendarza,
  źródła ani preferencji. Dodatkowy pass 1:1 wyrównał kolumny i kartę buildera,
  topbary, pionowy rytm leada, wykresy dashboardu/analityki oraz ograniczył
  szerokość formularzy ustawień; overlay i difference zostały odświeżone.
  Rozmówna referencja dashboardu zastąpiła wcześniejszy wariant jego treści:
  używa czterech KPI, 18-słupkowego wykresu, donutu jakości i czterech gęstych
  wierszy leadów w geometrii zweryfikowanej dla 1090 × 890 px. Późniejszy
  Etap 12M ujednolicił sam sidebar dla wszystkich tras. Stopki
  wszystkich czterech KPI pokazują rzeczywistą procentową zmianę względem
  poprzednich 30 dni; spadek czasu realizacji jest oznaczany jako wynik
  korzystny.
- Lista leadów została przebudowana wyłącznie według najnowszej referencji
  rozmowy: jeden lekki kontener, tytuł z wyszukiwaniem i działającym CTA,
  pięć filtrów statusu, siedem zwartych kolumn, osiem rekordów na stronę oraz
  skrócona paginacja. Usługi, terminy, budżety, score i statusy nadal pochodzą
  z tenantowych danych; usunięto techniczny topbar, e-maile i drugie linie,
  które zaburzały gęstość referencji.
- Szczegóły leada zostały przebudowane wyłącznie według kolejnej referencji
  rozmowy: kompaktowy profil, wynik z trzema powodami, cztery działające
  zakładki oraz podsumowanie z notatką, statusem i głównym CTA. Odpowiedzi,
  prywatne pliki, historia, zgody i kontrolki retencji pozostały funkcjonalne;
  demonstracyjny lead ma trzy rzeczywiste załączniki w lokalnym Storage.
- Logowanie i rejestracja Lorum korzystają z pełnoekranowego, trójkolumnowego
  shella bez zewnętrznego nagłówka planszy. Subtelna biała oprawa zachowuje
  pierwszy viewport, sekcja cech zaczyna się poniżej, a dwie dopracowane
  ilustracje pokazują builder formularza, leady oraz rzeczywiste etapy
  konfiguracji zamiast generycznych brył. Drugi pass zmniejsza pola, CTA,
  nagłówki, ikony i rytm benefitów o około 20–30% oraz używa wersjonowanych
  adresów ilustracji, aby wykluczyć stary cache. Trzeci pass zwiększa widoczną
  białą oprawę do 12–24 px i rozdziela końcowe elementy rejestracji rytmem
  14–20 px.
- Nawigacja desktopowa strony głównej jest wycentrowana względem całego
  viewportu w niezależnej środkowej kolumnie; szerokość logo i CTA nie
  przesuwa już grupy linków, a zachowanie menu mobilnego pozostało bez zmian.
- Pierwszy fold `/` został skorygowany według najnowszej referencji Wyceno:
  pokazuje pełny dokument leada z ciemnym railem, rozgałęziony connector i
  sześć danych pod hero. Rail oraz węzeł używają właściwego znaku marki, Anna
  Kowalska ma fikcyjny portret demonstracyjny, a ikony odzyskały zielony kolor
  i jasne zielone tło; zachowano warianty 1440/1024/768/390/320.
- Sekcje poniżej hero korzystają ze wspólnej osi i szerokości hero. Usunięto
  nieaktualny poziomy blok „Jak działa Lorum?”, pozostawiono osobną sekcję
  szablonów, a kolejny region odtworzono jako referencyjne porównanie zapytania
  z pionowym procesem 01–04 i kompletnym, kompaktowym dokumentem leada.
- Logo `Logoicon.svg` jest używane jako ikona witryny oraz znak marki obok
  nazwy Lorum w górnym pasku strony głównej.

### Added

- Działające route’y dashboardu organizacji, procesów, pięciu szablonów i
  trzyobszarowego buildera. Edytor zapisuje draft z kontrolą rewizji,
  publikuje immutable wersję, obsługuje pytania, opcje, wymaganie, kolejność,
  podgląd oraz logikę warunkową, a na mobile/tablecie przechodzi w jawne tryby
  zadaniowe zamiast pomniejszać desktop.
- Audyt referencji, gap analysis i raport visual QA panelu z cropami,
  benchmarkami 1448/1536/768/430/390, side-by-side, overlay 50% i difference
  oraz warunkowy test E2E chronionych route’ów. Lokalny, loopback-only seed
  dostarcza deterministyczny stan QA bez zastępowania normalnej aplikacji.
- Pięć fotograficznych kafli branżowych bezpośrednio pod paskiem danych,
  prowadzących do istniejących procesów i zachowujących responsywną siatkę bez
  poziomego overflow.
- Etap 12F, landing board 2: pełnoszerokie, sześciokrokowe demo procesu z
  wymiarami, live briefem i wynikiem oraz przełączany panel pięciu szablonów
  branżowych z realną obsługą klawiatury, transformacją
  1440/1024/768/390/320 i kompletem artefaktów visual QA; końcowy pass usuwa
  elementy spoza referencji i zachowuje wysokość 1709/1710 px na desktopie
  oraz dokładnie 3053/3053 px na mobile.
- V6 Image-Locked reference lock: lokalny pakiet 36 unikalnych obrazów i
  specyfikacji, kanoniczny indeks dokumentacji, screen spec, responsive,
  visual QA, manifest, pomiary, rejestr luk i ADR-028 — bez zmian aplikacji.
- Etap 12E: referencyjna rekonstrukcja wyłącznie strony głównej — zwarty hero
  odpowiedzi → lead, hairline-strip sześciu danych, porównanie i czterostopniowy
  proces, osobny poziomy mobile proof oraz home-only ruch transform-only z
  no-JS, reduced motion i pełnym kontrastem w każdej klatce; pozostałe trasy i
  tokeny pozostały zamrożone.
- Etap 12D: referencyjny reset kompozycji Lorum — pięć rozdziałów landing page,
  jeden czytelny dokument leada zamiast mini-dashboardu, liniowe prymitywy bez
  dekoracyjnych kart oraz przejrzane baseline’y marketingu i design systemu dla
  desktopu i mobile.
- Etap 12C: semantyczny kontrakt tokenów Lorum, wspólna skala typografii,
  spacingu, promieni i cieni oraz ujednolicone prymitywy marketingu i panelu dla
  CTA, statusów, formularzy, tabel i powierzchni danych.
- Etap 12B: marka Lorum, spokojniejsze tokeny i typografia, nowa narracja
  zbierz–uporządkuj–zakwalifikuj–działaj oraz spójny rebranding marketingu,
  panelu, logowania, hosted flow, widgetu, e-maili i konektora WordPress bez
  zmiany publicznych identyfikatorów technicznych.
- Etap 0: komplet dokumentacji Discovery, architektury, UX, SEO, bezpieczeństwa, QA i realizacji.
- Nadrzędne zasady pracy w `AGENTS.md`.
- Etapowy backlog z gate’ami w `docs/TASKS.md`.
- Etap 1: pnpm/Turborepo monorepo, Node 24.18.0 LTS, strict TypeScript, ESLint, Prettier i Vitest.
- Minimalna aplikacja Next.js 16.2.11 z `GET /health`.
- Powtarzalny typecheck Next.js po czyszczeniu (`next typegen`) i uruchamianie
  produkcyjnego artefaktu standalone.
- Ścisła walidacja publicznego i serwerowego środowiska w `@wyceno/config`.
- GitHub Actions dla pełnego quality gate i skanowania sekretów oraz Dependabot.
- Polityki supply chain: exact versions, lockfile, release age, strict peers i allowlista build scripts.
- Etap 2: zatwierdzone tokeny, dostępna biblioteka `@wyceno/ui`, responsywny
  layout panelu i strona weryfikacyjna `/design-system`.
- Testy kontrastu, zachowania komponentów, axe, klawiatury, reduced motion oraz
  visual regression dla desktopu i mobile.
- Etap 3: migracja profili, organizacji, członkostw i audit logu z wymuszonym
  RLS oraz ochroną ostatniego aktywnego Ownera.
- Prywatny bucket tenantowy z politykami odczytu, zapisu i usuwania opartymi na
  aktywnym członkostwie i UUID organizacji w ścieżce.
- Supabase Auth SSR/PKCE, ekran logowania, odświeżanie sesji, chroniony panel i
  odpowiedzi `private, no-store`.
- `@wyceno/database` z typami schematu, macierzą capabilities i typowanym
  `TenantContext`.
- Rzeczywisty test PostgreSQL separacji dwóch tenantów dla danych i plików,
  wykonywany lokalnie i na serwisie PostgreSQL 17 w CI.
- Etap 4: wersjonowany dokument flow v1, walidator grafu, ograniczone reguły
  IF/THEN i pięć syntetycznych szablonów branżowych.
- Draft z kontrolą rewizji, atomowa publikacja, SHA-256 snapshotu, stabilny
  alias publiczny i archiwizacja wersji.
- Niezmienne snapshoty oraz integracyjne testy publikacji, konfliktów, pętli,
  ról i IDOR dla dwóch tenantów.
- Etap 5: natywny `@wyceno/widget`, idempotentny loader, Shadow DOM oraz tryby
  inline, popup, fullscreen i hosted link.
- Allowlistowany manifest, atomowe utworzenie sesji, hashowany token,
  siedmiodniowe expiry, rewizje i idempotentne mutacje odpowiedzi.
- Autosave, wznowienie, kolejka odporna na utratę sieci, synchronizacja kart i
  serwerowa walidacja routingu na immutable snapshotcie.
- Publiczne Route Handlers v1 z walidacją Zod, stabilnymi błędami, CORS,
  request ID i tokenem poza URL.
- Testy widgetu dla XSS, uszkodzonego storage, offline, mobile, klawiatury,
  axe, popupu i izolacji od CSS hosta oraz budżet 90 KiB gzip.
- Etap 6: wersjonowany, deklaratywny model pricingu i scoringu z integer minor
  units, basis points, stawkami jednostkowymi i jawnym round half-up.
- Deterministyczne kalkulatory TypeScript/PostgreSQL, kategorie 0–100 oraz
  uporządkowane ślady uruchomionych reguł.
- Serwerowy wynik na immutable snapshotcie sesji, bezpieczny publiczny endpoint
  bez scoringu i reguł wewnętrznych oraz prezentacja exact/range/from w widżecie.
- Testy granic, kolejności, walut, overflow, błędnej konfiguracji, niepełnej
  sesji i prób dostępu do prywatnego kalkulatora.
- Etap 7: wersjonowany lead capture z wymaganym e-mailem, potwierdzeniem
  informacji prywatności i odrębną opcjonalną zgodą marketingową.
- Atomowy, odporny na retry submit, który kopiuje odpowiedzi, ponownie liczy
  pricing/scoring i tworzy jeden lead na sesję bez ujawniania PII publicznie.
- Prywatny upload do 5 × 25 MiB z allowlistą JPEG/PNG/WebP/PDF, kontrolą
  rozszerzenia, MIME, magic bytes, SHA-256 i podpisanym odczytem w panelu.
- Responsywna lista i szczegół leadów dla Owner/Admin/Sales ze statusami,
  append-only historią, notatkami, zgodami, odpowiedziami i plikami.
- Testy PostgreSQL submitu, idempotencji, ról i IDOR między tenantami oraz E2E
  formularza kontaktowego i uploadu.
- Etap 8: wersjonowane, escapowane szablony HTML/text potwierdzenia klienta i
  alertu dla firmy, z semantyczną strukturą oraz bez prywatnego score dla
  klienta.
- Transakcyjny tenantowy outbox, historia prób, blokady workera, odzyskiwanie
  stale lock, ograniczony retry/backoff i maksymalnie pięć prób.
- Minimalnie uprzywilejowane RPC workera, chroniony endpoint wewnętrzny,
  deterministyczny test mode bez sieci i opcjonalny adapter Resend REST ze
  stabilnym kluczem idempotencji.
- Status dostawy na szczególe leada oraz testy renderowania, klasyfikacji błędów,
  braku PII w logach, izolacji tenantów i pełnego przepływu retry.
- Etap 9: first-party analytics z wersjonowaną, niewymuszoną zgodą, ścisłym
  kontraktem zdarzeń bez dowolnych metadanych i 90-dniową retencją.
- Tenantowe agregaty rozpoczęć, wyników, leadów, mediany czasu, drop-off,
  źródeł, urządzeń, wersji i rozkładu score z progiem małej próby pięciu sesji.
- Responsywny dashboard analityki dla Owner/Admin/Sales oraz surowe zdarzenia
  dostępne wyłącznie Owner/Admin; testy kontrolnych sesji potwierdzają metryki,
  izolację tenantów, wycofanie zgody i ograniczenia ról.
- Etap 10: code-first landing, produkt, jak działa, agencje, WordPress i uczciwy
  cennik pilotażowy bez wymyślonych kwot lub limitów.
- Pięć unikalnych stron branżowych i pięć stron funkcyjnych z działającym,
  bezsieciowym fragmentem demo, syntetycznymi briefami i jawnymi granicami.
- Allowlistowane sitemap/robots, unikalne metadata i canonical, bezpieczne
  Organization/SoftwareApplication/BreadcrumbList, noindex powierzchni
  prywatnych oraz dostępne strony 404/500.
- Crawl i link check 18 stron, axe/klawiatura, mobile bez overflow, kontrola
  uczciwego cennika i budżet 250 KiB transferu JavaScriptu marketingowego.
- Etap 11: jednorazowy, 10-minutowy bootstrap WordPress przypięty do originu
  HTTPS, hash-only token/credential w SaaS i szyfrowanie credentialu salts
  instalacji przez sodium w WordPressie.
- Tenantowe RPC i API connect/list/diagnostics/disconnect, panel Owner/Admin z
  tokenem pokazywanym tylko raz oraz audyt połączenia i revocation.
- Cienka wtyczka z listą opublikowanych flow, shortcode, dynamicznym blokiem
  Gutenberg, inline/popup/fullscreen, diagnostyką CSP/REST/WP/PHP/sodium i
  pełnym usunięciem lokalnego credentialu.
- Testy replay, ról, IDOR, allowlisty i braku plaintextu w PostgreSQL oraz
  harness PHP dla escapingu, TLS, pinned origin, braku sekretu we froncie i
  konfliktów globalnych. CI zawiera rzeczywistą macierz WordPress
  6.8.3–7.0.2 / PHP 8.3–8.5.
- Etap 12: model zagrożeń i audyt z mapą IDOR/XSS/upload/rate-limit/replay,
  jawnymi ownerami i terminami ryzyk oraz produkcyjnymi bramkami prawnymi.
- Owner-only eksport danych leada, legal hold i trwałe usunięcie storage-first
  wraz z wymuszonym RLS, nieidentyfikującym dowodem operacji i testami drugiego
  tenanta.
- Opt-in retencja leadów, cleanup wygasłych sesji i chroniony worker, który
  ponownie sprawdza warunki przed usunięciem oraz zatrzymuje się przy awarii
  Storage.
- ClamAV INSTREAM dla uploadu z fail-closed poza loopback, timeoutem i testami
  złośliwego pliku/awarii skanera.
- CSP/HSTS i pozostałe nagłówki ochronne, lokalny SAST/secret scan, CodeQL oraz
  blokujący dependency audit w CI.
- Remediacja wszystkich podatności high w grafie zależności przez bezpieczne
  `sharp@0.35.3`, `postcss@8.5.22` i `brace-expansion@5.0.8`; ponowny audit nie
  wykrywa znanych podatności. Wąski patch CommonJS zachowuje zgodność
  `minimatch@3` bez cofania poprawki bezpieczeństwa.
- Roboczy rejestr DPA/subprocesorów i checklistę review prawnego bez
  pozorowania podpisanej akceptacji.
- Poprawiona instrukcja lokalnego startu: pnpm uruchamia przypięty Node 24.18.0,
  marketing działa bez bazy, a Auth/panel wymagają Supabase i
  `apps/web/.env.local` zamiast pliku env w root repozytorium.
- Etap 12A: premium minimalistyczny redesign 18 tras marketingowych z
  code-native widokiem kwalifikacja → brief, redakcyjnymi kompozycjami,
  dostępnym menu mobilnym i pełną macierzą responsywną 1440–320 px.
- Spójny operacyjny shell panelu z wąskim zielonym railem, tabelą leadów,
  dokumentowym szczegółem, spokojną analityką, integracjami, prywatnością oraz
  stanami loading/empty/error/permission/success.
- Ujednolicone logowanie, hosted flow i wszystkie tryby widgetu: mniejsze
  promienie, cienkie linie, oszczędne statusy, forced colors i reduced motion.
- Artefakty porównawcze przed/po, testy dostępności/klawiatury/crawlu oraz raport
  zgodności i self-review w
  `docs/_archive/2026-07-28-pre-lorum-ui-v6/PREMIUM_MINIMAL_REDESIGN_AUDIT.md`.

### Not implemented

- Podpisane review prawne DPA/subprocesorów, zatwierdzone okresy i transfery
  oraz produkcyjny scheduler/hosting/WAF pozostają bramkami zamknięcia Etapu 12
  i wejścia do Etapu 13.
- Zdalny przebieg GitHub Actions jest zablokowany przez stan billingowy konta
  GitHub, zanim runner zaczyna wykonywać kroki projektu.
