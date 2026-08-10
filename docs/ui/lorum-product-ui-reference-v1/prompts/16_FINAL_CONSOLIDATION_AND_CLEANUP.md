# PROMPT 16 — FINALNA KONSOLIDACJA I CLEANUP


> **V6 IMAGE-LOCKED — obowiązuje nadrzędnie**
>
> Przed wykonaniem tego etapu przeczytaj `CODEX_MASTER_PROMPT.md`, sprawdź obrazy załączone do bieżącej wiadomości oraz właściwe cropy z `docs/ui/references/derived/`. Obrazy są specyfikacją, nie inspiracją. Nie upraszczaj kompozycji, gęstości, inner UI ani mobile. Ten etap działa według zasady: `1 prompt = 1 mały etap = 1 branch = 1 końcowy commit`. Wymagane: reference → before → after-v1 → overlay → poprawki → after-v2 → overlay → layout/a11y/tests/build → raport → STOP.

## Cel

Usunąć pozostałości starego UI, zamknąć dokumentację, testy i release readiness bez rozszerzania scope.

## Nie dodawaj nowych funkcji

Ten etap nie jest okazją do „jeszcze jednej sekcji”, nowego dashboardu ani animacji.

## A. Kod

- usuń nieużywane stare komponenty po potwierdzeniu braku importów,
- usuń martwy CSS i stare tokeny,
- usuń zduplikowane helpery,
- usuń zakomentowany kod,
- nie usuwaj migracji historycznych,
- nie zmieniaj API bez potrzeby,
- sprawdź bundle i client boundaries,
- sprawdź brak nowych `any`, eslint disables i ignored errors.

## B. Dokumentacja

- zaktualizuj `docs/INDEX.md`,
- oznacz ukończone TASKS,
- zaktualizuj DECISIONS/RISKS,
- zarchiwizuj robocze raporty niebędące źródłem prawdy,
- usuń wygenerowane duplikaty po spełnieniu polityki DELETE,
- sprawdź wszystkie linki,
- sprawdź aktywną nazwę Lorum,
- opisz celowo pozostawione identyfikatory legacy.

## C. Testy

Uruchom pełny zestaw:

- lint,
- typecheck,
- unit,
- integration,
- E2E,
- visual regression,
- accessibility,
- security smoke,
- production build.

Nie wyłączaj testów ani nie zwiększaj bez uzasadnienia progów snapshotów.

## D. Visual review

Wykonaj finalne screenshoty dla:

- 14 desktopowych referencji,
- 6 mobilnych referencji,
- wszystkie stany krytyczne.

Porównaj z:

- `reference/boards/*`,
- `reference/screenshots/*`.

Utwórz:

```text
docs/qa/LORUM_UI_V1_FINAL_REVIEW.md
```

Dla każdego ekranu:

- PASS / PASS WITH NOTES / FAIL,
- różnice,
- uzasadnione odstępstwa,
- testy,
- screenshot path.

## E. Release

- migration/rollback plan, jeśli potrzebny,
- feature flags,
- staging smoke,
- monitoring,
- backup,
- rollback,
- release checklist.

## Gate

Nie oznaczaj projektu jako ukończonego, gdy:

- krytyczna ścieżka nie działa,
- mobile ma regresje,
- dokumenty się konfliktują,
- istnieją atrapy,
- visual QA nie wykonano,
- build przechodzi tylko dzięki wyłączeniu reguł.

Zakończ raportem i zatrzymaj się.
