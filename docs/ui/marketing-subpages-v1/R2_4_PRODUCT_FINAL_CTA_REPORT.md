# R2.4 — finalne CTA i overview `/produkt`

**Data:** 2026-08-02
**Status:** PASS; trasa `/produkt` ukończona, implementacja zatrzymana przed R3.1
**Zakres:** wyłącznie sekcja `#product-final-cta` podstrony produktu

## 1. Wykonane zmiany

- wspólny, płaski CTA band zastąpił lokalny finał decyzji dla `/produkt`;
- nagłówek domyka narrację trasy zaproszeniem do obejrzenia pełnego procesu na
  realnym zapytaniu;
- oba CTA prowadzą do istniejących tras: pełnego opisu procesu oraz logowania do
  panelu;
- trzy krótkie reguły przypominają o jawności reguł, orientacyjnym charakterze
  wyniku i odpowiedzialności firmy za decyzję;
- code-native overview „Kwotum w jednym widoku” podsumowuje jedną wersję
  procesu, jeden pełny rekord i jasną odpowiedzialność;
- desktop używa dwóch nierównych kolumn, a przy szerokości do 1088 px przechodzi
  w bezpieczną sekwencję pionową;
- mobile ma równe, pełnoszerokie CTA i zwarty overview bez poziomego overflow;
- inne trasy nadal używają współdzielonego `CtaBand` i nie zostały wizualnie
  przebudowane w tym etapie.

## 2. Pomiary

| Viewport | Sekcja po | Overview po      | CTA po                 | Overflow |
| -------: | --------: | ---------------- | ---------------------- | -------: |
|  1440 px |  855,4 px | 521,2 × 492,4 px | 241,6 × 56,8 px, równe |     0 px |
|   430 px | 1255,1 px | 364 × 466 px     | 359,2 × 56,8 px, równe |     0 px |
|   390 px | 1237,5 px | 324 × 466 px     | 319,2 × 56,8 px, równe |     0 px |
|   320 px | 1301,2 px | 262 × 538 px     | 257,2 × 56,8 px, równe |     0 px |

Przy 1024 px układ świadomie przechodzi już w jedną kolumnę. Zapobiega to
łamaniu etykiet CTA w zbyt wąskiej części tekstowej i zachowuje równą wysokość
obu akcji.

## 3. Visual QA

Baseline, wynik, metryki i porównania zapisano w:

- `artifacts/visual-qa/marketing-subpages-v1/r2-4/before/`;
- `artifacts/visual-qa/marketing-subpages-v1/r2-4/after/`;
- `artifacts/visual-qa/marketing-subpages-v1/r2-4/produkt-final-cta-before-after-1440.png`;
- `artifacts/visual-qa/marketing-subpages-v1/r2-4/produkt-final-cta-before-after-390.png`.

Brak osobnego obrazu referencyjnego tej podstrony, dlatego odbiór opiera się na
side-by-side, języku home V7, pomiarach, kontrakcie responsive i testach.

### Ocena 19/20

| Kryterium               | Wynik | Uzasadnienie                                                     |
| ----------------------- | ----: | ---------------------------------------------------------------- |
| Hierarchia i kompozycja |   4/4 | mocny finał decyzji i jednoznaczny panel podsumowania            |
| Geometria i rytm        |   4/4 | kontrolowany split desktop i równe CTA we wszystkich viewportach |
| Typografia i kolor      |   4/4 | spokojna powierzchnia, czytelny kontrast oraz akcent marki       |
| Responsive i dostępność |   4/4 | sześć viewportów, axe, forced colors i brak overflow             |
| Detale i spójność       |   3/4 | route-local cascade pozostaje do globalnego cleanupu w R12       |

## 4. Testy i komendy

- scope'owany Prettier: PASS;
- `pnpm lint`: PASS, 8/8 pakietów;
- `pnpm typecheck`: PASS, 8/8 pakietów;
- `pnpm build`: PASS, 8/8 pakietów i 39 tras;
- dedykowane R2.3 + R2.4: 16/16 PASS;
- pełny marketing R1 + R2.1–R2.4: 74/74 PASS;
- pełne `pnpm test`: PASS, w tym unit, RLS i WordPress;
- widget JavaScript: 17 269 B gzip przy budżecie 92 160 B;
- `git diff --check`: PASS.

Gate obejmuje 1440/1024/768/430/390/320 px, poprawne role semantyczne,
działające linki, kolejność mobile, równe CTA, granice wysokości, normalny axe,
axe w forced colors oraz brak poziomego overflow.

Root `pnpm format:check` pozostaje czerwony wyłącznie przez wcześniejsze,
nietknięte pliki w `artifacts/promo/` i audytowych metrykach. Wszystkie pliki
R2.4 przechodzą kontrolę scope'owaną.

## 5. Wykryte i usunięte problemy

- poprzedni wspólny band nie domykał specyficznej historii produktu i używał
  zbyt ogólnej akcji; nowy finał łączy decyzję z pełnym procesem i panelem;
- pierwsza wersja overview miała kontrast małych etykiet 4,32:1; kolor został
  przyciemniony do poziomu zgodnego z WCAG AA;
- przy 1024 px przyciski miały różną wysokość przez zawijanie dłuższej etykiety;
  wcześniejsze przejście do jednej kolumny przywróciło równą geometrię;
- historyczny test shellu zakładał klasę współdzielonego CTA; selektor
  rozszerzono o nowy, semantyczny region produktu bez osłabiania asercji.

## 6. Ryzyka i granice

- CSS R2.4 pozostaje lokalnym cascade lockiem do cleanupu w R12;
- overview jest podsumowaniem wartości, nie nową funkcją, raportem ani
  obietnicą automatycznej decyzji;
- nie zmieniono API, architektury, tenant scope, danych, pricingu, scoringu ani
  metadata SEO;
- nie przebudowano żadnej sekcji `/jak-dziala`.

## 7. Następny dozwolony etap

Wyłącznie **R3.1 — hero i mapa zaufania `/jak-dziala`**. Trasa `/produkt` ma
zamknięte R2.1–R2.4 i nie wymaga dalszej przebudowy przed globalnym odbiorem R12.
