# Lorum — kolejność realizacji V6 Image-Locked

**Zasada:** 1 prompt = 1 mały etap = 1 branch = 1 końcowy commit = raport = STOP.

1. Reference lock + repo audit read-only.
2. Dokument inventory + plan kanonizacji; bez cleanupu destrukcyjnego.
3. Kontrolowana kanonizacja dokumentów i aktualizacja `AGENTS.md`.
4. Design foundation: tokeny, primitives, typography, icons, states.
5. App shell desktop/tablet/mobile.
6. Landing board 1: navbar, hero, data strip, problem/result, how it works.
7. Landing board 2: interactive demo, industries/templates.
8. Landing board 3: features sequence, WordPress, agency, evidence.
9. Landing board 4: pricing, FAQ, final CTA, footer.
10. Auth i onboarding.
11. Dashboard.
12. Leads list.
13. Lead detail.
14. Process library/templates.
15. Builder.
16. Conditional logic.
17. Pricing + scoring + result.
18. Analytics.
19. Installation + WordPress.
20. Integrations + webhooks + API keys.
21. Agency workspace.
22. Settings + team + privacy + billing/usage.
23. Public widget desktop/mobile.
24. Global responsive/layout-integrity pass.
25. Accessibility, visual regression i performance pass.
26. Final docs migration, archive starych materiałów, broken-link check, legacy-name audit.

Po każdym etapie:

`reference → before → implementation → after-v1 → overlay → 10 różnic → poprawki → after-v2 → overlay → layout/a11y/tests/build → docs → commit → raport → STOP`.

W razie powrotu AI slopu uruchom `docs/ui/lorum-product-ui-reference-v1/prompts/17_ANTI_SLOP_RECOVERY.md`, ale nadal w ramach bieżącego małego etapu.
