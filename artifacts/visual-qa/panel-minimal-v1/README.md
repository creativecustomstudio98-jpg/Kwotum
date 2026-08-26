# Panel minimalistyczny V1 — visual QA

**Status:** M1–M5 zamknięte; M1/M3 zaakceptowane wizualnie przez właściciela,
a M2, M4 i M5 przeszły swoje techniczne oraz wizualne gate'y.

Artefakty w `baseline/` są zrzutami rzeczywistej aplikacji z syntetycznymi,
tenantowymi danymi testowymi. Nie są referencjami projektowymi. Jedynymi
aktywnymi referencjami pozostają dwa obrazy wskazane w
`docs/ui/panel-minimal-v1/README.md`.

## Zaakceptowany dashboard

- `baseline/dashboard/after-viewport-1536x1024.png` — rzeczywisty viewport
  desktop;
- `baseline/dashboard/after-full-page-1536w.png` — pełna strona desktop;
- `baseline/dashboard/after-viewport-390x844.png` — rzeczywisty viewport
  mobile;
- `baseline/dashboard/after-full-page-390w.png` — pełna strona mobile.

Odrzucony katalog `m1-shell`, stare dashboardowe pliki `after-production-*` o
mylących rozmiarach oraz wcześniejsze porównania zostały usunięte. Bieżące
testy shellu zapisują powtarzalne artefakty w `baseline/shell/`.

## M2 — nawigacja kontekstowa do odbioru

- `m2-context-navigation/settings/after-1440x900.png` — gotowe Ustawienia;
- `m2-context-navigation/integrations/after-1440x900.png` — gotowy WordPress;
- `m2-context-navigation/settings/mobile-320x800.png` — mobile i scroll tabs;
- `m2-context-navigation/settings/mobile-keyboard-focus-320x800.png` — focus;
- `m2-context-navigation/settings/overlay-50.png` oraz
  `m2-context-navigation/integrations/overlay-50.png` — porównania;
- `m2-context-navigation/diff.md` — wynik 19/20, testy i rollback.

Plik `m2-context-navigation/canonical-reference.txt` wskazuje dwie aktywne
referencje i ich SHA-256; nie tworzy kolejnych kopii obrazów.

## M5 — listy operacyjne

- `m5-lists/leads/` — semantyczna tabela desktop, mobilne `ul`, 102 rekordy;
- `m5-lists/processes/` — pełnowierszowe linki, 109 rekordów i długie nazwy;
- `m5-lists/templates/` — płaska biblioteka, trwałe filtry i fokus podglądu;
- każdy katalog zawiera `before.png`, `after.png`, render mobile, aktualny
  `overlay-50.png`, pomiary, źródło referencji i raport `diff.md`;
- końcowy E2E M5: 3/3, pełna bramka panelu: 23/23, axe: 0, wszystkie
  viewporty 320–1536 px: 0 overflow.
