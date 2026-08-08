# Landing desktop V7 — audyt i blokada referencji D0

**Status:** kanoniczny dla następnej rekonstrukcji desktopowego `/`
**Data:** 2026-08-01
**Zakres:** dokumentacja i baseline; bez zmian TSX/CSS i bez cleanupu

## Decyzja

Osiem obrazów przekazanych przez właściciela 2026-08-01 zastępuje starszą
geometrię desktopowego landingu w pokazanych regionach. Siedem poziomych
obrazów 1672 × 941 px jest podstawą pomiarów sekcyjnych. Pionowy obraz
941 × 1672 px jest planszą kompozycyjną: ustala kolejność i relacje, ale nie
jest pełnostronicowym screenshotem w skali 1:1.

Obrazy są źródłem geometrii, gęstości i języka wizualnego. Nie zatwierdzają
funkcji, integracji, cen, klientów, statystyk, SLA ani danych kontaktowych,
których nie ma w kanonicznym zakresie produktu.

## Inwentarz zablokowanych plików

| ID    | Plik                               |    Rozmiar | SHA-256                                                            | Zakres                                                  |
| ----- | ---------------------------------- | ---------: | ------------------------------------------------------------------ | ------------------------------------------------------- |
| V7-01 | `reference/01-hero.png`            | 1672 × 941 | `7113a8acc45f48e7488bb39fe1f9f4bd2933137c845e429ed4bdb7664adf41df` | header, hero, proces klienta, lead, pasek dowodu        |
| V7-02 | `reference/02-process.png`         | 1672 × 941 | `e7ce0ef29bd71eb4246aa68e3efec06f0f82a47acdfc28a6f57387206962d025` | trzy kroki procesu                                      |
| V7-03 | `reference/03-key-information.png` | 1672 × 941 | `f659ff69af90114cab05774f95dd1a8f7432c4cb4d75cddabbd4b7e3b776ff27` | cztery grupy danych                                     |
| V7-04 | `reference/04-integrations.png`    | 1672 × 941 | `8c89d943581eac353cd699ebf5d2a7b1388ec3b8f7bbbf42c4d70226460301ed` | integracje i automatyzacje                              |
| V7-05 | `reference/05-pricing.png`         | 1672 × 941 | `9b0d2e08274cee4622d2dbbbbe26cf1da781f331e00431ba22355f82b709c1fc` | geometria dwóch planów                                  |
| V7-06 | `reference/06-faq.png`             | 1672 × 941 | `ba3ecf0284c557b21363270658f4ecb2f6bd780be20cf2ed62549ae10918abc0` | FAQ i panel pomocy                                      |
| V7-07 | `reference/07-final-cta.png`       | 1672 × 941 | `da0587ba1ecc2694186ad84ef9f5aaf52f5101f944f273cf5cfadf5afcc95282` | końcowe CTA i proof                                     |
| V7-08 | `reference/08-full-overview.png`   | 941 × 1672 | `8ddaca5adef25e9205910c93816fc7501668b397f14e34411bb94f3780edace6` | kolejność strony, przykładowy lead, połączenie regionów |

Kopie w repozytorium są binarnie identyczne z oryginałami przekazanymi z
`/Users/nexora/Downloads/`. Nie zostały przeskalowane, skompresowane ani
wyostrzone.

## Mapa referencja → region → planowany komponent → test

| Referencja | Region `/`                     | Planowany właściciel kodu                                    | Dowód D1–D5                                                    |
| ---------- | ------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------------- |
| V7-01      | header + hero + pasek pod hero | `marketing-header.tsx`, przepisany `home-redesign.tsx` i CSS | screenshot/overlay 1672 × 941, działające linki, axe           |
| V7-02      | trzy kroki procesu             | `home-redesign.tsx`                                          | screenshot/overlay 1672 × 941, kolejność 1–3                   |
| V7-03      | budżet, termin, pliki, wynik   | `home-redesign.tsx`                                          | screenshot/overlay 1672 × 941, semantyczne dane demo           |
| V7-08      | pełny przykładowy lead         | code-native komponent leada w `home-redesign.tsx`            | review kompozycyjne; brak samodzielnego pixel-perfect PASS     |
| V7-04      | kanały przekazania leada       | `home-redesign.tsx`                                          | screenshot/overlay 1672 × 941, tylko realne kanały             |
| V7-05      | dwa warianty rozpoczęcia       | `home-redesign.tsx`                                          | screenshot/overlay 1672 × 941, brak niezatwierdzonych kwot     |
| V7-06      | FAQ + pomoc                    | `home-redesign.tsx` lub istniejący `Faq`                     | screenshot/overlay 1672 × 941, klawiatura, `details`/`summary` |
| V7-07      | końcowe CTA                    | `home-redesign.tsx`                                          | screenshot/overlay 1672 × 941, działające CTA                  |
| V7-08      | footer i kolejność globalna    | istniejący `MarketingFooter` + styl home                     | pełny screenshot i kontrola kolejności                         |

