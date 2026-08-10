# Landing Lorum — transparentny telefon produktowy w hero

Data: 2026-07-29  
Etap: 12ZB-U  
Trasa: `/`  
Zakres: wyłącznie hero

## Kierunek

Hero używa fizycznego telefonu zamiast sceny złożonej z płaskich paneli.
Na desktopie telefon pokazuje demonstracyjny ekran procesu, a poza jego
powierzchnię wychodzą elementy wyniku i leada. Na mobile jest tylko telefon,
bez dodatkowych kart, ucięty prawą krawędzią mniej więcej w połowie.

Ostatnia korekta usuwa prostokątne tło renderu i przywraca rozpoznawalny pasek
sześciu ikon. Okręgi prowadzące i pole punktów są jedynie subtelnym tłem.
Pozostałych sekcji landingu ten etap nie przebudowuje.

## Produkcyjne assety

| Plik                                           | Rozmiar     | Kanał alfa | SHA-256                                                            |
| ---------------------------------------------- | ----------- | ---------- | ------------------------------------------------------------------ |
| `lorum-hero-phone-desktop-transparent-v4.webp` | 1536 × 1024 | tak        | `1781845b7dcebedb086200d409e0807c368706a45bdf2a0794b782c7e9a7c0eb` |
| `lorum-hero-phone-mobile-transparent-v4.webp`  | 864 × 1821  | tak        | `bef2d7c2f74702d0bc47cf146c4a922fc4ba75dccc53d4db951c44a38c490537` |

Katalog: `apps/web/public/images/redesign/`.

## Pasek informacji

Pod kompozycją wrócił jeden wspólny region z sześcioma ikonami:

1. zakres projektu;
2. budżet;
3. termin;
4. lokalizacja;
5. materiały;
6. następny krok.

Ikony są wektorowe, dekoracyjne SVG z tekstową nazwą i opisem. Lista ma
dostępną nazwę i zachowuje kolejność w każdym breakpointcie.

## Responsive

- desktop: transparentny render bez prostokątnej krawędzi, delikatny cień,
  okrąg prowadzący i pole punktów;
- tablet: hero przechodzi do jednego ciągu, a pasek ikon ma trzy kolumny;
- mobile: render desktopowy jest ukryty, osobny asset pokazuje tylko telefon,
  około połowy poza prawą krawędzią; pasek ikon ma dwie kolumny;
- forced colors: dekoracyjne tła są ukrywane, semantyczna lista i treść
  pozostają dostępne.

## Weryfikacja

- `pnpm --filter @wyceno/web lint` — PASS;
- `pnpm --filter @wyceno/web typecheck` — PASS;
- `pnpm --filter @wyceno/web test` — 24 pliki, 85/85 PASS;
- `pnpm exec playwright test tests/e2e/marketing.spec.ts --list` —
  21 scenariuszy poprawnie odkrytych;
- oba assety — WebP `srgba`, `opaque=False`;
- `pnpm --filter @wyceno/web build` — PASS, 39 tras, widget 17 269 B gzip.

Końcowy visual QA po ostatniej korekcie pozostaje do akceptacji. Starsze
screenshoty hero nie są dowodem bieżącego wariantu i nie mogą być używane
jako jego zaakceptowana referencja.

## Kryteria odbioru

- brak prostokątnego tła obrazu;
- jeden fizyczny telefon na desktopie, z elementami UI wychodzącymi z ekranu;
- na mobile wyłącznie telefon, celowo ucięty prawą krawędzią;
- sześć ikon pod hero;
- delikatne detale tła bez dodatkowych kart i bez kolizji z copy;
- brak zmian funkcjonalnych poza prezentacją hero.
