# Visual diff — sekcja 4 kroków i szablonów

## Źródła

- referencja:
  `docs/ui/references/accepted/home-post-hero-overview-1098x624.png`,
  1098 × 624 px;
- wynik: `desktop/after-final.png`, 1098 × 633 px;
- overlay: `desktop/overlay-final.png`;
- mapa różnic: `desktop/diff-final.png`;
- mobile: `mobile/after-final.png`, 390 × 1254 px.

## Dziesięć największych różnic

1. Widoczna nazwa produktu pozostaje Lorum zamiast historycznego Wyceno.
2. Wynik jest o około 8,5 px wyższy od referencji.
3. Kontener kart ma nieznacznie większe boczne marginesy.
4. Produkcyjny Inter jest ostrzejszy niż tekst w skalowanym źródle.
5. Tytuły kroków mają kontrolowane, nieco inne miejsca łamania.
6. Fotografie kafli są nowymi, syntetycznymi materiałami demonstracyjnymi.
7. Nieaktywne fotografie są czytelniejsze pod białą warstwą niż w źródle.
8. CTA mają cel minimum 40 px i mocniejszy kontrast obramowania.
9. Promień kart pochodzi ze wspólnego tokenu produktu.
10. Mobile jest osobną transformacją 2 × 2, ponieważ załącznik pokazuje
    wyłącznie układ desktopowy.

## Pomiary

- RMSE: `0,155592`;
- różnica wysokości: około `1,4%`;
- minimalny tekst: `12 px`;
- linki: `5/5`;
- kroki: `4/4`;
- overflow 1098/390 px: brak.

## Ocena

19/20: kompletność 4, geometria 4, typografia 3, gęstość 4, mobile 4.
