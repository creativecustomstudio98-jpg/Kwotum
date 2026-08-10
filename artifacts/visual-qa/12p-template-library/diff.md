# Etap 12P — biblioteka szablonów

## Zakres i źródło

- trasa: `/panel/[organizationId]/szablony`;
- viewport główny: 1536 × 1024;
- mobile: 390 × 844 oraz kontrola 320 × 800;
- źródło anatomii: crop `1250,82,272,305` z
  `references/product-app-board.png`;
- nowsza decyzja właściciela: pięć mniejszych kart w jednym desktopowym
  rzędzie i zwarty nagłówek.

## Dziesięć największych różnic przed korektą

1. Stary topbar zajmował 85 px wysokości.
2. Widoczny był techniczny eyebrow „Biblioteka procesów”.
3. Tytuł miał formę dużego nagłówka strony zamiast etykiety modułu.
4. Powtórzony blok „Wybierz punkt startowy” dodawał drugą hierarchię.
5. Siatka używała czterech kolumn.
6. Piąty szablon spadał samotnie do następnego rzędu.
7. Karty miały po 308 px szerokości.
8. Obrazy miały 120 px wysokości.
9. Karty miały około 289 px wysokości.
10. Biblioteka nie wyglądała jak jeden zwarty moduł z planszy produktu.

## Wynik v2

- powierzchnia: 1280 px przy workspace 1328 px;
- pięć kart w jednym rzędzie, wspólne `y=89,5`;
- karta: około 240 × 253 px;
- obraz: 92 px wysokości;
- tytuł: 12,8 px wewnątrz powierzchni;
- brak starego topbara i powtórzonego nagłówka;
- zachowane realne nazwy, liczby pytań, reguły i server action;
- zero poziomego overflow dla 1536, 390 i 320 px;
- axe bez naruszeń.

## Interpretacja overlay

Referencja przedstawia wąski moduł 2 × 2 z czterema widocznymi przykładami.
Pełna trasa celowo używa pięciu kolumn zgodnie z nowszą decyzją właściciela.
Overlay służy zatem do oceny gęstości, wysokości mediów, obramowań i hierarchii,
nie do wymuszenia historycznej liczby kolumn.

## Punktacja

- kompletność regionów: 4/4;
- geometria i proporcje: 4/4;
- typografia i spacing: 4/4;
- gęstość danych i stany: 4/4;
- transformacja mobile: 3/4.

Łącznie: **19/20**.

## Artefakty

- `reference.png`;
- `before-1536x1024.png`, `before-normalized.png`;
- `after-v2-1536x1024.png`, `after-v2-390x844.png`;
- `after-production-1536x1024.png`, `after-production-390x844.png`;
- `after-v2-normalized.png`;
- `overlay-v2.png`, `difference-v2.png`;
- `reference-left-after-v2-right.png`.

Rendery v1 przeniesiono do odzyskiwalnego Kosza po zamknięciu etapu; opis
różnic i finalne dowody v2/production pozostają.
