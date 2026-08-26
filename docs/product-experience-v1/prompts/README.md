# Kolejność promptów PX1–PX7

Każdy prompt jest kontraktem jednego etapu, nie sugestią wykonania całego
programu. Uruchamiaj je wyłącznie w kolejności i we właściwym worktree:

1. `00_PROGRAM_ORCHESTRATOR.md`
2. `01_DISCOVERY_AND_CONTRACT.md`
3. `02_PRESENTATION_SCHEMA.md`
4. `03_QUICK_FORM.md`
5. `04_VISUAL_CHOICES.md`
6. `05_CONTEXT_PREFILL.md`
7. `06_COMPLETION_AND_BRANDING.md`
8. `07_CONTROLLED_PILOT.md`

Zasada: `audyt → plan → implementacja jednego etapu → testy → self-review →
dokumentacja → raport → STOP`.

Nie używaj promptu implementacyjnego, jeżeli poprzedni etap nie ma
zaakceptowanego gate’u i scalonego commita bazowego.
