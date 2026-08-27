# Visual diff — home CTA

## Zakres

Porównanie wykorzystuje ten sam DOM, copy i viewport. Stan `before` przywraca
poprzednie tokeny `#003B25`, hover `#002F1E` i promień 8 px. Stan `after`
korzysta z finalnej kaskady `#0B684A`, granicy `#075139` i promienia 14 px.

## Wynik

- desktop 1440 × 900: hero CTA 64 px wysokości, radius 14 px, overflow 0 px;
- mobile 390 × 844: hero CTA 56 px wysokości, radius 14 px, overflow 0 px;
- publiczny header i hero mają tę samą rolę kolorystyczną;
- brak błędów runtime podczas pomiaru produkcyjnego komponentu w lokalnym
  buildzie deweloperskim; komunikaty CSP dev dotyczące `eval` Reacta zostały
  odfiltrowane jako znane ograniczenie trybu development i nie występują w
  buildzie produkcyjnym;
- kolor i promień zmieniają wyłącznie akcje; geometria hero, render produktu,
  tekst i pozostałe kontrolki pozostają bez zmian.
