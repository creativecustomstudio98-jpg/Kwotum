# Visual QA — rozbudowana biblioteka szablonów

## Zakres

- trasa: `/panel/[organizationId]/szablony`;
- viewport referencyjny: 1448 × 1086;
- mobile: 390 × 844 i 320 × 800;
- referencja: `reference-1448x1086.png`;
- stan przed: `before-3338x1946.png`;
- stan końcowy: `after-v2-1448x1086.png` i `after-v2-390x844.png`.

## Świadome różnice produktowe

Referencyjne `12 szablonów`, `68% wykorzystania`, import i tworzenie własnego
szablonu nie mają modelu danych ani działania w aktualnym produkcie. Ekran
pokazuje pięć realnych `flowTemplates`, pięć kategorii, średnio 6,8 pytania
oraz istniejącą akcję utworzenia draftu. Nie dodano atrap funkcji.

## Wynik

- score: 19/20;
- kompletność: 4/4;
- geometria: 4/4;
- typografia: 4/4;
- gęstość: 4/4;
- transformacja mobile: 3/4 z powodu braku osobnej referencji telefonu;
- pięć kart w jednym rzędzie przy 1448 px;
- obrazy kart: 1,65–1,75:1 na desktopie i mobile;
- toolbar: 79–82 px;
- brak poziomego overflow przy 1448, 390 i 320 px;
- axe WCAG 2.2 AA: zero naruszeń w scenariuszu odbiorowym.

Etap 12ZD usunął dwa niezależne blokery pełnego panelu: test granic używa
rzeczywistego pola liczbowego fixture'u „Remont”, a analityka ma poprawną
semantykę metryk i kontrast mikroetykiet. Pełny pakiet panelu przechodzi 15/15
na wymuszonym standalone produkcyjnym.

## Artefakty

- `reference-vs-after.png` — zestawienie pełnych ekranów;
- `overlay-50.png` — overlay 50%;
- `difference-x3.png` — wzmocniona różnica pikselowa;
- `after-v2-1448x1086.png` — finalny desktop;
- `after-v2-390x844.png` — finalny mobile.
