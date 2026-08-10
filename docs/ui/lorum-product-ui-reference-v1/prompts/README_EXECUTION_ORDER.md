# Kolejność promptów


> **V6 IMAGE-LOCKED — obowiązuje nadrzędnie**
>
> Przed wykonaniem tego etapu przeczytaj `CODEX_MASTER_PROMPT.md`, sprawdź obrazy załączone do bieżącej wiadomości oraz właściwe cropy z `docs/ui/references/derived/`. Obrazy są specyfikacją, nie inspiracją. Nie upraszczaj kompozycji, gęstości, inner UI ani mobile. Ten etap działa według zasady: `1 prompt = 1 mały etap = 1 branch = 1 końcowy commit`. Wymagane: reference → before → after-v1 → overlay → poprawki → after-v2 → overlay → layout/a11y/tests/build → raport → STOP.

1. `00_TEAM_ORCHESTRATOR.md`
2. `01_REPOSITORY_AUDIT_AND_FREEZE.md`
3. `02_DOCUMENT_CLEANUP_AND_CANONICALIZATION.md`
4. `03_DESIGN_FOUNDATION_AND_APP_SHELL.md`
5. `04_DASHBOARD.md`
6. `05_LEADS_LIST.md`
7. `06_LEAD_DETAILS.md`
8. `07_PROCESS_LIBRARY_AND_BUILDER.md`
9. `08_LOGIC_PRICING_SCORING_RESULTS.md`
10. `09_ANALYTICS.md`
11. `10_TEMPLATES_INSTALLATION_WORDPRESS.md`
12. `11_INTEGRATIONS_AND_WEBHOOKS.md`
13. `12_AGENCY_MODULE.md`
14. `13_SETTINGS_TEAM_BILLING_PRIVACY.md`
15. `14_ONBOARDING_AND_PUBLIC_WIDGET.md`
16. `15_MOBILE_AND_RESPONSIVE_QA.md`
17. `16_FINAL_CONSOLIDATION_AND_CLEANUP.md`

`17_ANTI_SLOP_RECOVERY.md` uruchamiaj wyłącznie wtedy, gdy konkretna iteracja odeszła od referencji.

Po każdym promptcie obowiązuje ręczny gate. Nie łącz promptów w jeden przebieg.
