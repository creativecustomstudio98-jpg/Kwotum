# R5.4 — raport przebudowy izolacji widgetu `/dla-agencji`

**Data:** 2026-08-04
**Viewporty QA:** 320, 375, 390, 430, 768, 1024, 1280, 1440 i 1536 px
**Status:** READY FOR OWNER REVIEW
**Następny etap:** R5.5 pozostaje zamrożony do jawnej akceptacji R5.4

## Problem wyjściowy

Legacy’owy fragment ograniczał się do nagłówka i krótkiego akapitu o Shadow
DOM. Tworzył duży, pusty wizualnie blok, nie pokazywał działania izolacji i nie
przypominał ani zaakceptowanej strony głównej, ani panelu Kwotum. Czytelnik
musiał przyjąć deklarację produktu bez żadnego dowodu:

- nie było widocznej strony hosta ani agresywnych reguł globalnego CSS;
- brakowało granicy pomiędzy dokumentem klienta a wnętrzem widgetu;
- nie pokazano rzeczywistego elementu `<wyceno-widget>`;
- nie rozdzielono izolacji stylów od bezpieczeństwa danych i JavaScriptu;
- sekcja nie wyjaśniała małego loadera, własnego arkusza ani ograniczonego
  kontraktu zdarzeń;
- na desktopie i mobile nie istniał żaden produktowy artefakt, który
  uzasadniałby wysokość sekcji.

Baseline zachowano w
`artifacts/visual-qa/marketing-subpages-v1/r5-4/before/`.

## Zweryfikowane źródła prawdy

Przed zaprojektowaniem proofu sprawdzono `docs/WIDGET_ARCHITECTURE.md`,
`docs/WIDGET_IMPLEMENTATION.md`, `packages/widget/src/element.ts`,
`packages/widget/src/element.test.ts` i `tests/e2e/widget.spec.ts`. Sekcja
odzwierciedla bieżący kontrakt implementacji:

- widget jest natywnym custom elementem `<wyceno-widget>`;
- renderer używa otwartego Shadow DOM utworzonego przez
  `attachShadow({ mode: "open" })`;
- arkusz widgetu jest ładowany wewnątrz shadow root;
- loader jest modułem ES i nie wymaga Reacta ani panelu administracyjnego;
- obsługiwane są tryby inline, popup i fullscreen;
- istniejący test hosta narzuca globalnym przyciskom różowe tło, przezroczystość
  i obramowanie 1 px, a widget zachowuje własne style;
- host otrzymuje tylko zdarzenia techniczne; odpowiedzi, dane kontaktowe i token
  sesji nie są emitowane;
- Shadow DOM izoluje CSS, ale nie jest granicą bezpieczeństwa JavaScriptu;
- wejście tekstowe jest renderowane jako tekst, a test jednostkowy potwierdza,
  że payload XSS nie zostaje wykonany.

## Wykonana przebudowa

- utworzono osobny komponent `AgencyIsolation` i izolowany CSS Module;
- główny komunikat brzmi: „Motyw klienta zostaje na zewnątrz. Widget zachowuje
  własny interfejs”;
- ciemnozielona powierzchnia kontynuuje język zaakceptowanego home i panelu,
  ale pozostaje odrębnym proofem technicznym;
- lewa część proofu pokazuje stronę klienta z celowo agresywnymi regułami:
  serif dla wszystkiego, `background: hotpink` dla przycisków i brak promienia
  pól;
- środkowy rail nazywa granicę i prowadzi do właściwego shadow root;
- prawa część odtwarza realny język widgetu: nagłówek procesu, postęp, pytanie,
  warianty odpowiedzi, wybrany stan i stopkę jakości interfejsu;
- marker `<wyceno-widget>` oraz etykieta „Shadow root” pokazują mechanizm bez
  sugerowania pełnej izolacji bezpieczeństwa;
- dolny kontrakt wyjaśnia mały loader, własne style oraz wąski zakres zdarzeń;
- tryby inline, popup i fullscreen są podane jako zakres bieżącego produktu;
- proof nie zawiera przycisków, pól, linków ani innych atrap funkcji;
- zaakceptowane R5.1–R5.3 nie zostały zmienione.

## Kontrakt responsive

- powyżej 1088 px proof zachowuje jedną poziomą kompozycję: host → granica →
  Shadow DOM;
- przy 1024 i 768 px host i widget przechodzą do dwóch pełnoszerokich bloków,
  a rail zmienia się w pionową granicę;
- do 640 px nagłówek proofu, host, rail, widget i trzy zasady układają się w
  pojedynczą kolejność DOM;
- na mobile uproszczono geometrię przykładu, ale zachowano pełne pytanie,
  wszystkie opcje, wybrany stan i kontrakt izolacji;
- przy 320 px nie występuje poziomy overflow, host i shadow root mają co
  najmniej 266,81 px szerokości, a najmniejszy widoczny tekst ma 12 px;
- celowo zdeformowany przykład przycisku hosta jest dekoracyjny, ukryty przed
  technologiami asystującymi i nie bierze udziału w pomiarze czytelnego tekstu.

## Pomiary produkcyjne

