# Korekta hero według nowszej referencji — Etap 12G

> Status historyczny: kompaktowa interpretacja została zastąpiona przez
> najnowszy załącznik z pełnym dokumentem leada. Aktualny kontrakt opisuje
> `HOME_HERO_FULL_LEAD_CORRECTION_2026-07-27.md`.

## Zakres i źródło prawdy

Etap obejmuje wyłącznie pierwszy fold `/`: hero, proof odpowiedzi → lead oraz
bezpośrednio przylegający pasek korzyści. Nie zmienia panelu, API, modelu danych,
tenant scope, RLS, pricingu, scoringu, widgetu ani tras poza `/`.

Źródłami wizualnymi są:

1. nowszy ekran Wyceno dołączony do rozmowy;
2. `nowydesign.zip`;
3. znajdujący się w archiwum
   `lorum-codex-ui-rebuild-v6-image-locked/references/accepted-master-board.png`.

Zgodnie z `START_HERE.md` archiwum ekran dołączony w bieżącej wiadomości ma
pierwszeństwo nad starszymi kopiami repozytoryjnymi. Marka pozostaje Lorum na
mocy ADR-024; referencja Wyceno określa kompozycję i gęstość, a nie nazwę
produktu.

## Co zostało odtworzone

- lekka relacja copy → trzy odpowiedzi → pojedynczy łącznik → kompaktowy lead;
- biała karta wyniku bez ciemnego raila i bez kontrolek aplikacji operacyjnej;
- tytuł, osoba, wynik 85/100, pięć uporządkowanych pól i trzy miniatury;
- czteroelementowy pasek: jakość leadów, czas, konwersja i montaż;
- CTA, microcopy i długość opisu zgodne z rytmem referencji;
- poziomy układ dwóch kart także na mobile, bez desktopowego dashboardu
  pomniejszonego do telefonu.

Przy szerokości 1107 px implementacja zachowuje osie referencji:

| Element                        |   Referencja | Implementacja |
| ------------------------------ | -----------: | ------------: |
| Początek lewej kolumny         |  około 45 px |         44 px |
| Karta odpowiedzi               | około 467 px |        467 px |
| Górna krawędź karty odpowiedzi | około 134 px |        134 px |
| Karta leada                    | około 803 px |        804 px |
| Górna krawędź karty leada      |  około 88 px |         88 px |
| Początek paska korzyści        | około 592 px |        592 px |

Różnice w treści nazwy Wyceno/Lorum są celowe. Porównanie nie służy jako
automatyczny pixel gate dla rasteryzacji fontów, lecz potwierdza geometrię,
hierarchię, rozmiary powierzchni i gęstość informacji.

## Materiał obrazowy

Miniatury kuchni zostały utworzone wbudowanym narzędziem ImageGen w trybie
generowania i zapisane jako
`apps/web/public/images/redesign/hero-kitchen-diptych-v1.webp` (640 × 256 px,
około 14 KiB). Nie zawierają osób, tekstu, logo ani danych klienta.

Końcowy prompt:

> Use case: photorealistic-natural
>
> Asset type: small UI thumbnail sprite for a B2B SaaS lead card
>
> Primary request: create two adjacent photorealistic interior photographs of
> the same elegant made-to-measure kitchen, each showing a slightly different
> angle.
>
> Scene/backdrop: contemporary warm minimalist kitchen with matte deep-green
> lower cabinets, light oak tall cabinets, pale stone countertop, softly
> textured warm-white walls.
>
> Style/medium: believable high-end architectural interior photography, natural
> materials, realistic proportions.
>
> Composition/framing: a clean horizontal diptych with two equal landscape
> panels side by side, a narrow neutral divider, useful details kept legible at
> tiny thumbnail size; no outer frame.
>
> Lighting/mood: soft natural daylight, calm, premium, understated.
>
> Color palette: warm ivory, light oak, muted forest green, charcoal accents.
>
> Materials/textures: (not separately set)
>
> Constraints: no people, no text, no logos, no watermark, no UI, no labels, no
> exaggerated wide-angle distortion.

## Visual QA

Artefakty znajdują się w `artifacts/visual-qa/12g-reference-hero/`:

- `desktop/reference.png`, `before.png`, `after-final.png`,
  `overlay-final.png` i `diff.md`;
- `mobile/reference.png`, `before.png`, `after-final.png`,
  `overlay-final.png` i `diff.md`.

Kontrolowane baseline’y Playwright obejmują 1440 × 1000, 1024 × 900,
768 × 1000, 390 × 844 i 320 × 844. Testy blokują tekst proofu poniżej 12 px,
poziomy overflow, błędy axe, niesprawną klawiaturę, brak treści bez JavaScriptu
oraz regresje reduced motion i forced colors.

## Gate i ryzyka

Końcowy gate:

- `pnpm format:check` — PASS;
- `pnpm lint` — PASS, 8/8 zadań;
- `pnpm typecheck` — PASS, 8/8 zadań;
- `pnpm test` — PASS, testy jednostkowe, PostgreSQL/RLS i WordPress;
- `pnpm security:scan` — PASS;
- `pnpm build` — PASS, 8/8 zadań, 37 tras, widget 15 903 B gzip;
- `pnpm e2e` — PASS, 32/32.

Pozostają ręczne testy VoiceOver/NVDA, rzeczywiste urządzenia i ocena Core Web
Vitals na docelowym hostingu. Etap nie daje zgody na deployment ani publiczny
launch. Kolejnym etapem pozostaje landing board 3 z Etapu 12F.
