# Indeks dokumentacji Kwotum

**Status:** kanoniczny  
**Ostatni przegląd:** 2026-08-09

Ten plik wskazuje jedno aktywne źródło prawdy dla każdego obszaru. Materiały
referencyjne i raporty historyczne nie zastępują wymagań produktu, decyzji ADR
ani kontroli bezpieczeństwa.

Program startu sprzedaży ma trzy główne dokumenty wykonawcze:
`PRODUCTION_READINESS.md`, `SECURITY_AND_DATA.md` i
`LAUNCH_FIRST_5_CLIENTS.md`. Odsyłają one do szczegółowych kontraktów poniżej,
zamiast tworzyć ich konkurencyjne kopie.

## Kolejność pierwszeństwa

1. Bezpieczeństwo, prywatność i tenant isolation:
   `SECURITY.md`, `PRIVACY.md`, `AUTHORIZATION.md`, `THREAT_MODEL.md`.
2. Zaakceptowane decyzje przekrojowe: `DECISIONS.md`.
3. Zakres i zachowanie produktu: `PRODUCT_REQUIREMENTS.md`, `SCOPE.md`,
   `NON_GOALS.md`.
4. Kontrakty architektury i danych: `ARCHITECTURE.md`, `DATABASE.md`,
   `API_CONTRACTS.md`.
5. Aktywny backlog i gate'y: `TASKS.md`.
6. Program dojścia do pilota i produkcji: `PRODUCTION_READINESS_PLAN.md`
   oraz blokująca `RELEASE_CHECKLIST.md`.
7. Kontrakt wykonawczy V7 desktop-first, korzystający z referencji V6
   Image-Locked: `../CODEX_MASTER_PROMPT.md`,
   `DESIGN_SYSTEM.md`, `UI_SCREEN_SPEC.md`, `RESPONSIVE_LAYOUT.md`,
   `VISUAL_QA.md` oraz `ui/REFERENCE_MANIFEST.md`.
8. Raporty etapów i materiały źródłowe — kontekst historyczny, bez prawa do
   samodzielnego rozszerzania zakresu.

Nowszy obraz zaakceptowany w rozmowie może zastąpić starszą geometrię wyłącznie
po zapisaniu różnicy w `ui/REFERENCE_MANIFEST.md` lub
`ui/REFERENCE_GAPS.md`. Obraz nigdy nie obniża wymagań bezpieczeństwa i nie
zatwierdza funkcji spoza `SCOPE.md`.

## Mapa źródeł prawdy

