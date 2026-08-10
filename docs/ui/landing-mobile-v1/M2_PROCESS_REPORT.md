# Landing mobile V1 — raport M2 proces

**Status:** PASS lokalny; M2 zamknięty
**Data:** 2026-08-02
**Viewporty odbioru:** 320, 375, 390 i 430 px
**Kontrola regresji:** 768 × 1000 i 1440 × 1000 px

## Zakres

Etap obejmuje wyłącznie sekcję „Od niepełnego zapytania do gotowego leada”.
Trzy kroki zostały przekształcone z wysokich, desktopowych kart w jedną zwartą
sekwencję mobilną. Treść, kolejność DOM, semantyczne `ol`, liniowe ikony i
zaakceptowany desktop V7 pozostają bez zmian.

Nie zmieniono kolejnych sekcji, API, routingu, auth, RLS, tenant scope,
pricingu, scoringu ani odłożonego cleanupu D5.

## Diagnoza przed zmianą

Mobilny reflow zachowywał desktopową wysokość minimalną kart, szerokie puste
pole pod ikoną oraz 64-pikselowe łączniki. Przy 425 px sekcja miała 1618,3 px,
każda karta 377,3 px, a same przerwy między kartami po 64 px. Kroki były
poprawne semantycznie, ale wyglądały jak trzy niezależne plansze zamiast jednej
szybkiej sekwencji.

## Geometria przed i po

| Pomiar                     |           Przed |                  Po |
| -------------------------- | --------------: | ------------------: |
| sekcja przy ok. 425/430 px |       1618,3 px |           1146,5 px |
| sekcja przy 390 px         |       1618,3 px |           1146,4 px |
| sekcja przy 320 px         |   ponad 1600 px |           1178,8 px |
| karta przy 390 px          |        377,3 px |            243,8 px |
| karta przy 320 px          |        377,3 px |            260,6 px |
| łącznik                    |      64 × 64 px |          48 × 48 px |
| bezpieczna oś 390 px       | pełna szerokość | `x=16–374`, `w=358` |
| bezpieczna oś 320 px       | pełna szerokość | `x=12–308`, `w=296` |

Wysokość spadła o około 29%, a cały opis pozostaje widoczny bez skracania i
bez tekstu mniejszego niż 16 px.

## Decyzje projektowe

- numer i ikona tworzą wspólny górny wiersz, więc krok można zeskanować przed
  przeczytaniem opisu;
- karta używa `min-width: 0`, siatki `2.5rem minmax(0, 1fr)` i wysokości
  wynikającej z treści zamiast desktopowego `min-height`;
- szerokość sekwencji to `viewport - 32 px`, a przy 320 px `viewport - 24 px`;
- nagłówek używa `clamp()` i zbalansowanego łamania, bez utraty słów;
- 48-pikselowe, centralne łączniki spełniają minimum dotykowe i jednoznacznie
  prowadzą w dół;
- subtelna dolna powierzchnia nadal łączy karty wizualnie, ale nie maskuje
  overflow;
- override kończy się na 640 px, dlatego tablet i desktop zachowują odebraną
  kompozycję.

## Artefakty

- baseline 390: `artifacts/visual-qa/landing-mobile-v1/m2/before-390.png`;
- baseline 320: `artifacts/visual-qa/landing-mobile-v1/m2/before-320.png`;
- final 320/390/430: `artifacts/visual-qa/landing-mobile-v1/m2/after-*.png`;
- kontrola 768/1440: `artifacts/visual-qa/landing-mobile-v1/m2/after-768.png`
  i `after-1440.png`;
- side-by-side: `artifacts/visual-qa/landing-mobile-v1/m2/before-after-390.png`
  i `before-after-320.png`;
- opis różnic: `artifacts/visual-qa/landing-mobile-v1/m2/diff.md`.

RMSE: **nie dotyczy** — etap zmienia mobilną geometrię, a nie odtwarza raster
1:1. Ocena visual QA: **19/20** — kompletność 4, geometria 4, typografia 4,
gęstość 4, transformacja mobile 3.

## Gate i bezpieczeństwo

- geometria 320/375/390/430 px, łączniki 48 × 48 px i tekst 16 px — PASS;
- kolejność DOM, semantyczne `ol` oraz pełne copy — PASS;
- brak poziomego overflow 320–430 px — PASS;
- snapshoty 768 i 1440 px pozostały bez zmiany — PASS;
- marketingowy Playwright M2: 4/4; snapshot regression: 5/5; pełny plik:
  29/29 — PASS;
- `pnpm lint` i `pnpm typecheck` — po 8/8 zadań PASS;
- `pnpm test` — unit 15/15 zadań, web 85/85, RLS i WordPress PASS;
- `pnpm build` — 8/8 zadań, 39 tras, widget 17 269 B gzip — PASS;
- format plików M2 i `git diff --check` — PASS;
- root `pnpm format:check` — FAIL wyłącznie na dziesięciu nietkniętych plikach
  równoległego `artifacts/promo/`; żaden nie należy do zakresu M2;
- nowe zależności: brak; logika produktu i dane: bez zmian;
- visual QA 320/390/430 oraz identyczność artefaktów 768/1440 z aktywnymi
  snapshotami — PASS.

## Ryzyka i następny etap

Przy 320 px wysokość pierwszej i drugiej karty rośnie wraz z naturalnym
zawijaniem polskiego copy, ale nadal mieści się w limicie 285 px i nie wymaga
skracania tekstu. Tablet 768 px celowo zachowuje wcześniejszy, bardziej
oddechowy układ i zostanie oceniony ponownie dopiero w M9.

Następny dozwolony etap: **M3 — cztery karty kluczowych danych**. Nie
rozpoczynaj M4 ani cleanupu D5 w tym samym przebiegu.

```text
STOP — M2 PROCES ZAKOŃCZONY. M3 NIE ROZPOCZĘTO.
```
