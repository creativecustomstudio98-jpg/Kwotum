# 12 — Macierz odbioru ekranów

**Status:** CANONICAL

| Ekran | Główny JTBD | Hard requirements | Referencja |
|---|---|---|---|
| Dashboard | zrozumieć stan i działanie | attention, metryki z kontekstem, ostatnie leady, next step | `dashboard-*` |
| Leady | znaleźć i obsłużyć rekord | search, filters, sort, pagination, mobile quick contact | `leads-*` |
| Lead detail | ocenić i przejąć leada | source answers, score reasons, files, contact, status, history | `lead-detail-*` |
| Processes | znaleźć/testować/publikować flow | status/version/install/metrics/actions | analogia builder/templates |
| Builder | edytować proces | 3 kolumny desktop, drill-down mobile, real preview, autosave | `builder-*` |
| Rules | skonfigurować działanie | IF/THEN, validation, test, server consistency | `rules-desktop` |
| Pricing | skonfigurować wynik ceny | breakdown, min/max, currency, rounding, disclaimer | `rules-desktop` |
| Scoring | sklasyfikować lead | deterministic rules, reasons, category | `rules-desktop` |
| Results | skonfigurować wynik klienta | price mode, summary, CTA, disclaimer, next step | `widget-result-desktop` |
| Analytics | znaleźć drop-off i jakość | definitions, funnel, trend, sources, low-sample state | `analytics-desktop` |
| Templates | rozpocząć z realnego wzorca | questions/rules/results counts, copy to draft | `templates-desktop` |
| Installation | uruchomić widget | modes, code, allowlist, diagnostics, test | `installation-desktop` |
| Integrations | monitorować połączenia | state, config, webhook log, retry, security | `integrations-desktop` |
| Agency | zarządzać klientami | explicit tenant context, usage, clone, white-label | `clients-desktop` |
| Settings | bezpiecznie zmienić konfigurację | categories, permissions, validation, danger zone | `settings-desktop` |
| Onboarding | opublikować pierwszy proces | progress, save, template, test, install | `onboarding-*` |
| Widget | odpowiedzieć i wysłać lead | one question, progress, autosave, validation, mobile-first | `widget-*` |

## Odbiór każdego ekranu

- [ ] JTBD działa end-to-end
- [ ] dane nie są atrapą
- [ ] loading
- [ ] empty
- [ ] error
- [ ] permission
- [ ] desktop
- [ ] tablet
- [ ] mobile
- [ ] keyboard
- [ ] focus
- [ ] visual diff
- [ ] tests
- [ ] docs
