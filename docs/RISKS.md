# Rejestr ryzyk

| Ryzyko                                              | P/I           | Odpowiedź                                                    | Właściciel / trigger                |
| --------------------------------------------------- | ------------- | ------------------------------------------------------------ | ----------------------------------- |
| Błędny przedział ceny szkodzi zaufaniu              | śr/wys        | wersje, test cases, disclaimer, serwerowa kalkulacja         | Product; reklamacje/duże odchylenia |
| Zbyt długi flow obniża conversion                   | wys/śr        | szablony, „nie wiem”, drop-off, testy jakości                | Product                             |
| Lead quantity rośnie kosztem jakości                | śr/wys        | jakość jako guardrail, explainable score                     | Sales                               |
| Tenant leakage / IDOR                               | nisk/wys kryt | RLS, tenant context, negatywne testy, audyt                  | Security                            |
| Upload malware lub wyciek                           | śr/wys        | allowlist, magic bytes, prywatny bucket, kwarantanna roadmap | Security                            |
| Nadużycie publicznego widgetu                       | wys/śr        | rate limit, Turnstile, limity, idempotencja                  | Platform                            |
| CSS/JS hosta psuje widget                           | wys/śr        | Shadow DOM, compatibility suite, fallback                    | Widget                              |
| Zależność od Supabase/dostawców                     | śr/śr         | adaptery, eksport, backup, monitoring limitów                | Architecture                        |
| Koszty eventów/storage rosną                        | śr/śr         | retencja, agregacja, limity planów                           | Product/FinOps                      |
| Brak podstaw prawnych/źle skonfigurowane zgody      | śr/wys        | privacy controls i review prawny                             | Legal/Product                       |
| Nazwa „Lorum” koliduje lub domeny niedostępne       | śr/wys        | working title, profesjonalny search, shortlist nazw          | Founder przed launch                |
| Narzędzia konkurencji szybko kopiują funkcje        | wys/śr        | pionowe szablony, wdrożenie, lead workflow                   | Product                             |
| Agencja uzyskuje nadmierny dostęp                   | śr/wys        | jawne role/delegacja, audit, tenant boundaries               | Security                            |
| Scope creep buildera                                | wys/śr        | non-goals, gate’y, brak node graph                           | Product                             |
| Obraz UI zostaje potraktowany jako zgoda na funkcję | wys/wys       | ADR-028, screen spec, scope review przed etapem              | Product/Engineering                 |
| Nowszy załącznik nie ma lokalnego oryginału         | śr/śr         | reference gaps; brak visual PASS bez SHA i overlay           | Design/Visual QA                    |
| Równoległe dokumenty V6 opisują inny kontrakt       | śr/wys        | `docs/INDEX.md`, inventory i etapowa archiwizacja            | Documentation                       |

P/I oznacza prawdopodobieństwo/wpływ. Critical security risk blokuje przejście etapu.
