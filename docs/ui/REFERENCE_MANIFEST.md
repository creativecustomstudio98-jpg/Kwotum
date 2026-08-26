# Manifest aktywnych referencji UI Kwotum

**Status:** kanoniczny  
**Ostatnia aktualizacja:** 2026-08-26

Ten plik zawiera wyłącznie referencje, które nadal sterują przyszłą pracą.
Historyczne obrazy panelu i ich pakiety źródłowe zostały usunięte po decyzji
ADR-049. Historia śledzonych plików pozostaje w Git, a pozostałe materiały w
tymczasowej kopii M0; żadna z tych kopii nie może przywracać poprzedniego
kierunku bez nowej decyzji.

## Hierarchia

1. bezpieczeństwo, prywatność, zakres produktu i zaakceptowane ADR-y;
2. najnowszy obraz zaakceptowany dla konkretnego regionu;
3. specyfikacja liczbowa powiązana z obrazem;
4. aktywne referencje wymienione poniżej;
5. prototypy i rendery pomocnicze wyłącznie jako źródło pomiaru.

Referencja wizualna nie dodaje funkcji, danych, ról ani uprawnień. Nazwy,
liczby i osoby na obrazie są przykładową treścią, dopóki wymagania produktu nie
stanowią inaczej.

## Panel administracyjny — Minimal V1

**Kontrakt:** `panel-minimal-v1/README.md`
**Decyzja:** ADR-049

| Plik                                                                               |    Rozmiar | SHA-256                                                            | Rola                                                                           |
| ---------------------------------------------------------------------------------- | ---------: | ------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `docs/ui/panel-minimal-v1/reference/panel-dashboard-primary-1199x842.png`          | 1199 × 842 | `824df7d47e16d9114ae66990a0d02e91f4954ce1ba7b5d1c4d180fea84aed6e1` | główna geometria, hierarchia, powierzchnie, topbar, dashboard i tabele         |
| `docs/ui/panel-minimal-v1/reference/panel-dashboard-direction-404x316.png`         |  404 × 316 | `2cd7db369c2233f08f77b497a2b2e54e5458bf840548c5ba6e791b48518e3b64` | pomocniczy kierunek typografii, zakładek i oszczędnego koloru; bez pomiaru 1:1 |
| `docs/ui/panel-minimal-v1/reference/panel-segmented-control-direction-798x144.png` |  798 × 144 | `9c085accf0f15fb8e721b99de1b7e76c4bfc0f035ff01c8b60288cd85b45bf3e` | regionalny wzorzec długiego tracku i aktywnej pigułki; bez ciemnego tła        |

Pierwszy obraz zastępuje wszystkie wcześniejsze referencje panelu w zakresie
języka wizualnego. Nie zastępuje rzeczywistej architektury informacji:
dashboard, leady, procesy, builder, analityka, integracje, ustawienia i stany
korzystają wyłącznie z istniejących danych i działania opisanych w
`UI_SCREEN_SPEC.md`.

Kontrolne viewporty: 320 × 800, 375 × 812, 390 × 844, 430 × 932, 768 × 1024,
1024 × 768, 1280 × 800, 1440 × 900 i 1536 × 1024. Główny visual diff dla
shellu/dashboardu powstaje w 1440 × 900 i 1536 × 1024. Drugi obraz nie otrzymuje
pixel diffu z powodu perspektywy i cropu. Trzeci obraz nadpisuje wyłącznie
geometrię przełączników wielowariantowych: jeden spokojny track, sąsiadujące
segmenty i jednoznaczny aktywny segment. Jego ciemne tło, poświata, treść i
kolory nie są częścią panelu; implementacja używa jasnych tokenów Minimal V1.

Wymagane artefakty każdego etapu:

```text
artifacts/visual-qa/panel-minimal-v1/<stage>/<screen>/
  reference.png lub canonical-reference.txt
  before.png
  after.png
  overlay-50.png albo difference.png
  mobile-390x844.png
  diff.md
```

## Landing desktop V7

**Kontrakt:** `landing-desktop-v7/REFERENCE_AUDIT.md` i raporty sekcyjne.

