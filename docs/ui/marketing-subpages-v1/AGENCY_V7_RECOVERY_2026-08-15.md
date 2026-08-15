# `/dla-agencji` — korekta V7 z 2026-08-15

## Zakres

Korekta obejmuje wyłącznie publiczną trasę `/dla-agencji`. Nie zmienia API,
autoryzacji, tenant scope, RLS, modelu danych, ról, pricingu, scoringu ani
runtime widgetu. Celem było dopasowanie całej strony do zaakceptowanego systemu
home V7 bez utraty kontraktów wypracowanych w R5.1–R5.4.

Viewporty odbioru: 1536×1024, 1440×1000, 1280×900, 1024×900, 768×1024,
430×932, 390×844 i 320×844 px.

## Referencje i baseline

Źródłem kierunku są zaakceptowane home V7 oraz lokalnie skorygowane trasy
`/produkt`, `/jak-dziala` i `/branze`. Baseline starej kompozycji zapisano jako:

- `artifacts/visual-qa/marketing-subpages-v1/r5-home-aligned/before/agency-1440.png`,
- `artifacts/visual-qa/marketing-subpages-v1/r5-home-aligned/before/agency-390.png`.

Wcześniejsza strona była rzeczowo poprawna, ale wizualnie składała się z
czterech osobnych proofów: fikcyjnego dashboardu leadów, tablicowego planu
wdrożenia, imitacji panelu uprawnień oraz code-native makiety hosta i widgetu.
Beżowe powierzchnie, zagnieżdżone karty i demonstracyjne nazwiska wzmacniały
wrażenie uniwersalnego szablonu SaaS zamiast jednej strony Kwotum.

## Finalna kompozycja

1. Hero rozdziela odpowiedzialność jednym zdaniem: agencja wdraża proces, firma
   zarządza leadami. Dowodem jest rzeczywisty ekran panelu, a nie makieta.
2. Model wdrożenia łączy cztery etapy — warsztat, konfigurację, osadzenie i
   przekazanie — z rzeczywistym ekranem buildera i jawnym rezultatem etapu.
3. Granica danych pokazuje rzeczywisty szczegół leada, macierz
   Owner/Admin/Sales oraz trzy warstwy kontroli tenantowej.
4. Ciemna sekcja izolacji widgetu opisuje faktyczny element, loader, własne
   style i wąski kontrakt. Copy wyklucza interpretowanie Shadow DOM jako
   granicy bezpieczeństwa JavaScriptu.
5. Jasny finał ponownie rozdziela obowiązki agencji, firmy i model dostępu oraz
   prowadzi wyłącznie do istniejących tras `/branze` i `/logowanie`.

Wykorzystane repozytoryjne assety produktu:

- `/images/product/dashboard-kwotum-v1.webp` i wariant mobile,
- `/images/product/builder-kwotum-v1.webp` i wariant mobile,
- `/images/product/lead-detail-kwotum-v1.webp` i wariant mobile,
- `/images/product/widget-result-kwotum-v1.webp` i wariant mobile.

Assety zawierają wyłącznie dane demonstracyjne i były wcześniej zatwierdzone
dla `/produkt`. Nie dodano generowanego obrazu ani nowej zależności.

## Responsive i dostępność

- osobne kadry desktop/mobile zapobiegają nieczytelnemu skalowaniu panelu;
- treść zachowuje pełną kolejność bez JavaScriptu;
- na wąskich ekranach tabela uprawnień staje się semantycznym układem wierszy;
- oba CTA mają co najmniej 44 px wysokości i układają się pionowo na mobile;
- minimalny widoczny tekst ma 12 px;
- nie występuje poziomy overflow na żadnym viewporcie odbioru;
- skip link, klawiatura, forced-colors i WCAG 2 A/AA przechodzą gate axe.

## Visual QA

Pierwszy pass:

- `artifacts/visual-qa/marketing-subpages-v1/r5-home-aligned/after/agency-1440-pass1.png`,
- `artifacts/visual-qa/marketing-subpages-v1/r5-home-aligned/after/agency-390-pass1.png`.

Finalne rendery:

- `artifacts/visual-qa/marketing-subpages-v1/r5-home-aligned/after/agency-1440-final.png`,
- `artifacts/visual-qa/marketing-subpages-v1/r5-home-aligned/after/agency-390-final.png`.

Po pierwszym renderze mobilnym obrazy poniżej folda zostały ustawione jako
`loading="eager"`, aby rzeczywiste powierzchnie produktu były obecne również w
pełnostronicowym visual QA. Finalny render mobile potwierdza wszystkie cztery
kadry.

## Weryfikacja

Dedykowany gate `tests/e2e/marketing-agency-r5-v7.spec.ts` przechodzi 15/15 i
sprawdza:

- metadata i canonical,
- prawdziwe ekrany produktu i kolejność pięciu sekcji,
- cztery etapy wdrożenia,
- macierz Owner/Admin/Sales: 9 dozwolonych i 3 zabronione operacje,
- trzy warstwy tenant scope i brak domyślnego dostępu agencji,
- literalny element widgetu oraz uczciwy zakres izolacji Shadow DOM,
- osiem viewportów, brak overflow, minimum 12 px i przełączanie kadrów,
- klawiaturę, axe, forced-colors i pełną treść bez JavaScriptu.

Lokalne gate’y web przed pełną regresją:

- `pnpm --filter @wyceno/web lint` — PASS,
- `pnpm --filter @wyceno/web typecheck` — PASS,
- `pnpm build` — PASS, 16/16 zadań i 42 trasy.

Pełna regresja repozytorium:

- `pnpm lint` — PASS, 8/8 zadań,
- `pnpm typecheck` — PASS, 8/8 zadań,
- `pnpm test:unit` — PASS, 22/22 zadań; web 184/184,
- `pnpm test:rls` — PASS, w tym tenant isolation i domenowe kontrole bazy,
- `pnpm test:wordpress` — PASS dla WordPress 6.9.2 i 7.0.2 na PHP 8.5.2,
- `pnpm security:scan` — PASS dla SAST i skanu sekretów,
- `pnpm build` — PASS, 16/16 zadań i 42 trasy.

## Ryzyka i rollback

Ryzyko ogranicza się do regresji układu marketingowego i kosztu wcześniejszego
ładowania czterech demonstracyjnych kadrów na pełnej stronie. Nie zmienia się
ścieżka danych ani kontrola dostępu. Rollback przywraca poprzedni `page.tsx`,
cztery komponenty R5 z ich modułami CSS oraz cztery testy R5.1–R5.4. Migracja
bazy ani danych nie jest potrzebna.
