# R3.4 — bezpieczeństwo procesu `/jak-dziala`

**Data:** 2026-08-02
**Status:** PASS; implementacja zatrzymana przed R3.5
**Zakres:** wyłącznie sekcja `#bezpieczenstwo`

## 1. Wykonane zmiany

- płaską listę trzech haseł zastąpił nazwany region opisujący model ochrony
  warstwowej;
- lewa kolumna przedstawia tezę i zasadę „ukrycie kontrolki w przeglądarce nie
  jest autoryzacją”;
- prawa plansza pokazuje trzy faktyczne bariery w kolejności:
  autoryzacja i jawny tenant scope → wymuszone RLS w PostgreSQL → walidacja
  pliku i prywatny storage;
- każda warstwa ma miejsce egzekwowania, mechanizm kontroli i widoczny rezultat;
- osobny rail publicznej granicy przypomina, że manifest widgetu nie ujawnia
  pricingu, scoringu, tenant ID ani danych innych sesji;
- copy nie dodaje certyfikatów, gwarancji bezpieczeństwa, szyfrowania ani funkcji
  niepotwierdzonych w dokumentacji produktu;
- desktop używa dwukolumnowej kompozycji i stopniowanych kart ochrony;
- poniżej 1152 px intro przechodzi nad planszę, a mobile zachowuje tę samą
  kolejność DOM w jednej osi;
- finalny `CtaBand` pozostał nietknięty do osobnego etapu R3.5.

## 2. Pomiary

| Viewport | Sekcja przed | Sekcja po | Warstwy po                       | Overflow |
| -------: | -----------: | --------: | -------------------------------- | -------: |
|  1440 px |     644,5 px |  824,1 px | 755,7 / 733,3 / 710,9 × 129,2 px |     0 px |
|   430 px |     741,7 px | 1334,5 px | 3 × 373,6 × 200,7 px             |     0 px |
|   390 px |     791,3 px | 1398,7 px | 3 × 333,6 × 219,6 px             |     0 px |
|   320 px |     855,0 px | 1622,1 px | 3 × 271,6 × 271,5 px             |     0 px |

Nowa sekcja jest wyższa od lakonicznego baseline'u, ponieważ nie łączy już
tenant scope z RLS w jednym skrócie i jawnie pokazuje miejsce egzekwowania,
kontrolę oraz rezultat każdej bariery. Limity 1650 px dla 375–430 px oraz
1850 px dla 320 px pozostają zamknięte. Całkowitą długość trasy należy ocenić
po domknięciu finału R3.5.

## 3. Visual QA

Baseline, wynik, metryki i porównania zapisano w:

- `artifacts/visual-qa/marketing-subpages-v1/r3-4/before/`;
- `artifacts/visual-qa/marketing-subpages-v1/r3-4/after/`;
- `artifacts/visual-qa/marketing-subpages-v1/r3-4/jak-dziala-security-before-after-1440.png`;
- `artifacts/visual-qa/marketing-subpages-v1/r3-4/jak-dziala-security-before-after-390.png`.

Brak osobnej referencji rastrowej tej podstrony. Odbiór opiera się na
side-by-side, języku home V7, kontrakcie archetypu procesu, dziewięciu
viewportach oraz bezpośrednim snapshotcie dostępności z przeglądarki. Capture
usuwa wyłącznie techniczną nakładkę skip linku z kopii DOM screenshotu; sam
skip link pozostaje w runtime i w testach shellu.

### Ocena 19/20

| Kryterium               | Wynik | Uzasadnienie                                                          |
| ----------------------- | ----: | --------------------------------------------------------------------- |
| Hierarchia i kompozycja |   4/4 | teza, zasada i trzy kolejne bariery tworzą jeden model                |
| Geometria i rytm        |   4/4 | stopniowanie desktopu i stabilna pionowa sekwencja mobile             |
| Typografia i kolor      |   4/4 | spokojna plansza ochrony, czytelne akcenty i kontrast WCAG AA         |
| Responsive i dostępność |   4/4 | dziewięć viewportów, axe, forced colors, minimum 12 px, zero overflow |
| Detale i spójność       |   3/4 | finalna ocena długości trasy zależy jeszcze od R3.5                   |

## 4. Testy i komendy

- dedykowany R3.1–R3.4: 38/38 PASS;
- pełny marketing R1–R3.4: 112/112 PASS;
- pełne `pnpm test`: PASS, w tym 85 testów web, unit, RLS i WordPress;
- `pnpm lint`: PASS, 8/8 pakietów;
- `pnpm typecheck`: PASS, 8/8 pakietów;
- `pnpm build`: PASS, 8/8 pakietów i 39 tras;
- widget JavaScript: 17 269 B gzip przy budżecie 92 160 B;
- capture `before` i `after`: HTTP 200, brak console/pageerror i overflow;
- scope'owany Prettier i `git diff --check`: PASS.

Gate obejmuje 1536/1440/1280/1024/768/430/390/375/320 px, nazwaną sekcję,
trzy warstwy, poprawną kolejność DOM, mechanizm i rezultat każdej kontroli,
publiczną granicę manifestu, prawdziwość copy, tekst minimum 12 px, normalny
axe, axe w forced colors i brak poziomego overflow.

## 5. Wykryte i usunięte problemy

- baseline mieszał tenant scope i RLS w jednym wierszu, przez co nie pokazywał
  niezależności serwera oraz bazy; nowy model rozdziela te kontrole;
- pierwsza iteracja małych etykiet „Kontrola” i „Efekt” na trzeciej warstwie
  miała kontrast 4,41:1; kolor przyciemniono i ponowny axe przeszedł bez
  naruszeń;
- selektor testowy traktował wspólny finalny CTA jak nazwany region, chociaż
  komponent nie ma tej semantyki; test został zawężony do istniejącego
  kontenera bez zmiany CTA w etapie R3.4;
- bezpośredni snapshot przeglądarki potwierdził jeden H2 sekcji, planszę H3 i
  trzy H3 warstw oraz poprawne `dl` dla mechanizmów kontroli.

## 6. Ryzyka i granice

- sekcja opisuje mechanizmy wdrożone, a nie absolutne bezpieczeństwo;
- walidacja rozszerzenia, MIME i magic bytes nie jest opisana jako skaner
  malware ani gwarancja bezpieczeństwa pliku;
- nie dodano certyfikatów, nowych KPI, AI, szyfrowania ani publicznych obietnic
  wykraczających poza źródła prawdy;
- nie zmieniono autoryzacji, RLS, tenant scope, uploadu, storage, API, danych,
  pricingu, scoringu ani metadata SEO;
- finalne CTA i overview pozostają poza zakresem do R3.5;
- route-local CSS pozostaje do globalnego cleanupu w R12.

## 7. Następny dozwolony etap

Wyłącznie **R3.5 — finalne CTA i overview `/jak-dziala`**. Wszystkie wcześniejsze
sekcje R3.1–R3.4 są zamknięte.
