# Etap 12ZE — self-service pricing, scoring i wynik

## Źródło i zakres

- kanoniczna referencja geometrii buildera:
  `apps/web/public/panel/ChatGPT Image 26 lip 2026, 18_28_24.png`;
- SHA-256 referencji:
  `918e0d8edfdb02d899310e61b36bcf25618bd1a761bf62809fb9927d4a68a526`;
- desktop: 1448 × 1086 px, zwinięty wspólny sidebar oraz trzy kolumny 12W;
- mobile: 390 × 844 px; reflow i forced colors: 320 × 800 px;
- zakres zmiany: nowe obszary `Wycena`, `Scoring` i `Wynik` wewnątrz
  istniejącego buildera, bez zmiany współdzielonego shella.

Referencja nie pokazuje edytora estymacji. Overlay i difference sprawdzają
zachowanie shella, osi, toolbara oraz proporcji trzech kolumn; nie traktują
nowej treści jako błędu pixel diff. Stan `before` pochodzi z zaakceptowanego
renderu 12W przy tym samym viewportcie.

## Wynik

Ocena: **19/20**.

- kompletność regionów: 4/4;
- geometria i proporcje: 4/4;
- typografia i spacing: 4/4;
- gęstość danych i stany: 4/4;
- transformacja mobile: 3/4.

Mobile celowo przełącza treść przez dwa poziomy zakładek: obszar buildera oraz
`Reguły / Podgląd / Ustawienia`. To zachowuje pełnowymiarowe cele dotykowe i
czytelność, ale nie ma osobnej referencji wizualnej, dlatego nie przyznano
pełnych 4 punktów za transformację.

## Artefakty końcowe

- `desktop/before-1448x1086.png` — stan przed 12ZE;
- `desktop/result-1448x1086.png` — opublikowany wynik i edytor zakończenia;
- `desktop/overlay-50-1448x1086.png` — 50% referencja / final;
- `desktop/difference-1448x1086.png` — difference referencja / final;
- `mobile/scoring-390x844.png` — prywatna reguła scoringu;
- `mobile/forced-colors-320x800.png` — reflow w systemowych kolorach.

## Kontrole odbiorowe

- brak poziomego overflow przy 1448, 390 i 320 px;
- mobile tabs mają co najmniej 44 px wysokości;
- zakładki działają klawiaturą przez fokus i `Enter`;
- axe jest czyste na desktopie, mobile i przy forced colors;
- pełny produkcyjny Playwright przeszedł 18/18, a syntetyczny tenant został
  usunięty bez pozostałości;
- znane odchylenie: overlay pokazuje dużą różnicę treści, ponieważ referencja
  zawiera formularz, a etap świadomie dodaje trzy nowe obszary robocze.
