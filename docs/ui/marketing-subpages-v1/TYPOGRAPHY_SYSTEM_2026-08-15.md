# Wspólna typografia marketingu — 2026-08-15

**Status:** lokalnie ukończone, odbiór właściciela otwarty

**Zakres:** 21 publicznych tras marketingowych, desktop/tablet/mobile

**Decyzja:** ADR-051

## Wynik audytu

Przed korektą działające strony używały lokalnych skal. Desktopowe H1 miały od
około 48 do 75 px, H2 od około 17 do 64 px, a mobile H1 od około 36 do 48 px.
Różnice wynikały z osobnych arkuszy tras i powodowały zmianę hierarchii przy
przechodzeniu między stronami.

## Skala docelowa

| Rola             | Desktop > 1024 px | Tablet 769–1024 px | Mobile ≤ 768 px | Line-height |
| ---------------- | ----------------: | -----------------: | --------------: | ----------: |
| H1               |             60 px |              48 px |           42 px |        1,02 |
| H2               |             48 px |              40 px |           36 px |        1,06 |
| H3               |             20 px |              20 px |           18 px |        1,20 |
| Opis sekcji      |             18 px |              17 px |           16 px |        1,62 |
| Tekst podstawowy |             16 px |              16 px |           16 px |        1,62 |
| Kicker           |             12 px |              12 px |           12 px |        1,35 |

Tokeny i role znajdują się w `packages/ui/src/styles.css`. Moduły stron nadal
kontrolują szerokość, wyrównanie, kolor, wagę i rytm sekcji, ale nie nadpisują
rozmiaru ani line-height wspólnych ról.

## Granica systemu

Skala dotyczy narracji marketingowej: hero, nagłówków sekcji, redakcyjnych
kart, CTA i opisów wprowadzających. Nie obejmuje tekstu osadzonego wewnątrz
code-native proofów produktu, w szczególności:

- demonstracyjnego dashboardu i szczegółu leada na stronie głównej;
- kroku formularza w telefonie;
- kart kanałów i przykładowego rekordu na `/integracje`;
- `ProductWorkspace` i interaktywnego `MarketingDemo`.

Te elementy prezentują typografię aplikacji, więc sztuczne podniesienie ich H2
do 48 px zniszczyłoby wiarygodność makiety i hierarchię wewnętrznego UI.

## Walidacja

`tests/e2e/marketing-typography-system.spec.ts` przechodzi po wszystkich 21
trasach w 1440 × 1000, 1024 × 1000 i 390 × 844 px. Gate sprawdza:

- dokładny computed font-size każdej wspólnej roli;
- dokładnie jeden H1 strony;
- brak nieoznaczonych H1/H2/H3 poza allowlistą proofów produktu;
- brak poziomego overflow.

Wynik lokalny: 3/3 testy, 63 pomiary tras i viewportów. Pełny pakiet
marketingowy przechodzi 200/200, a pięć wzorców hero i prowadzonego procesu
przechodzi również w przypiętym obrazie Linux Playwright. Ponadto zielone są
format, lint, typecheck i produkcyjny build 42 tras. Zmiana nie modyfikuje
treści, routingu, danych, uprawnień ani działania widgetu.
