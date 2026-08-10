# R4.1 — visual diff hero `/cennik`

## Zakres

Wyłącznie hero `/cennik`. Sekcja `#model-wspolpracy`, finalne CTA, header i
footer pozostają bez redesignu.

## Referencje

- baseline runtime R1: `before/cennik-hero-1440.png` i
  `before/cennik-hero-390.png`;
- język geometrii: `docs/ui/landing-desktop-v7/reference/05-pricing.png`, bez
  kopiowania niezatwierdzonych cen, planów, trialu, limitów i płatności;
- kontrakt archetypu pilotażu:
  `docs/ui/marketing-subpages-v1/DESIGN_ARCHITECTURE.md`.

## Największe różnice i decyzje

1. Tekstowe hero 1,35/0,65 zastępuje asymetryczny układ copy + mapa 3 decyzji.
2. H1 zmienia tezę z samego statusu modelu na kolejność: proces → model
   współpracy.
3. Status self-service pozostaje widoczny, lecz ma formę raila pod akcjami.
4. Dodano dwa działające CTA: lokalna kotwica i istniejący proces Kwotum.
5. Proof nie jest tabelą planów; pokazuje proces, publikację i walidację.
6. Rezultat proofu oddziela ustalony zakres od późniejszej indywidualnej
   wyceny.
7. Desktop 1024 px zachowuje relację poziomą; stack zaczyna się dopiero poniżej
   896 px.
8. Mobile używa jednej osi, pełnych CTA i zwartych rekordów zamiast skalowania
   desktopu.
9. Wszystkie wartości demonstracyjne, kwoty i KPI są nieobecne.
10. Pierwszy pass miał realny overflow 69–308 px przez dekoracyjny okrąg oraz
    nierówne CTA przy 1024 px. Dekorację usunięto, a CTA rozciągnięto wspólnie.

## Wynik

- visual score: 19/20;
- 1536/1440/1280/1024/768/430/390/375/320 px: zero overflow;
- najmniejszy tekst: 12 px;
- CTA: 52 px na desktop/tablet, 56 px na mobile, równa szerokość i wysokość;
- 390 px: hero 609,1 → 1588,2 px; wzrost wynika z pełnej mapy kwalifikacji;
- 1440 px: hero 570,1 → 847,7 px;
- HTTP 200, brak console/pageerror;
- keyboard, długie copy, reduced motion, forced colors i axe: PASS.
