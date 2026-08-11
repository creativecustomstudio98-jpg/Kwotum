# FTZ-05 — publiczna treść formularza w builderze

## Zakres i referencje

- ekran: builder procesu, zakładka `Formularz`, otwarty inspektor;
- desktop: 1448 × 1086;
- mobile: 390 × 844, aktywna zakładka `Ustawienia`;
- kanoniczna referencja desktop:
  `apps/web/public/panel/ChatGPT Image 26 lip 2026, 18_28_24.png`, SHA-256
  `918e0d8edfdb02d899310e61b36bcf25618bd1a761bf62809fb9927d4a68a526`;
- kanoniczna referencja mobile:
  `docs/ui/lorum-product-ui-reference-v1/reference/screenshots/builder-mobile.png`,
  SHA-256 `f843f541ca0ae8fa975ad67d5939b292d4e0772167ef18db0c6b5481a6961093`;
- desktop `before` pochodzi z zaakceptowanego artefaktu
  `12v-builder-state/after/autosave-1448x1086.png` sprzed tej zmiany.

## Wynik

- układ trzech kolumn, toolbar, karta podglądu i szerokość inspektora pozostały
  bez zmian;
- `Tytuł formularza` i `Wprowadzenie` mieszczą się w istniejącym przewijanym
  inspektorze, nie nachodzą na ustawienia aktywnego pytania i nie powodują
  poziomego overflow;
- etykiety, liczniki znaków, komunikaty błędów oraz obramowanie błędnego pola są
  widoczne na desktopie i mobile;
- Playwright potwierdził autosave, reload, prowadzenie fokusu do błędnego pola,
  axe WCAG A/AA/2.1 AA/2.2 AA bez naruszeń oraz overflow maksymalnie 1 px;
- dynamiczna treść procesu i dane syntetycznego tenanta różnią się od obrazów
  referencyjnych, dlatego overlay służy kontroli geometrii, a nie progowi
  pixel-perfect dla tekstu.

## Artefakty

- `desktop/before-1448x1086.png`
- `desktop/after-1448x1086.png` — SHA-256
  `88aee63abfa0b70e9a1d22ac3413a36a036740310bddcd4c02bbb6ac696b0065`
- `desktop/overlay-50-1448x1086.png`
- `desktop/difference-1448x1086.png`
- `mobile/reference-390x844.png`
- `mobile/after-390x844.png` — SHA-256
  `f6fcba77d8c25b74454792c176908c26b71f485954c9a393c1c92562f1619955`
- `mobile/overlay-50-390x844.png`
- `mobile/difference-390x844.png`

## Odbiór ręczny

PASS. Zmiana jest lokalna dla prawego inspektora, zgodna z istniejącymi
tokenami i nie rozszerza zakresu produktu. Nie zastępuje UAT publikowanego
manifestu po wdrożeniu.
