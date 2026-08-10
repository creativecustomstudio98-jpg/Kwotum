# Program domknięcia produktu i gotowości produkcyjnej

**Status:** kanoniczny plan wykonawczy  
**Wersja:** 1.0  
**Ostatni przegląd:** 2026-08-09
**Zakres:** od lokalnie działającego produktu do kontrolowanego pilota i
publicznej produkcji

## 1. Cel dokumentu

Ten dokument zamienia rozproszony backlog, audyty i checklisty w jedną kolejność
wykonania. Nie zastępuje wymagań produktu, decyzji ADR, polityk bezpieczeństwa
ani checklisty release. Określa:

- co jest już działającą częścią produktu;
- jakie luki blokują główną obietnicę Kwotum;
- co blokuje użycie prawdziwych danych;
- w jakiej kolejności domknąć produkt, repozytorium, infrastrukturę, prawo i
  operacje;
- jakie dowody są wymagane przed pilotem i przed publicznym uruchomieniem;
- jak wdrażać Kwotum w kolejnych firmach bez tworzenia osobnej, niespójnej
  wersji produktu dla każdego klienta.

W przypadku konfliktu pierwszeństwo zachowuje kolejność z `INDEX.md`:
bezpieczeństwo i prywatność, ADR, wymagania produktu, kontrakty techniczne,
`TASKS.md`, a dopiero potem niniejszy plan.

## 2. Werdykt gotowości

| Poziom                                       | Stan 2026-07-29 | Warunek przejścia dalej                                          |
| -------------------------------------------- | --------------- | ---------------------------------------------------------------- |
| Lokalna demonstracja na danych syntetycznych | gotowa          | utrzymać działający seed i pełny lokalny gate                    |
| Wewnętrzne testy produktu                    | gotowe lokalnie | zamrozić stan w repozytorium i uruchomić CI z czystego checkoutu |
| Staging bez danych rzeczywistych             | brak            | ukończyć Etap 12ZD i wybrać dostawców środowiska                 |
| Kontrolowany pilot z danymi rzeczywistymi    | niedozwolony    | ukończyć 12ZE–12ZG oraz bramkę pilota z sekcji 11                |
| Publiczna produkcja                          | niedozwolona    | ukończyć Etap 13 i całą `RELEASE_CHECKLIST.md`                   |
| Płatny self-service                          | poza MVP        | osobna decyzja o planach, limitach, płatnościach i rozliczeniach |

Produkt jest funkcjonalnie zaawansowany, ale nie jest kandydatem release.
Najważniejsze przyczyny:

1. główny silnik estymacji istnieje, lecz builder nie udostępnia edytora
   pricingu, scoringu i wyniku;
2. webhook zapisany w MVP nie ma implementacji;
3. bieżący produkt nie jest zachowany w immutable commit i nie przeszedł
   zdalnego CI jako jeden kandydat;
4. nie istnieje staging, produkcyjna infrastruktura, monitoring, scheduler,
   restore drill ani rollback rehearsal;
5. status prawny pozostaje `LEGAL REVIEW REQUIRED`.

## 3. Kanoniczna obietnica produktu

Kwotum prowadzi respondenta przez wersjonowany proces, zbiera zakres, budżet,
termin, lokalizację i materiały, a następnie:

1. oblicza na serwerze niewiążącą estymację;
2. oblicza prywatny score jakości leada;
3. pokazuje respondentowi wyłącznie bezpieczny wynik publiczny;
4. zapisuje firmie odpowiedzi, wynik, wyjaśnienie i wersję procesu;
5. uruchamia kontrolowane powiadomienia i dalszą obsługę.

Estymacja może mieć formę:

- dokładnej kwoty;
- przedziału;
- wartości „od”;
- wyniku bez ceny;
- zaproszenia do konsultacji.

Silnik wykonuje ograniczone, deklaratywne operacje `add`, `multiply` i
`add_per_unit`, używa integer minor units, jawnego zaokrąglenia i immutable
snapshotu. Klient nie przesyła ceny ani score. Kwotum nie jest formalnym
kosztorysem, CPQ, ofertą, umową ani fakturą.

## 4. Stan funkcjonalny

### 4.1 Gotowe lokalnie

- Supabase Auth, rejestracja, reset hasła, Google OAuth i bootstrap pierwszej
  organizacji;
