# Roadmap

**Ostatni przegląd:** 2026-07-29

Roadmap jest sekwencją redukcji ryzyka, nie obietnicą dat. Szczegółowy zakres,
gate'y i wyniki etapów utrzymuje `TASKS.md`, a program dojścia do pilota
i produkcji opisuje `PRODUCTION_READINESS_PLAN.md`.

## Stan produktu

| Obszar                    | Stan                                      | Następny wymagany wynik                         |
| ------------------------- | ----------------------------------------- | ----------------------------------------------- |
| Fundament, Auth i tenancy | lokalnie ukończone                        | zamrożony commit i zielone zdalne CI            |
| Flow, publikacja i widget | lokalnie ukończone                        | utrzymanie pełnego gate'u na release candidate  |
| Silnik pricing/scoring    | gotowy w TypeScript i PostgreSQL          | self-service UI w builderze                     |
| Builder pytań i sekcji    | lokalnie ukończony dla obecnego kontraktu | tryby Wycena, Scoring i Wynik                   |
| Leady, pliki i prywatność | lokalnie ukończone technicznie            | zatwierdzone polityki i produkcyjne workery     |
| Powiadomienia             | outbox, renderer i test mode gotowe       | provider, domena, scheduler i alerty            |
| Analityka                 | lokalnie ukończona                        | purge scheduler i monitoring                    |
| WordPress                 | lokalnie ukończony                        | test na reprezentatywnych hostach pilota        |
| Webhook                   | wymagany w MVP, brak implementacji        | ADR-033 i implementacja albo redukcja scope     |
| Security/compliance       | lokalny audyt bez znanych critical/high   | zdalne skany, prawo, rate limit, WAF i operacje |
| Marketing i UI            | lokalnie ukończone                        | tylko regresje blokujące ścieżkę lub dostępność |
| Staging i produkcja       | lokalny kontrakt readiness gotowy         | Etap 13A po zakończeniu 12ZD–12ZG               |

## Najbliższa kolejność

| Etap | Status        | Wynik                                              | Gate                                                        |
| ---- | ------------- | -------------------------------------------------- | ----------------------------------------------------------- |
| 12ZC | ukończony     | kanoniczny program domknięcia produktu i produkcji | spójny plan, blocker → etap → dowód                         |
| 12ZD | w toku        | czysty, audytowalny baseline repozytorium          | immutable SHA, czysty checkout, zielone CI/Semgrep/Gitleaks |
| 12ZE | nierozpoczęty | self-service pricing, scoring i wynik w builderze  | konfiguracja → publikacja → widget → lead                   |
| 12ZF | nierozpoczęty | webhook v1 albo formalna redukcja MVP              | brak konfliktu wymagania–kod                                |
| 12ZG | nierozpoczęty | reguły i UAT 1–3 firm pilotażowych                 | osobne zatwierdzone przypadki i go/no-go                    |
| 12ZJ | ukończony     | lokalny liveness/readiness i runtime smoke         | RLS, build oraz smoke local/production                      |
| 13A  | nierozpoczęty | staging i produkcyjna infrastruktura               | odseparowane środowiska, schedulery, health/readiness       |
| 13B  | nierozpoczęty | bezpieczeństwo, prawo i gotowość operacyjna        | DPA, rate limit, monitoring, runbooki, manual accessibility |
| 13C  | nierozpoczęty | przećwiczony release candidate                     | restore, rollback i pełna release checklist                 |
| 13D  | nierozpoczęty | kontrolowany pilot jednej organizacji              | review wyników i decyzja przed kolejnym tenantem            |

## Po pilocie

Rozszerzenia nie mogą wyprzedzać stabilności głównej ścieżki. Kolejność po
udanym pilocie zależy od danych, ale pozostają poza MVP:

- płatności, plany i limity self-service;
- Editor/Viewer i rozwinięta delegacja agencyjna;
- natywne CRM-y i kalendarze;
- zaawansowane grupy IF/AND/OR, jeżeli prosty model okaże się niewystarczający;
- wielojęzyczność i zaawansowany white-label;
- AI summaries i marketplace szablonów.

## Zasada go/no-go

Nie przechodzimy do 13A przed zamknięciem 12ZD–12ZG. Pilot z prawdziwymi danymi
nie rozpoczyna się na podstawie lokalnego builda ani samego stagingu. Publiczna
produkcja wymaga osobnej bramki po wynikach kontrolowanego pilota.
