# Kwotum — master plan rebrandingu podstron V1

**Status:** R5.1–R5.3 `/dla-agencji` zaakceptowane; R5.4 gotowe do odbioru właściciela; R5.5 i R7 zamrożone; R4.I.2–R4.I.4 wstrzymane
**Właściciel zakresu:** dyspozycje użytkownika z 2026-08-02 i 2026-08-03
**Poprzedni aktywny etap:** landing mobile M3 ukończony; M4 wstrzymany

## 1. Prompt wykonawczy

> Działaj jako principal product designer i senior frontend engineer dla
> Kwotum. Projektuj każdą publiczną podstronę jako część jednego systemu marki
> zgodnego z zaakceptowaną stroną główną, ale nie kopiuj mechanicznie jej
> sekcji. Najpierw ustal tezę strony, dominujący proof, kolejność decyzji
> użytkownika i kontrakt responsive. Pracuj jedną trasą i jedną sekcją naraz.
> Każdą zmianę porównuj z dokładnym baseline'em na desktopie i mobile.
> Zachowuj prawdziwą treść, bezpieczeństwo, dostępność i działające CTA. Nie
> wymyślaj cen, klientów, KPI, integracji ani funkcji. Nie rozpoczynaj następnej
> sekcji przed zamknięciem visual QA i gate'u obecnej.

## 2. Cel programu

Ujednolicić 19 istniejących publicznych podstron z marką Kwotum i jakością
home V7 oraz domknąć ujawnioną lukę IA przez osobną trasę `/integracje`, bez:

- regresji działających tras i SEO;
- rozszerzania zakresu produktu;
- przepisywania logiki aplikacji;
- jednego masowego patcha CSS;
- utraty indywidualnego charakteru stron produktowych, branżowych, funkcyjnych
  i prawnych.

## 3. Jednostka pracy

Minimalna jednostka to **jedna sekcja jednej trasy**. Wyjątkiem jest R1, który
buduje wyłącznie wspólny shell i prymitywy bez redesignu treści stron.

Po każdej jednostce:

1. render desktop 1440 × 1000;
2. render mobile 390 × 844;
3. pomiar 320/375/390/430/768/1024/1280/1440/1536;
4. overlay albo side-by-side;
5. visual score minimum 18/20;
6. testy funkcjonalne, dostępność i prawdziwość copy;
7. raport i STOP.

## 4. Etapy

### R0 — audyt i zamrożenie baseline'u — **COMPLETE**

- [x] zinwentaryzować 19 tras i 10 archetypów;
- [x] wykonać 38 renderów desktop/mobile;
- [x] zebrać metryki sekcji, wysokości, overflow i błędów;
- [x] zapisać plan każdej strony i sekcji;
- [x] zdefiniować architekturę wizualną i gate.

**Gate:** HTTP 200 38/38, errors 0, overflow 0, artefakty i dokumentacja są
zapisane.

### R1 — wspólny shell podstron — **COMPLETE**

Zakres wyłącznie:

1. header podstron zgodny z marką Kwotum i geometrią home;
2. kontener, paper background i wspólne focus states;
3. breadcrumbs;
4. `SectionHeading` i podstawowe warianty CTA;
5. footer wspólny z home bez duplikacji reguł;
6. `LegalDocumentShell` bez przebudowy treści prawnej.

R1 nie zmienia kolejności ani zawartości sekcji tras. Jeżeli nowe tokeny są
potrzebne, należy je wprowadzić współdzielone, a przy zmianie architektury
zapisać ADR przed kodem.

**Gate:** wszystkie 19 tras renderuje się bez zmiany treści, header/menu/footer
przechodzą klawiaturę, brak overflow w pełnej macierzy. Dedykowany R1 8/8,
pełny marketing 42/42, lint, typecheck i build przechodzą. Raport:
`R1_SHARED_SHELL_REPORT.md`.

### R2 — `/produkt`

- R2.1 hero — **COMPLETE**;
- R2.2 mapa produktu — **COMPLETE**;
- R2.3 granice produktu — **COMPLETE**;
- R2.4 finalne CTA i overview — **COMPLETE**.

**Gate:** użytkownik rozumie przepływ bez czytania wszystkich modułów; proof
nie dubluje hero home; copy nie rozszerza MVP.

### R3 — `/jak-dziala`

