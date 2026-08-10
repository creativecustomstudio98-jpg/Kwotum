# Landing mobile V1 — audit i reference lock

**Status:** M0 PASS; M1 header + hero wybrany do implementacji
**Data:** 2026-08-02
**Viewport bazowy:** 390 × 844 px
**Viewport graniczny:** 320 × 800 px

## Referencje

- zawartość: osiem odebranych regionów desktop V7 i footer;
- transformacja: `references/landing-mobile-full.png`, 390 × 14302 px,
  SHA-256 `eb43b17e…c7063`;
- pomocnicze cztery plansze mobile w
  `docs/ui/lorum-landing-reference-v2/screenshots/`;
- reguły: `docs/RESPONSIVE_LAYOUT.md` i `docs/VISUAL_QA.md`.

Starsze V6 nie nadpisuje treści V7. Nie wykonujemy RMSE obrazów o różnej treści;
referencja określa pionową hierarchię, rytm, gęstość i sposób kadrowania proof.

## Baseline przed M1

| Pomiar             |                390 px |                320 px |
| ------------------ | --------------------: | --------------------: |
| wysokość dokumentu |              14856 px |              15459 px |
| header             |           390 × 72 px |           320 × 72 px |
| hero               |             1504,5 px |               1484 px |
| H1                 |       `x=16, w=397,1` |       `x=16, w=346,7` |
| CTA główne         | `x=16, w=397,1, h=64` | `x=16, w=346,7, h=64` |
| CTA drugie         | `x=16, w=397,1, h=64` | `x=16, w=346,7, h=64` |

Dokument raportuje `scrollWidth` równy viewportowi tylko dlatego, że hero
maskuje rozszerzenie min-content przez `overflow: hidden`. H1 i CTA faktycznie
wychodzą odpowiednio o około 23 i 43 px poza prawą krawędź. To P1 layoutu i
główny powód rozpoczęcia od M1.

## Mapa problemów

1. **Header/hero:** clipping H1 i CTA, zbyt późny proof, fakty jako długa lista.
2. **Proces:** trzy desktopowe karty tworzą sekcję około 1618–1779 px.
3. **Kluczowe dane:** cztery rozbudowane karty tworzą około 1958–2034 px.
4. **Lead:** poprawna kolejność, ale wymaga optymalizacji galerii i akcji.
5. **Integracje:** desktopowa scena ma około 1872–1955 px na telefonie.
6. **Pilotaż:** dwie karty są czytelne, lecz sekcja ma około 1744–1846 px.
7. **FAQ:** poprawna semantyka, ale gęstość pomocy wymaga osobnej hierarchii.
8. **Final CTA/footer:** działają, lecz wymagają końcowego mobilnego rytmu.

## Artefakty

- `artifacts/visual-qa/landing-mobile-v1/m0/before-fold-390.png`;
- `artifacts/visual-qa/landing-mobile-v1/m0/before-full-390.png`;
- `artifacts/visual-qa/landing-mobile-v1/m0/before-fold-320.png`;
- `artifacts/visual-qa/landing-mobile-v1/m0/before-full-320.png`.

Następny i jedyny aktywny mikroetap: **M1 — header + hero**.
