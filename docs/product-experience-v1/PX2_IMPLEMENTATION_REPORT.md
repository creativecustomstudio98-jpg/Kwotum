# PX2 — raport lokalnej implementacji FlowDocument v3

**Data:** 2026-08-25  
**Zakres:** model, kompatybilność, walidacja i publiczny manifest  
**Środowisko:** wyłącznie lokalne; bez deployu i bez migracji danych środowiska  
**Wynik:** implementacja techniczna gotowa, formalny gate częściowy

## Wynik biznesowy

Kwotum ma teraz jeden wersjonowany kontrakt, który potrafi opisać prosty
formularz, prowadzony brief i przyszły konfigurator wizualny bez tworzenia
osobnych modeli leada lub słabszych ścieżek submitu. Etap nie zmienia wyglądu
widgetu. Przygotowuje bezpieczne dane dla PX3 i PX4.

## Kontrakt v3

| Poziom   | Pole                       | Dozwolone wartości / limit                            |
| -------- | -------------------------- | ----------------------------------------------------- |
| Dokument | `experienceMode`           | `quick_form`, `guided_brief`, `visual_configurator`   |
| Krok     | `presentation.variant`     | `default`, `text_cards`, `icon_cards`, `image_cards`  |
| Opcja    | `presentation.description` | opcjonalny tekst 1–180 znaków                         |
| Opcja    | `presentation.icon`        | jeden z 24 stabilnych kluczy allowlisty               |
| Opcja    | `presentation.asset`       | UUID oraz obowiązkowy tekst alternatywny 1–160 znaków |

Kontrakt jest ścisły. Nie dopuszcza dowolnych URL, HTML, SVG, CSS, JavaScript,
data URI ani swobodnych metadanych. Karty są dostępne tylko dla pytań wyboru.
`icon_cards` wymaga ikony każdej odpowiedzi, `image_cards` wymaga assetu każdej
odpowiedzi, a wariant inny niż `default` wymaga `visual_configurator`.

## Kompatybilność

- Czytnik przyjmuje snapshoty v1, v2 i v3.
- Migrator v1 → v2 → v3 działa deterministycznie wyłącznie w pamięci.
- v1/v2 otrzymują `guided_brief` i `default`; źródło nie jest mutowane.
- Builder zapisze v3 dopiero przy zwykłym zapisie edytowanego draftu.
- Historyczne wersje pozostają immutable i publikowalne w oryginalnej wersji.
- Manifest zachowuje wersje 1/2 dla starych snapshotów i emituje wersję 3 tylko
  dla snapshotu v3.

## Bezpieczeństwo i prywatność

- TypeScript i PostgreSQL niezależnie walidują tryb, wariant, kompletność kart,
  allowlistę ikon, UUID, tekst alternatywny i istniejące limity dokumentu.
- Manifest jest jawną projekcją. Nie zawiera sekcji, `sectionKey`, tenant ID,
  draftu, pricingu, scoringu ani prywatnych metadanych.
- Test A/B potwierdza, że tenant B nie może odczytać ani zwalidować flow v3
  tenanta A.
- Referencja assetu nie jest URL-em i PX2 nigdzie jej nie pobiera ani nie
  renderuje, więc nie tworzy ścieżki SSRF ani publicznego Storage.

## Istotne pliki

- `packages/validation/src/flow.ts` — FlowDocument v3, migrator i walidacja.
- `packages/validation/src/widget.ts` — allowlistowany manifest v3.
- `packages/widget/src/contracts.ts` i `manifest.ts` — parser runtime.
- `supabase/migrations/20260825000100_stage12zn_px2_flow_document_v3.sql` —
  niezależna walidacja PostgreSQL i builder manifestu.
- `supabase/tests/flow_domain.sql` i `widget_sessions.sql` — publikacja,
  kompatybilność, wycieki i drugi tenant.
- `docs/DECISIONS.md` — ADR-044.

## Gate lokalny

| Kontrola             | Wynik                                                   |
| -------------------- | ------------------------------------------------------- |
| Format               | PASS — cały projekt                                     |
| Lint                 | PASS — 8/8 pakietów, 0 ostrzeżeń                        |
| Typecheck            | PASS — 8/8 pakietów                                     |
| Unit                 | PASS — 258/258 testów                                   |
| RLS/PostgreSQL       | PASS — wszystkie migracje i zestawy testowe             |
| Build                | PASS — 16/16 zadań, 41 tras                             |
| Widget JS            | PASS — 21 757 B gzip przy budżecie 92 160 B             |
| Manifest v3          | PASS — jawny test limitu 256 KiB i braku pól prywatnych |
| Zmiana renderera/CSS | BRAK — PX2 zmienia parser, nie kompozycję ani style     |

Nie tworzono nowego pixel-diffu, ponieważ bieżący worktree zawierał wcześniejsze
zmiany wizualne bez czystego baseline'u PX2. Dowód tego etapu jest strukturalny:
nie zmieniono kontrolera renderowania, elementu widgetu ani jego CSS. Formalny
visual baseline należy ponowić z czystego SHA przed pierwszą zmianą wyglądu PX4.

Pierwsze uruchomienie RLS w ograniczonym sandboxie nie mogło utworzyć pamięci
współdzielonej PostgreSQL. Ten sam test został następnie uruchomiony jako
zatwierdzony lokalny proces i przeszedł w całości. Nie jest to błąd produktu.

## Otwarty warunek i uczciwy status

PX2 definiuje bezpieczną referencję assetu, ale nie tworzy jeszcze prywatnego,
tenantowego rejestru plików ani nie sprawdza, czy UUID należy do organizacji.
ADR-044 przypisuje rejestr, kontrolę własności, upload i resolver do PX4, bo
referencji nie wolno udostępnić bez całej ścieżki fallbacku, dostępności,
limitów i visual QA.

Z tego powodu nadrzędne zadanie PX2 pozostaje otwarte. Dozwolony następny krok
to jedna z dwóch jawnych decyzji:

1. zaakceptować, że ostatnie kryterium PX2 jest blokadą wejścia do PX4 i
   wdrożyć rejestr atomowo z rendererem mediów; albo
2. wydzielić prywatny rejestr i tenantową walidację referencji jako PX2B przed
   rozpoczęciem quick form.

Do czasu tej decyzji nie wolno udostępniać w builderze ani runtime wariantu
`image_cards`. PX3 nie został rozpoczęty.
