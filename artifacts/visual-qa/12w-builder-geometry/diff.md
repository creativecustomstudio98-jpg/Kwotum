# Etap 12W — finalna geometria buildera

## Zakres

- trasa: `/panel/[organizationId]/procesy/[flowId]`;
- referencja:
  `apps/web/public/panel/ChatGPT Image 26 lip 2026, 18_28_24.png`,
  1448 × 1086 px;
- stan porównywany: wspólny sidebar Lorum zwinięty do 78 px;
- dodatkowe stany: sidebar rozwinięty, tablet 768 × 1024 i mobile
  390 × 844;
- transformacja responsive bez osobnego obrazu źródłowego jest oceniana
  kontraktem `docs/RESPONSIVE_LAYOUT.md`, nie pozornym pixel diffem.

## Pomiary desktopu 1448 × 1086

| Region          |       Referencja |     Wynik | Odchylenie |
| --------------- | ---------------: | --------: | ---------: |
| rail            |            78 px |     78 px |       0 px |
| toolbar         |            85 px |     85 px |       0 px |
| lista sekcji    |           360 px |    360 px |       0 px |
| preview         | około 581–582 px |    582 px |     0–1 px |
| inspektor       | około 428–429 px |    428 px |     0–1 px |
| karta preview   |           464 px |    464 px |       0 px |
| pozycja karty Y |     około 255 px | 255,14 px |     < 1 px |

Po rozwinięciu sidebara workspace ma 1240 px i dzieli się na
320 / 560 / 360 px. Prawa krawędź inspektora kończy się dokładnie na 1448 px;
nie występuje poziomy overflow ani maskowane ucięcie.

## Dziesięć największych różnic

1. Produkcja zachowuje aktualną markę Lorum zamiast historycznego logo
   z referencji.
2. Sidebar jest współdzielonym komponentem całego panelu i może mieć 208 px;
   referencja pokazuje wyłącznie wąski rail.
3. Tytuł procesu pochodzi z realnego draftu „Ogrodzenie — zakres i warunki
   działki”, a nie z przykładowego procesu usługowego.
4. Produkcyjny proces ma osiem prawdziwych pytań zamiast czternastu pozycji
   demonstracyjnych.
5. Sekcje i liczniki odzwierciedlają zapisany `FlowDocument`, a nie zawartość
   obrazu.
6. Inspektor nie pokazuje fikcyjnej, wypełnionej reguły warunkowej, gdy wybrane
   pytanie jej nie ma.
7. Dostępne Ponów pozostaje osobną akcją desktopową; referencja eksponuje tylko
   Cofnij.
8. Mobile przenosi Cofnij/Ponów do działającego menu publikacji, aby nie
   kolidowały z tytułem i CTA.
9. Brakujące teksty pomocnicze i walidacje pozostają puste zamiast kopiować
   nieistniejące dane z makiety.
10. Tablet i mobile używają jawnych trybów Pytania / Podgląd / Ustawienia,
    ponieważ nie dostarczono referencji, która uzasadniałaby skalowanie trzech
    kolumn.

## Wynik

**19/20**

- kompletność regionów: 4/4;
- geometria i proporcje: 4/4;
- typografia i spacing: 4/4;
- gęstość danych oraz stany: 4/4;
- transformacja mobile: 3/4 — jest kompletna i automatycznie zweryfikowana,
  ale nie ma osobnej referencji obrazowej.

## Artefakty

- `desktop/after-production-collapsed-1448x1086.png`;
- `desktop/after-production-expanded-1448x1086.png`;
- `desktop/overlay-50-1448x1086.png`;
- `desktop/difference-1448x1086.png`;
- `desktop/side-by-side-1448x1086.png`;
- `tablet/after-production-inspector-768x1024.png`;
- `mobile/after-production-preview-390x844.png`.

Playwright sprawdza dodatkowo 320, 375, 430, 1024, 1280 i 1536 px, brak
overflow, brak kolizji topbara, wyrównanie wierszy opcji, cele dotykowe,
działające menu historii oraz axe WCAG A/AA.
