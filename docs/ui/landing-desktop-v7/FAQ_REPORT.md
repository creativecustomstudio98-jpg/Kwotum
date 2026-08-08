# Landing desktop V7 — raport odbioru FAQ i panelu pomocy

**Status:** PASS lokalny; sekcja zamknięta przed finalnym CTA
**Data:** 2026-08-02
**Viewport:** 1672 × 941 px
**Referencja:** `reference/06-faq.png`, SHA-256
`ba3ecf0284c557b21363270658f4ecb2f6bd780be20cf2ed62549ae10918abc0`

## Zakres i źródło prawdy

Mikroetap dodaje wyłącznie sekcję `data-home-section="faq"` pomiędzy pricingiem
a footerem. Odtwarza V7-06: lewy nagłówek i pięć wierszy akordeonu oraz prawy,
wysoki panel pomocy z trzema źródłami, dwoma faktami produktu i dolnym CTA.

Telefon, adres e-mail, chat, 98% satysfakcji i SLA „< 2h” z referencji nie są
potwierdzonymi kanałami ani metrykami Lorum. Zostały zastąpione istniejącymi
trasami produktu, zasadą separacji organizacji przez RLS i jawnym zakresem MVP.

## Implementacja i uczciwość produktu

- pięć pytań używa natywnego `details/summary`, działa bez JavaScriptu i jest
  dostępne z klawiatury;
- odpowiedzi opisują pilotaż bez stałego SLA, opcjonalne kanały integracji,
  konfigurację Owner/Admin, serwerowy deterministyczny score oraz walidowany
  upload zdjęć i PDF;
- panel pomocy prowadzi do istniejących `/jak-dziala`, `/produkt`, `/wordpress`
  i `/cennik`;
- nie dodano `tel:`, `mailto:`, chatbota, nieistniejącego centrum pomocy ani
  gwarancji czasu odpowiedzi;
- ikony, strzałki, stany plus/minus i całe UI są code-native HTML/CSS/SVG;
- API, baza, autoryzacja, RLS, tenant scope, pricing i scoring nie zostały
  zmienione.

## Potwierdzona geometria 1672 × 941 px

| Region       |  Referencja V7-06 | Implementacja finalna |
| ------------ | ----------------: | --------------------: |
| sekcja       |      `1672 × 941` |          `1672 × 941` |
| lewa oś      |      około `x 86` |                `x 87` |
| H2           |     około `y 165` |             `y 158.2` |
| H2           | dwie linie, 62 px |      `672 × 149.8 px` |
| opis         |     około `y 320` |             `y 322.3` |
| akordeon     |     około `y 410` |             `y 417.4` |
| wiersz       |     około `83 px` |             `82.9 px` |
| panel pomocy |   `x 1078, y 146` |     `x 1079, y 145.0` |
| panel pomocy |       `506 × 715` |           `506 × 716` |

Desktop nie ma poziomego overflow. Przy 1440 px kolumny pozostają obok siebie;
przy 1024 px i mniej panel pomocy przechodzi pod FAQ. Widoki 768, 390 i 320 px
zachowują kolejność, pełną treść i minimalny rozmiar tekstu 12 px.

## Dwa passy i główne korekty

1. Przed mikroetapem region FAQ nie istniał; po pricingu następował footer.
2. Pierwszy pass zachował prawą kartę dokładnie przy `x 1079 / y 145`, ale H2
   mieścił się w jednym wierszu.
3. H2 zawężono do `10.5em`, uzyskując referencyjny podział „Najczęściej
   zadawane” / „pytania”.
4. Zmiana przesunęła opis z `y 247.4` do `y 322.3` i pierwszy wiersz akordeonu
   z `y 342.5` do `y 417.4`.
5. Akordeon otrzymał pięć równych, zamkniętych wierszy po `82.9 px`.
6. Zapisano osobny screenshot otwartego pierwszego pytania i potwierdzono
   zmianę atrybutu `open`.
7. Fikcyjne dane kontaktowe zastąpiono trzema działającymi linkami.
8. Niepotwierdzone 98% i „< 2h” zastąpiono RLS oraz zweryfikowanym MVP.
9. Pierwszy test mobilny wykrył kicker 11,52 px; podniesiono go do 12 px.
10. Ponowne 22 testy marketingowe przeszły bez błędów.

## Artefakty i visual QA

- `artifacts/visual-qa/landing-desktop-v7/faq/pass-1-1672x941.png`;
- `artifacts/visual-qa/landing-desktop-v7/faq/after-1672x941.png`;
- `artifacts/visual-qa/landing-desktop-v7/faq/open-state-1672x941.png`;
- `artifacts/visual-qa/landing-desktop-v7/faq/overlay-1672x941.png`;
- `artifacts/visual-qa/landing-desktop-v7/faq/difference-1672x941.png`;
- `artifacts/visual-qa/landing-desktop-v7/faq/diff.md`.

Finalny znormalizowany RMSE: **0,146369**. Największa kontrolowana różnica
wynika z zastąpienia niepotwierdzonych kanałów, metryk i SLA prawdziwymi
źródłami pomocy oraz zasadami produktu. Krytyczne osie panelu pomocy odbiegają
o 0–1 px, a rytm lewego regionu o około 2–7 px.

Ocena visual QA: **19/20** — kompletność 4, geometria 4, typografia 4,
gęstość 4, transformacja mobile 3. Mobile przechodzi reflow i smoke, ale nie ma
osobnej zaakceptowanej referencji tego regionu.

## Gate

- `pnpm exec prettier --check <pliki mikroetapu>` — PASS;
- `pnpm format:check` — wyjątek worktree: FAIL wyłącznie na nieśledzonych,
  użytkowych `artifacts/promo/lorum-launch-v2/STORYBOARD.md` i
  `artifacts/promo/lorum-launch-v3/STORYBOARD.md`; pliki nie należą do etapu i
  pozostały nietknięte;
- `pnpm lint` — 8/8 PASS;
- `pnpm typecheck` — 8/8 PASS;
- `pnpm test:unit` — 15/15 zadań PASS; web 85/85;
- `pnpm build` — 8/8 PASS, 39 tras, widget 17 269 B gzip;
- `pnpm exec playwright test tests/e2e/marketing.spec.ts` — 22/22 PASS;
- axe, klawiatura, no-JS, reduced motion, forced colors, breakpointy i brak
  poziomego overflow — PASS;
- test blokuje na home `tel:`, `mailto:`, „98%”, „< 2h” i fikcyjny chat.

## Ryzyka i kryteria odbioru

- RLS i MVP są faktami technicznymi, nie publicznymi statystykami skuteczności.
- `/cennik` opisuje pilotaż z wyceną indywidualną; nie jest checkoutem.
- Brak dedykowanego centrum pomocy i zatwierdzonych kanałów kontaktowych jest
  pokazany przez linki do istniejących materiałów zamiast atrap.
- Stare, nieużywane selektory poprzednich sekcji pozostają do audytowanego
  cleanupu po zamknięciu aktywnego desktopu.
- `artifacts/promo/` pozostał nietknięty; dwa niezależne błędy Prettiera w jego
  storyboardach są jedynym wyjątkiem pełnego root gate'u.

Następna dozwolona sekcja to wyłącznie końcowe CTA V7-07 według
`reference/07-final-cta.png`, bez fikcyjnych KPI, wzrostów ani gwarancji.

```text
STOP — FAQ ZAKOŃCZONE. FINALNEGO CTA NIE ROZPOCZĘTO.
```
