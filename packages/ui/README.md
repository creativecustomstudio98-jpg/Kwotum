# @wyceno/ui

Centralna biblioteka dostępnych komponentów i tokenów Kwotum. Komponenty nie
zawierają logiki domenowej, danych tenantów ani zależności od auth.

## Użycie

```tsx
import { Button, FormField, Input } from "@wyceno/ui";
import "@wyceno/ui/styles.css";

<FormField label="Nazwa procesu">
  <Input />
</FormField>;
```

Kolorów, spacingu, promieni i czasów animacji nie definiujemy lokalnie. Nowy
token wymaga zmiany `src/tokens.ts`, odpowiadającej zmiennej w `src/styles.css`,
testu kontrastu, visual review i ADR, jeśli zmienia kierunek wizualny.

Nowy kod używa semantycznych ról `textPrimary`, `textSecondary`, `textMuted`,
`brand`, `brandSoft`, `success` i `danger`. Aliasów `text`, `accent` i `error`
nie używamy poza utrzymaniem istniejącego kontraktu. Dostępne utilities
typograficzne i powierzchniowe to `wy-display`, `wy-heading-*`, `wy-body*`,
`wy-label`, `wy-description`, `wy-kicker`, `wy-card`, `wy-data-surface` oraz
`wy-icon`.

## Kontrakty komponentów

| Grupa     | Komponenty                                                          | Wymagania użycia                                                                              |
| --------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Akcje     | `Button`, `IconButton`, `LinkButton`                                | tekst opisuje działanie; `IconButton` zawsze wymaga `label`; loading blokuje ponowne wysłanie |
| Pola      | `Input`, `Textarea`, `Select`, `FormField`, `FieldError`            | używać przez `FormField`; hint i error są łączone przez `aria-describedby`                    |
| Wybory    | `Checkbox`, `Radio`, `Fieldset`                                     | grupa radio ma legendę; opis nie zastępuje etykiety                                           |
| Status    | `Badge`, `StatusBadge`, `Alert`, `Toast`                            | status zawiera tekst, nie tylko kolor; błędy używają `role="alert"`                           |
| Warstwy   | `Dialog`, `Drawer`                                                  | sterowane stanem; natywny modal zapewnia trap i powrót fokusu; Escape zawsze zamyka           |
| Nawigacja | `Tabs`, `Stepper`, `Breadcrumb`, `Sidebar`, `AppHeader`, `AppShell` | tabs obsługuje strzałki/Home/End; aktywny element ma właściwe `aria-current`                  |
| Dane      | `Table`                                                             | caption jest obowiązkowy; poziomy scroll jest fokusowalny                                     |
| Stany     | `Skeleton`, `EmptyState`, `ErrorState`                              | loading nie udaje danych; empty/error wyjaśnia sytuację i następny krok                       |

## Testowanie

- `pnpm --filter @wyceno/ui test` — zachowanie i kontrasty;
- `pnpm e2e` — axe WCAG A/AA, klawiatura, reduced motion i visual regression;
- `/design-system` — wewnętrzny, `noindex` showcase na desktop i mobile.

Baseline zmieniaj wyłącznie po świadomym visual review przez
`pnpm e2e:update`. Automatyczne axe nie zastępuje ręcznego VoiceOver/NVDA,
zoomu 200/400% ani high contrast przed produkcyjnym release.
