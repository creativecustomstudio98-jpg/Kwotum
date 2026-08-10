# Lorum — audyt i plan architektury prezentacji

> **ARCHIVED — nie jest źródłem prawdy.** Zastąpiony przez:
> `docs/INDEX.md`, `docs/DESIGN_SYSTEM.md`, `docs/UI_SCREEN_SPEC.md` oraz
> ADR-024–ADR-028 w `docs/DECISIONS.md`.
>
> **Status historyczny:** decyzje o marce i kontraktach z Etapu 12B pozostają
> aktualne. Opis kompozycji marketingu i wspólnych wzorców wizualnych został
> zastąpiony przez ADR-025, Etap 12D i aktywne dokumenty wskazane wyżej.

## Zakres etapu

Etap 12B przebudowuje widoczną warstwę istniejącego produktu bez zmiany
frameworka, routingu, kontraktów domenowych, autoryzacji, tenant scope, RLS,
modelu danych ani API. Obejmuje marketing, panel, logowanie, hosted flow,
widget, wiadomości transakcyjne, design system i widoczną warstwę konektora
WordPress.

Nie powstają nieistniejące trasy buildera ani onboardingu. Nie są dodawane
fikcyjne statystyki, opinie, logotypy klientów, ceny planów, funkcje AI ani
przyciski bez działania.

## Baseline 2026-07-26

- `pnpm lint` — 8/8 pakietów;
- `pnpm typecheck` — 8/8 pakietów;
- `pnpm test:unit` — 82 testy;
- `pnpm test:rls` — pełna macierz PostgreSQL/RLS zielona poza sandboxem,
  który blokuje pamięć współdzieloną;
- `pnpm test:wordpress` — WordPress 6.9.2/7.0.2 na PHP 8.5.2;
- `pnpm build` — 8/8 pakietów, 37 tras, widget 15 888 B gzip;
- `pnpm format:check` — kod przechodzi, ale komenda kończy się błędem na
  zastanych, nieśledzonych archiwach `Archiwum.zip`; archiwa nie są źródłem.

Istniejące artefakty `artifacts/redesign/after` dokumentują punkt wyjścia
marketingu, panelu i widgetu w 1440–320 px. Nie wykonano nowego bypassu auth ani
nie utworzono syntetycznych tras prywatnych.

## Co zachowujemy

- asymetryczne hero z produktem jako dowodem;
- dokumentowy szczegół leada i tabela listy;
- wąski rail panelu;
- code-first Server Components i zamkniętą allowlistę SEO;
- działające demo bez zapisu;
- natywny widget z Shadow DOM;
- małe promienie, hairlines, tabular numbers i istniejące stany;
- prywatne noindex, canonical, sitemap, schema oraz budżety JS.

## Co wymaga zmiany

1. Widoczna marka nadal nazywa się „Wyceno” i zawęża produkt do kalkulatora.
2. Główne nagłówki są miejscami zbyt ciężkie i reklamowe względem spokojnego
   narzędzia B2B.
3. Jasna zieleń `#39D98A` jest zbyt intensywna dla docelowej marki.
4. Hero, logowanie i hosted flow używają dekoracyjnych siatek z gradientów.
5. Sticky header i overlay dialogu używają blur, mimo zakazu glassmorphismu.
6. Część stanów nadal definiuje lokalne zielenie zamiast semantycznych tokenów.
7. Wordmark z pojedynczą literą w ciemnym kwadracie wygląda bardziej jak znak
   startera niż dojrzała identyfikacja.
8. Copy mówi głównie o formularzu i wycenie, zamiast o pełnym łańcuchu:
   zebranie danych, uporządkowanie, kwalifikacja i następne działanie.
9. Footer i niektóre sekcje zajmują duże ciemnozielone powierzchnie, przez co
   system jest cięższy niż referencje Notion/Figma/Linear.

## Model komunikacji Lorum

Główna obietnica: **Lorum zamienia chaotyczne zapytanie w lead gotowy do
sprzedaży.**

Logika narracji:

1. **Zbierz** — klient odpowiada na pytania wynikające z usługi.
2. **Uporządkuj** — zakres, budżet, termin, lokalizacja i materiały tworzą brief.
3. **Zakwalifikuj** — serwerowe reguły oceniają dopasowanie i wyjaśniają wynik.
4. **Działaj** — status i następny krok prowadzą handlowca do decyzji.

Język pozostaje rzeczowy. Nie używamy „magii”, „rewolucji”, deklaracji AI,
obietnic wzrostu bez danych ani przedstawiania score jako automatycznej prawdy.

## Architektura powierzchni

### Marketing

`niski header → spokojne hero z obietnicą i realnym dokumentem leada →
czterostopniowy model działania → porównanie przed/po → operacyjny brief →
wdrożenie → indeks funkcji i zastosowań → granice bezpieczeństwa → FAQ →
konkretne CTA → zwarta stopka`

Podstrony zachowują własne kompozycje i cel. Rebranding nie sprowadza ich do
jednego szablonu kart.

### Panel

`wąski rail Lorum → nagłówek zadania → sterowanie tekstowe → jedna główna
powierzchnia danych → jawny empty/error/loading state`

Lista leadów pozostaje tabelą na desktopie i opisanym rekordem na mobile.
Szczegół pozostaje jednym dokumentem z prawą kolumną działań.

### Logowanie i hosted flow

`wordmark → jeden cel → jedna powierzchnia formularza → informacja o
bezpieczeństwie`. Tło jest jednolite; bez dekoracyjnej siatki, gradientu i blur.

### Widget

