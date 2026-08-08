# Retencja artefaktów Visual QA — 2026-08-08

**Etap:** 12ZD, drugi pass

**Status:** PASS lokalny; operacja odzyskiwalna

## Powód

Nowy program marketingowy wygenerował 457 plików w
`artifacts/visual-qa/marketing-subpages-v1/` o rozmiarze około 136 MiB.
Większość stanowiła powtarzalne rendery tej samej sekcji w dziewięciu
viewportach albo odrzucone iteracje. Pełny zestaw nie spełnia kontraktu
minimalnej retencji z `docs/VISUAL_QA.md` i nie powinien zwiększać historii Git.

## Zachowany dowód release

W aktywnym katalogu pozostaje 159 plików o rozmiarze około 64 MiB:

- raporty `diff.md` i metryki JSON;
- kontaktowe arkusze bazowego audytu desktop/mobile;
- reprezentatywny stan `before` na desktopie;
- finalny desktop 1440 px i finalny mobile 390 px;
- jedno porównanie, overlay albo difference dla każdego zamkniętego etapu;
- dodatkowy wariant tylko wtedy, gdy etap obejmował dwie niezależne sekcje.

Zachowane pliki nie zawierają prawdziwych danych klientów. Dowody panelu,
landingu desktop/mobile, auth i snapshoty Playwright zachowują własne,
oddzielne role i nie zostały objęte tym pass'em.

## Archiwum lokalne

300 pośrednich plików o rozmiarze 71,76 MiB przeniesiono bez kasowania do:

`artifacts/promo/visual-qa-archive-2026-08-08/marketing-subpages-v1/`

`artifacts/promo/` jest ignorowane przez Git. Archiwum można odtworzyć przez
przeniesienie plików z zachowaniem względnych ścieżek. Nie jest wymagane do
builda, testów, działania aplikacji ani odtworzenia finalnego dowodu odbioru.

## Kryterium odbioru

- żaden aktyw runtime, snapshot Playwright ani kanoniczna referencja nie został
  usunięty;
- wszystkie raporty i metryki pozostały w aktywnym drzewie;
- każdy zamknięty etap ma `before`, final desktop, final mobile i porównanie;
- odrzucone makiety i wielokrotne viewporty są nadal lokalnie odzyskiwalne;
- `git status` nie pokazuje archiwum jako kandydata release.