- R3.1 hero i mapa zaufania — **COMPLETE**;
- R3.2 kroki 1–3 — **COMPLETE**;
- R3.3 kroki 4–6 — **COMPLETE**;
- R3.4 bezpieczeństwo — **COMPLETE**;
- R3.5 CTA i overview — **COMPLETE**;
- R3.C przekrojowa redukcja rytmu mobile bez utraty informacji — **COMPLETE**.

**Gate:** kolejność jest czytelna bez samych łączników, browser nie wygląda jak
źródło decyzji o cenie/score, a przy 390 px dokument ma 5573 px wobec 8704 px
przed R3.C i 5698 px w R0. Dedykowany R3.1–R3.C przechodzi 60/60, pełny
marketing 134/134. Raport: `R3_C_HOW_ROUTE_COMPACTION_REPORT.md`.

### R4 — `/cennik`

- R4.1 hero — **COMPLETE**;
- R4.2 ścieżka wdrożenia i kontrast dwóch dróg — **COMPLETE**;
- R4.3 model w walidacji — **COMPLETE**;
- R4.4 kryteria zakresu i CTA — **COMPLETE**.

**Gate po pricing recovery:** zero kwot, triala, limitów i karty; obie ścieżki
są uczciwe, akcje prowadzą do realnych tras. Dwie karty zastępują nadmiernie
rozbudowany układ R4.1–R4.4. Dedykowany gate przechodzi 44/44, pełny marketing
178/178, a macierz 320–1536 px zachowuje minimum 12 px tekstu i zero overflow.
Raport: `PRICING_RECOVERY_REPORT.md`.

### R4.I — `/integracje` — nowa trasa wymagana przez IA

Audyt po pricing recovery potwierdził, że publiczna trasa `/integracje` nie
istnieje, a etykieta „Integracje” w headerze prowadzi błędnie do
`/wordpress`. Nowa trasa nie może udawać katalogu gotowych konektorów.

- R4.I.1 shell, metadata, breadcrumbs, hero i naprawa celu nawigacji — **COMPLETE**;
- R4.I.2 mapa realnych kanałów instalacji i połączeń;
- R4.I.3 status WordPressa oraz jawne granice braku pozostałych konektorów;
- R4.I.4 końcowe CTA, sitemap, link check i visual QA całej trasy.

**Gate:** jedna H1, unikalne metadata i canonical, pozycja „Integracje” prowadzi
do `/integracje`, WordPress pozostaje osobną trasą szczegółową, nie ma kart
CRM/webhook/arkuszy bez działającego kontraktu produktu, a desktop i mobile
spełniają gate strony głównej.

### R5 — `/dla-agencji`

- R5.1 hero i relacja tenantów — **COMPLETE, zaakceptowane 2026-08-03**;
- R5.2 metoda wdrożenia — **COMPLETE, zaakceptowane 2026-08-04**;
- R5.3 własność leadów — **COMPLETE, zaakceptowane 2026-08-04**;
- R5.4 izolacja widgetu — **READY FOR OWNER REVIEW**;
- R5.5 CTA.

**Gate:** brak obietnic white-label/delegacji poza MVP, tenant scope jest
jednoznaczny.

### R6 — `/wordpress`

- R6.1 hero i architektura połączenia;
- R6.2 tryby osadzenia;
- R6.3 bezpieczeństwo konektora;
- R6.4 stan gotowości i CTA.

**Gate:** dane leadów nie wyglądają na przechowywane w WordPressie, release
publiczny nie jest przedstawiony jako ukończony.

### R7 — `/branze`

- R7.1 hero;
- R7.2 mapa pięciu zastosowań;
- R7.3 porównanie wspólnego mechanizmu;
- R7.4 CTA.

**Gate:** pięć branż jest rozróżnialnych po danych wejściowych, nie tylko po
nazwie i opisie.

### R8 — strony branżowe, każda osobno

- R8.1 `/branze/meble-na-wymiar` — 8 sekcji i overview;
- R8.2 `/branze/ogrodzenia` — 8 sekcji i overview;
- R8.3 `/branze/strony-internetowe` — 8 sekcji i overview;
- R8.4 `/branze/klimatyzacja` — 8 sekcji i overview;
- R8.5 `/branze/remonty` — 8 sekcji i overview.

Wspólny template można rozwijać przy R8.1, ale nie wolno oznaczyć R8.2–R8.5
jako ukończonych bez osobnego renderu, oceny copy, demo i FAQ.

