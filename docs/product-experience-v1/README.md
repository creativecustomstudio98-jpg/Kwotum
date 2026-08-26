# Kwotum Product Experience V1

**Status:** PX2–PX6 ukończone lokalnie; PX7 ma pakiet readiness i decyzję NO-GO
dla prawdziwego ruchu  
**Właściciel decyzji:** Product  
**Ostatni przegląd:** 2026-08-25

Ten katalog zamienia audyt doświadczenia respondenta w kontrolowany program
rozwoju. Nie jest biblioteką luźnych inspiracji ani zgodą na jednorazową
przebudowę całego widgetu.

## Cel

Kwotum ma dopasowywać sposób zebrania zapytania do wiedzy i intencji klienta:

1. `quick_form` — krótki formularz dla osoby, która wie, czego chce;
2. `guided_brief` — prowadzony wywiad dla usługi wymagającej doprecyzowania;
3. `visual_configurator` — wizualny dobór zakresu, materiału lub wariantu.

Wszystkie tryby korzystają z jednego bezpiecznego modelu publikacji, sesji,
zgód, leada, powiadomień, analityki i tenant isolation. Tryb prezentacji nie
może tworzyć równoległego, słabiej zabezpieczonego formularza.

## Kolejność czytania

1. [`MASTER_PLAN.md`](MASTER_PLAN.md) — problem, docelowy model i kolejność.
2. [`ACCEPTANCE_MATRIX.md`](ACCEPTANCE_MATRIX.md) — mierzalne kryteria odbioru.
3. [`RESEARCH_PROTOCOL.md`](RESEARCH_PROTOCOL.md) — niestandardowy scenariusz
   wywiadów, testów i zapisu dowodów.
4. [`PRESENTATION_DECISION_MATRIX.md`](PRESENTATION_DECISION_MATRIX.md) — dobór
   formy pytania do charakteru decyzji.
5. [`WORKTREE_RUNBOOK.md`](WORKTREE_RUNBOOK.md) — izolacja branchy i worktree.
6. [`worktrees/`](worktrees/) — kontrakt zakresu każdego etapu.
7. [`prompts/`](prompts/) — prompty wykonawcze, po jednym na etap.
8. Raporty `PX2_IMPLEMENTATION_REPORT.md`–`PX6_IMPLEMENTATION_REPORT.md` —
   lokalne implementacje i gate'y.
9. `../pilots/PX7_PILOT_READINESS_AND_DECISION_2026-08-25.md` — konfiguracja,
   blokady i bieżąca decyzja pilota.

## Zasady programu

- Jedno worktree realizuje jeden zamknięty etap i kończy się raportem oraz STOP.
- Nie implementujemy trzech osobnych silników ani trzech modeli leada.
- Nie dodajemy ikon, zdjęć ani wariantów layoutu bez wersjonowanego kontraktu,
  fallbacku tekstowego, dostępności i testów manifestu.
- Nie nazywamy szablonu „zweryfikowanym”, dopóki nie ma dowodu badań i akceptacji.
- Nie zastępujemy telefonu, WhatsAppa ani istniejącego formularza bez wyników
  kontrolowanego pilota i jawnej decyzji GO.
- Nie kopiujemy wyglądu Typeform, Tally, Heyflow ani bibliotek komponentów.
- Obraz referencyjny może ustalać kompozycję, ale nie tworzy funkcji ani danych.

## Stan startowy

Audyt potwierdził działający builder, widget, wycenę, scoring, lead pipeline,
analitykę, e-mail, webhook i WordPress. Główna luka dotyczy ekspresji procesu:
opcja odpowiedzi ma wyłącznie etykietę i routing, widget ma jeden układ listy,
kontakt jest sztywną sekcją po wyniku, a bezpieczny kontekst strony hosta nie
jest częścią kontraktu.

PX1 dostarczył kontrakt programu, a PX2–PX6 zamknęły lokalnie schema, quick
form, prezentacje, media, kontekst i zakończenie. PX7 nie ma zgody na prawdziwy
ruch: konfiguracje syntetyczne są poprawne, lecz staging, operacje, prawo,
właściciele firm i podpisane UAT pozostają blokadami.
