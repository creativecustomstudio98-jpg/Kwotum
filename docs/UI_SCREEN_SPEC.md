# Specyfikacja ekranów Kwotum

**Status:** kanoniczny dla zakresu UI  
**Ostatni przegląd:** 2026-08-03

Dokument łączy zatwierdzony zakres produktu z obrazami V6. Referencja określa
kompozycję i zachowanie responsywne, ale nie tworzy nowej funkcji, roli, danych
ani uprawnienia.

## Marketing

Najnowszy pakiet V7 z 2026-08-01 ustala dla desktopowego `/` kolejność:

1. niski header i hero: proces klienta → code-native panel leada;
2. neutralny pasek dowodu/capabilities bez niepotwierdzonych logotypów;
3. trzy kroki: zebranie → kwalifikacja → gotowy lead;
4. budżet, termin, pliki i wynik kwalifikacji;
5. pełny przykład leada z następnym krokiem;
6. istniejące kanały integracji i automatyzacji;
7. dwa warianty rozpoczęcia współpracy bez niezatwierdzonych kwot i płatności;
8. FAQ, rzeczywiste źródła pomocy i końcowe CTA;
9. footer.

Nowa geometria nie zezwala na logotypy fikcyjnych klientów, natywne CRM/Google
Sheets, ceny 249/549 zł, trial, dane kontaktowe, SLA ani statystyki bez
potwierdzonego źródła. Ich miejsce kompozycyjne wypełnia rzeczywista funkcja lub
uczciwe copy. Działające demo obecnej strony nie może zostać cicho usunięte;
jego docelowe miejsce rozstrzyga D2 bez degradacji zachowania.

ADR-027 ogranicza bieżącą implementację do `/`. Pozostałe trasy marketingowe
zachowują własne kompozycje do czasu osobnego etapu.

## Ekrany MVP

| Obszar      | Wymagany ekran lub stan                                                                                | Ograniczenie                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Auth        | logowanie, callback, błędy sesji                                                                       | bez publicznego cache panelu                                                   |
| Onboarding  | organizacja, wybór szablonu lub pustego procesu                                                        | bez publikacji bez decyzji użytkownika                                         |
| Shell       | desktop, tablet, mobile                                                                                | na mobile nawigacja zadaniowa                                                  |
| Dashboard   | uwaga, agregaty, jakość, najnowsze leady                                                               | bez fikcyjnych KPI                                                             |
| Leady       | filtry, tabela desktop, lista mobile, statusy                                                          | jawny tenant scope                                                             |
| Lead detail | kontakt, wynik, odpowiedzi, pliki, powody score, historia, notatki                                     | akcje zależne od roli; najnowszy screen jest geometrią docelową                |
| Procesy     | lista, draft, wersje, publikacja, archiwum                                                             | opublikowana wersja jest immutable                                             |
| Builder     | sekcje i pytania, preview, inspektor                                                                   | bez grafu node-based                                                           |
| Logika      | ograniczone IF/AND/OR/THEN                                                                             | deklaratywne AST, bez kodu użytkownika                                         |
| Pricing     | reguły, min/max, symulacja                                                                             | kalkulacja potwierdzona przez serwer                                           |
| Scoring     | deterministyczne reguły i powody                                                                       | score nie pochodzi z klienta                                                   |
| Wynik       | tryb prezentacji i live preview                                                                        | wynik orientacyjny, niewiążący                                                 |
| Szablony    | pięć branż i jawna zawartość                                                                           | kopia tworzy niezależny draft                                                  |
| Widget      | desktop/mobile, hosted, result, lead capture                                                           | Shadow DOM i stabilne identyfikatory                                           |
| Analityka   | lejek, drop-off, źródła, urządzenia                                                                    | progi prywatności i zgoda                                                      |
| Instalacja  | pełny bezstanowy preview, wysyłka hosted linku, historia, inline, popup, fullscreen, hosted, WordPress | kontrolki muszą wykonywać realne działania; preview nie tworzy sesji ani leada |
| Integracje  | webhook i WordPress                                                                                    | sekrety tylko po stronie serwera                                               |
| Ustawienia  | organizacja, zespół, branding, prywatność, retencja                                                    | autoryzacja serwerowa                                                          |
| Pomoc       | wyszukiwanie, spis treści i instrukcje rzeczywistych modułów                                           | zakres filtrowany capability; bez fikcyjnego supportu                          |
| Stany       | loading, empty, error, permission, stale, offline widget                                               | bez utraty kontekstu i danych                                                  |

## Najnowsze nadpisania wizualne

### Wybór organizacji

Zaakceptowany obraz z 2026-08-13 zastępuje starszą kompozycję wyłącznie na
`/panel`: header 80 px, lewy panel informacyjny 484 px oraz prawa lista z
wyszukiwarką i kolumnami organizacja/rola/status/aktywność. Paleta i znak są
aktualne dla Kwotum. Firmy, domeny, role, statusy i daty z referencji nie są
danymi produktu; ekran pokazuje wyłącznie aktywne członkostwa użytkownika i
nie rozszerza tenant scope. Cały wiersz jest linkiem, a mobile zmienia go w
kartę zachowując kolejność DOM.

### Builder desktop

Najnowszy załącznik ustala: około 80 px zielonego raila, wspólny toolbar,
kolumnę sekcji i pytań, centralny rzeczywisty preview oraz prawy inspektor z
walidacją i logiką warunkową. Zastępuje starszy wariant z pełnym opisowym
sidebarem. Lewa kolumna udostępnia prawdziwe `+ Sekcja`, zwijanie, licznik,
zmianę nazwy, kolejność i usunięcie z przeniesieniem pytań; operacje mają
równoważną obsługę klawiaturą i nie są wyłącznie wizualnymi uchwytami. Nie
zmienia to kontraktu danych flow.

### Lead operacyjny

Najnowszy załącznik ustala dokumentowy układ z nagłówkiem firmy, zakresem,
budżetem, terminem, lokalizacją, załącznikami, wyjaśnialnym dopasowaniem i
prawym panelem obsługi. Etap 12ZI potwierdza model i uruchamia panel: status,
właściciel, priorytet, następny krok, zaplanowany kontakt, ostatnia aktywność,
notatki oraz zadania zapisują się po stronie serwera. Desktop używa jednej
białej powierzchni z hairline'ami, bez warstwowania kart. Mobile przenosi panel
pod podsumowanie bez zmiany kolejności DOM. Kalendarz zewnętrzny, automatyczne
przypomnienia i CRM pozostają poza zakresem.

## Poza MVP

Billing/subskrypcje, Editor/Viewer, natywne CRM-y i kalendarze, zaawansowany
white-label, automatyczne przypisywanie, aplikacje natywne oraz pełny workflow
node-based nie mogą być wdrażane na podstawie samego obrazu.
