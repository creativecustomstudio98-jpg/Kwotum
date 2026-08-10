# R4.I.1 — raport odbioru hero `/integracje`

**Data:** 2026-08-03
**Viewport referencyjny:** 1440 × 1000 desktop, 390 × 844 mobile
**Źródło wizualne:** `ChatGPT Image 1 sie 2026, 19_58_24 (5).png`
**Status:** COMPLETE

## Problem

Publiczna trasa `/integracje` nie istniała, a pozycja „Integracje” we wspólnym
headerze prowadziła bezpośrednio do szczegółowej strony `/wordpress`. Pierwszy
pass nowej trasy używał ciężkiego, kremowego hero i generycznej mapy trzech
warstw. Nie odtwarzał lekkiej kompozycji zaakceptowanej strony głównej ani
dostarczonej referencji integracji.

## Zmiana

- utworzono kanoniczną trasę `/integracje` z unikalnym title, description,
  canonical i breadcrumbs;
- wspólna nawigacja prowadzi teraz do `/integracje`, a `/wordpress` pozostaje
  osobną trasą szczegółową;
- hero odtwarza geometrię referencji: wyśrodkowaną tezę, centralny rekord
  demonstracyjnego leada, cztery otaczające kanały, przerywane połączenia i
  dolny rail trzech zapewnień;
- fikcyjne CRM, webhook, arkusze i automatyzacje z referencji zastąpiono
  wyłącznie realnymi elementami produktu: widgetem, hosted linkiem,
  WordPressem i powiadomieniem e-mail;
- mobile zachowuje poprawną kolejność DOM: teza, rekord leada, kanały i rail;
- `/integracje` dodano do indeksowanych tras oraz sitemap.

## Pomiary

| Kryterium                             | 1440 px |  390 px |
| ------------------------------------- | ------: | ------: |
| HTTP                                  |     200 |     200 |
| Wysokość hero                         | 1005 px | 1794 px |
| Overflow poziomy                      |    0 px |    0 px |
| Najmniejszy tekst                     |   12 px |   12 px |
| Błędy runtime w buildzie produkcyjnym |       0 |       0 |

Macierz 320, 375, 390, 430, 768, 1024, 1280, 1440 i 1536 px zachowuje HTTP
200, brak overflow, minimum 12 px tekstu i zero błędów konsoli. Po korekcie
rytmu wysokość desktopowego hero przy 1440 px spadła z 1077 do 1005 px.

## Visual QA

- final desktop:
  `artifacts/visual-qa/marketing-subpages-v1/r4-i-1/after/integracje-hero-1440.png`;
- final mobile:
  `artifacts/visual-qa/marketing-subpages-v1/r4-i-1/after/integracje-full-390.png`;
- referencja i finalny render side-by-side:
  `artifacts/visual-qa/marketing-subpages-v1/r4-i-1/reference-vs-final-1440.png`;
- metryki: `artifacts/visual-qa/marketing-subpages-v1/r4-i-1/after/metrics.json`;
- ocena własna: 19/20 — hierarchia, osie, charakter kart, połączenia i rail
  odpowiadają referencji; treść została celowo dostosowana do realnego zakresu
  produktu zamiast kopiowania nieistniejących integracji.

## Gate

- dedykowany Playwright R4.I.1: 11/11;
- pełny marketing Playwright na buildzie produkcyjnym: 189/189;
- testy jednostkowe: 155/155;
- PostgreSQL/RLS: tenant isolation, flow, widget, estimation, lead,
  notifications, analytics, WordPress connector i data governance — PASS;
- wtyczka WordPress: WP 6.9.2 i 7.0.2 na PHP 8.5.2 — PASS;
- lint: 8/8 pakietów;
- typecheck: 8/8 pakietów;
- build: 8/8 pakietów, 40 wygenerowanych stron;
- budżet widgetu: 17 269 B gzip z limitu 92 160 B.

## Następny etap

Wyłącznie R4.I.2: osobna sekcja mapy realnych kanałów publikacji i ich
kontraktów. Status WordPressa, jawne granice innych konektorów i finalne CTA
pozostają w R4.I.3–R4.I.4.
