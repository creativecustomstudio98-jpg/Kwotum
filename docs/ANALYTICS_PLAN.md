# Plan analityki

## Eventy produktowe

`widget_loaded`, `widget_opened`, `flow_started`, `step_viewed`,
`step_answered`, `step_back`, `flow_abandoned`, `contact_started`,
`lead_submitted`, `result_viewed`, `cta_clicked`, `file_uploaded`,
`validation_error`.

Każdy event ma wersję schematu, event ID, timestamp, flow/version, pseudonimową sesję, urządzenie w niskiej granularności i źródło. Bez treści odpowiedzi i PII w narzędziu analitycznym.

## Metryki

View→start, start→completion, drop-off kroku, lead conversion, mediana czasu, rozkład jakości, źródło/urządzenie i porównanie wersji. Małe próby pokazujemy jako „za mało danych”, nie wykres.

## Governance

Słownik eventów jest kontraktem w `packages/analytics`. Zmiana nazwy wymaga
wersji/migracji. Consent i podstawa dla analityki są weryfikowane przed
implementacją; pre-submit nie identyfikuje osoby.

## Stan wdrożenia Etapu 9

ADR-019 przyjmuje jawny consent `analytics-v1`, first-party PostgreSQL,
90-dniową retencję eventów i próg 5 sesji. Eventy nie mają dowolnych metadanych
ani PII. Dashboard pokazuje konwersję, medianę czasu, drop-off, źródła,
urządzenia, wersje i jakość leadów. Szczegóły oraz ograniczenia:
`docs/ANALYTICS_IMPLEMENTATION.md`.
