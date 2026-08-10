# R4.2 — dwie ścieżki współpracy `/cennik`

**Data:** 2026-08-03
**Status:** PASS; R4.2 zamknięte
**Zakres:** wyłącznie istniejące karty pilotażu i self-service

## 1. Wykonane zmiany

- dwie płaskie kolumny zastąpił nazwany, code-native region dwóch ścieżek;
- pilotaż otrzymał status „Dostępne teraz”, a self-service „W walidacji”;
- każda karta rozdziela tezę, opis, sposób wyceny lub status modelu, cztery
  fakty oraz rezultat ścieżki;
- aktywny pilotaż ma zieloną hierarchię, a niezatwierdzony self-service
  neutralną, bez wizualnego sygnału gotowego planu;
- desktop 1024–1536 px utrzymuje dwie równe karty, 768 px i mobile przechodzą
  do jednej osi;
- nie dodano przycisku zakupu, formularza, ceny ani interakcji pozorującej
  dostępność self-service;
- dolna nota i CTA modelu, finalny `CtaBand`, hero R4.1, metadata, header i
  footer pozostały poza redesignem.

## 2. Prawdziwość i decyzja produktowa

Pilotaż jest jedyną ścieżką opisaną jako dostępna teraz i nadal wymaga
indywidualnego ustalenia zakresu. Self-service pozostaje przyszłym modelem w
walidacji. Strona nie publikuje kwot, limitów, trialu, płatności ani obietnicy
gotowego abonamentu, zgodnie z ADR-020.

## 3. Pomiary

| Viewport | Region przed | Region po | Karty po     | Min. tekst | Overflow |
| -------: | -----------: | --------: | ------------ | ---------: | -------: |
|  1536 px |       778 px |    900 px | 672 / 672 px |      12 px |     0 px |
|  1440 px |       778 px |    900 px | 672 / 672 px |      12 px |     0 px |
|  1280 px |       775 px |    900 px | 672 / 672 px |      12 px |     0 px |
|  1024 px |       760 px |    932 px | 704 / 704 px |      12 px |     0 px |
|   768 px |      1182 px |   1576 px | 677 / 655 px |      12 px |     0 px |
|   430 px |      1393 px |   1630 px | 637 / 611 px |      12 px |     0 px |
|   390 px |      1487 px |   1742 px | 658 / 702 px |      12 px |     0 px |
|   375 px |      1511 px |   1808 px | 658 / 743 px |      12 px |     0 px |
|   320 px |      1656 px |   1951 px | 776 / 743 px |      12 px |     0 px |

Region obejmuje także niezmienioną notę i dwa CTA znajdujące się bezpośrednio
pod kartami. Wzrost wysokości wynika z dodania opisów, jawnych statusów i
rezultatów, a nie pustej przestrzeni.

## 4. Visual QA

Artefakty znajdują się w
`artifacts/visual-qa/marketing-subpages-v1/r4-2/`, w tym pełne zrzuty 1440 i
390 px oraz side-by-side sekcji.

### Ocena 19/20

| Kryterium              | Wynik | Uzasadnienie                                                |
| ---------------------- | ----: | ----------------------------------------------------------- |
| Kompletność regionów   |   4/4 | status, opis, model, cztery fakty i rezultat w obu kartach  |
| Geometria i proporcje  |   4/4 | równe karty desktop, stabilny stack mobile, zero overflow   |
| Typografia i spacing   |   4/4 | wyraźna hierarchia i tekst minimum 12 px                    |
| Gęstość danych i stany |   4/4 | aktywna ścieżka i walidacja są jednoznacznie rozdzielone    |
| Transformacja mobile   |   3/4 | czytelna i kompletna; dwie karty świadomie wydłużają region |

## 5. Testy

- dedykowany R4.1–R4.2: 22/22 PASS;
- pełny marketing R1–R4.2: 156/156 PASS przy jednym workerze;
- `pnpm lint`: PASS, 8/8 pakietów;
- `pnpm typecheck`: PASS, 8/8 pakietów;
- `pnpm test`: PASS, w tym unit, RLS i WordPress;
- `pnpm build`: PASS, 8/8 pakietów i 39 tras;
- widget: 17 269 B gzip przy budżecie 92 160 B;
- axe, forced colors, reduced motion, długie copy i klawiatura: PASS;
- capture: HTTP 200, 0 błędów runtime, 0 px overflow i minimum 12 px w 9/9
  viewportów.

## 6. Ryzyka i granice

- na mobile region jest dłuższy, ponieważ obie ścieżki zachowują komplet
  informacji zamiast ukrywać różnice w akordeonie;
- „Dostępne teraz” oznacza program pilotażowy, nie samoobsługowy zakup;
- route-local CSS pozostaje do konsolidacji dopiero w R12;
- brak zmian w API, bazie, auth, RLS, tenant scope, scoringu, płatnościach i SEO.

## 7. Następny dozwolony etap

Wyłącznie **R4.3 — model w walidacji `/cennik`**. Kryteria zakresu, dolne CTA i
finalny `CtaBand` pozostają poza zakresem do R4.4.
