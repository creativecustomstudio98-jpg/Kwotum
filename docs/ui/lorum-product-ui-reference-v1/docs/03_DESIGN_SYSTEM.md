# 03 — Design system Lorum

**Status:** CANONICAL

## 1. Charakter

Spokojny, precyzyjny, techniczny, godny zaufania. Interfejs ma wyglądać jak narzędzie operacyjne B2B, nie jak kampania kryptowalutowa, dashboard giełdowy ani portfolio agencji.

## 2. Kolory

### Tła i powierzchnie

| Token | Wartość | Zastosowanie |
|---|---:|---|
| `--bg-page` | `#F7F6F2` | główne tło panelu |
| `--bg-subtle` | `#FAF9F6` | spokojne strefy, onboarding |
| `--surface` | `#FFFFFF` | panele, inputy, tabele |
| `--surface-muted` | `#F2F3EF` | tło drugorzędne, disabled |
| `--surface-selected` | `#EAF3EE` | wybrany wiersz/krok |

### Tekst

| Token | Wartość |
|---|---:|
| `--text-primary` | `#17201D` |
| `--text-secondary` | `#65706B` |
| `--text-muted` | `#87908C` |
| `--text-on-brand` | `#FFFFFF` |

### Marka i statusy

| Token | Wartość | Znaczenie |
|---|---:|---|
| `--brand-700` | `#07553B` | sidebar, primary button |
| `--brand-600` | `#0A6A46` | aktywne elementy |
| `--brand-100` | `#E8F3ED` | selected/success background |
| `--success-600` | `#24885B` | sukces |
| `--success-100` | `#E2F2E8` | sukces tło |
| `--warning-600` | `#A56A1C` | ostrzeżenie |
| `--warning-100` | `#FFF1D9` | ostrzeżenie tło |
| `--error-600` | `#C74E4E` | błąd/destructive |
| `--error-100` | `#FDEAEA` | błąd tło |
| `--info-600` | `#3C6E9E` | informacja |
| `--info-100` | `#EAF2FA` | informacja tło |

### Linie

| Token | Wartość |
|---|---:|
| `--border-default` | `#E3E1DA` |
| `--border-strong` | `#C9CDC8` |
| `--border-brand` | `#79AA94` |

Nie używaj koloru marki jako dekoracji na każdym elemencie. Zielony ma komunikować markę, aktywność, sukces lub działanie.

## 3. Typografia

Preferowana jedna rodzina: Inter, Geist lub zgodny grotesk dostępny w projekcie. Nie dodawaj drugiej rodziny bez uzasadnienia.

### Desktop panel

| Styl | Rozmiar / line-height | Waga |
|---|---|---|
| H1 aplikacji | 28–32 / 1.1 | 650–700 |
| H2 sekcji | 18–20 / 1.2 | 650 |
| H3 panelu | 15–17 / 1.25 | 650 |
| Body | 14–15 / 1.45 | 400–500 |
| Label | 12–13 / 1.35 | 600 |
| Helper | 11–12 / 1.4 | 400 |
| Table | 12–14 / 1.35 | 400–600 |

### Marketing/public widget

- nagłówki większe wyłącznie tam, gdzie pomagają czytelności,
- bez absurdalnych 80–110 px,
- liczby w tabelach i KPI używają `font-variant-numeric: tabular-nums`.

## 4. Spacing

Skala bazowa:

```text
2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64
```

- odstęp wewnętrzny kart panelowych: 16–24 px,
- gap siatki: 12–16 px w panelu,
- duże sekcje: 20–28 px,
- w tabelach: zwarte wiersze 44–54 px,
- mobile padding: 14–18 px.

Nie twórz lokalnych wartości `37px`, `53px`, `71px`, jeżeli nie wynikają z geometrii komponentu.

## 5. Radius

| Token | Wartość | Użycie |
|---|---:|---|
| `--radius-xs` | 4 px | badge, małe kontrolki |
| `--radius-sm` | 6 px | button, input |
| `--radius-md` | 8 px | karty i listy |
| `--radius-lg` | 10–12 px | główne panele |

Zakazane:

- 20–32 px na każdym panelu,
- pill button dla zwykłych działań,
- pełne koła jako tła dla każdej ikony.

## 6. Cienie

Panel domyślny:

```css
box-shadow: 0 1px 2px rgba(16, 24, 20, 0.03);
```

Panel podniesiony/dialog:

```css
box-shadow: 0 10px 28px rgba(16, 24, 20, 0.08);
```

Cień nie zastępuje obramowania i struktury. Większość ekranów powinna opierać się na subtelnych borderach.

## 7. Kontrolki

### Button

- wysokość: 36–40 px desktop, 42–46 px mobile,
- primary: ciemna zieleń,
- secondary: białe tło + border,
- ghost: bez tła, wyraźny hover,
- destructive: outline czerwony, pełny czerwony tylko przy finalnym potwierdzeniu,
- loading zachowuje szerokość,
- focus ring zawsze widoczny.

### Input/select

- wysokość 38–42 px desktop,
- label nad polem,
- helper/error pod polem,
- radius 6 px,
- border neutralny,
- focus border + ring marki,
- placeholder nie może zastępować labela.

### Badge/status

Badge jest informacją, nie dekoracją. Używaj tylko dla:

- statusu leada,
- statusu publikacji,
- stanu integracji,
- wyniku kwalifikacji,
- wersji/beta/demo.

### Table

- czytelne nagłówki,
- sticky header tylko przy długich tabelach,
- hover wiersza subtelny,
- zaznaczenie checkboxem,
- liczby wyrównane konsekwentnie,
- działania w ostatniej kolumnie,
- bez zamykania każdej komórki w osobnej kapsule.

## 8. Ikony

- styl liniowy,
- stroke około 1.5–1.8,
- 16–20 px,
- jedna biblioteka,
- bez mieszania filled/outlined,
- tekst widoczny przy głównych działaniach,
- tooltip dla ikon-only.

## 9. Motion

- UI response: 120–180 ms,
- drawer/dialog: 180–260 ms,
- easing spokojny,
- bez springów i odbijania,
- bez animowania każdej karty przy scrollu,
- `prefers-reduced-motion` obowiązkowe.

## 10. Wzorce zakazane

- gradients jako tło paneli,
- glass cards,
- glow,
- blobs,
- random sparkles,
- fake 3D,
- ogromne hero wewnątrz aplikacji,
- tile dashboard z 12 równymi kartami,
- domyślny shadcn bez dopasowania,
- „AI summary” jako jedyna widoczna informacja,
- sztuczne avatary i losowe zdjęcia stockowe w panelu.
