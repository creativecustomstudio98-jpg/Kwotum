# Visual QA 12Y — przełącznik buildera

## Wynik

Komponentowy PASS 20/20. Ten wynik dotyczy przełącznika i braku regresji
geometrii buildera, nie kompletności wszystkich funkcji buildera. Braki
funkcjonalne są jawnie opisane w
`docs/BUILDER_COMPLETENESS_AUDIT_2026-07-29.md`.

## Źródła

- zaakceptowana referencja buildera:
  `apps/web/public/panel/ChatGPT Image 26 lip 2026, 18_28_24.png`,
  1448 × 1086,
  SHA-256 `918e0d8edfdb02d899310e61b36bcf25618bd1a761bf62809fb9927d4a68a526`;
- zgłoszony crop uszkodzonego przełącznika:
  SHA-256 `7a0cf08e3194884daaee44f08e29d11fb9dba4194d2f81b4c5f193ad6c93275a`;
- pełny stan `before`: 1448 × 1086,
  SHA-256 `817c2f46e1b1e8795da0e86518b6c78c8ab3beebb89797e3c715223c5e547402`.

## Przyczyna

Desktopowa reguła `.question-inspector input` nadawała checkboxowi
`min-height: 42px`, padding i promień pola tekstowego. Późniejsza reguła
wygrywała w kaskadzie z deklaracją 42 × 24 px przełącznika. Gałka zachowywała
18 × 18 px i przesunięcie 18 px, dlatego pojawiała się w prawym górnym rogu
zielonego kwadratu.

## Zweryfikowany kontrakt

| Właściwość             |                           Oczekiwane | Wynik |
| ---------------------- | -----------------------------------: | ----- |
| szerokość kontrolki    |                                42 px | PASS  |
| wysokość / min-height  |                                24 px | PASS  |
| padding                |                                 0 px | PASS  |
| promień                |                              ≥ 12 px | PASS  |
| gałka                  |                           18 × 18 px | PASS  |
| offset gałki           |                             2 / 2 px | PASS  |
| przesunięcie checked   |                                18 px | PASS  |
| przesunięcie unchecked |                                 0 px | PASS  |
| `Space`                |             zmienia i przywraca stan | PASS  |
| focus-visible          |                  3 px, jawny outline | PASS  |
| disabled               |         opacity 0,55 + `not-allowed` | PASS  |
| forced-colors          | Canvas / Highlight / systemowy fokus | PASS  |
| pola inspektora        |                     min-height 42 px | PASS  |

## Viewporty i powierzchnie

- builder desktop 1448 × 1086;
- builder tablet 768 × 1024;
- builder mobile 390 × 844;
- prywatność desktop 1536 × 1024;
- checked, unchecked, disabled i forced-colors jako osobne cropy.

W każdym viewportcie Playwright potwierdził brak poziomego overflow.
Builder desktop/mobile i prywatność nie mają naruszeń axe WCAG A/AA.

## Artefakty

- kanoniczny plik w `apps/web/public/panel/` — pełna referencja;
- `reference/switch-reference-crop.png` — crop przełącznika;
- `before/` — zgłoszony kwadratowy przełącznik i pełny render przed poprawką;
- `after/desktop/` — pełny builder i trzy stany kontrolki;
- `after/tablet/`, `after/mobile/` — transformacje responsive;
- `after/settings/` — wspólny wzorzec prywatności i forced-colors;
- `overlay-50-reference-vs-after-1448x1086.png`;
- `difference-reference-vs-after-1448x1086.png`.

Overlay pełnych ekranów jest materiałem orientacyjnym: aktualna marka Lorum,
wspólny zwijany sidebar, dane fixture’a oraz rozszerzona walidacja są
zaakceptowanymi różnicami wobec obrazu. Dla regresji przełącznika rozstrzygają
crop referencji, wyliczony CSS i test interakcji.

## Testy

- izolowany Playwright przełącznika: 1/1;
- regresja geometrii + interakcji + przełącznika buildera: 3/3;
- kanoniczny Playwright bez danych panelu: 34 pass, 13 conditional skip;
- unit: 133 pass;
- PostgreSQL/RLS: PASS;
- WordPress 6.9.2 / 7.0.2 na PHP 8.5.2: PASS;
- format, lint, typecheck, SAST, secret scan i build 39 tras: PASS.

Pierwsze uruchomienie RLS w ograniczonym sandboxie zostało zatrzymane przez
zakaz pamięci współdzielonej. Ten sam niezmieniony test uruchomiony w lokalnym,
dozwolonym trybie PostgreSQL przeszedł w całości.
