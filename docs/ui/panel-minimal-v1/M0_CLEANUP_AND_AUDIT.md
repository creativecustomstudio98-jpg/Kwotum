# M0 — cleanup referencji i audyt panelu

**Status:** PASS lokalny — M0 zamknięty
**Data:** 2026-08-26
**Zakres:** dokumentacja, referencje i nazwy artefaktów testowych; runtime bez
zmian

## Wynik

Dwie referencje dostarczone przez właściciela są jedynym aktywnym kierunkiem
panelu. Poprzednie obrazy, pakiet źródłowy starego panelu, zastąpione raporty i
nadmiarowe artefakty QA zostały usunięte z aktywnego repozytorium po utworzeniu
odzyskiwalnej kopii. Unikalne wymagania produktu, bezpieczeństwa i dostępności
pozostały w dokumentach kanonicznych.

M0 nie zmienia komponentów, danych, routingu, API, RLS, uprawnień ani
prezentacji runtime. Pierwszą zmianą wyglądu będzie osobny etap M1.

## Nowe referencje

| Rola                | Plik                                              |    Rozmiar | SHA-256                                                            |
| ------------------- | ------------------------------------------------- | ---------: | ------------------------------------------------------------------ |
| główna, mierzalna   | `reference/panel-dashboard-primary-1199x842.png`  | 1199 × 842 | `824df7d47e16d9114ae66990a0d02e91f4954ce1ba7b5d1c4d180fea84aed6e1` |
| pomocniczy kierunek | `reference/panel-dashboard-direction-404x316.png` |  404 × 316 | `2cd7db369c2233f08f77b497a2b2e54e5458bf840548c5ba6e791b48518e3b64` |

Obraz główny steruje hierarchią, geometrią, gęstością, powierzchniami,
topbarem, dashboardem i tabelą. Drugi obraz jest mały, ucięty i pokazany pod
kątem, więc potwierdza tylko charakter typografii, zakładek i oszczędnego
koloru. Nazwy produktów, osoby, liczby i moduły demonstracyjne nie są
instrukcją.

## Usunięty materiał

### Referencje i pakiety

- trzy stare publiczne obrazy panelu;
- dwie główne plansze V6 zawierające stary panel;
- cały pakiet `lorum-product-ui-reference-v1`;
- referencja poprzedniego sidebara P1;
- referencja starego wyboru organizacji;
- crop akcji przykładowego leada.

### Zastąpiona dokumentacja

Usunięto raporty rekonstrukcji, gap analysis, poprzednie visual QA panelu,
historyczne plany pozostałych ekranów i buildera, równoległe indeksy obrazów,
dekompozycje, luki oraz poprzedni master rebrandingu. Ich unikalne wymagania
zostały wcześniej porównane z kodem i skonsolidowane w:

- `README.md` — aktywny kontrakt M0–M10;
- `../REFERENCE_MANIFEST.md` — aktywne obrazy i SHA-256;
- `../../VISUAL_QA.md` — jedna procedura odbioru;
- `../../UI_SCREEN_SPEC.md` — zakres i zachowania ekranów;
- `../../DECISIONS.md` — ADR-049;
- `../../TASKS.md` — aktywny backlog.

### Artefakty QA

Wycofano stare katalogi rekonstrukcji dashboardu, shellu, list, leada,
szablonów, analityki, buildera, mobilnej nawigacji, webhooków, ustawień i
operacji leada. Z mieszanego katalogu 12S usunięto wyłącznie panel,
integracje, ustawienia i onboarding. Zachowano oddzielne dowody auth i widgetu.

Łącznie kopia obejmuje 429 plików, a odzyskiwalna kwarantanna obrazów i
artefaktów zajmuje około 77 MiB.

## Odzyskiwalność

Przed cleanupem utworzono pełną kopię:

```text
/tmp/wyceno-panel-cleanup-20260826-x5d8a7/panel-cleanup-backup.tar
```

Zweryfikowano jej rozmiar 80 MiB i listę kluczowych ścieżek. Materiał binarny
został dodatkowo przeniesiony, a nie bezpowrotnie skasowany, do:

```text
/tmp/wyceno-panel-cleanup-20260826-x5d8a7/quarantine/
```

Kopia w `/tmp` jest tymczasowa i może zniknąć po czyszczeniu systemu. Pliki
śledzone przez Git pozostają odzyskiwalne także z historii. Przywrócenie starego
materiału nie przywraca jego statusu źródła prawdy bez nowej decyzji ADR.

### Celowo nietknięty backup

Ignorowany przez Git plik `apps.zip` ma około 406 MiB i zawiera między innymi
kopie trzech starych PNG panelu, ale jest szerokim backupem całej aplikacji.
Nie jest używany przez build, testy ani dokumentację. Nie został usunięty ani
zmodyfikowany, ponieważ mogłoby to skasować jedyną kopię innych danych
użytkownika. Literalne oczyszczenie także tego archiwum wymaga osobnej decyzji
o całym backupie.

## Audyt bieżącego panelu

### Powierzchnie

