# Referencyjny reset kompozycji — Etap 12D

> **ARCHIVED — nie jest źródłem prawdy.** Zastąpiony przez:
> `docs/DESIGN_SYSTEM.md`, `docs/UI_SCREEN_SPEC.md`, `docs/VISUAL_QA.md` oraz
> ADR-025–ADR-028 w `docs/DECISIONS.md`.

Data przeglądu: 2026-07-26.

## Powód

Etapy 12A–12C uspokoiły paletę, ale zachowały strukturę typowego szablonu SaaS:
11 osobnych beatów na stronie głównej, powtarzane siatki modułów i pomniejszony
dashboard jako główny dowód produktu. Zielone testy potwierdzały poprawność
techniczną, nie jakość hierarchii.

Przesłane referencje wymagają innego kontraktu: szerokich, redakcyjnych plansz,
jednej tezy na planszę, dużego czytelnego dowodu produktu, cienkich reguł,
typografii jako głównego narzędzia kompozycji i zieleni ograniczonej do akcji
oraz stanu.

## Nowa architektura strony głównej

1. Problem — zwykły formularz zbiera kontakt, ale nie zbiera pełnego kontekstu.
2. Transformacja — to samo zapytanie staje się uporządkowanym briefem.
3. Proces — usługa → dane → uporządkowanie → przejęcie przez sprzedaż.
4. Decyzja — czytelny dokument leada, dopasowanie i następny krok.
5. Wdrożenie — proces dopasowuje się do firmy i pozostaje w jej regułach.

Dedykowane treści SEO, branże, funkcje, demo, WordPress, agencje i cennik
pozostają na własnych działających trasach. Landing nie powtarza ich jako
katalogu sekcji.

## Kontrakt wizualny

- jedna dominanta i jeden duży proof w każdym rozdziale;
- ciepłe tło, białe dokumenty i hairlines zamiast naprzemiennych pasów;
- bez automatycznych cieni, ozdobnych gradientów i seryjnych kafli;
- pigułka wyłącznie dla rzeczywistego statusu;
- tekst code-native proof minimum 12 px;
- wordmark typograficzny, bez pojedynczej litery w kaflu;
- maksymalnie trzy główne linki nawigacji i jedno główne CTA;
- panel pozostaje gęstym narzędziem pracy, lecz używa dokumentowych wierszy i
  liniowych stanów zamiast dashboardowych kart.

## Pomiar przed i po

| Kryterium                  | Przed 12D           | Po 12D                          |
| -------------------------- | ------------------- | ------------------------------- |
| Beaty strony głównej       | 11                  | 5 rozdziałów                    |
| Wysokość desktop 1440 px   | około 9460 px       | 5419 px                         |
| Wysokość mobile 390 px     | około 12 997 px     | 8980 px                         |
| Tekst głównego proofu      | około 8–11 px       | minimum 12 px, blokada w E2E    |
| Główna nawigacja           | katalogowa          | 3 linki + logowanie + 1 CTA     |
| Dowód produktu             | mini-dashboard      | jeden czytelny dokument leada   |
| Domyślne stany empty/error | karta + kafel ikony | liniowa powierzchnia + etykieta |

## Istotne pliki

- `apps/web/app/(marketing)/page.tsx` — pięć rozdziałów i ich semantyczna
  kolejność;
- `apps/web/app/(marketing)/components.tsx` — czytelny dokument leada;
- `apps/web/app/(marketing)/marketing.css` — kompozycja 1440–320 px;
- `apps/web/app/(marketing)/marketing-header.tsx` — zredukowana nawigacja;
- `packages/ui/src/styles.css` i `packages/ui/src/components.tsx` — wspólne
  prymitywy, sidebar, statusy i stany systemowe;
- `apps/web/app/panel/styles.css` — kompaktowy dokumentowy panel;
- `tests/e2e/marketing.spec.ts` — wysokość, czytelność, dostępność, SEO i
  baseline strony głównej.

Po przebudowie usunięto 1009 linii martwych reguł starego landing page
(`marketing.css`: 4034 → 3025 linii). Snapshoty pozostały identyczne, więc
cleanup nie zmienił żywej kompozycji.

## Visual review

Przejrzano pełne zrzuty, a następnie zapisano je jako baseline’y:

- `tests/e2e/__screenshots__/marketing-home-desktop.png`;
- `tests/e2e/__screenshots__/marketing-home-mobile.png`;
- `tests/e2e/__screenshots__/design-system-desktop.png`;
- `tests/e2e/__screenshots__/design-system-mobile.png`;
- `artifacts/redesign/after/panel-lead-detail-1440.png`;
- `artifacts/redesign/after/panel-lead-detail-390.png`;
- `artifacts/redesign/after/panel-states-1440.png`.

Capture panelu potwierdził brak poziomego overflow dla czterech widoków przy
1440 i 390 px. Playwright potwierdza także axe WCAG A/AA, klawiaturę, focus
trap, Escape, focus return, reduced motion, forced colors, crawl, metadata,
canonical, sitemap, robots i budżet JavaScriptu.

## Wynik quality gate

- `pnpm format:check` — OK;
- `pnpm lint` — 8/8 pakietów;
- `pnpm typecheck` — 8/8 pakietów;
- `pnpm test` — 87/87 testów jednostkowych, pełne testy PostgreSQL/RLS i
  WordPress;
- `pnpm security:scan` — statyczne reguły i skan sekretów OK;
- `pnpm build` — 8/8 pakietów, 37 tras Next.js, widget 15 903 B gzip;
- `pnpm e2e` — 21/21 w Chromium.

## Granice i ryzyka

- bieżące środowisko nie udostępniło sterowalnej sesji przeglądarki; review
  wykonano na deterministycznych pełnych zrzutach z produkcyjnego builda oraz
  artefaktach capture, nie w interaktywnej sesji;
- automatyczne axe i screenshoty nie zastępują ręcznego testu VoiceOver/NVDA,
  zoomu 200/400% ani pomiaru Core Web Vitals na docelowym hostingu;
- marka Lorum nadal wymaga profesjonalnego clearance nazwy;
- Etap 12D nie zmienia danych, API, auth, tenant scope, RLS, pricingu ani
  scoringu i nie daje zgody na publiczny launch;
- rollback jest aplikacyjny i nie wymaga migracji bazy.
