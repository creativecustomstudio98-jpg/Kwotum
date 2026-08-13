# Visual QA — typografia panelu 12ZP

Data: 2026-08-13

## Źródło

- `before-empty-state-1136x456.png` — zaakceptowany crop produkcji;
- rozmiar: 1136 × 456 px;
- SHA-256:
  `1b90189a221d164a2e9ea92d141ec5d0cfdff1c50c2a8383d553c94eb8903070`.

## Rendery po korekcie

- `after-empty-state-1536.png` — rzeczywisty CSS buildu produkcyjnego,
  powierzchnia 1224 × 179 px;
- `after-empty-state-390.png` — wariant mobile, powierzchnia 362 × 176 px;
- `after-sidebar-256x1024.png` — pełny sidebar expanded po korekcie wag.

Stan pusty jest kontrolowaną sondą visual QA z markupem odpowiadającym
`StateContent`; fixture analityki ma celowo próbę powyżej progu prywatności.
Sonda nie zmienia danych aplikacji i jest usuwana przed dalszymi asercjami.

## Pomiary i wynik

| Powierzchnia             | Before               | After                |
| ------------------------ | -------------------- | -------------------- |
| Inset stanu desktop      | 0 px                 | 32 px                |
| Inset stanu mobile       | —                    | 24 px                |
| Nagłówek                 | 18,72 / 600          | 16 / 600             |
| Opis                     | 16 / 400, max 544 px | 14 / 400, max 736 px |
| Sidebar zwykły / aktywny | 520 / 640            | 400 / 500            |

Playwright: 2/2. Build produkcyjny, desktop 1536 × 1024, mobile 390 × 844,
computed styles, axe/overflow w istniejących scenariuszach i cleanup
jednorazowego tenanta przeszły bez pozostałości.
