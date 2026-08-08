# Landing desktop V7 — raport odbioru footera i overview

**Status:** PASS lokalny; D4 i budowa sekcji desktopu zakończone
**Data:** 2026-08-02
**Viewport stopki:** 1672 px szerokości
**Referencja kompozycyjna:** `reference/08-full-overview.png`, SHA-256
`8ddaca5adef25e9205910c93816fc7501668b397f14e34411bb94f3780edace6`

## Zakres i źródło prawdy

Mikroetap przebudowuje wyłącznie istniejący `MarketingFooter`, przejście z
`final-cta` do stopki oraz wykonuje kompozycyjny audyt całej strony. V7-08 jest
pomniejszoną planszą o innych proporcjach niż produkcyjny screenshot, dlatego
zgodnie z kontraktem nie wykonano pixel diffu ani nie podano sztucznego RMSE.
Dowodem jest side-by-side z obrazami sprowadzonymi wyłącznie do wspólnej
wysokości oraz osobne zrzuty natywnej stopki i przejścia 1672 × 941 px.

## Implementacja

- tekstowe logo 16 px zastąpiono pełnym znakiem Lorum: marką 36,8 px i nazwą
  24,8 px;
- stopka używa wspólnej osi strony `x=64–1608` i szerokości 1544 px;
- dodano krótki opis produktu oraz jawną etykietę „Produkt w fazie walidacji”;
- trzy semantyczne nawigacje porządkują 12 działających tras w grupach
  Produkt, Zastosowania i Informacje;
- dodano istniejące strony `/polityka-prywatnosci` i `/regulamin` oraz link
  „Wróć na górę”, który prowadzi do `#main-content`;
- zachowano ostrzeżenie o roboczej nazwie produktu i doprecyzowano brak
  wiążącej oferty lub wyniku;
- subtelne zielono-niebieskie tło, górna granica i duży oddech domykają finalne
  CTA bez tworzenia drugiego konkurencyjnego wezwania do działania;
- układ desktopowy ma cztery kolumny, tablet dwa rzędy/kolumny, a małe
  viewporty jedną logiczną kolumnę;
- focus, hover, reduced motion i forced colors mają jawne stany;
- API, baza, auth, RLS, tenant scope, pricing i scoring nie zostały zmienione.

## Geometria przed i po

| Region                       |                 Przed |                                       Po |
| ---------------------------- | --------------------: | ---------------------------------------: |
| wysokość stopki przy 1672 px |          około 329 px |                             około 439 px |
| oś głównego kontenera        |          `x≈176–1496` |                              `x=64–1608` |
| szerokość kontenera          |         około 1320 px |                                  1544 px |
| znak marki                   |     brak; tekst 16 px |              mark 36,8 px; tekst 24,8 px |
| górne grupy                  | cztery nierówne bloki |           cztery bloki na wspólnej osi Y |
| linki stopki                 |                    11 |         14, w tym prawo i powrót na górę |
| dolny rail                   |             dwa bloki | copyright, zastrzeżenie produktu, powrót |

Przy szerokości powyżej 1024 px intro oraz trzy nawigacje zaczynają się na tej
samej osi Y. W zakresie 641–1024 px intro zajmuje cały pierwszy rząd, dwie
nawigacje dzielą drugi, a trzecia domyka układ niżej. Przy 640 px i mniej każdy
blok układa się pionowo. Testy 1440/1024/768/390/320 px nie wykazały poziomego
overflow.

## Audyt kompozycyjny V7-08

Pełny render 1672 × 7603 px zachowuje zatwierdzoną kolejność:

1. `hero` — header, hero i pasek zastosowań;
2. `guided-flow` — trzy kroki procesu;
3. `client-demo` — cztery kluczowe grupy informacji;
4. `decision-document` — kompletny przykładowy lead;
5. `industry-and-publishing` — istniejące kanały integracji;
6. `pilot` — dwa warianty rozpoczęcia współpracy;
7. `faq` — pytania i realne źródła pomocy;
8. `final-cta` — końcowe wezwanie z uczciwym proof;
9. footer — kompletna nawigacja i informacje prawne.

