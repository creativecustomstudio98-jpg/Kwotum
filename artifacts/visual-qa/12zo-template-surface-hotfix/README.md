# Visual QA — pojedyncza powierzchnia biblioteki szablonów

## Zakres

- trasa: `/panel/[organizationId]/szablony`;
- źródło korekty: `reference-review-3338x1962.png`;
- kontrolny desktop: 2048 × 1220;
- mobile: 390 × 844;
- stan końcowy: `after-desktop-2048x1220.png` i
  `after-mobile-390x844.png`.

## Wynik

- zewnętrzna `.template-library-surface` jest przezroczysta;
- kontener nie ma własnego obramowania ani cienia;
- toolbar, KPI, karty szablonów i podgląd zachowują pojedyncze, własne
  powierzchnie;
- ten sam kontrakt obowiązuje dla loading i error;
- brak poziomego overflow na desktopie i mobile;
- axe WCAG 2.2 AA: zero naruszeń w scenariuszu odbiorowym;
- E2E blokuje regresję computed style: tło `rgba(0, 0, 0, 0)`, obramowanie
  `0px`, cień `none`.

Referencja pochodzi z produkcji i zawiera inne dane oraz viewport niż fixture
E2E, dlatego odbiór dotyczy wskazanego regionu powierzchni, a nie globalnego
pixel score.

## Artefakty

- `reference-vs-after.png` — zestawienie zaakceptowanego stanu i wyniku;
- `reference-review-3338x1962.png` — zablokowane źródło korekty;
- `after-desktop-2048x1220.png` — finalny desktop;
- `after-mobile-390x844.png` — finalny mobile.
