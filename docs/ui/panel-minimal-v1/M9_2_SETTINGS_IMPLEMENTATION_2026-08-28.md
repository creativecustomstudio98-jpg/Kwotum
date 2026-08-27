# M9.2 — wdrożenie profesjonalnego ekranu Ustawień

**Status:** ukończony lokalnie  
**Data:** 2026-08-28  
**Zakres:** `/panel/[organizationId]/ustawienia`, bez migracji

## Referencja i interpretacja

Zaakceptowany obraz ma 997 × 1577 px i SHA-256
`fa1a565edae9cbe4971a4d7791f7a0d5cbece171488f2f5ab2c67575850962eb`.
Nie jest przechowywany w repozytorium, ponieważ zawiera dane identyfikujące
konto i organizację. Z obrazu przyjęto segmentowe menu z ikonami, tytuły
sekcji poza ramą, lokalne obramowania formularzy, kompozycję brandingu oraz
pola 44 px. Treść demonstracyjna nie tworzy wymagań produktu.

## Zmiany

- `Organizacja`, `Powiadomienia` i `Dane i prywatność` używają wspólnego
  segmentowego menu tras z code-native ikonami;
- każda sekcja ma jeden tytuł i opis poza powierzchnią oraz maksymalnie jedną
  główną akcję wewnątrz właściwego formularza;
- organizacja zachowuje edytowalną nazwę oraz identyfikator, konto i rolę tylko
  do odczytu;
- branding łączy podgląd, nazwę firmy, akcent i bezpieczne logo w jednej
  dwukolumnowej relacji;
- dostawa leadów pokazuje prawdziwy stan kanału email, bez nieaktywnych atrap;
- granica tenanta prezentuje tylko datę utworzenia i Tenant ID;
- loading i error używają tej samej anatomii powierzchni;
- mobile składa formularze do jednej kolumny i zachowuje przewijalne menu tras.

## Kontrakty zachowane

- żadnej migracji, nowej zależności ani zmiany architektury;
- server-side `organization:update` i `notification:manage` bez zmian;
- walidacja Zod, tenant scope, RLS i odczyt zasobów logo bez zmian;
- zapis nazwy, brandingu i adresu email nadal używa istniejących Server Actions;
- sukces i błąd pozostają lokalne dla właściwego formularza;
- wartość nie zmienia się bez jawnego zapisu;
- brak Slacka, dodatkowych webhooków, planu, regionu, usuwania organizacji,
  importu, eksportu, API i historii zmian bez kompletnego kontraktu domenowego.

## Visual QA

Artefakty znajdują się w
`artifacts/visual-qa/panel-minimal-v1/m9-settings/` i obejmują kanoniczny opis
referencji, `before`, finalny viewport referencyjny, desktop, dwa mobile,
forced colors, overlay, difference oraz `measurements.json`.

Track ma 432,8 × 46 px przy 997 px. Pola mają 44 px, a wszystkie cztery
powierzchnie border 1 px i radius 12 px. Macierz 320–1536 px, w tym 720 px jako
odpowiednik desktopu przy powiększeniu 200%, ma 0 px poziomego overflow. Axe
zwrócił 0 naruszeń, a focus w forced colors ma outline 3 px.

## Testy odbiorowe

- kontrakt CSS i brak demonstracyjnych funkcji w źródle;
- realny zapis i przywrócenie nazwy organizacji;
- realny zapis brandingu i adresu dostawy leadów;
- brak zmiany niezapisanej wartości po przeładowaniu;
- Owner: trzy działające formularze;
- Sales: nazwa i branding tylko do odczytu, brak formularza dostawy;
- klawiatura, mobile, long Polish copy, axe i forced colors;
- testy RLS obejmują negatywne przypadki drugiego tenanta;
- fixture E2E jest usuwany po przebiegu; potwierdzono 0 pozostałości.

Wyniki końcowe:

- `pnpm format:check` — PASS;
- `pnpm lint` — PASS, 8/8 pakietów;
- `pnpm typecheck` — PASS, 8/8 pakietów;
- `pnpm test:unit` — PASS, 29/29 zadań; web 56 plików / 228 testów;
- `pnpm test:rls` — PASS, w tym drugi tenant, role, branding i dostawa email;
- `pnpm test:wordpress` — PASS dla WP 6.9.2 i 7.0.2 / PHP 8.5.2;
- `pnpm build` — PASS, 24/24 zadania i runtime artifact;
- celowane E2E M9.2 — PASS, 2/2 scenariusze i cleanup 0;
- `pnpm security:secrets` — PASS.

`pnpm security:sast` nadal zatrzymuje się na zastanym suppression ESLint w
`szablony/template-library.tsx`. Plik nie należy do M9.2; zmieniony zakres nie
dodaje suppression, zależności ani nowych wejść danych.

Pierwszy E2E wykrył pole 47,6 px wynikające ze skalowania `rem`; implementację
skorygowano do jawnych 44 px, a dwa kolejne pełne przebiegi M9.2 przeszły.

## Rollback i następny etap

Rollback usuwa wariant segmentowy Ustawień, nowe klasy kompozycji i ikony
metadanych. Nie cofa danych ani migracji, ponieważ M9.2 ich nie zmienia.
Następnym zamkniętym etapem jest M9.3 — Pomoc.