| Obszar                          | Dokument kanoniczny                                     | Dokumenty uzupełniające                                                                                  |
| ------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Cel i pozycjonowanie            | `PRODUCT_VISION.md`                                     | `JOBS_TO_BE_DONE.md`, `PERSONAS.md`, `USER_JOURNEYS.md`                                                  |
| Zakres MVP                      | `PRODUCT_REQUIREMENTS.md`, `SCOPE.md`, `NON_GOALS.md`   | `ROADMAP.md`                                                                                             |
| Decyzje                         | `DECISIONS.md`                                          | `ASSUMPTIONS_AND_OPEN_QUESTIONS.md`, `RISKS.md`                                                          |
| Architektura                    | `ARCHITECTURE.md`                                       | `DEPENDENCIES.md`, `DEVELOPMENT.md`                                                                      |
| Dane i tenant scope             | `DATABASE.md`, `AUTHORIZATION.md`                       | `FLOW_DOMAIN.md`, `LEAD_PIPELINE.md`                                                                     |
| Bezpieczeństwo                  | `SECURITY.md`, `THREAT_MODEL.md`                        | `SECURITY_AUDIT_2026-07-25.md`, `BACKUP_AND_RECOVERY.md`                                                 |
| Prywatność                      | `PRIVACY.md`                                            | `DPA_AND_SUBPROCESSORS.md`, `RELEASE_CHECKLIST.md`                                                       |
| Widget                          | `WIDGET_ARCHITECTURE.md`                                | `WIDGET_IMPLEMENTATION.md`, `WORDPRESS_PLUGIN.md`                                                        |
| Podgląd i udostępnianie procesu | `FLOW_PREVIEW_AND_SHARING_IMPLEMENTATION_2026-08-03.md` | `WIDGET_ARCHITECTURE.md`, `NOTIFICATIONS.md`, ADR-035                                                    |
| Operacyjna obsługa leada        | `LEAD_OPERATIONS_IMPLEMENTATION_2026-08-03.md`          | `LEAD_PIPELINE.md`, `AUTHORIZATION.md`, ADR-036                                                          |
| E-maile konta i SMTP Auth       | `AUTH_EMAILS.md`                                        | `NOTIFICATIONS.md`, `SECURITY_AND_DATA.md`, ADR-018                                                      |
| Webhook `lead.created`          | `WEBHOOKS.md`                                           | `API_CONTRACTS.md`, `SECURITY.md`, ADR-034                                                               |
| Runtime liveness i readiness    | `RUNTIME_READINESS_IMPLEMENTATION_2026-08-03.md`        | `DEPLOYMENT.md`, `OBSERVABILITY.md`, ADR-037                                                             |
| Estymacja                       | `ESTIMATION_ENGINE.md`                                  | `PRODUCT_REQUIREMENTS.md`, ADR-016                                                                       |
| Analityka                       | `ANALYTICS_PLAN.md`                                     | `ANALYTICS_IMPLEMENTATION.md`, ADR-019                                                                   |
| Marketing i SEO                 | `CONTENT_ARCHITECTURE.md`, `SEO_STRATEGY.md`            | `MARKETING_IMPLEMENTATION.md`, `CRO_PLAN.md`                                                             |
| Treść i stany UX                | `CONTENT_DESIGN.md`, `EMPTY_LOADING_ERROR_STATES.md`    | `ACCEPTANCE_CRITERIA.md`                                                                                 |
| System wizualny                 | `DESIGN_SYSTEM.md`                                      | `DESIGN_PRINCIPLES.md`, ADR-024–ADR-028                                                                  |
| Zakres ekranów                  | `UI_SCREEN_SPEC.md`                                     | `ui/MASTER_SCREEN_SCOPE.md`, `panel-reference-audit.md`, `BUILDER_COMPLETENESS_AUDIT_2026-07-29.md`      |
| Responsive                      | `RESPONSIVE_LAYOUT.md`                                  | `ui/RESPONSIVE_LAYOUT_INTEGRITY.md`                                                                      |
| Visual QA                       | `VISUAL_QA.md`                                          | `panel-visual-qa.md`, `QA_PLAN.md`, `ACCESSIBILITY.md`                                                   |
| Obrazy referencyjne             | `ui/REFERENCE_MANIFEST.md`                              | `ui/UI_REFERENCE_INDEX.md`, `ui/REFERENCE_IMAGE_PROTOCOL.md`                                             |
| Marka Kwotum                    | `DECISIONS.md` (ADR-033)                                | `ui/kwotum-brand-v1/`, `_migration/LORUM_BRAND_IDENTIFIER_MATRIX.md`                                     |
| Rebranding podstron             | `ui/marketing-subpages-v1/MASTER_REBRAND_PLAN.md`       | `ui/marketing-subpages-v1/ROUTE_AND_SECTION_AUDIT.md`, `ui/marketing-subpages-v1/DESIGN_ARCHITECTURE.md` |
| Plan prac                       | `TASKS.md`                                              | `ROADMAP.md`, `RELEASE_CHECKLIST.md`                                                                     |
| Gotowość produkcyjna            | `PRODUCTION_READINESS.md`                               | `PRODUCTION_READINESS_PLAN.md`, `RELEASE_CHECKLIST.md`, `DEPLOYMENT.md`                                  |
| Bezpieczeństwo startu           | `SECURITY_AND_DATA.md`                                  | `SECURITY.md`, `DATABASE.md`, `AUTHORIZATION.md`, `BACKUP_AND_RECOVERY.md`                               |
| Pierwszych 5 klientów           | `LAUNCH_FIRST_5_CLIENTS.md`                             | `ROADMAP.md`, `ANALYTICS_PLAN.md`, `CRO_PLAN.md`                                                         |

## Kontrakt wykonawczy V7 i pakiety źródłowe V6

- `ui/landing-desktop-v7/` — najnowsze osiem zablokowanych referencji
  desktopowego `/`, audyt D0, mapa pomiarów oraz raporty odebranych etapów D1,
  D2, D3, D4, integracji, pricingu, FAQ, finalnego CTA oraz footera z audytem
  całej kompozycji V7-08; nadrzędne dla pokazanych regionów.
- `ui/landing-mobile-v1/` — aktywny, sekcyjny kontrakt transformacji mobile,
  audit M0 oraz raporty odbioru M1–M9; zachowuje treść V7 i używa V6 mobile
  wyłącznie jako wzorca mobilnej hierarchii.
