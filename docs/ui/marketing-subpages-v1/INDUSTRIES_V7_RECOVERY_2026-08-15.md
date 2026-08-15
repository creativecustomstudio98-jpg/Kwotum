# `/branze` — korekta V7 po odrzuceniu pseudo-dashboardu

Data: 2026-08-15  
Status: lokalnie ukończone, odbiór wizualny właściciela otwarty  
Zakres: wyłącznie publiczna trasa `/branze`

## Cel

Przebudować stronę branż tak, aby była bezpośrednim rozwinięciem zaakceptowanej
strony głównej V7, zachowała pięć prawdziwych zastosowań produktu i nie
wyglądała jak wygenerowany szablon dashboardu.

Źródła wizualne:

- zaakceptowany home V7:
  `artifacts/visual-qa/landing-desktop-v7/footer-overview/full-page-1672.png`;
- zaakceptowane korekty `/produkt` i `/jak-dziala`:
  `artifacts/visual-qa/marketing-subpages-v1/r2-home-aligned/` oraz
  `artifacts/visual-qa/marketing-subpages-v1/r3-home-aligned/`;
- baseline `/branze`:
  `artifacts/visual-qa/marketing-subpages-v1/r7-home-aligned/before/industries-1440.png`
  i `industries-390.png`.

## Odrzucony wariant

Pierwszy lokalny pass ponownie używał ciężkiego, trzykolumnowego proofu z
nawigacją, schematem, score i tabelą przykładowego leada. Właściciel odrzucił
go jako nieprofesjonalny. Artefakty `industries-1440-pass1.png` i
`industries-390-pass1.png` pozostają dowodem przyczyny korekty, ale komponent
nie jest częścią finalnego runtime.

## Finalna kompozycja

1. Hero V7: jedna teza, dwa działające CTA, trzy fakty i panorama pięciu
   branż z istniejącego assetu.
2. Porównanie: cienka nawigacja zakładkowa oraz jeden redakcyjny układ z dużą
   fotografią, opisem i trzema realnymi pytaniami. Bez score, tabeli, badge'y i
   makiety panelu.
3. Indeks: pięć pełnych wierszy prowadzących do istniejących tras
   szczegółowych, z trzema pytaniami pobranymi z kanonicznego contentu.
4. Finał: jasny kontrakt rozdzielający pytania branżowe, wspólny mechanizm i
   decyzję firmy.

Interakcja przełącznika jest rozszerzeniem progressive enhancement. Pełny
indeks wszystkich pięciu branż i linków jest renderowany po stronie serwera i
pozostaje dostępny bez JavaScriptu.

## Responsive i dostępność

- sprawdzone viewporty: 1536, 1440, 1280, 1024, 768, 430, 390 i 320 px;
- desktop: panorama hero oraz selektor zachowują dwie osie;
- mobile: CTA układają się pionowo, zakładki przewijają się poziomo, a
  fotografia poprzedza opis w jednej kolejności DOM;
- najmniejszy widoczny tekst: 12 px;
- brak poziomego overflow;
- zakładki obsługują kliknięcie, strzałki, Home i End;
- forced-colors korzysta z `Canvas` i `CanvasText`;
- axe WCAG 2 A/AA/2.1 AA/2.2 AA: 0 naruszeń.

## Visual QA

Finalne renderowanie:

- `artifacts/visual-qa/marketing-subpages-v1/r7-home-aligned/after/industries-1440-final.png`;
- `artifacts/visual-qa/marketing-subpages-v1/r7-home-aligned/after/industries-390-final.png`.

Weryfikacja manualna objęła hierarchię hero, proporcję obrazu do treści,
czytelność pięciu zakładek, rytm indeksu oraz finał strony. Zwykły render nie
pokazuje pustych lub niedoładowanych obrazów.

## Testy

- `pnpm exec playwright test tests/e2e/marketing-industries-r7-1.spec.ts` —
  13/13 PASS;
- `pnpm lint` — 8/8 PASS;
- `pnpm typecheck` — 8/8 PASS;
- `pnpm test:unit` — 22/22 zadań PASS, w tym web 184/184;
- `pnpm test:rls` — PASS, w tym izolacja tenantów i domeny publiczne;
- `pnpm test:wordpress` — PASS dla WordPress 6.9.2 i 7.0.2 na PHP 8.5;
- `pnpm security:scan` — SAST i secret scan PASS;
- `pnpm build` — 16/16 PASS, 42 trasy.

Wszystkie lokalne bramki etapu są zielone. Odbiór wizualny właściciela oraz
ewentualny commit, push i wdrożenie pozostają osobnymi decyzjami.

## Bezpieczeństwo i rollback

Zmiana nie dotyka API, bazy, RLS, auth, tenant scope, pricingu, scoringu,
widgetu ani danych organizacji. Nie dodaje zależności i używa istniejącego
statycznego assetu bez danych klienta. Rollback polega na przywróceniu
poprzednich plików strony, CSS i testu R7.1; migracja danych nie występuje.
