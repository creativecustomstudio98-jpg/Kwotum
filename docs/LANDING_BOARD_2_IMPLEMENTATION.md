# Landing board 2 — implementacja

**Data:** 2026-07-27  
**Zakres:** Etap 12F, wyłącznie `/`  
**Status:** lokalnie zaimplementowany i zweryfikowany

## Wynik

Sekcje 6 i 7 kontraktu V6 zostały odtworzone jako działające komponenty, nie
statyczne makiety:

- demo ma toolbar, postęp, sześć kroków, aktywne pytanie, walidowane wymiary,
  budżet, termin, preferencję kontaktu, cofanie, reset, wynik i brief tworzony
  na żywo;
- demo jest bezstanowe i nie wywołuje API, nie zapisuje ani nie wysyła danych;
- pięć branż przełącza jeden aktywny szablon, przebieg pytań, listę danych,
  code-native wizualizację, syntetyczny lead i link do istniejącej trasy;
- tablist obsługuje kliknięcie, strzałki, Home i End, a przewijana oś procesu
  jest dostępna z klawiatury;
- desktop używa relacji kroki → pytanie → live lead oraz
  selector → template → lead;
- tablet i mobile przechodzą w logiczną kolejność bez skalowania dashboardu.

Pozostałe trasy, panel, widget, API, RLS, model danych i tokeny `packages/ui`
nie zostały zmienione. Nie dodano zależności.

## Pliki

- `apps/web/app/(marketing)/home-interactive-demo.tsx`
- `apps/web/app/(marketing)/home-interactive-demo.module.css`
- `apps/web/app/(marketing)/home-industry-templates.tsx`
- `apps/web/app/(marketing)/home-industry-templates.module.css`
- `apps/web/app/(marketing)/home-conversion.tsx`
- `apps/web/app/(marketing)/home-conversion.module.css`
- `tests/e2e/marketing.spec.ts`

## Visual QA

Źródła:

- `docs/ui/lorum-landing-reference-v2/screenshots/lorum-board-2-desktop.png`;
- `docs/ui/lorum-landing-reference-v2/screenshots/lorum-board-2-mobile.png`.

Artefakty znajdują się w `artifacts/visual-qa/12f-board-2/`. Dokładniejszy
pass v10/v11 jest zapisany jako kanoniczne `after-final.png` oraz
`overlay-final.png`; 28 odrzuconych renderów iteracyjnych przeniesiono do
odzyskiwalnego Kosza w Etapie 12ZD.

Po odrzuceniu pierwszego passu usunięto elementy nieobecne w referencji:
chapter markers, dodatkowe linki, widoczny status live i przycisk resetu w
aktywnym pytaniu. Kontener, tła, typografia, układ 250 / środek / 330,
wysokość 510 px, panel 280 / środek / 390 oraz transformacja mobile zostały
odtworzone z natywnego HTML/CSS pakietu referencyjnego.

Końcowy render ma 1536 × 1709 px przy referencji 1536 × 1710 px oraz
390 × 3053 px przy referencji 390 × 3053 px. RMSE overlay wynosi 0,153535
desktop i 0,188534 mobile. Metryka służy do lokalizowania różnic, nie jako
samodzielny próg akceptacji. Nie występuje poziomy overflow.

## Kryteria odbioru

- kolejność strony: `client-demo` przed `process-fit`;
- wszystkie sześć kroków demo można przejść klawiaturą;
- live brief i wynik reagują na odpowiedzi;
- reset wraca do referencyjnego kroku wymiarów;
- pięć tabów zmienia pełny panel i docelowy link;
- 1440/1024 zachowują kolumny, a 768/390/320 używają logicznego stacku;
- brak poziomego overflow, tekstu proofu poniżej 12 px i naruszeń axe;
- treść początkowa pozostaje widoczna bez JavaScriptu;
- wszystkie liczby i leady są oznaczone jako dane demonstracyjne.

## Weryfikacja

- `pnpm format:check` — PASS;
- `pnpm lint` — 8/8;
- `pnpm typecheck` — 8/8;
- `pnpm test` — 87 testów jednostkowych, pełne RLS/PostgreSQL i WordPress PASS;
- `pnpm security:scan` — PASS;
- `pnpm build` — 8/8, 37 tras, widget 15 903 B gzip;
- `pnpm e2e` — 32/32 PASS.

Playwright obejmuje pełne przejście demo, reset po wyniku, zmianę szablonu
kliknięciem i klawiaturą, axe, no-JS, forced colors, reduced motion, minimalny
tekst 12 px, budżet JavaScriptu i geometrię 1440/1024/768/390/320.

## Ryzyka i następny etap

To lokalna demonstracja marketingowa, a nie kalkulator serwerowy. Nie wolno
przenosić jej score ani wyniku do produkcyjnej logiki wyceny. Następny zamknięty
fragment to landing board 3: sekwencja funkcji, WordPress, granica agencji i
dowody. Panel oraz pozostałe trasy pozostają zamrożone do osobnych etapów.
