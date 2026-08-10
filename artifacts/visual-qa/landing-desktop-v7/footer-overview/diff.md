# Footer i overview V7-08 — visual QA

## Metoda

`08-full-overview.png` ma 941 × 1672 px i jest pomniejszoną planszą całej
strony, natomiast produkcyjny render ma 1672 × 7603 px. Nie wykonano overlay ani
RMSE obrazów o różnych skalach i proporcjach. `overview-side-by-side.png`
porównuje wyłącznie hierarchię, kolejność, rytm oraz przejścia po sprowadzeniu
renderu produkcyjnego do wysokości referencji.

Stopkę sprawdzono osobno w jej natywnej szerokości 1672 px oraz w przejściu
941 px wysokości od finalnego CTA.

## Wynik

- PASS — kolejność wszystkich ośmiu sekcji i footera;
- PASS — wspólna oś `x=64–1608` finalnego CTA i stopki;
- PASS — czytelne tonalne przejście z białego panelu CTA do jasnoszarej stopki;
- PASS — pełny znak Lorum, status produktu, trzy semantyczne nawigacje i dolny
  rail;
- PASS — 14 linków z niepustym `href`, w tym prawo i powrót na górę;
- PASS — układ 4-kolumnowy desktop, 2-kolumnowy tablet i 1-kolumnowy mobile;
- PASS — brak poziomego overflow w 1440/1024/768/390/320 px;
- N/D — pixel RMSE pełnej strony, celowo zabroniony dla V7-08.

## Korekty drugiego passu

Pierwszy pass ujawnił, że późniejsza deklaracja legacy `.marketing-brand`
zmniejszała nazwę Lorum w stopce do 16 px. Finalna blokada kaskady dla
`.marketing-brand--footer` przywróciła 24,8 px, wagę 720 i znak 36,8 px bez
zmiany globalnego komponentu nagłówka. Pozostała duplikacja selektora jest
jawnym kandydatem do konsolidacji w D5, nie powodem do ryzykownego usuwania w
tym mikroetapie.

## Ocena

**19/20** — kompletność 4, geometria 4, typografia 4, gęstość 4,
transformacja mobile 3. Brak punktu za pełną transformację wynika z braku
zaakceptowanej referencji mobile, nie z błędu reflow.
