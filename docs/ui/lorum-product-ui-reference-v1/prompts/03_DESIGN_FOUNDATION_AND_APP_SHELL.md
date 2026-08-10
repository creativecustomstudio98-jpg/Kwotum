# PROMPT 03 — DESIGN FOUNDATION I APP SHELL


> **V6 IMAGE-LOCKED — obowiązuje nadrzędnie**
>
> Przed wykonaniem tego etapu przeczytaj `CODEX_MASTER_PROMPT.md`, sprawdź obrazy załączone do bieżącej wiadomości oraz właściwe cropy z `docs/ui/references/derived/`. Obrazy są specyfikacją, nie inspiracją. Nie upraszczaj kompozycji, gęstości, inner UI ani mobile. Ten etap działa według zasady: `1 prompt = 1 mały etap = 1 branch = 1 końcowy commit`. Wymagane: reference → before → after-v1 → overlay → poprawki → after-v2 → overlay → layout/a11y/tests/build → raport → STOP.

## Cel

Zbudować wspólny fundament wizualny, z którego skorzystają wszystkie kolejne moduły. Nie przebudowuj jeszcze treści dashboardu, listy leadów ani buildera poza koniecznym podłączeniem shellu.

## Referencje

- `docs/03_DESIGN_SYSTEM.md`,
- `docs/04_RESPONSIVE_RULES.md`,
- `reference/accepted-style-board.png`,
- `reference/screenshots/dashboard-desktop.png`,
- `reference/screenshots/dashboard-mobile.png`,
- `reference/screenshots/builder-desktop.png`.

## Pass Product/UX

- potwierdź główną nawigację i role,
- określ, które pozycje są warunkowe,
- zachowaj aktualne uprawnienia i routing,
- przygotuj mapę desktop/tablet/mobile shell.

## Pass Design System

Zdefiniuj centralne tokeny:

- colors,
- typography,
- spacing,
- radius,
- shadow,
- z-index,
- motion,
- status,
- density,
- focus.

Zbuduj lub dostosuj:

- Button,
- IconButton,
- Input,
- Textarea,
- Select,
- Checkbox,
- Switch,
- Badge/StatusBadge,
- Tabs,
- Table primitives,
- Panel,
- Drawer,
- Dialog,
- Tooltip,
- Skeleton,
- EmptyState,
- InlineAlert,
- AppSidebar,
- AppTopbar,
- MobileHeader,
- MobileBottomNav.

Nie twórz jednego „Card” do wszystkiego. Rozróżnij panel danych, listę, metric, alert i formularz semantycznie.

## Pass Frontend

- wykorzystaj istniejący stack i sposób stylowania,
- usuń lokalne duplikaty dopiero po migracji użytkowników komponentów,
- nie zmieniaj logiki ekranów,
- nie instaluj nowej biblioteki UI,
- zachowaj SSR/client boundaries,
- zapewnij stabilny layout bez CLS.

## Pass Accessibility

- skip link,
- landmarki,
- focus ring,
- poprawna kolejność tab,
- tooltipy ikon-only,
- drawer/dialog focus trap,
- 44 px dla kluczowych mobile actions,
- reduced motion.

## Pass QA

Przygotuj stronę testową/Storybook lub istniejący katalog komponentów pokazujący wszystkie stany:

- default,
- hover,
- focus,
- active,
- disabled,
- loading,
- error,
- selected.

## Kryteria wizualne

- sidebar około 208–224 px,
- topbar 72–80 px,
- warm off-white page,
- białe powierzchnie,
- border `#E3E1DA` lub token odpowiednik,
- radius 4/6/8/10–12,
- subtelny cień,
- jedna rodzina fontu,
- brak dekoracyjnych gradientów,
- brak dużych pustych kart.

## Screenshoty odbiorowe

- shell desktop 1536×1024,
- shell desktop 1280×800,
- shell tablet 768×1024,
- shell mobile 390×844,
- component states.

## Gate

- shell jest spójny na istniejących trasach,
- nie ma regresji logiki,
- komponenty dostępne klawiaturą,
- lint/typecheck/test/build przechodzą,
- visual review wykonany,
- dokumentacja design systemu zaktualizowana.

Zatrzymaj się. Nie przechodź do dashboardu.
