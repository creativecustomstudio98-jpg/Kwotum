# Landing mobile V1 — raport M3 kluczowe dane

**Status:** PASS lokalny; M3 zamknięty
**Data:** 2026-08-02
**Viewporty odbioru:** 320, 375, 390 i 430 px
**Kontrola regresji:** 768 × 1000 i 1440 × 1000 px

## Zakres

Etap obejmuje wyłącznie sekcję „Wszystkie kluczowe informacje w jednym
miejscu”: budżet, termin realizacji, pliki i zdjęcia oraz demonstracyjny wynik
kwalifikacji. Cztery desktopowe karty zostały przekształcone w porównywalną
siatkę mobilną 2 × 2.

Treść, kolejność DOM, semantyczne `article`, fotografie, code-native ikony i
score pozostają bez zmian. Nie zmieniono przykładowego leada ani dalszych
sekcji, API, auth, RLS, tenant scope, pricingu i scoringu.

## Diagnoza przed zmianą

Reflow układał cztery karty jedna pod drugą, ale zachowywał desktopową wysokość
335 px i duże pionowe odstępy. Przy 320 px sekcja miała 2034,1 px, przy 390 px
1958,4 px, a przy 430 px 1909,8 px. Dane były czytelne, lecz wymagały
przewijania ponad dwóch ekranów i nie pozwalały szybko porównać budżetu,
terminu, materiałów oraz wyniku.

## Geometria przed i po

| Pomiar               |      Przed |                Po |
| -------------------- | ---------: | ----------------: |
| sekcja 320 px        |  2034,1 px |         1046,1 px |
| sekcja 390 px        |  1958,4 px |          964,7 px |
| sekcja 430 px        |  1909,8 px |          964,8 px |
| karta 320 px         |  288 × 335 |       142 × 279,4 |
| karta 390 px         |  358 × 335 |       173 × 260,7 |
| karta 430 px         |  398 × 335 |       193 × 260,7 |
| bezpieczna oś 320 px | `x=16–304` | `x=12–308`, 12 px |
| bezpieczna oś 390 px | `x=16–374` | `x=16–374`, 16 px |

Sekcja jest krótsza o około 49–50%, bez usuwania danych i bez poziomego
overflow.

## Decyzje projektowe

- siatka `repeat(2, minmax(0, 1fr))` utrzymuje porównywalność czterech grup i
  poprawną kolejność czytania wierszami;
- równe elastyczne wiersze z `min-height` stabilizują rytm, zapewniają oddech
  dwuwierszowym wartościom i mogą rosnąć przy powiększeniu tekstu;
- ikony 56 × 56 px zachowują rozpoznawalność bez dominowania nad wartością;
- nagłówki kart mają 16 px i kontrolowane, zbalansowane łamanie;
- budżet i termin używają pełnego copy, nawet gdy przy 320 px przechodzą na
  dwie linie;
- galeria zmienia się w czytelne 2 × 2, zamiast ściskać cztery miniatury w
  jednym rzędzie;
- score 87 zachowuje code-native pierścień, a status pozostaje etykietą
  pomocniczą powyżej minimum 12 px;
- mobilny override kończy się na 640 px, dlatego układ 768 i 1440 px pozostaje
  bez zmian.
- poniżej 280 CSS px siatka przechodzi do jednej kolumny, co zabezpiecza reflow
  odpowiadający powiększeniu około 200%.

## Artefakty

- baseline 320/390/430: `artifacts/visual-qa/landing-mobile-v1/m3/before-*.png`;
- final 320/390/430: `artifacts/visual-qa/landing-mobile-v1/m3/after-*.png`;
- kontrola 768/1440: `after-768.png` i `after-1440.png`;
- side-by-side: `before-after-320.png` i `before-after-390.png`;
- opis różnic: `artifacts/visual-qa/landing-mobile-v1/m3/diff.md`.

RMSE: **nie dotyczy** — celem jest nowa geometria mobilna, a nie zgodność
raster 1:1. Ocena visual QA: **19/20** — kompletność 4, geometria 4,
typografia 4, gęstość 4, transformacja mobile 3.

## Gate i bezpieczeństwo

- geometria 320/375/390/430 px i siatka 2 × 2 — PASS;
- równe szerokości oraz wysokości kart, tekst nagłówków 16 px — PASS;
- pełne copy, galeria, score i brak poziomego overflow — PASS;
- dedykowany test M3, zoom i regresja układu: 10/10 — PASS;
- pełny marketingowy Playwright: 34/34 — PASS;
- `pnpm lint` i `pnpm typecheck` — po 8/8 zadań PASS;
- `pnpm test` — unit 15/15 zadań, web 85/85, RLS i WordPress PASS;
- `pnpm build` — 8/8 zadań, 39 tras, widget 17 269 B gzip — PASS;
- format plików M3 i `git diff --check` — PASS;
- root `pnpm format:check` — FAIL wyłącznie na dwunastu nietkniętych plikach
  równoległego `artifacts/promo/`; żaden nie należy do zakresu M3;
- nowe zależności: brak; logika produktu, dane i bezpieczeństwo: bez zmian.

## Ryzyka i następny etap

Przy 320 px budżet, termin, tytuł wyniku i jego status naturalnie przechodzą na
dwie linie. Elastyczny wiersz zwiększa kartę do 279,4 px, zachowuje dolny
padding i nie obniża rozmiaru tekstu. Miniatury są informacyjne, nie są celami
dotykowymi.

Następny dozwolony etap: **M4 — przykładowy lead: dane → galeria → wynik →
następny krok**. Nie rozpoczynaj M5 ani cleanupu D5 w tym samym przebiegu.

```text
STOP — M3 KLUCZOWE DANE ZAKOŃCZONE. M4 NIE ROZPOCZĘTO.
```
