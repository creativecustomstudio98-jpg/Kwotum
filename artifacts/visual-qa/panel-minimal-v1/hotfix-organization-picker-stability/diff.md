# Hotfix stabilności wyboru organizacji

**Data:** 2026-08-28
**Zakres:** wyłącznie uwierzytelniona trasa `/panel`
**Charakter:** naprawa regresji; bez rozpoczęcia M9 i bez zmiany danych, Auth,
RLS, tenant scope, routingu ani server actions

## Źródło i diagnoza

Zgłoszenie zostało potwierdzone na dwóch zrzutach właściciela: gotowy ekran
3338 × 1982 px oraz widoczny w przeglądarce stan ładowania 3840 × 2486 px.
Obrazów nie skopiowano do repozytorium, ponieważ zawierały kontekst prywatnego
pulpitu. Visual QA korzysta wyłącznie z lokalnego, syntetycznego tenanta.

Regresja miała cztery przyczyny:

1. gotowy ekran używał starej struktury `organization-picker__content`, a
   loading i error nieostylowanej struktury `__shell` / `__workspace`;
2. finalny link logo nie miał klasy `organization-picker__brand`, przez co
   przejmował globalne podkreślenie linku i nie miał kontraktu flex;
3. finalny ekran nie korzystał z `.wy-panel-theme`, choć loading i error tak;
4. test E2E po częściowym merge'u odwoływał się do nieistniejących pomiarów i
   akcji z wcześniejszej wersji ekranu, więc nie chronił runtime'u.

## Wykonana korekta

- wspólny `OrganizationPickerFrame` renderuje identyczny header, logo, intro i
  kontener we wszystkich stanach;
- loading rezerwuje tę samą kartę 464 × 432 px, avatar i akcję co stan ready;
- logo ma identyczną geometrię 102,33 × 32 px i `text-decoration: none`;
- error oraz pusty stan pozostają w tej samej osi i korzystają z prawdziwej
  akcji ponowienia lub istniejącego komunikatu;
- skeleton respektuje `prefers-reduced-motion`, a ready/mobile zachowują
  klawiaturę, axe i maksymalnie 1 px tolerancji overflow;
- nie zmieniono zapytań, ról, danych ani decyzji o późniejszym M9.

## Pomiary 2048 × 1216

| Region |                       Loading |                         Ready | Maksymalna różnica |
| ------ | ----------------------------: | ----------------------------: | -----------------: |
| logo   |    102,33 × 32 px; x 48; y 24 |    102,33 × 32 px; x 48; y 24 |               0 px |
| intro  | 1120 × 95,98 px; x 464; y 160 | 1120 × 95,98 px; x 464; y 160 |               0 px |
| karta  | 464 × 432 px; x 792; y 327,98 | 464 × 432 px; x 792; y 327,98 |               0 px |
| akcja  |  390 × 53,59 px; x 829; y 671 |  390 × 53,59 px; x 829; y 671 |               0 px |

Zmierzony CLS wynosi **0**. Surowe dane są w `measurements.json`.

## Artefakty

- `loading-desktop-2048x1216.png` — rzeczywisty streaming loading;
- `after-desktop-2048x1216.png` — gotowy stan na tym samym buildzie i tenancie;
- `loading-ready-overlay.png` — overlay 50/50 potwierdzający wspólne osie;
- `loading-ready-difference.png` — różnica zawartości bez różnicy geometrii;
- `after-mobile-390x844.png` — reprezentatywna transformacja mobile;
- `measurements.json` — bounding boxes, delty i CLS.

## Gate

- pełne unit: 418/418, w tym web 225/225;
- PostgreSQL/RLS: PASS;
- WordPress: PASS dla 6.9.2 i 7.0.2 na PHP 8.5.2;
- target E2E na immutable buildzie: 1/1;
- build: 16/16;
- axe: 0 naruszeń;
- responsive: 320/375/390/430/768/1024/1280/1440/1536 px, overflow ≤ 1 px;
- keyboard: link organizacji przyjmuje fokus;
- fixture Auth/DB/Storage: cleanup `0|0|0`;
- dalszy etap panelu pozostaje zgodny z sekwencją backlogu; hotfix nie otwiera M9.
