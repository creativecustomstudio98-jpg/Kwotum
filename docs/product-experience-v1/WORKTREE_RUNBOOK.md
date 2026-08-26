# Worktree runbook — PX1–PX7

## Dlaczego osobne worktree

Program zmienia wersjonowany agregat flow, publiczny manifest, widget, builder,
bazę i testy bezpieczeństwa. Izolacja ogranicza niekontrolowane diffy i pozwala
odebrać każdy etap przed rozpoczęciem następnego.

Aktualny główny worktree jest mocno zmieniony. Nie wolno tworzyć nowych
worktree z niezatwierdzonego, nieczystego stanu ani przenosić do nich plików
przez kopiowanie. Najpierw właściciel wybiera audytowalny commit bazowy.

## Konwencja

- branch: `codex/pxN-krotka-nazwa`;
- katalog obok repo: `../Wyceno-pxN-krotka-nazwa`;
- jeden etap, jeden końcowy commit, jeden raport;
- bez merge poprzedniego etapu nie rozpoczynamy następnego;
- żadnego `git reset --hard`, przepisywania migracji ani force push.

## Przygotowanie przez właściciela etapu

Po wskazaniu czystego `BASE_SHA`:

```sh
git worktree add ../Wyceno-px2-presentation-schema -b codex/px2-presentation-schema BASE_SHA
```

Kolejne worktree powstają z zaakceptowanego commita poprzedniego etapu, nie ze
starego `BASE_SHA`. Worktree PX7 może powstać dopiero po scaleniu PX2–PX6.

## Macierz

| Etap | Branch                                | Kontrakt                          | Zależność                      |
| ---- | ------------------------------------- | --------------------------------- | ------------------------------ |
| PX1  | `codex/px1-discovery-contract`        | `worktrees/PX1_DISCOVERY.md`      | obecny audytowalny baseline    |
| PX2  | `codex/px2-presentation-schema`       | `worktrees/PX2_SCHEMA.md`         | zaakceptowane PX1              |
| PX3  | `codex/px3-quick-form`                | `worktrees/PX3_QUICK_FORM.md`     | scalone PX2                    |
| PX4  | `codex/px4-visual-choices`            | `worktrees/PX4_VISUAL_CHOICES.md` | scalone PX3                    |
| PX5  | `codex/px5-context-prefill`           | `worktrees/PX5_CONTEXT.md`        | scalone PX4                    |
| PX6  | `codex/px6-contact-outcomes-branding` | `worktrees/PX6_COMPLETION.md`     | scalone PX5                    |
| PX7  | `codex/px7-controlled-pilot`          | `worktrees/PX7_PILOT.md`          | scalone PX6 i production gates |

## Obowiązkowy start worktree

1. Przeczytaj `AGENTS.md`, `docs/INDEX.md`, `docs/TASKS.md` i właściwy manifest.
2. Sprawdź `git status --short`; worktree musi być czysty.
3. Zapisz SHA bazowy i listę istniejących zmian spoza zakresu.
4. Uruchom bazowy `pnpm typecheck` i `pnpm test:unit`.
5. Dla zmian UI zablokuj konkretny viewport i wymagane artefakty visual QA.
6. Zapisz plan, ryzyka i rollback przed pierwszą zmianą runtime.

## Obowiązkowe zakończenie

1. Self-review diffu oraz kontrola przypadkowego scope creep.
2. `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, właściwe testy i build.
3. Testy PostgreSQL/RLS i security dla zmian kontraktu lub danych.
4. Visual QA i accessibility dla zmian widocznych.
5. Aktualizacja dokumentów kanonicznych, backlogu i changelogu.
6. Raport: zmiany, decyzje, pliki, testy, ryzyka, rollback, kryteria odbioru.
7. STOP — bez automatycznego rozpoczęcia następnego worktree.
