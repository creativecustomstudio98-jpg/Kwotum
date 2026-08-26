# FTZ-05D — zintegrowany inline Fortez

## Źródło i viewporty

- `before/user-feedback-3338x1962.png` — produkcyjny feedback właściciela,
  3338 × 1962, SHA-256
  `237a48fd339ae123fae6677348b84bf3362a4a727fe530951290a777c3401266`.
- `after/widget-inline-integrated-1440.png` — właściwa karta renderera przy
  desktopowym viewportcie 1440 × 1000; kadr 1080 × 362.
- `after/widget-inline-integrated-390x844.png` — właściwa karta renderera przy
  viewportcie 390 × 844; kadr 390 × 466.

Źródło `before` pokazuje całą produkcyjną sekcję, a `after` izoluje dokładnie
zmieniany Shadow DOM, dlatego pikselowy overlay byłby fałszywym pomiarem.
Audytowalnym porównaniem jest side-by-side tych trzech zachowanych artefaktów;
pełna geometria sekcji zostanie sprawdzona ponownie na produkcji po zachowaniu
kolejności widget → strona Fortez.

## Największe różnice

1. usunięto białą powierzchnię i obramowanie obcej karty;
2. powierzchnia procesu używa tego samego grafitu co sekcja hosta;
3. usunięto powtórzony wordmark i podtytuł z wnętrza embedu;
4. usunięto powtórzony tytuł i wprowadzenie procesu;
5. pytanie jest pierwszym głównym elementem po progressie;
6. opcjonalna zgoda analityczna znajduje się po właściwym zadaniu;
7. zaznaczenie używa ciemnego pomarańczowego tła i pełnej ramki;
8. CTA zachowuje pomarańcz Fortez i kontrastowy ciemny tekst;
9. mobile ma jedną kolumnę bez sticky białego paska;
10. status zapisu i guidance pozostają widoczne, lecz drugoplanowe.

## Ocena

- kompletność regionów: 4/4;
- geometria i proporcje: 4/4;
- typografia i spacing: 4/4;
- gęstość i stany: 4/4;
- transformacja mobile: 4/4.

Ocena robocza izolowanej powierzchni: **20/20**, ale zgodnie z zasadą „brak
porównywalnego overlay = brak finalnego visual PASS” odbiór pełnej sekcji
pozostaje otwarty do produkcyjnego UAT po wdrożeniu obu warstw.
