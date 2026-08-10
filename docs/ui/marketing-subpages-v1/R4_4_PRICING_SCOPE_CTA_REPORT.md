# R4.4 — kryteria zakresu i CTA `/cennik`

**Data:** 2026-08-03
**Status:** PASS; R4 i R4.4 zamknięte
**Zakres:** wyłącznie dolna nota, kryteria zakresu i finalne akcje

## 1. Wykonane zmiany

- ogólną notę pod kartami zastąpił nazwany region z trzema kryteriami
  indywidualnej wyceny: procesem, publikacją i sposobem walidacji;
- region pokazuje dwa uczciwe rezultaty: plan wdrożenia i wycenę przed
  pilotażem oraz zweryfikowany proces i rekomendację dalszego rozwoju po nim;
- generyczny `CtaBand` zastąpił lokalny finał decyzji z dokładnie dwiema
  działającymi ścieżkami: do `/jak-dziala#proces` i `/logowanie`;
- oba CTA mają równą geometrię w całej macierzy responsive;
- trzy fakty końcowe wprost wykluczają fikcyjną cenę, atrapę formularza i
  automatyczną decyzję przed wynikiem pilotażu;
- hero, obie karty modelu współpracy, header, footer, metadata, API i logika
  aplikacji pozostały niezmienione.

## 2. Prawdziwość i decyzje

Sekcja nie tworzy cennika, planu subskrypcyjnego ani obietnicy wdrożenia.
Wyjaśnia jedynie, od czego zależy indywidualny zakres. Pierwsza akcja prowadzi
do istniejącej sekcji procesu, druga do istniejącego logowania. Nie dodano
formularza kontaktowego, ceny, limitu, triala, wymogu karty ani terminu
self-service. Jest to zgodne z ADR-020 i audytem trasy.

## 3. Pomiary

| Viewport | Kryteria przed | Kryteria po | Finalne CTA po | Akcje po        | Min. tekst | Overflow |
| -------: | -------------: | ----------: | -------------: | --------------- | ---------: | -------: |
|  1536 px |         228 px |      530 px |         429 px | 2 × 235 × 56 px |      12 px |     0 px |
|  1440 px |         228 px |      530 px |         420 px | 2 × 219 × 56 px |      12 px |     0 px |
|  1280 px |         228 px |      515 px |         392 px | 2 × 193 × 77 px |      12 px |     0 px |
|  1024 px |         228 px |      561 px |         410 px | 2 × 266 × 56 px |      12 px |     0 px |
|   768 px |         228 px |      742 px |         410 px | 2 × 266 × 56 px |      12 px |     0 px |
|   430 px |         366 px |      907 px |         592 px | 2 × 356 × 56 px |      12 px |     0 px |
|   390 px |         366 px |      933 px |         592 px | 2 × 316 × 56 px |      12 px |     0 px |
|   375 px |         391 px |      933 px |         592 px | 2 × 301 × 56 px |      12 px |     0 px |
|   320 px |         416 px |     1003 px |         652 px | 2 × 254 × 56 px |      12 px |     0 px |

Wzrost wysokości zastępuje dwuzdaniowe ostrzeżenie kompletnym kontraktem
zakresu. Na mobile kryteria i rezultaty są jedną osią DOM bez ukrywania treści,
pustych spacerów i maskowania overflow.

## 4. Visual QA

Artefakty znajdują się w
`artifacts/visual-qa/marketing-subpages-v1/r4-4/`: baseline, stan końcowy,
metryki dla dziewięciu viewportów, pełne zrzuty 1440/390 px i cztery
porównania side-by-side.

### Ocena 19/20

| Kryterium               | Wynik | Uzasadnienie                                                  |
| ----------------------- | ----: | ------------------------------------------------------------- |
| Kompletność regionów    |   4/4 | trzy kryteria, dwa rezultaty, dwie realne ścieżki             |
| Geometria i proporcje   |   4/4 | równe CTA, stabilne siatki, zero overflow                     |
| Typografia i spacing    |   4/4 | czytelna hierarchia, spokojny rytm, tekst minimum 12 px       |
| Prawdziwość i działanie |   4/4 | brak fikcyjnej ceny/formularza, oba linki prowadzą do tras    |
| Transformacja mobile    |   3/4 | kompletna i czytelna; pełny kontrakt świadomie wydłuża stronę |

## 5. Testy

- dedykowany R4.1–R4.4: 44/44 PASS;
- pełny marketing R1–R4.4: 178/178 PASS przy jednym workerze;
- `pnpm lint`: PASS, 8/8 pakietów;
- `pnpm typecheck`: PASS, 8/8 pakietów;
- `pnpm test`: PASS, w tym unit, RLS i WordPress;
- `pnpm build`: PASS, 8/8 pakietów i 39 tras;
- widget: 17 269 B gzip przy budżecie 92 160 B;
- capture: HTTP 200, 0 błędów runtime, 0 px overflow i minimum 12 px na 9/9
  viewportów;
- axe, forced colors, reduced motion, długie copy i klawiatura: PASS;
- snapshot przeglądarki potwierdził jedną H1, dwa nazwane regiony, trzy
  kryteria, dwa rezultaty i dokładnie dwa linki o poprawnych `href`.

## 6. Wykryte problemy

- historyczne testy R4.1–R4.3 oczekiwały usuniętego `CtaBand` i starej noty;
  przeniesiono je na nowe regiony bez zmniejszania rygoru;
- globalny test marketingu wybierał dwa identyczne teksty „Wycena
  indywidualna”; selektor zawężono do karty pilotażu, zachowując asercję copy;
- przy 1280 px dłuższe etykiety zwiększają oba przyciski do 77 px, lecz ich
  wysokość i szerokość pozostają identyczne.

## 7. Ryzyka i granice

- mobile jest dłuższy, ponieważ nie ukrywa kryteriów ani rezultatów;
- logowanie jest ścieżką dla istniejących użytkowników, nie obietnicą
  samodzielnego zakupu;
- route-local CSS pozostaje do konsolidacji wyłącznie w R12;
- brak zmian w API, danych, auth, RLS, tenant scope, płatnościach i SEO.

## 8. Następny dozwolony etap

Wyłącznie **R5.1 — hero i relacja tenantów `/dla-agencji`**. R5.1 nie został
rozpoczęty.