- role Owner/Admin/Sales, tenant context, forced RLS i testy IDOR;
- pięć szablonów, draft, walidacja grafu, wersjonowanie i publikacja;
- builder sekcji, pytań i opcji, kolejność, undo/redo, autosave i konflikt
  rewizji;
- publiczny widget inline, popup, fullscreen i hosted link;
- serwerowy pricing/scoring, ponowne obliczenie przy submit i explainability;
- leady, odpowiedzi, zgody, pliki, statusy, notatki, historia i eksport Ownera;
- outbox e-mail, retry, historia dostaw i tryb testowy;
- analityka first-party, dashboard, drop-off, źródła i progi małej próby;
- WordPress: bootstrap, credential, shortcode, blok, popup i diagnostyka;
- retencja opt-in, legal hold, storage-first erasure i audyt;
- marketing, techniczne SEO, noindex powierzchni prywatnych i responsywne UI.

### 4.2 Luki głównej ścieżki

#### Edytor estymacji

Model i silnik `FlowDocument.estimation` są gotowe, ale nie mają kompletnego UI.
Zwykły Owner/Admin musi otrzymać trzy działające tryby buildera:

1. **Wycena** — waluta, prezentacja, baza min/max, zaokrąglenie i uporządkowane
   reguły;
2. **Scoring** — punkty startowe, kategorie, progi i reguły;
3. **Wynik** — headline, disclaimer, następny krok i live preview publicznego
   wyniku.

Bez tego automatyczna wycena jest funkcją backendu, a nie kompletną funkcją
self-service.

#### Webhooki

`PRODUCT_REQUIREMENTS.md`, `SCOPE.md`, `API_CONTRACTS.md` i release checklist
wymagają webhooka HMAC. ADR-034 utrzymuje go w MVP, ponieważ pozwala firmom i
agencjom przekazywać leady do istniejących systemów bez natywnego CRM. Etap
12ZF wdraża bezpieczny kontrakt aplikacyjny; produkcyjny scheduler, alerty i UAT
pozostają częścią bramki 13A.

#### Logika warunkowa

Proste IF/THEN jest gotowe i wystarcza dla pierwszego pilota. Grupy
IF/AND/OR, włączanie całego bloku i złożone priorytety reguł pozostają osobnym
rozszerzeniem. Nie blokują pilota, dopóki konkretna kalibracja nie wykaże, że
proces firmy nie daje się poprawnie opisać prostym AST.

## 5. Zasady wykonania

1. Nie rozpoczynać infrastruktury produkcyjnej na niezamrożonym working tree.
2. Nie dodawać pricingu wyłącznie jako kontrolek UI; zapis, walidacja, preview,
   publikacja i wynik muszą działać end-to-end.
3. Nie wpisywać „rynkowych” cen do szablonów bez zatwierdzenia firmy.
4. Nie używać danych rzeczywistych na preview ani stagingu.
5. Nie włączać Resend, zewnętrznego error trackingu ani analityki bez
   procurementu i oceny prywatności.
6. Nie publikować webhooka bez SSRF protection, podpisu, retry, idempotencji i
   redakcji logów.
7. Nie uznawać istnienia backupu za restore drill.
8. Nie uznawać lokalnego testu za produkcyjny smoke test.
9. Nie obniżać RLS, walidacji ani testów w celu przyspieszenia pilota.
10. Każdy etap kończy się osobnym gate’em i zapisanym dowodem.

## 6. Program etapowy

### Etap 12ZC — audyt i program domknięcia

**Cel:** jedno źródło prawdy dla drogi do produkcji.

**Zakres:**

- audyt obietnicy produktu, silnika, buildera, API, bezpieczeństwa, prawa,
  infrastruktury i stanu repozytorium;
- rozdzielenie gotowości lokalnej, stagingowej, pilotażowej i publicznej;
- zapis braków edytora estymacji i webhooków;
- synchronizacja `INDEX.md`, `TASKS.md`, `ROADMAP.md`,
  `RELEASE_CHECKLIST.md`, `DEVELOPMENT.md` i `CHANGELOG.md`;
- zapis kolejności 12ZD → 12ZE → 12ZF → 12ZG → 13.

**Gate:** dokumenty nie przypisują statusu produkcyjnego funkcjom działającym
wyłącznie lokalnie; każdy blocker ma etap, ownera typu roli i dowód odbioru.

### Etap 12ZD — zamrożony baseline repozytorium

**Cel:** przekształcić rozległy working tree w audytowalny kandydat bazowy.

