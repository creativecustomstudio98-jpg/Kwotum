# Landing desktop V7 — raport odbioru sekcji pricingu

**Status:** PASS lokalny; sekcja zamknięta przed FAQ
**Data:** 2026-08-02
**Viewport:** 1672 × 941 px
**Referencja:** `reference/05-pricing.png`, SHA-256
`9b0d2e08274cee4622d2dbbbbe26cf1da781f331e00431ba22355f82b709c1fc`

## Zakres i źródło prawdy

Mikroetap przebudowuje wyłącznie sekcję `data-home-section="pilot"`. W miejsce
ciemnego panelu CTA wprowadza geometrię V7-05: centralny nagłówek, dwa warianty
rozpoczęcia współpracy, listy zakresu, działające CTA i dolny pasek trzech
warunków.

Publiczne ceny, limity planów, subskrypcja, trial i płatności nadal nie są
zatwierdzone. Zgodnie z `MARKETING_IMPLEMENTATION.md` i audytem referencji
dwukolumnowa kompozycja opisuje więc rzeczywisty pilotaż oraz decyzję o dalszym
rozwoju, bez kwot 249/549 zł i bez pozorowania checkoutu.

## Implementacja i uczciwość produktu

- „Pilotaż” obejmuje warsztat jednego procesu, konfigurację pytań i wyniku,
  osadzenie lub hosted link oraz wspólną weryfikację jakości leadów;
- „Dalszy rozwój” jest decyzją po pilotażu, a nie dostępnym publicznie planem;
- model self-service jest jawnie oznaczony jako jeszcze nieustalony;
- oba CTA są prawdziwymi linkami do aktualnej strony `/cennik`;
- UI, ikony, checki i karty są code-native HTML/CSS/SVG;
- nie dodano ceny, okresu rozliczenia, limitu leadów, trialu, karty płatniczej,
  fakturowania ani obietnicy rezygnacji;
- API, baza, RLS, tenant scope, pricing engine i scoring nie zostały zmienione.

## Potwierdzona geometria 1672 × 941 px

| Region      | Referencja V7-05 | Implementacja finalna |
| ----------- | ---------------: | --------------------: |
| sekcja      |     `1672 × 941` |          `1672 × 941` |
| kicker      |     około `y 54` |              `y 53.6` |
| H2          |    około `x 381` |             `x 381.8` |
| H2          |    około `y 122` |             `y 121.6` |
| opis        |    około `y 194` |             `y 194.4` |
| lewa karta  |   `x 313, y 281` |    `x 313.5, y 281.1` |
| lewa karta  |      `494 × 541` |           `494 × 541` |
| prawa karta |   `x 830, y 279` |    `x 830.5, y 281.1` |
| prawa karta |      `504 × 543` |           `504 × 541` |
| dolny pasek |    około `y 852` |             `y 852.5` |

Desktop nie ma poziomego overflow. Dwie karty pozostają obok siebie przy
1440/1024 px, przechodzą do jednej kolumny przy 768 px i zachowują pełną treść
przy 390/320 px.

## Dwa passy i główne korekty

1. Stara sekcja miała około 472 px wysokości i ciemnozielone tło → finalnie
   jasna sekcja 941 px zgodna z V7-05.
2. Jeden ogólny blok CTA zastąpiono dwoma rzeczywistymi etapami współpracy.
3. Pierwszy pass centrował karty przy `x 326/843` → finalnie `x 314/831`.
4. Pierwszy pass zaczynał karty przy `y 283` → finalnie `y 281.1`.
5. Lewy tytuł łamał się na dwa wiersze i przesuwał separator → skrócono go do
   uczciwego „Pilotaż”, a jeden proces opisuje lista zakresu.
6. H2 miał około 880 px szerokości → finalnie około 908 px jak w referencji.
7. Opis przesunięto z `y 196.7` do `y 194.4`.
8. Karty ustalono na `494/504 × 541 px`, zachowując różną szerokość V7-05.
9. CTA są linkami do `/cennik`, a nie atrapami wyboru lub zakupu planu.
10. Dolne claimy trial/karta/rezygnacja zastąpiono prawdziwymi warunkami:
    jeden proces, indywidualna wycena i decyzja po pilotażu.

## Artefakty i visual QA

- `artifacts/visual-qa/landing-desktop-v7/pricing/before-1672x941.png`;
- `artifacts/visual-qa/landing-desktop-v7/pricing/pass-1-1672x941.png`;
- `artifacts/visual-qa/landing-desktop-v7/pricing/after-1672x941.png`;
- `artifacts/visual-qa/landing-desktop-v7/pricing/overlay-1672x941.png`;
- `artifacts/visual-qa/landing-desktop-v7/pricing/diff-1672x941.png`;
- `artifacts/visual-qa/landing-desktop-v7/pricing/diff.md`.

Finalny znormalizowany RMSE: **0,155654**. Największa kontrolowana różnica
wynika z zastąpienia niezatwierdzonych cen i claimów prawdziwym copy pilotażu.
Krytyczne osie nagłówka, kart, CTA i dolnego paska pokrywają referencję z
odchyleniem około 0–2 px.

Ocena visual QA: **19/20** — kompletność 4, geometria 4, typografia 4,
gęstość 4, transformacja mobile 3. Mobile przechodzi reflow i smoke, ale nie ma
osobnej zaakceptowanej referencji tego regionu.

## Gate

- `pnpm exec prettier --check <pliki mikroetapu>` — PASS;
- `pnpm format:check` — wyjątek worktree: FAIL wyłącznie na nieśledzonym,
  użytkowym `artifacts/promo/lorum-launch-v2/STORYBOARD.md`; plik nie należy do
  etapu i pozostał nietknięty;
- `pnpm lint` — 8/8 PASS;
- `pnpm typecheck` — 8/8 PASS;
- `pnpm test:unit` — 15/15 zadań PASS; web 85/85;
- `pnpm build` — 8/8 PASS, 39 tras, widget 17 269 B gzip;
- `pnpm exec playwright test tests/e2e/marketing.spec.ts` — 21/21 PASS;
- axe, klawiatura, no-JS, reduced motion, forced colors, breakpointy i brak
  poziomego overflow — PASS;
- test zabrania na home kwot w złotych, „14 dni” oraz karty płatniczej;
- kontrola podglądu produkcyjnego — dwie karty i brak błędów/warningów konsoli.

## Ryzyka i kryteria odbioru

- To opis programu pilotażowego, nie publiczna oferta handlowa ani plan
  subskrypcyjny.
- Oba CTA prowadzą do jednej kanonicznej strony `/cennik`, ponieważ osobny
  checkout i formularz kontaktowy nie należą do obecnego zakresu.
- Stare, nieużywane selektory poprzedniej sekcji pozostają do audytowanego
  cleanupu po zamknięciu aktywnego desktopu; nie usuwano ich w tym mikroetapie.
- `artifacts/promo/` pozostał nietknięty; jego niezależny błąd Prettiera jest
  jedynym wyjątkiem pełnego root gate'u.

Następna dozwolona sekcja to wyłącznie FAQ i panel pomocy według
`reference/06-faq.png`, bez fikcyjnego telefonu, e-maila, statystyk i SLA.

```text
STOP — PRICING ZAKOŃCZONY. FAQ NIE ROZPOCZĘTO.
```
