# Kwotum — raport marki i korekt CTA

**Status:** PASS lokalny
**Data:** 2026-08-03
**Zakres:** widoczna marka, finalne CTA/kontakt i akcje przykładowego leada na `/`

## Referencje

| Referencja                                  |    Rozmiar | SHA-256                                                            | Rola                                                |
| ------------------------------------------- | ---------: | ------------------------------------------------------------------ | --------------------------------------------------- |
| `reference/01-kwotum-logo-direction.png`    | 1600 × 900 | `0ae9103735a3b0bf0d48653cdc38ba311776c7d175efe45b48a26ba9a1083a97` | nazwa, konstrukcja Q, paleta i mała skala           |
| `reference/02-mobile-final-cta-padding.png` | 780 × 1688 | `97ac5c1ba02547248da3006173c8a146f906e483f4e88ba1fd473981d3c87fb7` | rytm i bezpieczne marginesy finalnego CTA na mobile |
| `reference/03-final-cta-facts-spacing.png`  | 1460 × 158 | `2fa98bbf8b746e189373210250a779a4c48f721e37180f633a29ca0a1fb6e683` | zwarty rail trzech warunków bez sztucznych kolumn   |
| `reference/04-lead-actions-width.png`       |  564 × 262 | `b048c0a8cdb6e15c0f59f8048c0397e53fab3576c7cc5078dc04228d9896e72d` | równa szerokość obu akcji przykładowego leada       |

ADR-033 nadaje tym obrazom pierwszeństwo wyłącznie dla marki oraz mobilnej
geometrii finalnego CTA. Nie zmienia zakresu produktu ani kontraktów
technicznych.

## Implementacja znaku

- widoczna nazwa w zdaniu: **Kwotum**;
- wordmark: **kwotum** małymi literami;
- główny łuk i ogon Q: oryginalny grafitowy gradient z pliku właściciela;
- wnętrze znaku: trzy linie formularza;
- akcent potwierdzenia: oryginalna zieleń z pliku właściciela;
- wordmark na jasnej powierzchni: `#0B1530`;
- jeden SVG `apps/web/public/Logoicon.svg` zasila faviconę, auth i panel;
- marketing renderuje równoważną wersję inline, dzięki czemu forced colors
  może zachować czytelność znaku.

Nowszy, dostarczony przez właściciela plik `ikonka-kwotum.svg` ma SHA-256
`9514d8a7041f5144f9c09f85f2ff53593e51dd4ee7982233574d8514b0d9dc22` i
zastępuje wcześniejszy zielony łuk wyłącznie w regionie symbolu. Eksport
zawierał dwa obrazy PNG osadzone w masce SVG i ważył 270 173 B. Produkcyjny
zasób zachowuje dokładne piksele artworku właściciela, usuwa wyłącznie pusty
margines i problematyczną maskę eksportera, a następnie osadza transparentny
wariant 123 × 128 w istniejącym `Logoicon.svg`. Symbol nie został
reinterpretowany ani przerysowany.

## Diagnoza paddingów

Baseline produkcyjnego renderu wykazał, że problem nie ograniczał się do
subiektywnie dużych odstępów. Przy viewportcie 320 px panel miał 288 px
szerokości, lecz brand, copy i akcje zachowywały 326,78 px. Elementy były
obcinane przez `overflow: hidden`. Panel dziedziczył również 44 px odstępu
między każdym głównym blokiem.

Po korekcie:

| Viewport | Panel     | Wewnętrzna oś treści | Padding sekcji   | Padding panelu     | Gap panelu         | `scrollWidth` |
| -------: | --------- | -------------------- | ---------------- | ------------------ | ------------------ | ------------: |
|   320 px | x=12–308  | x=33–287             | 24 px / 12 px    | 20 px              | 32 px              |        320 px |
|   390 px | x=12–378  | x=33–357             | 24 px / 12 px    | 20 px              | 32 px              |        390 px |
|  1440 px | x=32–1408 | zgodna z V7          | 80/84 px / 32 px | desktop bez zmiany | desktop bez zmiany |       1440 px |

Kicker zawija się bez ucięcia, CTA mają pełną szerokość dostępnej kolumny,
karty proof nie ustanawiają własnego minimum, a lista warunków może zawijać
tekst. Minimalna wysokość akcji wynosi 60 px, powyżej WCAG 2.2 target size.

## Korekta rytmu i szerokości akcji

Drugi przegląd ujawnił dwa lokalne wyjątki CSS. Rail warunków używał kolumn
`9rem 14.5rem max-content`, dlatego pozycje nie miały wspólnego rytmu. Został
zastąpiony zwartym, zawijanym flexem z kontrolowanym odstępem 16–32 px; poniżej
768 px przechodzi w pojedynczą kolumnę.

Kontener akcji przykładowego leada miał 15,25 rem, ale pierwsza akcja otrzymała
osobną szerokość 12 rem. Wyjątek usunięto. Na desktopie oba przyciski mają
15,25 rem, a na mobile oba zajmują pełną szerokość kolumny. Różnica mierzona
przez test nie może przekroczyć 1 px.

## Artefakty QA

Katalog `artifacts/visual-qa/kwotum-brand-v1/` zawiera:

- baseline finalnego CTA dla 320 i 390 px;
- finalne CTA dla 320, 390 i 1440 px;
- widok nagłówka/viewportu dla 320, 390 i 1440 px.

Pomiar Playwright potwierdza brak błędów konsoli i brak dokumentowego overflow
na 320/390/1440 px. Elementy demonstracyjnej sceny hero celowo wychodzą poza
swój przycięty kadr, ale nie zwiększają szerokości dokumentu.

## Gate jakości

- `pnpm lint` — PASS, 8/8 pakietów;
- `pnpm typecheck` — PASS, 8/8 pakietów;
- `pnpm test` — PASS: 15/15 zadań unit, 85/85 testów web, pełny harness RLS
  oraz WordPress 6.9.2/7.0.2;
- `pnpm build` — PASS, 8/8 pakietów, 39 tras, widget 17 269 B gzip;
- `pnpm exec playwright test tests/e2e/marketing.spec.ts` — PASS, 25/25;
- `git diff --check` — PASS;
- `pnpm format:check` — kod i dokumenty etapu są poprawne; root zgłasza
  wyłącznie siedem istniejących, nieśledzonych plików w `artifacts/promo/`, które
  należą do równoległego zadania i nie zostały zmienione.

Test regresyjny mierzy finalny panel CTA przy 320/375/390/430 px: inset panelu
12 px, padding wewnętrzny 20 px, gap 32 px oraz wszystkie główne dzieci w
granicach viewportu.

## Ograniczenia i ryzyka

Nazwa, domena i znak wymagają profesjonalnego badania przed publicznym
launchem. Rebranding nie migruje zapisanych kluczy `lorum:*`, ponieważ ich
zmiana zerwałaby preferencje istniejących użytkowników. Historyczne raporty i
ścieżki mogą zachować poprzednią nazwę jako zapis wcześniejszej decyzji.
