# M2.W — biały canvas i nawigacja wewnętrzna

**Viewporty:** 1440 × 900 i 390 × 844  
**Źródło:** cztery zrzuty właściciela z 2026-08-27, zablokowane hashami w
plikach `canonical-reference.txt`; oryginały z produkcyjnymi danymi nie trafiły
do repozytorium.

## Wynik

- Leady: track filtra ma 577,84 px na powierzchni 1184 px (48,8% zamiast
  100%), pięć opcji, cele 44 px, jeden rząd i jednoznaczny aktywny segment.
- Ustawienia: trzy zakładki zajmują 324,81 px na dostępnych 1136 px; pełna
  dolna granica wrappera ma 0 px.
- Integracje: dwie zakładki zajmują 154,30 px na dostępnych 1136 px; pełna
  dolna granica wrappera ma 0 px.
- Pomoc: canvas i główna powierzchnia mają `rgb(255, 255, 255)`, zewnętrzna
  granica 0 px i `box-shadow: none`.
- Mobile 390 × 844: Leady, Ustawienia, Integracje i Pomoc mają 0 px overflow
  dokumentu.
- Celowany Playwright 1/1 i axe WCAG 2 A/AA, 2.1 AA i 2.2 AA dla czterech
  ekranów przechodzą; cleanup fixture'u pozostawił 0 rekordów.

## Ocena zakresu

20/20: kompletność 4/4, hierarchia 4/4, geometria 4/4, dostępność/responsive
4/4, zgodność z systemem 4/4. Ocena dotyczy wyłącznie korekty canvasa i
nawigacji. Głęboka architektura informacji Integracji, Ustawień i Pomocy jest
osobnym M9 i nie jest pozornie zamykana tym wynikiem.

## Artefakty

Każdy katalog `leads`, `settings`, `integrations` i `help` zawiera syntetyczny
`before.png`, finalny `after.png`, `overlay-50.png`, `difference.png`,
`mobile-390x844.png` i opis aktywnej referencji. Pomiary maszynowe znajdują się
w `measurements.json`.
