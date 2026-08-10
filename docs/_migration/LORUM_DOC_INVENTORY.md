# Inwentaryzacja dokumentacji przed V6

**Data:** 2026-07-28  
**Zakres:** dokumentacja i referencje UI  
**Zasada:** bez usuwania ani przenoszenia w rozległym, istniejącym worktree

## KEEP — aktywne i unikalne

| Grupa            | Pliki                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Produkt          | `PRODUCT_VISION.md`, `PRODUCT_REQUIREMENTS.md`, `SCOPE.md`, `NON_GOALS.md`, `JOBS_TO_BE_DONE.md`, `PERSONAS.md`, `USER_JOURNEYS.md`                           |
| Architektura     | `ARCHITECTURE.md`, `DATABASE.md`, `API_CONTRACTS.md`, `DEPENDENCIES.md`, `DEVELOPMENT.md`                                                                     |
| Security/privacy | `SECURITY.md`, `THREAT_MODEL.md`, `AUTHORIZATION.md`, `PRIVACY.md`, `DPA_AND_SUBPROCESSORS.md`, `BACKUP_AND_RECOVERY.md`                                      |
| Domena           | `FLOW_DOMAIN.md`, `ESTIMATION_ENGINE.md`, `LEAD_PIPELINE.md`, `NOTIFICATIONS.md`, `WIDGET_ARCHITECTURE.md`, `WIDGET_IMPLEMENTATION.md`, `WORDPRESS_PLUGIN.md` |
| Delivery         | `TASKS.md`, `ROADMAP.md`, `QA_PLAN.md`, `RELEASE_CHECKLIST.md`, `DEPLOYMENT.md`, `OBSERVABILITY.md`, `POST_LAUNCH.md`                                         |
| Marketing        | `CONTENT_ARCHITECTURE.md`, `CONTENT_DESIGN.md`, `MARKETING_STRATEGY.md`, `MARKETING_IMPLEMENTATION.md`, `SEO_STRATEGY.md`, `CRO_PLAN.md`                      |
| UX/UI            | `DESIGN_SYSTEM.md`, `DESIGN_PRINCIPLES.md`, `ACCESSIBILITY.md`, `EMPTY_LOADING_ERROR_STATES.md`, `ACCEPTANCE_CRITERIA.md`, `INFORMATION_ARCHITECTURE.md`      |
| Badania          | `research/*`                                                                                                                                                  |

## MERGE — unikalne decyzje zachowane w nowych źródłach

| Źródło                                        | Cel scalenia                                         | Stan                                  |
| --------------------------------------------- | ---------------------------------------------------- | ------------------------------------- |
| `LORUM_PRESENTATION_REDESIGN.md`              | `DESIGN_SYSTEM.md`, `UI_SCREEN_SPEC.md`, ADR-024–028 | zmapowano i zarchiwizowano 2026-07-28 |
| `REFERENCE_LED_REBRAND_2026-07-26.md`         | `UI_SCREEN_SPEC.md`, `VISUAL_QA.md`                  | zmapowano i zarchiwizowano 2026-07-28 |
| `HOME_REFERENCE_RECONSTRUCTION_2026-07-26.md` | `UI_SCREEN_SPEC.md`, `RESPONSIVE_LAYOUT.md`          | zmapowano i zarchiwizowano 2026-07-28 |
| pakiet `lorum-landing-reference-v2`           | V6 manifest, screen spec i pomiary                   | zachowany jako read-only source       |
| pakiet `lorum-product-ui-reference-v1`        | V6 manifest, screen spec i responsive                | zachowany jako read-only source       |

## REPLACE — źródło nadrzędne zostało wskazane

| Stary lub równoległy opis                   | Zastępujący kontrakt                                          |
| ------------------------------------------- | ------------------------------------------------------------- |
| luźne zasady wizualne w raportach etapowych | `docs/INDEX.md`, `docs/DESIGN_SYSTEM.md`, `docs/VISUAL_QA.md` |
| lokalne opisy breakpointów                  | `docs/RESPONSIVE_LAYOUT.md`                                   |
| inwentarze ekranów z plansz v1              | `docs/UI_SCREEN_SPEC.md`                                      |
| niejawna kolejność obrazów                  | `docs/ui/REFERENCE_MANIFEST.md`                               |

## ARCHIVE — wykonane 2026-07-28

- `_archive/2026-07-28-pre-lorum-ui-v6/PREMIUM_MINIMAL_REDESIGN_AUDIT.md`;
- `_archive/2026-07-28-pre-lorum-ui-v6/PREMIUM_MINIMAL_REDESIGN_PROMPT.md`;
- `_archive/2026-07-28-pre-lorum-ui-v6/REFERENCE_LED_REBRAND_2026-07-26.md`;
- `_archive/2026-07-28-pre-lorum-ui-v6/HOME_REFERENCE_RECONSTRUCTION_2026-07-26.md`;
- `_archive/2026-07-28-pre-lorum-ui-v6/LORUM_PRESENTATION_REDESIGN.md`.

Incoming links zostały przepisane na ścieżki archiwalne albo na kanoniczny
kontrakt. Każdy plik ma komunikat `ARCHIVED`.

## DELETE — wykonane 2026-07-28

- identyczna kopia `docs/ui/CODEX_MASTER_PROMPT_V6.md`;
- cztery plansze z `docs/ui/references/`, identyczne z `references/`;
- publiczna kopia planszy produktu, identyczna z
  `references/product-app-board.png`;
- niewersjonowane aliasy ilustracji auth, identyczne z aktywnymi plikami `-v2`;
- starsza kopia `templates.png`, identyczna z `templates-mobile-v2.png`;
- dwie kopie `artifacts/redesign/board-2-before/*`, identyczne z aktywnymi
  plikami `artifacts/visual-qa/12f-board-2/*/before.png`;
- `nowydesign.zip` po poprawnym `unzip -t`, ekstrakcji i zapisaniu SHA-256.

Zachowano celowe duplikaty między `references/` a pakietami źródłowymi,
unikalne referencje, wszystkie baseline'y Playwright oraz unikalne artefakty
visual QA.
