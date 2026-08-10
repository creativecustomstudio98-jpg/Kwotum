# R4.3 — visual QA modelu self-service w walidacji

## Zakres

- trasa: `/cennik`;
- zmieniony region: `.pricing-path-card--validation`;
- bez redesignu: karta programu pilotażowego, dolna nota i CTA, finalny
  `CtaBand`, hero, header, footer i metadata;
- kontrakt: ADR-020 oraz etap R4.3 master planu podstron.

## Artefakty

- `before/` i `after/`: 1536, 1440, 1280, 1024, 768, 430, 390, 375 i 320 px;
- `cennik-validation-before-after-1440.png`;
- `cennik-validation-before-after-390.png`;
- `before/metrics.json` i `after/metrics.json`.

## Różnica

Stan R4.2 komunikował cztery braki w zwykłej liście. R4.3 zastępuje ją
semantycznym rejestrem `<dl>`, który dla kwoty, limitów, płatności i dalszego
modelu pokazuje status oraz przyczynę. Rejestr nie jest formularzem, planem
cenowym ani roadmapą; wszystkie decyzje pozostają jawnie otwarte albo poza
obecnym MVP.

## Wynik

- HTTP 200 i errors 0: 9/9 viewportów;
- overflow: 0 px na 320–1536 px;
- tekst: minimum 12 px;
- cztery uporządkowane decyzje na każdym viewporcie;
- desktop: zwarty rejestr dwukolumnowy;
- mobile: pionowe rekordy bez przycięcia;
- brak kwot, trialu, płatności i kontrolki zakupu;
- axe, forced colors, długie copy i klawiatura: PASS.
