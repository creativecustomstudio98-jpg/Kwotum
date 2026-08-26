# PX3 — raport lokalnej implementacji quick form

**Data:** 2026-08-25  
**Zakres:** wybór trybu, liniowy kontrakt, builder preview i publiczny runtime  
**Środowisko:** wyłącznie lokalne; bez deployu  
**Wynik:** implementacja techniczna ukończona; odbiór wizualny właściciela otwarty

## Wynik produktowy

Mała firma może użyć zwykłego, krótkiego formularza zamiast wymuszać na
kliencie przechodzenie przez serię ekranów. Jest to nadal ten sam proces
Kwotum: odpowiedzi, serwerowa wycena, wynik, kontakt, zgody i lead nie mają
drugiej implementacji.

Owner/Admin wybiera w kreatorze „Prowadzony brief” albo „Krótki formularz”.
Tryb krótki pokazuje wszystkie pola na jednej spokojnej powierzchni z jedną
główną akcją. Nie pokazuje ikon, zdjęć ani kart PX4.

## Kontrakt i zachowanie

| Obszar            | Decyzja PX3                                                |
| ----------------- | ---------------------------------------------------------- |
| Długość           | 1–8 pytań                                                  |
| Routing           | wejście od pierwszego pytania i dokładna kolejność tablicy |
| Rozgałęzienia     | reguły i override'y opcji niedozwolone                     |
| Walidacja         | wszystkie pola w kolejności; fokus pierwszego błędu        |
| Zachowanie danych | odpowiedzi pozostają po błędzie                            |
| Zapis             | istniejąca sekwencyjna kolejka mutacji z rewizją i UUID    |
| Wynik             | wyłącznie istniejąca kalkulacja serwerowa                  |
| Kontakt           | wspólny privacy proof, Turnstile, limiter i submit         |
| Podgląd           | ten sam Web Component, memory-only adapter                 |

Builder nie spłaszcza procesu po cichu. Niezgodny wybór blokuje zapis i
publikację, pokazuje konkretne konflikty oraz oferuje jawną akcję usunięcia
rozgałęzień. Akcja nie kasuje nadmiarowych pytań i podlega Undo.

## Bezpieczeństwo

- Nie powstała nowa tabela, publiczny endpoint ani payload leada.
- Klient nie przesyła ceny, score ani wyniku.
- TypeScript, PostgreSQL i parser manifestu niezależnie walidują liniowość.
- Publiczny runtime nadal przechodzi przez origin allowlist i rozproszony
  limiter przed sesją oraz każdą mutacją.
- Kontakt zachowuje Turnstile, wersjonowany privacy proof, bezpieczny upload i
  unikalność leada na sesję.
- Kontroler ignoruje równoległy drugi submit; test obejmuje request in-flight.
- Preview nie używa sieci, localStorage, analityki ani zapisu leada.

## Dostępność i wygląd

Każde pytanie ma semantyczny `fieldset` i `legend`, opis, stan wymagania,
ograniczenia natywnej kontrolki oraz tekstową opcję „Nie wiem”. Błąd ma
`role=alert`, a kontener pierwszego błędnego pola przyjmuje fokus. Mobile zmienia
wybory na jedną kolumnę i zachowuje jedną pełnoszeroką akcję.

Visual QA obejmuje 1440 × 900, 768 × 1024, 390 × 844 i 320 × 800. Wszystkie
viewporty mają maksymalnie 1 px tolerancji overflow. Pierwszy, zbyt generyczny
render został odrzucony i nadpisany. Nie jest referencją ani baseline'em.
Aktualna kompozycja powstała od zera w kodzie jako „żywy arkusz briefu”:
jedna kolumna, indeks dokumentu, numerowany rejestr pytań, cienkie separatory,
kompaktowe kontrolki i jeden kolor akcji. Opcjonalna analityka znajduje się po
pytaniach zamiast przed zadaniem. Nie ma hero-layoutu, dekoracyjnych kart,
badge'y, cieni ani starych zdjęć i zrzutów ekranu. Kadry technicznego QA są w
`artifacts/visual-qa/px3-quick-form/`, a ich odbiór wizualny przez właściciela
pozostaje otwarty.

## Gate lokalny

| Kontrola       | Wynik                                                  |
| -------------- | ------------------------------------------------------ |
| Lint           | PASS — 8/8 pakietów, 0 ostrzeżeń                       |
| Typecheck      | PASS — 8/8 pakietów                                    |
| Unit           | PASS — 265/265                                         |
| PostgreSQL/RLS | PASS — wszystkie migracje i zestawy, w tym quick form  |
| Build          | PASS — 16/16, 41 tras                                  |
| Widget JS      | PASS — 23 308 B gzip / 92 160 B                        |
| E2E quick form | PASS — 4 viewporty, keyboard focus, offline/retry, axe |
| Visual QA      | TECH PASS — odbiór wizualny właściciela otwarty        |

Pierwsza próba PostgreSQL w sandboxie nie miała dostępu do pamięci
współdzielonej; zatwierdzony lokalny przebieg poza tym ograniczeniem przeszedł.
Pierwsza asercja E2E oczekiwała komunikatu etapu pobierania wyniku, podczas gdy
rzeczywisty stan poprawnie pokazywał oczekujące odpowiedzi i „Brak połączenia”.
Test dopasowano do właściwego kontraktu stanu, bez zmiany zachowania produktu.

## Istotne pliki

- `packages/validation/src/flow.ts` i `widget.ts` — kontrakt i walidacja.
- `packages/widget/src/controller.ts` — walidacja wszystkich pól i kolejka.
- `packages/widget/src/element.ts`, `packages/ui/src/widget.css` — renderer.
- `apps/web/app/panel/[organizationId]/procesy/[flowId]/flow-builder.tsx` —
  selektor, konflikty, jawna linearyzacja i prawdziwy preview.
- `supabase/migrations/20260825000200_stage12zo_px3_quick_form.sql` —
  niezależny gate publikacji.
- `tests/e2e/widget.spec.ts` — responsive, offline, fokus, submit i axe.
- `docs/DECISIONS.md` — ADR-045.

## Ryzyka i następny etap

PX3 nie dowodzi jeszcze, że limit ośmiu pytań i copy CTA są optymalne dla
każdej branży; wymaga to otwartych badań PX1 i pilota PX7. Produkcyjny Turnstile
oraz hosty nadal mają bramy Etapu 13.

Następny dopuszczalny etap to PX4. Przed pokazaniem `image_cards` musi powstać
prywatny tenantowy rejestr assetów, kontrola własności, resolver publicznej
projekcji, fallback błędu i pełny visual QA. Samo renderowanie UUID lub
dowolnego URL jest zabronione.
