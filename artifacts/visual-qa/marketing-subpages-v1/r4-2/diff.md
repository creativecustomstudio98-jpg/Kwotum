# R4.2 — visual QA dwóch ścieżek `/cennik`

## Zakres

- trasa: `/cennik`;
- zmieniony region: `#model-wspolpracy [data-pricing-paths]`;
- pozostawione bez redesignu: hero R4.1, dolna nota i CTA modelu, finalny
  `CtaBand`, header, footer oraz metadata;
- referencja geometrii: `docs/ui/landing-desktop-v7/reference/05-pricing.png`;
- kontrakt treści: ADR-020 i audyt trasy marketing-subpages-v1.

## Artefakty

- `before/` i `after/`: 1536, 1440, 1280, 1024, 768, 430, 390, 375 i 320 px;
- `cennik-paths-before-after-1440.png`;
- `cennik-paths-before-after-390.png`;
- `before/metrics.json` i `after/metrics.json`.

## Różnica

Stan bazowy miał dwie równe, ale generyczne płaskie kolumny. Stan R4.2
zachowuje dwie ścieżki i uczciwe copy, lecz nadaje im osobne statusy, opis,
typ wyceny/modelu, cztery fakty oraz jawny rezultat. Zielona ścieżka oznacza
pilotaż dostępny teraz; neutralna ścieżka self-service komunikuje walidację i
nie wygląda jak plan możliwy do kupienia.

## Wynik

- HTTP 200 i brak console/pageerror: 9/9 viewportów;
- poziomy overflow: 0 px na 320–1536 px;
- najmniejszy tekst: 12 px;
- desktop 1024–1536: dwie równe karty;
- 320–768: jedna oś, bez przycięcia i maskowania overflow;
- brak kwot, trialu, karty, limitów planów oraz kontrolki zakupu;
- axe, forced colors, długie copy i klawiatura: PASS.
