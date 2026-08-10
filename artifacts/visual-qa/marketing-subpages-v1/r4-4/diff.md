# R4.4 `/cennik` — visual QA

## Zakres

Porównanie obejmuje wyłącznie dolną notę/kryteria zakresu i finalne CTA.
Hero oraz dwie karty modelu współpracy są zamrożone.

## Artefakty porównawcze

- `scope-1440-before-after.png`
- `scope-390-before-after.png`
- `final-cta-1440-before-after.png`
- `final-cta-390-before-after.png`
- `before/metrics.json`
- `after/metrics.json`
- `after/cennik-full-1440.png`
- `after/cennik-full-390.png`

## Wynik

- HTTP 200: 9/9 viewportów;
- błędy konsoli/pageerror: 0;
- poziomy overflow: 0 px;
- najmniejszy tekst: 12 px;
- oba CTA: równa geometria 9/9;
- visual score: 19/20.

Mobile świadomie jest dłuższy: zamiast krótkiego ostrzeżenia pokazuje trzy
kryteria, dwa rezultaty i jawne fakty końcowe. Treść nie jest ukrywana ani
ściskana poniżej przyjętego minimum.
