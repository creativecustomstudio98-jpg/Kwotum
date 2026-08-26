# M6 — workspace szczegółu leada

**Wynik:** PASS, 19/20  
**Viewport porównawczy:** 1536 × 1024 px  
**Kierunek kanoniczny:** dwa aktywne obrazy i SHA-256 zapisane w
`canonical-reference.txt`

## Co zmieniono

- zastąpiono warstwową kompozycję jednym białym canvasem, płaskim dokumentem
  864 px i operacyjnym railem 320 px;
- uporządkowano kompaktowy nagłówek kontaktu, status, ownera, priorytet oraz
  pełny wynik z kategorią i wszystkimi powodami scoringu;
- dodano cztery osiągalne sekcje wewnętrzne: Podsumowanie, Odpowiedzi, Pliki i
  Historia, ze stanem zapisanym w hash URL;
- zachowano komplet odpowiedzi, preferencji, kontekstu, zgód, signed URLs,
  notatek, zadań, statusów, zdarzeń operacyjnych i powiadomień;
- historię połączono globalnie i posortowano chronologicznie zamiast grupować
  ją według źródła;
- prawy rail jest trwały na desktopie, a na mobile przechodzi po dokumencie;
  końcowa akcja jest sticky i ma rezerwę miejsca, więc nie zasłania zadań ani
  ich kontrolek;
- usunięto fikcyjne zdjęcie osoby i martwy link kontaktowy; brak danych jest
  komunikowany wprost;
- dopasowano stany loading i error do rzeczywistej anatomii ekranu.

## Chronione inwarianty

- tenant scope, RLS i serwerowe capabilities pozostały źródłem dostępu;
- Sales nie widzi przypisania, prywatności, eksportu ani usunięcia i nie może
  zamknąć cudzego zadania;
- eksport obcego lub nieistniejącego leada mapuje bezpieczny kod bazy na 404;
- akcje statusu, ownera, priorytetu, notatki i zadania pozostają prawdziwymi
  server actions, a odświeżenie nie powiela callbacków;
- aktywności i zadania są pobierane stabilnymi stronami bez cichego limitu
  100 rekordów;
- mobile zachowuje logiczną kolejność dokumentu przed operacjami.

## Ocena wizualna

| Kategoria              | Wynik | Dowód                                                                      |
| ---------------------- | ----: | -------------------------------------------------------------------------- |
| kompletność regionów   |   4/4 | header, score, cztery sekcje, dokument i rail                              |
| geometria i proporcje  |   4/4 | dokument 864 px, rail 320 px, wspólna oś                                   |
| typografia i spacing   |   3/4 | Instrument Sans i spokojny rytm; kontakt na mobile może być kiedyś gęstszy |
| gęstość danych i stany |   4/4 | pełne dane, empty/loading/error, bez card soup                             |
| transformacja mobile   |   4/4 | logic order, 44 px, sticky bez kolizji                                     |

Łącznie: **19/20**, powyżej bramki 18/20.

## Automatyczne pomiary i testy etapu

- celowany E2E M6: 3/3;
- produkcyjny build w przebiegu E2E: 16/16 z 42 trasami;
- axe: 0 naruszeń;
- forced-colors focus outline: 3 px;
- viewporty 320/375/390/430/720/768/1024/1280/1440/1536 px i wszystkie
  cztery sekcje: 0 px overflow;
- minimalny główny cel na małych viewportach: 44 px;
- finalne sticky CTA: 69 px wysokości, dół równy 844 px w viewport 390 × 844,
  bez zasłoniętych kontrolek;
- test serwisu szczegółu leada: 9/9;
- testy mapowania prywatności: 2/2.

Pełny wynik repozytoryjnych bramek jest zapisany w kanonicznym raporcie etapu
po ich końcowym przebiegu.

## Artefakty

- `before.png` — zamrożony poprzedni stan implementacji;
- `after.png` — finalny desktop;
- `mobile-390x844.png` i `tablet-768x1024.png` — reflow;
- `sticky-action-390x844.png` — końcowy stan po przewinięciu;
- `forced-colors-390x844.png` — tryb wymuszonych kolorów;
- `measurements.json` — pomiary wszystkich viewportów i sekcji;
- `overlay-50.png` i `difference.png` — aktualne porównanie geometrii z
  baseline'em. Dynamiczne identyfikatory i czasy wykluczają traktowanie go
  jako celu pixel-perfect.

## Rollback

Zmiany M6 są odseparowane klasą `.lead-reference--m6`, osobnym komponentem
zakładek i kodem szczegółu leada. Wycofanie nie wymaga migracji danych ani
zmiany kontraktu domenowego. Nie należy przywracać usuniętych, zastąpionych
referencji panelu.
