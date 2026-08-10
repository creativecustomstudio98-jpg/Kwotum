# Retencja artefaktów Visual QA — Etap 12ZD

**Data:** 2026-07-29  
**Status:** PASS 2 COMPLETE  
**Zakres:** dokładne duplikaty, odtwarzalny legacy output i zastąpione
iteracje zamkniętych etapów

## Zasada

Repozytorium zachowuje kanoniczne referencje, zaakceptowany finalny render,
porównanie oraz raport. Nie zachowuje wielu binarnie identycznych kopii ani
odtwarzalnego outputu starego systemu. Samodzielne pakiety źródłowe mogą
utrzymywać celowe kopie, jeżeli są wymagane przez ich względne linki.

## Pass 1 — usunięte dokładne duplikaty

Każda pozycja poniżej miała identyczny SHA-256 jak wskazany następca.

### Referencja buildera

Zachowany plik:
`apps/web/public/panel/ChatGPT Image 26 lip 2026, 18_28_24.png`, SHA-256
`918e0d8edfdb02d899310e61b36bcf25618bd1a761bf62809fb9927d4a68a526`.

Usunięte kopie:

- `artifacts/visual-qa/12w-builder-geometry/desktop/reference.png`;
- `artifacts/visual-qa/12x-builder-interactions/desktop/reference.png`;
- `artifacts/visual-qa/12y-builder-toggle/reference/builder-reference-1448x1086.png`;
- `artifacts/visual-qa/12z-builder-sections/reference/builder-reference-1448x1086.png`;
- `artifacts/visual-qa/12za-builder-options/reference/process-builder-1448x1086.png`.

### Landing board 2

- usunięto `artifacts/visual-qa/12f-board-2/desktop/reference.png`; zachowano
  `docs/ui/lorum-landing-reference-v2/screenshots/lorum-board-2-desktop.png`;
- usunięto `artifacts/visual-qa/12f-board-2/mobile/reference.png`; zachowano
  `docs/ui/lorum-landing-reference-v2/screenshots/lorum-board-2-mobile.png`.

### Przegląd sekcji pod hero

- usunięto
  `artifacts/visual-qa/12i-reference-overview/desktop/reference.png`;
- zachowano
  `docs/ui/references/accepted/home-post-hero-overview-1098x624.png`.

### Analityka

- usunięto
  `artifacts/visual-qa/12r-analytics-dashboard-style/before-normalized.png`;
  zachowano binarnie identyczny `before-1536x1024.png`;
- usunięto
  `artifacts/visual-qa/12r-analytics-dashboard-style/after-v2-normalized.png`;
  zachowano binarnie identyczny `after-v2-1536x1024.png`.

### Czysty build buildera

- usunięto
  `artifacts/visual-qa/12w-builder-geometry/desktop/after-clean-build-expanded-1448x1086.png`;
  zachowano binarnie identyczny
  `after-v2-production-expanded-1448x1086.png`;
- usunięto
  `artifacts/visual-qa/12w-builder-geometry/desktop/after-clean-build-collapsed-1448x1086.png`;
  zachowano binarnie identyczny
  `after-v2-production-collapsed-1448x1086.png`.

### Mobilna nawigacja

- usunięto `artifacts/visual-qa/12w-mobile-navigation/reference.png`;
- zachowano
  `docs/ui/lorum-product-ui-reference-v1/reference/screenshots/dashboard-mobile.png`.

### Pozostałe ekrany

Usunięto osiem kopii z
`artifacts/visual-qa/12s-remaining-screens/reference/`:

- `installation-desktop.png`;
- `integrations-desktop.png`;
- `settings-desktop.png`;
- `widget-mobile.png`;
- `onboarding-desktop.png`;
- `widget-desktop.png`;
- `onboarding-mobile.png`;
- `widget-result-desktop.png`.

Kanoniczne, binarnie identyczne pliki pozostają w
`docs/ui/lorum-product-ui-reference-v1/reference/screenshots/`.

## Wynik passu 1

- usunięte dokładne kopie: 21;
- odzyskany rozmiar: 7 641 211 B / 7,29 MiB;
- usunięte źródła kanoniczne: 0;
- usunięte snapshoty Playwright: 0;
- usunięte aktywa runtime: 0;
- usunięte raporty Markdown: 0.

## Celowo zachowane duplikaty

- cztery top-level referencje w `references/` oraz odpowiadające im pliki
  samodzielnych pakietów źródłowych;
- screenshoty Playwright i odpowiadające im końcowe dowody QA, ponieważ pełnią
  różne role;
- pliki źródłowe wymagane przez względne linki pakietów w `docs/ui/`;
- identyczne małe konfiguracje różnych pakietów.

## Pass 2 — zamknięte iteracje

Po sprawdzeniu raportów etapów i incoming links przeniesiono do Kosza 77
obrazów iteracyjnych o rozmiarze 27 683 156 B:

- 28 odrzuconych passów `after-v*` i `overlay-v*` Etapu 12F;
- 4 rendery v1/v2 zastąpione finalnymi dowodami Etapu 12I;
- pojedynczy debug 12J i 2 rootowe rendery `dev` 12O;
- po 4 obrazy v1 desktop/mobile landingu 3D;
- 6 plików v1 sidebara 12M;
- 7 plików v1 i korekt developerskich listy procesów 12N;
- 2 obrazy v1 biblioteki szablonów 12P;
- 8 obrazów v1 analityki 12R;
- 4 rendery pośrednie dashboardu 12T;
- 8 zastąpionych renderów v1/v2 geometrii buildera 12W;
- 3 obrazy v1 nawigacji mobilnej 12W.

Następnie usunięto 3 nowo wykryte, dokładne kopie bez incoming links o
rozmiarze 241 877 B. Ich kanoniczne odpowiedniki pozostają w dedykowanych
etapach 12O, 12R i 12S.

Łączny wynik passu 2:

- przeniesione obrazy: 80;
- odzyskany rozmiar logiczny: 27 925 033 B / 26,63 MiB;
- usunięte raporty, referencje, snapshoty Playwright lub aktywa runtime: 0;
- lokalizacja odzyskiwalna:
  `/Users/nexora/.Trash/Wyceno-visual-qa-pass2-2026-07-29`.

Osiem pozostałych grup dokładnych kopii jest celowe i rozdziela różne role:
pakiet źródłowy od kanonicznego entry pointu, snapshot Playwright od dowodu QA
albo finalny obraz jednego etapu od stanu `before` kolejnego.
