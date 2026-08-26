# Korekta R2.V7 — podstrona produktu zgodna ze stroną główną

**Data:** 2026-08-15  
**Trasa:** `/produkt`  
**Status:** code complete, visual QA i pełne lokalne gate'y zielone

## Powód korekty

Wersja redakcyjna R2.R usunęła wygląd typowego template'u SaaS, ale nie była
wystarczająco spójna z zaakceptowaną stroną główną. Szerokie białe pasy,
naprzemienne kolumny, doklejone screenshoty, lokalna nawigacja i pełny ciemny
blok tworzyły drugi system wizualny zamiast rozwinięcia home V7.

## Przyjęty kierunek

- dokładnie ten sam canvas i tokeny `wy-marketing-v7-theme` co na home;
- hero z tekstem po lewej i zintegrowaną sceną produktu po prawej;
- identyczna logika typografii: mocna pierwsza linia i lżejsza kontynuacja;
- sygnałowy rail 01–04 zamiast technicznej nawigacji tekstowej;
- wycentrowane nagłówki rozdziałów i jedna dominująca scena na rozdział;
- jasny, ograniczony panel odpowiedzialności zamiast ciężkiego ciemnego pasa;
- finalne CTA jako samodzielna powierzchnia zgodna z finałem home V7;
- prawdziwe ekrany aplikacji, bez generowania obrazów i code-native atrap UI.

## Źródła ekranów

Kadry pozostały mechanicznie przygotowanymi kopiami istniejących artefaktów QA:

- `artifacts/visual-qa/sidebar-kwotum-p1/expanded-1440x1024.png`;
- `artifacts/visual-qa/sidebar-kwotum-p1/mobile-390x844.png`;
- `artifacts/visual-qa/12w-builder-geometry/`;
- `artifacts/visual-qa/12s-remaining-screens/after/widget-result-*`;
- `artifacts/visual-qa/12o-lead-detail-responsive/after-production-*`.

Nie użyto ImageGen. Publikowane kadry zawierają wyłącznie dane demonstracyjne,
bez adresów e-mail, notatek klientów i danych organizacji pilotażowej.

## Visual QA

Źródło porównawcze home:

- `artifacts/visual-qa/landing-desktop-v7/footer-overview/full-page-1672.png`.

Nowe artefakty produktu:

- `artifacts/visual-qa/marketing-subpages-v1/r2-home-aligned/product-1440-hero-pass1.png`;
- `artifacts/visual-qa/marketing-subpages-v1/r2-home-aligned/product-1440-lead-pass1.png`;
- `artifacts/visual-qa/marketing-subpages-v1/r2-home-aligned/product-390-hero-pass1.png`;
- `artifacts/visual-qa/marketing-subpages-v1/r2-home-aligned/product-1440-final.png`;
- `artifacts/visual-qa/marketing-subpages-v1/r2-home-aligned/product-390-final.png`.

Automatyczny zakres obejmuje 1440, 1024, 768, 430, 390 i 320 px. Sprawdzane są
brak poziomego overflow, właściwa kompozycja hero, pionowy rytm rozdziałów,
odpowiedni kadr desktop/mobile, równe CTA, klawiatura, axe oraz forced-colors.

## Gate techniczny

- lint: 8/8 pakietów;
- typecheck: 8/8 pakietów;
- unit: 22/22 zadania, web 184/184;
- RLS: wszystkie kontrole tenant isolation i domen zielone;
- WordPress: WP 6.9.2 i 7.0.2 na PHP 8.5;
- dedykowane E2E produktu: 30/30 Chromium;
- build monorepo: 16/16, web generuje 42 strony.

## Ryzyka i dalszy etap

Zmiana jest wyłącznie prezentacyjna i nie dotyka API, auth, RLS, tenant scope,
widgetu, scoringu ani danych. Starsze selektory historycznego R2 we wspólnym
`marketing.css` nie wpływają na render, lecz ich cleanup pozostaje osobnym
etapem. Korekta nie upoważnia do wdrożenia; publikacja wymaga osobnej decyzji.
