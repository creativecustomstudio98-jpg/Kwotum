# Landing desktop V7 — raport odbioru D3

**Status:** PASS lokalny; etap zamknięty i zatrzymany przed następną sekcją
**Data:** 2026-08-02
**Referencja:** `reference/03-key-information.png`, 1672 × 941 px, SHA-256
`f659ff69af90114cab05774f95dd1a8f7432c4cb4d75cddabbd4b7e3b776ff27`

## Zakres

D3 przebudowuje wyłącznie region `client-demo` do statycznego, semantycznego
proofu czterech grup danych: budżetu, terminu, plików i zdjęć oraz przykładowego
wyniku kwalifikacji. Cztery karty, ikony, miniatura planu i pierścień wyniku są
code-native. Dwa kadry fotograficzne korzystają z istniejących lokalnych assetów
runtime; tekst i kontrolki nie są rastrem.

Wartości są jawnie opisane w nazwie dostępnej jako dane demonstracyjne. Wynik
`87` nie jest przedstawiany jako statystyka klienta ani obietnica biznesowa.
Poprzednie interaktywne demo nie jest już renderowane na `/`, ale jego pliki nie
zostały usunięte przed etapem cleanupu D5. CTA „Zobacz demo” prowadzi teraz do
istniejącego, pełnego przykładu leada `#przykladowy-lead`.

## Potwierdzona geometria 1672 × 941

| Region          |           Referencja | Implementacja finalna |
| --------------- | -------------------: | --------------------: |
| sekcja          |         `1672 × 941` |          `1672 × 941` |
| nagłówek        |    około `y 198–321` |     około `y 197–320` |
| opis            |    około `y 369–420` |     około `y 369–416` |
| siatka kart     |   około `x 109–1554` |    około `x 109–1554` |
| karty           |    około `y 481–816` |     około `y 480–815` |
| szerokości kart | `324/320/345/355 px` |  `324/320/345/355 px` |
| przerwy         |  około `34/33/34 px` |   około `34/35/35 px` |

Znormalizowany RMSE całej sekcji wynosi `0.137486` (pierwszy pass:
`0.146148`). Obraz różnicowy pozostaje wrażliwy na odmienne fotografie i
renderowanie fontu, dlatego wynik wspiera, ale nie zastępuje review geometrii.

## Dwa passy i największe różnice

Pierwszy pass ujawnił następujące rozbieżności; wartości po strzałce opisują
finalną korektę albo świadomie zachowaną różnicę:

1. siatka zaczynała się około 5 px za daleko w prawo → szerokość osi zwiększona
   z 1445 do 1455 px;
2. karty zaczynały się około 11 px za wysoko → rytm heading/body przesunął je do
   `y≈480`;
3. drugi wiersz H2 był około 11 px za wysoko → line-height ustawiony na 1.19;
4. pierwszy wiersz H2 był około 70 px za wąski → 64 px i osobny tracking
   `-0.036em` dla mocnego wiersza;
5. drugi wiersz H2 był około 70 px za wąski → tracking regularnego wiersza
   `0.005em`;
6. opis zaczynał się około 10 px za wysoko → finalnie `y≈369`;
7. wysokość kart była około 1–2 px za mała → finalnie 335 px;
8. zdjęcia z referencji nie istnieją w repo → użyto dwóch istniejących assetów
   kuchni/branż bez kopiowania rastra UI;
9. miniatura rzutu była fotografią w referencji → odtworzono ją semantycznie w
   CSS, bez dodawania obcego pliku;
10. kształty ikon i rasteryzacja fontu pozostają optycznie odmienne o kilka
    pikseli → zachowano jednolite SVG projektu i dostępny font runtime.

## Artefakty i ocena

- `artifacts/visual-qa/landing-desktop-v7/d3/reference-1672x941.png` — kopia
  zablokowanej referencji;
- `artifacts/visual-qa/landing-desktop-v7/d3/pass-1-1672x941.png` — pierwszy
  render;
- `artifacts/visual-qa/landing-desktop-v7/d3/after-1672x941.png` — finalny kadr;
- `artifacts/visual-qa/landing-desktop-v7/d3/overlay-1672x941.png` — overlay 45%;
- `artifacts/visual-qa/landing-desktop-v7/d3/difference-1672x941.png` — różnica;
- `artifacts/visual-qa/landing-desktop-v7/d3/diff.md` — skrócony protokół.

Ocena: **19/20** — kompletność 4, geometria 4, typografia 4, gęstość 4,
transformacja mobile 3. Breakpointy 1440/1024/768/390/320 przechodzą reflow i
smoke, ale nie istnieje zaakceptowana referencja mobile dla tego regionu.

## Gate

- `pnpm format:check` — PASS;
- `pnpm lint` — 8/8 PASS;
- `pnpm typecheck` — 8/8 PASS;
- `pnpm test:unit` — 15/15 zadań PASS; web 85/85;
- `pnpm build` — 8/8 PASS, 39 tras, widget 17 269 B gzip;
- `pnpm exec playwright test tests/e2e/marketing.spec.ts` — 21/21 PASS;
- axe, klawiatura, no-JS, reduced motion, forced colors, reflow i brak
  poziomego overflow — PASS w zestawie marketingowym.

## Kryteria odbioru i ryzyka

- Cztery wymagane grupy danych są kompletne, czytelne i semantyczne — PASS.
- Geometria desktopu mieści się w tolerancjach kontraktu — PASS.
- Dane demonstracyjne nie udają danych klienta ani rzeczywistych KPI — PASS.
- CTA prowadzi do istniejącej sekcji, bez martwego przycisku — PASS.
- Security, API, baza, RLS i tenant scope nie zostały zmienione — PASS.
- Znane ryzyko: stary komponent demo pozostaje w kodzie legacy do
  kontrolowanego audytu importów i cleanupu D5.

## Następna dozwolona sekcja

Następny mikroetap desktopowy to wyłącznie duży przykład kompletnego leada z
następnym krokiem, mierzony z `reference/08-full-overview.png`, po czym STOP.

```text
STOP — D3 ZAKOŃCZONY. SEKCJA CZTERECH INFORMACJI ODEBRANA.
```