- `ui/marketing-subpages-v1/` — aktywny program rebrandingu 19 publicznych
  podstron poza `/`: zamknięty baseline R0, audyt każdej trasy i sekcji,
  współdzielona architektura wizualna oraz etapowy plan R1–R12. Nie zatwierdza
  implementacji kolejnych etapów bez osobnego gate'u.
- `ui/lorum-landing-reference-v2/` — starsza mierzalna referencja landingu,
  prototyp i renderingi. Materiał pomocniczy dla regionów niepokazanych w V7.
- `ui/lorum-product-ui-reference-v1/` — referencje panelu, mobile i buildera.
  Materiał źródłowy; najnowsze obrazy wymienione w manifeście mają pierwszeństwo.
- `../references/` — główne plansze V6 zachowane dla historii i regionów
  niepokazanych w V7; nie utrzymujemy ich dodatkowej kopii w `ui/references/`.
- `../CODEX_MASTER_PROMPT.md` — jedyny aktywny master prompt. V7 ogranicza
  najbliższą przebudowę do wiernej rekonstrukcji desktopu `/`, wymaga audytu
  przed usuwaniem martwego kodu i odkłada właściwy redesign mobile do osobnego
  etapu. Referencje V6 pozostają mierzalnym źródłem obrazu.
- `../snippets/layout-integrity.spec.ts` — referencyjny test integralności
  layoutu; przed użyciem trzeba dostosować selektory do bieżącego etapu.

Aktualną rekonstrukcję panelu dokumentują `panel-reference-audit.md`,
`panel-ui-gap-analysis.md` i `panel-visual-qa.md`. Pierwszy blokuje pomiary,
drugi zachowuje porównanie stanu „przed”, a trzeci jest raportem odbioru po
implementacji.

Historyczną korektę hero strony głównej dokumentuje
`LANDING_RENDERED_PHONE_HERO_2026-07-29.md`. Pakiet
`ui/landing-desktop-v7/` nadpisuje geometrię desktopowego landingu w pokazanych
regionach. Wcześniejsze pełne rendery V6, iteracje 3D i telefonu pozostają
materiałem audytowym oraz źródłem historii decyzji, nie bieżącym wzorcem.

## Dokumenty historyczne

Poniższe raporty opisują wykonane iteracje i nie sterują kolejną przebudową:

- `_archive/2026-07-28-pre-lorum-ui-v6/PREMIUM_MINIMAL_REDESIGN_AUDIT.md`;
- `_archive/2026-07-28-pre-lorum-ui-v6/PREMIUM_MINIMAL_REDESIGN_PROMPT.md`;
- `_archive/2026-07-28-pre-lorum-ui-v6/REFERENCE_LED_REBRAND_2026-07-26.md`;
- `_archive/2026-07-28-pre-lorum-ui-v6/HOME_REFERENCE_RECONSTRUCTION_2026-07-26.md`;
- `_archive/2026-07-28-pre-lorum-ui-v6/LORUM_PRESENTATION_REDESIGN.md`.

Klasyfikację i dowody czyszczenia zachowują
`_migration/LORUM_DOC_INVENTORY.md` i
`_migration/LORUM_DOC_MIGRATION_REPORT.md`. Bieżący baseline całego
repozytorium, w tym jawna klasyfikacja lokalnych archiwów i artefaktów QA,
znajduje się w
`_migration/REPOSITORY_BASELINE_INVENTORY_2026-07-29.md`. Decyzje o retencji
obrazów dokumentuje `_migration/VISUAL_QA_RETENTION_2026-07-29.md`. Bieżący
drugi pass, klasyfikację dużego worktree, wynik dependency audit oraz otwarte
blokery clean-SHA/CI zapisuje
`_migration/REPOSITORY_BASELINE_AUDIT_2026-08-08.md`.

## Nazwa prezentacyjna a identyfikatory

Widoczna marka to **Kwotum**. Identyfikatory kompatybilności `@wyceno/*`,
`<wyceno-widget>`, `wyceno:*`, `X-Wyceno-Session`, shortcode i namespace
WordPress oraz historyczne prefiksy preferencji `lorum:*` pozostają celowo bez
zmian zgodnie z ADR-033. Pełna matryca znajduje
się w `_migration/LORUM_BRAND_IDENTIFIER_MATRIX.md`.
