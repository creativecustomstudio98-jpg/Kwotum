# Visual QA — Etap 12X

## Zakres

- ekran: `/panel/[organizationId]/procesy/[flowId]`;
- referencja: builder 1448 × 1086 z Etapu 12W;
- viewporty: 1448 × 1086, 768 × 1024 i 390 × 844;
- zmienione regiony: uchwyty pytań, wskaźnik miejsca upuszczenia, summary
  błędów oraz sekcja walidacji odpowiedzi;
- niezmienione regiony: wspólny sidebar Lorum, toolbar, granice trzech kolumn
  i centralna karta preview.

## Wynik

**PASS, 19/20.** Kompletność 4, geometria 4, typografia 4, gęstość 4,
transformacja mobile 3. Desktop zachowuje granice 78 / 438 / 1020 / 1448 px.
Tablet i mobile nie mają poziomego overflow. Mobile celowo używa jawnych akcji
„wyżej/niżej” jako niezawodnej alternatywy dla gestu.

## Dowody

- kanoniczna referencja
  `apps/web/public/panel/ChatGPT Image 26 lip 2026, 18_28_24.png`,
  `before-1448x1086.png` i `after-production-1448x1086.png`;
- `desktop/validation-error-1448x1086.png`;
- `desktop/overlay-50-1448x1086.png`, `difference-1448x1086.png` i
  `side-by-side-1448x1086.png`;
- `tablet/before-inspector-768x1024.png` i `validation-768x1024.png`;
- `mobile/before-preview-390x844.png` i `question-reorder-390x844.png`.

Różnice tekstowe desktopowego before/after wynikają z dwóch różnych
syntetycznych procesów. Niezmienioną geometrię potwierdza osobny produkcyjny
test 12W. Izolowany test 12X i łączny regresyjny test buildera obejmują
drag-and-drop, `Alt+ArrowUp`, fokus, `aria-live`, walidację, autosave, axe
oraz brak overflow.
