# R4.I.1 — visual QA `/integracje`

## Baseline

Przed etapem publiczna trasa `/integracje` zwracała 404, a wspólna pozycja
„Integracje” prowadziła do `/wordpress`. Baseline funkcjonalny zapisuje
`before.json`.

## Referencja

Źródłem geometrii jest dostarczony obraz:
`/Users/nexora/Downloads/ChatGPT Image 1 sie 2026, 19_58_24 (5).png`.

Porównanie side-by-side z finalnym renderem 1440 px:
`reference-vs-final-1440.png`.

## Wynik

- wspólna hierarchia: pill → H1 → opis → centralny rekord → cztery kanały →
  rail;
- wspólne osie, miękkie białe karty, zielone akcenty i przerywane łączniki;
- realne kanały produktu zamiast fikcyjnych CRM, webhooków i arkuszy;
- 0 px overflow i 0 błędów runtime w dziewięciu viewportach;
- desktop 1440 px: hero 1005 px;
- mobile 390 px: hero 1794 px, kolejność DOM zgodna z kolejnością wizualną.

Ocena: **19/20**.
