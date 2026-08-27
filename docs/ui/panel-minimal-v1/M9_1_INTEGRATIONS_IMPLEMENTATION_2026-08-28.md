# M9.1 — wdrożenie profesjonalnego ekranu Integracji

**Status:** ukończony lokalnie  
**Data:** 2026-08-28  
**Zakres:** `/integracje/wordpress` i `/integracje/webhooki`, bez migracji

## Referencja i interpretacja

Zaakceptowany obraz ma 1651 × 953 px i SHA-256
`d864f27cdb08a1b0c5110b04da97935863d42c8f7534359de6fccb2a4c479cc3`.
Nie jest przechowywany w repozytorium, ponieważ zawiera dane identyfikujące
konto i organizację. Z obrazu przyjęto segmentowe przełączanie, białą
powierzchnię, dwukolumnowy pierwszy region, lokalne obramowania podsekcji oraz
niższe pola formularzy. Treść demonstracyjna nie tworzy wymagań produktu.

## Zmiany

- wspólna nawigacja tras otrzymała wariant `segmented`, używany tylko przez
  Integracje;
- WordPress i Webhooki mają ten sam rytm 24 px oraz powierzchnie z ramą 1 px
  i promieniem 12 px;
- stan, komunikat bezpieczeństwa, metryki i formularz tworzą jeden region;
- pola originu i URL mają 44 px wysokości oraz spójne focus/error/disabled;
- połączenia, endpointy i historia używają lokalnych obramowanych list;
- loading, error, empty i connected zachowują wspólną anatomię;
- mobile składa pierwszy region do jednej kolumny, a segmenty wypełniają
  dostępną szerokość;
- dodano wspólny pusty stan oraz code-native ikony webhooka, inboxu i historii;
- usunięto drugą główną akcję z WordPressa; nawigacja do procesów nadal działa
  przez istniejące menu panelu.

## Kontrakty zachowane

- żadnej migracji, nowej zależności ani zmiany architektury;
- HMAC, rotacja sekretu, test syntetyczny i wyłączenie endpointu bez zmian;
- publiczny HTTPS, kontrola DNS/IP, brak credentiali i redirectów bez zmian;
- WordPress nadal używa jednorazowego tokenu przypiętego do originu;
- server-side capability gating, RLS, tenant scope, audyt i request IDs bez zmian;
- historia techniczna nadal nie ujawnia payloadu, response body ani PII.

## Visual QA

Artefakty znajdują się w
`artifacts/visual-qa/panel-minimal-v1/m9-integrations/` i obejmują `before`,
finalny desktop, connected/empty, mobile, forced colors, overlay, difference
oraz mierzalny `measurements.json`.

Macierz 1440 × 900, 768 × 1024, 390 × 844 i 320 × 800 dla obu tras ma 0 px
poziomego overflow. Track ma 270 × 46 px na desktopie, segment 132 × 40 px,
pole 44 px, a wszystkie sprawdzane powierzchnie border 1 px / radius 12 px.

## Testy odbiorowe

- test kontraktu motywu: segmenty, ramy i wysokość pola;
- E2E connected: przełączanie tras, geometria, responsive, axe i forced colors;
- E2E empty: WordPress i Webhooki na desktopie i mobile, axe;
- E2E Sales: brak linku Integracji, serwerowe `FORBIDDEN` przy wejściu
  bezpośrednim oraz brak formularzy i akcji;
- E2E akcji webhooków: test syntetyczny, obrót sekretu i wyłączenie endpointu;
- fixture E2E jest usuwany po przebiegu; potwierdzono 0 pozostałości.

Wyniki końcowe:

- `pnpm format:check` — PASS;
- `pnpm lint` — PASS, 8/8 pakietów;
- `pnpm typecheck` — PASS, 8/8 pakietów;
- `pnpm test:unit` — PASS, w tym web 56 plików / 227 testów;
- `pnpm test:rls` — PASS, w tym izolacja tenantów, webhooki i WordPress;
- `pnpm test:wordpress` — PASS dla WP 6.9.2 i 7.0.2 / PHP 8.5.2;
- `pnpm build` — PASS, 16/16 zadań i runtime artifact;
- cztery celowane przebiegi E2E — PASS, każdy z cleanupem 0;
- `pnpm security:secrets` — PASS.

Przed promocją produkcyjną usunięto również zastany błąd infrastruktury:
natywne kontrole Lint/TypeCheck Vercela uruchamiały drugi, odseparowany install
i kończyły się przed wykonaniem skryptów. Lint oraz typecheck są teraz
blokującymi zależnościami `turbo run build`, więc przechodzą w tym samym,
działającym środowisku instalacji co artefakt produkcyjny.

`pnpm security:scan` zatrzymuje się na zastanym suppression ESLint w
`szablony/template-library.tsx`. Plik nie jest częścią M9.1; sekret scan oraz
wszystkie bramki zmienionego zakresu przechodzą.

## Rollback i następny etap

Rollback usuwa wariant segmentowy, nowe klasy kompozycji i wspólny pusty stan.
Nie cofa danych ani sekretów, ponieważ M9.1 nie zmienia ich kontraktów.
Następnym zamkniętym etapem jest M9.2 — Ustawienia.
