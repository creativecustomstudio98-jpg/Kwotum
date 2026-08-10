# Lorum — matryca zgodności ekranów produktu

**Status:** CANONICAL
**Owner:** Product Design + Frontend + Visual QA
**Last reviewed:** 2026-07-26

| Ekran/moduł  | Krytyczna anatomia                                             | Mobile                     | Niedozwolone uproszczenie                     |
| ------------ | -------------------------------------------------------------- | -------------------------- | --------------------------------------------- |
| App shell    | dark green nav, aktywny stan, content surface, organizacja     | drawer lub bottom nav      | jednoczesny sidebar + bottom nav + sticky CTA |
| Dashboard    | context, KPI, trend, quality, latest leads, attention          | priorytet reakcji i leadów | 4 puste KPI i nic więcej                      |
| Leads        | tabs, search, filter, dense table, status, score, pagination   | compact list               | ściskanie tabeli                              |
| Lead detail  | header, score reasons, tabs, data, files, notes/status/actions | logiczny stack             | sam summary bez danych źródłowych             |
| Processes    | list/table, status, version, health, actions                   | compact rows               | duże dekoracyjne cards                        |
| Templates    | compact image cards + detail                                   | selector + detail          | marketplace poster wall                       |
| Builder      | toolbar, steps, preview/flow, inspector, validation            | Steps/Preview/Settings     | scale desktopu, pusty canvas                  |
| Logic        | IF/AND/OR/THEN, warnings, test                                 | stacked rules              | dekoracyjny graph                             |
| Pricing      | rules, conditions, min/max, simulation, errors                 | rule cards/list            | zwykły input „cena”                           |
| Scoring      | rules, thresholds, reasons, test lead                          | stacked rules              | magic AI score                                |
| Result       | config + live preview + CTA/disclaimer                         | full-width preview         | statyczna karta                               |
| Analytics    | filters, KPIs, funnel/drop-off, trends, sources/devices        | priorytet funnel/quality   | wykresy bez danych                            |
| Installation | modes, snippet, domains, diagnostics, WordPress                | guided steps               | sam kod do skopiowania                        |
| Integrations | compact rows, status, detail, mapping, logs                    | list + detail              | ogromne logo tiles                            |
| Settings     | grouped forms, toggles, actions, danger zone                   | one-column                 | przypadkowe karty                             |
| Agency       | clients, tenant switch, status, clone, usage                   | compact client list        | fikcyjne revenue KPI                          |
| Onboarding   | progress, save, template choice, test/publish/install          | keyboard-safe              | marketing carousel                            |
| Widget       | progress, question, validation, autosave, result               | mobile-first               | zależność od CSS hosta                        |
| Auth/states  | wspólny system UI, pełne komunikaty i CTA                      | responsive                 | obcy template/AI illustration                 |