**Zakres:**

1. wykonać inventory wszystkich zmodyfikowanych, usuniętych i nieśledzonych
   plików;
2. oddzielić kod produktu, dokumentację, testy, artefakty QA, lokalne archiwa
   i pliki niedozwolone w repozytorium;
3. sprawdzić brak sekretów, danych klientów, lokalnych dumpów i credentiali;
4. usunąć lub zarchiwizować wyłącznie pliki zatwierdzone przez inventory;
5. zaktualizować dokumentację, która nadal opisuje starszy stan produktu;
6. uruchomić pełny gate z czystego checkoutu na Node 24.18.0 i pnpm 11.17.0;
7. utworzyć logiczne commity, wypchnąć branch i uzyskać zielone CI;
8. wskazać immutable commit SHA jako bazę kolejnego etapu.

**Dowody:**

- czysty `git status`;
- raport inventory;
- `format:check`, lint, typecheck, unit, PostgreSQL/RLS, WordPress, E2E, SAST,
  secret scan, dependency audit i build;
- Semgrep CE i pełnohistoryczny Gitleaks;
- artefakty CI przypięte do SHA.

**Gate:** nie ma niejawnych plików lokalnych, wszystkie zmiany są zreviewowane,
CI jest zielone na SHA, a checkout od zera odtwarza build i testy.

### Etap 12ZE — self-service pricing, scoring i wynik

**Cel:** udostępnić główną obietnicę produktu w istniejącym builderze.

#### Wycena

- włącz/wyłącz automatyczną wycenę;
- waluta z allowlisty;
- prezentacja `exact`, `range` lub `from`;
- baza minimalna i maksymalna w formularzu walutowym, zapisywana jako minor
  units;
- krok zaokrąglenia;
- lista maksymalnie 50 reguł;
- operacje `add`, `multiply`, `add_per_unit`;
- warunek oparty wyłącznie na istniejącym kroku i poprawnej wartości;
- zmiana kolejności reguł przez jedną testowaną operację;
- czytelne podsumowanie wpływu reguły bez obietnicy, że warunek zawsze zadziała.

#### Scoring

- włącz/wyłącz scoring;
- punkty początkowe;
- kategorie z pierwszym progiem 0 i rosnącymi progami;
- maksymalnie 50 reguł od -100 do 100 punktów;
- prywatny preview score i listy uruchomionych reguł;
- brak ujawnienia scoringu respondentowi i w publicznym manifeście.

#### Wynik

- headline, disclaimer i next step label;
- tryb konsultacji lub brak ceny przy wyłączonym pricingu;
- live preview dokładnie tego kontraktu, który otrzyma respondent;
- preview scenariusza odpowiedzi bez zapisywania leada;
- jawne oznaczenie „wynik orientacyjny, nie stanowi oferty”.

#### Integracja z builderem

- osobne tryby `Pytania`, `Logika`, `Wycena`, `Scoring`, `Wynik`, `Podgląd`;
- ten sam `FlowDocument`, historia, undo/redo, autosave i kontrola rewizji;
- niedozwolona konfiguracja zatrzymuje autosave oraz publikację;
- nie przepisywać opublikowanych snapshotów;
- usunięcie pytania użytego w pricingu/scoringu musi zostać zablokowane albo
  wymagać jawnego usunięcia referencji;
- zmiana klucza opcji nie może po cichu zmieniać wyniku.

#### Testy

- unit: wszystkie operacje edytora i walidatory granic;
- PostgreSQL: ponowna walidacja publikacji, ról, IDOR i immutable wersji;
- E2E: konfiguracja → preview → publikacja → hosted flow → wynik → submit →
  prywatny lead;
- manipulacja ceną po stronie klienta;
- dwie karty, konflikt, undo/redo i błąd sieci;
- exact/range/from, PLN i co najmniej jedna waluta o innej liczbie minor units;
- mobile, klawiatura, axe, forced colors i 200% reflow.

**Gate:** Owner/Admin potrafi bez dostępu do bazy utworzyć, przetestować,
opublikować i zmienić wersję procesu z działającą estymacją. Sales nie widzi
draftu ani konfiguracji. Publiczny klient nie otrzymuje score ani reguł.

### Etap 12ZF — webhook v1 albo formalna redukcja MVP

**Cel:** usunąć konflikt między wymaganiami a implementacją.