Side-by-side potwierdza podobny rytm dużych jasnych powierzchni, naprzemienną
gęstość sekcji, centralne osie nagłówków oraz wyraźne domknięcie strony. Dłuższy
render produkcyjny jest świadomym skutkiem dodania osobnego kadru integracji,
większego przykładu leada, natywnych sekcji 941 px oraz uczciwego copy. Nie jest
traktowany jako błąd skali względem planszy overview.

## Artefakty i visual QA

- `artifacts/visual-qa/landing-desktop-v7/footer-overview/before-footer-1672.png`;
- `artifacts/visual-qa/landing-desktop-v7/footer-overview/pass-1-footer-1672.png`;
- `artifacts/visual-qa/landing-desktop-v7/footer-overview/after-footer-1672.png`;
- `artifacts/visual-qa/landing-desktop-v7/footer-overview/after-transition-1672x941.png`;
- `artifacts/visual-qa/landing-desktop-v7/footer-overview/full-page-1672.png`;
- `artifacts/visual-qa/landing-desktop-v7/footer-overview/full-page-942w.png`;
- `artifacts/visual-qa/landing-desktop-v7/footer-overview/full-page-normalized-height.png`;
- `artifacts/visual-qa/landing-desktop-v7/footer-overview/overview-side-by-side.png`;
- `artifacts/visual-qa/landing-desktop-v7/footer-overview/diff.md`.

Ocena visual QA: **19/20** — kompletność 4, geometria 4, typografia 4,
gęstość 4, transformacja mobile 3. Mobile przechodzi reflow i smoke, ale nie ma
osobnej zaakceptowanej referencji. RMSE: **nie dotyczy** — V7-08 jest planszą
kompozycyjną w innej skali.

## Gate

- `pnpm exec prettier --check <pliki mikroetapu>` — PASS;
- `pnpm exec playwright test tests/e2e/marketing.spec.ts --project=chromium` —
  24/24 PASS;
- link `/polityka-prywatnosci` oraz `#main-content` sprawdzono również w żywej
  przeglądarce — PASS;
- pięć breakpointów, klawiatura, axe, no-JS, reduced motion, forced colors i
  brak poziomego overflow — PASS;
- `pnpm lint` — 8/8 PASS;
- `pnpm typecheck` — 8/8 PASS;
- `pnpm test:unit` — 15/15 zadań PASS; web 85/85;
- `pnpm build` — 8/8 PASS, 39 tras, widget 17 269 B gzip;
- `pnpm format:check` — znany wyjątek worktree dotyczy wyłącznie nietkniętych
  `artifacts/promo/lorum-launch-v2/STORYBOARD.md` i
  `artifacts/promo/lorum-launch-v3/STORYBOARD.md` oraz
  `artifacts/promo/lorum-launch-v4/STORYBOARD.md`;
- `git diff --check` — PASS.

## Ryzyka i kryteria odbioru

- Stopka nie publikuje fikcyjnego telefonu, e-maila, SLA, statystyk ani social
  proof.
- Wszystkie linki mają niepuste `href` i prowadzą do istniejących tras lub
  kotwicy strony.
- Roboczy status nazwy i brak wiążącej oferty pozostają widoczne.
- Nieużywane selektory i kandydaci legacy pozostają do osobnego, audytowanego
  cleanupu D5; ten etap niczego nie usuwał.
- `artifacts/promo/` pozostał nietknięty.

Następny dozwolony etap to wyłącznie D5: pełna kontrola integralności desktopu,
konsolidacja i bezpieczny cleanup zatwierdzonych kandydatów. Nie jest to budowa
nowej sekcji ani redesign mobile.

```text
STOP — FOOTER I OVERVIEW ZAKOŃCZONE. D5 CLEANUP NIE ROZPOCZĘTO.
```
