# R3.3 — kroki 4–6 `/jak-dziala`

**Data:** 2026-08-02
**Status:** PASS; implementacja zatrzymana przed R3.4
**Zakres:** wyłącznie sekcja `#proces-dalszy`

## 1. Wykonane zmiany

- trzy płaskie wiersze zastąpił jeden nazwany region outcome flow:
  potwierdzenie wyniku → świadome przekazanie kontaktu → decyzja firmy;
- semantykę trzech konkurujących H2 zastąpił jeden H2 regionu i trzy H3
  etapów;
- ciemny panel decyzji odróżnia drugą połowę procesu od przygotowania i sesji
  R3.2, ale zachowuje język wizualny home V7;
- każdy etap pokazuje właściciela, mechanizm, code-native artefakt i rezultat;
- wynik klienta jest jawnie orientacyjny, a prywatny score pozostaje w panelu;
- krok kontaktowy rozdziela minimalny kontakt, opcjonalne pliki i wersjonowane
  potwierdzenie informacji prywatności;
- ostatni krok pokazuje status, następne działanie i agregowany pomiar bez
  wymyślonych KPI;
- wszystkie liczby i rekordy przykładowe mają widoczną etykietę „Dane
  przykładowe”;
- desktop używa lewego raila tezy oraz trzech równych rekordów po prawej;
- poniżej 1152 px intro przechodzi nad sekwencję, a mobile używa pełnej osi
  pionowej bez zmiany kolejności DOM;
- sekcja bezpieczeństwa i finalne CTA pozostały bez redesignu do R3.4–R3.5.

## 2. Pomiary

| Viewport | Sekcja przed | Sekcja po | Karty po                             | Overflow |
| -------: | -----------: | --------: | ------------------------------------ | -------: |
|  1440 px |     949,7 px |  963,3 px | 3 × 811,1 × 242,9 px, równa wysokość |     0 px |
|   430 px |    1211,7 px | 1616,6 px | 398 × 346,4 px, równa wysokość       |     0 px |
|   390 px |    1279,9 px | 1655,2 px | 358 × 365,1 px, równa wysokość       |     0 px |
|   320 px |    1425,6 px | 1788,8 px | 296 × 413,0 px, równa wysokość       |     0 px |

Na desktopie pełny proof zwiększa sekcję tylko o 13,6 px. Mobile jest wyższy
od lakonicznego baseline'u o 363–405 px, ponieważ nie ukrywa opisu,
odpowiedzialności, artefaktu ani rezultatu. Limit 1850 px dla 375–430 px i
2100 px dla 320 px pozostaje zamknięty. Dalszą ocenę długości całej trasy należy
wykonać po R3.4–R3.5, a nie przez usuwanie potrzebnego kontekstu z R3.3.

## 3. Visual QA

Baseline, wynik, metryki i porównania zapisano w:

- `artifacts/visual-qa/marketing-subpages-v1/r3-3/before/`;
- `artifacts/visual-qa/marketing-subpages-v1/r3-3/after/`;
- `artifacts/visual-qa/marketing-subpages-v1/r3-3/jak-dziala-steps-4-6-before-after-1440.png`;
- `artifacts/visual-qa/marketing-subpages-v1/r3-3/jak-dziala-steps-4-6-before-after-390.png`.

Brak osobnej referencji rastrowej tej podstrony. Odbiór opiera się na
side-by-side, języku home V7, kontrakcie archetypu procesu, dziewięciu
viewportach i bezpośredniej inspekcji DOM w przeglądarce. Finalny capture usuwa
wyłącznie techniczną nakładkę skip linku z DOM screenshotu; działający skip
link pozostaje niezmieniony w runtime i jest objęty testami shellu.

### Ocena 19/20

| Kryterium               | Wynik | Uzasadnienie                                                          |
| ----------------------- | ----: | --------------------------------------------------------------------- |
| Hierarchia i kompozycja |   4/4 | jedna teza i trzy czytelne rezultaty zamiast anonimowych wierszy      |
| Geometria i rytm        |   4/4 | prawie niezmieniona wysokość desktopu i równe rekordy                 |
| Typografia i kolor      |   4/4 | mocny kontrast drugiej połowy procesu i spokojne artefakty            |
| Responsive i dostępność |   4/4 | dziewięć viewportów, axe, forced colors, minimum 12 px, zero overflow |
| Detale i spójność       |   3/4 | całkowita długość trasy zależy jeszcze od R3.4–R3.5                   |

## 4. Testy i komendy

- dedykowany R3.1–R3.3: 27/27 PASS;
- pełny marketing R1–R3.3: 101/101 PASS;
- pełne `pnpm test`: PASS, w tym unit, RLS i WordPress;
- `pnpm lint`: PASS, 8/8 pakietów;
- `pnpm typecheck`: PASS, 8/8 pakietów;
- `pnpm build`: PASS, 8/8 pakietów i 39 tras;
- widget JavaScript: 17 269 B gzip przy budżecie 92 160 B;
- capture `before` i `after`: HTTP 200, brak console/pageerror i overflow;
- scope'owany Prettier i `git diff --check`: PASS.

Gate obejmuje 1536/1440/1280/1024/768/430/390/375/320 px, trzy równe rekordy,
poprawną kolejność DOM, trzy odpowiedzialności i rezultaty, jawne dane
demonstracyjne, niewiążący wynik, prywatny score, tekst minimum 12 px, normalny
axe, axe w forced colors i brak poziomego overflow.

## 5. Wykryte i usunięte problemy

- baseline nie miał nazwanego regionu i używał trzech H2 bez wspólnej tezy;
  nowa hierarchia jest jednoznaczna także w snapshotcie dostępności;
- pierwsza nawigacja w podglądzie przeglądarkowym zwróciła cache poprzedniego
  dokumentu; kontrola otrzymała jednoznaczny parametr QA i potwierdziła aktualny
  build;
- natywny element screenshot aktywował skip link i zasłaniał część mobile;
  skrypt QA usuwa go wyłącznie z kopii DOM używanej do obrazu, bez zmiany
  runtime;
- trzy artefakty miały różną naturalną zawartość; `grid-auto-rows` wyrównał
  karty na wszystkich badanych szerokościach.

## 6. Ryzyka i granice

- publiczny rezultat nie ujawnia prywatnego score ani powodów scoringu;
- wynik jest opisany jako orientacyjny i nie jest ofertą ani decyzją firmy;
- nie zmieniono pricingu, scoringu, submitu, powiadomień, analityki, API, RLS,
  tenant scope, danych ani metadata SEO;
- nie dodano AI, automatycznej decyzji, gwarantowanej dostawy ani nowych KPI;
- bezpieczeństwo procesu pozostaje poza zakresem do R3.4;
- finalne CTA pozostaje poza zakresem do R3.5;
- route-local CSS pozostaje do globalnego cleanupu w R12.

## 7. Następny dozwolony etap

Wyłącznie **R3.4 — bezpieczeństwo procesu `/jak-dziala`**. Finalne CTA i
overview pozostają poza zakresem do R3.5.
