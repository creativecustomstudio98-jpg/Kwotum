# Design system

Kierunek premium minimalistycznego redesignu został wdrożony w Etapie 12A.
Etap 12B rozwinął go jako system marki Lorum zgodnie z ADR-024 i audytem
zarchiwizowanym w
`docs/_archive/2026-07-28-pre-lorum-ui-v6/LORUM_PRESENTATION_REDESIGN.md`.
Etap 12C porządkuje semantyczny kontrakt tokenów i wspólne prymitywy marketingu
oraz panelu, bez zmiany architektury ani kontraktów integracyjnych. Etap 12D,
zgodnie z ADR-025, zastępuje odrzucony szablon kompozycyjny referencyjnym
systemem pięciu redakcyjnych rozdziałów,
czytelnych dokumentów i liniowych stanów. Etap 12E, zgodnie z ADR-026,
doprecyzowuje wyłącznie stronę główną jako jeden gęsty widok produktu z
hairline-stripem i porównaniem, bez zmiany współdzielonych tokenów.

## Kierunek

Spokojny, precyzyjny i lekko techniczny. Motyw: nieuporządkowane zapytanie przechodzi przez selekcję i grupowanie do gotowego briefu. Light theme w MVP.

Typografia, proporcja i whitespace budują markę przed kolorem. Jedna
powierzchnia ma jeden punkt ciężkości. Równe siatki kart, seryjne kickery,
ozdobne badge’e i miniaturowe dashboardy nie są neutralnym defaultem.

## Tokeny zatwierdzone dla Lorum

| Rola           | Wartość   | Użycie                                                       |
| -------------- | --------- | ------------------------------------------------------------ |
| background     | `#F7F6F1` | ciepłe tło stron                                             |
| surface        | `#FFFFFF` | formularz, dokument, tabela                                  |
| surface-muted  | `#EFF0EB` | nagłówek tabeli, neutralny stan, disabled                    |
| text-primary   | `#1A211E` | nagłówki i dane podstawowe                                   |
| text-secondary | `#46504B` | body copy i opisy                                            |
| text-muted     | `#626B66` | metadata i informacje trzeciego poziomu                      |
| border         | `#C9D0CB` | hairlines i podział treści                                   |
| border-strong  | `#69726D` | granice interaktywnych kontrolek                             |
| brand          | `#143D2F` | główne CTA, aktywny stan i rail                              |
| brand-hover    | `#0F3025` | hover głównego CTA                                           |
| brand-soft     | `#DCE9E1` | zaznaczenie i nowy element procesu                           |
| success        | `#2F6A4F` | potwierdzony sukces lub zakończony stan                      |
| success-soft   | `#E3F0E8` | powierzchnia statusu sukcesu                                 |
| danger         | `#8A2F35` | błąd, destrukcyjna akcja i spam                              |
| danger-soft    | `#FCE8E9` | powierzchnia błędu                                           |
| shadow-sm      | 4%        | mała, faktycznie uniesiona kontrolka lub karta               |
| shadow-md      | 6%        | dialog i główny dokument; nie do dekoracyjnych sekcji strony |

Jasna zieleń nie służy do tekstu na bieli. Jest wyróżnikiem, zaznaczeniem i
powierzchnią z tekstem `brand`. `Success` jest osobną rolą semantyczną i nie
zastępuje koloru marki. Główne CTA używa `brand` z białym tekstem. Pary tekstów,
CTA, komunikatów i mocnej granicy kontrolek mają automatyczny test WCAG.
Zieleń nie oznacza wyniku finansowego ani „eko”. Lokalne kolory są zabronione.

W CSS używamy nazw `--wy-color-*`; prefiks jest stabilnym identyfikatorem
technicznym, nie nazwą widoczną produktu. Dawne `text`, `accent` i `error`
pozostają wyłącznie aliasami kompatybilności. Nowy kod używa ról semantycznych.

## Skale

- spacing: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128 px;
- type: 12, 14, 16, 18, 20, 24, 32, 40, 52, 64 px;
- wagi: wyłącznie 400, 500, 600 i 700; bez arbitralnych 650/680/750/850;
- radius: `sm` 4 px, `md` 8 px, `lg` 12 px; pigułka wyłącznie dla statusu;
- motion: 120 ms reakcje, 180 ms standard, 240 ms panele, bez dekoracyjnych springów;
- body minimum 16 px, line-height 1.55–1.68 i tabular numerals w danych;
- główne cele dotykowe 40–44 px, minimum WCAG 24×24 CSS px.

Rodzina fontu pozostaje systemowym nowoczesnym groteskiem
`ui-sans-serif / SF / Segoe UI`. Nie pobieramy fontu tylko dla podobieństwa do
referencji Inter/Geist; stabilność, czytelność i brak dodatkowego requestu mają
pierwszeństwo.

## Komponenty etapami

Etap 2: Button, IconButton, LinkButton, Input, Textarea, Select, Checkbox, Radio, FormField, FieldError, Badge/StatusBadge, Dialog/Drawer, Tabs, Table, Empty/Error/Skeleton, Toast/Alert, Stepper, Breadcrumb, Sidebar, AppHeader. Bardziej złożone Combobox, Slider, DatePicker, FileUpload, CommandMenu, ChartContainer i FilterBar powstają wraz z realnym użyciem.

Każdy komponent ma stany hover/focus/active/disabled/loading/error, dokumentację, test klawiatury i kontrastu.

## Implementacja

Źródłem tokenów i komponentów jest `packages/ui`. Showcase `/design-system`
jest celowo wyłączony z indeksowania i zawiera wyłącznie syntetyczny tryb
demonstracyjny. Kontrakty komponentów i procedura zmiany baseline znajdują się
w `packages/ui/README.md`.

Wspólne utilities są celowo małe: `wy-display`, `wy-heading-*`, `wy-body*`,
`wy-label`, `wy-description`, `wy-kicker`, `wy-card`, `wy-data-surface` i
`wy-icon`. Marketing i panel współdzielą `wy-kicker`, powierzchnie danych,
badge, formularze oraz skale, lecz zachowują własne kompozycje stron. Nie
tworzymy generycznego komponentu dla każdej sekcji.

Marketing i panel korzystają z linii, typografii oraz whitespace zamiast
lokalnych tokenów i powtarzalnych kart. Dekoracyjne gradienty, blur, świecenie i
duże cienie są zakazane. Widget korzysta z tej samej palety, małych promieni i
hierarchii pytanie–odpowiedzi–następny krok.

Karta nie otrzymuje automatycznego cienia. Pigułka oznacza rzeczywisty status.
Empty/error/permission są liniowymi powierzchniami z tekstową etykietą, nie
kaflem z dekoracyjnym symbolem. Sidebar używa typograficznego wordmarku i
wąskiej linii aktywnego stanu. Tekst w code-native proof ma minimum 12 px.
