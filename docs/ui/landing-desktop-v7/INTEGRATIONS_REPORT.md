# Landing desktop V7 — raport odbioru sekcji integracji

**Status:** PASS lokalny; sekcja zamknięta przed pricingiem
**Data:** 2026-08-02
**Viewport:** 1672 × 941 px
**Referencja:** `reference/04-integrations.png`, SHA-256
`8c89d943581eac353cd699ebf5d2a7b1388ec3b8f7bbbf42c4d70226460301ed`

## Zakres i źródło prawdy

Mikroetap przebudowuje wyłącznie aktywną sekcję
`data-home-section="industry-and-publishing"`. Zastępuje wcześniejszą, wysoką
sekcję listy branż i publikacji układem z V7-04: nagłówkiem, czterema kartami
kanałów, centralnym rekordem leada, łamanymi połączeniami i dolnym railem trzech
właściwości.

Kompozycja pochodzi z natywnej referencji 1672 × 941 px. Tekst nie rozszerza
scope produktu: role niepotwierdzonych na obrazie CRM i Google Sheets zajmują
istniejące kanały WordPress oraz hosted link.

## Implementacja i uczciwość produktu

- cały region jest code-native HTML/CSS/SVG; nie używa screenshotu jako UI;
- pokazane kanały to e-mail, webhook po skonfigurowaniu endpointu, WordPress i
  hosted link;
- centralna karta używa wyłącznie jawnych danych demonstracyjnych projektu;
- nie dodano fikcyjnego telefonu, adresu e-mail, klienta, CRM, Sheets, SLA ani
  deklaracji dostawy w czasie rzeczywistym;
- copy webhooka nie obiecuje automatyzacji przed konfiguracją;
- rail bezpieczeństwa mówi o serwerowej kontroli dostępu, bez niepotwierdzonych
  claimów marketingowych;
- sekcja nie wprowadza atrap przycisków ani nie zmienia API, bazy, scoringu,
  RLS lub tenant scope.

## Potwierdzona geometria 1672 × 941 px

| Region          | Referencja V7-04 | Implementacja finalna |
| --------------- | ---------------: | --------------------: |
| sekcja          |     `1672 × 941` |          `1672 × 941` |
| kicker          |     około `y 58` |              `y 58.4` |
| H2              |    około `y 139` |             `y 139.2` |
| opis            |    około `y 229` |             `y 228.6` |
| stage           |   `x 139, y 333` |      `x 139, y 333.6` |
| stage           |     `1394 × 389` |          `1394 × 390` |
| centralna karta |     `x 656–1015` |          `x 656–1015` |
| dolny rail      |   `x 139, y 765` |      `x 139, y 765.6` |
| dolny rail      |     `1394 × 116` |          `1394 × 116` |

Sekcja nie powoduje poziomego overflow. Przy 1440 px zachowuje pięciopolową
kompozycję; przy 1024/768 px przechodzi w dwie kolumny z centralną kartą na
całą szerokość, a przy 390/320 px w jedną kolumnę.

## Dwa passy i główne korekty

1. Stara sekcja miała około 1199 px wysokości przy 1672 px → finalnie 941 px.
2. Lista pięciu branż została zastąpiona czterema realnymi kanałami wokół leada.
3. Wprowadzono osie kart `x 139 / 656 / 1118` zgodne z V7-04.
4. Stage pierwszego passu zaczynał się przy `y 337` → finalnie `y 333.6`.
5. H2 pierwszego passu zaczynał się przy `y 133.6` → finalnie `y 139.2`.
6. Rail pierwszego passu zaczynał się przy `y 771` → finalnie `y 765.6`.
7. Proste linie pierwszego passu zastąpiono łamanymi, przerywanymi ścieżkami.
8. Kicker poszerzono z około 319 do 337 px, zgodnie z referencją.
9. W drugim gate etykieta „Nowy lead” ujawniła 11,2 px → podniesiono ją do
   kontraktowego minimum 12 px bez wyłączania testu.
10. CRM i Sheets z obrazu nie zostały skopiowane; ich rolę kompozycyjną pełnią
    istniejące WordPress i hosted link.

## Artefakty i visual QA

- `artifacts/visual-qa/landing-desktop-v7/integrations/before-1672x941.png`;
- `artifacts/visual-qa/landing-desktop-v7/integrations/pass-1-1672x941.png`;
- `artifacts/visual-qa/landing-desktop-v7/integrations/after-1672x941.png`;
- `artifacts/visual-qa/landing-desktop-v7/integrations/overlay-1672x941.png`;
- `artifacts/visual-qa/landing-desktop-v7/integrations/diff-1672x941.png`;
- `artifacts/visual-qa/landing-desktop-v7/integrations/diff.md`.

Finalny znormalizowany RMSE: **0,149777**. Różnica obejmuje przede wszystkim
celowo zmienione nazwy i treści kanałów oraz code-native ikony. Osie sekcji i
pięciu powierzchni pokrywają referencję z odchyleniem około 0–1 px.

Ocena visual QA: **19/20** — kompletność 4, geometria 4, typografia 4,
gęstość 4, transformacja mobile 3. Mobile przechodzi reflow i smoke, lecz nie
ma osobnej zaakceptowanej referencji tego regionu.

## Gate

- `pnpm format:check` — PASS;
- `pnpm lint` — 8/8 PASS;
- `pnpm typecheck` — 8/8 PASS;
- `pnpm test:unit` — 15/15 zadań PASS; web 85/85;
- `pnpm build` — 8/8 PASS, 39 tras, widget 17 269 B gzip;
- `pnpm exec playwright test tests/e2e/marketing.spec.ts` — 21/21 PASS;
- axe, klawiatura, no-JS, reduced motion, forced colors, breakpointy i brak
  poziomego overflow — PASS;
- kontrola podglądu produkcyjnego — pięć kart i brak błędów/warningów konsoli.

## Ryzyka i kryteria odbioru

- Webhook jest opisany warunkowo: wymaga skonfigurowania endpointu; sekcja nie
  deklaruje gotowego połączenia z konkretnym zewnętrznym systemem.
- „Hosted link” zachowuje angielską nazwę kanału obecną w kontrakcie produktu;
  opis pozostaje po polsku.
- Linie połączeń są dekoracyjne i ukryte semantycznie; przepływ jest czytelny
  z tytułów i kolejności kart także w forced colors i reflow.
- `artifacts/promo/` pozostał nietknięty.

Następna dozwolona sekcja to wyłącznie pricing według
`reference/05-pricing.png`, po zastąpieniu niezatwierdzonych kwot uczciwym
modelem pilotażowym. Cleanup legacy pozostaje odłożony do osobnego gate'u.

```text
STOP — INTEGRACJE ZAKOŃCZONE. PRICINGU NIE ROZPOCZĘTO.
```
