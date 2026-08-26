# PX5 — raport implementacji context/prefill

**Data:** 2026-08-25  
**Stan:** ukończony lokalnie, bez deployu

## Wynik

PX5 dostarcza zamknięty przepływ host → sesja → lead. Firma konfiguruje do
ośmiu pól bezpośrednio w kreatorze. Host może przekazać wyłącznie opublikowane,
krótkie wartości produktu; serwer tworzy własny snapshot i nie ufa
JavaScriptowi strony. Pola `confirm` są pokazywane przed pytaniami, a zapis
odpowiedzi pozostaje zablokowany do jednorazowego potwierdzenia.

Kontekst jest widoczny na leadzie w osobnej sekcji wraz ze źródłem. Nie jest
odpowiedzią klienta, parametrem estymacji ani polem analytics. WordPress obsługuje
opcjonalny JSON, a istniejące shortcode’y i hosted flow bez kontekstu działają
bez zmian.

## Najważniejsze decyzje

- `Origin` jest kontrolą dostępu do osadzenia, nie dowodem prawdziwości danych.
- Nie powstało ogólne `metadata`; `contextSchema` ma własną wersję i allowlistę.
- `informational` jest tylko do odczytu, `confirm` wymaga jawnego potwierdzenia,
  a `system` pochodzi wyłącznie z immutable flow version.
- Host nie może przekazać ceny, score, routingu, tenanta, zgody ani pola
  systemowego. PII-like wartości i URL są odrzucane fail-closed.
- Potwierdzenie jest idempotentne dla tego samego `mutationId`, jednorazowe i
  niedostępne po pierwszej odpowiedzi lub wygaśnięciu sesji.

Pełny kontrakt i rollback opisuje `PX5_CONTEXT_PREFILL_CONTRACT.md`, a decyzję
architektoniczną ADR-047 w `../DECISIONS.md`.

## Zakres plików

- kontrakty: `packages/validation/src/flow.ts`, `widget.ts`;
- runtime: `packages/widget/src/api.ts`, `controller.ts`, `element.ts`;
- UI: `packages/ui/src/widget.css`, kreator kontekstu i szczegół leada;
- API: tworzenie sesji oraz `sessions/current/context`;
- dane: migracja `20260825000400_stage12zq_px5_context.sql`;
- integracje: `apps/wordpress-plugin`;
- testy bazy: `supabase/tests/flow_context.sql`;
- visual QA: `artifacts/visual-qa/px5-context/`.

## Gate

| Kontrola          | Wynik                                                                   |
| ----------------- | ----------------------------------------------------------------------- |
| lint              | 8/8 pakietów                                                            |
| typecheck         | 8/8 pakietów                                                            |
| unit              | 274/274                                                                 |
| PostgreSQL / RLS  | pełny zestaw zielony, w tym negatywne testy PX5                         |
| WordPress         | WP 6.9.2 i 7.0.2 / PHP 8.5.2                                            |
| security scan     | statyczny i secrets scan zielone                                        |
| build             | 16/16, 42 wygenerowane strony, widget 27 072 B gzip / 92 160 B          |
| E2E widget        | 8/8 Chromium; klawiatura, offline, Turnstile, popup, visual modes i PX5 |
| a11y / responsive | axe 0 naruszeń; PX5 1440 i 390 bez poziomego overflow                   |

Zdalny dependency audit nie był ponawiany: etap jest lokalny, nie dodaje
zależności, a dostęp sieciowy pozostaje poza udzielonym zakresem. Lokalny SAST
i skan sekretów przeszły.

## Visual QA

Nowa powierzchnia jest celowo dokumentowa i płaska: jedna oś, cienkie linie,
natywne pole wyboru, jawna wartość tylko do odczytu i jedna akcja. Nie ma kart,
cieni, gradientów, zdjęć ani dekoracyjnych ilustracji. Kadry 1440 i 390 zostały
sprawdzone po wygenerowaniu; mobile zachowuje pełną szerokość akcji i czytelną
hierarchię.

## Ryzyka i rollback

Hosted link nie przyjmuje wartości w query stringu. Proces z wymaganym polem
hosta powinien działać jako embed; zwykłe procesy zachowują pełną zgodność.
Integracja może wyłączyć wysyłanie contextu bez zmiany istniejących procesów.
Po pojawieniu się danych nie usuwamy kolumn snapshotu; korekta kontraktu wymaga
nowej wersji schema i migracji naprawczej.

## Kryteria odbioru

- model i `product_id` przechodzą bez ponownego pytania;
- użytkownik potwierdza edytowalną wartość przed pierwszą odpowiedzią;
- nieznany klucz, zły typ, PII, replay i wygasła sesja są odrzucane;
- pole systemowe nie trafia do publicznej projekcji, ale pozostaje w audytowym
  snapshotcie leada;
- kontekst nie zmienia ceny, score, routingu ani zgód;
- WordPress bez kontekstu działa jak dotychczas.

## Następny etap

PX6: wersjonowany kontakt, outcome i minimalny branding widżetu. Etap nie został
rozpoczęty w tej sesji.
