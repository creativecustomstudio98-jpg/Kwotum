# Sidebar panelu Kwotum — korekta 12M-X

**Data:** 2026-08-03

**Zakres:** wspólny sidebar `/panel/[organizationId]`

**Decyzja:** X w `docs/ui/REFERENCE_MANIFEST.md`

## Punkt odniesienia i zakres

- baza produktu: `references/product-app-board.png`, 1536 × 1024;
- aktualny runtime przed zmianą: wspólny sidebar 208 px i rail 78 px;
- dyspozycja właściciela: subtelny efekt znaku bez osobnego tła, lepsze
  customowe ikony i szerszy stan rozwinięty;
- poza zakresem: nawigacja, uprawnienia, trasy, dane, builder, dolny pasek
  mobilny i zachowanie po zwinięciu.

## Implementacja

- rozwinięta szerokość wynosi 240 px, zwinięta nadal 78 px;
- lockup marki używa oryginalnego `Logoicon.svg` bez płytki, tła, obwódki i
  blur; subtelne światło jest przypisane wyłącznie do samego znaku;
- tło sidebara ma dwie spokojne warstwy światła i delikatny pierścień zamiast
  płaskiego koloru;
- aktywny link, skróty i konto używają jednego systemu półprzezroczystych
  powierzchni;
- `PanelNavigationIcon` dostarcza autorskie SVG bez kafelkowych teł tylko
  nawigacji i na mobile, a pozostałe ikony panelu nadal korzystają z
  `PanelIcon`;
- wysuwanie korzysta z jednego uchwytu krawędziowego, obrotu tej samej
  strzałki oraz wspólnego easing dla szerokości, nazwy, etykiet i konta;
- `prefers-reduced-motion` wyłącza nowe przejścia, a forced colors zachowuje
  rozpoznawalne obramowania i `currentColor` SVG.

## Visual QA

Artefakty:

- `artifacts/visual-qa/12m-panel-shell/sidebar-kwotum-glass/expanded-240px-top.jpg`;
- `artifacts/visual-qa/12m-panel-shell/sidebar-kwotum-glass/collapsed-78px-top.jpg`;
- `artifacts/visual-qa/12m-panel-shell/sidebar-kwotum-glass/mobile-425x239.jpg`.

W zalogowanym runtime potwierdzono szerokości 240 px i 78 px, przezroczyste
tło oraz brak obramowania ikon i samego znaku. Przy aktywnym
viewportcie aplikacji 425 px desktopowy rail jest ukryty, mobilna nawigacja ma
`display: grid`, a różnica `scrollWidth - clientWidth` wynosi 0 px. Dwa cropy
desktopowe powstały przez chwilowe obniżenie wyłącznie progu CSS do celów
inspekcji w aktywnej sesji; produkcyjny breakpoint 56 rem został przywrócony
przed testami i buildem. Widoczny czerwony badge na cropach jest nakładką
Next.js Dev Tools, nie elementem aplikacji.

Pełny scenariusz Playwright wymaga lokalnych `PANEL_E2E_*`. W tej sesji został
poprawnie pominięty zamiast obchodzenia uwierzytelnienia. Kontrakt testu został
zaktualizowany do 240 px oraz minimalnego preview buildera 527 px przy
1448 px.

## Weryfikacja

| Komenda                               | Wynik                         |
| ------------------------------------- | ----------------------------- |
| `pnpm --filter @wyceno/web lint`      | PASS                          |
| `pnpm --filter @wyceno/web typecheck` | PASS                          |
| `pnpm --filter @wyceno/web test`      | PASS, 24 pliki i 85/85 testów |
| `pnpm --filter @wyceno/web build`     | PASS, 39 tras                 |
| izolowany Playwright sidebara         | SKIP, brak `PANEL_E2E_*`      |

## Ryzyka i kryteria odbioru

- szerszy sidebar odbiera builderowi 32 px, dlatego jego kontrolny dolny próg
  preview przy 1448 px wynosi teraz 527 px; poziomy overflow nadal jest
  niedozwolony;
- znak i wszystkie ikony pozostają czytelne bez powierzchni pod nimi; stan
  aktywny komunikuje cały wiersz, nie kafelek ikony;
- odbiór: logo jest rozpoznawalne, aktywny link ma jednoznaczny stan, ikony są
  spójne przy 18–20 px, rail przechodzi 240 → 78 → 240 i mobile nie pokazuje
  desktopowego sidebara.
