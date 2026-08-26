# PX2 — wersjonowany kontrakt prezentacji

**Główne pliki:** `packages/validation`, `packages/widget/src/contracts.ts`,
manifest, migrator, walidacja PostgreSQL, dokumentacja domeny.  
**Zakazane:** nowy wygląd widgetu, upload mediów, branding, prefill.

## Wynik

Flow schema v3 opisuje tryb doświadczenia i bezpieczną prezentację pytań.
Historyczne snapshoty pozostają poprawne. Publiczny manifest ujawnia wyłącznie
allowlistowane pola potrzebne rendererowi.

## Ryzyka

Kompatybilność immutable snapshotów, rozjazd TypeScript/PostgreSQL, wzrost
manifestu i przypadkowe ujawnienie prywatnych metadanych.