ADR-034 utrzymuje webhook w MVP. Zakres obejmuje:

- tenantowe endpointy dostępne Owner/Admin;
- dokładny URL HTTPS i zakaz credentiali w URL;
- ochronę SSRF: prywatne adresy, loopback, metadata endpoints, DNS rebinding,
  redirecty i niedozwolone porty;
- sekret pokazywany raz i bezpieczna strategia przechowywania/derywacji;
- podpis `timestamp + "." + raw_body` przez HMAC-SHA256;
- `event_id`, `delivery_id`, typ, czas, wersję kontraktu i minimalny payload;
- co najmniej event `lead.created`, bez plików i bez prywatnego scoringu, chyba
  że jawny kontrakt tenantowy stanowi inaczej;
- idempotencję, retry z ograniczonym backoffem i dead-letter state;
- przycisk testu korzystający z oznaczonego, syntetycznego eventu;
- historię prób bez zapisu pełnej odpowiedzi odbiorcy i bez PII w logach;
- worker z osobnym sekretem, schedulerem i alertami;
- rotację sekretu, wyłączenie endpointu i audyt operacji.

**Testy:** podpis, replay window, duplikaty, timeout, TLS, redirect, DNS/IP,
drugi tenant, role, redakcja, retry i zatrzymana kolejka.

**Gate:** release checklist nie odwołuje się do nieistniejącej funkcji. Jeżeli
webhook zostanie usunięty z MVP, wymagania, scope, API, QA, marketing i release
muszą zostać zmienione w tym samym etapie.

### Etap 12ZG — kalibracja i pakiet pilotażowy

**Cel:** zastąpić technicznie poprawne fixture'y regułami zaakceptowanymi przez
konkretne firmy.

#### Wybór pilotów

- 1–3 firmy z jednego lub maksymalnie dwóch zbliżonych segmentów;
- wskazany Owner biznesowy, osoba od wyceny i osoba obsługująca leady;
- podpisane warunki pilota, DPA i kanał wsparcia;
- brak szczególnych kategorii danych w procesie.

#### Warsztat procesu

1. zmapować aktualny formularz, telefon i ręczną wycenę;
2. określić dane konieczne do orientacyjnego wyniku;
3. oddzielić czynniki ceny od czynników kwalifikacji;
4. zdefiniować sytuacje `no_price`/`consultation`;
5. ustalić disclaimer i sposób komunikowania zakresu;
6. ustalić statusy i odpowiedzialność po wpłynięciu leada.

#### Kalibracja

- przygotować anonimowy lub syntetyczny zestaw przypadków odpowiadających
  historycznym typom zapytań;
- dla każdego przypadku zapisać oczekiwany przedział i uzasadnienie eksperta;
- ustalić przed uruchomieniem dopuszczalny poziom odchylenia i przypadki
  wymagające konsultacji;
- przeprowadzić test regresji reguł;
- zatwierdzić wersję przez wskazaną osobę w firmie;
- nie zmieniać opublikowanej wersji; każda korekta tworzy nową.

#### UAT i instalacja

- test Owner/Admin/Sales;
- hosted link i widget na kopii strony lub stagingu klienta;
- WordPress na wspieranej wersji, jeżeli jest używany;
- test e-maila, webhooka, pliku, mobile i błędu sieci;
- instrukcja obsługi, eskalacji i wycofania widżetu.

**Gate:** każda firma ma podpisany arkusz reguł, przypadki regresyjne, zgodę na
copy i disclaimer, UAT oraz jawny go/no-go. Nie ma jednej „ceny branżowej”
kopiowanej między tenantami.

### Etap 13A — staging i infrastruktura

**Decyzje przed startem:**

- hosting Next.js i region;
- projekt oraz region Supabase;
- provider e-mail i domena nadawcy;
- DNS, domena aplikacji i domena widgetu;
- prywatny ClamAV;
- CDN/WAF/rate limit/Turnstile;
- monitoring, error tracking i retencja logów.

**Wykonanie:**

- osobne projekty local/preview/staging/production;
- osobne sekrety, klucze, storage i providery;
- pipeline immutable artifact;
- migracje expand/contract;
- staging wyłącznie z syntetycznym seedem;
- schedulery powiadomień, retencji, analytics purge i webhooków;
- health, readiness i smoke test zależności;
- kontrola CSP, CORS, cookies, callbacków OAuth i noindex.

