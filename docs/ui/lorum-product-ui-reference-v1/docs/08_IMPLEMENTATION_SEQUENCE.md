# 08 — Sekwencja implementacji

**Status:** CANONICAL

## Etap 0 — Audyt i freeze

Zakres:

- mapa tras,
- komponenty,
- CSS/tokeny,
- zależności,
- funkcje i logika chroniona,
- baseline screenshoty,
- dokumenty do migracji.

Gate:

- zero zmian UI,
- raport kompletny,
- znane komendy walidacyjne,
- branch/checkpoint istnieje.

## Etap 1 — Dokumentacja kanoniczna

Zakres:

- inwentarz dokumentów,
- merge/replace/archive,
- `docs/INDEX.md`,
- `AGENTS.md`,
- `TASKS.md`,
- decyzje i ryzyka.

Gate:

- brak aktywnych konfliktujących źródeł UI,
- wszystkie linki zaktualizowane,
- raport migracji.

## Etap 2 — Design foundation

Zakres:

- tokeny,
- typografia,
- Button/Input/Badge/Table/Tabs/Drawer/Dialog,
- app shell,
- focus i accessibility,
- Storybook lub istniejąca galeria komponentów.

Gate:

- brak domyślnego wyglądu biblioteki,
- brak lokalnych hex/radius/shadow,
- keyboard test,
- desktop + mobile shell screenshot.

## Etap 3 — Dashboard

Gate:

- priorytety zamiast przypadkowych KPI,
- realne/oznaczone dane,
- mobile hierarchy,
- visual diff.

## Etap 4 — Leady

- lista,
- filtry,
- sortowanie,
- paginacja,
- mobile cards,
- szybki kontakt.

Gate:

- dane nie są rozbite na dekoracyjne karty,
- tabela dostępna,
- filtry działają,
- mobile bez overflow.

## Etap 5 — Szczegóły leada

- source answers,
- files,
- history,
- contact/actions,
- status/assignee/next step,
- consent/UTM.

Gate:

- działania działają,
- score wyjaśnialny,
- mobile sticky actions.

## Etap 6 — Procesy i builder

- lista procesów,
- builder desktop,
- builder mobile drill-down,
- typy kroków,
- walidacja,
- autosave,
- undo/redo zgodne z architekturą.

Gate:

- główny proces można edytować i testować,
- brak atrap,
- dostępne sortowanie bez myszy,
- visual regression.

## Etap 7 — Logika, wycena, scoring, wynik

Gate:

- obliczenia server-side,
- explainability,
- walidacja pętli i martwych ścieżek,
- test cases,
- disclaimer wyniku.

## Etap 8 — Analityka

Gate:

- prawidłowe źródła danych,
- brak wykresów bez danych,
- metryki mają okres i porównanie,
- responsywność.

## Etap 9 — Szablony i instalacja

- biblioteka,
- template detail,
- inline/popup/fullscreen/hosted,
- WordPress connector,
- diagnostyka.

Gate:

- realny proces demonstracyjny,
- działający kod osadzenia,
- brak sekretów po stronie klienta.

## Etap 10 — Integracje

- katalog,
- połączenia,
- mapowanie,
- webhook logs,
- retry,
- signed deliveries.

## Etap 11 — Agency

- klienci,
- cloning,
- white-label,
- role,
- usage,
- billing model UI bez atrap płatności.

## Etap 12 — Ustawienia i onboarding

- organizacja,
- branding,
- domeny,
- notifications,
- team,
- privacy,
- API,
- billing/usage,
- onboarding.

## Etap 13 — Publiczny widget

- wszystkie typy kroków,
- mobile-first,
- autosave,
- upload,
- contact/consent,
- result,
- error states,
- hosted/embed.

## Etap 14 — Final QA i konsolidacja

- wszystkie viewporty,
- visual regression,
- accessibility,
- performance,
- dead code,
- stare komponenty,
- stare CSS,
- dokumentacja,
- release checklist.

## Reguła

Jeden etap = jeden zamknięty zakres. Codex nie ma prawa „przy okazji” przeprojektować dalszych modułów.