## Rozpoznane DNA wizualne

- bardzo jasne, chłodne tło z delikatnym niebiesko-zielonym zabarwieniem;
- niemal granatowy tekst, wyraźnie ciemniejszy od obecnego ciepłego systemu;
- nasycona zieleń dla CTA i aktywnych stanów;
- szeroki kontener około 1540 px przy viewportcie 1672 px;
- sekcje projektowane jak osobne pełne viewporty, zwykle 800–940 px wysokości;
- duże, centralne nagłówki i spokojny body text;
- powierzchnie białe z cienką chłodną linią, promieniem około 16–24 px i
  bardzo miękkim cieniem;
- code-native UI produktu z wysoką gęstością, ale bez ciemnego raila;
- liniowe zielone ikony na jasnych zielonych kwadratach lub kołach;
- subtelny pattern kropek i bardzo lekkie plamy tła, bez ciężkiego gradientu;
- dużo światła i równe osie, ale nie generyczna siatka kart w każdym regionie.

Nowa paleta różni się od obecnych tokenów `packages/ui`. D1 nie może tworzyć
anonimowych lokalnych wyjątków. Dozwolona rekomendacja to dodanie nazwanych,
przetestowanych ról marketingowych w `packages/ui`, bez zmiany istniejących
tokenów panelu. Wymaga to kontroli kontrastu i diffu innych tras.

## Konflikty obrazu z kanonicznym produktem

| Element obrazu                                                                   | Konflikt                                            | Wiążąca decyzja implementacyjna                                                                                                |
| -------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| logotypy „meble+”, ProRemont, łazienka.pl, dobre okna, instalPRO, zielone ogrody | brak potwierdzonych klientów i praw do social proof | zachować wysokość oraz rytm paska, ale użyć uczciwych capabilities albo potwierdzonych partnerów dopiero po dostarczeniu zgody |
| „249 zł”, „549 zł”, limity planów i fakturowanie roczne                          | pricing i płatności nie są zatwierdzone             | zachować dwukolumnową geometrię; copy: wariant pilotażowy / zakres indywidualny, bez kwot                                      |
| „14 dni na testy”, „bez karty płatniczej”                                        | trial i płatności są poza MVP                       | zastąpić prawdziwymi warunkami pilotażu, bez obietnicy trialu                                                                  |
| natywny CRM i Arkusze Google                                                     | natywne CRM-y/Sheets są poza MVP                    | użyć faktycznych kanałów: e-mail, webhook, WordPress oraz hosted link/osadzenie                                                |
| „98% satysfakcji”, „< 2h”, „128 leadów”, „+20%”, „+15%”                          | brak danych terenowych i zatwierdzonego SLA         | zastąpić rzeczywistymi cechami procesu albo jawnie opisanym statycznym demo bez twierdzenia biznesowego                        |
| `pomoc@lorum.pl` i numer telefonu                                                | brak potwierdzonego kanału kontaktu                 | linkować wyłącznie do istniejących tras i potwierdzonego kontaktu; do tego czasu panel pomocy nie pokazuje fikcyjnych danych   |
| „algorytm uzupełnia brakujące dane”                                              | produkt nie tworzy danych za klienta                | copy: waliduje kompletność, porządkuje odpowiedzi i wylicza reguły serwerowo                                                   |
| Jan Nowak, telefon, e-mail i identyfikator                                       | dane syntetyczne wyglądają jak PII                  | oznaczyć cały proof jako „dane demonstracyjne” i używać jednego, konsekwentnego fixture'u                                      |
| linki „O nas” i „Zasoby”                                                         | brak odpowiadających tras/menu                      | użyć istniejących tras albo realnego, dostępnego menu; brak martwych pozycji                                                   |

## Luki referencyjne

1. Brak osobnego kadru przykładowego leada 1672 × 941. Jest widoczny tylko w
   V7-08 w pomniejszonej skali. Region może otrzymać PASS kompozycyjny, ale nie
   uczciwy pixel-perfect PASS.
2. Brak osobnego kadru stopki. V7-08 określa jedynie jej pozycję; szczegóły
   zachowuje istniejący, funkcjonalny footer.
3. Brak stanów rozwiniętego FAQ, hover, focus, error, loading, no-JS i forced
   colors. Zachowanie pochodzi z testów i WCAG, nie z domysłów wizualnych.
4. Brak mobile i tabletu. Bieżący program projektuje desktop; mobile ma tylko
   smoke regresyjny.
5. Brak źródłowych fotografii kuchni i znaków logotypów. UI produktu powstaje
   jako kod, a fotografie mogą wykorzystać wyłącznie licencjonowane istniejące
   assety.
6. V7-08 nie zawiera sekcji integracji V7-04. Ustalona kolejność robocza to:
   lead → integracje → rozpoczęcie współpracy → FAQ/CTA.

## Baseline bieżącej implementacji

