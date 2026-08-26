# PX6 — raport implementacji zakończenia, kontaktu i brandingu

**Data:** 2026-08-25  
**Stan:** ukończony lokalnie, bez deployu

## Wynik

PX6 domyka główną ścieżkę widżetu. Opublikowana wersja procesu określa, czy
klient widzi najpierw orientacyjny wynik, czy formularz kontaktowy, które pola
są widoczne i wymagane oraz czy zakończenie tworzy lead. Pełny wynik nadal
pochodzi wyłącznie z serwera. Historyczne wersje zachowują przebieg wynik →
kontakt.

Firma otrzymuje minimalny branding: odrębną nazwę publiczną, jeden kolor akcentu
z automatycznie dobranym kontrastem i opcjonalne własne logo WebP. Nie powstał
theme builder, custom CSS ani możliwość wstawienia zewnętrznego obrazu.

## Najważniejsze decyzje

- `leadCapture` v3 ma pięć zamkniętych pól i dwa warianty kolejności;
- e-mail jest wymaganym kanałem dostawy w v3, a telefon może być drugim kanałem;
- kanał i pora kontaktu są enumami, nie swobodnym tekstem;
- `result` v2 ma kontrolowane `capture_lead` albo `no_lead`;
- `no_lead` nie może być schowany za formularzem kontaktowym;
- publiczna odpowiedź nie zawiera score, kategorii ani trace reguł;
- branding organizacji jest bieżący, a logika zakończenia pozostaje immutable;
- błędny lub niepełny branding uruchamia bezpieczny fallback.

Kontrakt i rollback opisuje `PX6_COMPLETION_AND_BRANDING_CONTRACT.md`, a decyzję
architektoniczną ADR-048 w `../DECISIONS.md`.

## Zakres plików

- kontrakty: `packages/validation/src/flow.ts`, `lead.ts`, `widget.ts`;
- runtime: `packages/widget/src/api.ts`, `controller.ts`, `element.ts`;
- UI: `packages/ui/src/widget.css`, ustawienia brandingu i szczegół leada;
- dane: `20260825000500_stage12zr_px6_completion_branding.sql`;
- integracje: e-mail HTML/text, webhook `2026-08-25`, eksport danych v2;
- testy bazy: `supabase/tests/completion_branding.sql`;
- visual QA: `artifacts/visual-qa/px6-completion-branding/`.

## Gate

| Kontrola         | Wynik                                                         |
| ---------------- | ------------------------------------------------------------- |
| lint             | 8/8 pakietów                                                  |
| typecheck        | 8/8 pakietów                                                  |
| unit             | 278/278                                                       |
| PostgreSQL / RLS | pełny zestaw zielony, w tym negatywne przypadki PX6           |
| WordPress        | WP 6.9.2 i 7.0.2 / PHP 8.5.2                                  |
| build            | 16/16; widget 28 996 B gzip przy budżecie 92 160 B            |
| format           | pełny check zielony                                           |
| E2E widget       | 8/8 Chromium; offline, a11y, popup, Turnstile i tryby PX3–PX6 |
| visual QA        | 3/3 stany: poprawny branding, błędny manifest, brak brandingu |

## Visual QA

Sprawdzono desktop 1440 × 1000 na produkcyjnym rendererze widżetu. Wariant
poprawny używa nazwy „Studio Forma”, własnego akcentu i tekstowego znaku zamiast
fotografii. Wariant z błędną konfiguracją oraz wariant bez brandingu przechodzą
do stałego, czytelnego fallbacku. Nie wykorzystano starych zdjęć, stocków,
gradientów, dekoracyjnych ilustracji ani kart imitujących typowy dashboard.

Artefakty:

- `01-valid-branding-1440x1000.png`;
- `02-invalid-branding-fallback-1440x1000.png`;
- `03-no-branding-1440x1000.png`.

## Bezpieczeństwo i prywatność

Tenant scope jest sprawdzany przy zapisie brandingu i wyborze logo. Resolver nie
ujawnia ścieżki Storage. Submit odrzuca brak wymaganych pól, sprzeczny kanał i
outcome bez leada. Preferencje podlegają tej samej retencji, legal hold i
usunięciu co lead; nie są dopisywane do analytics ani custom events.

## Ryzyka i świadome granice

Outcome v2 jest jedną deklaratywną decyzją całej opublikowanej wersji. PX6 nie
dodaje osobnego edytora wielu outcome zależnych od odpowiedzi; taki mechanizm
wymagałby osobnego modelu reguł, testów konfliktów i ADR. Branding logo korzysta
z tenantowego rejestru assetów, ale żaden historyczny obraz nie został wybrany
automatycznie. Wdrożenie nadal wymaga migracji przez staging i procedury
rollbacku; ten etap nie daje zgody na produkcję.

## Kryteria odbioru

- oba warianty kolejności prowadzą do wyniku potwierdzonego przez serwer;
- ukryte pola nie są renderowane, a wymagane są egzekwowane również w bazie;
- `no_lead` nie tworzy leada i nie pokazuje formularza;
- preferencje są spójne w panelu, e-mailu, webhooku i eksporcie;
- zły kolor, CSS-like string, obcy asset i zewnętrzny URL są odrzucane;
- brak brandingu nie pogarsza czytelności ani kompletności procesu;
- stare snapshoty zachowują dotychczasową semantykę.

## Następny etap

PX7: kontrolowany pilot Fortez i reprezentatywnej firmy usługowej. Etap nie
został rozpoczęty; wymaga osobnego polecenia i kończy się decyzją
GO/ITERATE/NO-GO.