**Gate:** staging powstaje od zera z CI, nie ma połączenia z produkcją, a pełna
ścieżka działa bez ręcznych insertów SQL.

### Etap 13B — bezpieczeństwo, prawo i operacje

- rozproszony rate limit per IP/origin i adaptacyjny Turnstile;
- produkcyjny test ClamAV fail-closed;
- log redaction i test braku PII;
- Semgrep CE, Gitleaks, dependency audit i staging DAST;
- zatwierdzone DPA, SCC/TIA, subprocesorzy i regiony;
- finalny regulamin, privacy, cookies i treści informacji w widgetach;
- okresy retencji leadów, plików, sesji, consentu, audytu, logów i backupu;
- osoby odpowiedzialne za support, privacy i security incident;
- runbooki: 5xx, submit niedostępny, kolejka, tenant leakage, utrata bazy,
  credential leak i dostawca niedostępny;
- procedura DSAR i eksport/usunięcie;
- ręczny VoiceOver/NVDA, realne klienty pocztowe i reprezentatywne hosty
  WordPress.

**Gate:** brak otwartych critical/high, zaakceptowane medium mają ownera i
termin, a status prawny nie brzmi `LEGAL REVIEW REQUIRED`.

### Etap 13C — rehearsal i release candidate

- zamrozić release candidate na commit SHA i artefakcie;
- wykonać migrację stagingową z pomiarem czasu;
- wykonać restore do izolowanego środowiska i sprawdzić rekordy oraz pliki;
- przećwiczyć rollback aplikacji i migrację naprawczą;
- wykonać load/smoke/E2E krytycznej ścieżki;
- sprawdzić alerty przez kontrolowane wywołanie;
- sprawdzić e-mail, webhook, purge, upload i Google OAuth;
- zatwierdzić DNS/TLS/canonical/sitemap/robots/noindex;
- zebrać release approval Product/Engineering/Security/Legal/Operations.

**Gate:** każda pozycja `RELEASE_CHECKLIST.md` ma dowód, osobę zatwierdzającą,
datę i referencję do artefaktu.

### Etap 13D — kontrolowany pilot produkcyjny

- uruchomić najpierw jedną organizację;
- ograniczyć ruch i zachować możliwość natychmiastowego wyłączenia embedu;
- pracować równolegle z dotychczasowym kanałem kontaktu firmy;
- obserwować submit success, błędy, kolejki, odchylenie estymacji i jakość
  leadów;
- zapewnić hypercare i codzienny przegląd przez pierwszy okres pilota;
- nie kopiować reguł do następnej firmy przed review wyników;
- po okresie pilota podjąć jawny go/no-go dla kolejnych tenantów.

## 7. Architektura wdrażania w firmach

Kwotum jest multi-tenant SaaS. Domyślnie nie wdraża się osobnej kopii aplikacji
dla każdej firmy. Jedna platforma produkcyjna utrzymuje oddzielne organizacje,
role, procesy, leady i storage chronione przez tenant scope i RLS.

Wdrożenie kolejnej firmy oznacza:

1. umowę, DPA i utworzenie organizacji;
2. przypisanie Ownera i użytkowników;
3. warsztat oraz konfigurację procesu;
4. kalibrację estymacji i scoringu;
5. UAT;
6. publikację immutable wersji;
7. instalację hosted/inline/popup/fullscreen/WordPress;
8. szkolenie zespołu;
9. kontrolowany start i monitoring;
10. wersjonowane korekty.

Osobna instancja dla klienta jest decyzją enterprise po MVP i wymaga osobnego
modelu operacyjnego, aktualizacji, backupu i supportu.

## 8. Pakiet wdrożeniowy jednej firmy

Każde wdrożenie musi posiadać:

- kartę organizacji i osoby odpowiedzialne;
- podpisane role prywatności;
- arkusz pytań i danych niedozwolonych;
- arkusz reguł pricingu;
- arkusz scoringu;
- zestaw przypadków regresyjnych;
- zatwierdzony disclaimer i wynik;
- mapę instalacji i domen;
- plan użytkowników i ról;
- UAT z podpisem go/no-go;
- instrukcję obsługi leada;
- instrukcję awarii i wyłączenia widgetu;
- datę review po uruchomieniu.

## 9. Metryki pilota

Metryki nie mogą być ustalone dopiero po zobaczeniu wyniku. Dla każdej firmy
przed startem zapisuje się cel, baseline i próg go/no-go.

### Produkt

