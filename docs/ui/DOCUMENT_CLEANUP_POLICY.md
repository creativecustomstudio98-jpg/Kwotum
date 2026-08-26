# Kwotum — polityka czyszczenia dokumentacji

**Status:** CANONICAL
**Owner:** Documentation Architect
**Last reviewed:** 2026-08-26

## Zasada

Najpierw inwentaryzacja, następnie MERGE/REPLACE/ARCHIVE, dopiero na końcu DELETE. Nie wolno masowo usuwać `docs/`, zgubić unikalnych decyzji ani utworzyć kolejnej warstwy równoległych źródeł prawdy.

## Klasyfikacja

- **KEEP** — aktualny, unikalny i zgodny.
- **MERGE** — unikalna treść trafia do dokumentu kanonicznego.
- **REPLACE** — treść zostaje przeniesiona, linki poprawione, stary plik archiwizowany.
- **ARCHIVE** — historyczny; nie steruje pracami.
- **DELETE** — wyłącznie bez unikalnej treści, bez linków, bez zależności toolingowych, z historią w Git i wpisem w raporcie.

## Dokumenty V6, które mają być aktywne

- `CODEX_MASTER_PROMPT.md`
- `AGENTS.md`
- `docs/INDEX.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/UI_SCREEN_SPEC.md`
- `docs/RESPONSIVE_LAYOUT.md`
- `docs/VISUAL_QA.md`
- `docs/ui/REFERENCE_IMAGE_PROTOCOL.md`
- `docs/ui/SECTION_FIDELITY_MATRIX.md`
- `docs/ui/VISUAL_ACCEPTANCE_SCORECARD.md`
- `docs/ui/REFERENCE_MANIFEST.md`
- `docs/ui/panel-minimal-v1/README.md`

Pakiet `lorum-product-ui-reference-v1` został usunięty po konsolidacji do
`panel-minimal-v1`. `lorum-landing-reference-v2` pozostaje materiałem
pomocniczym tylko dla landingu i nie może konkurować z V7 ani sterować panelem.

## Obowiązkowe artefakty migracji

- `docs/_migration/LORUM_DOC_INVENTORY.md`
- `docs/_migration/LORUM_DOC_MIGRATION_REPORT.md`
- `docs/_migration/LORUM_BRAND_IDENTIFIER_MATRIX.md`
- `docs/_migration/LORUM_REFERENCE_LOCK_REPORT.md`
- `docs/INDEX.md`

## Archiwum

```text
docs/_archive/YYYY-MM-DD-pre-lorum-ui-v6/
```

Każdy plik archiwalny otrzymuje komunikat:

```text
ARCHIVED — nie jest źródłem prawdy. Zastąpiony przez: <ścieżka>
```

## Finalny gate dokumentacji

- brak broken links,
- brak dwóch aktywnych dokumentów opisujących ten sam kontrakt inaczej,
- brak niezamierzonych aktywnych odwołań do Wyceno/BRANCI/Branci/Brunchy,
- celowo zachowane legacy identifiers opisane w ADR/matrycy,
- `docs/INDEX.md` wskazuje jedno źródło prawdy dla każdego obszaru,
- stare pliki są zarchiwizowane albo usunięte zgodnie z raportem.
