# PROMPT 11 — INTEGRACJE I WEBHOOKI


> **V6 IMAGE-LOCKED — obowiązuje nadrzędnie**
>
> Przed wykonaniem tego etapu przeczytaj `CODEX_MASTER_PROMPT.md`, sprawdź obrazy załączone do bieżącej wiadomości oraz właściwe cropy z `docs/ui/references/derived/`. Obrazy są specyfikacją, nie inspiracją. Nie upraszczaj kompozycji, gęstości, inner UI ani mobile. Ten etap działa według zasady: `1 prompt = 1 mały etap = 1 branch = 1 końcowy commit`. Wymagane: reference → before → after-v1 → overlay → poprawki → after-v2 → overlay → layout/a11y/tests/build → raport → STOP.

## Cel

Stworzyć operacyjny moduł połączeń, w którym użytkownik rozumie stan integracji, dostawę danych i sposób naprawy błędu.

## Referencje

- `reference/screenshots/integrations-desktop.png`,
- `reference/boards/board-04-system-onboarding.png`.

## Lista połączeń

Dla każdej integracji:

- nazwa,
- opis celu,
- status,
- konto/workspace,
- ostatnia synchronizacja,
- ustawienia,
- odłącz.

Nie używaj kolorowych marketplace tiles jako głównej formy ekranu operacyjnego.

## Konfiguracja webhooka

- endpoint,
- eventy,
- secret maskowany,
- regenerate z potwierdzeniem,
- signing method,
- timeout/retry policy,
- test delivery,
- aktywny/paused.

## Delivery log

- event,
- cel,
- status,
- HTTP code,
- czas,
- liczba prób,
- detail,
- retry dla bezpiecznych przypadków.

Detail ma pokazać headers/payload po bezpiecznym zamaskowaniu PII i sekretów.

## Bezpieczeństwo

- HMAC,
- timestamp,
- replay protection,
- idempotency,
- secret rotation,
- tenant scope,
- brak pełnego PII w logach.

## Stany

- connected,
- action required,
- expired,
- paused,
- provider unavailable,
- invalid scope,
- delivery failed,
- retry scheduled.

## QA

- OAuth cancelled,
- insufficient scope,
- 4xx/5xx,
- timeout,
- replay,
- invalid signature,
- retry idempotency,
- mobile/tablet,
- role without integration permission.

## Gate

- integracje są funkcjonalne albo jasno oznaczone jako niedostępne,
- żadna karta nie jest atrapą,
- log dostaw jest czytelny,
- security tests przechodzą,
- zatrzymaj się.
