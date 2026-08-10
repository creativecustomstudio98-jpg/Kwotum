# Lorum Product UI Reference v1

Kompletny pakiet wykonawczy dla kontrolowanej przebudowy interfejsu aplikacji Lorum. Zawiera:

- 20 deterministycznie wyrenderowanych widoków desktop i mobile,
- 5 plansz przeglądowych w zaakceptowanym kierunku wizualnym,
- kanoniczną specyfikację UI, responsive, treści i stanów,
- procedurę porządkowania starej dokumentacji,
- zestaw promptów etapowych dla Codexa,
- fragment nadrzędnych reguł do `AGENTS.md`,
- procedurę odbioru wizualnego i technicznego.

Ten pakiet nie jest luźną inspiracją. Jest kontraktem wykonawczym. Codex ma odwzorować jego hierarchię, gęstość, proporcje, zachowanie i język wizualny, zachowując istniejącą logikę biznesową aplikacji.

## Najważniejsza zasada

Nie uruchamiaj wszystkich promptów naraz. Każdy prompt kończy jeden zamknięty etap. Następny można rozpocząć dopiero po:

1. przejrzeniu zmian,
2. uruchomieniu testów,
3. wykonaniu screenshotów,
4. porównaniu z referencją,
5. poprawieniu największych różnic,
6. zatwierdzeniu etapu.

## Struktura

```text
lorum-product-ui-reference-v1/
├── START_HERE.md
├── docs/
│   ├── 00_CANONICAL_SOURCE_OF_TRUTH.md
│   ├── 01_PRODUCT_UI_ARCHITECTURE.md
│   ├── 02_SCREEN_INVENTORY.md
│   ├── 03_DESIGN_SYSTEM.md
│   ├── 04_RESPONSIVE_RULES.md
│   ├── 05_CONTENT_AND_DATA_RULES.md
│   ├── 06_DOCUMENT_MIGRATION_AND_CLEANUP.md
│   ├── 07_VISUAL_QA_AND_ACCEPTANCE.md
│   ├── 08_IMPLEMENTATION_SEQUENCE.md
│   ├── 09_REFERENCE_MAP.md
│   └── 10_STATES_AND_EDGE_CASES.md
├── prompts/
│   ├── 00_TEAM_ORCHESTRATOR.md
│   ├── 01_REPOSITORY_AUDIT_AND_FREEZE.md
│   ├── 02_DOCUMENT_CLEANUP_AND_CANONICALIZATION.md
│   ├── 03_DESIGN_FOUNDATION_AND_APP_SHELL.md
│   ├── 04_DASHBOARD.md
│   ├── 05_LEADS_LIST.md
│   ├── 06_LEAD_DETAILS.md
│   ├── 07_PROCESS_LIBRARY_AND_BUILDER.md
│   ├── 08_LOGIC_PRICING_SCORING_RESULTS.md
│   ├── 09_ANALYTICS.md
│   ├── 10_TEMPLATES_INSTALLATION_WORDPRESS.md
│   ├── 11_INTEGRATIONS_AND_WEBHOOKS.md
│   ├── 12_AGENCY_MODULE.md
│   ├── 13_SETTINGS_TEAM_BILLING_PRIVACY.md
│   ├── 14_ONBOARDING_AND_PUBLIC_WIDGET.md
│   ├── 15_MOBILE_AND_RESPONSIVE_QA.md
│   ├── 16_FINAL_CONSOLIDATION_AND_CLEANUP.md
│   └── 17_ANTI_SLOP_RECOVERY.md
├── snippets/
│   ├── AGENTS.ui-product.md
│   ├── TASKS.ui-rebuild.template.md
│   └── CODEX_REPORT_TEMPLATE.md
└── reference/
    ├── accepted-style-board.png
    ├── screens.html
    ├── styles.css
    ├── build_reference.py
    ├── manifest.json
    ├── boards/
    └── screenshots/
```

## Gdzie umieścić pakiet w repozytorium

Rekomendowana lokalizacja:

```text
docs/ui/lorum-product-ui-reference-v1/
```

Nie rozrzucaj plików referencyjnych po repozytorium. Jeden katalog ułatwia Codexowi znalezienie źródła prawdy i późniejszą walidację.

## Co jest nadrzędne

1. `AGENTS.md` po uzupełnieniu regułami z `snippets/AGENTS.ui-product.md`.
2. Dokumenty z `docs/` w tym pakiecie.
3. Screenshoty i plansze z `reference/`.
4. Działająca logika domenowa, testy i kontrakty API istniejącej aplikacji.
5. Stara dokumentacja wyłącznie jako materiał migracyjny, nigdy jako równoległe źródło decyzji UI.

## Marka

Widoczna nazwa produktu to **Lorum**. Nazwa „Wyceno” może pozostać wyłącznie w starych materiałach archiwalnych albo technicznych identyfikatorach, których bezpieczna migracja wymaga osobnego ADR. Nie wolno wykonywać globalnego search-and-replace w migracjach, API, bazie danych, storage, zmiennych środowiskowych ani zewnętrznych integracjach bez audytu zależności.