Repozytorium zawiera wejście `/panel` i 14 tras tenantowych:

- dashboard;
- lista oraz szczegół leada;
- lista procesów, builder i instalacja;
- szablony;
- analityka;
- WordPress i webhooki;
- ustawienia organizacji, powiadomienia i prywatność;
- onboarding/start.

### Problemy wizualne

1. Dwa główne arkusze panelu mają łącznie około 14 tysięcy linii i wiele
   historycznych wyjątków.
2. Sidebar używa lokalnego Instrument Sans, a treść panelu nadal Intera.
3. Dashboard ma sześć równorzędnych KPI i jedenaście dalszych sekcji, więc
   hierarchia jest zbyt płaska.
4. Część opisów ma 7,5–10 px i naśladuje pomniejszony screenshot zamiast
   profesjonalnego interfejsu.
5. Dziewięć tras używa wspólnego nagłówka, a pięć kluczowych powierzchni ma
   własne warianty.
6. Ustawienia, integracje, lead detail i builder stosują różne modele menu
   wewnętrznego.
7. Ciemnozielony sidebar dominuje nad treścią, podczas gdy nowa referencja
   używa koloru jako sygnału.
8. Tabele, karty, statusy i formularze mają różne gęstości oraz promienie.

### Zachowania chronione

- serwerowy tenant context, RLS, role i capabilities;
- noindex oraz prywatne cache dla panelu;
- routing i query params;
- sidebar 256/72, kompatybilny klucz preferencji i mobile navigation;
- focus trap, Escape, focus return i safe area;
- autosave, rewizje, konflikty, undo/redo i immutable publish buildera;
- semantyka tabel, filtry, paginacja i transformacja mobile;
- serwerowe pricing, score, walidacja i signed URLs.

## Decyzje projektowe

- około 90% neutralnych powierzchni, 8% marki i 2% stanów;
- lokalny Instrument Sans Variable, wagi 400/500/600/700;
- tytuł strony 24/32 px, body 14/20 px, tabela i nawigacja 13/18 px,
  metadata minimum 12/16 px;
- jasny canvas i sidebar, border 1 px, radius 8–10 px, niemal bez cieni;
- kontrolki 40 px na desktopie i cel dotykowy minimum 44 px;
- prawdziwe menu kontekstowe u góry po lewej dla modułów wielosekcyjnych;
- dashboard: cztery główne KPI, dominujący trend, prawy panel operacyjny i
  pełna lista/tabela poniżej;
- brak nowych fontów, bibliotek ikon, funkcji, pól i atrap.

## Kolejność i ryzyko

Plan M1–M10 jest opisany liczbowo w `README.md`. Najpierw zmieniamy fundament
typografii i shell, potem nawigację kontekstową, dashboard, kontrolki, listy,
leada, builder, analitykę, ustawienia i dopiero na końcu konsolidujemy stany
oraz stary CSS.

Największe ryzyka to rozległy, niecommitowany worktree, regresja geometrii
buildera przy zmianie shellu, zduplikowane reguły CSS i brak lokalnego Dockera
podczas tej sesji. Dlatego każdy etap jest mały, ma własny `before/after`, gate
funkcjonalny i rollback ograniczony do prezentacji.

## Gate M0

- [x] nowe pliki, rozmiary i SHA-256;
- [x] ADR-049 i jeden aktywny manifest;
- [x] inwentarz tras, stylów, fontów i zachowań chronionych;
- [x] poprzednie obrazy i zastąpiona dokumentacja poza repozytorium;
- [x] wszystkie aktywne zapisy zrzutów E2E oraz retain mode przeniesione do
      `panel-minimal-v1`;
- [x] końcowy skan martwych odwołań;
- [x] format i `git diff --check`;
- [x] baseline modeli nawigacji i typecheck web po cleanupie;
- [x] self-review diffu.

## Weryfikacja końcowa

- `pnpm --filter @wyceno/web test` — PASS, 43 pliki i 166/166 testów;
- izolowane modele nawigacji oraz wyboru organizacji — PASS, 6/6;
- `pnpm --filter @wyceno/web typecheck` — PASS;
- `pnpm --filter @wyceno/web lint` — PASS bez ostrzeżeń;
- `pnpm --filter @wyceno/web build` — PASS, 42 strony statyczne/dynamiczne;
- rejestracja trzech speców Playwright przez `--list` — PASS, 20 scenariuszy;
- kontrola składni runnera E2E — PASS;
- zakresowy Prettier i `git diff --check` — PASS;
- skan lokalnych linków Markdown — PASS, 0 brakujących celów;
- skan usuniętych nazw w aktywnej dokumentacji — PASS;
- skan starych obrazów i ich hashy — PASS dla śledzonego oraz generowanego
  drzewa po buildzie.

Pełnego uwierzytelnionego E2E nie uruchomiono, ponieważ lokalny Docker nie był
dostępny. M0 nie zmienia runtime, a wymagany baseline typów, unitów, buildu i
speców jest zielony. Nowe rendery zalogowanego panelu są obowiązkową bramą M1.

M1 nie rozpoczyna się w ramach M0.
