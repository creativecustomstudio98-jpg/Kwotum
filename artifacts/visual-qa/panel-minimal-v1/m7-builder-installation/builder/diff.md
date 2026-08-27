# M7 — builder procesu

## Wynik

PASS, 19/20.

| Kryterium                 | Punkty |
| ------------------------- | -----: |
| kompletność regionów      |    4/4 |
| geometria i proporcje     |    4/4 |
| typografia i spacing      |    4/4 |
| gęstość danych oraz stany |    4/4 |
| transformacja mobile      |    3/4 |

Mobile świadomie pokazuje tylko jeden z trzech paneli roboczych naraz. Dwa
długie tracki segmentów pozostają osiągalne i nie tworzą overflow, ale zajmują
więcej wysokości niż zwarty układ desktopowy.

## Trasa i chroniony stan

- `/panel/:organizationId/procesy/:flowId`;
- jednorazowy tenant testowy z syntetycznym procesem oraz rolą uprawnioną do
  odczytu, edycji i publikacji;
- bez zmian FlowDocument, walidacji serwerowej, autosave, optimistic conflict,
  undo/redo, publikacji i niezmiennych wersji;
- tryb preview korzysta z tego samego renderera co publiczny formularz i nie
  zapisuje leada ani sesji.

## Referencja, viewport i artefakty

Referencje, regiony i SHA-256 są zapisane w `canonical-reference.txt`.
Główny obraz steruje płaskim canvasem, osiami i oszczędną typografią, a nowszy
obraz regionalny wyłącznie długim trackiem z sąsiadującymi segmentami i jednym
miękko zaznaczonym wyborem. Nie kopiowano demonstracyjnych nazw, ciemnego tła,
poświaty ani obcych funkcji.

Porównanie powstało na macOS 26.5.2 arm64, Chromium z Playwright 1.61.0,
`pl-PL`, light mode i skali 1. `before.png` oraz `after.png` mają 1448 × 1086
px. `overlay-50.png` i `difference.png` dokumentują zmianę, ale nie są celem
pixel-perfect, ponieważ aktywna referencja jest dashboardem, nie builderem.

## Dziesięć głównych różnic przed/po

1. Jeden track Formularz/Wycena/Scoring/Wynik zastępuje rozproszone,
   powielone zakładki.
2. Aktywny segment ma miękkie wypełnienie bez dolnej linii, cienia i poświaty.
3. Workspace jest jedną relacyjną siatką pytań, preview i inspectora bez
   trzech konkurujących kart.
4. Kolumny mają stabilne relacje 320 px / elastyczny preview / 340 px i
   wspólne krawędzie.
5. Toolbar ma 64 px, spokojniejszą typografię i nie konkuruje z treścią.
6. Wybór sposobu wypełniania używa tego samego kontraktu segmentów zamiast
   oddzielnych dekoracyjnych kart.
7. Listy pytań i ustawienia są płaskie; separatory pojawiają się tylko tam,
   gdzie wyjaśniają relację.
8. Menu wierszy pozostają zamknięte do aktywacji i mają tekst funkcjonalny co
   najmniej 12 px.
9. Przy 768 px cofanie i ponawianie przechodzi do menu publikacji, dzięki czemu
   nazwa procesu nie nachodzi na akcje; funkcje nie znikają.
10. Mobile używa oddzielnego tracku Pytania/Podgląd/Ustawienia, logicznego
    reflow i celów 44 px zamiast ściskać trzy kolumny.

## QA

- celowany scenariusz M7 buildera: 1/1, fixture cleanup: 0 pozostałości;
- desktop, rozwinięty sidebar, tablet 768 × 1024 i mobile 390 × 844 mają
  osobne rendery; dodatkowy render forced colors dokumentuje fokus;
- macierz 320/375/390/430/768/1024/1280/1440/1536 px: 0 px overflow;
- desktop: rail 72 px, toolbar 64 px, pytania 320 px, preview 716 px,
  inspector 340 px; po rozwinięciu raila preview zachowuje 532 px;
- wszystkie widoczne funkcjonalne teksty mają co najmniej 12 px;
- klawiatura: ArrowLeft/ArrowRight, Home i End zmieniają segment oraz fokus;
- axe: 0 naruszeń; forced colors: fokus 3 px; reduced motion: 0 s;
- 200% zoom sprawdzony przez równoważny reflow 768 px;
- pełny wynik repozytoryjnych bramek zapisano w `docs/TASKS.md` po końcowym
  przebiegu.

Zachowano dodatkowe obrazy tablet, rozwiniętego sidebara i forced colors,
ponieważ stanowią dowód osobnych ryzyk M7; nie są pośrednimi iteracjami.

## Bezpieczeństwo, prywatność i wydajność

Zmiana nie dodaje zależności, endpointów, danych ani migracji. Uprawnienia i
tenant scope pozostają serwerowe. Preview jest bezstanowy, a publikacja nadal
przechodzi dotychczasową walidację. Usunięcie dekoracyjnych warstw nie zwiększa
bundle; produkcyjny widget pozostaje w swoim budżecie gzip.

## Rollback

Rollback jest wymagany, jeśli autosave, konflikt, undo/redo, publikacja,
klawiatura, jeden z czterech obszarów lub którykolwiek mobilny panel przestanie
działać, pojawi się overflow albo tekst funkcjonalny spadnie poniżej 12 px.
Wycofanie obejmuje klasy M7, semantykę segmentów i ich testy; nie wymaga
migracji bazy ani zmiany FlowDocument.