- aktywna trasa: `apps/web/app/(marketing)/page.tsx`;
- aktywny landing: `HomeRedesign` + `home-redesign.module.css`;
- aktywna interakcja: `HomeInteractiveDemo`;
- wspólne elementy: `MarketingHeader`, `MarketingFooter`, `marketing.css`;
- aktualna pełna wysokość przy szerokości 1672 px: 6298 px;
- baseline viewport:
  `artifacts/visual-qa/landing-desktop-v7/d0/before-1672x941.png`;
- baseline pełny:
  `artifacts/visual-qa/landing-desktop-v7/d0/before-full-1672.png`;
- test marketingowy produkcyjnego builda: **21/21 PASS**.

Obecny landing ma sześć regionów, ciepłe beżowe tło, hero z rasterem telefonu,
duży interaktywny canvas, ciemny blok decyzji, publikację i pilotaż. Nowe obrazy
mają chłodniejszy system, dashboard + proces w hero, trzy kroki, cztery grupy
danych, osobny lead, integracje, dwukolumnowy start, FAQ i końcowe CTA.

## Klasyfikacja kodu i assetów

| Plik                                           | Klasyfikacja              | Dowód / decyzja                                                                           |
| ---------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------- |
| `page.tsx`                                     | KEEP                      | metadata, JSON-LD i punkt montowania `/` są aktywne                                       |
| `marketing-header.tsx`                         | REWRITE PARTIAL           | zachować focus trap i mobile; home navigation/akcje/geometria wymagają V7                 |
| `components.tsx`                               | KEEP / REWRITE PARTIAL    | footer jest wspólny; home-only styl może wymagać korekty                                  |
| `home-redesign.tsx`                            | REWRITE                   | jedyny aktywny właściciel kompozycji home                                                 |
| `home-redesign.module.css`                     | REWRITE                   | 2140 linii i historyczne override'y; nie jest ekonomicznie bezpieczne dalsze nadpisywanie |
| `home-interactive-demo.tsx` + CSS              | KEEP UNTIL D2             | działająca, testowana funkcja; obraz nie daje zgody na jej ciche usunięcie                |
| `home-motion.tsx`                              | KEEP / SIMPLIFY           | progressive enhancement działa; ruch nie może sterować kompozycją                         |
| `home-conversion.tsx` + CSS                    | REMOVE CANDIDATE          | brak importu z aktywnego drzewa; importuje tylko własny legacy łańcuch                    |
| `home-industry-templates.tsx` + CSS            | REMOVE CANDIDATE          | używany wyłącznie przez martwy `home-conversion.tsx`                                      |
| `home-proof.tsx` + `home-reference.module.css` | REMOVE CANDIDATE          | brak aktywnego importu; 4914 linii legacy CSS                                             |
| `home-reference-overview.tsx` + CSS            | REMOVE CANDIDATE          | brak aktywnego importu                                                                    |
| dwa `lorum-hero-phone-*-v4.webp`               | REMOVE AFTER D1 CANDIDATE | aktywne wyłącznie przez obecne hero; nie usuwać przed podmianą i buildem                  |
| `hero-kitchen-diptych-v1.webp`                 | KEEP FOR REVIEW           | może zasilić referencyjny proof leada; obecnie używany przez legacy CSS                   |
| `industry-template-sprite-v1.webp`             | KEEP                      | używany również przez panel, poza zakresem cleanupu home                                  |
| `anna-kowalska-avatar-v1.webp`                 | KEEP                      | używany przez panel i szczegóły leada                                                     |

W D0 niczego nie usunięto. Każdy `REMOVE CANDIDATE` wymaga ponownego `rg`,
diff review, lint, typecheck, testów i builda po podmianie aktywnego landingu.

## Ryzyka D1

1. Wspólny header obsługuje wszystkie strony marketingowe; zmiana musi być
   home-only i sprawdzona na `/produkt` oraz mobile.
2. Hero V7 wygląda jak statyczny mockup. Produkcja ma zachować semantykę,
   czytelność i działające CTA; elementy pozorujące kontrolki nie mogą być
   martwe.
3. Nowa paleta nie odpowiada istniejącym tokenom. Najpierw nazwane role i test
   kontrastu, potem CSS.
4. Wysoka zgodność wymaga usunięcia rastra telefonu, ale dopiero po działającym
   code-native hero i potwierdzeniu braku importów.
5. Nowe obrazy zawierają niezatwierdzone obietnice. Geometria jest wiążąca,
   copy i funkcje podlegają scope/security.
6. D1 nie może rozpocząć mobile ani zmieniać panelu.

## Następny dozwolony etap

`D1 — hero`: home-only header, hero code-native i neutralny pasek dowodu według
V7-01, dwa passy visual QA 1672 × 941, kontrola regresji innych tras i STOP.

```text
STOP — D0 ZAKOŃCZONY. DESKTOP REFERENCES LOCKED. NIE WYKONANO IMPLEMENTACJI ANI CLEANUPU.
```
