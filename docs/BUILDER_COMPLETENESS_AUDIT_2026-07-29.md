# Audyt kompletności buildera — 2026-07-29

## Zakres i źródła

Audyt porównuje produkcyjny builder
`/panel/[organizationId]/procesy/[flowId]` z:

- zaakceptowaną referencją `apps/web/public/panel/ChatGPT Image 26 lip 2026, 18_28_24.png`
  1448 × 1086;
- `CODEX_MASTER_PROMPT.md`, sekcje 4B.7–4B.11;
- `docs/UI_SCREEN_SPEC.md`;
- rzeczywistym modelem `FlowDocument` i istniejącymi akcjami serwerowymi.

Najnowszy zgłoszony crop przełącznika, referencja i stan `before` są
zablokowane w `artifacts/visual-qa/12y-builder-toggle/`.

## Wniosek

Builder jest działającym edytorem głównej ścieżki, ale nie jest jeszcze pełnym
odwzorowaniem wszystkich możliwości pokazanych w referencji i wymaganych przez
kontrakt produktu. Etapy 12W–12ZA domknęły geometrię, stan edytora, pytania,
walidację, porządkowanie pytań i opcji oraz pełne zarządzanie sekcjami. Nie
domknęły grup logiki ani edytorów wyceny, scoringu i wyniku.

## Macierz

| Obszar                                                      | Stan                            | Dowód / uwaga                                                           |
| ----------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------- |
| Jeden rail Lorum i pełny workspace                          | gotowe                          | builder korzysta ze wspólnego, zwijanego sidebara                       |
| Toolbar: nazwa, status, zapis, undo/redo, preview i publish | gotowe                          | działania są realne, publikacja tworzy immutable wersję                 |
| Autosave i konflikt rewizji                                 | gotowe                          | kontrola rewizji, retry, odzyskanie aktualnej wersji                    |
| Trzy strefy desktop                                         | gotowe                          | pytania / realny preview / inspector                                    |
| Tryby tablet i mobile                                       | gotowe                          | Pytania / Podgląd / Ustawienia zamiast skalowania kolumn                |
| Lista sekcji i liczników                                    | gotowe                          | sekcje grupują pytania, pokazują liczniki i jawny stan pusty            |
| Dodawanie, zmiana nazwy, zwijanie i usuwanie sekcji         | gotowe                          | `+ Sekcja`, inline rename i bezpieczny dialog są działające             |
| Zmiana kolejności sekcji                                    | gotowe                          | menu i `Alt+ArrowUp/Down` przenoszą całe grupy bez zmiany grafu         |
| Dodawanie, usuwanie i edycja pytań                          | gotowe                          | typ, tytuł, opis, wymagane, następny krok                               |
| Sortowanie pytań                                            | gotowe                          | mysz, `Alt+ArrowUp/Down`, menu i `aria-live`                            |
| Edycja opcji odpowiedzi                                     | gotowe                          | dodawanie, usuwanie, etykiety i limity                                  |
| Sortowanie opcji odpowiedzi                                 | gotowe                          | DnD, `Alt+ArrowUp/Down`, menu dotykowe, fokus i `aria-live`             |
| Walidacje typowane                                          | gotowe                          | długość tekstu, zakres liczbowy i zakres dat                            |
| Preview kroku                                               | gotowe                          | rzeczywiste dane aktywnego pytania, progres i nawigacja                 |
| Prosta logika warunkowa                                     | gotowe                          | pojedyncze warunki field/operator/value/action                          |
| Grupy IF/AND/OR i kolejność reguł                           | brak                            | obecny model routingu nie udostępnia grup warunków w UI                 |
| Włączanie/wyłączanie bloku logiki                           | brak                            | reguły można dodać/usunąć, ale nie ma przełącznika całej sekcji         |
| Pricing                                                     | model i silnik gotowe, UI brak  | `FlowDocument.estimation.pricing` jest zachowywane, lecz nieedytowalne  |
| Scoring                                                     | model i silnik gotowe, UI brak  | deterministyczny scoring działa serwerowo, lecz bez edytora buildera    |
| Konfiguracja wyniku                                         | model częściowo gotowy, UI brak | presentation istnieje w estimation, brak osobnego widoku i live preview |
| Walidacja przed publikacją                                  | gotowe dla obecnego UI          | błędy schematu blokują zapis, błędy grafu blokują publikację            |
| Fokus, klawiatura, axe i overflow                           | gotowe dla pokrytego zakresu    | automaty nie zastępują ręcznego VoiceOver/NVDA przed release            |

## Regresja przełącznika

Przyczyną kwadratowego przełącznika nie był komponent React ani stan danych.
Ogólny selektor `.question-inspector input` nadawał wszystkim inputom
`min-height: 42px`, padding i promień pola. Późniejsza reguła desktopowa
wygrywała w kaskadzie z bazową wysokością przełącznika 24 px. Pseudoelement
gałki nadal miał 18 px i pozycję dla kapsuły, dlatego trafiał w prawy górny róg
powiększonego kwadratu.

Etap 12Y:

- wyklucza checkbox z ogólnych reguł pól inspektora;
- resetuje pełną geometrię wspólnego przełącznika do 42 × 24 px;
- zachowuje natywną semantykę checkboxa i obsługę `Space`;
- obejmuje ten sam wzorzec w ustawieniach prywatności;
- dodaje stany focus-visible, disabled i forced-colors;
- blokuje regresję przez asercję wyliczonego CSS w Playwright.

## Kolejność dalszego domknięcia

1. Rozszerzenie logiki do ograniczonych, deklaratywnych grup IF/AND/OR.
2. Osobne tryby Pricing, Scoring i Wynik oparte wyłącznie na istniejącym,
   walidowanym `FlowDocument.estimation`.

Każdy punkt wymaga osobnego gate’u funkcjonalnego, bezpieczeństwa i visual QA;
nie należy dodawać samych kontrolek bez działającego zapisu i walidacji.
