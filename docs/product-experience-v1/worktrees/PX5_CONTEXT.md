# PX5 — context i prefill

**Główne pliki:** installation contract, public API guard, session RPC, lead
snapshot, analytics source i WordPress connector.  
**Zakazane:** dowolne metadata, sekrety w URL, zaufanie wartościom hosta.

## Wynik

Host może przekazać typowany, tenantowo skonfigurowany kontekst produktu lub
CTA. Serwer waliduje go przed zapisem, a panel pokazuje źródło bez mieszania go
z odpowiedzią użytkownika.

## Ryzyka

PII w analytics, payload inflation, spoofing produktu, origin bypass i utrata
kompatybilności hosted linku.

## Realizacja lokalna — 2026-08-25

- kontrakt i model zaufania: `../PX5_CONTEXT_PREFILL_CONTRACT.md`;
- implementacja: FlowDocument v3, builder, publiczne API, kanoniczny snapshot
  sesji i leada, potwierdzenie przed odpowiedzią, panel oraz WordPress;
- stare zdjęcia i wcześniejsze referencje wizualne nie były używane;
- wdrożenie zewnętrzne pozostaje poza zakresem;
- stan gate’u i wyniki testów: `../PX5_IMPLEMENTATION_REPORT.md`.
