# FTZ-03B — Turnstile retry

- zakres: stan finalnego submitu widgetu po wygaśnięciu tokenu Turnstile;
- język wizualny: zaakceptowany widget 12S, plik `reference.png`, SHA-256
  `b2893072a81ada2c8b27fb7c2ee754d0c67bb77b28e36705caf3301704bc41c9`;
- viewport: 390 × 844, render full-page 390 × 1392/1437;
- `before.png`: kompletny formularz przed uruchomieniem challenge;
- `after.png`: ten sam formularz po `expired-callback`, bez wywołania API submit;
- `overlay.png`: 50% after na płótnie before wyrównanym do 390 × 1437;
- `difference.png`: różnica bez zwiększania tolerancji.

## Ocena

**19/20:** kompletność 4, geometria 4, typografia i spacing 4, gęstość i stany
3, transformacja mobile 4. Komunikat błędu ma `role=alert`, nie zasłania pól,
nie usuwa wpisanych danych i przesuwa tylko treść poniżej siebie. Normalny
managed pass nie dodaje generycznej karty ani stale widocznej captchy.

## Odchylenia i gate

- dostawca jest deterministycznym stubem przeglądarkowym; rzeczywista
  interaktywna ramka Cloudflare wymaga UAT na hostach produkcyjnych;
- test potwierdza 0 submitów po pierwszym wygasłym tokenie, dokładnie jeden
  submit z `e2e-single-use-token-2` oraz dwie próby challenge;
- cały `widget.spec.ts` przechodzi 4/4: mobile, desktop, axe, klawiatura,
  forced colors, brak overflow, hostile host CSS i retry.