**Gate każdej trasy:** przykład, pytania i brief są branżowe; dane syntetyczne
są oznaczone; mobile nie przekracza uzasadnionej długości przez puste pola.

### R9 — `/funkcje`

- R9.1 hero;
- R9.2 łańcuch pięciu funkcji;
- R9.3 wspólne zabezpieczenia;
- R9.4 CTA.

**Gate:** funkcje są pokazane jako zależności jednego procesu, nie pięć
niezależnych obietnic.

### R10 — strony funkcji, każda osobno

- R10.1 `/funkcje/kalkulator-wyceny`;
- R10.2 `/funkcje/formularz-wieloetapowy`;
- R10.3 `/funkcje/kwalifikacja-leadow`;
- R10.4 `/funkcje/lead-scoring`;
- R10.5 `/funkcje/widget-na-strone`.

Każda trasa przechodzi osobno: hero → korzyści → trzy kroki → kontrola → CTA.

**Gate każdej trasy:** proof pokazuje właściwy mechanizm, a granica produktu
jest równie widoczna jak korzyść.

### R11 — dokumenty prawne

- R11.1 `/polityka-prywatnosci`;
- R11.2 `/regulamin`;
- R11.3 druk, zoom 200%, kotwice, przegląd prawny treści bez jego pozorowania.

**Gate:** dokumenty są czytelne i zgodne z marką, ale nie wyglądają jak landing
sprzedażowy. Brak zmiany znaczenia treści bez osobnej akceptacji prawnej.

### R12 — globalna integralność i cleanup

- pełny crawl 19 podstron + home;
- unikalne title/description/canonical i breadcrumbs/JSON-LD;
- link check i brak pustych CTA;
- 9 viewportów, 200% zoom, długie copy, no-JS, keyboard, axe, reduced motion,
  forced colors;
- budżet JS marketingu;
- baseline before/after i overview każdej trasy;
- usunięcie legacy klas/komponentów dopiero po `rg` i potwierdzeniu braku
  konsumentów;
- lint, typecheck, unit, build i marketingowe E2E;
- finalny self-review bezpieczeństwa, SEO, prywatności i wydajności.

**Gate:** zero martwego runtime, wszystkie trasy i testy zielone, dokumentacja
i backlog zaktualizowane. Rebranding nie daje zgody na deployment.

## 5. Ryzyka i zabezpieczenia

| Ryzyko                                       | Zabezpieczenie                                                                   |
| -------------------------------------------- | -------------------------------------------------------------------------------- |
| Globalny CSS zmieni home lub panel           | osobny scope podstron i visual regression home po każdym etapie                  |
| Wspólny template spłaszczy branże            | osobny proof, pytania, brief, FAQ i QA każdej trasy                              |
| Nowy design zasugeruje nieistniejące funkcje | przegląd copy względem scope/non-goals przed screenshotem                        |
| Mobile stanie się tylko stackiem             | osobna kompozycja proofu i limit wysokości per sekcja                            |
| Duplikacja tokenów home                      | wartości współdzielone w `packages/ui`/module, zakaz lokalnych kopii             |
| CTA będzie atrapą                            | link lub kontrolka musi działać; inaczej element nie może wyglądać interaktywnie |
| Cleanup usunie używany legacy                | `rg`, crawl, build i E2E przed usunięciem; małe patche                           |
| SEO ucierpi po zmianie nagłówków             | zachowanie jednej H1, metadata, canonical, breadcrumbs i danych strukturalnych   |

## 6. Następny dozwolony krok

**Odbiór właściciela R5.4 — izolacja widgetu na `/dla-agencji`.** Implementacja,
produkcyjna macierz 320–1536 px, visual QA oraz pełny gate są zamknięte. Proof
jest oparty na rzeczywistym Shadow DOM, małym loaderze i istniejącym teście
odporności na agresywny CSS hosta. R5.1–R5.3 zostają zamrożone. R5.5, R7, R8 i
pozostałe etapy pozostają zamrożone do jawnej akceptacji R5.4; następny etap po
akceptacji to wyłącznie R5.5 — finalne CTA `/dla-agencji`.

M4 strony głównej pozostaje wstrzymany do decyzji właściciela; rozpoczęcie R1
nie oznacza jego anulowania.