- rozpoczęcie → ukończenie procesu;
- ukończenie → wysłanie leada;
- drop-off według kroku;
- udział `consultation/no_price`;
- jakość leadów według zespołu sprzedaży;
- czas do pierwszej reakcji;
- odchylenie estymacji od później potwierdzonego zakresu;
- liczba reklamacji lub nieporozumień dotyczących wyniku.

### Operacje

- submit success rate;
- 5xx i p95 latency;
- wiek najstarszej oczekującej dostawy;
- e-mail/webhook success i retry;
- błędy uploadu i skanu;
- wykonanie schedulerów;
- wiek rekordów po retencji;
- wykorzystanie DB i Storage.

Analityka klienta nie jest źródłem rozliczeń ani kontroli bezpieczeństwa.

## 10. Odpowiedzialności

| Obszar                      | Właściciel decyzji            | Wymagana akceptacja         |
| --------------------------- | ----------------------------- | --------------------------- |
| Zakres produktu i pilot     | Product/Founder               | firma pilotażowa            |
| Pricing i scoring firmy     | ekspert wyceny firmy          | Owner firmy                 |
| Kod, migracje i release     | Engineering                   | review techniczny           |
| RLS, rate limit i incydenty | Security/Platform             | release approval            |
| Hosting, scheduler i backup | Operations/Platform           | restore i rollback evidence |
| DPA, privacy i dostawcy     | administrator danych/Legal    | podpisana akceptacja        |
| Support i hypercare         | wskazany Support Owner        | kontakt przekazany firmie   |
| Go-live firmy               | Product + firma + Engineering | wspólny protokół go/no-go   |

Jedna osoba może pełnić kilka ról w pilocie, ale role i decyzje muszą być jawne.

## 11. Bramka kontrolowanego pilota

Pilot z prawdziwymi danymi może wystartować tylko, gdy:

- 12ZD–12ZG są zakończone;
- firma ma zaakceptowane pricing/scoring/disclaimer;
- DPA i informacja prywatności są zatwierdzone;
- produkcyjny region, hosting i e-mail są zaakceptowane;
- RLS, IDOR, upload, rate limit, Turnstile i ClamAV przechodzą;
- monitoring, alerty, schedulery i kontakty działają;
- backup istnieje, a restore został przećwiczony;
- staging smoke/E2E i UAT są zielone;
- repozytorium i artefakt wskazują jeden commit SHA;
- istnieje rollback i możliwość wyłączenia embedu;
- nie ma danych demonstracyjnych w produkcji.

## 12. Bramka publicznej produkcji

Publiczny start wymaga dodatkowo:

- pełnej `RELEASE_CHECKLIST.md`;
- prawnie i operacyjnie zatwierdzonej nazwy oraz domen;
- finalnych warunków świadczenia usługi;
- danych terenowych z kontrolowanego pilota;
- zamknięcia lub formalnej akceptacji wszystkich ryzyk;
- gotowego supportu i komunikacji incydentowej;
- decyzji o modelu sprzedaży. Płatności w aplikacji pozostają poza MVP.

## 13. Dowody i artefakty

Każdy release przechowuje poza danymi klientów:

- commit SHA, lockfile hash i wersje runtime;
- wyniki CI i security scans;
- listę migracji i protokół rollbacku;
- protokół backup/restore;
- smoke/E2E/UAT;
- wyniki accessibility i real-device review;
- konfigurację alertów bez sekretów;
- approvals Product/Engineering/Security/Legal/Operations;
- datę, zakres i decyzję go/no-go.

Rekomendowana ścieżka repozytorium dla dowodów bez sekretów:
`artifacts/release/<version>/`. Raport nie może zawierać PII, tokenów,
credentiali ani pełnych payloadów leadów.

## 14. Najbliższa kolejność

1. Utrzymywać zamrożony, zielony baseline Etapu 12ZD.
2. Utrzymywać pełną ścieżkę edytora estymacji z Etapu 12ZE.
3. Zamknąć lokalny gate ADR-034 i webhooka z Etapu 12ZF.
4. Wybrać firmy i wykonać 12ZG.
5. Dopiero potem rozpocząć Etap 13A ze schedulerem i alertami webhooka.

Żadna kolejna przebudowa wizualna nie ma pierwszeństwa przed tym ciągiem, chyba
że naprawia regresję blokującą główną ścieżkę, dostępność lub bezpieczeństwo.
