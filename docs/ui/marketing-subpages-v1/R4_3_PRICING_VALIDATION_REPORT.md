# R4.3 — model self-service w walidacji `/cennik`

**Data:** 2026-08-03
**Status:** PASS; R4.3 zamknięte
**Zakres:** wyłącznie wnętrze neutralnej karty self-service

## 1. Wykonane zmiany

- zwykłą listę czterech braków zastąpił semantyczny rejestr decyzji `<dl>`;
- rejestr rozdziela kwotę miesięczną, limity użycia, płatności i dalszy model;
- każda decyzja pokazuje status: „Otwarta”, „Otwarte”, „Poza MVP” albo „Po
  pilotażu” oraz krótkie wyjaśnienie;
- desktop używa zwartego układu termin → status → uzasadnienie, mobile układa
  każdy rekord pionowo;
- nie dodano kwot, limitów, terminu dostępności, formularza, roadmapy ani
  przycisku zakupu;
- karta pilotażu, dolna nota i CTA, finalny `CtaBand`, hero, header, footer i
  metadata pozostały niezmienione.

## 2. Prawdziwość

Rejestr opisuje stan decyzji, nie ofertę. Kwota i limity nie są ukrytymi
wartościami, płatności pozostają poza MVP, a dalszy model może być oceniony
dopiero po wynikach pilotażu. Jest to bezpośrednia realizacja ADR-020 bez
rozszerzenia zakresu produktu.

## 3. Pomiary

| Viewport | Karta przed | Karta po | Rekordy po               | Min. tekst | Overflow |
| -------: | ----------: | -------: | ------------------------ | ---------: | -------: |
|  1536 px |      672 px |   774 px | 4 × 66 px                |      12 px |     0 px |
|  1440 px |      672 px |   774 px | 4 × 66 px                |      12 px |     0 px |
|  1280 px |      672 px |   770 px | 4 × 66 px                |      12 px |     0 px |
|  1024 px |      704 px |   911 px | 89 / 89 / 96 / 95 px     |      12 px |     0 px |
|   768 px |      655 px |   780 px | 4 × 66 px                |      12 px |     0 px |
|   430 px |      611 px |   892 px | 103 / 103 / 103 / 102 px |      12 px |     0 px |
|   390 px |      702 px |   942 px | 103 / 103 / 103 / 102 px |      12 px |     0 px |
|   375 px |      743 px |   978 px | 103 / 103 / 121 / 120 px |      12 px |     0 px |
|   320 px |      743 px |  1102 px | 143 / 143 / 143 / 142 px |      12 px |     0 px |

Wzrost wysokości jest świadomy i wynika z jawnego uzasadnienia każdej decyzji.
Nie ma pustych spacerów ani maskowania overflow.

## 4. Visual QA

Artefakty znajdują się w
`artifacts/visual-qa/marketing-subpages-v1/r4-3/`, w tym side-by-side 1440 i
390 px oraz pełne zrzuty strony.

### Ocena 19/20

| Kryterium              | Wynik | Uzasadnienie                                          |
| ---------------------- | ----: | ----------------------------------------------------- |
| Kompletność regionów   |   4/4 | cztery decyzje, statusy, uzasadnienia i rezultat      |
| Geometria i proporcje  |   4/4 | zwarty desktop, stabilna oś mobile, zero overflow     |
| Typografia i spacing   |   4/4 | rytm rekordów, czytelne kapsuły, tekst minimum 12 px  |
| Gęstość danych i stany |   4/4 | brak niejednoznacznego „brak”; każda decyzja ma stan  |
| Transformacja mobile   |   3/4 | pełna i czytelna; uzasadnienia celowo wydłużają kartę |

## 5. Testy

- dedykowany R4.1–R4.3: 33/33 PASS;
- pełny marketing R1–R4.3: 167/167 PASS przy jednym workerze;
- `pnpm lint`: PASS, 8/8 pakietów;
- `pnpm typecheck`: PASS, 8/8 pakietów;
- `pnpm test`: PASS, w tym unit, RLS i WordPress;
- `pnpm build`: PASS, 8/8 pakietów i 39 tras;
- widget: 17 269 B gzip przy budżecie 92 160 B;
- capture: HTTP 200, 0 błędów runtime, 0 px overflow i minimum 12 px na 9/9
  viewportów;
- axe, forced colors, reduced motion, długie copy i klawiatura: PASS;
- snapshot przeglądarki potwierdził cztery pary `term`/`definition`, brak linku
  w karcie i niezmienioną ścieżkę pilotażu.

## 6. Wykryte problemy

- pierwszy test R4.2 nadal oczekiwał `<ul>` po zmianie na semantyczne `<dl>`;
  selektor przeniesiono na cztery rekordy bez osłabienia asercji;
- porównanie tekstu terminów zakładało techniczną spację między numerem i
  nazwą; asercja używa kontrolowanego odstępu, nadal sprawdzając komplet nazw.

## 7. Ryzyka i granice

- karta jest dłuższa na mobile, ponieważ nie ukrywa uzasadnień;
- statusy nie są harmonogramem ani zobowiązaniem do wdrożenia;
- route-local CSS pozostaje do konsolidacji w R12;
- brak zmian w API, danych, auth, RLS, tenant scope, pricingu, płatnościach i SEO.

## 8. Następny dozwolony etap

Wyłącznie **R4.4 — kryteria zakresu i CTA `/cennik`**. Dopiero ten etap może
zmienić dolną notę, przyciski oraz finalny `CtaBand`.
