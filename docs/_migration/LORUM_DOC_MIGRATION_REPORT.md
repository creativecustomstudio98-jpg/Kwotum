# Raport migracji dokumentacji Lorum V6

**Data:** 2026-07-28  
**Etap:** reference lock, kanonizacja i pierwszy bezpieczny cleanup

## Wykonano

- dodano główny prompt V6 jako `CODEX_MASTER_PROMPT.md`;
- dodano zgodne z promptem katalogi `references/` i `snippets/`;
- przeniesiono pakiet `docs/ui/` z `nowydesign.zip`, łącznie z renderami,
  prototypami i instrukcjami;
- dodano jednoznaczny `docs/INDEX.md`;
- utworzono kanoniczne specyfikacje ekranów, responsive i visual QA;
- zapisano manifest, dekompozycję, pomiary i luki referencji;
- rozdzielono widoczną markę Lorum od stabilnych identyfikatorów Wyceno;
- wskazano konflikty między obrazami a zakresem MVP;
- zarchiwizowano pięć raportów historycznych w datowanym katalogu;
- usunięto identyczną kopię master promptu i zbędne kopie plansz;
- usunięto nieużywane, binarnie identyczne aliasy ilustracji auth;
- usunięto źródłowy ZIP po poprawnym teście integralności i utrwaleniu sum;
- łącznie usunięto 24 661 473 bajty (23,52 MiB).

## Nie wykonano

- nie zmieniono TSX, JSX, CSS, routingu, API, auth, RLS ani bazy;
- nie włączono funkcji widocznych wyłącznie na makietach;
- nie utworzono nowego brancha ani commita, ponieważ worktree zawiera
  rozległe, istniejące zmiany użytkownika;
- nie usunięto `Archiwum.zip` ani `apps/web/Archiwum.zip`, ponieważ nie są
  potwierdzonymi dokładnymi duplikatami aktywnego drzewa;
- nie usunięto unikalnych referencji, baseline'ów testowych ani artefaktów QA.

## Linki i duplikaty

Pakiety źródłowe zachowują własne linki względne. `docs/INDEX.md` kieruje do
aktywnego kontraktu. Cztery główne entry pointy plansz są w `references/`, zaś
celowe kopie wymagane przez odtwarzalne pakiety źródłowe pozostają opisane w
`docs/ui/REFERENCE_MANIFEST.md`.

## Weryfikacja 2026-07-28

- lokalne linki w 152 plikach Markdown — PASS, 0 broken links;
- Prettier dla wszystkich plików cleanupu — PASS;
- `pnpm lint` — 8/8 PASS;
- `pnpm typecheck` — 8/8 PASS;
- `pnpm test` — 96 testów jednostkowych oraz pełne RLS/PostgreSQL i WordPress
  PASS;
- `pnpm build` — 8/8 PASS, widget 15 903 B gzip;
- sumy SHA-256 czterech głównych plansz i dwóch aktywnych ilustracji auth
  pozostały zgodne z manifestem.

Pierwsza próba RLS w sandboxie nie mogła utworzyć pamięci współdzielonej
PostgreSQL. Ta sama pełna komenda `pnpm test` uruchomiona poza sandboxem
przeszła bez zmian kodu.

Pełny `pnpm format:check` przed i po cleanupie wskazuje te same trzy niezwiązane
pliki: `polityka-prywatnosci/page.tsx`, `regulamin/page.tsx` i
`panel/[organizationId]/page.tsx`. Nie zostały zmienione w tym etapie.

## Następny bezpieczny krok

Po przejściu gate'u Etapu 12L można zinwentaryzować unikalne, lecz historyczne
artefakty visual QA. Nie wolno usuwać ich wyłącznie na podstawie wieku; każdy
kandydat wymaga wskazania aktualnego następcy i sprawdzenia incoming links.

## Aktualizacja Etapu 12ZD — 2026-07-29

`apps/web/Archiwum.zip` został ponownie zinwentaryzowany. ZIP przeszedł test
integralności; z 153 właściwych plików 84 było identycznych z aktywnym drzewem,
68 było starszymi wersjami, a jeden stary plik stylów nie występuje już
w aktualnym shellu auth. Archiwum zawierało również metadane `__MACOSX`, output
builda widgetu i `tsconfig.tsbuildinfo`, nie było używane przez build, testy,
manifest ani aktywną dokumentację.

Po zapisaniu rozmiaru 403 671 B i SHA-256
`be800bed3734d0df02b4352a6dc0c7ba5abeb091868a7dbd12d0432ad69e0c16`
przeniesiono dokładnie ten plik do systemowego Kosza. Operacja pozostaje
odzyskiwalna do czasu opróżnienia Kosza. Pełny baseline repozytorium opisuje
`REPOSITORY_BASELINE_INVENTORY_2026-07-29.md`.
