# Adaptive Intake — macierz odbioru

## Kryteria wspólne PX2–PX7

| Obszar       | Kryterium blokujące                                                         |
| ------------ | --------------------------------------------------------------------------- |
| Produkt      | etap rozwiązuje nazwany problem użytkownika i ma metrykę decyzji            |
| Dane         | schema jest wersjonowana, limitowana i ma migrator kompatybilności          |
| Security     | brak dowolnego HTML/CSS/URL/kodu; publiczna projekcja jest allowlistowana   |
| Tenant       | każdy zapis i odczyt ma jawny organization scope oraz test drugiego tenanta |
| Pricing      | klient nie przesyła ceny, score ani outcome                                 |
| A11y         | klawiatura, focus, etykieta tekstowa, zoom, reduced motion, forced colors   |
| Mobile       | 320, 390 i 768 px bez poziomego overflow i utraty akcji                     |
| Stany        | loading, empty, validation, offline, retry, expired i unavailable           |
| Performance  | widget pozostaje poniżej zatwierdzonego budżetu gzip i bez eager media      |
| QA           | unit, PostgreSQL/RLS, E2E, axe, build i visual QA zgodne z etapem           |
| Dokumentacja | ADR, kontrakty, backlog, changelog i raport etapu są aktualne               |

## PX1 — discovery i kontrakt

- [x] Audyt kodu, dokumentacji, publicznej strony i artefaktów visual QA.
- [x] Jedna decyzja o trzech trybach oparta na wspólnym silniku.
- [x] Zdefiniowane non-goals, kolejność i granice bezpieczeństwa.
- [x] Utworzone izolowane kontrakty worktree i prompty.
- [ ] Minimum pięć wywiadów z firmami, w tym dwóch operatorów leadów.
- [ ] Minimum pięć testów klientów końcowych w co najmniej trzech usługach.
- [ ] Warsztat Fortez z akceptacją szybkiej i prowadzonej ścieżki.
- [ ] Mapa decyzji: kiedy lista, karta tekstowa, ikona, zdjęcie lub zwykłe pole.

PX1 pozostaje `DOCUMENTATION COMPLETE / RESEARCH OPEN`. Nie daje zgody na
produkcyjny rollout ani nazywanie szablonów zweryfikowanymi.

## PX2 — schema prezentacji

- [x] Flow v1/v2 pozostaje odczytywalny i publikowalny.
- [x] Nowy schema version ma deterministyczny migrator i round-trip fixtures.
- [ ] Ikony pochodzą z zamkniętego katalogu; media z prywatnego, tenantowego źródła.
- [x] PostgreSQL niezależnie waliduje limity, allowlistę i format referencji.
- [x] Manifest nie ujawnia prywatnych metadanych assetu.
- [x] Brak zmiany logiki renderera i CSS runtime w tym etapie.

**Stan lokalny 2026-08-25:** pięć kryteriów jest spełnionych. Kryterium źródła
mediów pozostaje otwarte: PX2 przyjmuje wyłącznie UUID i nie rozwiązuje go do
URL, ale tenantowy rejestr oraz kontrola własności referencji są według ADR-044
częścią atomowego wdrożenia mediów w PX4. Nie wolno uruchomić `image_cards`,
dopóki ten warunek nie zostanie spełniony.

Właściciel polecił przejść do kolejnego etapu lokalnego. Traktujemy to jako
akceptację przeniesienia brakującej kontroli assetów do twardej bramy PX4, a
nie jako spełnienie ani usunięcie kryterium. PX3 nie udostępnia mediów.

## PX3 — quick form

- [x] Ten sam snapshot tworzy ten sam lead niezależnie od kompozycji.
- [x] Publikacja blokuje nieobsługiwany graf quick form z jasnym wyjaśnieniem.
- [x] Walidacja prowadzi do pierwszego błędnego pola i zachowuje dane.
- [x] Submit zachowuje idempotencję, Turnstile, rate limit i privacy proof.
- [x] E2E obejmuje 320/390/768/1440 px, klawiaturę i offline retry.

**Stan lokalny 2026-08-25:** implementacja techniczna PX3 jest ukończona.
Prawdziwy runtime renderuje jedną zwartą powierzchnię do 8 pytań, builder
blokuje rozgałęzienia przed zapisem i publikacją, a pełny gate opisuje
`PX3_IMPLEMENTATION_REPORT.md`. Po odrzuceniu wcześniejszego generycznego
renderu wykonano nowy projekt bez użycia starych zdjęć; odbiór wizualny
właściciela pozostaje otwarty.

