# Luki i konflikty referencji V6

**Status:** aktywny rejestr  
**Ostatni przegląd:** 2026-07-29

| Luka lub konflikt                                               | Skutek                                     | Rozstrzygnięcie                                                    |
| --------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| Oryginały najnowszego buildera i leada nie są plikami repo      | brak dokładnego overlay i SHA              | pozyskać przed etapami tych ekranów                                |
| Builder v1 ma pełny sidebar, nowszy screen wąski rail           | sprzeczna geometria shell                  | nowszy screen wygrywa dla buildera                                 |
| Product app board pokazuje graf procesu                         | konflikt z `NON_GOALS.md`                  | graf nie jest implementowany                                       |
| Generator v1 zawiera lokalne gradienty miniaturek               | konflikt z ADR-024/V6                      | nie przenosić do produkcji                                         |
| Plansza pricing pokazuje cztery plany                           | model cenowy niezatwierdzony               | użyć wyłącznie uczciwego zakresu pilotażu                          |
| Panel referencyjny pokazuje opiekuna i kalendarz                | część modelu jest po MVP lub nieistniejąca | najpierw decyzja danych, auth i testy                              |
| Część makiet używa nazwy Wyceno                                 | konflikt z ADR-024                         | widoczna marka pozostaje Lorum                                     |
| Plansza auth I ma lokalny oryginał, ale brak cropów i overlay   | brak końcowego visual score                | zapisać passy po odzyskaniu podglądu                               |
| Plansza auth I nie pokazuje mobile                              | brak geometrii 390 × 844                   | pozyskać login/register/reset mobile                               |
| Prompt auth dodaje trial i testimonial                          | brak potwierdzonych faktów produktu        | nie kopiować; użyć prawdziwego copy                                |
| V6 opisuje pełny panel, bieżący Etap 12F zamraża trasy poza `/` | ryzyko rozszerzenia etapu                  | realizować kolejno po zamknięciu 12F                               |
| Załączniki zawierają realistyczne osoby i firmy                 | ryzyko pomylenia z danymi produkcyjnymi    | wyłącznie jawny tryb demo/seed                                     |
| Referencja nie pokazuje wszystkich error/permission states      | brak obrazu nie zwalnia z DoD              | stosować `EMPTY_LOADING_ERROR_STATES.md`                           |
| Nowa biblioteka pokazuje 12 szablonów, import i użycie 68%      | brak takich danych i funkcji w modelu MVP  | zachować geometrię, użyć 5 realnych szablonów i działających akcji |

## Blokady przed kodowaniem ekranu

Builder i lead detail nie mogą otrzymać statusu visual PASS przed zapisaniem
najnowszych załączników jako plików. Nie blokuje to kontynuacji obecnego Etapu
12F strony głównej ani prac dokumentacyjnych.

Auth nie może otrzymać statusu visual PASS przed zapisaniem dwóch
desktopowych zrzutów, overlay i diff. Oryginał załącznika I jest już
zablokowany lokalnie, a pełnoekranowy wzorzec J rozstrzyga geometrię desktop.
Brak osobnych referencji mobile pozostaje jawnym ograniczeniem score.

## Otwarte decyzje produktowe

- zakres pilotażu i liczba planów;
- model właściciela/opiekuna leada i planowanego działania;
- granica funkcji agencji w MVP;
- kolejność etapów pełnej przebudowy panelu po zamknięciu `/`;
