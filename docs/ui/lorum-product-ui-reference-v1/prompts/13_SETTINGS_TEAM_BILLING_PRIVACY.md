# PROMPT 13 — USTAWIENIA, ZESPÓŁ, BILLING I PRYWATNOŚĆ


> **V6 IMAGE-LOCKED — obowiązuje nadrzędnie**
>
> Przed wykonaniem tego etapu przeczytaj `CODEX_MASTER_PROMPT.md`, sprawdź obrazy załączone do bieżącej wiadomości oraz właściwe cropy z `docs/ui/references/derived/`. Obrazy są specyfikacją, nie inspiracją. Nie upraszczaj kompozycji, gęstości, inner UI ani mobile. Ten etap działa według zasady: `1 prompt = 1 mały etap = 1 branch = 1 końcowy commit`. Wymagane: reference → before → after-v1 → overlay → poprawki → after-v2 → overlay → layout/a11y/tests/build → raport → STOP.

## Cel

Utworzyć uporządkowany system ustawień, w którym każda kategoria ma jasny zakres i nie miesza operacji niskiego ryzyka z destructive actions.

## Referencje

- `reference/screenshots/settings-desktop.png`,
- `reference/boards/board-04-system-onboarding.png`,
- `docs/01_PRODUCT_UI_ARCHITECTURE.md`.

## Lokalna nawigacja

1. Organizacja
2. Branding widgetu
3. Domeny
4. Powiadomienia
5. Szablony e-mail
6. Zespół i role
7. Dane i prywatność
8. API i klucze
9. Plan i rozliczenia
10. Danger zone

Na mobile pokaż listę kategorii, a następnie osobny ekran formularza.

## Organizacja

- nazwa,
- NIP opcjonalnie,
- strona,
- strefa czasowa,
- adres,
- obszar działania,
- właściciel.

## Branding

- logo,
- kolor podstawowy z kontrolą kontrastu,
- font tylko z bezpiecznej listy lub systemowy,
- preview widgetu,
- reset.

## Powiadomienia i e-mail

- odbiorcy,
- typy zdarzeń,
- kanały,
- templates HTML/text,
- test send,
- status dostawy,
- branding organizacji.

## Zespół i role

- członkowie,
- role Owner/Admin/Editor/Sales/Viewer zgodne z domeną,
- zaproszenia,
- revoke,
- transfer ownership z mocnym potwierdzeniem,
- brak możliwości odebrania ostatniego Ownera.

## Prywatność

- retencja,
- consent versions,
- export,
- delete/anonymize lead,
- organization deletion grace period,
- DPA/policy links,
- brak porad prawnych przedstawionych jako fakt.

## API keys

- nazwa,
- scope,
- created/last used,
- secret widoczny tylko raz,
- revoke,
- rotation,
- audit log.

## Billing/usage

- plan,
- usage,
- limity,
- okres,
- invoices/payment tylko jeśli realnie wdrożone,
- upgrade CTA nie może być atrapą,
- done-for-you jako oddzielna usługa.

## Danger zone

- eksport danych,
- usunięcie organizacji,
- opis wpływu,
- typed confirmation,
- wymagane uprawnienie,
- audit.

## QA

- role i permissions,
- ostatni Owner,
- invalid domain,
- kontrast brand color,
- API key reveal once,
- delete/export,
- mobile forms,
- unsaved changes.

## Gate

- formularze działają i walidują server-side,
- role są respektowane,
- destructive actions bezpieczne,
- UI spójny z referencją,
- zatrzymaj się.