## PX4 — visual choices

- [x] Każda wdrożona karta ma tekstową nazwę; ikona nie jest jedyną informacją.
- [x] Brak obrazu i błąd pobrania mają stabilny fallback bez layout shift.
- [x] Wyboru nie komunikuje wyłącznie kolor.
- [x] Builder pokazuje ten sam wariant co publiczny runtime.
- [x] Media są lazy-loaded, limitowane i nie rozszerzają publicznego Storage.

**Stan lokalny 2026-08-25:** cały PX4 jest technicznie ukończony. Builder wymaga
kompletnego opisu, ikony albo tenantowego zdjęcia przed zapisem, a podgląd
korzysta z tego samego Web Componentu co publiczna ścieżka. Ikony pochodzą z
zamkniętego katalogu kodu i nie przyjmują SVG, HTML ani URL użytkownika. E2E
obejmuje 1440/390 px, axe, zmianę kroku i brak utraty początku formularza na
telefonie. Warstwa obrazowa ma prywatny rejestr organizacji, normalizację do
WebP, niezależną kontrolę RLS i referencji przy zapisie/publikacji oraz wąski
publiczny resolver. Fallback zachowuje stały aspekt i przeszedł axe po korekcie
kontrastu.

## PX5 — context/prefill

- [x] Nieznany klucz i błędny typ są odrzucane fail-closed.
- [x] Kontekst nie nadpisuje zgody, tenant ID, ceny, score ani routingu.
- [x] Origin jest ponownie sprawdzany przed sesją i mutacją.
- [x] Lead zachowuje audytowalne źródło bez dowolnych metadanych i PII w analytics.
- [x] Fortez może przekazać model bez ponownego pytania klienta.

**Stan lokalny 2026-08-25:** PX5 jest technicznie ukończony. Builder publikuje
zamknięty schemat maksymalnie ośmiu pól, publiczny guard i PostgreSQL walidują
wejście niezależnie, a odpowiedzi są blokowane do potwierdzenia pól `confirm`.
Kontrolny scenariusz `model` + `product_id` przechodzi bez powtórnego pytania,
z osobnym snapshotem na leadzie i bez wartości w analytics. WordPress i procesy
bez kontekstu zachowują kompatybilność. Visual QA 1440/390 używa wyłącznie
bieżącego, własnego UI bez starych zdjęć. Raport: `PX5_IMPLEMENTATION_REPORT.md`.

## PX6 — contact, outcomes i branding

- [x] Każda ścieżka ma przynajmniej jeden kanał kontaktu albo jawny no-lead result.
- [x] Outcome jest liczony lub wybierany po stronie serwera z immutable snapshotu.
- [x] Publiczny wynik nie ujawnia score ani uruchomionych reguł prywatnych.
- [x] Logo i kolor mają fallback, kontrolę typu, rozmiaru i kontrastu.
- [x] Brak obietnic SLA bez zatwierdzonej konfiguracji firmy.

**Stan lokalny 2026-08-25:** PX6 jest technicznie ukończony. Pełny kontrakt,
negatywne testy, propagację preferencji, visual QA bez historycznych zdjęć i
rollback opisuje `PX6_IMPLEMENTATION_REPORT.md`.

## PX7 — pilot

- [ ] Stary formularz/telefon/WhatsApp pozostaje działającym fallbackiem.
- [ ] Oddzielne źródła pozwalają porównać quick i guided bez PII.
- [ ] Zero tenant leakage, utraconych zaakceptowanych submitów i cichych błędów kolejki.
- [ ] Firma akceptuje brief, wynik, kontakt, treści prawne i plan wyłączenia.
- [ ] Review kończy się podpisanym GO, ITERATE albo NO-GO.

**Readiness PX7 2026-08-25:** trzy syntetyczne konfiguracje przechodzą parser i
pełny walidator, zachowują stare kanały oraz rozdzielają quick/guided po osobnym
flow bez PII. Nie uruchomiono prawdziwego pilota. Staging, operacje kolejki,
restore, prawo, właściciele obu firm, nowe tenantowe media i podpisane UAT są
zablokowane. Formalna decyzja lokalnego review to **NO-GO dla prawdziwego
ruchu**; pola PX7 pozostają otwarte do dostarczenia wymaganych dowodów.
