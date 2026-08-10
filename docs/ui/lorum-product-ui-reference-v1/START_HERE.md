# START HERE — kolejność użycia z Codexem

## 1. Zabezpiecz stan projektu

```bash
git add -A
git commit -m "checkpoint: przed kontrolowana przebudowa UI Lorum"
git switch -c ui/lorum-product-rebuild-v1
```

## 2. Dodaj pakiet do repozytorium

```text
docs/ui/lorum-product-ui-reference-v1/
```

## 3. Uzupełnij `AGENTS.md`

Do istniejącego pliku dodaj treść z:

```text
docs/ui/lorum-product-ui-reference-v1/snippets/AGENTS.ui-product.md
```

Nie nadpisuj reguł dotyczących bezpieczeństwa, bazy, autoryzacji ani istniejącego stacku. Dodaj warstwę reguł UI i procedury wykonawczej.

## 4. Uruchom wyłącznie etap audytu

W pierwszej sesji wklej kolejno:

1. `prompts/00_TEAM_ORCHESTRATOR.md`
2. `prompts/01_REPOSITORY_AUDIT_AND_FREEZE.md`

Codex ma zakończyć pracę na audycie. Nie może jeszcze zmieniać komponentów ani CSS.

## 5. Przejrzyj audyt

Nie przechodź dalej, dopóki raport nie zawiera:

- mapy tras i ekranów,
- mapy komponentów i plików CSS,
- listy źródeł obecnego AI-looku,
- listy elementów logiki, których nie wolno zmieniać,
- spisu dokumentów z klasyfikacją KEEP / REPLACE / ARCHIVE / DELETE,
- planu małych etapów,
- komend walidacyjnych projektu,
- ryzyk regresji.

## 6. Uporządkuj dokumentację

Dopiero po akceptacji audytu uruchom:

```text
prompts/02_DOCUMENT_CLEANUP_AND_CANONICALIZATION.md
```

Etap ma przygotować jedno źródło prawdy. Nie wolno usuwać dokumentów zawierających unikalne decyzje, dopóki te decyzje nie zostaną przeniesione do dokumentów kanonicznych.

## 7. Implementuj modułami

Następne prompty wykonuj po jednym, zgodnie z numeracją. Każdy etap musi zakończyć się screenshotami i raportem. Nie pozwalaj Codexowi „przy okazji” przebudowywać kolejnych ekranów.

## 8. Wymagane viewporty

Desktop:

- 1440 × 900,
- 1536 × 1024,
- 1280 × 800.

Tablet kontrolny:

- 768 × 1024.

Mobile:

- 390 × 844,
- 375 × 812.

## 9. Kolejność poprawek wizualnych

1. geometria i układ,
2. szerokości i wysokości,
3. hierarchia informacji,
4. typografia,
5. spacing,
6. border i radius,
7. kolory i statusy,
8. cienie,
9. mikroanimacje.

Codex nie może naprawiać złej geometrii dodawaniem cieni, gradientów, kart ani dekoracji.

## 10. Zasada zatrzymania

Po każdym etapie Codex ma się zatrzymać. Brak zatrzymania jest błędem procesu, nawet gdy kod się buduje.