`kontekst procesu → tekstowy postęp → pytanie → odpowiedzi → działanie →
orientacyjny wynik → kontakt`. Marka Lorum nie zmienia tagu custom elementu,
eventów ani tokenu sesji.

## System wizualny

- ciepłe tło i białe powierzchnie;
- grafitowy tekst, jedna ciemna zieleń i jedna jasna zieleń pomocnicza;
- jedna neutralna rodzina systemowa bez pobierania fontów;
- hero 56–68 px na desktopie, 38–44 px na mobile;
- nagłówki sekcji 34–48 px, bez ciężaru 800+;
- kontener do 1320 px, rytm sekcji 96–136 px;
- promienie 4/8/12 px, bez pigułek poza statusem;
- hairlines i maksymalnie jeden mały cień dla faktycznie uniesionej powierzchni;
- brak gradientów, blur, glassmorphismu, dekoracyjnych ilustracji i animacji.

## Ryzyka i kontrole

- **Zerwanie integracji przez rename:** widoczne teksty zmieniają się, publiczne
  identyfikatory techniczne pozostają.
- **Regresja kontrastu:** każda para tokenów przechodzi automatyczny test WCAG.
- **Regresja SEO:** allowlista i routing nie zmieniają się; metadata i schema
  otrzymują Lorum, a crawl pozostaje gate’em.
- **Regresja auth/RLS:** zmiany prezentacyjne nie dotykają usług domenowych;
  pełne testy RLS pozostają obowiązkowe.
- **Fałszywa kompletność:** brak buildera i onboardingu nadal jest jawny.
- **Rozrost CSS:** decyzje przekrojowe trafiają do `packages/ui`; lokalne CSS
  tylko komponuje powierzchnie.
- **Niezweryfikowana nazwa:** Lorum nie jest zgodą na publiczny launch ani zakup
  domeny; clearance pozostaje bramką Etapu 13.

## Kryteria self-review

1. Po usunięciu koloru hierarchia nadal jest jednoznaczna.
2. Każda sekcja odpowiada na pytanie biznesowe i może uzasadnić swoje miejsce.
3. Żadna kontrolka nie jest atrapą.
4. Nie ma gradientu, blur, przypadkowej karty ani nieuzasadnionego cienia.
5. Słowo „Wyceno” nie występuje jako widoczna nazwa produktu.
6. Wewnętrzne identyfikatory kompatybilności nie zostały przemianowane.
7. Mobile 320/390 px, klawiatura, focus, reduced motion i forced colors
   zachowują pełną ścieżkę.

## Wynik implementacji

- marka Lorum jest widoczna w metadata, marketingu, panelu, logowaniu, hosted
  flow, widgetcie, wiadomościach i interfejsie konektora WordPress;
- landing używa modelu zbierz–uporządkuj–zakwalifikuj–działaj i realnego
  dokumentu leada zamiast dekoracyjnego dashboardu;
- `packages/ui` jest źródłem ciepłych neutralnych powierzchni, ciemnej zieleni
  `#143D2F` i jasnej zieleni `#DCE9E1`;
- typografia ma mniejszy ciężar i spokojniejszą skalę na marketingu, panelu i
  logowaniu;
- usunięto wszystkie gradienty i `backdrop-filter` z powierzchni produktu;
- stopka jest jasną powierzchnią informacyjną, więc ciemna zieleń pozostaje
  akcentem i funkcjonalnym tłem, nie dominantą całej strony;
- nazwy kompatybilności integracyjnej pozostały niezmienione.

## Self-review

1. Dłuższa obietnica Lorum wymagała poszerzenia kolumny copy i obniżenia skali
   H1; końcowy przegląd potwierdził naturalne łamanie na 1440 i 390 px.
2. Gradient postępu w podglądzie produktu został zastąpiony jednolitą ścieżką z
   pseudoelementem o określonej szerokości.
3. Dekoracyjne siatki logowania, hosted flow i hero zostały usunięte zamiast
   jedynie zmniejszenia ich krycia.
4. Audyt tekstu wykazał wyłącznie oczekiwane techniczne użycia „Wyceno”:
   namespace, User-Agent, nagłówek sesji i testy kompatybilności.
5. Zastane archiwa ZIP powodowały fałszywy błąd Prettiera. Pozostały
   nietknięte, a `*.zip` zostało jawnie wyłączone z kontroli formatu jako plik
   binarny.
6. Nie wykryto zmiany logiki domenowej, auth, tenant scope, RLS, routingu ani
   kontraktów API.

## Wyniki kontroli 2026-07-26

| Kontrola              | Wynik                                                  |
| --------------------- | ------------------------------------------------------ |
| `pnpm format:check`   | zielony                                                |
| `pnpm lint`           | 8/8 pakietów                                           |
| `pnpm typecheck`      | 8/8 pakietów                                           |
| `pnpm test:unit`      | 82 testy                                               |
| `pnpm test:rls`       | pełna macierz domen i tenant isolation zielona         |
| `pnpm test:wordpress` | WordPress 6.9.2/7.0.2 na PHP 8.5.2                     |
| `pnpm security:scan`  | SAST i working-tree secret scan zielone                |
| `pnpm build`          | 37 tras; widget 15 903 B gzip                          |
| `pnpm e2e`            | 18/18; axe, klawiatura, SEO, security, mobile i widget |
| `git diff --check`    | bez błędów whitespace                                  |

Dependency audit nie został ponowiony, ponieważ etap nie dodał zależności ani
nie zmienił grafu lockfile. Obowiązuje zielony wynik Etapu 12.