| Plik                                                          |    Rozmiar | SHA-256                                                            |
| ------------------------------------------------------------- | ---------: | ------------------------------------------------------------------ |
| `docs/ui/landing-desktop-v7/reference/01-hero.png`            | 1672 × 941 | `7113a8acc45f48e7488bb39fe1f9f4bd2933137c845e429ed4bdb7664adf41df` |
| `docs/ui/landing-desktop-v7/reference/02-process.png`         | 1672 × 941 | `e7ce0ef29bd71eb4246aa68e3efec06f0f82a47acdfc28a6f57387206962d025` |
| `docs/ui/landing-desktop-v7/reference/03-key-information.png` | 1672 × 941 | `f659ff69af90114cab05774f95dd1a8f7432c4cb4d75cddabbd4b7e3b776ff27` |
| `docs/ui/landing-desktop-v7/reference/04-integrations.png`    | 1672 × 941 | `8c89d943581eac353cd699ebf5d2a7b1388ec3b8f7bbbf42c4d70226460301ed` |
| `docs/ui/landing-desktop-v7/reference/05-pricing.png`         | 1672 × 941 | `9b0d2e08274cee4622d2dbbbbe26cf1da781f331e00431ba22355f82b709c1fc` |
| `docs/ui/landing-desktop-v7/reference/06-faq.png`             | 1672 × 941 | `ba3ecf0284c557b21363270658f4ecb2f6bd780be20cf2ed62549ae10918abc0` |
| `docs/ui/landing-desktop-v7/reference/07-final-cta.png`       | 1672 × 941 | `da0587ba1ecc2694186ad84ef9f5aaf52f5101f944f273cf5cfadf5afcc95282` |
| `docs/ui/landing-desktop-v7/reference/08-full-overview.png`   | 941 × 1672 | `8ddaca5adef25e9205910c93816fc7501668b397f14e34411bb94f3780edace6` |

Pakiet nadpisuje wcześniejsze plansze desktopowego `/`. Nie zezwala na
fikcyjne ceny, klientów, CRM-y, statystyki ani SLA.

## Landing mobile

Aktywny kontrakt transformacji znajduje się w `landing-mobile-v1/`. Mobile
zachowuje treść V7 i korzysta z wcześniejszych renderingów wyłącznie tam, gdzie
raport danego etapu wskazuje je jawnie. Pełny obraz mobile nie steruje panelem.

## Auth

| Plik                                  |     Rozmiar | SHA-256                                                            | Rola                                     |
| ------------------------------------- | ----------: | ------------------------------------------------------------------ | ---------------------------------------- |
| `apps/web/public/ekranylogowania.png` | 1536 × 1024 | `ba9927f454330835c6a7d1663cd294913ceafdf6f322aef44ea7e059eca630fd` | anatomia logowania i rejestracji desktop |

Nowsze decyzje pełnoekranowe i mobile są opisane w
`docs/ui/AUTH_REFERENCE_ANALYSIS_2026-07-27.md`. Referencja auth nie steruje
panelem.

## Marka Kwotum

| Plik                                                   |     Rozmiar | SHA-256                                                            | Rola                     |
| ------------------------------------------------------ | ----------: | ------------------------------------------------------------------ | ------------------------ |
| `docs/ui/kwotum-brand-v2/reference-logo-1254x1254.png` | 1254 × 1254 | `0d54c6c8673089fc65c52762b903765eccceb3ade5aeeb2a1a615497f9f9d5e9` | zaakceptowany znak marki |

Runtime używa wersji V3 opisanych w `kwotum-brand-v2/README.md`. Usunięta
referencja starego wyboru organizacji nie może sterować M9; ekran wejścia do
panelu korzysta z systemu Minimal V1 i realnych danych membershipu.

## Zasada retencji

Po zamknięciu etapu zachowujemy jedną kanoniczną referencję, jeden `before`,
jeden finalny `after`, jedno porównanie, reprezentatywny mobile i raport.
Odrzucone iteracje, duplikaty oraz zastąpione pakiety wizualne nie pozostają w
repozytorium. Snapshoty testów mają osobną rolę i nie stają się referencją
projektową.
