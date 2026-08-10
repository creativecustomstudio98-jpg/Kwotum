# R2.2 — mapa produktu `/produkt`

**Data:** 2026-08-02
**Status:** PASS; implementacja zatrzymana przed R2.3
**Zakres:** wyłącznie druga sekcja podstrony produktu

## 1. Wykonane zmiany

- płaską listę sześciu modułów zastąpiła jedna code-native mapa zależności;
- trzy etapy wejściowe pokazują builder i wersje, widget/hosted link oraz
  pricing i scoring;
- centralny rekord leada zachowuje budżet, termin, lokalizację, załączniki,
  wynik z powodami oraz następny krok;
- powiadomienia i analityka są pokazane jako działania po zapisie, a nie
  równorzędne, odłączone funkcje;
- kontrakt decyzji jasno rozdziela rolę systemu i handlowca;
- wariant desktop prowadzi od lewej do prawej, a mobile używa zwartej pionowej
  sekwencji z dwukolumnowym blokiem działań następczych;
- copy nie dodaje cen, KPI, integracji, AI, pełnego CRM ani funkcji poza MVP;
- sekcja granic produktu i finalne CTA pozostały nietknięte.

## 2. Pomiary

| Viewport | Sekcja przed | Sekcja po | Proof po          | Różnica sekcji | Overflow |
| -------: | -----------: | --------: | ----------------- | -------------: | -------: |
|  1440 px |    1386,8 px | 1188,7 px | 1329,7 × 728,3 px |      −198,0 px |     0 px |
|   430 px |    2240,9 px | 1983,7 px | 398 × 1448,9 px   |      −257,2 px |     0 px |
|   390 px |    2279,8 px | 1992,7 px | 358 × 1457,9 px   |      −287,1 px |     0 px |
|   320 px |    2340,4 px | 2218,3 px | 296 × 1623,0 px   |      −122,1 px |     0 px |

Nowy proof jest wyższy od starej siatki, ponieważ pokazuje pełny rekord i
zależności danych, ale cała sekcja jest krótsza dzięki usunięciu powtarzalnego
intro oraz kompaktowej kompozycji mobile.

## 3. Visual QA

Baseline, wynik, metryki i porównania zapisano w:

- `artifacts/visual-qa/marketing-subpages-v1/r2-2/before/`;
- `artifacts/visual-qa/marketing-subpages-v1/r2-2/after/`;
- `artifacts/visual-qa/marketing-subpages-v1/r2-2/produkt-map-before-after-1440.png`;
- `artifacts/visual-qa/marketing-subpages-v1/r2-2/produkt-map-before-after-390.png`.

Brak osobnego obrazu referencyjnego tej podstrony, dlatego odbiór opiera się
na side-by-side, osiach home V7, pomiarach, kontrakcie responsive i testach.

### Ocena 19/20

| Kryterium               | Wynik | Uzasadnienie                                                    |
| ----------------------- | ----: | --------------------------------------------------------------- |
| Hierarchia i kompozycja |   4/4 | jeden rekord jest jednoznacznym centrum całego systemu          |
| Geometria i rytm        |   4/4 | czytelny przepływ desktop i zwarta, krótsza sekwencja mobile    |
| Typografia i kolor      |   4/4 | papier, ciemna karta rekordu i kontrolowany zielony akcent      |
| Responsive i dostępność |   4/4 | sześć viewportów, axe, forced colors i brak overflow            |
| Detale i spójność       |   3/4 | późniejsze sekcje celowo czekają na osobne etapy R2.3 oraz R2.4 |

## 4. Testy i komendy

- scope'owany Prettier: PASS;
- `pnpm lint`: PASS, 8/8 pakietów;
- `pnpm typecheck`: PASS, 8/8 pakietów;
- `pnpm build`: PASS, 8/8 pakietów i 39 tras;
- dedykowane R2.1 + R2.2: 16/16 PASS;
- pełny marketing R1 + R2.1 + R2.2: 58/58 PASS;
- pełne `pnpm test`: PASS, w tym unit, RLS i WordPress;
- widget JavaScript: 17 269 B gzip przy budżecie 92 160 B;
- `git diff --check`: PASS.

Dedykowany gate obejmuje 1440/1024/768/430/390/320 px, kolejność zależności,
pełny rekord, równe działania następcze, minimalny tekst 12 px, granice
wysokości, brak overflow oraz axe w trybie forced colors.

Root `pnpm format:check` pozostaje czerwony wyłącznie przez 13 wcześniejszych,
nietkniętych plików w `artifacts/promo/` i
`artifacts/visual-qa/marketing-subpages-v1/audit/`; pliki R2.2 przechodzą.

## 5. Wykryte i usunięte problemy

- pierwszy mobile stack był zbyt długi; etapy wejściowe, rekord i rail zostały
  skompresowane bez usuwania danych;
- test 1024 px ujawnił, że mapa przechodzi już w zamierzony układ pośredni;
  gate mierzy teraz właściwy kontrakt tego breakpointu;
- axe w pełnej regresji wykrył kontrast 3,47–4,43:1 dla małych etykiet rekordu;
  bazowe kolory zostały przyciemnione do wartości spełniających WCAG AA;
- forced colors otrzymał jawne kolory systemowe dla rekordu i kontraktu
  decyzji.

## 6. Ryzyka i granice

- CSS R2.2 pozostaje lokalnym cascade lockiem do cleanupu w R12;
- mapa jest objaśniającym proofem, nie interaktywnym panelem ani obietnicą
  automatycznej decyzji;
- nie zmieniono architektury, API, tenant scope, danych, pricingu, scoringu ani
  metadata SEO;
- pełne visual QA granic produktu i finalnego CTA pozostaje otwarte.

## 7. Następny dozwolony etap

Wyłącznie **R2.3 — granice produktu `/produkt`**. R2.4 finalne CTA pozostaje
poza zakresem do osobnego odbioru.
