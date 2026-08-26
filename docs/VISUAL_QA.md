# Visual QA Kwotum

**Status:** kanoniczny  
**Ostatni przegląd:** 2026-08-26

Ten dokument opisuje procedurę odbioru wizualnego. Nie przechowuje historii
każdej iteracji; wynik etapu należy zapisać w jego własnym `diff.md`, a aktywne
referencje w `ui/REFERENCE_MANIFEST.md`.

## Przebieg

Dla każdego wdrażanego ekranu albo wydzielonego regionu:

1. wskaż dokładny obraz, region, SHA-256 i viewport;
2. odróżnij instrukcję wizualną od demonstracyjnej treści obrazu;
3. zapisz render `before` z tej samej platformy i przeglądarki;
4. wdroż wyłącznie zakres bieżącego etapu;
5. zapisz `after-v1` i porównanie;
6. wypisz dziesięć największych różnic;
7. popraw kompletność, geometrię, typografię, spacing, gęstość i stany;
8. zapisz finalny `after`, porównanie, reprezentatywny mobile i `diff.md`;
9. uruchom layout, dostępność, testy, build i budżety właściwe dla ryzyka;
10. dopiero po przeglądzie zaktualizuj zaakceptowany baseline.

Bez overlay albo difference nie ma wizualnego PASS. Obraz pokazany pod kątem,
ucięty lub w zbyt małej rozdzielczości może sterować kierunkiem, ale nie jest
podstawą pixel diffu 1:1.

## Punktacja

Ekran otrzymuje po 0–4 punkty za:

- kompletność regionów;
- geometrię i proporcje;
- typografię i spacing;
- gęstość danych oraz stany;
- transformację mobile.

Minimum akceptacji to 18/20. Kompletność, geometria, gęstość danych ani mobile
nie mogą otrzymać 0. Wynik automatyczny nie zastępuje przeglądu właściciela.

## Blokady

- brak krytycznej referencji w natywnym rozmiarze;
- martwa albo atrapowa kontrolka;
- utrata semantyki, fokusu lub obsługi klawiaturą;
- overflow maskowany CSS-em;
- tekst funkcjonalny poniżej 12 px;
- fikcyjny KPI, klient, wynik, integracja lub SLA bez jawnego trybu demo;
- rozszerzenie zakresu poza `SCOPE.md`;
- regresja tenant scope, RLS, capabilities, prywatności lub kalkulacji
  serwerowej;
- porównywanie renderów z różnych platform jako pixel-perfect;
- brak stanu loading, empty, error albo permission tam, gdzie jest wymagany.

## Minimalny zestaw artefaktów

Artefakty robocze trafiają do:

```text
artifacts/visual-qa/<scope>/<stage>/<screen>/
  canonical-reference.txt albo reference.png
  before.png
  after.png
  overlay-50.png albo difference.png
  mobile-390x844.png
  diff.md
```

`diff.md` zapisuje:

- route i chroniony stan;
- referencję, region, SHA-256 oraz rolę;
- viewport, platformę, przeglądarkę i skalę;
- wynik 20-punktowy;
- dziesięć głównych różnic i świadome odstępstwa;
- testy klawiatury, axe, forced colors, reduced motion, zoom i overflow;
- wpływ na dane, bezpieczeństwo, prywatność i wydajność;
- kryterium rollbacku.

Artefakty nie zastępują snapshotów E2E ani testów funkcjonalnych.

## Retencja

Przed zamknięciem etapu zachowujemy:

- jedną kanoniczną referencję albo plik wskazujący jej ścieżkę i SHA-256;
- jeden stan `before`;
- jeden finalny `after`;
- jedno odpowiadające porównanie;
- jeden reprezentatywny mobile, jeśli ma osobny układ;
- jeden raport `diff.md`.

Pośrednie iteracje, powtarzalne cropy, debug output i binarnie identyczne kopie
należy usunąć po przeniesieniu decyzji do raportu. Wyjątek musi mieć opis w
`diff.md`. Snapshoty Playwright pozostają w `tests/e2e/__screenshots__/`.

## Powtarzalność między platformami

- aplikacja korzysta z lokalnych fontów; test nie może zależeć od CDN ani
  fontu systemowego runnera;
- baseline Playwright powstaje na tej samej platformie, na której będzie
  zatwierdzany;
- kanoniczny Linux CI pozostaje przypięty do wersji obrazu i Playwrighta
  wskazanych w workflow;
- różnic rasteryzacji nie naprawiamy przez zwiększenie tolerancji;
- najpierw potwierdzamy font, viewport, wersję przeglądarki, skalę i geometrię;
- nowy baseline wymaga side-by-side review, nie tylko zielonego joba.

## Macierz wspólna

Jeżeli kontrakt etapu nie zawęża zakresu, sprawdzamy:

- 320 × 800;
- 375 × 812;
- 390 × 844;
- 430 × 932;
- 768 × 1024;
- 1024 × 768;
- 1280 × 800;
- 1440 × 900;
- 1536 × 1024;
- 200% zoom lub odpowiadający mu reflow;
- długie polskie treści;
- klawiaturę, reduced motion i forced colors.

Nie wolno stosować `transform: scale()` jako transformacji responsive ani
`overflow-x: hidden` jako naprawy geometrii.

## Panel administracyjny — Minimal V1

Jedynym aktywnym kontraktem panelu jest
`ui/panel-minimal-v1/README.md`, a jedynymi aktywnymi obrazami są dwa pliki
w `ui/panel-minimal-v1/reference/`, zablokowane w
`ui/REFERENCE_MANIFEST.md`. Poprzednie referencje i artefakty panelu zostały
wycofane na mocy ADR-049.

Artefakty kolejnych etapów M1–M10 trafiają do:

```text
artifacts/visual-qa/panel-minimal-v1/<stage>/<screen>/
```

Główne porównanie shellu i dashboardu powstaje przy 1440 × 900 oraz
1536 × 1024. Pomocnicza referencja 404 × 316 służy wyłącznie do oceny kierunku
typografii, zakładek i oszczędnego użycia koloru.

Etap M0 nie zmienia runtime i nie otrzymuje wyniku podobieństwa. Jego gate to:

- dwa nowe obrazy z poprawnym rozmiarem i SHA-256;
- brak aktywnych odwołań do starych referencji panelu;
- skonsolidowany plan M0–M10;
- zielony baseline modeli nawigacji, typecheck web i `git diff --check`;
- udokumentowana możliwość odzyskania usuniętego materiału.

## Inne aktywne powierzchnie

- landing desktop: `ui/landing-desktop-v7/`;
- landing mobile: `ui/landing-mobile-v1/`;
- podstrony marketingowe: `ui/marketing-subpages-v1/`;
- auth: `apps/web/public/ekranylogowania.png` oraz
  `ui/AUTH_REFERENCE_ANALYSIS_2026-07-27.md`;
- marka: `ui/kwotum-brand-v2/README.md`.

Ich obrazy nie sterują panelem. Historyczne wyniki pozostają w raportach
zakresowych lub historii Git i nie są duplikowane w tym dokumencie.
