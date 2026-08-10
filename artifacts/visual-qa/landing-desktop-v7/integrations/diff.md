# Visual QA — integracje V7-04

- Referencja: `docs/ui/landing-desktop-v7/reference/04-integrations.png`
- Viewport i wynik: 1672 × 941 px
- Finalny RMSE: `9815.64 (0.149777)`
- Krytyczne osie: kicker `y 58.4`, H2 `y 139.2`, opis `y 228.6`, stage
  `x 139 / y 333.6 / 1394 × 390`, rail `x 139 / y 765.6 / 1394 × 116`.
- Największa kontrolowana różnica: CRM i Google Sheets zostały zastąpione
  istniejącymi kanałami WordPress i hosted link.
- Pass 1 → final: stage `y 337 → 333.6`, H2 `y 133.6 → 139.2`, rail
  `y 771 → 765.6`, proste łączniki → łamane ścieżki, badge `11.2 → 12 px`.
- Brak poziomego overflow; Playwright marketing 21/21 PASS.
