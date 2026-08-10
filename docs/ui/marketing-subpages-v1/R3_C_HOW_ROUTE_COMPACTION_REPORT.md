# R3.C — przekrojowa kompresja `/jak-dziala`

**Data:** 2026-08-02
**Status:** PASS; ilościowy gate R3 zamknięty
**Zakres:** rytm mobile całej trasy bez usuwania informacji i zmiany kolejności

## 1. Wykonane zmiany

- hero, mapa zaufania, kroki 1–6, model bezpieczeństwa oraz overview otrzymały
  wspólny, zwarty kontrakt mobile bez zmiany ich kolejności w DOM;
- najważniejszy rezultat każdego kroku pozostaje zawsze widoczny, a opis i
  demonstracyjny artefakt są dostępne w natywnym, klawiaturowym `details`;
- serwer renderuje wszystkie szczegóły jako otwarte. Mały kontroler zamyka je
  wyłącznie poniżej 768 px, dzięki czemu desktop i tryb bez JavaScriptu
  zachowują pełną treść;
- mapa zaufania wykorzystuje na średnim mobile układ 2 + 1, a przy 320 px
  przechodzi w jedną kolumnę;
- kroki procesu, warstwy bezpieczeństwa i finalny overview stały się zwartymi
  rekordami, ale nadal pokazują właściciela, mechanizm i wynik etapu;
- nie usunięto copy, komunikatów bezpieczeństwa, danych demonstracyjnych ani
  granicy: serwer potwierdza wynik, a decyzja należy do firmy;
- desktop zachowuje pełny układ R3.1–R3.5 i nie korzysta ze zwiniętego wariantu.

## 2. Pomiary całej trasy

| Viewport | Dokument przed | Dokument po |            Zmiana | Overflow |
| -------: | -------------: | ----------: | ----------------: | -------: |
|  1440 px |        5223 px |     5272 px |            +49 px |     0 px |
|   768 px |        7910 px |     5070 px |          −2840 px |     0 px |
|   430 px |        8526 px |     5581 px |          −2945 px |     0 px |
|   390 px |        8704 px |     5573 px | −3131 px (−36,0%) |     0 px |
|   320 px |        9350 px |     5883 px | −3467 px (−37,1%) |     0 px |

Przy 390 px wynik 5573 px jest również o 125 px krótszy od historycznego R0
(5698 px). Tym samym spełniony jest warunek master planu: mobile jest wyraźnie
krótszy od baseline'u po R3.5 i nie przekracza długości pierwotnej trasy.

### Wysokości sekcji po kompresji

| Viewport | Hero + mapa | Kroki 1–3 | Kroki 4–6 | Bezpieczeństwo |    Finał |
| -------: | ----------: | --------: | --------: | -------------: | -------: |
|  1440 px |    903,5 px | 1092,7 px |  963,3 px |       873,1 px | 903,4 px |
|   768 px |    933,1 px |  862,8 px |  869,7 px |       890,8 px | 532,0 px |
|   430 px |    984,7 px |  902,5 px |  908,6 px |       967,9 px | 647,5 px |
|   390 px |   1010,3 px |  894,0 px |  900,1 px |       959,4 px | 638,7 px |
|   320 px |   1112,1 px |  939,6 px |  911,7 px |      1057,5 px | 665,4 px |

Desktop urósł o 49 px wyłącznie w modelu bezpieczeństwa przez semantyczną
warstwę `details`; nie zmieniło to hierarchii, liczby kolumn ani pełności
artefaktów.

## 3. Visual QA

Baseline, wynik, metryki oraz porównania zapisano w:

- `artifacts/visual-qa/marketing-subpages-v1/r3-c/before/`;
- `artifacts/visual-qa/marketing-subpages-v1/r3-c/after/`;
- `artifacts/visual-qa/marketing-subpages-v1/r3-c/jak-dziala-full-before-after-1440.png`;
- `artifacts/visual-qa/marketing-subpages-v1/r3-c/jak-dziala-full-before-after-390.png`.

Capture obejmuje 1440/768/430/390/320 px, pełne screenshoty 1440/390/320 px,
wysokość każdej sekcji, błędy runtime i overflow. Dodatkowy gate E2E obejmuje
pełną macierz 1536/1440/1280/1024/768/430/390/375/320 px.

### Ocena 19/20

| Kryterium               | Wynik | Uzasadnienie                                                                    |
| ----------------------- | ----: | ------------------------------------------------------------------------------- |
| Hierarchia i kompozycja |   4/4 | rezultat każdego etapu pozostaje widoczny bez otwierania szczegółów             |
| Geometria i rytm        |   4/4 | mobile krótszy o 36–37%, bez ściskania tekstu i poziomego overflow              |
| Typografia i kolor      |   4/4 | zachowane tokeny, kontrast oraz minimalny tekst 12 px                           |
| Responsive i dostępność |   4/4 | natywne `details`, klawiatura, axe, no-JS i dziewięć viewportów                 |
| Detale i spójność       |   3/4 | kontroler breakpointu resetuje stan przy zmianie szerokości; świadomy kompromis |

## 4. Testy i komendy

- dedykowany gate R3.1–R3.C: 60/60 PASS;
- pełny marketing R1–R3.C: 134/134 PASS;
- kontrolny pakiet obszarów regresji: 22/22 PASS;
- pełne `pnpm test`: PASS, w tym 85 testów web, unit, RLS i WordPress;
- `pnpm lint`: PASS, 8/8 pakietów;
- `pnpm typecheck`: PASS, 8/8 pakietów;
- `pnpm build`: PASS, 8/8 pakietów i 39 tras;
- widget JavaScript: 17 269 B gzip przy budżecie 92 160 B;
- capture `before` i `after`: HTTP 200, brak console/pageerror i overflow;
- interakcja w przeglądarce: podsumowanie otwiera się klawiaturą, a desktop
  pokazuje komplet artefaktów;
- scope'owany Prettier i `git diff --check`: PASS.

## 5. Wykryte i usunięte problemy

- samo zmniejszenie paddingów nie zamykało gate'u, ponieważ największy koszt
  tworzyły pełne artefakty powtarzane w trzynastu wysokich kartach;
- pierwsza wersja polegała na CSS dla zamkniętego `details`, co ukryło część
  desktopowych artefaktów. HTML jest teraz domyślnie otwarte, a stan jest
  synchronizowany jawnie z breakpointem;
- test starej mapy zaufania zakładał zawsze jedną kolumnę mobile; kontrakt
  zaktualizowano do zamierzonego układu 2 + 1 przy 368–768 px i jednej kolumny
  przy 320 px;
- no-JS ma osobny test potwierdzający wszystkie 13 otwartych szczegółów,
  komplet sześciu danych demonstracyjnych i brak overflow.

## 6. Ryzyka i granice

- skrócony wariant mobile wymaga JavaScriptu; bez niego strona pozostaje w
  pełni funkcjonalna i kompletna, ale świadomie dłuższa;
- zmiana szerokości przez breakpoint resetuje stan `details` do kontraktu
  danego layoutu zamiast zachowywać poprzedni wybór użytkownika;
- route-local CSS pozostaje do konsolidacji dopiero w R12;
- nie zmieniono API, danych, auth, tenant scope, RLS, pricingu, scoringu,
  uploadu, storage ani metadata SEO.

## 7. Następny dozwolony etap

Wyłącznie **R4.1 — hero `/cennik`**. R3.1–R3.C są zamknięte; kolejne sekcje
`/cennik` pozostają poza zakresem następnego mikroetapu.
