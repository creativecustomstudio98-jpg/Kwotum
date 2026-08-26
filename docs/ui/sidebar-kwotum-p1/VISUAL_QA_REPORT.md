# Visual QA — finalny sidebar Kwotum P1

**Data:** 2026-08-13
**Wynik:** 19/20 — gate 18/20 spełniony
**Zakres:** wyłącznie desktopowy sidebar, kolumna app shellu i regresja mobile

## Źródło i metoda

- zaakceptowany obraz: `reference/sidebar-kwotum.png`, 863 × 1822 px;
- SHA-256:
  `ea188a170b984ae7554d94baefd62913175e657d9bfd0595ad7a02d321efbe87`;
- specyfikacja liczbowa właściciela ma pierwszeństwo przed skalą kompozytowej
  planszy, która pokazuje expanded i collapsed obok siebie;
- pełne rendery i cropy wykonano z produkcyjnego buildu Next.js na
  uwierzytelnionym, jednorazowym tenancie;
- znormalizowane overlaye i diffy służą wyłącznie do przeglądu kierunku, nie
  jako próg pixel-perfect, ponieważ źródło nie przedstawia wariantów w ich
  docelowej skali 256/72 px.

## Pomiary

| Viewport  | Wariant   | Sidebar | Wysokość | Overflow dokumentu |
| --------- | --------- | ------- | -------- | ------------------ |
| 1440×1024 | expanded  | 256 px  | 1024 px  | 0 px               |
| 1440×1024 | collapsed | 72 px   | 1024 px  | 0 px               |
| 1280×800  | expanded  | 256 px  | 800 px   | 0 px               |
| 1280×800  | collapsed | 72 px   | 800 px   | 0 px               |
| 1024×768  | expanded  | 256 px  | 768 px   | 0 px               |
| 1024×768  | collapsed | 72 px   | 768 px   | 0 px               |
| 390×844   | mobile    | ukryty  | —        | 0 px               |

Przy krótkiej wysokości 800/768 px stopka pozostaje przy dolnej krawędzi, a
środkowa część nawigacji przewija się wewnętrznie. Jest to zamierzony kontrakt:
nie ściskamy wierszy 48 px ani karty konta 64 px.

## Ocena

| Kryterium                         | Punkty | Uzasadnienie                                                                    |
| --------------------------------- | ------ | ------------------------------------------------------------------------------- |
| Kompletność i zgodność IA         | 4/4    | Organizacja, trzy grupy, utilities i konto; linki nadal wynikają z capabilities |
| Geometria i aktywna zakładka      | 4/4    | 256/72 px, 100dvh, 48 px, dwa prawe ścięcia i brak overflow                     |
| Typografia, kolor i ikony         | 4/4    | Lokalny Instrument Sans, centralne tokeny i spójny zestaw code-native SVG       |
| Interakcje i dostępność           | 4/4    | Klawiatura, focus, tooltipy, Escape, persistence, reduced motion i axe          |
| Responsive i podobieństwo planszy | 3/4    | Mobile bez regresji; krótki desktop wymaga wewnętrznego scrolla nawigacji       |

## Artefakty

- `expanded-1440x1024.png`, `collapsed-1440x1024.png`;
- `expanded-sidebar-256x1024.png`, `collapsed-sidebar-72x1024.png`;
- `expanded-1280x800.png`, `collapsed-1280x800.png`;
- `expanded-1024x768.png`, `collapsed-1024x768.png`;
- `mobile-390x844.png`;
- `measurements.json`;
- `reference-normalized-*.png`, `overlay-*-50.png` i
  `diff-*-normalized.png` — pomocnicze porównanie planszy o arbitralnej skali.

## Kontrole funkcjonalne

- aktywny link i jego `aria-current` na dashboardzie oraz leadach;
- zwijanie myszą i rozwijanie klawiszem Enter;
- persistence istniejącego klucza `lorum:panel-sidebar-collapsed` po reloadzie
  i przejściu między trasami;
- tooltip zwiniętego raila po fokusie klawiatury;
- menu konta otwierane klawiaturą, zamykane Escape z powrotem fokusu;
- brak sztucznej kropki powiadomień bez rzeczywistego stanu unread;
- zachowana mobilna dolna nawigacja i brak poziomego overflow;
- axe WCAG A/AA/2.1 AA/2.2 AA: 0 naruszeń w badanym scenariuszu;
- cleanup syntetycznego użytkownika, tenanta i Storage: 0 pozostałości.

Regresja całego panelu potwierdziła 16/17 pozostałych scenariuszy, w tym
dashboard, procesy, pełny builder, leady, szablony, analitykę, mobile i ekrany
operacyjne. Izolowany test geometrii buildera również przechodzi po
proporcjonalnym przesunięciu progu kontenerowego o 16 px. Ostatni scenariusz
webhooka dwukrotnie nie otrzymał komunikatu po rotacji sekretu; pełny seryjny
zestaw ma ponadto cztery zastane błędy kontrastu na osobnym ekranie wyboru
organizacji. Sidebar nie jest przyczyną ani uczestnikiem obu operacji, dlatego
nie rozszerzano P1 na ich naprawę.

## Odstępstwa

- Referencja zawiera zieloną kropkę przy powiadomieniach, ale runtime nie ma
  modelu `unread`; zgodnie z kontraktem kropka nie jest renderowana jako atrapa.
- Plansza ma arbitralną skalę i miękkie cienie wynikające z prezentacji obrazu.
  Runtime zachowuje przekazane wartości liczbowe oraz płaskie tło bez gradientu,
  glow, blur, tekstury, glass i cienia.
- Przy wysokości 800/768 px środkowy obszar nawigacji przewija się, aby stopka
  pozostała przy dolnej krawędzi bez zmniejszania przekazanych wymiarów wierszy.

## Hotfix prawego odstępu — 2026-08-13

Nowszy zrzut review produkcji, 3338 × 1962 px, SHA-256
`b08ac479744086b70850339e9a3b427dfb6509d443745887f91565989be55e4d`,
wykazał nadmierne wydłużenie jasnego pseudo-elementu do prawej krawędzi.
Korekta pozostawia aktywny link i focus bez zmian, ale kończy dekorację na
prawej krawędzi linku, 16 px przed brzegiem expanded. Drugi zaakceptowany crop
collapsed, 236 × 200 px, SHA-256
`a35d9b646ed18fc1d85c23c01e8ee5da6f4a697011b652051cd43a942360334d`,
ustala początek jasnej powierzchni równo z lewym brzegiem wąskiego raila, bez
lewego zaokrąglenia, oraz prawy skos kończący się 10 px przed prawym brzegiem.

## Korekta typografii 12ZP — 2026-08-13

Nowszy review produkcji wskazał, że wagi 520/620/640/650 dają ciężki,
szablonowy efekt. Zostały zastąpione centralnymi tokenami 400/500/600:
zwykła nawigacja, organizacja i utilities mają 400; aktywna pozycja, etykiety
grup i konto mają 500; marka ma 600. E2E mierzy wartości computed style i
ponownie potwierdza geometrię 256/72 px oraz oba warianty aktywnej powierzchni.
Crop `after-sidebar-256x1024.png` znajduje się w
`artifacts/visual-qa/12zp-panel-typography/`.
