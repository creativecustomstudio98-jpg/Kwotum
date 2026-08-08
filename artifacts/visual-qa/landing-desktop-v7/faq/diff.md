# Visual QA — FAQ V7-06

- Referencja: `docs/ui/landing-desktop-v7/reference/06-faq.png`
- Viewport i wynik: 1672 × 941 px
- Finalny RMSE: `9592.3 (0.146369)`
- Krytyczne osie: lewa `x 87`, H2 `y 158.2 / 672 × 149.8`, opis `y 322.3`,
  pierwszy wiersz `y 417.4 / 82.9 px`, panel pomocy
  `x 1079 / y 145.0 / 506 × 716`.
- Największa kontrolowana różnica: telefon, e-mail, chat, 98% i „< 2h”
  zastąpiono istniejącymi stronami produktu, RLS i zweryfikowanym MVP.
- Pass 1 → final: H2 jeden wiersz → dwa wiersze, opis
  `y 247.4 → 322.3`, akordeon `y 342.5 → 417.4`.
- Natywny akordeon otwiera się bez JavaScriptu; osobny artefakt dokumentuje stan
  `open`.
- Brak poziomego overflow; Playwright marketing 22/22 PASS.
