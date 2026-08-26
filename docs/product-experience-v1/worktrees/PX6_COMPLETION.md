# PX6 — kontakt, outcome i branding

**Główne pliki:** flow schema, estimation/outcome, lead capture, manifest,
widget, ustawienia organizacji, e-mail i testy.  
**Zakazane:** prywatny score w wyniku, niepotwierdzone SLA, dowolny CSS.

## Wynik

Proces ma wersjonowaną politykę zakończenia, kontrolowane outcome i minimalny
branding firmy. Historyczne wersje zachowują dotychczasową kolejność wynik →
kontakt.

**Stan 2026-08-25:** etap ukończony lokalnie, bez deployu. Kontrakt, migracja,
runtime, panel, integracje, testy i visual QA zostały domknięte. Szczegółowy
wynik: `../PX6_IMPLEMENTATION_REPORT.md`.

## Ryzyka

Dark patterns, prawna interpretacja wyniku, ujawnienie scoringu, zły kontrast
koloru klienta i rozjazd potwierdzeń e-mail.

## Gate

- wynik i kolejność są częścią immutable flow version;
- submit i wymagania kontaktu są potwierdzane po stronie serwera;
- publiczna projekcja nie zawiera score ani trace;
- branding ma tenant scope, automatyczny kontrast i same-origin logo;
- lint, typecheck, unit, PostgreSQL/RLS, build i visual QA są zielone;
- nie dodano zależności, custom CSS ani historycznych zdjęć.

## STOP

PX7 pozostaje nierozpoczęty. Pilot wymaga osobnego etapu, własnego gate i jawnej
decyzji GO/ITERATE/NO-GO.
