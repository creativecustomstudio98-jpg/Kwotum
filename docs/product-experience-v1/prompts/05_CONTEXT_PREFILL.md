# PROMPT 05 — PX5 bezpieczny context i prefill

Zaprojektuj jawny kontrakt host → sesja → lead. Nie dodawaj ogólnego worka
metadata.

## Zadanie

1. ADR z modelem zaufania, threat model i rollbackiem.
2. Tenantowa konfiguracja dozwolonych kluczy, typów, limitów i widoczności.
3. Walidacja dokładnego originu i podpis/serwerowe potwierdzenie tam, gdzie
   host nie może być źródłem prawdy.
4. Rozróżnienie: kontekst informacyjny, prefill potwierdzany oraz wartość
   ukryta systemowa.
5. Snapshot źródła przy leadzie i redakcja analytics/logów.
6. WordPress i hosted link muszą zachować kompatybilność.
7. Test Fortez: `model`/`product_id` bez ponownego pytania i bez możliwości
   nadpisania ceny lub tenant ID.

## Testy negatywne

Obcy origin, obcy tenant, nieznany klucz, zły typ, za duży payload, URL z PII,
próba nadpisania zgody/ceny/score/routingu, replay i sesja wygasła.

Pełny gate security, RLS, E2E i dokumentacja. Raport i STOP.
