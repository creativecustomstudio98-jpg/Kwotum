# Lorum — responsive i layout integrity

**Status:** CANONICAL CANDIDATE  
**Owner:** Product Design + Frontend + QA  
**Last reviewed:** 2026-07-26

## Cel

Żaden ekran nie może się rozjeżdżać, nakładać, obcinać treści ani generować przypadkowego poziomego scrolla. Responsive jest transformacją zadania, nie zwężeniem desktopu.

## Minimalny kontrakt CSS

- `box-sizing: border-box` globalnie.
- `min-width: 0` na flex/grid children.
- `minmax(0, 1fr)` dla elastycznych tracków.
- dynamiczna treść bez fixed height.
- brak `100vw` wewnątrz padded layoutu.
- brak `position:absolute` dla głównych regionów.
- brak ujemnych marginów i transformów do pozycjonowania layoutu.
- brak `overflow-x:hidden` jako maskowania problemu.
- długie wartości zawijają się lub mają kontrolowane ellipsis z pełną wartością dostępną.
- obrazy/SVG/canvas mieszczą się w kontenerze.

## Viewporty

- 320×800
- 375×812
- 390×844
- 430×932
- 768×1024
- 1024×768
- 1280×800
- 1440×900
- 1536×1024

## Scenariusze danych

- długa polska nazwa firmy,
- długi e-mail,
- bardzo długi URL,
- długi status/etykieta,
- 0 rekordów,
- 1 rekord,
- 100+ rekordów,
- wiele plików,
- błąd walidacji w każdym polu,
- 200% zoom,
- mobile keyboard,
- reduced motion.

## Gate

- `documentElement.scrollWidth <= clientWidth + 1`,
- 0 niezamierzonych kolizji oznaczonych `data-no-overlap`,
- sticky footer/actions nie zasłaniają treści,
- essential content nie zależy od tooltipu,
- mobile JTBD jest wykonalny,
- brak zagnieżdżonych scrolli bez uzasadnienia,
- screenshot przed i po.
