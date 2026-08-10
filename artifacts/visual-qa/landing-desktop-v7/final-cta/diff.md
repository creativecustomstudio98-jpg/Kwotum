# Visual QA — finalne CTA V7-07

- Referencja: `docs/ui/landing-desktop-v7/reference/07-final-cta.png`
- Viewport i wynik: 1672 × 941 px
- Finalny RMSE: `9602.12 (0.146519)`
- Krytyczne osie: panel `x 64 / y 79.8 / 1544 × 777`, logo
  `x 116.2 / y 128.0`, H2 `x 116.2 / 534 × 194.4`, opis `y 508.8`, CTA
  `y 641.9 / 68 px`, proof `x 866.6 / y 188.0 / 674 × 566`, fakty `y 770.8`.
- Największa kontrolowana różnica: 128/+20%, 72/+15% i procenty 85/72/68/61
  zastąpiono pięcioma grupami danych, czterema kanałami i demonstracyjnym
  score 87/100.
- Pass 1 → final: H2 `568 → 534 px`, opis `y 498.4 → 508.8`, CTA
  `y 631.5 → 641.9`, logo `y 126.4 → 128.0`, fakty `y 768.8 → 770.8`.
- Dwa CTA mają działające cele; nie dodano formularza ani atrap akcji.
- Brak poziomego overflow; Playwright marketing 23/23 PASS.
