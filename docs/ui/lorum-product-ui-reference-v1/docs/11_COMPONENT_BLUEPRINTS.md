# 11 — Blueprinty komponentów

**Status:** CANONICAL

## AppSidebar

Anatomia:

1. brand lockup,
2. primary navigation,
3. spacer,
4. settings/help,
5. profile switcher.

Wymiary orientacyjne desktop:

- width 208–224 px,
- nav row 40–44 px,
- icon 18 px,
- horizontal padding 14–18 px.

Zakazy:

- gradient,
- floating sidebar,
- 16 px radius całej nawigacji,
- kilka różnych kolorów aktywnych pozycji.

## AppTopbar

Anatomia:

- eyebrow/context,
- H1 + status,
- actions,
- notifications,
- avatar.

Jedno primary CTA. Długie akcje przechodzą do menu przy mniejszej szerokości.

## AttentionItem

- semantyczny status dot,
- tytuł,
- helper,
- action link.

Nie jest dużą kartą marketingową. Wysokość zwarta, bez ilustracji.

## Metric

- label,
- value tabular,
- delta,
- helper/period.

Delta ma znak, tekst i kolor. Nie używaj wykresu sparkline bez danych.

## DataTable

- caption/tool row,
- header,
- rows,
- pagination,
- selection state,
- loading skeleton,
- empty filtered state.

Akcje w ostatniej kolumnie. Status badge, ale budżet i termin pozostają zwykłym tekstem.

## MobileLeadItem

- identity/service,
- score,
- status,
- compact meta,
- phone/e-mail/detail actions.

Jedna karta 100% szerokości. Brak 4 wewnętrznych mini-kart.

## LeadSummaryRow

```text
[icon 16] [label fixed] [value flexible]
```

Wartość zawija się. Na mobile label może być węższy, ale nie znika.

## BuilderStep

- drag/reorder control,
- index,
- title,
- meta,
- warning/condition,
- menu.

Selected używa `surface-selected`, nie ciężkiego cienia.

## PreviewFrame

- rzeczywisty renderer,
- header brand,
- progress,
- question,
- options,
- back/next,
- status footer.

Nie mockuj innym markupem niż publiczny widget.

## Inspector

- context tabs,
- grouped form sections,
- sticky header opcjonalnie,
- validation/status,
- brak głównego Save, jeśli autosave jest canonical.

## RuleCard

- index/name/status,
- IF row,
- THEN row(s),
- validation,
- duplicate/delete.

Reguła jest czytelnym zdaniem, nie node diagramem.

## TemplateTile

- branch/name,
- short scope,
- counts,
- status,
- preview/use actions.

Tło graficzne jest drugorzędne i nie może pogarszać kontrastu.

## InstallationMethod

- name,
- use case,
- selected state,
- krótki opis.

Po wyborze pokazuj konkretną instrukcję. Nie twórz czterech identycznych hero cards.

## IntegrationRow

- provider,
- purpose/account,
- status,
- last sync,
- settings/connect action.

## SettingsFormSection

- title + helper,
- logically grouped fields,
- save state,
- inline validation,
- destructive actions w osobnej strefie.

## PublicWidgetOption

- 44–52 px minimum,
- pełna etykieta,
- selected border + subtle background,
- icon/check tylko jako wsparcie,
- cały wiersz klikalny.
