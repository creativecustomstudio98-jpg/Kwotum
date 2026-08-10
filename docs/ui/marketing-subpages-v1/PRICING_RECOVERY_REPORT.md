# Pricing recovery — raport odbioru `/cennik`

**Data:** 2026-08-03
**Viewport referencyjny:** 1440 × 1000 desktop, 390 × 844 mobile
**Źródło wizualne:** zaakceptowany landing Kwotum oraz referencja dwóch prostych planów
**Status:** COMPLETE

## Problem

Poprzedni R4 rozbił prostą decyzję cenową na zbyt wiele paneli, rejestrów i
warstw objaśnień. Trasa była prawdziwa funkcjonalnie, ale odbiegała od lekkiej,
spokojnej geometrii strony głównej i referencji planów. Przy 390 px dokument
miał 6206 px, a przy 1440 px 3580 px.

Dodatkowy audyt informacji ujawnił osobny błąd IA: publiczna trasa
`/integracje` nie istnieje, mimo że nagłówek używa etykiety „Integracje” dla
linku `/wordpress`. Ten problem nie został ukryty w cenniku; otrzymał osobny
następny etap R4.I.

## Zmiana

- hero sprowadzono do jednej tezy i krótkiego, prawdziwego wyjaśnienia;
- pozostawiono dokładnie dwie duże karty: dostępny program pilotażowy oraz
  jawnie niegotowy model self-service;
- usunięto wizualną sugestię publicznych kwot, triala, limitów i zakupu;
- obie karty mają ten sam rytm, szerokość i wysokość na desktopie oraz równe
  przyciski w całej macierzy viewportów;
- finalne CTA prowadzi wyłącznie do działającego opisu procesu i logowania;
- kontrast najmniejszych etykiet został podniesiony do WCAG AA.

## Pomiary

| Kryterium                             |      1440 px |           390 px |
| ------------------------------------- | -----------: | ---------------: |
| Wysokość dokumentu przed              |      3580 px |          6206 px |
| Wysokość dokumentu po                 |      2592 px |          4107 px |
| Zmiana                                |       −27,6% |           −33,8% |
| Overflow poziomy                      |         0 px |             0 px |
| Najmniejszy tekst                     |        12 px |            12 px |
| Błędy runtime w buildzie produkcyjnym |            0 |                0 |
| Szerokość kart                        | 564 / 564 px |     358 / 358 px |
| Szerokość CTA kart                    | 498 / 498 px | 312,8 / 312,8 px |

Macierz 320, 375, 390, 430, 768, 1024, 1280, 1440 i 1536 px zachowuje
HTTP 200, brak overflow, minimum 12 px tekstu i równe szerokości przycisków.

## Visual QA

- final desktop: `artifacts/visual-qa/marketing-subpages-v1/pricing-recovery/after/cennik-full-1440.png`;
- final mobile: `artifacts/visual-qa/marketing-subpages-v1/pricing-recovery/after/cennik-full-390.png`;
- before/after desktop i mobile: katalog
  `artifacts/visual-qa/marketing-subpages-v1/pricing-recovery/`;
- metryki: `after/metrics.json`;
- ocena własna: 19/20 — zgodność systemu, hierarchia, rytm i responsive są
  zamknięte; celowo nie dodano trzeciego planu ani dekoracji bez funkcji.

## Gate

- dedykowany Playwright pricing recovery: 44/44;
- pełny marketing Playwright na buildzie produkcyjnym: 178/178;
- testy jednostkowe: 155/155;
- PostgreSQL/RLS: tenant isolation, flow, widget, estimation, lead,
  notifications, analytics, WordPress connector i data governance — PASS;
- wtyczka WordPress: WP 6.9.2 i 7.0.2 na PHP 8.5.2 — PASS;
- lint: 8/8 pakietów;
- typecheck: 8/8 pakietów;
- build: 8/8 pakietów, 39 tras;
- budżet widgetu: 17 269 B gzip z limitu 92 160 B.

## Następny etap

Wyłącznie R4.I.1: publiczny shell i hero `/integracje` wraz z naprawą celu
nawigacji. Katalog integracji, status WordPressa, granice produktu i CTA
pozostają zamrożone do osobnych mikroetapów.