| Viewport |  Sekcja |   Proof | Host szer. / wys. | Shadow szer. / wys. | Widget wys. | Kontrakt wys. | Min. tekst | Overflow | Błędy |
| -------: | ------: | ------: | ----------------: | ------------------: | ----------: | ------------: | ---------: | -------: | ----: |
|  1536 px | 1506,36 |  850,22 |   456,94 / 569,00 |     812,36 / 569,00 |      479,97 |        116,19 |      12 px |     0 px |     0 |
|  1440 px | 1457,72 |  840,56 |   426,81 / 564,31 |     758,81 / 564,31 |      475,28 |        116,19 |      12 px |     0 px |     0 |
|  1280 px | 1373,41 |  821,16 |   376,63 / 553,25 |     669,59 / 553,25 |      464,22 |        116,19 |      12 px |     0 px |     0 |
|  1024 px | 1709,61 | 1249,14 |   890,33 / 398,27 |     890,33 / 529,09 |      440,06 |        116,19 |      12 px |     0 px |     0 |
|   768 px | 2020,95 | 1404,80 |   694,00 / 382,89 |     694,00 / 515,66 |      426,63 |        268,08 |      12 px |     0 px |     0 |
|   430 px | 2352,00 | 1737,28 |   368,81 / 463,41 |     368,81 / 726,44 |      614,83 |        322,08 |      12 px |     0 px |     0 |
|   390 px | 2360,38 | 1737,28 |   328,81 / 463,41 |     328,81 / 726,44 |      614,83 |        322,08 |      12 px |     0 px |     0 |
|   375 px | 2372,09 | 1756,00 |   313,81 / 463,41 |     313,81 / 745,16 |      633,55 |        322,08 |      12 px |     0 px |     0 |
|   320 px | 2406,78 | 1813,25 |   266,81 / 499,75 |     266,81 / 745,16 |      633,55 |        322,08 |      12 px |     0 px |     0 |

Wszystkie pomiary pochodzą z produkcyjnego buildu, mają HTTP 200, zerowy
poziomy overflow oraz pustą listę błędów konsoli i `pageerror`.

## Visual QA

- wewnętrzna ocena wykonawcza: **20/20**;
- kompletność 4/4, geometria 4/4, typografia 4/4, zgodność z UI 4/4, mobile
  4/4;
- finalne rendery i metryki:
  `artifacts/visual-qa/marketing-subpages-v1/r5-4/after/`;
- porównania przed/po:
  `artifacts/visual-qa/marketing-subpages-v1/r5-4/compare/`;
- szczegółowy diff:
  `artifacts/visual-qa/marketing-subpages-v1/r5-4/diff.md`.

## Gate techniczny

- dedykowany Playwright R5.4: 11/11 PASS;
- finalna regresja R5.1 + R5.2 + R5.3 + R5.4 + shell + home: 86/86 PASS;
- rzeczywisty test widgetu z agresywnym CSS hosta i powrotem focusu: 1/1 PASS;
- testy jednostkowe: 177/177 PASS;
- testy izolacji RLS i wszystkich migracji: PASS;
- WordPress: PASS dla WP 6.9.2 i 7.0.2 na PHP 8.5.2;
- lint: 8/8 pakietów PASS;
- typecheck: 8/8 pakietów PASS;
- build: 8/8 pakietów PASS, 40 wygenerowanych stron;
- widget: 18 912 B gzip przy limicie 92 160 B;
- axe WCAG 2.2 AA, klawiatura, reduced motion i forced colors: PASS.

Pierwszy pełny przebieg regresji zakończył się wynikiem 85/86, ponieważ test
R5.3 nadal oczekiwał usuniętego nagłówka legacy należącego do R5.4. Asercję
zaktualizowano do nowej granicy sekcji bez zmiany timeoutu ani obniżenia
rygoru. Powtórzony pojedynczy przypadek przeszedł 1/1, a finalna pełna regresja
w jednym czystym przebiegu przeszła 86/86.

Pełny gate RLS wykonano na jednoznacznie nazwanej tymczasowej bazie
`wyceno_rls_codex_r54`. Po potwierdzeniu braku aktywnych sesji baza została
usunięta; nie zawierała danych użytkownika.

## Ryzyka i granice decyzji

- proof jest statyczną ilustracją marketingową, ale jego treść i geometria
  wynikają z prawdziwego renderera oraz istniejących testów widgetu;
- każda zmiana kontraktu loadera, zdarzeń albo Shadow DOM wymaga aktualizacji
  sekcji oraz testu R5.4;
- Shadow DOM jest granicą CSS, a nie zabezpieczeniem przed kodem JavaScript
  uruchomionym przez właściciela strony hosta;
- otwarty shadow root jest zgodny z bieżącą implementacją i nie powinien być
  przedstawiany jako mechanizm ukrywania danych;
- R5.5 nadal używa legacy’owego finału i pozostaje zamrożony do decyzji
  właściciela;
- R5.1–R5.3 pozostają zaakceptowane i zamrożone.

## Kryteria odbioru właściciela

1. proof wygląda jak część tego samego produktu co panel i zaakceptowane
   sekcje strony głównej;
2. różnica pomiędzy agresywnym CSS hosta a własnym interfejsem widgetu jest
   czytelna bez znajomości Shadow DOM;
3. sekcja nie sugeruje white-label, delegacji ani pełnej izolacji
   bezpieczeństwa poza MVP;
4. desktop ma jedną mocną kompozycję techniczną, a mobile zachowuje pełną
   historię bez ścisku i overflow;
5. po akceptacji można przejść wyłącznie do R5.5 — finalnego CTA
   `/dla-agencji`.

## Decyzja właściciela

Oczekuje na jawną akceptację finalnego renderu R5.4. Do tego czasu etap ma
status `READY FOR OWNER REVIEW`, a R5.5 pozostaje zamrożony.
