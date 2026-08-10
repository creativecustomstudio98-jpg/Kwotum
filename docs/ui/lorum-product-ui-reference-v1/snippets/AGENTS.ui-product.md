# LORUM UI PRODUCT RULES — fragment do AGENTS.md

## Źródło prawdy

Przed każdą zmianą UI przeczytaj:

- `docs/ui/lorum-product-ui-reference-v1/docs/00_CANONICAL_SOURCE_OF_TRUTH.md`,
- właściwe dokumenty z tego pakietu,
- odpowiadający screenshot lub planszę,
- `docs/TASKS.md`, `docs/DECISIONS.md` i `docs/RISKS.md`.

Referencje są celem kompozycyjnym i systemowym, nie luźną inspiracją.

## Marka

Widoczna marka produktu to Lorum. Nie wykonuj globalnego rename technicznych identyfikatorów „wyceno” bez osobnego planu migracji i ADR.

## Ochrona logiki

Zmiana UI nie może samodzielnie zmieniać:

- routingu,
- auth i permissions,
- tenant scope i RLS,
- kontraktów API,
- modelu danych,
- pricing/scoring/conditional logic,
- wersjonowania flow,
- uploadu,
- webhooków,
- e-maili,
- publicznych identyfikatorów.

## Bezwzględne zakazy wizualne

Nie dodawaj:

- gradientów dekoracyjnych,
- glassmorphismu,
- glow/neon,
- blobów/orbów,
- losowych pływających kart,
- siatek identycznych kart 3×3,
- wielkich promieni,
- pill buttons poza semantycznymi statusami,
- kolorowych kwadratów pod każdą ikoną,
- fake 3D,
- stockowych avatarów,
- sztucznych dashboardów i wykresów,
- fałszywego social proof,
- ogromnych nagłówków wewnątrz aplikacji,
- domyślnego wyglądu shadcn/ui,
- nowych sekcji/copy tylko dla wypełnienia przestrzeni.

## System wizualny

- warm off-white page,
- białe powierzchnie,
- dark forest green jako marka,
- cienkie neutralne border,
- radius 4/6/8/10–12 px,
- subtelne cienie,
- jedna rodzina groteskowa,
- ikony liniowe,
- panel B2B zwarty i oparty na danych,
- status color używany semantycznie.

Nie zapisuj lokalnych hexów, radiusów i cieni, jeśli istnieje token.

## Mobile

Mobile jest osobną kompozycją. W szczególności:

- tabela leadów → kompaktowa lista,
- builder → drill-down,
- ustawienia → lista kategorii + osobny ekran,
- filtry → drawer/bottom sheet,
- główne działania mogą być sticky,
- brak poziomego scrolla w głównej ścieżce.

## Procedura etapu

1. Sprawdź git i nie nadpisuj zmian użytkownika.
2. Uruchom baseline lint/typecheck/test/build.
3. Zrób screenshot przed zmianą.
4. Wykonaj jeden zamknięty etap.
5. Dodaj loading/empty/error/permission states.
6. Uruchom lint/typecheck/test/build.
7. Zrób screenshot po zmianie.
8. Wypisz 10 największych różnic względem referencji.
9. Napraw: geometria → hierarchia → typografia → spacing → border/radius → kolor → shadow → motion.
10. Wykonaj drugi screenshot.
11. Zaktualizuj docs/TASKS/DECISIONS/RISKS.
12. Zatrzymaj się.

## Definition of Done UI

Ekran jest ukończony tylko gdy:

- główny JTBD działa,
- widoczne akcje nie są atrapami,
- realne dane lub jawny tryb demo,
- loading/empty/error/permission states,
- desktop/tablet/mobile,
- keyboard/focus/WCAG AA,
- testy i build przechodzą,
- visual QA wykonany,
- dokumentacja aktualna.
